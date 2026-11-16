/* LME Connect (Figma: App / LME Connect). */
import { db } from '../store.js';
import { html, raw, $, avatar, badge, tag, toast, guard, fmtDate, empty, confirmDlg } from '../ui.js';
import { suggestMatches, CONNECTION_TYPES } from '../logic.js';
import { ph, load, byId } from './_common.js';

export const title = 'LME Connect';
let tab = 'procurando', draft = { type: 'Founder + Founder', text: '', until: '' };

const STATUS = { curadoria: ['Em curadoria', 'duna'], conectado: ['Conectado', 'lagoa'], encerrado: ['Encerrado', ''] };

export async function render({ me }) {
  const d = await load('profiles', 'connection_requests', 'connections');
  const people = byId(d.profiles);
  const mine = d.connection_requests.filter(r => r.from_id === me.id).sort((a, b) => b.created_at.localeCompare(a.created_at));
  const text = draft.text || (mine.find(r => r.status === 'curadoria') || {}).text || me.seeking || '';
  const sug = text ? suggestMatches({ text, type: draft.type }, me, d.profiles, d.connections, 4) : [];
  const myConns = d.connections.filter(c => c.a_id === me.id || c.b_id === me.id).map(c => ({ c, p: people.get(c.a_id === me.id ? c.b_id : c.a_id) })).filter(x => x.p);
  const form = tab === 'procurando'
    ? html`<form id="ask" class="form-grid" novalidate>
        <div class="field"><span class="label">Tipo de conexão</span><div class="chips-row" role="group" aria-label="Tipo de conexão">${CONNECTION_TYPES.map(t => html`<button type="button" class="tag" data-type="${t}" aria-pressed="${draft.type === t}">${t}</button>`)}</div></div>
        <div class="field"><label for="text">Conte em uma frase</label><textarea id="text" name="text" required placeholder="Ex.: um sócio técnico para validar um app de agendamento">${draft.text}</textarea></div>
        <div class="field"><label for="until">Até quando? <span class="opt">(opcional)</span></label><input id="until" name="until" type="date" value="${draft.until}"></div>
        <div class="row"><button class="btn secondary" type="button" id="preview">Ver quem pode ajudar</button><button class="btn primary" type="submit">Enviar pedido à Liga</button></div>
      </form>`
    : html`<form id="offer" class="form-grid" novalidate>
        <p class="muted small">É isso que aparece para quem procura ajuda. Seja específico.</p>
        <div class="field"><label for="offering">Posso ajudar com…</label><textarea id="offering" name="offering" required>${me.offering || ''}</textarea></div>
        <div class="field"><label for="skills">Competências</label><input id="skills" name="skills" value="${(me.skills || []).join(', ')}"><p class="help">Separe por vírgulas.</p></div>
        <button class="btn primary" type="submit">Salvar o que ofereço</button>
      </form>`;
  return html`${ph('LME Connect', 'Diga o que você procura e no que pode ajudar. A Liga faz a ponte.')}
<div class="cols l420">
  <section class="panel" style="padding:28px"><h2 class="h3">Seu pedido</h2>
    <div class="seg" role="group" aria-label="Modo"><button type="button" data-tab="procurando" aria-pressed="${tab === 'procurando'}">Estou procurando</button><button type="button" data-tab="ajudar" aria-pressed="${tab === 'ajudar'}">Posso ajudar</button></div>
    ${form}
  </section>
  <div class="grid" style="gap:16px">
    <div class="panel-head"><h2 class="h3">Pessoas que podem ajudar</h2><span class="small muted">${text ? `Para: “${text}”` : ''}</span></div>
    ${sug.length ? sug.map(s => html`<article class="panel"><div class="person">${avatar(s.profile.name)}<div class="who"><span class="row" style="gap:8px"><b>${s.profile.name}</b>${(s.profile.perfis || []).slice(0, 1).map(p => badge(p))}</span><span class="small muted">${s.profile.org || s.profile.city} · ${s.profile.area || ''}</span></div><button class="btn primary small" data-intro="${s.profile.id}">Pedir apresentação</button></div>
      <p class="reason">Por que esta conexão: ${s.reason}</p><div class="chips-row">${(s.profile.skills || []).map(tag)}</div></article>`)
      : empty('Ninguém na comunidade oferece isso ainda', 'Envie o pedido mesmo assim: a equipe Comunidade também busca parceiros, mentores e universidades fora do app.')}
    <section class="panel"><h2 class="h4">Seus pedidos</h2>
      ${mine.length ? html`<div class="list">${mine.map(r => html`<div class="panel-head"><span><b style="font-weight:400">${r.text}</b><span class="small muted" style="display:block">${r.type} · ${fmtDate(r.created_at)}${r.status === 'conectado' && r.suggested_ids && r.suggested_ids.length ? ' · com ' + r.suggested_ids.map(id => (people.get(id) || {}).name).filter(Boolean).join(', ') : ''}</span></span><span class="row" style="gap:8px">${badge(STATUS[r.status][0], STATUS[r.status][1])}${r.status === 'curadoria' ? html`<button class="link" data-close="${r.id}">Encerrar</button>` : ''}</span></div>`)}</div>` : html`<p class="muted small">Você ainda não fez pedidos.</p>`}
    </section>
    <section class="panel"><h2 class="h4">Suas conexões</h2>
      ${myConns.length ? html`<div class="list">${myConns.map(({ c, p }) => html`<div class="person">${avatar(p.name)}<div class="who"><b>${p.name}</b><span class="small muted">${c.note || ''} · desde ${fmtDate(c.created_at)}</span></div><a class="btn secondary small" href="#/membros/${p.id}">Ver perfil</a></div>`)}</div>` : html`<p class="muted small">Quando a Liga apresentar alguém a você, a conexão aparece aqui.</p>`}
    </section>
  </div>
</div>`;
}

export function mount(root, ctx) {
  const me = ctx.me;
  root.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => { tab = b.dataset.tab; ctx.refresh(); }));
  root.querySelectorAll('[data-type]').forEach(b => b.addEventListener('click', () => { const f = $('#ask', root); if (f) { draft.text = f.text.value; draft.until = f.until.value; } draft.type = b.dataset.type; ctx.refresh(); }));
  const ask = $('#ask', root);
  if (ask) {
    $('#preview', root).addEventListener('click', () => { draft.text = ask.text.value.trim(); draft.until = ask.until.value; ctx.refresh(); });
    ask.addEventListener('submit', e => { e.preventDefault(); if (!ask.text.value.trim()) { ask.reportValidity(); return; }
      guard(async () => {
        await db.insert('connection_requests', { from_id: me.id, type: draft.type, text: ask.text.value.trim(), until: ask.until.value || '', status: 'curadoria', suggested_ids: [] });
        toast('Pedido enviado. A equipe Comunidade faz a curadoria e avisa você.'); draft = { type: draft.type, text: ask.text.value.trim(), until: '' }; ctx.refresh();
      });
    });
  }
  const offer = $('#offer', root);
  if (offer) offer.addEventListener('submit', e => { e.preventDefault(); if (!offer.offering.value.trim()) { offer.reportValidity(); return; }
    guard(async () => { await db.update('profiles', me.id, { offering: offer.offering.value.trim(), skills: offer.skills.value.split(',').map(s => s.trim()).filter(Boolean) }); toast('Pronto. Isso já aparece para quem procura ajuda.'); ctx.refresh(); });
  });
  root.querySelectorAll('[data-intro]').forEach(b => b.addEventListener('click', () => guard(async () => {
    const t = (ask && ask.text.value.trim()) || draft.text || me.seeking;
    await db.insert('connection_requests', { from_id: me.id, type: draft.type, text: t, until: '', status: 'curadoria', suggested_ids: [b.dataset.intro] });
    toast('Pedido de apresentação enviado à curadoria.'); ctx.refresh();
  })));
  root.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', async () => {
    if (await confirmDlg('Encerrar pedido?', 'A curadoria deixa de procurar conexões para esse pedido.', 'Encerrar')) guard(async () => { await db.update('connection_requests', b.dataset.close, { status: 'encerrado' }); toast('Pedido encerrado.'); ctx.refresh(); });
  }));
}

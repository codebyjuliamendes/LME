/* Perfil de outro membro (Figma: App / Perfil do membro). */
import { db } from '../store.js';
import { html, avatar, badge, tag, toast, guard, fmtDate, empty } from '../ui.js';
import { ph, load, byId } from './_common.js';

export const title = 'Perfil';

export async function render({ me, params }) {
  const d = await load('profiles', 'connections', 'connection_requests', 'circles', 'circle_members', 'rsvps', 'replies');
  const p = d.profiles.find(x => x.id === params[0]);
  if (!p) return empty('Perfil não encontrado', 'Essa pessoa pode ter saído da comunidade.', html`<a class="btn secondary" href="#/membros">Voltar para membros</a>`);
  if (p.id === me.id) { location.hash = '#/perfil'; return ''; }
  const connected = d.connections.some(c => (c.a_id === me.id && c.b_id === p.id) || (c.b_id === me.id && c.a_id === p.id));
  const pending = d.connection_requests.some(r => r.from_id === me.id && r.status === 'curadoria' && (r.suggested_ids || []).includes(p.id));
  const cm = d.circle_members.find(m => m.user_id === p.id);
  const circle = cm && d.circles.find(c => c.id === cm.circle_id);
  const myCircle = d.circle_members.find(m => m.user_id === me.id);
  const helps = d.replies.filter(r => r.author_id === p.id && r.kind === 'ajuda').length;
  const common = [];
  (p.perfis || []).filter(x => (me.perfis || []).includes(x)).forEach(x => common.push(`Vocês dois são ${x.toLowerCase()}`));
  if (p.city && p.city === me.city) common.push(`Os dois são de ${p.city}`);
  if (circle && myCircle && myCircle.circle_id === circle.id) common.push(`Estão no mesmo Círculo: ${circle.name}`);
  const action = connected ? badge('Vocês estão conectados', 'lagoa') : pending ? badge('Pedido de apresentação em curadoria', 'duna') : html`<button class="btn primary" id="intro">Pedir apresentação</button>`;
  return html`<a class="crumb" href="#/membros">← Membros</a>
${ph(p.name, [(p.perfis || []).join(' · '), p.org, p.city].filter(Boolean).join(' · '), action)}
<div class="cols">
  <div class="grid" style="gap:20px">
    <section class="panel"><div class="chips-row">${(p.perfis || []).map(x => badge(x))}${p.ambassador ? badge('Embaixador ' + p.ambassador, 'duna') : ''}${p.mentor ? badge('Mentor', 'lagoa') : ''}</div>
      <p><b>${p.area || ''}</b>${p.org ? ` · ${p.org}` : ''}</p></section>
    <div class="grid g2">
      <section class="panel"><p class="eyebrow">Posso ajudar com</p><p>${p.offering || '—'}</p></section>
      <section class="panel"><p class="eyebrow" style="color:var(--azulejo)">Estou procurando</p><p>${p.seeking || '—'}</p></section>
    </div>
    <section class="panel"><h2 class="h3">Projetos</h2>
      ${p.business || p.innovation ? html`<div class="list">${p.business ? html`<div><b>${p.business}</b><div>${badge('Negócio ou projeto próprio', 'lagoa')}</div></div>` : ''}${p.innovation ? html`<div><b>${p.innovation}</b><div>${badge('Intraempreendedorismo')}</div></div>` : ''}</div>` : html`<p class="muted small">Nenhum projeto informado.</p>`}
    </section>
  </div>
  <div class="grid" style="gap:20px">
    <section class="panel"><h2 class="h4">Na LME</h2>
      <div class="panel-head"><span class="small muted">Membro desde</span><b>${fmtDate(p.created_at)}</b></div>
      <div class="panel-head"><span class="small muted">Círculo</span><b>${circle ? circle.name : '—'}</b></div>
      <div class="panel-head"><span class="small muted">Encontros</span><b>${d.rsvps.filter(r => r.user_id === p.id).length}</b></div>
      <div class="panel-head"><span class="small muted">Ajudas na comunidade</span><b>${helps}</b></div>
    </section>
    <section class="panel"><h2 class="h4">Competências</h2><div class="chips-row">${(p.skills || []).map(tag)}</div></section>
    ${common.length ? html`<section class="panel soft-lagoa"><p class="eyebrow">Em comum com você</p>${common.map(c => html`<p>${c}.</p>`)}</section>` : ''}
  </div>
</div>`;
}

export function mount(root, ctx) {
  const b = root.querySelector('#intro');
  if (b) b.addEventListener('click', () => guard(async () => {
    const p = await db.get('profiles', ctx.params[0]);
    await db.insert('connection_requests', { from_id: ctx.me.id, type: 'Founder + Founder', text: `Conhecer ${p.name}: ${p.offering || ''}`.trim(), until: '', status: 'curadoria', suggested_ids: [p.id] });
    toast('Pedido enviado. A equipe Comunidade faz a apresentação.'); ctx.refresh();
  }));
}

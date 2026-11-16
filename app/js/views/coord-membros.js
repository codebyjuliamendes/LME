/* Coordenação / Membros e curadoria (Figma: Coordenação / Membros e fila de conexões). */
import { db } from '../store.js';
import { html, raw, avatar, badge, toast, guard, fmtDate, ago, empty, confirmDlg } from '../ui.js';
import { PERFIS, suggestMatches, toCsv } from '../logic.js';
import { ph, load, byId, download } from './_common.js';

export const title = 'Membros e curadoria';
let tab = 'fila', q = '', perfil = '';

export async function render({ me }) {
  const d = await load('profiles', 'connection_requests', 'connections');
  const people = byId(d.profiles);
  const members = d.profiles.filter(p => p.onboarded);
  const pending = d.connection_requests.filter(r => r.status === 'curadoria').sort((a, b) => a.created_at.localeCompare(b.created_at));
  const head = html`${ph('Membros e curadoria', 'Quem está na Liga e os pedidos de conexão esperando apresentação.', html`<button class="btn secondary" id="export">Exportar membros (CSV)</button>`)}
<div class="chips-row" role="group" aria-label="Seção"><button class="tag" data-tab="fila" aria-pressed="${tab === 'fila'}">Fila de conexões (${pending.length})</button><button class="tag" data-tab="membros" aria-pressed="${tab === 'membros'}">Membros (${members.length})</button></div>`;
  if (tab === 'fila') {
    return html`${head}${pending.length ? html`<div class="grid" style="gap:16px">${pending.map(r => {
      const from = people.get(r.from_id); if (!from) return '';
      const pre = (r.suggested_ids || []).map(id => people.get(id)).filter(Boolean).map(p => ({ profile: p, reason: 'Escolhido por quem pediu' }));
      const sug = [...pre, ...suggestMatches(r, from, d.profiles, d.connections, 4).filter(s => !pre.some(x => x.profile.id === s.profile.id))].slice(0, 4);
      return html`<article class="panel" style="gap:12px" data-req="${r.id}">
  <div class="panel-head"><div class="person">${avatar(from.name)}<span class="who"><b>${from.name}</b><span class="small muted">${r.type} · ${ago(r.created_at)}${r.until ? ` · até ${fmtDate(r.until + 'T12:00:00')}` : ''}</span></span></div>${badge('Em curadoria', 'duna')}</div>
  <p class="h4">“${r.text}”</p>
  ${sug.length ? html`<fieldset style="border:0;padding:0;margin:0;display:grid;gap:8px"><legend class="eyebrow">Sugestões</legend>${sug.map((s, i) => html`<label class="person" style="cursor:pointer"><input type="checkbox" name="pick" value="${s.profile.id}" ${i === 0 ? raw('checked') : ''}>${avatar(s.profile.name)}<span class="who"><b>${s.profile.name}</b><span class="reason small">${s.reason}</span></span></label>`)}</fieldset>` : html`<p class="small muted">Nenhuma sugestão automática. Procure alguém em Membros ou peça mais detalhes.</p>`}
  <div class="row">${sug.length ? html`<button class="btn primary small" data-intro="${r.id}">Apresentar</button>` : ''}<button class="btn secondary small" data-close="${r.id}">Encerrar pedido</button></div>
</article>`; })}</div>` : empty('Fila vazia', 'Todos os pedidos de conexão foram atendidos.')}`;
  }
  const qq = q.toLowerCase();
  const list = members.filter(p => (!perfil || (p.perfis || []).includes(perfil)) && (!qq || [p.name, p.city, p.org, p.email].join(' ').toLowerCase().includes(qq)));
  return html`${head}
<div class="row" style="gap:12px"><div class="field" style="flex:1;min-width:200px"><label for="q" class="sr-only">Buscar</label><input id="q" type="search" placeholder="Buscar por nome, cidade, organização ou e-mail" value="${q}"></div>
<div class="field"><label for="pf" class="sr-only">Perfil</label><select id="pf"><option value="">Todos os perfis</option>${PERFIS.map(p => html`<option ${perfil === p ? raw('selected') : ''}>${p}</option>`)}</select></div></div>
<div class="table-wrap"><table><thead><tr><th>Nome</th><th>Perfil</th><th>Cidade</th><th>Organização</th><th>Desde</th><th>Papel</th></tr></thead><tbody>
${list.map(p => html`<tr><td><a href="#/membros/${p.id}"><b>${p.name}</b></a><div class="small muted">${p.email || ''}</div></td><td>${(p.perfis || []).join(', ')}</td><td>${p.city || ''}</td><td>${p.org || ''}</td><td>${fmtDate(p.created_at)}</td>
<td>${p.id === me.id ? badge(p.role === 'coordination' ? 'Coordenação' : 'Membro') : html`<label class="sr-only" for="r-${p.id}">Papel de ${p.name}</label><select id="r-${p.id}" data-role="${p.id}" style="width:auto"><option value="member" ${p.role !== 'coordination' ? raw('selected') : ''}>Membro</option><option value="coordination" ${p.role === 'coordination' ? raw('selected') : ''}>Coordenação</option></select>`}</td></tr>`)}
</tbody></table></div>
${list.length ? '' : empty('Ninguém encontrado', 'Tente outra busca.')}`;
}

export function mount(root, ctx) {
  root.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => { tab = b.dataset.tab; ctx.refresh(); }));
  root.querySelector('#export').addEventListener('click', () => guard(async () => {
    const ps = (await db.list('profiles')).filter(p => p.onboarded);
    download(`lme-membros-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(ps, [['name', 'Nome'], ['email', 'E-mail'], ['whatsapp', 'WhatsApp'], ['city', 'Cidade'], ['org', 'Organização'], ['area', 'Área'], ['perfis', 'Perfis'], ['interest', 'Interesse'], ['business', 'Negócio'], ['innovation', 'Inovação'], ['seeking', 'Procura'], ['offering', 'Oferece'], ['created_at', 'Cadastro']]));
  }));
  const qi = root.querySelector('#q');
  if (qi) { let t; qi.addEventListener('input', () => { clearTimeout(t); t = setTimeout(async () => { q = qi.value; await ctx.refresh(); const n = document.querySelector('#q'); if (n) { n.focus(); n.setSelectionRange(q.length, q.length); } }, 250); }); }
  const pf = root.querySelector('#pf');
  if (pf) pf.addEventListener('change', () => { perfil = pf.value; ctx.refresh(); });
  root.querySelectorAll('[data-role]').forEach(s => s.addEventListener('change', () => guard(async () => { await db.update('profiles', s.dataset.role, { role: s.value }); toast('Papel atualizado.'); })));
  root.querySelectorAll('[data-intro]').forEach(b => b.addEventListener('click', () => {
    const card = b.closest('[data-req]');
    const ids = [...card.querySelectorAll('input[name=pick]:checked')].map(i => i.value);
    if (!ids.length) { toast('Escolha pelo menos uma pessoa.', 'bad'); return; }
    guard(async () => {
      const r = await db.get('connection_requests', b.dataset.intro);
      for (const id of ids) await db.insert('connections', { a_id: r.from_id, b_id: id, request_id: r.id, note: r.text });
      await db.update('connection_requests', r.id, { status: 'conectado', suggested_ids: ids });
      toast(ids.length === 1 ? 'Apresentação feita.' : `${ids.length} apresentações feitas.`); ctx.refresh();
    });
  }));
  root.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', async () => {
    if (await confirmDlg('Encerrar pedido?', 'Ele sai da fila sem apresentação.', 'Encerrar')) guard(async () => { await db.update('connection_requests', b.dataset.close, { status: 'encerrado' }); ctx.refresh(); });
  }));
}

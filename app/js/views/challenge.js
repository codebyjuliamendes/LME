/* Detalhe do Challenge com times (Figma: App / Challenges, times). */
import { db } from '../store.js';
import { html, avatar, badge, toast, guard, fmtDate, empty, dialog, confirmDlg } from '../ui.js';
import { load, byId } from './_common.js';

export const title = 'Challenge';
const MAX = 5;

export async function render({ me, params }) {
  const d = await load('challenges', 'teams', 'profiles');
  const c = d.challenges.find(x => x.id === params[0]);
  if (!c) return empty('Desafio não encontrado', 'Ele pode ter sido encerrado.', html`<a class="btn secondary" href="#/challenges">Voltar</a>`);
  const people = byId(d.profiles);
  const teams = d.teams.filter(t => t.challenge_id === c.id);
  const mine = teams.find(t => (t.member_ids || []).includes(me.id));
  const open = c.status === 'Inscrições abertas';
  const full = teams.length >= c.team_slots;
  return html`<a class="crumb" href="#/challenges">← Challenges</a>
<article class="panel" style="padding:32px;gap:16px">
  <div class="chips-row">${badge(c.status, open ? 'lagoa' : '')}${badge(c.org, 'duna')}</div>
  <h1 class="display-l">${c.title}</h1>
  <p class="lead" style="color:var(--ink)">${c.description}</p>
  <div class="grid g3"><div><p class="eyebrow" style="color:var(--muted)">Formato</p><p>${c.format}</p></div><div><p class="eyebrow" style="color:var(--muted)">Inscrições até</p><p>${fmtDate(c.closes + 'T12:00:00')}</p></div><div><p class="eyebrow" style="color:var(--muted)">Times</p><p>${teams.length} de ${c.team_slots}</p></div></div>
  ${open && !mine ? html`<div class="row">${full ? badge('Todas as vagas de time preenchidas') : html`<button class="btn primary" id="new-team">Criar um time</button>`}<span class="small muted">ou entre em um time que procura gente, abaixo.</span></div>` : ''}
</article>
<h2 class="h3">Times inscritos</h2>
${teams.length ? html`<div class="grid g2">${teams.map(t => { const ms = (t.member_ids || []).map(id => people.get(id)).filter(Boolean); const isMine = t === mine; return html`<article class="panel" style="gap:10px">
  <div class="panel-head"><b class="h4">${t.name}</b>${isMine ? badge('Seu time', 'lagoa') : t.looking && ms.length < MAX ? badge('Procurando gente', 'duna') : badge('Completo')}</div>
  <div class="list">${ms.map(p => html`<a class="person" href="#/membros/${p.id}">${avatar(p.name)}<span class="who"><b>${p.name}</b><span class="small muted">${(p.perfis || []).join(' · ')}</span></span></a>`)}</div>
  ${isMine ? html`<div class="row"><button class="btn secondary small" data-look="${t.id}">${t.looking ? 'Parar de procurar gente' : 'Procurar mais gente'}</button><button class="btn secondary small" data-leave="${t.id}">Sair do time</button></div>` : open && !mine && t.looking && ms.length < MAX ? html`<button class="btn primary small" data-join="${t.id}">Entrar neste time</button>` : ''}
</article>`; })}</div>` : empty('Nenhum time ainda', open ? 'Seja o primeiro a montar um time.' : 'Os times aparecem quando as inscrições abrirem.')}`;
}

export function mount(root, ctx) {
  const me = ctx.me, cid = ctx.params[0];
  const nt = root.querySelector('#new-team');
  if (nt) nt.addEventListener('click', async () => {
    const r = await dialog('Criar um time', html`<div class="field"><label for="t-name">Nome do time</label><input id="t-name" name="name" required maxlength="40"></div><p class="help">Você pode convidar gente depois. O time aparece como "Procurando gente".</p>`, { submit: 'Criar time' });
    if (r) guard(async () => { await db.insert('teams', { challenge_id: cid, name: r.name.trim(), member_ids: [me.id], looking: true }); toast('Time criado.'); ctx.refresh(); });
  });
  root.querySelectorAll('[data-join]').forEach(b => b.addEventListener('click', () => guard(async () => {
    const t = await db.get('teams', b.dataset.join);
    if ((t.member_ids || []).length >= MAX) { toast('Esse time já está completo.', 'bad'); return ctx.refresh(); }
    const ids = [...(t.member_ids || []), me.id];
    await db.update('teams', t.id, { member_ids: ids, looking: ids.length < MAX && t.looking });
    toast(`Você entrou no time ${t.name}.`); ctx.refresh();
  })));
  root.querySelectorAll('[data-look]').forEach(b => b.addEventListener('click', () => guard(async () => { const t = await db.get('teams', b.dataset.look); await db.update('teams', t.id, { looking: !t.looking }); ctx.refresh(); })));
  root.querySelectorAll('[data-leave]').forEach(b => b.addEventListener('click', async () => {
    if (!(await confirmDlg('Sair do time?', 'Se você for a última pessoa, o time é desfeito.', 'Sair'))) return;
    guard(async () => { const t = await db.get('teams', b.dataset.leave); const ids = (t.member_ids || []).filter(id => id !== me.id); if (ids.length) await db.update('teams', t.id, { member_ids: ids }); else await db.remove('teams', t.id); toast('Você saiu do time.'); ctx.refresh(); });
  }));
}

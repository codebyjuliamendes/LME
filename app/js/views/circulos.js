/* Círculos LME (Figma: App / Círculos). Grupos de 6 a 10 pessoas com metas e aprendizados. */
import { db } from '../store.js';
import { html, raw, avatar, badge, toast, guard, fmtDay, fmtTime, dialog, confirmDlg, empty } from '../ui.js';
import { GOAL_STATUS } from '../logic.js';
import { ph, load, byId } from './_common.js';

export const title = 'Círculos';
const TONE = { 'Em andamento': 'duna', 'Concluída': 'lagoa', 'Precisa de ajuda': '' };

export async function render({ me }) {
  const d = await load('profiles', 'circles', 'circle_members', 'goals', 'learnings');
  const people = byId(d.profiles);
  const mem = d.circle_members.find(m => m.user_id === me.id);
  const circle = mem && d.circles.find(c => c.id === mem.circle_id);
  const size = id => d.circle_members.filter(m => m.circle_id === id).length;
  const others = d.circles.filter(c => !circle || c.id !== circle.id);
  let mine = '';
  if (circle) {
    const members = d.circle_members.filter(m => m.circle_id === circle.id).map(m => people.get(m.user_id)).filter(Boolean);
    const goals = d.goals.filter(g => g.circle_id === circle.id).sort((a, b) => a.created_at.localeCompare(b.created_at));
    const learnings = d.learnings.filter(l => l.circle_id === circle.id).sort((a, b) => b.created_at.localeCompare(a.created_at));
    const fac = people.get(circle.facilitator_id);
    mine = html`<section class="panel night" style="gap:16px"><div class="panel-head"><div><p class="eyebrow" style="color:var(--duna)">Seu Círculo</p><h2 class="h2">${circle.name}</h2></div><button class="btn on-night small" id="leave">Sair do Círculo</button></div>
      <p class="muted">Próximo encontro: ${fmtDay(circle.next_meeting)}, ${fmtTime(circle.next_meeting)}, ${circle.place}${fac ? ` · Facilitação: ${fac.name}` : ''}</p>
      <div class="avatars">${members.map(p => avatar(p.name))}</div></section>
    <section class="panel"><div class="panel-head"><h2 class="h3">Metas do ciclo</h2><button class="btn secondary small" id="add-goal">Adicionar minha meta</button></div>
      ${goals.length ? html`<div class="list">${goals.map(g => { const p = people.get(g.user_id) || { name: 'Membro' }; return html`<div class="person">${avatar(p.name)}<div class="who"><b>${p.name.split(' ')[0]}</b><span class="small muted">${g.text}</span></div>${g.user_id === me.id ? html`<label class="sr-only" for="gs-${g.id}">Situação</label><select id="gs-${g.id}" data-goal="${g.id}" style="width:auto">${GOAL_STATUS.map(s => html`<option ${g.status === s ? raw('selected') : ''}>${s}</option>`)}</select>` : badge(g.status, TONE[g.status])}</div>`; })}</div>` : html`<p class="muted small">Nenhuma meta ainda. Comece pela sua.</p>`}
    </section>
    <section class="panel"><div class="panel-head"><h2 class="h3">Aprendizados</h2><button class="btn secondary small" id="add-learning">Registrar aprendizado</button></div>
      ${learnings.length ? html`<ul style="display:grid;gap:8px;padding-left:18px;list-style:disc">${learnings.map(l => html`<li>${l.text}</li>`)}</ul>` : html`<p class="muted small">Registre o que o grupo aprendeu no último encontro.</p>`}
    </section>`;
  }
  return html`${ph('Círculos LME', 'Grupos de 6 a 10 pessoas que se encontram para acompanhar metas, dificuldades e aprendizados.')}
<div class="cols">
  <div class="grid" style="gap:20px">${mine || empty('Você ainda não está em um Círculo', 'Escolha um grupo ao lado. Cada pessoa participa de um Círculo por vez.')}</div>
  <aside class="grid" style="gap:12px"><h2 class="h3">${circle ? 'Outros Círculos' : 'Círculos com vagas'}</h2>
    ${others.map(c => { const n = size(c.id), full = n >= c.capacity; return html`<article class="panel" style="gap:8px"><div class="panel-head">${badge(c.kind, 'lagoa')}<b class="small" style="color:${full ? 'var(--muted)' : 'var(--azulejo)'}">${full ? 'Lotado' : `${c.capacity - n} ${c.capacity - n === 1 ? 'vaga' : 'vagas'}`}</b></div><b>${c.name}</b><span class="small muted">${c.city} · ${c.cadence.toLowerCase()} · ${n} membros</span>${!circle && !full ? html`<button class="btn primary small" data-join="${c.id}">Entrar neste Círculo</button>` : ''}</article>`; })}
  </aside>
</div>`;
}

export function mount(root, ctx) {
  const me = ctx.me;
  root.querySelectorAll('[data-join]').forEach(b => b.addEventListener('click', () => guard(async () => {
    const c = await db.get('circles', b.dataset.join);
    const n = (await db.list('circle_members', { eq: { circle_id: c.id } })).length;
    if (n >= c.capacity) { toast('Esse Círculo lotou. Escolha outro.', 'bad'); return ctx.refresh(); }
    await db.insert('circle_members', { id: c.id + ':' + me.id, circle_id: c.id, user_id: me.id });
    toast(`Bem-vindo ao Círculo ${c.name}.`); ctx.refresh();
  })));
  const leave = root.querySelector('#leave');
  if (leave) leave.addEventListener('click', async () => {
    if (!(await confirmDlg('Sair do Círculo?', 'Suas metas continuam salvas, mas você deixa de ver o grupo.', 'Sair'))) return;
    guard(async () => { const m = (await db.list('circle_members', { eq: { user_id: me.id } }))[0]; if (m) await db.remove('circle_members', m.id); toast('Você saiu do Círculo.'); ctx.refresh(); });
  });
  const circleId = async () => ((await db.list('circle_members', { eq: { user_id: me.id } }))[0] || {}).circle_id;
  const g = root.querySelector('#add-goal');
  if (g) g.addEventListener('click', async () => {
    const r = await dialog('Minha meta do ciclo', html`<div class="field"><label for="g-text">Meta</label><input id="g-text" name="text" required placeholder="Ex.: fechar 3 clientes piloto"></div><p class="help">Uma meta concreta para as próximas semanas.</p>`, { submit: 'Adicionar' });
    if (r) guard(async () => { await db.insert('goals', { circle_id: await circleId(), user_id: me.id, text: r.text.trim(), status: 'Em andamento' }); ctx.refresh(); });
  });
  root.querySelectorAll('[data-goal]').forEach(s => s.addEventListener('change', () => guard(async () => { await db.update('goals', s.dataset.goal, { status: s.value }); toast(s.value === 'Precisa de ajuda' ? 'Seu Círculo vai ver que você precisa de ajuda.' : 'Meta atualizada.'); ctx.refresh(); })));
  const l = root.querySelector('#add-learning');
  if (l) l.addEventListener('click', async () => {
    const r = await dialog('Registrar aprendizado', html`<div class="field"><label for="l-text">O que o grupo aprendeu</label><textarea id="l-text" name="text" required></textarea></div>`, { submit: 'Registrar' });
    if (r) guard(async () => { await db.insert('learnings', { circle_id: await circleId(), text: r.text.trim() }); ctx.refresh(); });
  });
}

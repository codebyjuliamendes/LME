/* Coordenação / Challenges: cadastrar desafios de empresas e acompanhar os times. */
import { db } from '../store.js';
import { html, badge, toast, guard, dialog, confirmDlg, fmtDate, empty } from '../ui.js';
import { ph, load, byId, fields } from './_common.js';

export const title = 'Challenges';
const STATUS = ['Em breve', 'Inscrições abertas', 'Em andamento', 'Encerrado'];
const SPEC = [
  { k: 'title', label: 'Pergunta do desafio', required: true, help: 'Ex.: Como reduzir perdas de energia em comunidades rurais?' },
  { k: 'org', label: 'Empresa ou instituição', required: true },
  { k: 'status', label: 'Situação', type: 'select', options: STATUS },
  { k: 'format', label: 'Formato', help: 'Ex.: 6 semanas, híbrido' },
  { k: 'team_slots', label: 'Vagas de time', type: 'number', required: true },
  { k: 'closes', label: 'Inscrições até', type: 'date', required: true },
  { k: 'demo_day', label: 'Demo Day', help: 'Ex.: Março de 2027' },
  { k: 'description', label: 'Descrição', type: 'textarea', required: true }
];

export async function render() {
  const d = await load('challenges', 'teams', 'profiles');
  const people = byId(d.profiles);
  return html`${ph('Challenges', 'Desafios reais trazidos por parceiros. Só um pode ficar com inscrições abertas por vez em destaque.', html`<button class="btn primary" id="add">Novo desafio</button>`)}
${d.challenges.length ? html`<div class="grid" style="gap:16px">${d.challenges.map(c => { const ts = d.teams.filter(t => t.challenge_id === c.id); return html`<article class="panel" style="gap:10px">
  <div class="panel-head"><div class="chips-row">${badge(c.status, c.status === 'Inscrições abertas' ? 'lagoa' : 'duna')}${badge(c.org)}</div><span class="row" style="gap:6px"><button class="icon-btn" data-edit="${c.id}" aria-label="Editar desafio">✎</button><button class="icon-btn" data-del="${c.id}" aria-label="Excluir desafio">🗑</button></span></div>
  <b class="h4">${c.title}</b><span class="small muted">${c.format || ''} · inscrições até ${c.closes ? fmtDate(c.closes + 'T12:00:00') : '—'} · ${ts.length} de ${c.team_slots} times</span>
  ${ts.length ? html`<div class="list">${ts.map(t => html`<div class="panel-head"><b>${t.name}</b><span class="small muted">${(t.member_ids || []).map(id => (people.get(id) || {}).name).filter(Boolean).join(', ')}</span></div>`)}</div>` : html`<span class="small muted">Nenhum time inscrito.</span>`}
</article>`; })}</div>` : empty('Nenhum desafio', 'Cadastre o primeiro desafio de um parceiro.')}`;
}

export function mount(root, ctx) {
  const edit = async c => {
    const r = await dialog(c ? 'Editar desafio' : 'Novo desafio', fields(SPEC, c || { status: 'Em breve', team_slots: 10 }), { submit: 'Salvar' });
    if (r) guard(async () => { const row = { ...r, team_slots: Math.max(1, +r.team_slots || 1) }; c ? await db.update('challenges', c.id, row) : await db.insert('challenges', row); toast('Desafio salvo.'); ctx.refresh(); });
  };
  root.querySelector('#add').addEventListener('click', () => edit(null));
  root.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', async () => edit(await db.get('challenges', b.dataset.edit))));
  root.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
    if (await confirmDlg('Excluir desafio?', 'Os times inscritos nele também são apagados.', 'Excluir', true)) guard(async () => {
      for (const t of await db.list('teams', { eq: { challenge_id: b.dataset.del } })) await db.remove('teams', t.id);
      await db.remove('challenges', b.dataset.del); ctx.refresh();
    });
  }));
}

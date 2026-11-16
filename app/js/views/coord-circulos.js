/* Coordenação / Círculos: criar grupos, definir facilitação e próximo encontro. */
import { db } from '../store.js';
import { html, raw, badge, toast, guard, dialog, confirmDlg, fmtDay, fmtTime, empty } from '../ui.js';
import { ph, load, byId, fields, toLocalInput, fromLocalInput } from './_common.js';

export const title = 'Círculos';
const KINDS = ['Por área', 'Por perfil', 'Por estágio', 'Por afinidade', 'Por cidade'];
const CADENCE = ['Semanal', 'Quinzenal', 'Mensal'];

export async function render() {
  const d = await load('circles', 'circle_members', 'profiles', 'goals');
  const people = byId(d.profiles);
  return html`${ph('Círculos', 'Grupos de 6 a 10 pessoas. Crie os Círculos, defina quem facilita e marque o próximo encontro.', html`<button class="btn primary" id="add">Novo Círculo</button>`)}
${d.circles.length ? html`<div class="grid g2">${d.circles.map(c => { const ms = d.circle_members.filter(m => m.circle_id === c.id); const help = d.goals.filter(g => g.circle_id === c.id && g.status === 'Precisa de ajuda').length; const f = people.get(c.facilitator_id); return html`<article class="panel" style="gap:8px">
  <div class="panel-head"><div class="chips-row">${badge(c.kind, 'lagoa')}${help ? badge(help + ' pedindo ajuda') : ''}</div><span class="row" style="gap:6px"><button class="icon-btn" data-edit="${c.id}" aria-label="Editar ${c.name}">✎</button><button class="icon-btn" data-del="${c.id}" aria-label="Excluir ${c.name}">🗑</button></span></div>
  <b class="h4">${c.name}</b>
  <span class="small muted">${c.city || ''} · ${(c.cadence || '').toLowerCase()} · ${ms.length} de ${c.capacity} pessoas</span>
  <span class="small">${c.next_meeting ? `Próximo encontro: ${fmtDay(c.next_meeting)}, ${fmtTime(c.next_meeting)}${c.place ? ', ' + c.place : ''}` : 'Sem encontro marcado'}</span>
  <span class="small">Facilitação: ${f ? f.name : '—'}</span>
  ${ms.length ? html`<span class="small muted">${ms.map(m => (people.get(m.user_id) || {}).name).filter(Boolean).join(', ')}</span>` : ''}
</article>`; })}</div>` : empty('Nenhum Círculo criado', 'Crie o primeiro. Os membros escolhem o seu na tela Círculos.')}`;
}

export function mount(root, ctx) {
  const edit = async c => {
    const ps = (await db.list('profiles')).filter(p => p.onboarded).sort((a, b) => a.name.localeCompare(b.name));
    const spec = [
      { k: 'name', label: 'Nome', required: true, help: 'Ex.: Tecnologia · São Luís' },
      { k: 'kind', label: 'Tipo', type: 'select', options: KINDS },
      { k: 'city', label: 'Cidade ou "Online"', required: true },
      { k: 'cadence', label: 'Frequência', type: 'select', options: CADENCE },
      { k: 'capacity', label: 'Vagas', type: 'number', required: true },
      { k: 'next_meeting', label: 'Próximo encontro (horário de São Luís)', type: 'datetime-local' },
      { k: 'place', label: 'Local do encontro' }
    ];
    const v = c ? { ...c, next_meeting: toLocalInput(c.next_meeting) } : { kind: KINDS[0], cadence: 'Quinzenal', capacity: 10 };
    const r = await dialog(c ? 'Editar Círculo' : 'Novo Círculo', html`${fields(spec, v)}<div class="field"><label for="f-fac">Facilitação</label><select id="f-fac" name="facilitator_id"><option value="">Ninguém ainda</option>${ps.map(p => html`<option value="${p.id}" ${c && c.facilitator_id === p.id ? raw('selected') : ''}>${p.name}</option>`)}</select></div>`, { submit: 'Salvar' });
    if (!r) return;
    const row = { ...r, capacity: Math.max(1, +r.capacity || 10), next_meeting: r.next_meeting ? fromLocalInput(r.next_meeting) : null, facilitator_id: r.facilitator_id || null };
    guard(async () => { c ? await db.update('circles', c.id, row) : await db.insert('circles', row); toast('Círculo salvo.'); ctx.refresh(); });
  };
  root.querySelector('#add').addEventListener('click', () => edit(null));
  root.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', async () => edit(await db.get('circles', b.dataset.edit))));
  root.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
    if (await confirmDlg('Excluir Círculo?', 'As pessoas saem do grupo e as metas e aprendizados dele são apagados.', 'Excluir', true)) guard(async () => {
      const id = b.dataset.del;
      for (const t of ['circle_members', 'goals', 'learnings']) for (const x of await db.list(t, { eq: { circle_id: id } })) await db.remove(t, x.id);
      await db.remove('circles', id); toast('Círculo excluído.'); ctx.refresh();
    });
  }));
}

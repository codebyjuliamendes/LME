/* Coordenação / Office Hours: especialistas e horários disponíveis. */
import { db } from '../store.js';
import { html, raw, avatar, badge, toast, guard, dialog, confirmDlg, fmtDay, fmtTime, empty } from '../ui.js';
import { ph, load, byId, fields, fromLocalInput } from './_common.js';

export const title = 'Office Hours';
const SPEC = [
  { k: 'name', label: 'Nome', required: true },
  { k: 'role', label: 'Cargo ou atuação', required: true },
  { k: 'area', label: 'Área', required: true, help: 'Ex.: Jurídico, Finanças, Vendas, Inovação' },
  { k: 'topics', label: 'Temas', type: 'textarea', required: true }
];

export async function render() {
  const d = await load('experts', 'slots', 'profiles');
  const people = byId(d.profiles);
  const now = Date.now();
  return html`${ph('Office Hours', 'Cadastre especialistas e abra horários de 30 minutos. Os membros marcam pela área do membro.', html`<button class="btn primary" id="add">Novo especialista</button>`)}
${d.experts.length ? html`<div class="grid g2">${d.experts.map(x => { const ss = d.slots.filter(s => s.expert_id === x.id && new Date(s.starts_at) > now).sort((a, b) => a.starts_at.localeCompare(b.starts_at)); return html`<article class="panel" style="gap:10px">
  <div class="person">${avatar(x.name)}<span class="who"><b>${x.name}</b><span class="small muted">${x.role}</span></span>${badge(x.area, 'duna')}</div>
  <p class="small">${x.topics}</p>
  ${ss.length ? html`<div class="list">${ss.map(s => { const p = people.get(s.booked_by); return html`<div class="panel-head"><span class="small"><b>${fmtDay(s.starts_at)}, ${fmtTime(s.starts_at)}</b>${p ? html`<span class="muted" style="display:block">Marcado por ${p.name}: ${s.topic}</span>` : html`<span class="muted"> · livre</span>`}</span><button class="icon-btn" data-delslot="${s.id}" aria-label="Remover horário">🗑</button></div>`; })}</div>` : html`<p class="small muted">Nenhum horário aberto.</p>`}
  <div class="row"><button class="btn secondary small" data-slot="${x.id}">Abrir horário</button><button class="btn secondary small" data-edit="${x.id}">Editar</button><button class="btn secondary small" data-del="${x.id}">Excluir</button></div>
</article>`; })}</div>` : empty('Nenhum especialista', 'Cadastre quem vai atender os membros.')}`;
}

export function mount(root, ctx) {
  const edit = async x => {
    const r = await dialog(x ? 'Editar especialista' : 'Novo especialista', fields(SPEC, x || {}), { submit: 'Salvar' });
    if (r) guard(async () => { x ? await db.update('experts', x.id, r) : await db.insert('experts', r); toast('Especialista salvo.'); ctx.refresh(); });
  };
  root.querySelector('#add').addEventListener('click', () => edit(null));
  root.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', async () => edit(await db.get('experts', b.dataset.edit))));
  root.querySelectorAll('[data-slot]').forEach(b => b.addEventListener('click', async () => {
    const r = await dialog('Abrir horário', html`<div class="field"><label for="sl">Data e hora (horário de São Luís)</label><input id="sl" name="at" type="datetime-local" required></div><div class="field"><label for="rep">Repetir</label><select id="rep" name="rep"><option value="1">Só este horário</option><option value="2">2 horários seguidos de 30 min</option><option value="4">4 horários seguidos de 30 min</option></select></div>`, { submit: 'Abrir' });
    if (r) guard(async () => {
      const start = new Date(fromLocalInput(r.at)).getTime();
      if (start < Date.now()) { toast('Escolha um horário no futuro.', 'bad'); return; }
      for (let i = 0; i < +r.rep; i++) await db.insert('slots', { expert_id: b.dataset.slot, starts_at: new Date(start + i * 1800000).toISOString(), booked_by: '', topic: '' });
      toast(+r.rep === 1 ? 'Horário aberto.' : `${r.rep} horários abertos.`); ctx.refresh();
    });
  }));
  root.querySelectorAll('[data-delslot]').forEach(b => b.addEventListener('click', async () => {
    const s = await db.get('slots', b.dataset.delslot);
    if (!s.booked_by || await confirmDlg('Remover horário marcado?', 'Alguém já marcou esse horário. Avise a pessoa antes.', 'Remover', true)) guard(async () => { await db.remove('slots', s.id); ctx.refresh(); });
  }));
  root.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
    if (await confirmDlg('Excluir especialista?', 'Os horários dele também são removidos.', 'Excluir', true)) guard(async () => {
      for (const s of await db.list('slots', { eq: { expert_id: b.dataset.del } })) await db.remove('slots', s.id);
      await db.remove('experts', b.dataset.del); ctx.refresh();
    });
  }));
}

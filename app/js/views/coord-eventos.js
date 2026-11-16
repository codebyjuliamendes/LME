/* Coordenação / Programas e eventos (Figma: Coordenação / Eventos). Criar, editar, ver inscritos. */
import { db } from '../store.js';
import { html, badge, toast, guard, dialog, confirmDlg, fmtDay, fmtTime, empty } from '../ui.js';
import { toCsv } from '../logic.js';
import { ph, load, byId, fields, download, toLocalInput, fromLocalInput } from './_common.js';

export const title = 'Programas e eventos';
const FORMATS = ['Meetup', 'Café com Founders', 'Boas-vindas', 'LME Talks', 'LME Labs', 'Friday Founders', 'Open Innovation Day', 'Office Hours'];
const SPEC = [
  { k: 'title', label: 'Título', required: true },
  { k: 'format', label: 'Formato', type: 'select', options: FORMATS },
  { k: 'starts_at', label: 'Data e hora (horário de São Luís)', type: 'datetime-local', required: true },
  { k: 'mode', label: 'Modalidade', type: 'select', options: ['Presencial', 'Online'] },
  { k: 'place', label: 'Local' },
  { k: 'city', label: 'Cidade' },
  { k: 'capacity', label: 'Vagas', type: 'number', help: 'Deixe 0 para sem limite.' },
  { k: 'audience', label: 'Para quem' },
  { k: 'description', label: 'Descrição', type: 'textarea' },
  { k: 'agenda', label: 'Programação', type: 'textarea', help: 'Uma linha por item, no formato 19h00 Abertura.' }
];
const agendaIn = a => (a || []).map(x => `${x.time} ${x.item}`).join('\n');
const agendaOut = s => String(s || '').split('\n').map(l => l.trim()).filter(Boolean).map(l => { const m = l.match(/^(\S+)\s+(.*)$/); return m ? { time: m[1], item: m[2] } : { time: '', item: l }; });

export async function render() {
  const d = await load('events', 'rsvps');
  const now = Date.now() - 3 * 3600000;
  const list = d.events.slice().sort((a, b) => b.starts_at.localeCompare(a.starts_at));
  const n = id => d.rsvps.filter(r => r.event_id === id).length;
  return html`${ph('Programas e eventos', 'Agenda da Liga: crie encontros, acompanhe inscrições e exporte a lista de presença.', html`<button class="btn primary" id="add">Novo evento</button>`)}
${list.length ? html`<div class="table-wrap"><table><thead><tr><th>Evento</th><th>Quando</th><th>Inscritos</th><th></th></tr></thead><tbody>
${list.map(e => html`<tr><td><b>${e.title}</b><div class="chips-row">${badge(e.format)}${badge(e.mode, e.mode === 'Online' ? 'duna' : 'lagoa')}${new Date(e.starts_at) < now ? badge('Realizado') : ''}</div></td>
<td>${fmtDay(e.starts_at)}<div class="small muted">${fmtTime(e.starts_at)} · ${e.mode === 'Online' ? 'Online' : e.city || ''}</div></td>
<td><b>${n(e.id)}</b>${e.capacity ? ` de ${e.capacity}` : ''}</td>
<td><div class="row" style="gap:6px;flex-wrap:nowrap"><button class="btn secondary small" data-list="${e.id}">Inscritos</button><button class="icon-btn" data-edit="${e.id}" aria-label="Editar ${e.title}">✎</button><button class="icon-btn" data-del="${e.id}" aria-label="Excluir ${e.title}">🗑</button></div></td></tr>`)}
</tbody></table></div>` : empty('Nenhum evento', 'Crie o primeiro encontro da Liga.')}`;
}

export function mount(root, ctx) {
  const edit = async e => {
    const v = e ? { ...e, starts_at: toLocalInput(e.starts_at), agenda: agendaIn(e.agenda) } : { format: 'Meetup', mode: 'Presencial', city: 'São Luís', capacity: 40 };
    const r = await dialog(e ? 'Editar evento' : 'Novo evento', fields(SPEC, v), { submit: 'Salvar evento' });
    if (!r) return;
    const row = { ...r, starts_at: fromLocalInput(r.starts_at), capacity: +r.capacity || 0, agenda: agendaOut(r.agenda) };
    guard(async () => { e ? await db.update('events', e.id, row) : await db.insert('events', row); toast('Evento salvo. Ele já aparece na Agenda dos membros.'); ctx.refresh(); });
  };
  root.querySelector('#add').addEventListener('click', () => edit(null));
  root.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', async () => edit(await db.get('events', b.dataset.edit))));
  root.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
    const e = await db.get('events', b.dataset.del);
    if (await confirmDlg('Excluir evento?', `“${e.title}” sai da agenda e as presenças confirmadas são canceladas.`, 'Excluir', true)) guard(async () => {
      for (const r of await db.list('rsvps', { eq: { event_id: e.id } })) await db.remove('rsvps', r.id);
      await db.remove('events', e.id); toast('Evento excluído.'); ctx.refresh();
    });
  }));
  root.querySelectorAll('[data-list]').forEach(b => b.addEventListener('click', () => guard(async () => {
    const e = await db.get('events', b.dataset.list);
    const people = byId(await db.list('profiles'));
    const rows = (await db.list('rsvps', { eq: { event_id: e.id } })).map(r => ({ ...(people.get(r.user_id) || { name: 'Membro removido' }), confirmed: r.created_at }));
    const csv = toCsv(rows, [['name', 'Nome'], ['email', 'E-mail'], ['whatsapp', 'WhatsApp'], ['city', 'Cidade'], ['org', 'Organização'], ['confirmed', 'Confirmou em']]);
    const ok = await dialog(`Inscritos: ${e.title}`, rows.length ? html`<div class="list">${rows.map(p => html`<div class="panel-head"><b>${p.name}</b><span class="small muted">${p.city || ''}</span></div>`)}</div>` : html`<p class="muted">Ninguém confirmou ainda.</p>`, { submit: 'Baixar lista (CSV)' });
    if (ok) download(`inscritos-${e.id}.csv`, csv);
  })));
}

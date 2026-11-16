/* Coordenação / Radar (Figma: Coordenação / Radar). Publicar oportunidades e revisar indicações. */
import { db } from '../store.js';
import { html, badge, toast, guard, dialog, confirmDlg, fmtDate, ago, empty } from '../ui.js';
import { OPP_TYPES, deadline } from './radar.js';
import { ph, load, byId, fields } from './_common.js';

export const title = 'Radar';
const SPEC = [
  { k: 'title', label: 'Título', required: true },
  { k: 'type', label: 'Tipo', type: 'select', options: OPP_TYPES },
  { k: 'description', label: 'Descrição', type: 'textarea', required: true },
  { k: 'deadline', label: 'Prazo', type: 'date', required: true },
  { k: 'audience', label: 'Para quem', required: true },
  { k: 'url', label: 'Link', type: 'url' }
];

export async function render() {
  const d = await load('opportunities', 'saved_opps', 'suggestions', 'profiles');
  const people = byId(d.profiles);
  const list = d.opportunities.slice().sort((a, b) => b.deadline.localeCompare(a.deadline));
  const sugg = d.suggestions.filter(s => s.status === 'nova');
  return html`${ph('Radar', 'Oportunidades publicadas para os membros e indicações enviadas por eles.', html`<button class="btn primary" id="add">Nova oportunidade</button>`)}
${sugg.length ? html`<section class="panel soft-azul"><h2 class="h4">Indicações dos membros (${sugg.length})</h2><div class="list">${sugg.map(s => html`<div class="panel-head" style="align-items:start"><span><b>${s.title}</b><span class="small muted" style="display:block">${(people.get(s.author_id) || {}).name || 'Membro'} · ${ago(s.created_at)}${s.url ? ' · ' + s.url : ''}</span>${s.text ? html`<span class="small">${s.text}</span>` : ''}</span><span class="row" style="gap:6px;flex-wrap:nowrap"><button class="btn primary small" data-pub="${s.id}">Publicar</button><button class="btn secondary small" data-drop="${s.id}">Descartar</button></span></div>`)}</div></section>` : ''}
${list.length ? html`<div class="table-wrap"><table><thead><tr><th>Oportunidade</th><th>Prazo</th><th>Salvas</th><th></th></tr></thead><tbody>
${list.map(o => html`<tr><td><b>${o.title}</b><div>${badge(o.type, 'lagoa')} <span class="small muted">${o.audience}</span></div></td><td>${fmtDate(o.deadline + 'T12:00:00')}<div class="small muted">${deadline(o.deadline)}</div></td><td>${d.saved_opps.filter(s => s.opp_id === o.id).length}</td>
<td><div class="row" style="gap:6px;flex-wrap:nowrap"><button class="icon-btn" data-edit="${o.id}" aria-label="Editar ${o.title}">✎</button><button class="icon-btn" data-del="${o.id}" aria-label="Excluir ${o.title}">🗑</button></div></td></tr>`)}
</tbody></table></div>` : empty('Radar vazio', 'Publique a primeira oportunidade.')}`;
}

export function mount(root, ctx) {
  const edit = async (o, from) => {
    const r = await dialog(o ? 'Editar oportunidade' : 'Nova oportunidade', fields(SPEC, o || from || { type: 'Edital', audience: 'Todos' }), { submit: 'Publicar' });
    if (!r) return false;
    await guard(async () => { o ? await db.update('opportunities', o.id, r) : await db.insert('opportunities', r); toast('Publicada no Radar.'); });
    return true;
  };
  root.querySelector('#add').addEventListener('click', async () => { if (await edit(null)) ctx.refresh(); });
  root.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', async () => { if (await edit(await db.get('opportunities', b.dataset.edit))) ctx.refresh(); }));
  root.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
    if (await confirmDlg('Excluir oportunidade?', 'Ela some do Radar e da lista de salvas dos membros.', 'Excluir', true)) guard(async () => {
      for (const s of await db.list('saved_opps', { eq: { opp_id: b.dataset.del } })) await db.remove('saved_opps', s.id);
      await db.remove('opportunities', b.dataset.del); ctx.refresh();
    });
  }));
  root.querySelectorAll('[data-pub]').forEach(b => b.addEventListener('click', async () => {
    const s = await db.get('suggestions', b.dataset.pub);
    if (await edit(null, { title: s.title, url: s.url, description: s.text, type: 'Edital', audience: 'Todos' })) { await guard(() => db.update('suggestions', s.id, { status: 'publicada' })); ctx.refresh(); }
  }));
  root.querySelectorAll('[data-drop]').forEach(b => b.addEventListener('click', () => guard(async () => { await db.update('suggestions', b.dataset.drop, { status: 'descartada' }); ctx.refresh(); })));
}

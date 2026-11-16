/* Agenda (Figma: App / Agenda e evento, lista). */
import { db } from '../store.js';
import { html, badge, toast, guard, fmtTime, dayNum, monAbbr, empty } from '../ui.js';
import { ph, load, confirmRsvp, RSVP_MSG } from './_common.js';

export const title = 'Agenda';
let tab = 'proximos';

export async function render({ me }) {
  const d = await load('events', 'rsvps');
  const now = Date.now();
  const mine = new Set(d.rsvps.filter(r => r.user_id === me.id).map(r => r.event_id));
  let list = d.events.slice();
  if (tab === 'proximos') list = list.filter(e => new Date(e.starts_at) >= now - 3 * 3600000);
  if (tab === 'confirmados') list = list.filter(e => mine.has(e.id) && new Date(e.starts_at) >= now - 3 * 3600000);
  if (tab === 'passados') list = list.filter(e => new Date(e.starts_at) < now - 3 * 3600000);
  list.sort((a, b) => (tab === 'passados' ? b.starts_at.localeCompare(a.starts_at) : a.starts_at.localeCompare(b.starts_at)));
  const n = id => d.rsvps.filter(r => r.event_id === id).length;
  return html`${ph('Agenda', 'Encontros, Talks, Labs e Office Hours da Liga.')}
<div class="chips-row" role="group" aria-label="Filtro">${[['proximos', 'Próximos'], ['confirmados', 'Confirmados'], ['passados', 'Passados']].map(([k, l]) => html`<button class="tag" data-tab="${k}" aria-pressed="${tab === k}">${l}</button>`)}</div>
${list.length ? html`<div class="grid" style="gap:12px">${list.map(e => { const c = n(e.id), full = e.capacity && c >= e.capacity; return html`<article class="panel" style="grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:20px">
  <span class="date-chip"><b>${dayNum(e.starts_at)}</b><span>${monAbbr(e.starts_at)}</span></span>
  <div style="display:grid;gap:4px;min-width:0"><div class="chips-row">${badge(e.format)}${badge(e.mode, e.mode === 'Online' ? 'duna' : 'lagoa')}</div><a href="#/agenda/${e.id}" style="text-decoration:none"><b class="h4">${e.title}</b></a><span class="small muted">${fmtTime(e.starts_at)} · ${e.mode === 'Online' ? 'Online' : `${e.place}, ${e.city}`} · ${c}${e.capacity ? ` de ${e.capacity}` : ''} confirmados</span></div>
  ${mine.has(e.id) ? badge('Você vai', 'lagoa') : tab === 'passados' ? '' : full ? badge('Lotado') : html`<button class="btn secondary small" data-rsvp="${e.id}">Confirmar</button>`}
</article>`; })}</div>` : empty(tab === 'confirmados' ? 'Você ainda não confirmou presença' : 'Nada por aqui', tab === 'confirmados' ? 'Escolha um encontro em Próximos.' : 'A agenda é atualizada pela coordenação.')}`;
}

export function mount(root, ctx) {
  root.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => { tab = b.dataset.tab; ctx.refresh(); }));
  root.querySelectorAll('[data-rsvp]').forEach(b => b.addEventListener('click', () => guard(async () => {
    const r = await confirmRsvp(await db.get('events', b.dataset.rsvp), ctx.me); toast(RSVP_MSG[r], r === 'full' ? 'bad' : 'ok'); ctx.refresh();
  })));
}

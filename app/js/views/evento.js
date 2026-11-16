/* Página do evento (Figma: App / Agenda e evento, detalhe). */
import { db } from '../store.js';
import { html, avatar, badge, toast, guard, fmtDay, fmtTime, empty, confirmDlg } from '../ui.js';
import { ph, load, byId, confirmRsvp, RSVP_MSG } from './_common.js';

export const title = 'Evento';

function ics(e) {
  const dt = s => new Date(s).toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const end = new Date(new Date(e.starts_at).getTime() + 2 * 3600000).toISOString();
  const esc = s => String(s || '').replace(/[,;\\]/g, m => '\\' + m).replace(/\n/g, '\\n');
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//LME//Agenda//PT', 'BEGIN:VEVENT', 'UID:' + e.id + '@lme', 'DTSTAMP:' + dt(new Date().toISOString()), 'DTSTART:' + dt(e.starts_at), 'DTEND:' + dt(end), 'SUMMARY:' + esc(e.title), 'LOCATION:' + esc(e.mode === 'Online' ? 'Online' : `${e.place}, ${e.city}`), 'DESCRIPTION:' + esc(e.description), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
}

export async function render({ me, params }) {
  const d = await load('events', 'rsvps', 'profiles');
  const e = d.events.find(x => x.id === params[0]);
  if (!e) return empty('Evento não encontrado', 'Ele pode ter sido removido da agenda.', html`<a class="btn secondary" href="#/agenda">Voltar para a agenda</a>`);
  const people = byId(d.profiles);
  const goers = d.rsvps.filter(r => r.event_id === e.id).map(r => people.get(r.user_id)).filter(Boolean);
  const going = goers.some(p => p.id === me.id);
  const full = e.capacity && goers.length >= e.capacity;
  const past = new Date(e.starts_at) < Date.now();
  return html`<a class="crumb" href="#/agenda">← Agenda</a>
<article class="panel" style="padding:32px;gap:18px">
  <div class="chips-row">${badge(e.format)}${badge(e.mode, e.mode === 'Online' ? 'duna' : 'lagoa')}${e.audience ? badge(e.audience, 'duna') : ''}</div>
  <h1 class="display-l">${e.title}</h1>
  <div class="grid g3">
    <div><p class="eyebrow" style="color:var(--muted)">Quando</p><p>${fmtDay(e.starts_at)} · ${fmtTime(e.starts_at)}</p></div>
    <div><p class="eyebrow" style="color:var(--muted)">Onde</p><p>${e.mode === 'Online' ? 'Online (o link chega por e-mail)' : `${e.place}, ${e.city}`}</p></div>
    <div><p class="eyebrow" style="color:var(--muted)">Vagas</p><p>${goers.length}${e.capacity ? ` de ${e.capacity}` : ''} confirmadas</p></div>
  </div>
  ${e.description ? html`<p class="lead" style="color:var(--ink)">${e.description}</p>` : ''}
  ${e.agenda && e.agenda.length ? html`<h2 class="h3">Programação</h2><div class="grid" style="gap:10px">${e.agenda.map(a => html`<div class="row" style="gap:16px;flex-wrap:nowrap"><b style="color:var(--azulejo);min-width:56px">${a.time}</b><span>${a.item}</span></div>`)}</div>` : ''}
  ${goers.length ? html`<div class="row"><div class="avatars">${goers.slice(0, 6).map(p => avatar(p.name))}</div><span class="small muted">${goers.slice(0, 2).map(p => p.name.split(' ')[0]).join(', ')}${goers.length > 2 ? ` e mais ${goers.length - 2}` : ''} ${goers.length === 1 ? 'vai' : 'vão'}</span></div>` : ''}
  <div class="row">${past ? badge('Encontro encerrado') : going ? html`<button class="btn secondary" id="cancel">Cancelar presença</button>` : full ? badge('Vagas esgotadas') : html`<button class="btn primary" id="rsvp">Confirmar presença</button>`}
  ${!past ? html`<a class="btn secondary" id="ics" download="${e.title}.ics" href="data:text/calendar;charset=utf-8,${encodeURIComponent(ics(e))}">Adicionar à agenda</a>` : ''}</div>
</article>`;
}

export function mount(root, ctx) {
  const r = root.querySelector('#rsvp');
  if (r) r.addEventListener('click', () => guard(async () => { const res = await confirmRsvp(await db.get('events', ctx.params[0]), ctx.me); toast(RSVP_MSG[res], res === 'full' ? 'bad' : 'ok'); ctx.refresh(); }));
  const c = root.querySelector('#cancel');
  if (c) c.addEventListener('click', async () => {
    if (await confirmDlg('Cancelar presença?', 'Sua vaga fica livre para outra pessoa.', 'Cancelar presença')) guard(async () => { await db.remove('rsvps', ctx.params[0] + ':' + ctx.me.id); toast('Presença cancelada.'); ctx.refresh(); });
  });
}

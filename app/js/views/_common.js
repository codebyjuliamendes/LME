import { db } from '../store.js';
import { html, raw } from '../ui.js';

export const ph = (title, sub, action) => html`<header class="ph"><div><h1>${title}</h1>${sub ? html`<p>${sub}</p>` : ''}</div>${action || ''}</header>`;

/* Carrega várias tabelas de uma vez: load('profiles', 'events') → { profiles, events } */
export async function load(...tables) {
  const rows = await Promise.all(tables.map(t => db.list(t)));
  return Object.fromEntries(tables.map((t, i) => [t, rows[i]]));
}
export const byId = rows => new Map(rows.map(r => [r.id, r]));
/* Confirma presença respeitando a lotação. Retorna 'ok', 'already' ou 'full'. */
export async function confirmRsvp(ev, me) {
  const all = await db.list('rsvps', { eq: { event_id: ev.id } });
  if (all.some(r => r.user_id === me.id)) return 'already';
  if (ev.capacity && all.length >= ev.capacity) return 'full';
  await db.insert('rsvps', { id: ev.id + ':' + me.id, event_id: ev.id, user_id: me.id });
  return 'ok';
}
export const RSVP_MSG = { ok: 'Presença confirmada.', already: 'Você já está na lista desse encontro.', full: 'As vagas desse encontro acabaram.' };
export const upcoming =events => events.filter(e => new Date(e.starts_at) > new Date(Date.now() - 3 * 3600000)).sort((a, b) => a.starts_at.localeCompare(b.starts_at));

/* Baixa um arquivo gerado no navegador (CSV, ICS, SVG). */
export function download(name, text, type = 'text/csv;charset=utf-8') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/* Datas no fuso de São Luís (UTC-3, sem horário de verão). */
export const toLocalInput = iso => iso ? new Date(new Date(iso).getTime() - 3 * 3600000).toISOString().slice(0, 16) : '';
export const fromLocalInput = v => new Date(v + ':00-03:00').toISOString();

/* Campos de formulário a partir de uma especificação simples.
   spec: [{ k, label, type: text|textarea|select|number|date|datetime-local|url|email, options, required, help }] */
export function fields(spec, v = {}) {
  return html`${spec.map(f => {
    const id = 'f-' + f.k, val = v[f.k] == null ? '' : v[f.k];
    const req = f.required ? raw('required') : '';
    const input = f.type === 'textarea' ? html`<textarea id="${id}" name="${f.k}" ${req}>${val}</textarea>`
      : f.type === 'select' ? html`<select id="${id}" name="${f.k}" ${req}>${f.options.map(o => html`<option ${String(o) === String(val) ? raw('selected') : ''}>${o}</option>`)}</select>`
      : html`<input id="${id}" name="${f.k}" type="${f.type || 'text'}" value="${val}" ${f.type === 'number' ? raw('min="0" step="1"') : ''} ${req}>`;
    return html`<div class="field"><label for="${id}">${f.label}</label>${input}${f.help ? html`<p class="help">${f.help}</p>` : ''}</div>`;
  })}`;
}

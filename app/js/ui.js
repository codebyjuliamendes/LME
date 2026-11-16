/* Utilitários de interface. Todo texto vindo de dados passa por esc() via html``. */
class Raw { constructor(s) { this.s = s; } toString() { return this.s; } }
export const raw = s => new Raw(s);
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const part = v => (v instanceof Raw ? v.s : Array.isArray(v) ? v.map(part).join('') : v === false || v == null ? '' : esc(v));
export function html(strings, ...vals) { let out = ''; strings.forEach((s, i) => { out += s; if (i < vals.length) out += part(vals[i]); }); return raw(out); }

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// ---------- Formatação ----------
const TZ = 'America/Fortaleza';
export const fmtDate = iso => new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', timeZone: TZ });
export const fmtDay = iso => new Date(iso).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: TZ });
export const fmtTime = iso => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: TZ }).replace(':00', 'h').replace(':', 'h');
export const dayNum = iso => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', timeZone: TZ });
export const monAbbr = iso => new Date(iso).toLocaleDateString('pt-BR', { month: 'short', timeZone: TZ }).replace('.', '').toUpperCase();
export const money = n => (+n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
export function ago(iso) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return 'agora';
  if (s < 3600) return `há ${Math.round(s / 60)} min`;
  if (s < 86400) return `há ${Math.round(s / 3600)} h`;
  if (s < 172800) return 'ontem';
  return `há ${Math.round(s / 86400)} dias`;
}
export const daysUntil = d => Math.ceil((new Date(d + (d.length === 10 ? 'T23:59:59' : '')).getTime() - Date.now()) / 86400000);
export const initials = name => String(name || '?').trim().split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();

// ---------- Peças ----------
export const avatar = (name, size = '') => html`<span class="avatar ${size}" aria-hidden="true">${initials(name)}</span>`;
export const badge = (text, tone = '') => html`<span class="badge ${tone}">${text}</span>`;
export const tag = text => html`<span class="tag">${text}</span>`;
export const empty = (title, text, action) => html`<div class="empty"><p class="h4">${title}</p><p class="muted">${text}</p>${action || ''}</div>`;

// ---------- Avisos ----------
export function toast(text, tone = 'ok') {
  let box = $('#toasts');
  if (!box) { box = document.createElement('div'); box.id = 'toasts'; box.setAttribute('role', 'status'); box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
  const t = document.createElement('div'); t.className = 'toast ' + tone; t.textContent = text; box.appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, 3200);
}

// ---------- Diálogo ----------
export function dialog(title, body, { submit = 'Salvar', danger = false } = {}) {
  return new Promise(resolve => {
    const d = document.createElement('dialog'); d.className = 'dlg';
    d.innerHTML = html`<form method="dialog" class="dlg-form"><div class="dlg-head"><h2 class="h3">${title}</h2><button class="icon-btn" value="cancel" aria-label="Fechar">✕</button></div><div class="dlg-body">${raw(String(body))}</div><div class="dlg-foot"><button class="btn secondary" value="cancel" type="submit">Cancelar</button><button class="btn ${danger ? 'danger' : 'primary'}" value="ok" type="submit">${submit}</button></div></form>`.s;
    document.body.appendChild(d);
    const form = d.querySelector('form');
    form.addEventListener('submit', e => {
      const ok = e.submitter && e.submitter.value === 'ok';
      if (ok && !form.checkValidity()) { e.preventDefault(); form.reportValidity(); return; }
      const data = ok ? Object.fromEntries(new FormData(form)) : null;
      setTimeout(() => { d.close(); d.remove(); resolve(data); });
    });
    d.addEventListener('cancel', () => { d.remove(); resolve(null); });
    d.showModal();
    const first = d.querySelector('input,select,textarea'); if (first) first.focus();
  });
}
export const confirmDlg = (title, text, submit = 'Confirmar', danger = false) => dialog(title, html`<p>${text}</p>`, { submit, danger }).then(r => !!r);

// ---------- Erros ----------
export async function guard(fn, fail = 'Não foi possível salvar agora. Tente de novo em alguns segundos.') {
  try { return await fn(); } catch (e) { console.error(e); toast(fail, 'bad'); return undefined; }
}

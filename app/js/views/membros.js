/* Membros (Figma: App / Membros). Busca por nome, competência e "posso ajudar com". */
import { html, raw, $, avatar, badge, tag, empty } from '../ui.js';
import { PERFIS, norm } from '../logic.js';
import { ph, load } from './_common.js';

export const title = 'Membros';
const f = { q: '', perfil: '', city: '', interest: '' };

export async function render({ me }) {
  const { profiles } = await load('profiles');
  const all = profiles.filter(p => p.onboarded && p.id !== me.id);
  const cities = [...new Set(all.map(p => p.city).filter(Boolean))].sort();
  const interests = [...new Set(all.map(p => p.interest).filter(Boolean))].sort();
  const q = norm(f.q);
  const list = all.filter(p => (!f.perfil || (f.perfil === 'Mentores' ? p.mentor : f.perfil === 'Embaixadores' ? p.ambassador : (p.perfis || []).includes(f.perfil)))
    && (!f.city || p.city === f.city) && (!f.interest || p.interest === f.interest)
    && (!q || norm([p.name, p.org, p.area, p.offering, p.seeking, (p.skills || []).join(' '), p.business].join(' ')).includes(q)))
    .sort((a, b) => a.name.localeCompare(b.name));
  const sel = (id, label, opts, val) => html`<div class="field"><label for="${id}">${label}</label><select id="${id}" data-f="${id}"><option value="">Todos</option>${opts.map(o => html`<option ${val === o ? raw('selected') : ''}>${o}</option>`)}</select></div>`;
  return html`${ph('Membros', 'Encontre pessoas por perfil, cidade, interesse e pelo que elas oferecem.')}
<div class="grid" style="grid-template-columns:minmax(0,2fr) repeat(2,minmax(0,1fr));gap:12px;align-items:end">
  <div class="field"><label for="q">Buscar</label><input id="q" type="search" value="${f.q}" placeholder="Nome, competência ou “posso ajudar com…”"></div>
  ${sel('city', 'Cidade', cities, f.city)}${sel('interest', 'Interesse', interests, f.interest)}
</div>
<div class="chips-row" role="group" aria-label="Filtrar por perfil">${['', ...PERFIS, 'Mentores', 'Embaixadores'].map(p => html`<button type="button" class="tag" data-perfil="${p}" aria-pressed="${f.perfil === p}">${p || 'Todos'}</button>`)}</div>
<p class="small muted" aria-live="polite">${list.length} ${list.length === 1 ? 'pessoa' : 'pessoas'}</p>
${list.length ? html`<div class="grid g3">${list.map(p => html`<article class="panel">
  <div class="person">${avatar(p.name)}<div class="who"><b>${p.name}</b><span class="small muted">${[p.city, p.org].filter(Boolean).join(' · ')}</span></div></div>
  <div class="chips-row">${(p.perfis || []).map(x => badge(x))}${p.ambassador ? badge('Embaixador', 'duna') : ''}${p.mentor ? badge('Mentor', 'lagoa') : ''}</div>
  <div><p class="eyebrow">Posso ajudar com</p><p class="small">${p.offering || '—'}</p></div>
  <div><p class="eyebrow" style="color:var(--azulejo)">Procuro</p><p class="small">${p.seeking || '—'}</p></div>
  <div class="chips-row">${(p.skills || []).slice(0, 4).map(tag)}</div>
  <a class="btn secondary small" href="#/membros/${p.id}">Ver perfil</a>
</article>`)}</div>` : empty('Ninguém encontrado', 'Tente outra palavra ou tire um filtro.')}`;
}

export function mount(root, ctx) {
  let t;
  $('#q', root).addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => { f.q = e.target.value; ctx.refresh().then(() => { const i = $('#q'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }); }, 250); });
  root.querySelectorAll('[data-f]').forEach(s => s.addEventListener('change', () => { f[s.dataset.f] = s.value; ctx.refresh(); }));
  root.querySelectorAll('[data-perfil]').forEach(b => b.addEventListener('click', () => { f.perfil = b.dataset.perfil; ctx.refresh(); }));
}

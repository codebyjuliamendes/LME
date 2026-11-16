/* Coordenação / Embaixadores (Figma: Coordenação / Embaixadores). Representantes por universidade. */
import { db } from '../store.js';
import { html, raw, avatar, badge, toast, guard, dialog, confirmDlg, empty } from '../ui.js';
import { UNIVERSITIES } from '../logic.js';
import { ph, load } from './_common.js';

export const title = 'Embaixadores';

export async function render() {
  const d = await load('profiles', 'partners');
  const members = d.profiles.filter(p => p.onboarded);
  const amb = members.filter(p => p.ambassador);
  const inst = name => members.filter(p => (p.org || '').toUpperCase().includes(name.toUpperCase())).length;
  const partnerOf = u => d.partners.find(p => p.name.toUpperCase() === u.toUpperCase());
  return html`${ph('Embaixadores', 'Membros que representam a Liga dentro das universidades e cidades.', html`<button class="btn primary" id="add">Nomear embaixador</button>`)}
<div class="table-wrap"><table><thead><tr><th>Universidade</th><th>Membros</th><th>Parceria</th><th>Embaixadores</th></tr></thead><tbody>
${UNIVERSITIES.map(u => { const a = amb.filter(p => p.ambassador.toUpperCase().includes(u.toUpperCase())); const pt = partnerOf(u); return html`<tr><td><b>${u}</b></td><td>${inst(u)}</td><td>${pt ? badge(pt.stage, pt.stage === 'Ativo' ? 'lagoa' : 'duna') : html`<span class="small muted">—</span>`}</td>
<td>${a.length ? html`<div class="list">${a.map(p => html`<div class="person">${avatar(p.name)}<span class="who"><b>${p.name}</b><span class="small muted">${p.ambassador}</span></span><button class="btn secondary small" data-rm="${p.id}">Remover</button></div>`)}</div>` : html`<span class="small" style="color:var(--azulejo)">Sem embaixador</span>`}</td></tr>`; })}
</tbody></table></div>
${amb.filter(p => !UNIVERSITIES.some(u => p.ambassador.toUpperCase().includes(u.toUpperCase()))).map(p => html`<div class="panel person">${avatar(p.name)}<span class="who"><b>${p.name}</b><span class="small muted">${p.ambassador}</span></span><button class="btn secondary small" data-rm="${p.id}">Remover</button></div>`)}
${amb.length ? '' : empty('Nenhum embaixador ainda', 'Nomeie membros ativos para representar a Liga em cada universidade.')}`;
}

export function mount(root, ctx) {
  root.querySelector('#add').addEventListener('click', () => guard(async () => {
    const ps = (await db.list('profiles')).filter(p => p.onboarded && !p.ambassador).sort((a, b) => a.name.localeCompare(b.name));
    const r = await dialog('Nomear embaixador', html`<div class="field"><label for="am-p">Membro</label><select id="am-p" name="id" required>${ps.map(p => html`<option value="${p.id}">${p.name}${p.org ? ' · ' + p.org : ''}</option>`)}</select></div>
      <div class="field"><label for="am-u">Representa</label><input id="am-u" name="where" list="am-list" required placeholder="Ex.: UFMA ou Imperatriz"><datalist id="am-list">${UNIVERSITIES.map(u => html`<option value="${u}">`)}</datalist></div>`, { submit: 'Nomear' });
    if (r) { await db.update('profiles', r.id, { ambassador: 'LME ' + r.where.trim().replace(/^LME\s+/i, '') }); toast('Embaixador nomeado.'); ctx.refresh(); }
  }));
  root.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', async () => {
    if (await confirmDlg('Remover embaixador?', 'A pessoa continua membro da Liga.', 'Remover')) guard(async () => { await db.update('profiles', b.dataset.rm, { ambassador: '' }); ctx.refresh(); });
  }));
}

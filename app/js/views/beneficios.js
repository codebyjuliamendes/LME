/* Benefícios (Figma: App / Benefícios). Descontos de parceiros e registro da economia. */
import { db } from '../store.js';
import { html, badge, toast, guard, money, empty, dialog } from '../ui.js';
import { ph, load, byId } from './_common.js';

export const title = 'Benefícios';
let cat = 'Todos';

export async function render({ me }) {
  const d = await load('benefits', 'benefit_uses');
  const mine = d.benefit_uses.filter(u => u.user_id === me.id);
  const savings = mine.reduce((s, u) => s + (+u.savings || 0), 0);
  const cats = ['Todos', ...new Set(d.benefits.map(b => b.category))];
  const list = cat === 'Todos' ? d.benefits : d.benefits.filter(b => b.category === cat);
  const used = new Set(mine.map(u => u.benefit_id));
  const b = byId(d.benefits);
  return html`${ph('Benefícios', 'Descontos e serviços de parceiros para membros da Liga.', html`<span class="kpi"><b>${money(savings)}</b><span>economizados por você</span></span>`)}
<div class="chips-row" role="group" aria-label="Categoria">${cats.map(c => html`<button class="tag" data-c="${c}" aria-pressed="${cat === c}">${c}</button>`)}</div>
${list.length ? html`<div class="grid g3">${list.map(x => html`<article class="panel" style="gap:10px">
  <div class="panel-head">${badge(x.category, 'duna')}${used.has(x.id) ? badge('Você já usou', 'lagoa') : ''}</div>
  <h2 class="h4">${x.offer}</h2><p class="small muted">${x.description}</p><p class="small">${x.partner}</p>
  <div class="row"><button class="btn primary small" data-use="${x.id}">Usar benefício</button><button class="btn secondary small" data-log="${x.id}">Registrar economia</button></div>
</article>`)}</div>` : empty('Nenhum benefício nesta categoria', 'Novos parceiros entram todo mês.')}
${mine.length ? html`<section class="panel"><h2 class="h4">Seu histórico</h2><div class="list">${mine.map(u => html`<div class="panel-head"><span>${(b.get(u.benefit_id) || {}).offer || 'Benefício'}</span><b>${money(u.savings)}</b></div>`)}</div></section>` : ''}`;
}

export function mount(root, ctx) {
  root.querySelectorAll('[data-c]').forEach(x => x.addEventListener('click', () => { cat = x.dataset.c; ctx.refresh(); }));
  root.querySelectorAll('[data-use]').forEach(x => x.addEventListener('click', async () => {
    const b = await db.get('benefits', x.dataset.use);
    await dialog(b.offer, html`<p><b>${b.partner}</b></p><p>${b.description}</p><div class="panel soft-lagoa"><p class="eyebrow">Como usar</p><p>${b.how}</p></div><p class="help">Depois de usar, registre quanto economizou. Isso ajuda a Liga a mostrar o valor da rede para novos parceiros.</p>`, { submit: 'Entendi' });
  }));
  root.querySelectorAll('[data-log]').forEach(x => x.addEventListener('click', async () => {
    const r = await dialog('Registrar economia', html`<div class="field"><label for="sv">Quanto você economizou, em reais</label><input id="sv" name="savings" type="number" min="1" step="1" required></div>`, { submit: 'Registrar' });
    if (r) guard(async () => { await db.insert('benefit_uses', { benefit_id: x.dataset.log, user_id: ctx.me.id, savings: +r.savings }); toast('Economia registrada.'); ctx.refresh(); });
  }));
}

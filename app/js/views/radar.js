/* Radar de oportunidades (Figma: App / Radar). Editais, bolsas, hackathons, vagas e desafios. */
import { db } from '../store.js';
import { html, badge, toast, guard, daysUntil, fmtDate, empty, dialog } from '../ui.js';
import { ph, load } from './_common.js';

export const title = 'Radar';
export const OPP_TYPES = ['Edital', 'Bolsa', 'Hackathon', 'Aceleração', 'Inovação aberta', 'Vaga', 'Prêmio'];
let filter = 'Todas';

export const deadline = d => { const n = daysUntil(d); return n < 0 ? 'Encerrado' : n === 0 ? 'Fecha hoje' : n === 1 ? 'Fecha amanhã' : `Fecha em ${n} dias`; };

export async function render({ me }) {
  const d = await load('opportunities', 'saved_opps');
  const saved = new Set(d.saved_opps.filter(s => s.user_id === me.id).map(s => s.opp_id));
  let list = d.opportunities.filter(o => daysUntil(o.deadline) >= 0);
  if (filter === 'Salvas') list = d.opportunities.filter(o => saved.has(o.id));
  else if (filter !== 'Todas') list = list.filter(o => o.type === filter);
  list.sort((a, b) => a.deadline.localeCompare(b.deadline));
  const types = ['Todas', ...OPP_TYPES.filter(t => d.opportunities.some(o => o.type === t)), 'Salvas'];
  return html`${ph('Radar de oportunidades', 'Editais, bolsas, hackathons, programas e vagas, com prazo à vista.', html`<button class="btn secondary" id="suggest">Indicar oportunidade</button>`)}
<div class="chips-row" role="group" aria-label="Filtrar por tipo">${types.map(t => html`<button class="tag" data-f="${t}" aria-pressed="${filter === t}">${t}${t === 'Salvas' ? ` (${saved.size})` : ''}</button>`)}</div>
${list.length ? html`<div class="grid g2">${list.map(o => { const n = daysUntil(o.deadline); return html`<article class="panel" style="gap:10px">
  <div class="panel-head">${badge(o.type, 'lagoa')}<b class="small" style="color:${n <= 7 ? 'var(--azulejo)' : 'var(--muted)'}">${deadline(o.deadline)}</b></div>
  <h2 class="h4">${o.title}</h2><p class="small muted">${o.description}</p>
  <p class="small">Para: <b>${o.audience}</b> · Prazo: ${fmtDate(o.deadline + 'T12:00:00')}</p>
  <div class="row">${saved.has(o.id) ? html`<button class="btn secondary small" data-unsave="${o.id}" aria-pressed="true">Salva ✓</button>` : html`<button class="btn primary small" data-save="${o.id}">Salvar</button>`}${o.url ? html`<a class="btn secondary small" href="${o.url}" target="_blank" rel="noopener">Ver edital</a>` : ''}</div>
</article>`; })}</div>` : empty(filter === 'Salvas' ? 'Nenhuma oportunidade salva' : 'Nenhuma oportunidade aberta', filter === 'Salvas' ? 'Salve as que interessam para acompanhar o prazo.' : 'A coordenação atualiza o Radar toda semana.')}`;
}

export function mount(root, ctx) {
  const me = ctx.me;
  root.querySelectorAll('[data-f]').forEach(b => b.addEventListener('click', () => { filter = b.dataset.f; ctx.refresh(); }));
  root.querySelectorAll('[data-save]').forEach(b => b.addEventListener('click', () => guard(async () => { await db.insert('saved_opps', { id: b.dataset.save + ':' + me.id, opp_id: b.dataset.save, user_id: me.id }); toast('Salva. Ela aparece em Salvas.'); ctx.refresh(); })));
  root.querySelectorAll('[data-unsave]').forEach(b => b.addEventListener('click', () => guard(async () => { await db.remove('saved_opps', b.dataset.unsave + ':' + me.id); ctx.refresh(); })));
  root.querySelector('#suggest').addEventListener('click', async () => {
    const r = await dialog('Indicar oportunidade', html`<div class="field"><label for="s-title">Nome</label><input id="s-title" name="title" required></div><div class="field"><label for="s-url">Link</label><input id="s-url" name="url" type="url" placeholder="https://"></div><div class="field"><label for="s-text">Por que vale a pena</label><textarea id="s-text" name="text"></textarea></div>`, { submit: 'Enviar indicação' });
    if (r) guard(async () => {
      await db.insert('suggestions', { author_id: me.id, title: r.title.trim(), url: (r.url || '').trim(), text: (r.text || '').trim(), status: 'nova' });
      toast('Obrigado. A coordenação revisa e publica no Radar.');
    });
  });
}

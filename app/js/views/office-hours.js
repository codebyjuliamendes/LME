/* Office Hours (Figma: App / Office Hours). Conversas de 30 minutos com especialistas. */
import { db } from '../store.js';
import { html, avatar, badge, toast, guard, fmtDay, fmtTime, empty, dialog, confirmDlg } from '../ui.js';
import { ph, load, byId } from './_common.js';

export const title = 'Office Hours';
let area = 'Todas';

export async function render({ me }) {
  const d = await load('experts', 'slots');
  const now = Date.now();
  const ex = byId(d.experts);
  const areas = ['Todas', ...new Set(d.experts.map(x => x.area))];
  const experts = area === 'Todas' ? d.experts : d.experts.filter(x => x.area === area);
  const mine = d.slots.filter(s => s.booked_by === me.id && new Date(s.starts_at) > now).sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const free = id => d.slots.filter(s => s.expert_id === id && !s.booked_by && new Date(s.starts_at) > now).sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  return html`${ph('Office Hours', 'Conversas de 30 minutos com especialistas: jurídico, finanças, vendas e inovação.')}
${mine.length ? html`<section class="panel soft-lagoa"><h2 class="h4">Suas conversas marcadas</h2><div class="list">${mine.map(s => { const x = ex.get(s.expert_id) || {}; return html`<div class="panel-head"><span><b>${x.name}</b> · ${fmtDay(s.starts_at)}, ${fmtTime(s.starts_at)}<span class="small muted" style="display:block">${s.topic}</span></span><button class="btn secondary small" data-cancel="${s.id}">Cancelar</button></div>`; })}</div></section>` : ''}
<div class="chips-row" role="group" aria-label="Área">${areas.map(a => html`<button class="tag" data-a="${a}" aria-pressed="${area === a}">${a}</button>`)}</div>
<div class="grid g2">${experts.map(x => { const fs = free(x.id); return html`<article class="panel" style="gap:12px">
  <div class="person">${avatar(x.name, 'lg')}<span class="who"><b class="h4">${x.name}</b><span class="small muted">${x.role}</span></span>${badge(x.area, 'duna')}</div>
  <p class="small">${x.topics}</p>
  ${fs.length ? html`<div class="chips-row">${fs.map(s => html`<button class="slot" data-slot="${s.id}">${fmtDay(s.starts_at).split(',')[0]} ${new Date(s.starts_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Fortaleza' })} · ${fmtTime(s.starts_at)}</button>`)}</div>` : html`<p class="small muted">Sem horários livres esta semana.</p>`}
</article>`; })}</div>
${experts.length ? '' : empty('Nenhum especialista nesta área', 'Escolha outra área.')}`;
}

export function mount(root, ctx) {
  root.querySelectorAll('[data-a]').forEach(b => b.addEventListener('click', () => { area = b.dataset.a; ctx.refresh(); }));
  root.querySelectorAll('[data-slot]').forEach(b => b.addEventListener('click', async () => {
    const s = await db.get('slots', b.dataset.slot), x = await db.get('experts', s.expert_id);
    const r = await dialog(`Conversa com ${x.name}`, html`<p>${fmtDay(s.starts_at)}, ${fmtTime(s.starts_at)} · 30 minutos, online.</p><div class="field"><label for="topic">Sobre o que você quer conversar?</label><textarea id="topic" name="topic" required placeholder="Ex.: dúvida sobre acordo de sócios antes de assinar"></textarea></div><p class="help">Escreva a dúvida com contexto. Assim a conversa rende mais.</p>`, { submit: 'Marcar conversa' });
    if (r) guard(async () => {
      const fresh = await db.get('slots', s.id);
      if (fresh.booked_by) { toast('Alguém marcou esse horário antes. Escolha outro.', 'bad'); return ctx.refresh(); }
      await db.update('slots', s.id, { booked_by: ctx.me.id, topic: r.topic.trim() }); toast('Conversa marcada. O link chega por e-mail.'); ctx.refresh();
    });
  }));
  root.querySelectorAll('[data-cancel]').forEach(b => b.addEventListener('click', async () => {
    if (await confirmDlg('Cancelar conversa?', 'O horário fica livre para outra pessoa.', 'Cancelar conversa')) guard(async () => { await db.update('slots', b.dataset.cancel, { booked_by: '', topic: '' }); toast('Conversa cancelada.'); ctx.refresh(); });
  }));
}

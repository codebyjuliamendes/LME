/* LME Founder School (Figma: App / Founder School). Trilha de 8 módulos com tarefa prática. */
import { db } from '../store.js';
import { html, toast, guard, fmtDate } from '../ui.js';
import { MODULES } from '../logic.js';
import { ph, load } from './_common.js';

export const title = 'Founder School';

export async function render({ me }) {
  const d = await load('progress');
  const mine = d.progress.filter(p => p.user_id === me.id && p.done);
  const done = new Set(mine.map(p => p.module));
  const n = done.size, pct = Math.round(n / MODULES.length * 100);
  const next = MODULES.find(m => !done.has(m.id));
  const last = mine.map(p => p.created_at).sort().pop();
  return html`${ph('LME Founder School', 'Trilha de 8 módulos para sair da ideia e chegar às primeiras vendas. Cada módulo tem uma tarefa prática.')}
<section class="panel ${n === MODULES.length ? 'night' : ''}" style="gap:10px">
  <div class="panel-head"><b>${n} de ${MODULES.length} módulos</b><span class="small muted">${pct}%</span></div>
  <div class="progress" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Progresso na trilha">${MODULES.map(m => html`<i class="${done.has(m.id) ? 'on' : ''}"></i>`)}</div>
  ${n === MODULES.length ? html`<p class="h3">Trilha concluída 🎉</p><p class="muted">Concluída em ${fmtDate(last)}. Seu certificado está pronto.</p><div><button class="btn on-night" id="cert">Baixar certificado</button></div>` : next ? html`<p class="small">Próximo: <b>${next.title}</b></p>` : ''}
</section>
<div class="grid" style="gap:12px">${MODULES.map((m, i) => { const ok = done.has(m.id); return html`<article class="panel mod" style="grid-template-columns:auto minmax(0,1fr) auto;align-items:start;gap:16px">
  <b class="h3" style="color:${ok ? 'var(--lagoa)' : 'var(--azulejo)'};min-width:32px">${ok ? '✓' : i + 1}</b>
  <div style="display:grid;gap:4px"><b class="h4">${m.title}</b><span class="small muted">${m.text}</span><span class="small"><b>Tarefa:</b> ${m.task}</span></div>
  <button class="btn ${ok ? 'secondary' : 'primary'} small" data-m="${m.id}" aria-pressed="${ok}">${ok ? 'Concluído' : 'Marcar como feito'}</button>
</article>`; })}</div>`;
}

function certificate(name, date) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="#FBF6EC"/><rect x="30" y="30" width="1140" height="740" fill="none" stroke="#1F4FA3" stroke-width="4"/><text x="600" y="190" text-anchor="middle" font-family="Georgia,serif" font-size="28" fill="#1F4FA3" letter-spacing="6">LIGA MARANHENSE DE EMPREENDEDORISMO</text><text x="600" y="300" text-anchor="middle" font-family="Georgia,serif" font-size="56" fill="#14213D">Certificado</text><text x="600" y="380" text-anchor="middle" font-family="Arial,sans-serif" font-size="24" fill="#5B6475">Certificamos que</text><text x="600" y="460" text-anchor="middle" font-family="Georgia,serif" font-size="52" fill="#14213D">${name.replace(/[<&>]/g, '')}</text><text x="600" y="540" text-anchor="middle" font-family="Arial,sans-serif" font-size="24" fill="#5B6475">concluiu a trilha LME Founder School, com 8 módulos e tarefas práticas.</text><text x="600" y="660" text-anchor="middle" font-family="Arial,sans-serif" font-size="20" fill="#5B6475">${date}</text></svg>`;
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  a.download = 'certificado-founder-school.svg'; document.body.append(a); a.click(); a.remove();
}

export function mount(root, ctx) {
  const me = ctx.me;
  root.querySelectorAll('[data-m]').forEach(b => b.addEventListener('click', () => guard(async () => {
    const id = me.id + ':' + b.dataset.m, cur = await db.get('progress', id);
    if (cur) await db.update('progress', id, { done: !cur.done });
    else await db.insert('progress', { id, user_id: me.id, module: b.dataset.m, done: true });
    if (!cur) toast('Módulo concluído.');
    ctx.refresh();
  })));
  const c = root.querySelector('#cert');
  if (c) c.addEventListener('click', () => certificate(me.name, new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })));
}

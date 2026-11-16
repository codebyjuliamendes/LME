/* Coordenação / Parcerias (Figma: Coordenação / Parcerias, kanban). Arrastar e soltar entre etapas. */
import { db } from '../store.js';
import { html, raw, badge, toast, guard, dialog, confirmDlg } from '../ui.js';
import { PARTNER_STAGES, PARTNER_KINDS } from '../logic.js';
import { ph, load, fields } from './_common.js';

export const title = 'Parcerias';
const SPEC = [
  { k: 'name', label: 'Organização', required: true },
  { k: 'kind', label: 'Tipo de parceria', type: 'select', options: PARTNER_KINDS },
  { k: 'stage', label: 'Etapa', type: 'select', options: PARTNER_STAGES },
  { k: 'contact', label: 'Contato' },
  { k: 'notes', label: 'Anotações', type: 'textarea' }
];

export async function render() {
  const { partners } = await load('partners');
  return html`${ph('Parcerias', 'Empresas, universidades e instituições, da primeira conversa ao acordo ativo.', html`<button class="btn primary" id="add">Nova parceria</button>`)}
<p class="small muted">Arraste os cartões entre as colunas ou use o seletor de etapa em cada cartão.</p>
<div class="kanban">${PARTNER_STAGES.map(s => { const list = partners.filter(p => p.stage === s); return html`<section class="lane" data-stage="${s}" aria-label="${s}">
  <div class="panel-head"><b>${s}</b>${badge(String(list.length))}</div>
  ${list.map(p => html`<article class="kcard" draggable="true" data-id="${p.id}">
    <div class="panel-head"><b>${p.name}</b><button class="icon-btn" data-edit="${p.id}" aria-label="Editar ${p.name}">✎</button></div>
    ${badge(p.kind, s === 'Ativo' ? 'lagoa' : 'duna')}
    ${p.notes ? html`<span class="small muted">${p.notes}</span>` : ''}
    <label class="sr-only" for="st-${p.id}">Etapa de ${p.name}</label><select id="st-${p.id}" data-move="${p.id}" class="small">${PARTNER_STAGES.map(x => html`<option ${x === s ? raw('selected') : ''}>${x}</option>`)}</select>
  </article>`)}
</section>`; })}</div>`;
}

export function mount(root, ctx) {
  const move = (id, stage) => guard(async () => { await db.update('partners', id, { stage }); if (stage === 'Ativo') toast('Parceria ativa.'); ctx.refresh(); });
  root.querySelectorAll('.kcard').forEach(c => c.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', c.dataset.id); e.dataTransfer.effectAllowed = 'move'; }));
  root.querySelectorAll('.lane').forEach(l => {
    l.addEventListener('dragover', e => { e.preventDefault(); l.classList.add('drop'); });
    l.addEventListener('dragleave', () => l.classList.remove('drop'));
    l.addEventListener('drop', e => { e.preventDefault(); l.classList.remove('drop'); const id = e.dataTransfer.getData('text/plain'); if (id) move(id, l.dataset.stage); });
  });
  root.querySelectorAll('[data-move]').forEach(s => s.addEventListener('change', () => move(s.dataset.move, s.value)));
  const edit = async p => {
    const r = await dialog(p ? 'Editar parceria' : 'Nova parceria', html`${fields(SPEC, p || { stage: PARTNER_STAGES[0] })}${p ? html`<button type="button" class="btn danger small" id="del">Excluir parceria</button>` : ''}`, { submit: 'Salvar' });
    if (r) guard(async () => { p ? await db.update('partners', p.id, r) : await db.insert('partners', r); toast('Parceria salva.'); ctx.refresh(); });
  };
  root.querySelector('#add').addEventListener('click', () => edit(null));
  root.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', async () => {
    const p = await db.get('partners', b.dataset.edit);
    const wait = edit(p);
    const del = document.querySelector('dialog #del');
    if (del) del.addEventListener('click', async () => {
      del.closest('dialog').querySelector('button[value=cancel]').click();
      await wait;
      if (await confirmDlg('Excluir parceria?', `${p.name} sai do funil.`, 'Excluir', true)) guard(async () => { await db.remove('partners', p.id); ctx.refresh(); });
    });
  }));
}

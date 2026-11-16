/* Coordenação / Benefícios (Figma: Coordenação / Benefícios). */
import { db } from '../store.js';
import { html, badge, toast, guard, dialog, confirmDlg, money, empty } from '../ui.js';
import { ph, load, fields } from './_common.js';

export const title = 'Benefícios';
const SPEC = [
  { k: 'offer', label: 'Oferta', required: true, help: 'Ex.: 20% no plano mensal' },
  { k: 'category', label: 'Categoria', required: true },
  { k: 'partner', label: 'Parceiro', required: true },
  { k: 'description', label: 'Descrição', type: 'textarea' },
  { k: 'how', label: 'Como usar', type: 'textarea', required: true }
];

export async function render() {
  const d = await load('benefits', 'benefit_uses');
  const stat = id => { const u = d.benefit_uses.filter(x => x.benefit_id === id); return { n: u.length, s: u.reduce((a, x) => a + (+x.savings || 0), 0) }; };
  const total = d.benefit_uses.reduce((a, x) => a + (+x.savings || 0), 0);
  return html`${ph('Benefícios', 'Ofertas de parceiros e quanto os membros já economizaram com elas.', html`<button class="btn primary" id="add">Novo benefício</button>`)}
<div class="grid g3"><div class="panel kpi"><b>${d.benefits.length}</b><span>benefícios ativos</span></div><div class="panel kpi"><b>${d.benefit_uses.length}</b><span>usos registrados</span></div><div class="panel kpi"><b>${money(total)}</b><span>economizados pelos membros</span></div></div>
${d.benefits.length ? html`<div class="table-wrap"><table><thead><tr><th>Oferta</th><th>Parceiro</th><th>Usos</th><th>Economia</th><th></th></tr></thead><tbody>
${d.benefits.map(b => { const s = stat(b.id); return html`<tr><td><b>${b.offer}</b><div>${badge(b.category, 'duna')}</div></td><td>${b.partner}</td><td>${s.n}</td><td>${money(s.s)}</td>
<td><div class="row" style="gap:6px;flex-wrap:nowrap"><button class="icon-btn" data-edit="${b.id}" aria-label="Editar ${b.offer}">✎</button><button class="icon-btn" data-del="${b.id}" aria-label="Excluir ${b.offer}">🗑</button></div></td></tr>`; })}
</tbody></table></div>` : empty('Nenhum benefício', 'Cadastre a primeira oferta de parceiro.')}`;
}

export function mount(root, ctx) {
  const edit = async b => {
    const r = await dialog(b ? 'Editar benefício' : 'Novo benefício', fields(SPEC, b || {}), { submit: 'Salvar' });
    if (r) guard(async () => { b ? await db.update('benefits', b.id, r) : await db.insert('benefits', r); toast('Benefício salvo.'); ctx.refresh(); });
  };
  root.querySelector('#add').addEventListener('click', () => edit(null));
  root.querySelectorAll('[data-edit]').forEach(x => x.addEventListener('click', async () => edit(await db.get('benefits', x.dataset.edit))));
  root.querySelectorAll('[data-del]').forEach(x => x.addEventListener('click', async () => {
    if (await confirmDlg('Excluir benefício?', 'O histórico de economia dos membros continua contando nos indicadores.', 'Excluir', true)) guard(async () => { await db.remove('benefits', x.dataset.del); ctx.refresh(); });
  }));
}

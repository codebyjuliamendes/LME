/* Coordenação / Pesquisa anual (Figma: Coordenação / Pesquisa). Pesquisa sobre o empreendedorismo jovem no Maranhão. */
import { db } from '../store.js';
import { html, raw, toast, guard, fmtDate } from '../ui.js';
import { indicators } from '../logic.js';
import { ph, load } from './_common.js';

export const title = 'Pesquisa anual';
const STATUS = ['Questionário em preparação', 'Coleta aberta', 'Análise dos dados', 'Relatório publicado'];
const THEMES = ['Perfil de quem empreende: idade, cidade, formação', 'Principais dificuldades: crédito, mercado, gestão, formalização', 'Acesso a programas, editais e capacitação', 'Inovação dentro de empresas e órgãos públicos', 'Relação entre universidades e mercado', 'O que a Liga deve priorizar no próximo ano'];

export async function render() {
  const d = await load('settings', 'profiles', 'rsvps', 'posts', 'replies', 'connection_requests', 'connections', 'benefit_uses', 'impact', 'partners', 'saved_opps', 'circle_members');
  const s = d.settings.find(x => x.id === 'pesquisa') || { id: 'pesquisa', edition: String(new Date().getFullYear() + 1), status: STATUS[0], survey_url: '' };
  const k = indicators(d);
  const step = STATUS.indexOf(s.status);
  return html`${ph('Pesquisa anual', 'Retrato do empreendedorismo jovem no Maranhão, feito com os membros da Liga e a rede de parceiros.')}
<div class="cols">
  <form class="form" id="f">
    <fieldset><legend>Edição ${s.edition}</legend>
      <div class="two"><div class="field"><label for="edition">Ano da edição</label><input id="edition" name="edition" value="${s.edition}" required inputmode="numeric"></div>
      <div class="field"><label for="status">Etapa</label><select id="status" name="status">${STATUS.map(x => html`<option ${x === s.status ? raw('selected') : ''}>${x}</option>`)}</select></div></div>
      <div class="field"><label for="url">Link do questionário</label><input id="url" name="survey_url" type="url" value="${s.survey_url || ''}" placeholder="https://forms.gle/…"><p class="help">Quando a etapa for "Coleta aberta", o link aparece para os membros na tela inicial.</p></div>
    </fieldset>
    <div class="row"><button class="btn primary" type="submit">Salvar</button>${s.updated_at ? html`<span class="small muted">Atualizado em ${fmtDate(s.updated_at)}</span>` : ''}</div>
  </form>
  <div class="grid" style="gap:20px">
    <section class="panel"><h2 class="h4">Etapas</h2><ol style="margin:0;padding-left:18px;display:grid;gap:6px">${STATUS.map((x, i) => html`<li style="${i > step ? 'opacity:.5' : ''}">${i < step ? '✓ ' : ''}${i === step ? html`<b>${x}</b>` : x}</li>`)}</ol></section>
    <section class="panel soft-lagoa"><p class="eyebrow">Público possível hoje</p><p class="kpi"><b>${k.members}</b><span>membros em ${k.cities.length} ${k.cities.length === 1 ? 'cidade' : 'cidades'} e ${k.universities} universidades</span></p></section>
  </div>
</div>
<section class="panel"><h2 class="h4">Temas da pesquisa</h2><ul style="margin:0;padding-left:18px;display:grid;gap:6px;list-style:disc">${THEMES.map(t => html`<li>${t}</li>`)}</ul></section>`;
}

export function mount(root, ctx) {
  const f = root.querySelector('#f');
  f.addEventListener('submit', e => {
    e.preventDefault();
    if (!f.checkValidity()) { f.reportValidity(); return; }
    const r = Object.fromEntries(new FormData(f));
    guard(async () => {
      const row = { ...r, updated_at: new Date().toISOString() };
      (await db.get('settings', 'pesquisa')) ? await db.update('settings', 'pesquisa', row) : await db.insert('settings', { id: 'pesquisa', ...row });
      toast('Pesquisa atualizada.'); ctx.refresh();
    });
  });
}

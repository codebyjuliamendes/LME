/* Coordenação / Indicadores (Figma: Coordenação / Indicadores). */
import { html, money } from '../ui.js';
import { indicators, toCsv } from '../logic.js';
import { ph, load, download } from './_common.js';

export const title = 'Indicadores';
const TABLES = ['profiles', 'rsvps', 'posts', 'replies', 'connection_requests', 'connections', 'benefit_uses', 'impact', 'partners', 'saved_opps', 'circle_members'];
let last = null;

export async function render() {
  const d = await load(...TABLES);
  const k = last = indicators(d);
  const max = Math.max(1, ...Object.values(k.byProfile));
  const cmax = Math.max(1, ...k.cities.map(c => c[1]));
  const kpi = (n, l) => html`<div class="panel kpi"><b>${n}</b><span>${l}</span></div>`;
  return html`${ph('Indicadores', 'Como a Liga está indo: crescimento, atividade, conexões e valor gerado.', html`<button class="btn secondary" id="export">Exportar CSV</button>`)}
<div class="grid g4">
  ${kpi(k.members, 'membros cadastrados')}
  ${kpi(k.activeRate + '%', `ativos nos últimos 30 dias (${k.active})`)}
  ${kpi(k.retention + '%', 'participaram mais de uma vez')}
  ${kpi(k.connections, `conexões feitas (${k.connectionsFromRequests} pela curadoria)`)}
</div>
${k.pendingRequests ? html`<a class="panel soft-azul" href="#/coordenacao/membros" style="text-decoration:none;color:inherit"><b>${k.pendingRequests} ${k.pendingRequests === 1 ? 'pedido de conexão espera' : 'pedidos de conexão esperam'} curadoria →</b></a>` : ''}
<div class="cols">
  <section class="panel"><h2 class="h4">Membros por perfil</h2>
    ${Object.entries(k.byProfile).map(([p, n]) => html`<div style="display:grid;gap:6px"><div class="panel-head"><span>${p}</span><b>${n}</b></div><div class="bar-track"><i style="width:${Math.round(n / max * 100)}%"></i></div></div>`)}
  </section>
  <section class="panel night"><p class="eyebrow" style="color:var(--duna)">Valor gerado pela rede</p>
    <p class="kpi"><b style="color:#fff">${money(k.value.total)}</b><span>${money(k.value.savings)} em benefícios + ${money(k.value.impact)} em bolsas, prêmios, contratos e investimentos</span></p>
    <p class="small muted">${k.benefitsUsed} usos de benefícios · ${k.value.contracts} contratos registrados</p>
  </section>
</div>
<div class="grid g4">
  ${kpi(k.businesses, 'negócios de membros')}
  ${kpi(k.intraProjects, 'projetos de intraempreendedorismo')}
  ${kpi(k.partnersActive, 'parceiros ativos')}
  ${kpi(k.universities, 'universidades representadas')}
</div>
<div class="cols">
  <section class="panel"><h2 class="h4">Cidades</h2>
    ${k.cities.map(([c, n]) => html`<div style="display:grid;gap:6px"><div class="panel-head"><span>${c}</span><b>${n}</b></div><div class="bar-track"><i style="width:${Math.round(n / cmax * 100)}%"></i></div></div>`)}
  </section>
  <section class="panel"><h2 class="h4">Engajamento</h2>
    <div class="panel-head"><span>Presenças confirmadas</span><b>${k.rsvps}</b></div>
    <div class="panel-head"><span>Oportunidades salvas no Radar</span><b>${k.oppsSaved}</b></div>
    <div class="panel-head"><span>Benefícios usados</span><b>${k.benefitsUsed}</b></div>
  </section>
</div>`;
}

export function mount(root) {
  root.querySelector('#export').addEventListener('click', () => {
    const k = last, rows = [
      ['Membros', k.members], ['Ativos 30 dias', k.active], ['Taxa de atividade (%)', k.activeRate], ['Retenção (%)', k.retention],
      ['Conexões', k.connections], ['Conexões pela curadoria', k.connectionsFromRequests], ['Pedidos em curadoria', k.pendingRequests],
      ...Object.entries(k.byProfile).map(([p, n]) => ['Perfil: ' + p, n]), ...k.cities.map(([c, n]) => ['Cidade: ' + c, n]),
      ['Negócios', k.businesses], ['Projetos de intraempreendedorismo', k.intraProjects], ['Parceiros ativos', k.partnersActive], ['Universidades', k.universities],
      ['Economia em benefícios (R$)', k.value.savings], ['Bolsas, prêmios e contratos (R$)', k.value.impact], ['Valor total (R$)', k.value.total]
    ].map(([a, b]) => ({ a, b }));
    download(`lme-indicadores-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows, [['a', 'Indicador'], ['b', 'Valor']]));
  });
}

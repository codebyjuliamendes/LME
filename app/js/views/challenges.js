/* LME Challenges (Figma: App / Challenges). Desafios reais de empresas parceiras. */
import { html, badge, fmtDate, empty } from '../ui.js';
import { ph, load } from './_common.js';

export const title = 'Challenges';
const TONE = { 'Inscrições abertas': 'lagoa', 'Em breve': 'duna', 'Encerrado': '' };
export const STEPS = [['Inscrição', 'Sozinho ou com time'], ['Formação de times', '3 a 5 pessoas, perfis diferentes'], ['Imersão', 'Conversas com a empresa'], ['Mentoria', 'Encontros semanais'], ['Demo Day', 'Apresentação para a banca']];

export async function render({ me }) {
  const d = await load('challenges', 'teams');
  const open = d.challenges.find(c => c.status === 'Inscrições abertas');
  const others = d.challenges.filter(c => c !== open);
  const myTeam = c => d.teams.find(t => t.challenge_id === c.id && (t.member_ids || []).includes(me.id));
  return html`${ph('LME Challenges', 'Empresas e instituições trazem um problema real. Times da Liga propõem soluções.')}
${open ? html`<section class="panel night" style="gap:16px;padding:32px">
  <div class="chips-row">${badge(open.status, 'lagoa')}${badge(open.org, 'duna')}</div>
  <h2 class="display-l" style="color:#fff">${open.title}</h2>
  <p class="muted">${open.format} · Inscrições até ${fmtDate(open.closes + 'T12:00:00')} · ${d.teams.filter(t => t.challenge_id === open.id).length} de ${open.team_slots} times${open.demo_day ? ` · Demo Day em ${open.demo_day}` : ''}</p>
  <div class="row"><a class="btn primary" href="#/challenges/${open.id}">${myTeam(open) ? 'Ver meu time' : 'Ver desafio e times'}</a></div>
</section>
<section class="grid g5" style="gap:12px">${STEPS.map(([s, t], i) => html`<div class="panel" style="gap:4px"><b style="color:var(--azulejo)">${i + 1}</b><b>${s}</b><span class="small muted">${t}</span></div>`)}</section>` : empty('Nenhum desafio aberto agora', 'Os próximos aparecem aqui quando as inscrições abrirem.')}
<h2 class="h3">Outros desafios</h2>
<div class="grid g2">${others.map(c => html`<a class="panel" href="#/challenges/${c.id}" style="gap:8px;text-decoration:none;color:inherit"><div class="chips-row">${badge(c.status, TONE[c.status])}</div><b class="h4">${c.title}</b><span class="small muted">${c.org} · ${c.format}</span></a>`)}</div>`;
}
export function mount() {}

/* Início (Figma: App / Início). */
import { db } from '../store.js';
import { html, avatar, badge, fmtTime, dayNum, monAbbr, daysUntil, toast, guard } from '../ui.js';
import { journey, suggestMatches, JOURNEY } from '../logic.js';
import { ph, load, byId, upcoming, confirmRsvp, RSVP_MSG } from './_common.js';

export const title = 'Início';

export async function render({ me }) {
  const d = await load('profiles', 'events', 'rsvps', 'posts', 'replies', 'connection_requests', 'connections', 'circles', 'circle_members', 'benefit_uses', 'saved_opps', 'teams', 'opportunities', 'benefits', 'settings');
  const survey = d.settings.find(x => x.id === 'pesquisa' && x.status === 'Coleta aberta' && x.survey_url);
  const j = journey(me, d);
  const people = byId(d.profiles);
  const sug = suggestMatches({ text: me.seeking, type: '' }, me, d.profiles, d.connections, 3);
  const evs = upcoming(d.events).slice(0, 3);
  const going = new Set(d.rsvps.filter(r => r.user_id === me.id).map(r => r.event_id));
  const myCircle = d.circle_members.find(m => m.user_id === me.id);
  const circle = myCircle && d.circles.find(c => c.id === myCircle.circle_id);
  const circleMembers = circle ? d.circle_members.filter(m => m.circle_id === circle.id).map(m => people.get(m.user_id)).filter(Boolean) : [];
  const radar = d.opportunities.filter(o => daysUntil(o.deadline) >= 0).sort((a, b) => a.deadline.localeCompare(b.deadline)).slice(0, 3);
  const benefit = d.benefits[0];
  const first = me.name.split(' ')[0];
  return html`${ph(`Bom te ver, ${first}`, 'Veja o que fazer nesta semana na comunidade.', html`<a class="btn primary" href="#/connect">Pedir uma conexão</a>`)}
${survey ? html`<section class="panel soft-azul" style="grid-template-columns:minmax(0,1fr) auto;align-items:center"><span><b>Pesquisa ${survey.edition} sobre o empreendedorismo jovem no Maranhão.</b> <span class="small muted">Leva uns 10 minutos e ajuda a Liga a decidir o que fazer no próximo ano.</span></span><a class="btn primary small" href="${survey.survey_url}" target="_blank" rel="noopener">Responder</a></section>` : ''}
<section class="panel night" aria-labelledby="jt">
  <div class="panel-head"><h2 class="h3" id="jt">Sua jornada na LME</h2><span class="h4" style="color:var(--duna)">${j.count} de 10 etapas</span></div>
  <div class="journey-bar" role="img" aria-label="${j.count} de 10 etapas concluídas">${j.done.map((x, i) => html`<i class="${x ? 'on' : ''}" title="${JOURNEY[i]}"></i>`)}</div>
  ${j.next ? html`<div class="row"><span class="muted">Próximo passo: ${j.next.action[0]}.</span><a class="btn sun small" href="${j.next.action[1]}">Fazer agora</a></div>` : html`<p class="muted">Você percorreu toda a jornada. Que tal ajudar quem está chegando?</p>`}
</section>
<div class="cols">
  <div class="grid" style="gap:24px">
    <section class="panel"><div class="panel-head"><h2 class="h3">Conexões sugeridas</h2><a class="h4" href="#/membros" style="color:var(--azulejo);text-decoration:none">Ver membros</a></div>
      ${sug.length ? html`<div class="list">${sug.map(s => html`<div class="person">${avatar(s.profile.name)}<div class="who"><b>${s.profile.name}</b><span class="small muted">${(s.profile.perfis || []).join(' · ')} · ${s.profile.city}</span><span class="small" style="color:var(--lagoa-text)">${s.reason}</span></div><a class="btn secondary small" href="#/membros/${s.profile.id}">Ver perfil</a></div>`)}</div>`
        : html`<p class="muted">Ainda não achamos alguém que ofereça o que você procura. Faça um pedido no LME Connect: a coordenação também procura fora do app.</p>`}
    </section>
    <section class="panel"><h2 class="h3">Próximos encontros</h2>
      <div class="list">${evs.map(e => html`<div class="person"><span class="date-chip"><b>${dayNum(e.starts_at)}</b><span>${monAbbr(e.starts_at)}</span></span><div class="who"><a href="#/agenda/${e.id}" style="text-decoration:none"><b>${e.title}</b></a><span class="small muted">${e.mode === 'Online' ? 'Online' : e.city} · ${fmtTime(e.starts_at)} · ${d.rsvps.filter(r => r.event_id === e.id).length} confirmados</span></div>${going.has(e.id) ? badge('Você vai', 'lagoa') : html`<button class="btn secondary small" data-rsvp="${e.id}">Confirmar</button>`}</div>`)}</div>
    </section>
  </div>
  <div class="grid" style="gap:24px">
    ${circle ? html`<section class="panel soft-lagoa"><p class="eyebrow">Seu Círculo</p><h2 class="h3">${circle.name}</h2><p class="small muted">${circleMembers.length} membros · próximo encontro ${dayNum(circle.next_meeting)}/${monAbbr(circle.next_meeting)} às ${fmtTime(circle.next_meeting)}</p><div class="avatars">${circleMembers.slice(0, 6).map(p => avatar(p.name))}</div><a class="btn secondary small" href="#/circulos">Abrir Círculo</a></section>`
      : html`<section class="panel soft-lagoa"><p class="eyebrow">Círculos LME</p><h2 class="h3">Você ainda não está em um Círculo</h2><p class="small muted">Grupos de 6 a 10 pessoas que se encontram para acompanhar metas.</p><a class="btn secondary small" href="#/circulos">Escolher um Círculo</a></section>`}
    <section class="panel"><h2 class="h3">Radar da semana</h2><div class="list">${radar.map(o => html`<div style="display:grid;gap:4px">${badge(o.type, 'duna')}<b>${o.title}</b><span class="small muted">${daysUntil(o.deadline) === 0 ? 'Fecha hoje' : `Fecha em ${daysUntil(o.deadline)} dias`}</span></div>`)}</div><a class="btn secondary small" href="#/radar">Ver o Radar</a></section>
    ${benefit ? html`<section class="panel"><p class="eyebrow">Benefício em destaque</p><b>${benefit.offer}</b><span class="small muted">${benefit.description}</span><a class="btn secondary small" href="#/beneficios">Ver benefícios</a></section>` : ''}
  </div>
</div>`;
}

export function mount(root, ctx) {
  root.querySelectorAll('[data-rsvp]').forEach(b => b.addEventListener('click', () => guard(async () => {
    const ev = await db.get('events', b.dataset.rsvp);
    const r = await confirmRsvp(ev, ctx.me);
    toast(RSVP_MSG[r], r === 'full' ? 'bad' : 'ok'); ctx.refresh();
  })));
}

/* Cadastro do Perfil LME em 4 passos (Figma: App / Cadastro). Também serve para completar um perfil já iniciado. */
import { db } from '../store.js';
import { html, raw, $, $$, toast, fmtDay, fmtTime } from '../ui.js';
import { PERFIS, INTERESTS } from '../logic.js';

export const title = 'Seu Perfil LME';
const STEPS = [['Sobre você', 'Nome, cidade e contato'], ['Seu momento', 'Perfis, interesses e projetos'], ['Conexões', 'O que procura e como ajuda'], ['Boas-vindas', 'Seu primeiro encontro']];
let step = 0, draft = null;

export async function render(ctx) {
  const existing = await db.get('profiles', ctx.session.id);
  if (!draft || draft.id !== ctx.session.id) { draft = Object.assign({ id: ctx.session.id, email: ctx.session.email, perfis: [], skills: [] }, existing || {}); step = 0; }
  const d = draft;
  const v = k => d[k] == null ? '' : d[k];
  let body = '';
  if (step === 0) body = html`<fieldset><legend class="sr-only">Sobre você</legend>
    <div class="field"><label for="name">Nome completo</label><input id="name" name="name" autocomplete="name" value="${v('name')}" required></div>
    <div class="two"><div class="field"><label for="age">Idade</label><input id="age" name="age" type="number" min="14" max="99" value="${v('age')}" required><p class="help">A LME prioriza estudantes e jovens de até 34 anos.</p></div>
    <div class="field"><label for="city">Cidade</label><input id="city" name="city" value="${v('city')}" autocomplete="address-level2" required></div></div>
    <div class="two"><div class="field"><label for="email">E-mail</label><input id="email" name="email" type="email" value="${v('email')}" required></div>
    <div class="field"><label for="whatsapp">WhatsApp <span class="opt">(opcional)</span></label><input id="whatsapp" name="whatsapp" type="tel" value="${v('whatsapp')}" placeholder="(98) 90000-0000"></div></div>
    <div class="two"><div class="field"><label for="org">Universidade, empresa ou organização</label><input id="org" name="org" value="${v('org')}" required></div>
    <div class="field"><label for="area">Curso ou área de atuação</label><input id="area" name="area" value="${v('area')}" required></div></div></fieldset>`;
  if (step === 1) body = html`<p class="help">Marque todos os perfis que combinam com você. Eles podem coexistir.</p>
    <div class="chips">${PERFIS.map((p, i) => html`<label class="chip"><input type="checkbox" name="perfis" value="${p}" ${d.perfis.includes(p) ? raw('checked') : ''}><span><b>${p}</b><span>${['Ainda sem ideia estruturada', 'Ideia, projeto ou negócio inicial', 'Já opera um negócio', 'Inova dentro de uma organização'][i]}</span></span></label>`)}</div>
    <p class="err" id="perfis-err" hidden>Escolha pelo menos um perfil.</p>
    <div class="two"><div class="field"><label for="interest">Área de interesse</label><select id="interest" name="interest" required><option value="">Escolha uma área</option>${INTERESTS.map(i => html`<option ${d.interest === i ? raw('selected') : ''}>${i}</option>`)}</select></div>
    <div class="field"><label for="skills">Competências</label><input id="skills" name="skills" value="${(d.skills || []).join(', ')}" placeholder="Ex.: vendas, design, programação" required><p class="help">Separe por vírgulas.</p></div></div>
    <div class="field"><label for="business">Negócio ou projeto <span class="opt">(se tiver)</span></label><input id="business" name="business" value="${v('business')}" placeholder="Nome e uma frase sobre o que ele faz"></div>
    <div class="field"><label for="innovation">Projetos de inovação de que participa <span class="opt">(se tiver)</span></label><input id="innovation" name="innovation" value="${v('innovation')}"></div>`;
  if (step === 2) body = html`<div class="field"><label for="seeking">Estou procurando…</label><textarea id="seeking" name="seeking" required placeholder="Ex.: um sócio técnico, mentoria em finanças, um estágio">${v('seeking')}</textarea></div>
    <div class="field"><label for="offering">Posso ajudar com…</label><textarea id="offering" name="offering" required placeholder="Ex.: revisar pitch, apresentar pessoas do agro, ensinar Canva">${v('offering')}</textarea></div>
    <label class="consent"><input type="checkbox" name="consent" ${d.consent ? raw('checked') : ''} required><span>Autorizo a LME a usar estes dados para me conectar a membros e parceiros e para falar comigo sobre a comunidade.</span></label>`;
  if (step === 3) {
    const evs = (await db.list('events', { order: ['starts_at', 'asc'] })).filter(e => new Date(e.starts_at) > new Date());
    const welcome = evs.find(e => /Boas-vindas|Open LME/.test(e.format)) || evs[0];
    body = html`<p class="lead">Tudo certo, ${(d.name || '').split(' ')[0]}! O próximo passo é conhecer a comunidade ao vivo.</p>
      ${welcome ? html`<div class="panel soft-azul"><p class="eyebrow">Seu primeiro encontro</p><p class="h3">${welcome.title}</p><p class="muted">${fmtDay(welcome.starts_at)} · ${fmtTime(welcome.starts_at)} · ${welcome.mode === 'Online' ? 'Online' : welcome.place}</p>
      <label class="consent"><input type="checkbox" name="rsvp" value="${welcome.id}" checked><span>Quero ir a este encontro</span></label></div>` : html`<p class="muted">A coordenação vai avisar você do próximo encontro de boas-vindas.</p>`}`;
  }
  return html`<div class="wizard-top"><a class="side-brand" href="../index.html"><svg class="mark" viewBox="0 0 48 48" aria-hidden="true"><path d="M1.6 23.2V1.6A21.6 21.6 0 0 1 23.2 23.2Z" fill="#1D4ED8"/><path d="M24.8 1.6H46.4A21.6 21.6 0 0 1 24.8 23.2Z" fill="#1D4ED8"/><path d="M46.4 24.8V46.4A21.6 21.6 0 0 1 24.8 24.8Z" fill="#E9B949"/><path d="M23.2 46.4H1.6A21.6 21.6 0 0 1 23.2 24.8Z" fill="#1D4ED8"/></svg><b>LME</b></a><span class="small muted">Suas respostas ficam salvas a cada passo</span></div>
<div class="wizard">
  <ol class="steps-v" style="list-style:none;margin:0;padding:0"><li><h1 class="h2">Seu Perfil LME</h1></li>${STEPS.map(([n, s], i) => html`<li class="step-v ${i < step ? 'done' : i === step ? 'now' : 'next'}"><span class="dot">${i < step ? '✓' : i + 1}</span><span><b>${n}</b><span class="small muted" style="display:block">${s}</span></span></li>`)}</ol>
  <form class="form" id="wizard" novalidate>
    <div class="progress-h" aria-hidden="true">${STEPS.map((_, i) => html`<i class="${i <= step ? 'on' : ''}"></i>`)}</div>
    <p class="eyebrow">Passo ${step + 1} de 4</p>
    <h2 class="display-l">${['Sobre você', 'Em que momento você está?', 'Conexões', 'Boas-vindas à Liga'][step]}</h2>
    ${body}
    <div class="row" style="justify-content:space-between">${step > 0 && step < 3 ? html`<button class="btn secondary" type="button" id="back">Voltar</button>` : html`<span></span>`}<button class="btn primary" type="submit">${['Continuar', 'Continuar para Conexões', 'Concluir perfil', 'Entrar na comunidade'][step]}</button></div>
    <p class="status" id="wiz-status" role="status" aria-live="polite" hidden></p>
  </form></div>`;
}

function collect(form) {
  const fd = new FormData(form), o = {};
  for (const [k, v] of fd.entries()) { if (k === 'perfis') (o.perfis = o.perfis || []).push(v); else o[k] = typeof v === 'string' ? v.trim() : v; }
  if (step === 1) { o.perfis = o.perfis || []; o.skills = (o.skills || '').split(',').map(s => s.trim()).filter(Boolean); }
  if (step === 0) o.age = +o.age || '';
  if (step === 2) o.consent = !!o.consent;
  return o;
}

export function mount(root, ctx) {
  const form = $('#wizard', root);
  const back = $('#back', root);
  if (back) back.addEventListener('click', () => { Object.assign(draft, collect(form)); step--; ctx.refresh(); });
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const st = $('#wiz-status', root);
    const data = collect(form);
    if (step === 1 && !data.perfis.length) { $('#perfis-err', root).hidden = false; st.className = 'status bad'; st.textContent = 'Escolha pelo menos um perfil para continuar.'; st.hidden = false; return; }
    if (step === 0 && data.age && (data.age < 14 || data.age > 99)) { st.className = 'status bad'; st.textContent = 'Informe uma idade entre 14 e 99.'; st.hidden = false; return; }
    if (!form.checkValidity()) { form.reportValidity(); return; }
    Object.assign(draft, data);
    const rsvp = data.rsvp; delete draft.rsvp;
    try {
      const exists = await db.get('profiles', draft.id);
      const row = Object.assign({}, draft, { onboarded: step >= 2 || !!(exists && exists.onboarded) });
      if (!row.role) row.role = 'member';
      if (exists) await db.update('profiles', draft.id, row); else await db.insert('profiles', row);
      if (step === 3) {
        if (rsvp && !(await db.get('rsvps', rsvp + ':' + draft.id))) await db.insert('rsvps', { id: rsvp + ':' + draft.id, event_id: rsvp, user_id: draft.id });
        toast('Perfil concluído. Bem-vindo à comunidade fundadora!');
        draft = null; step = 0; return ctx.go('inicio');
      }
      step++; ctx.refresh();
    } catch (err) { console.error(err); st.className = 'status bad'; st.textContent = 'Não foi possível salvar agora. A conexão falhou. Tente de novo.'; st.hidden = false; }
  });
}

/* Meu perfil: editar o Perfil LME e registrar conquistas (valor gerado pela rede). */
import { db } from '../store.js';
import { html, raw, $, avatar, badge, toast, guard, money, fmtDate, dialog, confirmDlg } from '../ui.js';
import { PERFIS, INTERESTS, IMPACT_KINDS, journey, JOURNEY } from '../logic.js';
import { ph, load } from './_common.js';

export const title = 'Meu perfil';

export async function render({ me }) {
  const d = await load('impact', 'benefit_uses', 'events', 'rsvps', 'posts', 'replies', 'connection_requests', 'connections', 'circles', 'circle_members', 'saved_opps', 'teams');
  const j = journey(me, d);
  const mine = d.impact.filter(x => x.user_id === me.id).sort((a, b) => b.created_at.localeCompare(a.created_at));
  const savings = d.benefit_uses.filter(x => x.user_id === me.id).reduce((s, x) => s + (+x.savings || 0), 0);
  const total = savings + mine.reduce((s, x) => s + (+x.amount || 0), 0);
  const v = k => me[k] == null ? '' : me[k];
  return html`${ph('Meu perfil', 'É o que a comunidade vê de você e o que a curadoria usa para fazer conexões.', html`<div class="person">${avatar(me.name, 'lg')}</div>`)}
<div class="cols">
  <form class="form" id="profile" novalidate>
    <fieldset><legend>Sobre você</legend>
      <div class="two"><div class="field"><label for="name">Nome</label><input id="name" name="name" value="${v('name')}" required></div><div class="field"><label for="city">Cidade</label><input id="city" name="city" value="${v('city')}" required></div></div>
      <div class="two"><div class="field"><label for="org">Universidade, empresa ou organização</label><input id="org" name="org" value="${v('org')}"></div><div class="field"><label for="area">Curso ou área</label><input id="area" name="area" value="${v('area')}"></div></div>
      <div class="two"><div class="field"><label for="email">E-mail</label><input id="email" name="email" type="email" value="${v('email')}" required></div><div class="field"><label for="whatsapp">WhatsApp</label><input id="whatsapp" name="whatsapp" value="${v('whatsapp')}"></div></div>
    </fieldset>
    <fieldset><legend>Seu momento</legend>
      <div class="chips">${PERFIS.map(p => html`<label class="chip"><input type="checkbox" name="perfis" value="${p}" ${(me.perfis || []).includes(p) ? raw('checked') : ''}><span><b>${p}</b></span></label>`)}</div>
      <div class="two"><div class="field"><label for="interest">Área de interesse</label><select id="interest" name="interest">${INTERESTS.map(i => html`<option ${me.interest === i ? raw('selected') : ''}>${i}</option>`)}</select></div><div class="field"><label for="skills">Competências</label><input id="skills" name="skills" value="${(me.skills || []).join(', ')}"></div></div>
      <div class="field"><label for="business">Negócio ou projeto</label><input id="business" name="business" value="${v('business')}"></div>
      <div class="field"><label for="innovation">Projetos de inovação de que participa</label><input id="innovation" name="innovation" value="${v('innovation')}"></div>
    </fieldset>
    <fieldset><legend>Conexões</legend>
      <div class="field"><label for="seeking">Estou procurando…</label><textarea id="seeking" name="seeking" required>${v('seeking')}</textarea></div>
      <div class="field"><label for="offering">Posso ajudar com…</label><textarea id="offering" name="offering" required>${v('offering')}</textarea></div>
    </fieldset>
    <div><button class="btn primary" type="submit">Salvar perfil</button></div>
  </form>
  <div class="grid" style="gap:20px">
    <section class="panel night"><p class="eyebrow" style="color:var(--duna)">Sua jornada</p><p class="h3">${j.count} de 10 etapas</p>
      <ol class="small" style="margin:0;padding-left:18px;display:grid;gap:4px">${JOURNEY.map((s, i) => html`<li style="${j.done[i] ? '' : 'opacity:.55'}">${j.done[i] ? '✓ ' : ''}${s}</li>`)}</ol></section>
    <section class="panel"><div class="panel-head"><h2 class="h4">Conquistas pela rede</h2><button class="btn secondary small" id="add-impact">Registrar</button></div>
      <p class="small muted">Bolsas, prêmios, contratos, investimentos e receitas que vieram pela LME. Ajuda a Liga a medir o próprio impacto.</p>
      <p><span class="kpi"><b>${money(total)}</b><span>${money(savings)} em benefícios + ${money(total - savings)} em conquistas</span></span></p>
      ${mine.length ? html`<div class="list">${mine.map(x => html`<div class="panel-head"><span><b>${x.description}</b><span class="small muted" style="display:block">${x.kind} · ${fmtDate(x.created_at)}</span></span><span class="row" style="gap:8px"><b>${money(x.amount)}</b><button class="icon-btn" data-del="${x.id}" aria-label="Apagar registro">🗑</button></span></div>`)}</div>` : ''}
    </section>
    ${me.role === 'coordination' ? html`<section class="panel soft-azul"><p class="eyebrow">Você faz parte da coordenação</p><a class="btn primary small" href="#/coordenacao">Abrir painel da coordenação</a></section>` : ''}
  </div>
</div>`;
}

export function mount(root, ctx) {
  const f = $('#profile', root);
  f.addEventListener('submit', e => {
    e.preventDefault();
    if (!f.checkValidity()) { f.reportValidity(); return; }
    const fd = new FormData(f);
    const perfis = fd.getAll('perfis');
    if (!perfis.length) { toast('Escolha pelo menos um perfil.', 'bad'); return; }
    const patch = Object.fromEntries(['name', 'city', 'org', 'area', 'email', 'whatsapp', 'interest', 'business', 'innovation', 'seeking', 'offering'].map(k => [k, String(fd.get(k) || '').trim()]));
    patch.perfis = perfis; patch.skills = String(fd.get('skills') || '').split(',').map(s => s.trim()).filter(Boolean);
    guard(async () => { await db.update('profiles', ctx.me.id, patch); toast('Perfil salvo.'); ctx.refresh(); });
  });
  $('#add-impact', root).addEventListener('click', async () => {
    const r = await dialog('Registrar conquista', html`<div class="field"><label for="i-kind">Tipo</label><select id="i-kind" name="kind">${IMPACT_KINDS.map(k => html`<option>${k}</option>`)}</select></div>
      <div class="field"><label for="i-desc">O que foi</label><input id="i-desc" name="description" required placeholder="Ex.: bolsa do programa de aceleração"></div>
      <div class="field"><label for="i-amount">Valor em reais</label><input id="i-amount" name="amount" type="number" min="0" step="1" required></div>`, { submit: 'Registrar' });
    if (r) guard(async () => { await db.insert('impact', { user_id: ctx.me.id, kind: r.kind, description: r.description.trim(), amount: +r.amount }); toast('Conquista registrada.'); ctx.refresh(); });
  });
  root.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
    if (await confirmDlg('Apagar registro?', 'O valor sai do indicador da Liga.', 'Apagar', true)) guard(async () => { await db.remove('impact', b.dataset.del); ctx.refresh(); });
  }));
}

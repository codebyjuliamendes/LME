/* Comunidade (Figma: App / Comunidade). Canais, publicações, respostas e "Posso ajudar". */
import { db } from '../store.js';
import { html, raw, $, avatar, badge, tag, toast, guard, ago, dialog, confirmDlg } from '../ui.js';
import { CHANNELS, POST_TYPES } from '../logic.js';
import { ph, load, byId } from './_common.js';

export const title = 'Comunidade';
let open = new Set();

export async function render({ me, params }) {
  const channel = params[0] || '';
  const d = await load('profiles', 'posts', 'replies');
  const people = byId(d.profiles);
  const posts = d.posts.filter(p => !channel || p.channel === channel).sort((a, b) => b.created_at.localeCompare(a.created_at));
  const count = c => d.posts.filter(p => p.channel === c).length;
  const helpers = {};
  d.replies.filter(r => r.kind === 'ajuda').forEach(r => helpers[r.author_id] = (helpers[r.author_id] || 0) + 1);
  const top = Object.entries(helpers).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const chName = (CHANNELS.find(c => c[0] === channel) || [])[1];
  return html`${ph('Comunidade', 'Peça ajuda, procure sócios, divulgue seu negócio.', html`<button class="btn primary" id="new-post">Nova publicação</button>`)}
<div class="cols left">
  <nav class="grid" style="gap:4px" aria-label="Canais"><p class="eyebrow" style="color:var(--muted)">Canais</p>
    <a class="chan ${!channel ? 'on' : ''}" href="#/comunidade">Todos <span class="small">${d.posts.length}</span></a>
    ${CHANNELS.map(([id, name]) => html`<a class="chan ${channel === id ? 'on' : ''}" href="#/comunidade/${id}"># ${id}${count(id) ? html`<span class="badge duna">${count(id)}</span>` : ''}</a>`)}
  </nav>
  <div class="grid" style="gap:16px">
    ${chName ? html`<p class="h4"># ${channel} <span class="muted small">· ${chName}</span></p>` : ''}
    <form class="panel" id="quick"><div class="person">${avatar(me.name)}<label class="sr-only" for="quick-text">Nova publicação</label><input id="quick-text" name="text" placeholder="Do que você precisa hoje?" style="flex:1"></div>
      <div class="row" style="gap:8px">${Object.entries(POST_TYPES).map(([k, [l, tone]], i) => html`<label class="chip" style="padding:6px 10px"><input type="radio" name="type" value="${k}" ${i === 0 ? raw('checked') : ''}><span><b style="font-size:14px">${l}</b></span></label>`)}<button class="btn primary small" type="submit" style="margin-left:auto">Publicar</button></div>
    </form>
    ${posts.length ? posts.map(p => {
      const a = people.get(p.author_id) || { name: 'Membro' };
      const reps = d.replies.filter(r => r.post_id === p.id).sort((x, y) => x.created_at.localeCompare(y.created_at));
      const helping = reps.filter(r => r.kind === 'ajuda').length;
      const [tl, tt] = POST_TYPES[p.type] || POST_TYPES.conversa;
      return html`<article class="panel" id="post-${p.id}">
        <div class="person">${avatar(a.name)}<div class="who"><a href="#/membros/${p.author_id}" style="text-decoration:none"><b>${a.name}</b></a><span class="small muted">${(a.perfis || [])[0] || ''} · ${ago(p.created_at)} · #${p.channel}</span></div>${badge(tl, tt)}</div>
        <p>${p.text}</p>
        ${p.tags && p.tags.length ? html`<div class="chips-row">${p.tags.map(tag)}</div>` : ''}
        <div class="panel-head"><span class="small muted">${reps.length} ${reps.length === 1 ? 'resposta' : 'respostas'}${helping ? ` · ${helping} ${helping === 1 ? 'pessoa pode' : 'pessoas podem'} ajudar` : ''}</span>
          <span class="row" style="gap:8px">${p.author_id !== me.id && p.type !== 'divulgacao' ? html`<button class="btn secondary small" data-help="${p.id}">Posso ajudar</button>` : ''}<button class="btn secondary small" data-toggle="${p.id}">${open.has(p.id) ? 'Fechar' : 'Responder'}</button>${p.author_id === me.id || me.role === 'coordination' ? html`<button class="icon-btn" data-del="${p.id}" aria-label="Apagar publicação">🗑</button>` : ''}</span></div>
        ${open.has(p.id) ? html`<div class="list" style="background:var(--base);border-radius:12px;padding:4px 14px">${reps.map(r => { const ra = people.get(r.author_id) || { name: 'Membro' }; return html`<div class="person" style="align-items:flex-start">${avatar(ra.name)}<div class="who"><span><b>${ra.name}</b> <span class="small muted">· ${ago(r.created_at)}</span> ${r.kind === 'ajuda' ? badge('Pode ajudar', 'lagoa') : ''}</span><span>${r.text}</span></div></div>`; })}
          <form class="row" data-reply="${p.id}" style="padding:12px 0"><label class="sr-only" for="r-${p.id}">Sua resposta</label><input id="r-${p.id}" name="text" required placeholder="Escreva uma resposta" style="flex:1"><button class="btn primary small" type="submit">Enviar</button></form></div>` : ''}
      </article>`;
    }) : html`<div class="empty"><p class="h4">Nada neste canal ainda</p><p class="muted">Seja a primeira pessoa a publicar aqui.</p></div>`}
  </div>
  <aside class="grid" style="gap:16px">
    <section class="panel soft-duna"><h2 class="h4">Como a comunidade funciona</h2><p class="small">• Peça ajuda sem medo: todo mundo começou de algum lugar.</p><p class="small">• Ofereça o que você sabe. Ajudar também é participar.</p><p class="small">• Divulgação só em #divulgue-seu-negocio.</p></section>
    <section class="panel"><h2 class="h4">Quem mais ajudou</h2>${top.length ? html`<div class="list">${top.map(([id, n]) => { const p = people.get(id); return p ? html`<div class="person">${avatar(p.name)}<div class="who"><b>${p.name}</b><span class="small muted">${n} ${n === 1 ? 'ajuda' : 'ajudas'}</span></div></div>` : ''; })}</div>` : html`<p class="small muted">Ainda ninguém. Que tal começar?</p>`}</section>
  </aside>
</div>`;
}

async function newPost(ctx, presetText = '', presetType = 'ajuda') {
  const ch = ctx.params[0] || (presetType === 'divulgacao' ? 'divulgue-seu-negocio' : presetType === 'socio' ? 'procuro-socio' : presetType === 'ajuda' ? 'pedidos-de-ajuda' : 'boas-vindas');
  const r = await dialog('Nova publicação', html`
    <div class="field"><label for="d-type">Tipo</label><select id="d-type" name="type">${Object.entries(POST_TYPES).map(([k, [l]]) => html`<option value="${k}" ${k === presetType ? raw('selected') : ''}>${l}</option>`)}</select></div>
    <div class="field"><label for="d-ch">Canal</label><select id="d-ch" name="channel">${CHANNELS.map(([id]) => html`<option value="${id}" ${id === ch ? raw('selected') : ''}># ${id}</option>`)}</select></div>
    <div class="field"><label for="d-text">Mensagem</label><textarea id="d-text" name="text" required>${presetText}</textarea></div>
    <div class="field"><label for="d-tags">Temas <span class="opt">(opcional, separados por vírgula)</span></label><input id="d-tags" name="tags"></div>`, { submit: 'Publicar' });
  if (!r) return;
  await guard(async () => {
    await db.insert('posts', { author_id: ctx.me.id, channel: r.channel, type: r.type, text: r.text.trim(), tags: (r.tags || '').split(',').map(s => s.trim()).filter(Boolean) });
    toast('Publicado.'); r.channel === (ctx.params[0] || r.channel) ? ctx.refresh() : ctx.go('comunidade/' + r.channel);
  });
}

export function mount(root, ctx) {
  $('#new-post', root).addEventListener('click', () => newPost(ctx));
  $('#quick', root).addEventListener('submit', e => { e.preventDefault(); const f = e.target; newPost(ctx, f.text.value.trim(), f.type.value); });
  root.querySelectorAll('[data-toggle]').forEach(b => b.addEventListener('click', () => { const id = b.dataset.toggle; open.has(id) ? open.delete(id) : open.add(id); ctx.refresh(); }));
  root.querySelectorAll('[data-reply]').forEach(f => f.addEventListener('submit', e => { e.preventDefault(); const text = f.text.value.trim(); if (!text) return;
    guard(async () => { await db.insert('replies', { post_id: f.dataset.reply, author_id: ctx.me.id, kind: 'resposta', text }); ctx.refresh(); }); }));
  root.querySelectorAll('[data-help]').forEach(b => b.addEventListener('click', async () => {
    const r = await dialog('Posso ajudar', html`<div class="field"><label for="h-text">Como você pode ajudar?</label><textarea id="h-text" name="text" required>Posso ajudar com isso. </textarea></div><p class="help">Quem publicou recebe sua mensagem e pode chamar você.</p>`, { submit: 'Enviar' });
    if (r) guard(async () => { await db.insert('replies', { post_id: b.dataset.help, author_id: ctx.me.id, kind: 'ajuda', text: r.text.trim() }); open.add(b.dataset.help); toast('Obrigado por ajudar. Isso conta na sua jornada.'); ctx.refresh(); });
  }));
  root.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', async () => {
    if (await confirmDlg('Apagar publicação?', 'A publicação e as respostas somem para todos.', 'Apagar', true)) guard(async () => {
      const reps = await db.list('replies', { eq: { post_id: b.dataset.del } });
      for (const r of reps) await db.remove('replies', r.id);
      await db.remove('posts', b.dataset.del); toast('Publicação apagada.'); ctx.refresh();
    });
  }));
}

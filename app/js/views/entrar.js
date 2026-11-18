import { db, MODE } from '../store.js';
import { html, raw, $ } from '../ui.js';
import { DUNES } from '../art.js';

export const title = 'Entrar';

export async function render() {
  return html`<div class="auth">
<section class="auth-art">${raw(DUNES)}
  <a class="brand" href="../index.html" aria-label="Site da LME"><svg class="mark" viewBox="0 0 48 48" aria-hidden="true" style="width:38px;height:38px"><path d="M1.6 23.2V1.6A21.6 21.6 0 0 1 23.2 23.2Z" fill="#fff"/><path d="M24.8 1.6H46.4A21.6 21.6 0 0 1 24.8 23.2Z" fill="#fff"/><path d="M46.4 24.8V46.4A21.6 21.6 0 0 1 24.8 24.8Z" fill="#E9C46A"/><path d="M23.2 46.4H1.6A21.6 21.6 0 0 1 23.2 24.8Z" fill="#fff"/></svg><span><b>LME</b><small>Liga Maranhense de Empreendedorismo</small></span></a>
  <div class="head" style="max-width:30ch"><p class="eyebrow" style="color:var(--duna)">Área do membro</p><h1 class="display-l">Ninguém precisa empreender sozinho.</h1><p class="lead">Conexões, encontros, oportunidades e o seu Círculo, num lugar só.</p></div>
</section>
<section class="auth-form">
  <div class="head"><h2 class="h2">Entrar</h2><p class="muted">${MODE === 'supabase' ? 'Digite seu e-mail para entrar na sua conta ou concluir seu Perfil LME.' : 'Ambiente de desenvolvimento: digite um e-mail para entrar ou criar um perfil.'}</p></div>
  <form id="login" class="form-grid" novalidate>
    <div class="field"><label for="email">E-mail</label><input id="email" name="email" type="email" autocomplete="email" placeholder="nome@exemplo.com" required></div>
    <button class="btn primary" type="submit">${MODE === 'supabase' ? 'Entrar com e-mail' : 'Continuar com este e-mail'}</button>
    <p class="status" id="login-status" role="status" aria-live="polite" hidden></p>
  </form>
  <p class="small muted">Ainda não conhece a Liga? <a href="../index.html">Veja o site</a>.</p>
</section></div>`;
}

export function mount(root, ctx) {
  $('#login', root).addEventListener('submit', async e => {
    e.preventDefault();
    const email = $('#email', root).value.trim(), st = $('#login-status', root), btn = $('button[type=submit]', root);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { st.className = 'status bad'; st.textContent = 'O e-mail precisa ter @ e domínio, como nome@exemplo.com.'; st.hidden = false; $('#email', root).focus(); return; }
    btn.disabled = true;
    try {
      const r = await db.auth.signIn(email);
      if (r.sent) { st.className = 'status ok'; st.textContent = `Link enviado para ${email}. Abra o e-mail neste aparelho para entrar.`; st.hidden = false; }
      else ctx.go('inicio');
    } catch (err) { st.className = 'status bad'; st.textContent = 'Não foi possível entrar agora. Confira o e-mail e tente de novo.'; st.hidden = false; }
    finally { btn.disabled = false; }
  });
}

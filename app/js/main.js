/* Roteador e moldura do app (barra lateral, barra inferior no celular, aviso de demonstração). */
import { db, MODE } from './store.js';
import { html, raw, $, $$, avatar, toast, confirmDlg } from './ui.js';

const MEMBER_NAV = [
  ['inicio', 'Início'], ['comunidade', 'Comunidade'], ['connect', 'LME Connect'], ['membros', 'Membros'], ['circulos', 'Círculos'],
  ['agenda', 'Agenda'], ['radar', 'Radar de oportunidades'], ['beneficios', 'Benefícios'], ['challenges', 'Challenges'],
  ['office-hours', 'Office Hours'], ['founder-school', 'Founder School']
];
const COORD_NAV = [
  ['coordenacao', 'Indicadores'], ['coordenacao/membros', 'Membros e curadoria'], ['coordenacao/parcerias', 'Parcerias'],
  ['coordenacao/eventos', 'Programas e eventos'], ['coordenacao/radar', 'Radar'], ['coordenacao/beneficios', 'Benefícios'],
  ['coordenacao/embaixadores', 'Embaixadores'], ['coordenacao/pesquisa', 'Pesquisa anual']
];
const TABS = [['inicio', 'Início'], ['comunidade', 'Comunidade'], ['connect', 'Connect'], ['agenda', 'Agenda']];

// rota → [arquivo da tela, precisa de coordenação?]
const ROUTES = [
  [/^entrar$/, 'entrar', 'public'], [/^cadastro$/, 'cadastro', 'auth'],
  [/^inicio$/, 'inicio'], [/^connect$/, 'connect'], [/^comunidade(?:\/([\w-]+))?$/, 'comunidade'], [/^membros$/, 'membros'],
  [/^membros\/([\w:-]+)$/, 'perfil'], [/^perfil$/, 'meu-perfil'], [/^circulos$/, 'circulos'], [/^agenda$/, 'agenda'], [/^agenda\/([\w:-]+)$/, 'evento'],
  [/^radar$/, 'radar'], [/^beneficios$/, 'beneficios'], [/^challenges$/, 'challenges'], [/^challenges\/([\w:-]+)$/, 'challenge'],
  [/^office-hours$/, 'office-hours'], [/^founder-school$/, 'founder-school'],
  [/^coordenacao$/, 'coord-indicadores', 'coord'], [/^coordenacao\/membros$/, 'coord-membros', 'coord'], [/^coordenacao\/parcerias$/, 'coord-parcerias', 'coord'],
  [/^coordenacao\/eventos$/, 'coord-eventos', 'coord'], [/^coordenacao\/radar$/, 'coord-radar', 'coord'], [/^coordenacao\/beneficios$/, 'coord-beneficios', 'coord'],
  [/^coordenacao\/embaixadores$/, 'coord-embaixadores', 'coord'], [/^coordenacao\/pesquisa$/, 'coord-pesquisa', 'coord']
];

const state = { session: null, me: null };
export const go = path => { if (location.hash !== '#/' + path) location.hash = '#/' + path; else render(); };

async function loadMe() {
  state.session = await db.auth.current();
  state.me = state.session ? await db.get('profiles', state.session.id) : null;
}

function current() { return (location.hash.replace(/^#\/?/, '') || 'inicio').split('?')[0]; }

function shell(path, coord) {
  const me = state.me;
  const isCoord = me && me.role === 'coordination';
  const link = ([p, l]) => html`<a class="nav-item${path === p || (p !== 'coordenacao' && path.startsWith(p + '/')) ? ' on' : ''}" href="#/${p}"${path === p ? raw(' aria-current="page"') : ''}><i></i>${l}</a>`;
  const demo = MODE === 'demo' ? html`<div class="demo-bar" role="note"><span><b>Modo demonstração.</b> Pessoas e dados são fictícios e ficam só neste navegador.</span><span class="demo-actions"><button type="button" class="link" data-act="switch">Trocar de pessoa</button><button type="button" class="link" data-act="reset">Restaurar exemplos</button></span></div>` : '';
  return html`${demo}<div class="shell${coord ? ' coord' : ''}">
<aside class="side" id="side" aria-label="Navegação">
  <a class="side-brand" href="../index.html" aria-label="Ir para o site da LME">${raw(MARK_LIGHT)}<b>LME</b></a>
  ${coord ? html`<p class="side-label">Coordenação</p><nav class="side-nav">${COORD_NAV.map(link)}</nav><a class="nav-item back" href="#/inicio"><i></i>Voltar para a área do membro</a>` : html`<nav class="side-nav">${MEMBER_NAV.map(link)}</nav>${isCoord ? html`<a class="nav-item coord-link" href="#/coordenacao"><i></i>Coordenação</a>` : ''}`}
  <div class="side-me">${avatar(me.name)}<span><b>${me.name}</b><a href="#/perfil">Meu perfil</a> · <button type="button" class="link" data-act="logout">Sair</button></span></div>
</aside>
<div class="main-col">
  <header class="mtop"><a href="#/inicio" class="side-brand" aria-label="Início">${raw(MARK_LIGHT)}<b>LME</b></a><a href="#/perfil" aria-label="Meu perfil">${avatar(me.name)}</a></header>
  <main id="view" tabindex="-1"><p class="boot">Carregando…</p></main>
</div>
<nav class="tabs" aria-label="Atalhos">${TABS.map(([p, l]) => html`<a href="#/${p}" class="${path === p || path.startsWith(p + '/') ? 'on' : ''}"><i></i>${l}</a>`)}<button type="button" data-act="more"><i></i>Mais</button></nav>
</div>`;
}

const MARK_LIGHT = '<svg class="mark" viewBox="0 0 48 48" aria-hidden="true"><path d="M1.6 23.2V1.6A21.6 21.6 0 0 1 23.2 23.2Z" fill="#1D4ED8"/><path d="M24.8 1.6H46.4A21.6 21.6 0 0 1 24.8 23.2Z" fill="#1D4ED8"/><path d="M46.4 24.8V46.4A21.6 21.6 0 0 1 24.8 24.8Z" fill="#E9B949"/><path d="M23.2 46.4H1.6A21.6 21.6 0 0 1 23.2 24.8Z" fill="#1D4ED8"/></svg>';

let renderToken = 0;
export async function render() {
  const token = ++renderToken;
  const path = current();
  const route = ROUTES.find(([re]) => re.test(path));
  if (!route) return go('inicio');
  const [re, view, access] = route;
  await loadMe();
  if (token !== renderToken) return;
  if (access !== 'public' && !state.session) return go('entrar');
  if (access === 'public' && state.session) return go(state.me && state.me.onboarded ? 'inicio' : 'cadastro');
  if (!access && (!state.me || !state.me.onboarded)) return go('cadastro');
  if (access === 'coord' && state.me.role !== 'coordination') { toast('Essa área é só da coordenação da Liga.', 'bad'); return go('inicio'); }
  const params = path.match(re).slice(1);
  const mod = await import(`./views/${view}.js`);
  if (token !== renderToken) return;
  const ctx = { me: state.me, session: state.session, params, go, refresh: render, db };
  const root = $('#root');
  const bare = access === 'public' || view === 'cadastro';
  if (bare) {
    root.innerHTML = String(await mod.render(ctx));
  } else {
    root.innerHTML = String(shell(path, access === 'coord'));
    const v = $('#view');
    v.innerHTML = String(await mod.render(ctx));
    document.title = (mod.title ? mod.title + ' — ' : '') + 'LME';
  }
  if (token !== renderToken) return;
  if (mod.mount) mod.mount(bare ? root : $('#view'), ctx);
  wireShell();
  if (!bare && window.__lastPath !== path) { window.scrollTo(0, 0); $('#view').focus({ preventScroll: true }); }
  window.__lastPath = path;
}

function wireShell() {
  $$('[data-act]').forEach(b => b.addEventListener('click', async () => {
    const a = b.dataset.act;
    if (a === 'logout') { await db.auth.signOut(); go('entrar'); }
    if (a === 'switch') { await db.auth.signOut(); go('entrar'); }
    if (a === 'reset' && await confirmDlg('Restaurar exemplos?', 'Isso apaga o que foi feito neste navegador e volta aos dados de exemplo.', 'Restaurar', true)) { db.reset(); toast('Dados de exemplo restaurados.'); go('entrar'); }
    if (a === 'more') { const s = $('#side'); s.classList.toggle('open'); }
  }));
  $$('.side .nav-item').forEach(l => l.addEventListener('click', () => $('#side').classList.remove('open')));
}

window.addEventListener('hashchange', render);
db.auth.onChange(() => render());
render().catch(e => { console.error(e); $('#root').innerHTML = '<p class="boot">Não foi possível abrir a área do membro. Recarregue a página.</p>'; });

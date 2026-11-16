/* Menu mobile. Sem JavaScript, os links continuam no rodapé de cada página. */
(function () {
  var top = document.querySelector('.top');
  var btn = top && top.querySelector('.menu');
  var nav = top && top.querySelector('.nav');
  if (!btn || !nav) return;
  function set(open) {
    nav.classList.toggle('open', open);
    top.setAttribute('data-open', open ? 'true' : 'false');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  btn.addEventListener('click', function () { set(!nav.classList.contains('open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
})();

/* Envio do Perfil LME (participar.html) e do interesse de parceiros (parcerias.html)
   para o Google Forms. Endereços e códigos "entry.NNN" ficam em config.js. */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var CFG = window.LME_FORMS || {};
  function ready(c) { return !!(c && c.action && c.fields && Object.keys(c.fields).every(function (k) { return c.fields[k]; })); }
  function show(el, cls, text) { el.className = 'status ' + cls; el.textContent = text; el.hidden = false; }
  function post(c, values) {
    var body = new URLSearchParams();
    Object.keys(values).forEach(function (k) {
      var entry = c.fields[k], v = values[k];
      if (!entry) return;
      (Array.isArray(v) ? v : [v]).forEach(function (one) { if (one !== '' && one != null) body.append(entry, String(one)); });
    });
    // O Google Forms não responde com CORS: a resposta é opaca, mas o envio é registrado.
    return fetch(c.action, { method: 'POST', mode: 'no-cors', body: body });
  }
  function fieldError(el, text) {
    var id = el.id + '-err', e = $(id);
    if (!text) { el.removeAttribute('aria-invalid'); if (e) e.remove(); return; }
    el.setAttribute('aria-invalid', 'true');
    if (!e) { e = document.createElement('p'); e.className = 'err'; e.id = id; (el.closest('.field') || el.parentNode).appendChild(e); el.setAttribute('aria-describedby', id); }
    e.textContent = text;
  }

  // ---------- Perfil LME ----------
  var form = $('perfil-form');
  if (form) {
    var gate = $('perfil-gate');
    if (!ready(CFG.perfil)) { gate.textContent = 'As inscrições abrem em breve. Volte nos próximos dias para enviar seu Perfil LME.'; gate.hidden = false; }
    var msgs = {
      nome: 'Escreva seu nome completo.', idade: 'Informe sua idade em números.', cidade: 'Informe sua cidade.',
      email: 'O e-mail precisa ter @ e domínio, como nome@exemplo.com.', organizacao: 'Informe sua universidade, empresa ou organização.',
      area: 'Informe seu curso ou área.', interesse: 'Escolha uma área de interesse.', competencias: 'Conte pelo menos uma competência.',
      procurando: 'Conte o que você procura.', ajudar: 'Conte como você pode ajudar.'
    };
    var validate = function () {
      var first = null;
      Object.keys(msgs).forEach(function (k) {
        var el = $(k), v = el.value.trim(), bad = !v;
        if (k === 'email' && v) bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        if (k === 'idade' && v) bad = !(+v >= 14 && +v <= 99);
        fieldError(el, bad ? (k === 'idade' && v ? 'Informe uma idade entre 14 e 99.' : msgs[k]) : '');
        if (bad && !first) first = el;
      });
      var n = form.querySelectorAll('input[name=perfis]:checked').length;
      $('perfis-err').hidden = n > 0; if (!n && !first) first = form.querySelector('input[name=perfis]');
      $('consent-err').hidden = $('consentimento').checked; if (!$('consentimento').checked && !first) first = $('consentimento');
      if (first) first.focus();
      return !first;
    };
    Object.keys(msgs).forEach(function (k) { $(k).addEventListener('blur', function () { if ($(k).getAttribute('aria-invalid')) validate(); }); });
    $('idade').addEventListener('input', function () {
      $('idade-help').textContent = +this.value > 34 ? 'Acima de 34 anos você também pode participar. A prioridade da LME é quem tem até 34.' : 'A LME prioriza estudantes e jovens de até 34 anos.';
    });
    var KEYS = ['nome', 'idade', 'cidade', 'email', 'whatsapp', 'organizacao', 'area', 'interesse', 'negocio', 'inovacao', 'competencias', 'procurando', 'ajudar'];
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var st = $('perfil-status');
      if (!ready(CFG.perfil)) { show(st, 'info', 'As inscrições abrem em breve. Volte nos próximos dias para enviar seu Perfil LME.'); return; }
      if (!validate()) { show(st, 'bad', 'Revise os campos marcados para enviar seu perfil.'); return; }
      var values = {}; KEYS.forEach(function (k) { values[k] = $(k).value.trim(); });
      values.perfis = Array.prototype.map.call(form.querySelectorAll('input[name=perfis]:checked'), function (i) { return i.value; });
      var btn = $('perfil-submit'); btn.disabled = true;
      try { await post(CFG.perfil, values); form.reset(); show(st, 'ok', 'Perfil enviado. Bem-vindo à comunidade fundadora! A coordenação vai falar com você pelo e-mail informado.'); }
      catch (err) { show(st, 'bad', 'Não foi possível enviar agora. A conexão falhou. Confira sua internet e tente de novo.'); }
      finally { btn.disabled = false; }
    });
  }

  // ---------- Parcerias ----------
  var pform = $('parceria-form');
  if (pform) {
    var pgate = $('parceria-gate');
    if (!ready(CFG.parceria)) { pgate.textContent = 'O formulário de parcerias abre em breve.'; pgate.hidden = false; }
    pform.addEventListener('submit', async function (e) {
      e.preventDefault();
      var st = $('parceria-status');
      if (!ready(CFG.parceria)) { show(st, 'info', 'O formulário de parcerias abre em breve.'); return; }
      var first = null;
      [['p-nome', 'Escreva seu nome.'], ['p-org', 'Informe a empresa ou instituição.'], ['p-tipo', 'Escolha um tipo de parceria.'], ['p-contato', 'Informe um e-mail ou telefone.']].forEach(function (x) {
        var el = $(x[0]), bad = !el.value.trim(); fieldError(el, bad ? x[1] : ''); if (bad && !first) first = el;
      });
      if (first) { first.focus(); show(st, 'bad', 'Preencha os campos marcados para enviar.'); return; }
      var btn = $('parceria-submit'); btn.disabled = true;
      try {
        await post(CFG.parceria, { nome: $('p-nome').value.trim(), organizacao: $('p-org').value.trim(), tipo: $('p-tipo').value, contato: $('p-contato').value.trim(), mensagem: $('p-msg').value.trim() });
        pform.reset(); show(st, 'ok', 'Interesse enviado. A equipe de Parcerias vai responder pelo contato informado.');
      } catch (err) { show(st, 'bad', 'Não foi possível enviar agora. A conexão falhou. Tente de novo.'); }
      finally { btn.disabled = false; }
    });
  }
})();

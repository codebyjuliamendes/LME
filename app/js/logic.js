/* Regras do produto, sem acesso a tela nem a banco. Testadas em tests/logic.test.mjs. */

export const PERFIS = ['Explorador', 'Founder iniciante', 'Jovem empreendedor', 'Intraempreendedor'];
export const CONNECTION_TYPES = ['Founder + Founder', 'Founder + Universidade', 'Founder + Empresa', 'Intraempreendedor + Especialista', 'Intraempreendedor + Universidade', 'Empreendedor + Talentos'];
export const CHANNELS = [
  ['boas-vindas', 'Boas-vindas'], ['pedidos-de-ajuda', 'Pedidos de ajuda'], ['procuro-socio', 'Procuro sócio'],
  ['divulgue-seu-negocio', 'Divulgue seu negócio'], ['intraempreendedorismo', 'Intraempreendedorismo'], ['tecnologia', 'Tecnologia'],
  ['agro-e-alimentos', 'Agro e alimentos'], ['economia-criativa', 'Economia criativa'], ['sao-luis', 'São Luís'], ['imperatriz', 'Imperatriz']
];
export const POST_TYPES = { ajuda: ['Pedido de ajuda', 'azulejo'], socio: ['Procuro sócio', 'lagoa'], divulgacao: ['Divulgação', 'duna'], conversa: ['Conversa', 'lagoa'] };
export const INTERESTS = ['Tecnologia e startups', 'Comércio e serviços', 'Agronegócio', 'Indústria', 'Economia criativa e cultura', 'Saúde', 'Educação', 'Impacto social e sustentabilidade', 'Inovação corporativa', 'Pesquisa e desenvolvimento', 'Outra'];
export const UNIVERSITIES = ['UFMA', 'UEMA', 'IFMA', 'CEUMA', 'UNDB', 'Estácio', 'UEMASUL', 'Florence'];
export const PARTNER_STAGES = ['Primeiro contato', 'Proposta enviada', 'Em negociação', 'Ativo'];
export const PARTNER_KINDS = ['Institucional', 'Benefícios', 'Programa', 'Desafio', 'Conteúdo', 'Universidade'];
export const GOAL_STATUS = ['Em andamento', 'Concluída', 'Precisa de ajuda'];
export const IMPACT_KINDS = ['Bolsa', 'Premiação', 'Contrato', 'Investimento', 'Receita'];

export const MODULES = [
  { id: 'm1', title: 'Do problema à oportunidade', text: 'Como achar um problema que vale resolver e descrevê-lo em uma frase.', task: 'Escreva o problema que você quer resolver, para quem e por que agora.' },
  { id: 'm2', title: 'Quem é seu cliente', text: 'Segmento, persona e como conversar com 10 pessoas antes de construir.', task: 'Liste 10 pessoas para entrevistar nesta semana.' },
  { id: 'm3', title: 'Validação com pouco dinheiro', text: 'Testes de fumaça, pré-venda e protótipos de papel.', task: 'Escolha um teste que você consegue rodar em 7 dias.' },
  { id: 'm4', title: 'Modelo de negócio', text: 'Quem paga, quanto, com que frequência e quanto custa entregar.', task: 'Preencha uma frase: "Cobramos X de Y por Z".' },
  { id: 'm5', title: 'Primeiras vendas', text: 'Funil simples, primeiro contato e como pedir o "sim".', task: 'Faça 5 abordagens e anote as objeções.' },
  { id: 'm6', title: 'Finanças para founders', text: 'Fluxo de caixa, preço e o mínimo de controle desde o primeiro real.', task: 'Monte uma planilha com entradas e saídas do próximo mês.' },
  { id: 'm7', title: 'Formalização e jurídico', text: 'MEI, ME, sócios e contratos básicos.', task: 'Decida o formato jurídico e anote as dúvidas para o Office Hours.' },
  { id: 'm8', title: 'Pitch e próximos passos', text: 'Contar a história do negócio em 3 minutos e escolher o próximo programa.', task: 'Grave um pitch de 3 minutos e peça feedback no seu Círculo.' }
];

// ---------- Texto ----------
const STOP = new Set('para com uma umas uns que por dos das nos nas meu minha seu sua como mais algo alguem alguém quero preciso sobre entre ate até ser ter tem estou pode posso ajudar procura procurando'.split(' '));
export function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
export function tokens(s) { return norm(s).split(/[^a-z0-9+#.]+/).filter(w => w.length >= 3 && !STOP.has(w)); }
const GROUPS = [
  ['tecnico', 'tecnologia', 'desenvolvimento', 'programacao', 'mobile', 'react', 'native', 'python', 'next.js', 'app', 'software', 'mvp', 'web'],
  ['dados', 'data', 'abertos', 'python', 'analise', 'ia'],
  ['financas', 'cfo', 'caixa', 'precificacao', 'captacao', 'orcamento', 'editais', 'edital'],
  ['vendas', 'b2b', 'clientes', 'comercial', 'funil'],
  ['marketing', 'pesquisa', 'clientes', 'marca', 'conteudo'],
  ['design', 'canva', 'identidade', 'visual', 'ux'],
  ['pitch', 'diretoria', 'apresentacao'],
  ['juridico', 'contratos', 'societario', 'socios', 'lgpd'],
  ['produto', 'discovery', 'validacao', 'mvp', 'loja'],
  ['agro', 'produtores', 'agronegocio', 'rural'],
  ['energia', 'solar', 'eletrico'],
  ['inovacao', 'aberta', 'intraempreendedorismo', 'laboratorio']
];
export function expand(words) {
  const out = new Set(words);
  for (const w of words) for (const g of GROUPS) if (g.includes(w)) g.forEach(x => out.add(x));
  return out;
}

// ---------- LME Connect: sugestões ----------
/* Pontua cada pessoa pelo quanto o que ela oferece ("Posso ajudar com", competências)
   cobre o pedido. Exclui quem pediu e quem já está conectado com essa pessoa. */
export function suggestMatches(request, requester, profiles, connections = [], limit = 3) {
  const want = expand(tokens(request.text));
  const already = new Set(connections.filter(c => c.a_id === requester.id || c.b_id === requester.id).map(c => (c.a_id === requester.id ? c.b_id : c.a_id)));
  const out = [];
  for (const p of profiles) {
    if (p.id === requester.id || already.has(p.id) || !p.onboarded) continue;
    const offer = tokens(p.offering);
    const skills = tokens((p.skills || []).join(' '));
    const hitOffer = offer.filter(w => want.has(w));
    const hitSkills = skills.filter(w => want.has(w));
    let score = hitOffer.length * 3 + hitSkills.length * 2;
    if (score === 0) continue;
    const t = request.type || '';
    if (/Especialista/.test(t) && p.mentor) score += 2;
    if (/Founder \+ Founder/.test(t) && (p.perfis || []).includes('Founder iniciante')) score += 1;
    if (/Empresa/.test(t) && (p.perfis || []).includes('Intraempreendedor')) score += 1;
    if (requester.city && p.city === requester.city) score += 1;
    const reason = hitOffer.length
      ? `Escreveu em “Posso ajudar”: “${p.offering}”.`
      : `Tem competência em ${(p.skills || []).filter(s => tokens(s).some(w => want.has(w))).join(', ')}.`;
    out.push({ profile: p, score, reason });
  }
  return out.sort((a, b) => b.score - a.score || a.profile.name.localeCompare(b.profile.name)).slice(0, limit);
}

// ---------- Jornada do membro (10 etapas do documento-base) ----------
export const JOURNEY = [
  'Conheceu a LME', 'Fez o Perfil LME', 'Foi ao encontro de boas-vindas', 'Entrou nos canais', 'Recebeu ou pediu conexões',
  'Participou de atividades', 'Usou benefícios ou oportunidades', 'Entrou em projetos e desafios', 'Compartilhou conhecimento', 'Liderança, representação ou mentoria'
];
export const JOURNEY_NEXT = [
  null, ['Complete seu Perfil LME', '#/perfil'], ['Confirme presença no encontro de boas-vindas', '#/agenda'], ['Apresente-se no canal de boas-vindas', '#/comunidade/boas-vindas'],
  ['Peça sua primeira conexão', '#/connect'], ['Confirme presença em um encontro', '#/agenda'], ['Use um benefício ou salve uma oportunidade', '#/beneficios'],
  ['Entre em um time de LME Challenge', '#/challenges'], ['Responda um pedido de ajuda na comunidade', '#/comunidade/pedidos-de-ajuda'], ['Converse com a coordenação sobre ser Embaixador ou mentor', '#/perfil']
];
export function journey(profile, ctx) {
  const me = profile.id;
  const mine = (arr, f = 'user_id') => (arr || []).filter(x => x[f] === me);
  const rsvps = mine(ctx.rsvps);
  const events = new Map((ctx.events || []).map(e => [e.id, e]));
  const done = [
    true,
    !!(profile.onboarded && profile.perfis && profile.perfis.length && profile.seeking && profile.offering),
    rsvps.some(r => { const e = events.get(r.event_id); return e && /Boas-vindas|Open LME/.test(e.format); }),
    mine(ctx.posts, 'author_id').length > 0 || mine(ctx.replies, 'author_id').length > 0,
    mine(ctx.connection_requests, 'from_id').length > 0 || (ctx.connections || []).some(c => c.a_id === me || c.b_id === me),
    rsvps.some(r => { const e = events.get(r.event_id); return e && !/Boas-vindas/.test(e.format); }) || mine(ctx.circle_members).length > 0,
    mine(ctx.benefit_uses).length > 0 || mine(ctx.saved_opps).length > 0,
    (ctx.teams || []).some(t => (t.member_ids || []).includes(me)),
    mine(ctx.replies, 'author_id').some(r => r.kind === 'ajuda'),
    !!(profile.ambassador || profile.mentor || (ctx.circles || []).some(c => c.facilitator_id === me))
  ];
  const count = done.filter(Boolean).length;
  const nextIndex = done.findIndex(d => !d);
  return { done, count, next: nextIndex === -1 ? null : { step: JOURNEY[nextIndex], action: JOURNEY_NEXT[nextIndex] } };
}

// ---------- Indicadores da coordenação (seção 17) ----------
export function indicators(d, now = Date.now()) {
  const members = (d.profiles || []).filter(p => p.onboarded);
  const recent = 30 * 86400000;
  const acts = new Map();
  const touch = (id, when) => { if (!id) return; const a = acts.get(id) || []; a.push(new Date(when).getTime()); acts.set(id, a); };
  (d.rsvps || []).forEach(x => touch(x.user_id, x.created_at));
  (d.posts || []).forEach(x => touch(x.author_id, x.created_at));
  (d.replies || []).forEach(x => touch(x.author_id, x.created_at));
  (d.connection_requests || []).forEach(x => touch(x.from_id, x.created_at));
  (d.benefit_uses || []).forEach(x => touch(x.user_id, x.created_at));
  (d.circle_members || []).forEach(x => touch(x.user_id, x.created_at));
  const active = members.filter(p => (acts.get(p.id) || []).some(t => now - t <= recent)).length;
  const recurring = members.filter(p => (acts.get(p.id) || []).length >= 2).length;
  const byProfile = Object.fromEntries(PERFIS.map(k => [k, members.filter(p => (p.perfis || []).includes(k)).length]));
  const cities = {};
  members.forEach(p => { const c = p.city || 'Sem cidade'; cities[c] = (cities[c] || 0) + 1; });
  const savings = (d.benefit_uses || []).reduce((s, x) => s + (+x.savings || 0), 0);
  const impactSum = (d.impact || []).reduce((s, x) => s + (+x.amount || 0), 0);
  const universities = new Set(members.map(p => (p.org || '').toUpperCase()).filter(o => UNIVERSITIES.some(u => o.includes(u.toUpperCase()))));
  const conns = d.connections || [];
  return {
    members: members.length,
    active,
    activeRate: members.length ? Math.round((active / members.length) * 100) : 0,
    retention: members.length ? Math.round((recurring / members.length) * 100) : 0,
    connections: conns.length,
    connectionsFromRequests: conns.filter(c => c.request_id).length,
    pendingRequests: (d.connection_requests || []).filter(r => r.status === 'curadoria').length,
    byProfile,
    cities: Object.entries(cities).sort((a, b) => b[1] - a[1]),
    businesses: members.filter(p => p.business).length,
    intraProjects: members.filter(p => p.innovation).length,
    partnersActive: (d.partners || []).filter(p => p.stage === 'Ativo').length,
    universities: universities.size,
    benefitsUsed: (d.benefit_uses || []).length,
    oppsSaved: (d.saved_opps || []).length,
    rsvps: (d.rsvps || []).length,
    value: { savings, impact: impactSum, total: savings + impactSum, contracts: (d.impact || []).filter(x => x.kind === 'Contrato').length }
  };
}

// ---------- CSV ----------
export function toCsv(rows, cols) {
  const q = v => { v = Array.isArray(v) ? v.join('; ') : v == null ? '' : String(v); return '"' + v.replace(/"/g, '""') + '"'; };
  return '﻿' + cols.map(c => q(c[1])).join(',') + '\n' + rows.map(r => cols.map(c => q(r[c[0]])).join(',')).join('\n');
}

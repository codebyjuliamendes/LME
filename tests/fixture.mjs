/* Fixture dos testes automáticos. Dados fictícios, usados só em tests/ e nunca publicados. */
const day = 86400000;
// Horários no fuso de São Luís (UTC-3), independente do fuso do navegador.
const at = (days, h = 19, m = 0) => { const d = new Date(Date.now() + days * day); d.setUTCHours(h + 3, m, 0, 0); return d.toISOString(); };
const date = days => at(days).slice(0, 10);
const ago = days => new Date(Date.now() - days * day).toISOString();

export function seed() {
  const P = (id, o) => Object.assign({ id, role: 'member', consent: true, onboarded: true, ambassador: '', mentor: false, created_at: ago(30), whatsapp: '', business: '', innovation: '' }, o);
  const profiles = [
    P('u-julia', { name: 'Júlia Mendes', email: 'julia@exemplo.com', age: 22, city: 'São Luís', org: 'UFMA', area: 'Ciência da Computação', perfis: ['Founder iniciante', 'Intraempreendedor'], interest: 'Tecnologia e startups', business: 'Secretária IA: recepcionista virtual no WhatsApp', innovation: 'Saneamento de dados com IA na empresa onde trabalho', skills: ['Produto', 'Dados', 'IA'], seeking: 'Um sócio técnico para validar um app de agendamento', offering: 'Prototipar com IA, organizar dados, pitch técnico', demo_login: true, created_at: ago(40) }),
    P('u-ana', { name: 'Ana Martins', email: 'ana@exemplo.com', age: 24, city: 'São Luís', org: 'UFMA', area: 'Administração', perfis: ['Founder iniciante'], interest: 'Comércio e serviços', business: 'Cesta Local: assinatura de produtos de pequenos produtores', skills: ['Marketing', 'Pesquisa com clientes'], seeking: 'Sócio técnico', offering: 'Pesquisa com clientes, marketing digital', role: 'coordination', demo_login: true, created_at: ago(60) }),
    P('u-rafael', { name: 'Rafael Soeiro', email: 'rafael@exemplo.com', age: 23, city: 'São Luís', org: 'UFMA', area: 'Engenharia da Computação', perfis: ['Founder iniciante'], interest: 'Tecnologia e startups', business: 'Painel de transparência de gastos públicos', skills: ['Dados abertos', 'Next.js'], seeking: 'Alguém de dados para um projeto de transparência', offering: 'Next.js, dados abertos, hackathons', created_at: ago(35) }),
    P('u-beatriz', { name: 'Beatriz Lima', email: 'beatriz@exemplo.com', age: 29, city: 'São Luís', org: 'Empresa de energia', area: 'Engenharia Elétrica', perfis: ['Intraempreendedor', 'Jovem empreendedor'], interest: 'Impacto social e sustentabilidade', business: 'Sol para Todos: energia solar compartilhada', innovation: 'Laboratório de inovação interna', skills: ['Pitch', 'Inovação aberta', 'Setor elétrico'], seeking: 'Sócio de negócios para projeto de impacto', offering: 'Pitch para diretoria, inovação aberta', ambassador: 'LME UFMA', mentor: true, created_at: ago(50) }),
    P('u-daniel', { name: 'Daniel Costa', email: 'daniel@exemplo.com', age: 27, city: 'Imperatriz', org: '', area: 'Agronomia', perfis: ['Jovem empreendedor'], interest: 'Agronegócio', business: 'App de gestão para pequenos produtores', skills: ['Agro', 'Vendas B2B'], seeking: 'Sócio de tecnologia', offering: 'Vendas B2B, contatos no agro', created_at: ago(20) }),
    P('u-larissa', { name: 'Larissa Pereira', email: 'larissa@exemplo.com', age: 31, city: 'São Luís', org: 'Banco regional', area: 'Produto digital', perfis: ['Intraempreendedor'], interest: 'Inovação corporativa', innovation: 'Laboratório de produtos digitais do banco', skills: ['Produto', 'Discovery', 'Validação'], seeking: 'Conhecer founders', offering: 'Validação de produto, discovery, publicar app na loja', mentor: true, created_at: ago(25) }),
    P('u-mateus', { name: 'Mateus Sousa', email: 'mateus@exemplo.com', age: 21, city: 'São Luís', org: 'UEMA', area: 'Engenharia de Computação', perfis: ['Founder iniciante'], interest: 'Educação', business: 'App de estudos para vestibular', skills: ['React Native', 'MVP', 'Python'], seeking: 'Primeiros clientes', offering: 'Desenvolvimento mobile e validação de MVP', created_at: ago(15) }),
    P('u-gabriel', { name: 'Gabriel Alves', email: 'gabriel@exemplo.com', age: 30, city: 'Imperatriz', org: 'Software house', area: 'Sistemas de Informação', perfis: ['Jovem empreendedor'], interest: 'Tecnologia e startups', business: 'Software house com 6 desenvolvedores', skills: ['Desenvolvimento', 'Parcerias'], seeking: 'Projetos para a equipe', offering: 'Desenvolvimento web e mobile', created_at: ago(18) }),
    P('u-thais', { name: 'Thaís Santos', email: 'thais@exemplo.com', age: 19, city: 'Caxias', org: 'IFMA', area: 'Design', perfis: ['Explorador'], interest: 'Economia criativa e cultura', skills: ['Design', 'Canva'], seeking: 'Entender como começar um negócio de design', offering: 'Identidade visual e Canva', created_at: ago(8) })
  ];

  const events = [
    { id: 'e-meetup1', title: 'LME Meetup #1: como achar seus primeiros clientes', format: 'LME Meetup', starts_at: at(6, 19), place: 'Casa do Empreendedor, Centro Histórico', city: 'São Luís', mode: 'Presencial', capacity: 60, audience: 'Comunidade', description: 'Três founders maranhenses contam como chegaram aos primeiros 10 clientes. Depois, rodadas de Founder Match.', agenda: [{ time: '19h00', item: 'Boas-vindas e apresentação dos novos membros' }, { time: '19h20', item: 'Conversa com 3 founders sobre os primeiros 10 clientes' }, { time: '20h10', item: 'Founder Match: rodadas de 7 minutos' }, { time: '20h50', item: 'Networking livre' }] },
    { id: 'e-cafe', title: 'Café com Founders', format: 'Café com Founders', starts_at: at(13, 8, 30), place: 'Coworking parceiro', city: 'Imperatriz', mode: 'Presencial', capacity: 20, audience: 'Founders', description: 'Conversa informal com quem está construindo negócios no sul do estado.', agenda: [] },
    { id: 'e-boas', title: 'Encontro de boas-vindas', format: 'Boas-vindas', starts_at: at(3, 18), place: 'Online', city: '', mode: 'Online', capacity: 40, audience: 'Novos membros', description: 'Primeiro encontro de quem acabou de entrar: como a Liga funciona, canais e Círculos.', agenda: [] },
    { id: 'e-friday', title: 'Founder Friday', format: 'Founder Friday', starts_at: at(24, 18), place: 'Online', city: '', mode: 'Online', capacity: 50, audience: 'Founders', description: 'Trocas entre founders e jovens empreendedores.', agenda: [] },
    { id: 'e-lab', title: 'LME Lab: validação de MVP', format: 'LME Labs', starts_at: at(31, 14), place: 'UEMA', city: 'São Luís', mode: 'Presencial', capacity: 25, audience: 'Founders e intraempreendedores', description: 'Laboratório prático para sair com um plano de validação em 3 semanas.', agenda: [] },
    { id: 'e-open', title: 'Open LME', format: 'Open LME', starts_at: at(38, 17), place: 'UFMA, auditório central', city: 'São Luís', mode: 'Presencial', capacity: 120, audience: 'Aberto ao público', description: 'Apresentação da comunidade para quem quer conhecer a Liga.', agenda: [] }
  ];
  const rsvps = [['e-meetup1', 'u-ana'], ['e-meetup1', 'u-rafael'], ['e-meetup1', 'u-beatriz'], ['e-meetup1', 'u-daniel'], ['e-meetup1', 'u-larissa'], ['e-boas', 'u-thais'], ['e-cafe', 'u-daniel'], ['e-cafe', 'u-gabriel'], ['e-boas', 'u-julia']].map(([e, u]) => ({ id: e + ':' + u, event_id: e, user_id: u, created_at: ago(2) }));

  const circles = [
    { id: 'c-tec', name: 'Tecnologia · São Luís', kind: 'Por área', city: 'São Luís', cadence: 'Quinzenal', capacity: 10, next_meeting: at(4, 19), place: 'Casa do Empreendedor', facilitator_id: 'u-ana' },
    { id: 'c-agro', name: 'Founders do Agro', kind: 'Por área', city: 'Imperatriz', cadence: 'Quinzenal', capacity: 8, next_meeting: at(9, 18), place: 'Imperatriz', facilitator_id: 'u-daniel' },
    { id: 'c-intra', name: 'Intraempreendedores', kind: 'Por perfil', city: 'Online', cadence: 'Mensal', capacity: 10, next_meeting: at(15, 19), place: 'Online', facilitator_id: 'u-larissa' },
    { id: 'c-primeiros', name: 'Primeiros passos', kind: 'Por estágio', city: 'São Luís', cadence: 'Quinzenal', capacity: 10, next_meeting: at(11, 17), place: 'UFMA', facilitator_id: 'u-beatriz' },
    { id: 'c-criativa', name: 'Economia criativa', kind: 'Por afinidade', city: 'São Luís', cadence: 'Mensal', capacity: 8, next_meeting: at(20, 19), place: 'Centro Histórico', facilitator_id: '' }
  ];
  const circle_members = [['c-tec', 'u-julia'], ['c-tec', 'u-ana'], ['c-tec', 'u-rafael'], ['c-tec', 'u-mateus'], ['c-tec', 'u-larissa'], ['c-tec', 'u-gabriel'], ['c-agro', 'u-daniel'], ['c-intra', 'u-larissa'], ['c-intra', 'u-beatriz'], ['c-primeiros', 'u-thais'], ['c-primeiros', 'u-beatriz']].map(([c, u]) => ({ id: c + ':' + u, circle_id: c, user_id: u, created_at: ago(10) }));
  const goals = [
    { id: 'g1', circle_id: 'c-tec', user_id: 'u-julia', text: 'Fechar 3 clientes piloto da Secretária IA', status: 'Em andamento', created_at: ago(9) },
    { id: 'g2', circle_id: 'c-tec', user_id: 'u-ana', text: 'Entrevistar 20 clientes potenciais', status: 'Concluída', created_at: ago(9) },
    { id: 'g3', circle_id: 'c-tec', user_id: 'u-rafael', text: 'Submeter projeto ao edital Inova Maranhão', status: 'Em andamento', created_at: ago(9) },
    { id: 'g4', circle_id: 'c-tec', user_id: 'u-mateus', text: 'Lançar o MVP na loja de aplicativos', status: 'Precisa de ajuda', created_at: ago(9) }
  ];
  const learnings = [
    { id: 'l1', circle_id: 'c-tec', text: 'Validar preço antes de construir economiza semanas.', created_at: ago(5) },
    { id: 'l2', circle_id: 'c-tec', text: 'O edital pede orçamento por etapa; dá para usar o modelo da FAPEMA.', created_at: ago(5) },
    { id: 'l3', circle_id: 'c-tec', text: 'Larissa vai ajudar o Mateus a publicar o app na loja.', created_at: ago(5) }
  ];

  const posts = [
    { id: 'p1', author_id: 'u-rafael', channel: 'pedidos-de-ajuda', type: 'ajuda', text: 'Alguém já participou de edital da FAPEMA com startup? Quero entender como montar o orçamento e o cronograma.', tags: ['Editais', 'Finanças'], created_at: ago(0.1) },
    { id: 'p2', author_id: 'u-beatriz', channel: 'procuro-socio', type: 'socio', text: 'Estou estruturando um projeto de energia solar para comunidades rurais e procuro alguém de negócios para dividir a liderança.', tags: ['Impacto', 'Energia'], created_at: ago(0.3) },
    { id: 'p3', author_id: 'u-daniel', channel: 'divulgue-seu-negocio', type: 'divulgacao', text: 'Lançamos o app de gestão para pequenos produtores de Imperatriz. Membros da LME têm 3 meses grátis.', tags: ['Agro', 'SaaS'], created_at: ago(1) },
    { id: 'p4', author_id: 'u-thais', channel: 'boas-vindas', type: 'conversa', text: 'Oi, gente! Sou de Caxias, estudo design no IFMA e quero entender como transformar freelas em negócio.', tags: ['Design'], created_at: ago(2) }
  ];
  const replies = [
    { id: 'r1', post_id: 'p1', author_id: 'u-larissa', kind: 'ajuda', text: 'Já ajudei a montar dois. Te mando o modelo de cronograma que usamos.', created_at: ago(0.05) },
    { id: 'r2', post_id: 'p1', author_id: 'u-julia', kind: 'resposta', text: 'O edital de 2025 aceitava orçamento por etapa. Vale conferir o anexo II.', created_at: ago(0.04) },
    { id: 'r3', post_id: 'p4', author_id: 'u-ana', kind: 'resposta', text: 'Bem-vinda, Thaís! O Círculo Primeiros passos tem vaga.', created_at: ago(1.5) }
  ];

  const connection_requests = [
    { id: 'cr1', from_id: 'u-julia', type: 'Founder + Founder', text: 'Um sócio técnico para validar um app de agendamento', until: date(14), status: 'curadoria', suggested_ids: [], created_at: ago(1) },
    { id: 'cr2', from_id: 'u-rafael', type: 'Founder + Founder', text: 'Alguém de dados para projeto de transparência', until: date(10), status: 'curadoria', suggested_ids: [], created_at: ago(2) },
    { id: 'cr3', from_id: 'u-daniel', type: 'Empreendedor + Talentos', text: 'Sócio de tecnologia para agro', until: date(20), status: 'curadoria', suggested_ids: [], created_at: ago(3) },
    { id: 'cr4', from_id: 'u-julia', type: 'Intraempreendedor + Especialista', text: 'Mentoria em finanças para startup', until: date(-5), status: 'conectado', suggested_ids: ['u-beatriz'], created_at: ago(20) }
  ];
  const connections = [
    { id: 'k1', a_id: 'u-julia', b_id: 'u-beatriz', request_id: 'cr4', note: 'Mentoria em finanças', created_at: ago(18) },
    { id: 'k2', a_id: 'u-mateus', b_id: 'u-larissa', request_id: '', note: 'Publicação na loja', created_at: ago(5) },
    { id: 'k3', a_id: 'u-daniel', b_id: 'u-gabriel', request_id: '', note: 'Sócio de tecnologia', created_at: ago(4) }
  ];

  const opportunities = [
    { id: 'o1', type: 'Edital', title: 'Inova Maranhão 2027', description: 'Fomento para startups em fase inicial no estado.', deadline: date(30), audience: 'Founders', url: '' },
    { id: 'o2', type: 'Hackathon', title: 'Hackathon da Transparência', description: 'Soluções com dados públicos do governo estadual.', deadline: date(5), audience: 'Todos', url: '' },
    { id: 'o3', type: 'Aceleração', title: 'Programa de aceleração regional', description: '12 semanas com mentoria e demo day.', deadline: date(45), audience: 'Jovens empreendedores', url: '' },
    { id: 'o4', type: 'Bolsa', title: 'Bolsa de iniciação em inovação', description: 'Para estudantes em projetos com empresas.', deadline: date(25), audience: 'Estudantes', url: '' },
    { id: 'o5', type: 'Inovação aberta', title: 'Desafio do setor de energia', description: 'Empresa parceira busca soluções para eficiência energética.', deadline: date(60), audience: 'Intraempreendedores', url: '' },
    { id: 'o6', type: 'Vaga', title: 'Estágio em produto digital', description: 'Startup de São Luís, híbrido.', deadline: date(3), audience: 'Exploradores', url: '' }
  ];
  const saved_opps = [{ id: 'o2:u-julia', opp_id: 'o2', user_id: 'u-julia', created_at: ago(1) }];

  const benefits = [
    { id: 'b1', category: 'Coworking', offer: '20% no plano mensal', description: 'Coworking no Centro Histórico de São Luís.', partner: 'Coworking parceiro', how: 'Mostre seu perfil LME na recepção.' },
    { id: 'b2', category: 'Contabilidade', offer: 'Abertura de empresa sem custo', description: 'Escritório contábil parceiro.', partner: 'Escritório contábil parceiro', how: 'Peça o código à coordenação.' },
    { id: 'b3', category: 'Jurídico', offer: '1ª consulta gratuita', description: 'Contratos, sociedade e LGPD.', partner: 'Escritório de advocacia parceiro', how: 'Agende pelo Office Hours.' },
    { id: 'b4', category: 'Marca', offer: 'Desconto no registro no INPI', description: 'Assessoria de propriedade intelectual.', partner: 'Assessoria parceira', how: 'Informe que é membro da LME.' },
    { id: 'b5', category: 'Software', offer: '6 meses de plano Pro', description: 'Ferramenta de gestão para pequenos negócios.', partner: 'Software parceiro', how: 'Use o código LME2027.' },
    { id: 'b6', category: 'Cursos', offer: '30% em cursos de vendas', description: 'Escola de negócios parceira.', partner: 'Escola de negócios parceira', how: 'Use o código LMEVENDAS.' }
  ];
  const benefit_uses = [
    { id: 'bu1', benefit_id: 'b1', user_id: 'u-julia', savings: 180, created_at: ago(12) },
    { id: 'bu2', benefit_id: 'b2', user_id: 'u-ana', savings: 900, created_at: ago(20) },
    { id: 'bu3', benefit_id: 'b5', user_id: 'u-daniel', savings: 540, created_at: ago(7) }
  ];
  const impact = [
    { id: 'i1', user_id: 'u-rafael', kind: 'Premiação', amount: 3000, description: '3º lugar no Hackathon da Transparência', created_at: ago(14) },
    { id: 'i2', user_id: 'u-mateus', kind: 'Bolsa', amount: 4800, description: 'Bolsa de iniciação em inovação', created_at: ago(9) }
  ];

  const challenges = [
    { id: 'ch1', title: 'Como reduzir perdas de energia em comunidades rurais?', org: 'Empresa do setor elétrico', status: 'Inscrições abertas', format: '6 semanas, híbrido', team_slots: 12, closes: date(20), demo_day: 'Março de 2027', description: 'Times de 3 a 5 pessoas, misturando estudantes, founders e intraempreendedores, propõem soluções para reduzir perdas de energia em comunidades rurais.' },
    { id: 'ch2', title: 'Como aproximar pesquisas de laboratório de empresas locais?', org: 'Universidade parceira', status: 'Em breve', format: '4 semanas', team_slots: 8, closes: date(70), demo_day: '', description: 'Desafio para conectar laboratórios universitários a demandas reais de empresas maranhenses.' },
    { id: 'ch3', title: 'Como digitalizar o pequeno comércio do interior?', org: 'Varejo regional', status: 'Encerrado', format: '6 semanas', team_slots: 10, closes: date(-60), demo_day: 'Setembro de 2026', description: 'Soluções simples de venda digital para comércios do interior.' }
  ];
  const teams = [
    { id: 't1', challenge_id: 'ch1', name: 'Luz no Campo', member_ids: ['u-beatriz', 'u-rafael'], looking: true, created_at: ago(3) }
  ];

  const experts = [
    { id: 'x1', name: 'Carla Ferreira', role: 'Advogada societária', area: 'Jurídico', topics: 'Contratos, acordo de sócios e abertura de empresa.' },
    { id: 'x2', name: 'Paulo Nunes', role: 'CFO de startup', area: 'Finanças', topics: 'Precificação, fluxo de caixa e captação.' },
    { id: 'x3', name: 'Renata Araújo', role: 'Head de vendas B2B', area: 'Vendas', topics: 'Primeiras vendas e funil B2B.' },
    { id: 'x4', name: 'Thiago Viana', role: 'Gerente de inovação', area: 'Inovação', topics: 'Inovação aberta e projetos internos.' }
  ];
  const slots = [];
  const add = (e, d, h, m = 0) => slots.push({ id: 's-' + e + '-' + d + '-' + h + m, expert_id: e, starts_at: at(d, h, m), booked_by: '', topic: '' });
  add('x1', 2, 10); add('x1', 2, 10, 30); add('x1', 4, 15); add('x2', 3, 9); add('x4', 5, 16); add('x4', 8, 16);

  const progress = ['m1', 'm2', 'm3'].map(m => ({ id: 'u-julia:' + m, user_id: 'u-julia', module: m, done: true, created_at: ago(6) }));

  const partners = [
    { id: 'pt1', name: 'Escola de negócios', kind: 'Conteúdo', stage: 'Primeiro contato', contact: 'contato@escola.exemplo', notes: '' },
    { id: 'pt2', name: 'Indústria de alimentos', kind: 'Desafio', stage: 'Primeiro contato', contact: '', notes: 'Indicação da Beatriz' },
    { id: 'pt3', name: 'Coworking Centro', kind: 'Benefícios', stage: 'Proposta enviada', contact: '', notes: '' },
    { id: 'pt4', name: 'IFMA', kind: 'Universidade', stage: 'Proposta enviada', contact: '', notes: 'Embaixadora em Caxias' },
    { id: 'pt5', name: 'Empresa de energia', kind: 'Desafio', stage: 'Em negociação', contact: '', notes: 'Desafio de perdas de energia' },
    { id: 'pt6', name: 'Escritório contábil', kind: 'Benefícios', stage: 'Em negociação', contact: '', notes: '' },
    { id: 'pt7', name: 'UFMA', kind: 'Universidade', stage: 'Ativo', contact: '', notes: '' },
    { id: 'pt8', name: 'UEMA', kind: 'Universidade', stage: 'Ativo', contact: '', notes: '' },
    { id: 'pt9', name: 'Banco regional', kind: 'Institucional', stage: 'Ativo', contact: '', notes: '' }
  ];
  const suggestions = [{ id: 'sg1', author_id: 'u-mateus', title: 'Prêmio de inovação para estudantes', url: '', text: 'Inscrições abertas até o fim do mês, para projetos de universidades públicas.', status: 'nova', created_at: ago(2) }];
  const settings = [{ id: 'pesquisa', survey_url: '', edition: '2027', status: 'Questionário em preparação', updated_at: ago(3) }];

  return { profiles, events, rsvps, circles, circle_members, goals, learnings, posts, replies, connection_requests, connections, opportunities, saved_opps, benefits, benefit_uses, impact, challenges, teams, experts, slots, progress, partners, suggestions, settings };
}

"""Gera as páginas estáticas do site da LME a partir de um molde comum.
Uso: python3 -I build.py <pasta-de-saida>
"""
import sys, os

OUT = sys.argv[1]
G = 1.6
S = 24 - G
R = S - G / 2


def mark(blade, gold, size=None, cls="mark"):
    dim = f' width="{size}" height="{size}"' if size else ""
    return (
        f'<svg class="{cls}"{dim} viewBox="0 0 48 48" aria-hidden="true" focusable="false">'
        f'<path d="M{G} {24-G/2} V{G} A{R} {R} 0 0 1 {24-G/2} {24-G/2} Z" fill="{blade}"/>'
        f'<path d="M{24+G/2} {G} H{48-G} A{R} {R} 0 0 1 {24+G/2} {24-G/2} Z" fill="{blade}"/>'
        f'<path d="M{48-G} {24+G/2} V{48-G} A{R} {R} 0 0 1 {24+G/2} {24+G/2} Z" fill="{gold}"/>'
        f'<path d="M{24-G/2} {48-G} H{G} A{R} {R} 0 0 1 {24-G/2} {24+G/2} Z" fill="{blade}"/>'
        "</svg>"
    )


W, H = 2000, 560
DUNES = f"""<div class="dunes" aria-hidden="true">
<svg class="l-sol" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMax slice"><defs><radialGradient id="sol" cx="1180" cy="330" r="300" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F7D9A0" stop-opacity=".55"/><stop offset=".45" stop-color="#E9B96A" stop-opacity=".18"/><stop offset="1" stop-color="#E9B96A" stop-opacity="0"/></radialGradient></defs><rect width="{W}" height="{H}" fill="url(#sol)"/></svg>
<svg class="l-fundo" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMax slice"><defs><linearGradient id="fundo" x1="0" y1="250" x2="0" y2="420" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#B89766"/><stop offset="1" stop-color="#5F5240"/></linearGradient></defs><path d="M0 312 C260 262 520 330 860 286 C1160 248 1420 262 1660 300 C1800 322 1910 300 2000 290 V{H} H0Z" fill="url(#fundo)" fill-opacity=".55"/></svg>
<svg class="l-lagoa" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMax slice"><defs><linearGradient id="lagoa" x1="0" y1="340" x2="0" y2="430" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#3CC3B4"/><stop offset=".55" stop-color="#138C8A"/><stop offset="1" stop-color="#0B5D66"/></linearGradient></defs><path d="M0 368 C380 346 760 378 1180 358 C1520 342 1780 350 2000 362 V440 H0Z" fill="url(#lagoa)"/><g fill="none" stroke-linecap="round"><path d="M120 372 C420 356 700 380 1040 364" stroke="#fff" stroke-opacity=".35" stroke-width="2"/><path d="M1220 360 C1460 350 1640 352 1860 360" stroke="#FFF4D6" stroke-opacity=".45" stroke-width="2"/><path d="M600 392 C780 386 920 390 1080 386" stroke="#fff" stroke-opacity=".18" stroke-width="1.5"/></g></svg>
<svg class="l-meio" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMax slice"><defs><linearGradient id="meio" x1="0" y1="360" x2="0" y2="520" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F1DCA6"/><stop offset="1" stop-color="#C79E5C"/></linearGradient></defs><path d="M0 418 C300 372 640 446 1040 398 C1360 360 1640 372 2000 410 V{H} H0Z" fill="url(#meio)"/></svg>
<svg class="l-frente" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMax slice"><defs><linearGradient id="frente" x1="0" y1="440" x2="0" y2="560" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#F8E9C2"/><stop offset="1" stop-color="#E0BC78"/></linearGradient></defs><path d="M0 482 C420 438 840 512 1280 468 C1600 438 1820 452 2000 478 V{H} H0Z" fill="url(#frente)"/><g fill="none" stroke="#8C6A3C" stroke-linecap="round" stroke-width="1.5"><path d="M80 506 C420 476 820 540 1260 500" stroke-opacity=".22"/><path d="M160 526 C520 500 900 556 1340 520" stroke-opacity=".18"/><path d="M60 546 C460 524 860 570 1300 542" stroke-opacity=".14"/><path d="M1420 490 C1620 476 1780 482 1960 498" stroke-opacity=".2"/></g></svg>
</div>"""

NAV = [("index.html", "Início"), ("a-liga.html", "A Liga"), ("programas.html", "Programas"), ("eventos.html", "Eventos"), ("parcerias.html", "Parcerias"), ("mapa.html", "Mapa do Jovem Empreendedor")]


def page(fname, title, desc, body, forms=False, agenda=False):
    nav = "".join(
        f'<a href="{h}"{" aria-current=\"page\"" if h == fname else ""}>{t}</a>' for h, t in NAV[1:]
    )
    scripts = '<script src="assets/lme.js" defer></script>'
    if forms:
        scripts += '\n<script src="config.js" defer></script>\n<script src="assets/forms.js" defer></script>'
    if agenda:
        scripts += '\n<script type="module" src="assets/agenda.js"></script>'
    html = f"""<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#0f1d36">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Figtree:wght@400;700&display=swap">
<link rel="stylesheet" href="assets/lme.css">
{scripts}
</head>
<body>
<a class="skip" href="#conteudo">Pular para o conteúdo</a>
<header class="top">
  <div class="wrap">
    <a class="brand" href="index.html" aria-label="Liga Maranhense de Empreendedorismo, início">{mark('#FFFFFF', '#E9C46A')}<span><b>LME</b><small>Liga Maranhense de Empreendedorismo</small></span></a>
    <button class="menu" type="button" aria-expanded="false" aria-controls="menu-principal" aria-label="Abrir menu"><span></span><span></span></button>
    <nav class="nav" id="menu-principal" aria-label="Principal">{nav}<a class="nav-login" href="app/">Entrar</a><a class="btn sun" href="participar.html">Quero participar</a></nav>
  </div>
</header>
<main id="conteudo">
{body}
</main>
<footer class="foot">
  <div class="wrap">
    <div style="display:grid;gap:12px;max-width:320px">
      <a class="brand" href="index.html">{mark('#FFFFFF', '#E9C46A')}<span><b style="color:#f4f7fb">LME</b><small>Liga Maranhense de Empreendedorismo</small></span></a>
      <p>Conectando a nova geração de empreendedores do Maranhão.</p>
    </div>
    <div class="cols">
      <div><h4>A Liga</h4><ul><li><a href="a-liga.html">Missão e visão</a></li><li><a href="a-liga.html#estrutura">Estrutura</a></li><li><a href="parcerias.html#embaixadores">Embaixadores</a></li></ul></div>
      <div><h4>Participar</h4><ul><li><a href="participar.html">Perfil LME</a></li><li><a href="programas.html">Programas</a></li><li><a href="eventos.html">Eventos</a></li><li><a href="app/">Área do membro</a></li></ul></div>
      <div><h4>Ecossistema</h4><ul><li><a href="parcerias.html">Parcerias</a></li><li><a href="parcerias.html#universidades">Universidades</a></li><li><a href="mapa.html">Mapa do Jovem Empreendedor</a></li></ul></div>
    </div>
  </div>
</footer>
</body>
</html>
"""
    with open(os.path.join(OUT, fname), "w", encoding="utf-8") as f:
        f.write(html)


def hero(eyebrow, title, lead, ctas, facts=None, inner=False):
    f = ""
    if facts:
        f = '<p class="facts">' + "".join(f"<span>{x}</span>" for x in facts) + "</p>"
    c = '<div class="row">' + "".join(ctas) + "</div>" if ctas else ""
    tag = "h1"
    cls = "display-xl"
    return f"""<section class="hero{' inner' if inner else ''}">
{DUNES}
<div class="wrap"><p class="eyebrow" style="color:var(--duna)">{eyebrow}</p><{tag} class="{cls}">{title}</{tag}><p class="lead">{lead}</p>{c}{f}</div>
</section>"""


def head(eyebrow, title, lead=None):
    l = f'<p class="lead">{lead}</p>' if lead else ""
    return f'<div class="head"><p class="eyebrow">{eyebrow}</p><h2 class="display-l">{title}</h2>{l}</div>'


def btn(label, href, kind="primary"):
    return f'<a class="btn {kind}" href="{href}">{label}</a>'


def cards(items, cols, render):
    return f'<div class="grid g{cols}">' + "".join(render(i) for i in items) + "</div>"



# ---------------- Home ----------------
home = hero(
    "Liga Maranhense de Empreendedorismo",
    "Ninguém precisa empreender sozinho.",
    "Uma comunidade para estudantes e jovens de até 34 anos que querem criar, desenvolver ou transformar negócios e organizações no Maranhão.",
    [btn("Fazer meu Perfil LME", "participar.html", "sun"), btn("Conhecer a Liga", "a-liga.html", "on-night")],
    ["Comunidade permanente", "Gratuito para membros", "Todo o Maranhão"],
)
home += f"""
<section class="band"><div class="wrap stack">{head('A Liga', 'Criar, desenvolver ou transformar.', 'A LME apoia três movimentos da trajetória empreendedora: para quem quer abrir um negócio, para quem já empreende e para quem inova dentro de uma organização.')}
{cards([('Criar','Transformar uma ideia, um problema percebido ou uma oportunidade em um novo negócio, projeto ou solução.'),('Desenvolver','Fortalecer, profissionalizar e ampliar um empreendimento ou uma iniciativa que já existe.'),('Transformar','Levar mentalidade e práticas empreendedoras para dentro de empresas, universidades e instituições.')], 3, lambda i: f'<div class="card"><p class="verb">{i[0]}</p><p class="muted">{i[1]}</p></div>')}
</div></section>
<section class="band sunk"><div class="wrap stack">{head('Perfis', 'Em que momento você está?', 'Os perfis organizam a sua jornada e podem coexistir.')}
{cards([('Começando','Explorador','Quer conhecer o ecossistema, desenvolver competências e achar oportunidades.'),('Ideia ou fase inicial','Founder iniciante','Busca apoio para validar, estruturar e desenvolver a iniciativa.'),('Negócio em operação','Jovem empreendedor','Busca crescimento, conexões, conhecimento e mercado.'),('Dentro de uma organização','Intraempreendedor','Lidera projetos, produtos e processos de inovação onde atua.')], 4, lambda i: f'<div class="card"><p class="eyebrow">{i[0]}</p><h3 class="h3">{i[1]}</h3><p class="muted">{i[2]}</p></div>')}
</div></section>
<section class="band"><div class="wrap stack">{head('O que você encontra', 'A comunidade no centro de tudo.')}
<div class="pillars"><div class="card core"><h3 class="display-l">Comunidade</h3><p>O coração da Liga: onboarding, canais por interesse, pedidos de ajuda, busca por sócios, encontros presenciais e Círculos LME.</p></div>
{cards([('Desenvolvimento','Talks, oficinas, mentorias e Labs práticos.'),('Conexões','LME Connect: founders, universidades, empresas e talentos.'),('Benefícios','Coworkings, softwares, contabilidade, jurídico e marca.'),('Oportunidades','Radar com editais, hackathons, bolsas e vagas.'),('Projetos','Desafios reais com empresas e universidades.'),('Pesquisa','Mapa anual do Jovem Empreendedor Maranhense.')], 2, lambda i: f'<div class="card"><h3 class="h3">{i[0]}</h3><p class="muted">{i[1]}</p></div>')}</div>
</div></section>
<section class="band sunk"><div class="wrap stack">{head('Programas', 'Formatos para cada momento da jornada.')}
{cards([('Conexões','LME Connect','Diga o que procura e no que pode ajudar. A Liga faz a ponte.'),('Desenvolvimento','Founder Sessions','Encontros curtos sobre vendas, finanças, jurídico e produto.'),('Oportunidades','Radar LME','Curadoria quinzenal de editais, bolsas e chamadas.'),('Projetos','LME Challenge','Empresas trazem desafios reais para times de membros.')], 4, lambda i: f'<a class="card" href="programas.html"><span class="badge lagoa">{i[0]}</span><h3 class="h3">{i[1]}</h3><p class="muted">{i[2]}</p></a>')}
<div>{btn('Ver todos os programas', 'programas.html', 'secondary')}</div>
</div></section>
<section class="band"><div class="wrap stack">{head('Eventos', 'Encontros que viram relações.')}
<div class="grid" data-agenda="3"><p class="muted">Carregando a agenda…</p></div>
</div></section>
<section class="band dark"><div class="wrap stack" style="gap:28px">{head('Para empresas e universidades', 'Uma troca de valor, não um pedido de apoio.', 'Acesse jovens talentos, empreendedores e intraempreendedores, lance desafios reais e fortaleça sua marca empregadora no Maranhão.')}
<div class="row">{btn('Quero ser parceiro', 'parcerias.html#contato', 'sun')}{btn('Conhecer modalidades', 'parcerias.html', 'on-night')}</div>
</div></section>
<section class="band sun"><div class="wrap stack" style="gap:20px">{head('Comunidade fundadora', 'Faça parte da primeira turma.', 'Preencha o Perfil LME em cerca de 5 minutos. É com ele que a Liga faz as suas conexões.')}
<div>{btn('Fazer meu Perfil LME', 'participar.html')}</div></div></section>"""
page("index.html", "Liga Maranhense de Empreendedorismo", "Comunidade para a nova geração de empreendedores e intraempreendedores maranhenses.", home, agenda=True)

# ---------------- A Liga ----------------
liga = hero("A Liga", "Uma comunidade estadual para a nova geração.", "A LME acompanha jovens em diferentes momentos: da descoberta do interesse por negócios à criação de empresas e à liderança de projetos de transformação dentro de organizações.", [btn("Fazer meu Perfil LME", "participar.html", "sun")], inner=True)
liga += f"""
<section class="band"><div class="wrap grid g2">
<div class="card" style="padding:32px"><p class="eyebrow">Missão</p><p style="font-size:18px">Fortalecer a nova geração de empreendedores e intraempreendedores maranhenses por meio de comunidade, conexões, desenvolvimento, oportunidades e projetos com impacto econômico, profissional e social no estado.</p></div>
<div class="card" style="padding:32px"><p class="eyebrow">Visão</p><p style="font-size:18px">Ser uma das principais redes de conexão e desenvolvimento de jovens empreendedores e intraempreendedores do Maranhão, aproximando talentos, negócios, empresas, universidades e instituições.</p></div>
</div></section>
<section class="band dark"><div class="wrap"><p class="quote">A LME não existe apenas para ensinar empreendedorismo. Ela existe para construir pertencimento, gerar conexões e transformar essas conexões em oportunidades, projetos, negócios e inovação.</p></div></section>
<section class="band sunk" id="estrutura"><div class="wrap stack">{head('Estrutura', 'Enxuta, para começar bem.', 'A Liga começa com cinco frentes e cria um Conselho consultivo quando amadurecer.')}
{cards([('Coordenação Geral','Estratégia, governança e representação institucional.'),('Comunidade','Onboarding, engajamento e Círculos LME.'),('Parcerias','Empresas, universidades, especialistas e benefícios.'),('Programas & Eventos','Encontros, Labs, Talks e Challenges.'),('Comunicação','Marca, redes sociais e conteúdo.')], 5, lambda i: f'<div class="card"><h3 class="h4">{i[0]}</h3><p class="muted small">{i[1]}</p></div>')}
</div></section>
<section class="band"><div class="wrap stack">{head('Jornada do membro', 'Da primeira conexão à liderança na rede.', 'A jornada foi pensada para ninguém entrar no grupo e esquecer que faz parte.')}
<ol class="grid g5" style="list-style:none;margin:0;padding:0">{''.join(f'<li class="card"><p class="eyebrow">{n:02d}</p><p>{t}</p></li>' for n, t in enumerate(['Conhece a LME e a proposta da comunidade.','Faz a inscrição e preenche o Perfil LME.','Participa de um encontro de boas-vindas.','Entra nos canais certos para o seu perfil.','Recebe ou pede as primeiras conexões.','Participa de atividades e programas.','Usa benefícios e aproveita oportunidades.','Entra em projetos e desafios com parceiros.','Compartilha o que sabe com outros membros.','Pode assumir liderança, representação ou mentoria.'], 1))}</ol>
</div></section>
<section class="band sunk"><div class="wrap stack">{head('Círculos LME', 'Grupos de 6 a 10 pessoas que se acompanham.', 'Organizados por estágio, área, cidade ou afinidade, os Círculos se reúnem periodicamente para compartilhar metas, dificuldades e aprendizados.')}
<div class="row">{''.join(f'<span class="tag">{t}</span>' for t in ['Por estágio','Por área','Por cidade','Por afinidade'])}</div>
</div></section>"""
page("a-liga.html", "A Liga — LME", "Missão, visão, estrutura e jornada do membro da Liga Maranhense de Empreendedorismo.", liga)

# ---------------- Programas ----------------
prog = hero("Programas", "Um formato para cada momento.", "A Liga ativa os programas aos poucos, conforme a comunidade cresce e as parcerias se consolidam. Todos começam pela comunidade.", [btn("Fazer meu Perfil LME", "participar.html", "sun")], inner=True)
groups = [
    ("Conexão", "Gente certa, na hora certa.", [("LME Connect", "Você conta o que procura e no que pode ajudar. A Liga faz as conexões por formulário, plataforma ou curadoria.", "Para todos"), ("Office Hours", "Janelas de atendimento com especialistas parceiros para demandas específicas.", "Founders e intraempreendedores")]),
    ("Formação", "Aprender fazendo, com quem já fez.", [("LME Talks", "Conversas com founders, executivos, pesquisadores e profissionais de inovação.", "Para todos"), ("Founder Sessions", "Encontros menores sobre vendas, marketing, finanças, jurídico, produto e gestão.", "Founders"), ("LME Labs", "Laboratórios curtos e práticos: MVP, validação, processos e inovação interna.", "Founders e intraempreendedores"), ("Founder School", "Trilha estruturada com os fundamentos do empreendedorismo.", "Exploradores")]),
    ("Oportunidades e projetos", "Caminhos que você talvez não encontrasse sozinho.", [("Radar LME", "Curadoria semanal ou quinzenal de editais, bolsas, eventos e chamadas.", "Para todos"), ("LME Challenge", "Empresas e instituições apresentam desafios reais para times de membros.", "Estudantes, founders e intraempreendedores")]),
    ("Ecossistema", "Conhecimento e impacto para o Maranhão.", [("LME Research", "Estudos sobre empreendedorismo e inovação no estado.", "Pesquisadores e parceiros"), ("LME Impact", "Empreendedorismo social, sustentabilidade e soluções de impacto.", "Para todos"), ("LME University", "Projetos com universidades e seus ecossistemas de inovação.", "Estudantes e professores")]),
]
for gi, (g, sub, items) in enumerate(groups):
    cols = 2 if len(items) == 2 else (4 if len(items) == 4 else 3)
    prog += f"""<section class="band{' sunk' if gi % 2 else ''}"><div class="wrap stack">{head(g, sub)}
{cards(items, cols, lambda i: f'<div class="card" style="padding:28px"><h3 class="h3">{i[0]}</h3><p class="muted">{i[1]}</p><p class="row small muted" style="gap:8px">Para quem: <span class="badge lagoa">{i[2]}</span></p></div>')}
</div></section>"""
prog += f"""<section class="band sun"><div class="wrap stack" style="gap:16px">{head('Comece pelo perfil', 'Os programas partem do seu Perfil LME.', 'Ele diz à Liga em que momento você está e quais formatos fazem sentido para você.')}<div>{btn('Fazer meu Perfil LME', 'participar.html')}</div></div></section>"""
page("programas.html", "Programas — LME", "LME Connect, Talks, Founder Sessions, Labs, Founder School, Radar, Challenge e mais.", prog)

# ---------------- Eventos ----------------
ev = hero("Eventos", "Encontros que viram relações.", "Formatos próprios da Liga, com consistência ao longo do ano.", [btn("Fazer meu Perfil LME", "participar.html", "sun")], inner=True)
ev += f"""<section class="band"><div class="wrap stack">{head('Agenda', 'Próximos encontros', 'A agenda é publicada pela coordenação da Liga. Membros confirmam presença pela área do membro.')}
<div class="grid" data-agenda="8"><p class="muted">Carregando a agenda…</p></div>
</div></section>
<section class="band sunk"><div class="wrap stack">{head('Formatos', 'Os encontros da Liga')}
{cards([('LME Meetup','Encontro periódico: networking, conteúdo e conexão.'),('Café com Founders','Encontro informal com quem está construindo negócios.'),('Founder Friday','Encontro mensal de trocas entre founders.'),('LME Talks','Palestras, entrevistas e conversas.'),('Founder Match','Dinâmica para achar sócios e competências complementares.'),('Open LME','Evento aberto para conhecer a comunidade.'),('Demo Day LME','Apresentação de negócios e projetos dos membros.'),('LME Challenge','Desafios reais de empresas e instituições.'),('LME Summit','O grande encontro anual da comunidade e do ecossistema.')], 3, lambda i: f'<div class="card"><h3 class="h3">{i[0]}</h3><p class="muted">{i[1]}</p></div>')}
</div></section>"""
page("eventos.html", "Eventos — LME", "Meetups, Talks, Founder Friday, Demo Day e o LME Summit.", ev, agenda=True)

# ---------------- Parcerias ----------------
par = hero("Para empresas e universidades", "Acesse a nova geração de talentos e negócios do Maranhão.", "A LME não pede apenas apoio. Ela oferece acesso qualificado a jovens talentos, empreendedores e intraempreendedores, além de projetos, desafios e presença no ecossistema.", [btn("Quero ser parceiro", "#contato", "sun")], inner=True)
par += f"""<section class="band"><div class="wrap stack">{head('Modalidades', 'Cinco formas de fazer parte.')}
{cards([('Institucional','Apoia a Liga de forma ampla e recorrente.'),('Benefícios','Oferece vantagens concretas aos membros.'),('Programa','Apoia ou coexecuta uma iniciativa específica.'),('Desafio','Apresenta um problema real para um LME Challenge.'),('Conteúdo','Disponibiliza especialistas, conteúdos ou capacitações.')], 5, lambda i: f'<div class="card"><h3 class="h3 blue">{i[0]}</h3><p class="muted small">{i[1]}</p></div>')}
</div></section>
<section class="band sunk" id="universidades"><div class="wrap grid g2">
<div class="card" style="padding:32px;gap:14px"><p class="eyebrow">Empresas</p><h2 class="h2">Intraempreendedorismo como valor</h2><ul class="check">{''.join(f'<li>{x}</li>' for x in ['Participação de colaboradores nas atividades da comunidade','Formação em intraempreendedorismo e inovação','Desafios corporativos e programas de inovação aberta','Projetos com membros da Liga','Conexão com startups, pesquisadores e estudantes','Identificação de jovens talentos com perfil empreendedor','Desenvolvimento de lideranças inovadoras','Experimentação de novos produtos, serviços e processos'])}</ul></div>
<div class="card" style="padding:32px;gap:14px"><p class="eyebrow">Universidades</p><h2 class="h2">Ponte entre academia e ecossistema</h2><ul class="check">{''.join(f'<li>{x}</li>' for x in ['Incentivo ao empreendedorismo e ao intraempreendedorismo','Integração entre estudantes de diferentes cursos','Aproximação com empresas e organizações','Projetos e desafios aplicados','Eventos, oficinas e programas de desenvolvimento','Extensão, pesquisa e inovação','Visibilidade para projetos e negócios de estudantes','Conexão com o ecossistema de inovação do Maranhão'])}</ul></div>
</div></section>
<section class="band" id="embaixadores"><div class="wrap stack" style="gap:24px">{head('Embaixadores LME', 'Uma Liga estadual, presente em cada campus.', 'Um ou dois embaixadores por instituição divulgam oportunidades, mobilizam estudantes, organizam encontros locais e representam o campus junto à coordenação.')}
<div class="row">{''.join(f'<span class="badge{" duna" if u.startswith("+") else ""}">{u}</span>' for u in ['LME UFMA','LME UEMA','LME IFMA','LME CEUMA','+ sua instituição'])}</div>
</div></section>
<section class="band dark" id="contato"><div class="wrap split">
<div class="head"><p class="eyebrow">Vamos conversar</p><h2 class="display-l">Conte o que sua organização busca.</h2><p class="lead">A equipe de Parcerias responde e propõe o formato que gera mais valor para os dois lados.</p></div>
<form class="form" id="parceria-form" novalidate>
<p class="status info" id="parceria-gate" hidden></p>
<fieldset><legend>Quero ser parceiro</legend>
<div class="field"><label for="p-nome">Seu nome</label><input id="p-nome" type="text" autocomplete="name" required></div>
<div class="field"><label for="p-org">Empresa ou instituição</label><input id="p-org" type="text" autocomplete="organization" required></div>
<div class="field"><label for="p-tipo">Tipo de parceria</label><select id="p-tipo" required><option value="">Escolha um tipo</option><option>Institucional</option><option>Benefícios</option><option>Programa</option><option>Desafio</option><option>Conteúdo</option><option>Ainda não sei</option></select></div>
<div class="field"><label for="p-contato">E-mail ou telefone</label><input id="p-contato" type="text" required></div>
<div class="field"><label for="p-msg">O que você tem em mente? <span class="opt">(opcional)</span></label><textarea id="p-msg"></textarea></div>
</fieldset>
<div><button class="btn primary" type="submit" id="parceria-submit">Enviar interesse</button></div>
<p class="status" id="parceria-status" role="status" aria-live="polite" hidden></p>
</form>
</div></section>"""
page("parcerias.html", "Parcerias — LME", "Modalidades de parceria com a LME para empresas, universidades e instituições.", par, forms=True)

# ---------------- Mapa ----------------
mapa = hero("Pesquisa anual", "Mapa do Jovem Empreendedor Maranhense", "Uma pesquisa anual sobre juventude, empreendedorismo e inovação no Maranhão, com quem tem negócio, com intraempreendedores e com quem está se preparando.", [btn("Quero apoiar a pesquisa", "parcerias.html#contato", "sun")], inner=True)
mapa += f"""<section class="band sun" style="padding-block:48px"><div class="wrap grid g3">
{''.join(f'<div class="head"><p class="display-l" style="color:var(--azulejo)">{n}</p><p class="muted">{l}</p></div>' for n, l in [('1ª edição','Relatório do Empreendedorismo Jovem Maranhense'),('3 públicos','Quem empreende, quem inova dentro de organizações e quem se prepara'),('Aberto','Resultados publicados para universidades, empresas e órgãos públicos')])}
</div></section>
<section class="band"><div class="wrap stack">{head('O que vamos medir', 'Temas da pesquisa')}
{cards([('Perfil','Idade, formação e localização'),('Negócios','Setores e tipos de negócio'),('Barreiras','Principais dificuldades para empreender'),('Capital','Acesso a crédito e investimento'),('Estágio','Receita e estágio dos negócios'),('Tecnologia','Uso de ferramentas digitais'),('Apoio','Relação com universidades e programas'),('Intraempreendedorismo','Projetos de inovação dentro de organizações'),('Necessidades','Capacitação e conexão'),('Ecossistema','Percepção sobre o ecossistema maranhense')], 5, lambda i: f'<div class="card"><h3 class="h4" style="color:var(--azulejo)">{i[0]}</h3><p class="muted small">{i[1]}</p></div>')}
</div></section>
<section class="band sunk"><div class="wrap stack">{head('Como funciona', 'Da coleta ao relatório')}
{cards([('01','Coleta','Questionário online e presencial nos campi, com apoio dos Embaixadores.'),('02','Análise','Em parceria com universidades e com a frente LME Research.'),('03','Relatório','Publicação aberta, com recortes por cidade, setor e perfil.'),('04','Ação','Os resultados orientam programas, parcerias e políticas públicas.')], 4, lambda i: f'<div class="card"><p style="font:800 40px/1 var(--display);color:var(--lagoa)">{i[0]}</p><h3 class="h3">{i[1]}</h3><p class="muted">{i[2]}</p></div>')}
</div></section>"""
page("mapa.html", "Mapa do Jovem Empreendedor — LME", "Pesquisa anual sobre juventude, empreendedorismo e inovação no Maranhão.", mapa)

# ---------------- Participar (Perfil LME) ----------------
chips = "".join(
    f'<label class="chip"><input type="checkbox" name="perfis" value="{v}"><span><b>{v}</b><span>{d}</span></span></label>'
    for v, d in [("Explorador", "Ainda sem ideia estruturada"), ("Founder iniciante", "Ideia, projeto ou negócio inicial"), ("Jovem empreendedor", "Já opera um negócio"), ("Intraempreendedor", "Inova dentro de uma organização")]
)
areas = "".join(f"<option>{a}</option>" for a in ["Tecnologia e startups", "Comércio e serviços", "Agronegócio", "Indústria", "Economia criativa e cultura", "Saúde", "Educação", "Impacto social e sustentabilidade", "Inovação corporativa", "Pesquisa e desenvolvimento", "Outra"])
cidades = "".join(f'<option value="{c}">' for c in ["São Luís", "Imperatriz", "São José de Ribamar", "Paço do Lumiar", "Timon", "Caxias", "Codó", "Bacabal", "Balsas", "Santa Inês", "Pinheiro", "Chapadinha", "Barreirinhas"])
orgs = "".join(f'<option value="{c}">' for c in ["UFMA", "UEMA", "IFMA", "CEUMA", "UNDB"])
part = hero("Perfil LME", "Faça parte da comunidade fundadora.", "O Perfil LME ajuda a Liga a entender em que momento você está, o que procura e como pode ajudar. É com ele que fazemos as conexões.", None, ["Cerca de 5 minutos", "Gratuito", "Só a coordenação vê as respostas"], inner=True)
part += f"""<section class="band sunk"><div class="wrap split">
<div class="head" style="position:sticky;top:96px"><p class="eyebrow">Como funciona</p><h2 class="h2">Depois do envio</h2>
<ol class="steps grid" style="list-style:none;margin:8px 0 0;padding:0;gap:16px">
<li><span class="n">1</span><span>A equipe Comunidade lê o seu perfil.</span></li>
<li><span class="n">2</span><span>Você recebe o convite para o encontro de boas-vindas.</span></li>
<li><span class="n">3</span><span>Entra nos canais certos e recebe as primeiras conexões.</span></li></ol></div>
<form class="form" id="perfil-form" novalidate>
<p class="status info" id="perfil-gate" hidden></p>
<fieldset><legend>Sobre você</legend>
<div class="field"><label for="nome">Nome completo</label><input id="nome" type="text" autocomplete="name" required></div>
<div class="two"><div class="field"><label for="idade">Idade</label><input id="idade" type="number" inputmode="numeric" min="14" max="99" required><p class="help" id="idade-help">A LME prioriza estudantes e jovens de até 34 anos.</p></div>
<div class="field"><label for="cidade">Cidade</label><input id="cidade" type="text" list="cidades" autocomplete="address-level2" required><datalist id="cidades">{cidades}</datalist></div></div>
<div class="two"><div class="field"><label for="email">E-mail</label><input id="email" type="email" autocomplete="email" placeholder="nome@exemplo.com" required></div>
<div class="field"><label for="whatsapp">WhatsApp <span class="opt">(opcional)</span></label><input id="whatsapp" type="tel" autocomplete="tel" placeholder="(98) 90000-0000"></div></div>
<div class="two"><div class="field"><label for="organizacao">Universidade, empresa ou organização</label><input id="organizacao" type="text" list="orgs" required><datalist id="orgs">{orgs}</datalist></div>
<div class="field"><label for="area">Curso ou área de atuação</label><input id="area" type="text" required></div></div>
</fieldset>
<fieldset aria-describedby="perfis-help"><legend>Seu momento</legend>
<p class="help" id="perfis-help">Marque todos os perfis que combinam com você.</p>
<div class="chips">{chips}</div><p class="err" id="perfis-err" hidden>Escolha pelo menos um perfil.</p>
<div class="field"><label for="interesse">Área de interesse</label><select id="interesse" required><option value="">Escolha uma área</option>{areas}</select></div>
<div class="field"><label for="negocio">Negócio ou projeto <span class="opt">(se tiver)</span></label><textarea id="negocio" placeholder="Nome e uma frase sobre o que ele faz"></textarea></div>
<div class="field"><label for="inovacao">Projetos de inovação de que participa <span class="opt">(se tiver)</span></label><textarea id="inovacao"></textarea></div>
<div class="field"><label for="competencias">Competências</label><input id="competencias" type="text" placeholder="Ex.: vendas, design, programação, finanças" required></div>
</fieldset>
<fieldset><legend>Conexões</legend>
<div class="field"><label for="procurando">Estou procurando…</label><textarea id="procurando" placeholder="Ex.: um sócio técnico, mentoria em finanças, um estágio" required></textarea></div>
<div class="field"><label for="ajudar">Posso ajudar com…</label><textarea id="ajudar" placeholder="Ex.: revisar pitch, apresentar pessoas do agro, ensinar Canva" required></textarea></div>
</fieldset>
<label class="consent"><input type="checkbox" id="consentimento" required><span>Autorizo a LME a usar estes dados para me conectar a membros e parceiros e para falar comigo sobre a comunidade.</span></label>
<p class="err" id="consent-err" hidden>Para enviar, autorize o uso dos dados.</p>
<div><button class="btn primary" type="submit" id="perfil-submit">Enviar meu Perfil LME</button></div>
<p class="status" id="perfil-status" role="status" aria-live="polite" hidden></p>
</form></div></section>"""
page("participar.html", "Perfil LME — Participar", "Faça o seu Perfil LME e entre para a comunidade fundadora da Liga Maranhense de Empreendedorismo.", part, forms=True)

# ---------------- 404 ----------------
nf = hero("Página não encontrada", "Esse caminho não leva a lugar nenhum.", "Mas a comunidade continua aqui.", [btn("Voltar para o início", "index.html", "sun")], inner=True)
page("404.html", "Página não encontrada — LME", "Página não encontrada.", nf)

# ---------------- Logo files ----------------
with open(os.path.join(OUT, "favicon.svg"), "w") as f:
    f.write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">' + mark("#1D4ED8", "#E9B949").split(">", 1)[1].replace(' class="mark"', ""))
os.makedirs(os.path.join(OUT, "assets", "marca"), exist_ok=True)
for name, b, g in [("simbolo-azul.svg", "#1D4ED8", "#E9B949"), ("simbolo-branco.svg", "#FFFFFF", "#E9C46A")]:
    with open(os.path.join(OUT, "assets", "marca", name), "w") as f:
        f.write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">' + mark(b, g).split(">", 1)[1])
print("ok")

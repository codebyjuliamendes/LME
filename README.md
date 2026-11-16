# Liga Maranhense de Empreendedorismo

Site e plataforma da LME, comunidade para a nova geração de empreendedores e intraempreendedores maranhenses.

HTML, CSS e JavaScript, sem framework e sem etapa de build. O design vem do arquivo do Figma "LME — Produto completo": site público, área do membro, painel da coordenação e marca.

## Páginas

| Arquivo | Conteúdo |
|---|---|
| `index.html` | Início |
| `a-liga.html` | Missão, visão, estrutura, jornada do membro e Círculos |
| `programas.html` | Os 11 programas da Liga |
| `eventos.html` | Agenda e formatos de evento |
| `parcerias.html` | Modalidades, empresas, universidades, Embaixadores e formulário de parceria |
| `mapa.html` | Mapa do Jovem Empreendedor Maranhense |
| `participar.html` | Formulário do Perfil LME |

## Plataforma (`app/`)

A área do membro e o painel da coordenação ficam em `app/` e abrem pelo link **Entrar** do site.

**Área do membro:** Início com a jornada de 10 etapas, LME Connect (pedidos de conexão com sugestões automáticas), Comunidade por canais, Membros e perfis, Meu perfil (com registro de bolsas, prêmios e contratos), Círculos (metas e aprendizados), Agenda com confirmação de presença e arquivo .ics, Radar de oportunidades, Benefícios, LME Challenges com times, Office Hours com agendamento e LME Founder School com certificado.

**Coordenação:** Indicadores (com exportação CSV), Membros e fila de curadoria de conexões, Parcerias em kanban (arrastar e soltar), Programas e eventos (com lista de inscritos), Círculos, Challenges, Office Hours (especialistas e horários), Radar (inclui indicações dos membros), Benefícios, Embaixadores e Pesquisa anual.

### Como funciona no ar

O GitHub Pages publica só o front-end (`https://codebyjuliamendes.github.io/LME/`). O back-end é o **Supabase**: banco de dados, login por link no e-mail e regras de acesso. O app conversa direto com o Supabase pelo navegador, então não há servidor para manter.

Não há dados de exemplo. O banco começa vazio e a coordenação cadastra eventos, Círculos, desafios, especialistas e horários de Office Hours, benefícios e oportunidades pelo painel. A agenda do site público lê os próximos eventos do mesmo banco.

Enquanto `app/js/config.js` estiver vazio, a área do membro publicada mostra "Estamos preparando a plataforma" e a agenda do site mostra "Próximas datas em breve".

**Ligar o back-end (uma vez só):**

1. Crie um projeto gratuito em supabase.com.
2. Em **SQL Editor**, cole e rode `supabase/schema.sql`. Ele cria as tabelas e as regras de acesso: cada pessoa edita só o que é seu, a coordenação edita tudo e ninguém se promove sozinho.
3. Em **Authentication → URL Configuration**, coloque `https://codebyjuliamendes.github.io/LME/app/` em **Site URL** e em **Redirect URLs**.
4. Em **Project Settings → API**, copie a **Project URL** e a chave **anon public** para `app/js/config.js` e faça commit. A chave `anon` é pública por natureza; a proteção vem das regras do banco.
5. Entre no app com seu e-mail, conclua o cadastro e se promova a coordenação no SQL Editor:
   `update public.profiles set role = 'coordination' where email = 'seu@email';`
   A partir daí, outras pessoas da coordenação são promovidas pelo próprio painel (Membros e curadoria).

No Supabase, e-mail e WhatsApp do perfil ficam visíveis para membros logados, porque a curadoria de conexões depende disso. Avise no cadastro ou ajuste a política `read_all` de `profiles` se a Liga preferir outro arranjo.

**Desenvolvimento local:** em `localhost` sem Supabase, o app usa um banco vazio guardado no navegador, e a primeira pessoa cadastrada vira coordenação.

### Código

- `app/js/main.js`: rotas (`#/rota`), menu e controle de acesso.
- `app/js/store.js`: camada de dados (Supabase no ar, banco local em desenvolvimento).
- `app/js/logic.js`: regras de negócio puras (sugestão de conexões, jornada, indicadores, CSV), testadas em `tests/logic.test.mjs` com `node --test tests/logic.test.mjs` (os dados fictícios de `tests/fixture.mjs` existem só para os testes e não são publicados).
- `app/js/views/`: uma tela por arquivo, cada uma com `render(ctx)` e `mount(root, ctx)`.
- `assets/agenda.js`: agenda pública do site, lida do Supabase.

## Como editar o site público

As páginas são geradas por `scripts/build.py`, que guarda o cabeçalho, o rodapé, a logo e a ilustração das dunas num lugar só. Edite o texto no gerador e rode:

```bash
python3 scripts/build.py .
```

Faça commit do gerador e das páginas geradas. O GitHub Actions confere se os dois estão em dia.

Estilos ficam em `assets/lme.css` (tokens do Figma no topo) e o menu mobile em `assets/lme.js`.

## Formulários (Google Forms)

O Perfil LME e o interesse de parceiros vão para Google Forms. Enquanto `config.js` não tiver os endereços, a página mostra "As inscrições abrem em breve".

1. Crie um formulário com uma pergunta para cada campo de `config.js`. Em "Seu momento", use caixas de seleção com as opções Explorador, Founder iniciante, Jovem empreendedor e Intraempreendedor, escritas exatamente assim.
2. Em "Obter link pré-preenchido", preencha cada pergunta com o nome do campo e copie o link.
3. Em `config.js`, coloque em `action` o endereço do formulário trocando `/viewform` por `/formResponse` e, em `fields`, o código `entry.NNNN` de cada pergunta.

## Movimento

A ilustração das dunas se move em paralaxe (7 s por direção), o texto do topo entra com fade e os botões e cards reagem ao mouse. Tudo é desligado para quem pede menos movimento no sistema (`prefers-reduced-motion`).

## Publicar

Em **Settings → Pages**, escolha **GitHub Actions** como fonte. Cada push na `main` testa a lógica do app, confere links e publica site e app juntos.

## Rodar localmente

```bash
python3 -m http.server 8000
```

Site em http://localhost:8000 e app em http://localhost:8000/app/.

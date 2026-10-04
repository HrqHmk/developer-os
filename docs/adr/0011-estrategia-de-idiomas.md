# ADR-0011 — Estratégia de Idiomas (EN / PT-BR)

## Status
Proposto

Introduzido pelo PR da Issue #83 (Eval Case 003). A arquitetura descrita aqui foi **aprovada para implementação** no gate humano do Implementation Plan v2 da Issue #83; a transição de **Proposto** para **Aceito** é reservada ao gate humano na revisão do PR, depois de validadas a implementação e as hipóteses técnicas.

## Contexto

O Developer OS é uma vitrine profissional de um engenheiro que vive e trabalha no Brasil, mas até a Issue #83 existia apenas em inglês. Visitantes brasileiros só conseguiam lê-lo em português por tradução automática do navegador — fora do controle do projeto, de qualidade variável e sem ser uma experiência oferecida intencionalmente.

A Issue #83 exige que o português do Brasil seja uma experiência de primeira classe, fornecida pelo próprio Developer OS, preservando integralmente a experiência em inglês. Restrições herdadas que moldam a solução:

- o artefato é **pré-renderizado e servido como ativo estático** (`architecture.md` §9, ADR-0006) — não há lógica por requisição para negociar idioma;
- o conteúdo é **dado versionado, validado em build** (ADR-0003, P1–P9);
- a regra do projeto contra **abstração especulativa** (`architecture.md` §2): dois idiomas e um conjunto fechado de textos não justificam um sistema genérico de i18n.

## Decisão

### 1. Propriedades

- **I1 — Inglês permanece nas URLs existentes.** Nenhuma URL em inglês muda.
- **I2 — PT-BR vive sob o prefixo `/pt-br`, com os mesmos segmentos de caminho e os mesmos slugs.** `/about` ↔ `/pt-br/about`, `/blog/<slug>` ↔ `/pt-br/blog/<slug>`, `/` ↔ `/pt-br`. A equivalência entre idiomas é uma transformação pura de prefixo, sem tabela de mapeamento. Slugs são identificadores técnicos estáveis (`conventions.md` §8.1); identificadores técnicos em inglês na URL não são considerados experiência de idioma misturado.
- **I3 — A URL é a única fonte de verdade do idioma.** Inglês é o padrão. Não há detecção por `Accept-Language`, não há redirect por idioma do navegador e não há preferência persistida.
- **I4 — Trocar de idioma é navegar para a página equivalente.** O seletor de idioma é um link para a URL correspondente no outro idioma. Fragmentos (`#âncora`) e estado de página (como a consulta da Busca) não são preservados — a página equivalente é o contrato.
- **I5 — Paridade obrigatória para todo conteúdo público próprio.** Todo conteúdo público de primeira parte existe em inglês e em PT-BR, inclusive o que for criado depois deste ADR. A ausência de tradução **falha o build** (ou a verificação de tipos), nunca degrada silenciosamente para inglês. Ficam fora da regra: nomes de produto, nomes próprios, termos técnicos, assets de marca compartilhados (como a imagem Open Graph) e superfícies externas de terceiros (como as páginas do Buttondown).
- **I6 — O idioma de cada página é exposto no documento.** `<html lang>` segue a URL (`en` / `pt-BR`); cada página declara suas alternativas com `hreflang` (`en`, `pt-BR`, `x-default` → inglês).
- **I7 — RSS permanece somente em inglês nesta fase.** `/rss.xml` não muda; não há feed PT-BR, e páginas PT-BR não anunciam o feed inglês. É uma decisão de escopo, não uma limitação técnica.

### 2. Implementação inicial

- **Rotas espelhadas explícitas.** Cada página PT-BR é um arquivo de rota fino em `src/routes/pt-br/`, espelhando a rota inglesa. O corpo das páginas vive em componentes compartilhados (`src/components/*-page.tsx`) que recebem `locale` e, quando é o caso, os dados do idioma.
- **Primitivas de idioma** em `src/lib/locale.ts`: o tipo `Locale = 'en' | 'pt-br'` e funções puras (`localeFromPathname`, `localizedPath`, `counterpartPath`, `htmlLang`, `localePrefix`). Não há registro de páginas nem lista de idiomas além dos dois literais.
- **Textos de interface co-locados** com o componente que os exibe, como `Record<Locale, typeof COPY_EN>`: uma chave ausente em PT-BR é erro de compilação (I5).
- **Conteúdo em Markdown**: a tradução vive no **mesmo diretório da entrada**, em `index.pt-br.md`, ao lado de `index.md` — a entrada continua autocontida e compartilha imagens por caminho relativo (P8). `buildLocalized<Tipo>()` constrói os dois idiomas e chama `assertLocaleParity`, que falha o build se faltar tradução, se sobrar tradução sem original, ou se campos que descrevem a entrada (e não sua prosa) divergirem — `publishedAt`, `date`, `technologies`, `repositoryUrl`.
- **Conteúdo estruturado** (`learning.ts`, `uses.ts`) passa a ser `Record<Locale, …>` no mesmo módulo; um teste garante a mesma forma, a mesma ordem e as mesmas referências nos dois idiomas.
- **Módulos virtuais e Busca** são indexados por idioma (`Record<Locale, …>`). Cada rota de Busca recebe só o índice do seu idioma; resultados nunca misturam idiomas.
- **Não encontrado**: `defaultNotFoundComponent` do router responde no idioma da URL, com o mesmo formato mínimo de antes.

### 3. Fora do escopo desta decisão

- Idiomas além de inglês e PT-BR, tradução automática ou em runtime, APIs de tradução, CMS ou serviço de tradução.
- Segmentos de URL ou slugs traduzidos.
- Feed RSS localizado (pode virar Issue própria se houver necessidade concreta).
- Normalização de acentos na Busca.

## Consequências

### Prós

- URLs em inglês e comportamento em inglês preservados (o HTML pré-renderizado em inglês muda apenas pelos acréscimos de `lang`, `hreflang`, `og:locale` e do seletor de idioma).
- Equivalência determinística e testável entre idiomas, sem tabela que possa divergir.
- Nenhuma dependência nova; nenhuma lógica por requisição; rotas PT-BR estáticas entram na descoberta automática de prerender como as inglesas.
- Esquecer uma tradução falha alto — no build ou na verificação de tipos — em vez de vazar inglês para a experiência PT-BR.

### Contras e riscos

- **Custo permanente de manutenção.** Toda mudança de conteúdo ou de texto de interface passa a exigir os dois idiomas. É intencional (I5), mas é custo real.
- **Deriva de prosa não é detectável.** A paridade garante que a tradução existe e que os campos invariantes coincidem, não que o texto em PT-BR acompanhou uma edição posterior do inglês. Depende de revisão.
- **Arquivos de rota duplicados.** São wrappers finos sobre um componente compartilhado, mas existem em dobro; uma rota nova precisa nascer nos dois idiomas.
- **Ambos os idiomas no mesmo módulo virtual** aumentam o payload de cada chunk que o importa. Aceito pelo volume atual; separar por idioma é a saída se o tamanho importar.
- **Sem framework E2E permanente.** O comportamento que só o navegador revela (troca de idioma, navegação direta, refresh, layout responsivo, foco) foi verificado como evidência de execução no PR da Issue #83, não como suíte de regressão. Depois do merge, ele fica protegido apenas pelos testes unitários/de componente e pelo build.
- **URLs PT-BR contêm palavras em inglês** (`/pt-br/about`). Aceito por decisão humana (I2).

## Gatilhos de reavaliação

- Necessidade concreta de um terceiro idioma.
- Necessidade de conteúdo público de primeira parte em um único idioma — que exigiria revisar I5, não contorná-la.
- Demanda real por feed RSS em PT-BR.
- Crescimento do conteúdo a ponto de o payload duplicado nos módulos virtuais pesar.
- Surgimento do primeiro fluxo E2E obrigatório (ADR-0005 T9/T10) que inclua a troca de idioma.

## Alternativas consideradas

- **Uma única árvore de rotas com parâmetro opcional `{-$locale}`.** Evitaria os arquivos de rota duplicados, mas transformaria toda rota estática em rota com parâmetro — tirando-as da descoberta automática de prerender e obrigando a enumerar todos os caminhos dos dois idiomas —, exigiria validar primeiros segmentos arbitrários (`/xx/about`) como 404 e introduziria ambiguidade de ranqueamento entre `/{-$locale}` e segmentos estáticos (`/blog`). Descartada.
- **Biblioteca de i18n** (react-i18next, Paraglide etc.). Dois idiomas e um conjunto fechado de textos não justificam a dependência nem a camada de mensagens. Descartada.
- **Segmentos e slugs traduzidos** (`/pt-br/sobre`). Exigiriam mapeamento bidirecional sem ganho para os critérios da missão. Descartada por decisão humana.
- **Detecção de idioma / redirect por `Accept-Language` / preferência persistida.** Exigiria lógica por requisição num artefato servido como ativo estático, mudaria o comportamento das URLs em inglês e tornaria a escolha implícita em vez de intencional. Descartada por decisão humana.
- **Feed RSS PT-BR.** Descartado do escopo por decisão humana; pode voltar como Issue própria.
- **Introduzir Playwright para cobrir a troca de idioma.** Descartado por decisão humana nesta missão: o comportamento foi verificado como evidência de execução, sem suíte E2E permanente.

# Conventions

## 1. Objetivo e Escopo

Este documento registra **convenções de implementação** derivadas das decisões arquiteturais já tomadas. Serve como referência prática para humanos e agentes de IA durante implementação e manutenção.

O que ele **não** é:

- não substitui os ADRs em `docs/adr/`, que registram as decisões e seus trade-offs;
- não substitui `docs/architecture.md`, que define princípios e restrições arquiteturais;
- não substitui `docs/design-system.md`, que é a fonte única de verdade visual.

Em caso de conflito, **ADRs aceitos prevalecem** sobre os demais documentos.

Fora de conflitos com ADRs, cada documento é a fonte de verdade dentro do seu escopo:

| Documento | Escopo |
|---|---|
| `docs/architecture.md` | Arquitetura |
| `docs/design-system.md` | Decisões visuais e tokens |
| `docs/conventions.md` | Convenções de implementação |

Este documento não introduz decisões arquiteturais. Ver §8 para o fluxo de atualização.

---

## 2. Versões e Dependências

- Versões relevantes da stack devem ser **fixadas**, não flutuantes.
- Para dependências instaladas, o **lockfile é a referência**.
- Comandos documentados **não devem usar `latest`** quando a versão fizer parte do controle de mudanças.

### Gerenciador de pacotes e runtime

- **pnpm** é o gerenciador de pacotes do projeto, declarado em `packageManager` no `package.json`. Instalação em CI e em máquina nova usa `pnpm install --frozen-lockfile`, nunca resolução implícita a partir do `lockfile`.
- A versão do **Node** é fixada por `.nvmrc`, na raiz do repositório. A linha ativa (LTS) é preferida sobre a de manutenção, para não expirar durante a Fase 1 do roadmap.
- `pnpm-workspace.yaml` é **versionado**: além de declarar o workspace, ele registra `allowBuilds` (scripts de post-install liberados para dependências como `esbuild` e `workerd`, exigidos pelo Vite e pelo Wrangler).
- **`minimumReleaseAgeExclude`**, no mesmo arquivo, é exceção à política `minimumReleaseAge` do pnpm — a partir da 11.x, o pnpm recusa por padrão pacotes publicados há menos de 1440 minutos (24h), **mesmo sob `--frozen-lockfile`**: a instalação congelada reaplica essa verificação a cada entrada do lockfile (o passo que `--trust-lockfile` é quem pula). Confirmado por teste local: removida a exclusão, `pnpm install --frozen-lockfile` falha com `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION` para os doze pacotes `@tanstack/*` pinados a versões publicadas horas antes do scaffold. A lista não é preventiva — existe porque a instalação falhava sem ela — e volta a ficar vazia se essas versões forem atualizadas para builds com mais de 24h de idade no momento do `pnpm install`.

### TypeScript

- **Linha 5.x**, hoje `5.9.3`. A stack pesquisada (TanStack Start, Vite) assume essa linha; a linha 7.x já publicada não é adotada agora — migrar é decisão e trabalho próprios, com sua própria revisão.

Ferramentas executadas via `dlx`/`npx` **não são cobertas pelo lockfile**. Quando a versão dessas ferramentas afetar o código gerado, ela deve ser registrada aqui:

| Ferramenta | Versão fixada | Observação |
|---|---|---|
| `shadcn` (CLI) | `4.16.2` | Gera código no repositório; fora do lockfile |

O scaffold inicial do TanStack Start (issue #16) **não** usou `create-start-app` via `dlx`: a estrutura mínima foi escrita à mão a partir do guia oficial, então nenhuma entrada correspondente entra nesta tabela.

Atualizações de versão fixada são deliberadas e devem ser acompanhadas da revisão do impacto.

---

## 3. shadcn/ui

Conforme ADR-0002:

- Usar shadcn/ui sobre **Base UI**.
- A inicialização deve **declarar explicitamente a base**: `--base base`. Não depender do default vigente do CLI.
- O CLI deve ser invocado com **versão explícita** (ver §2), nunca `@latest`.
- **`components.json` permanece versionado** no repositório; suas configurações orientam a geração futura de componentes.
- Componentes gerados ficam em **`src/components/ui/`**.
- Os primitivos do Base UI permanecem como **dependência instalada** — não são copiados para o repositório.
- **Todo diff gerado pelo CLI deve ser revisado antes de ser aceito.** O output é código do projeto e está sujeito a code review como qualquer outro.
- **Atualizações de componentes são deliberadas**, revisadas individualmente — nunca automáticas ou em lote silencioso.

Componentes de terceiros são adaptados aos tokens já definidos no design system. Não adotar conjuntos de tokens próprios da biblioteca (`sidebar-*`, `chart-*`).

---

## 4. Tailwind CSS

- Tailwind CSS **v4 com configuração CSS-first**.
- **Não introduzir `tailwind.config.js`** por padrão.
- Respeitar os **tokens semânticos** de `docs/design-system.md`.
- **Não usar cores hardcoded** quando existir token apropriado (ex.: usar `bg-card`, não `bg-[#12171F]`). Exceções devem ser justificadas.
- Escalas que divergem dos defaults do Tailwind — radius (8/12/16/20) e `text-6xl` (56px) — precisam ser **declaradas explicitamente**.
- **Instalado a partir da Issue #23** (`tailwindcss` e `@tailwindcss/vite`, versão `4.3.3`). A versão instalada é controlada pelo `package.json`/lockfile, conforme §2.
- O entrypoint CSS restringe a **detecção automática de fonte do Tailwind à raiz de `src/`** (`@import "tailwindcss" source("../")`, a partir de `src/styles/app.css`). Sem essa restrição, a detecção automática varre todo o repositório não ignorado pelo Git — incluindo `docs/` — e qualquer texto com a forma de uma classe (ex.: um exemplo do que **não** fazer em `design-system.md`, como `bg-[#12171F]`) é gerado como utility real no CSS de produção. Observado durante a implementação da Issue #23.

### Spacing

- A **escala de spacing é fechada**: `4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64`.
- Valores fora dela só podem ser usados **depois de incorporados formalmente ao design system**, diante de necessidade visual concreta.
- Os defaults do Tailwind **não** garantem essa restrição — permitem valores arbitrários.
- **Não criar enforcement automatizado** de spacing neste momento. A regra é mantida por convenção e code review.

---

## 5. Tipografia e Fontes

A família tipográfica é definida em `docs/design-system.md`. Esta seção registra apenas como ela é distribuída e carregada.

- **Estratégia adotada: `@fontsource-variable/geist`** (variable, cobre em um único arquivo os pesos usados pelo design system).
- A **versão instalada é controlada pelo `package.json`/lockfile**, conforme §2. Não há versão a registrar fora do lockfile.
- **Instalado a partir da Issue #23**, versão `5.3.0`.
- A fonte é **carregada localmente pela aplicação durante o build**, sem dependência externa em runtime.
- **CDN externo não deve ser utilizado para fontes.** Introduziria dependência de runtime, exposição de dados dos visitantes a terceiros e perda de controle de versão — contrariando `architecture.md` §11.
- O nome de família exposto pelo Fontsource é **`Geist Variable`**; é esse o nome usado no token, conforme `design-system.md`.

**Self-host manual** (arquivos de fonte versionados no repositório com `@font-face` próprio) permanece como alternativa futura, a ser adotada apenas diante de necessidade técnica concreta — por exemplo, subsetting agressivo ou controle específico de features OpenType.

---

## 6. Theming

Convenção estrutural (valores não são definidos aqui):

- **Light** em `:root`.
- **Dark** sobrescrevendo os mesmos tokens em `.dark`.
- Tokens semânticos mapeados para as utilities do Tailwind via **`@theme inline`**.
- Componentes consomem apenas tokens semânticos e **não conhecem o tema ativo**.

`docs/design-system.md` continua sendo a SSOT visual: nomes, valores e semântica dos tokens são definidos lá.

---

## 7. Componentes e Variantes

- Usar **`class-variance-authority` (cva)** quando houver variantes de componente.
- Evitar concatenação ad hoc de grandes strings de utilities em páginas quando a estrutura puder ser encapsulada em componente ou variant.
- **Não criar abstrações prematuras**: extrair componente ou convenção apenas quando houver responsabilidade clara ou reutilização real — nunca por antecipação a requisitos hipotéticos (`architecture.md` §11).

---

## 8. Conteúdo

Convenções derivadas do ADR-0003. As propriedades arquiteturais (P1–P9) estão no ADR; esta seção registra **onde as coisas ficam e como são escritas**.

### 8.1 Estrutura de diretórios

```text
src/content/
├── entries/          # conteúdo editorial (Markdown + assets do próprio conteúdo)
│   └── <tipo>/       # ex.: articles/, projects/, notes/, changelog/
│       └── <slug>/
│           ├── index.md
│           └── <imagens do conteúdo>
├── data/             # conteúdo estruturado (módulos TypeScript declarativos)
├── schemas/          # schemas de frontmatter, um por tipo de conteúdo
└── pipeline/         # descoberta, validação e processamento de Markdown
    └── __fixtures__/ # conteúdo de teste (ver §12)
```

- `entries/` contém **dado**, nunca código. `data/`, `schemas/` e `pipeline/` contêm **código**, nunca prosa longa.
- **`entries/` é a única origem de conteúdo publicável.** Fixtures de teste vivem em `__fixtures__/` e nunca em `entries/` — conteúdo de teste não entra no build nem no site (§12.3).
- Cada entrada editorial é um **diretório próprio** com `index.md`, e não um arquivo solto — é o diretório que torna a entrada autocontida junto com suas imagens (P8).
- Nomes de tipo e de slug em **kebab-case**. O nome do diretório da entrada é o **identificador estável** daquele conteúdo.
- O mapeamento entre identificador e URL pública é assunto de roteamento e **não é definido por este documento**.

### 8.2 Frontmatter e schemas

- **Um schema por tipo de conteúdo**, em `src/content/schemas/`, nomeado pelo tipo no singular (ex.: `article.ts`, `project.ts`).
- O schema é a **fonte única do contrato de metadados**. Os tipos consumidos pela aplicação são **derivados dele** por inferência — nunca declarados em paralelo.
- Schemas **rejeitam campos desconhecidos**: metadado que não existe no schema quebra o build em vez de ser silenciosamente ignorado.
- A validação acontece **em build** e falha o build (P2, P4). Não há fallback silencioso nem conteúdo parcialmente válido em produção.
- O **conjunto concreto de campos** de cada tipo é definido no próprio schema quando o tipo é implementado. Este documento não fixa esse conjunto.

### 8.3 Imagens de conteúdo

- Imagens que pertencem a uma entrada ficam **no diretório da própria entrada** e são referenciadas por **caminho relativo** no Markdown (ex.: `![...](./cover.png)`).
- **Não referenciar imagens de conteúdo a partir de `public/`** nem por URL absoluta do próprio site. `public/` é para ativos globais da aplicação, não para conteúdo.
- **Não há otimização ou transformação de imagens** (fora do escopo do ADR-0003). As imagens entram no repositório no formato final em que serão servidas; dimensionar e comprimir antes do commit é responsabilidade de quem publica.

### 8.4 Pipeline de Markdown

- O pipeline vive em `src/content/pipeline/`, com **responsabilidades separadas por módulo**. `discovery.ts` (`discoverEntries(entriesDir)`, via `node:fs` — `readdirSync`/`statSync`, sem glob) e `frontmatter.ts` (`parseFrontmatter(raw, schema, context)`, extração via `gray-matter` + validação contra o `schema` recebido como parâmetro) são **compartilhados por todos os tipos de conteúdo** (Article, Project) — nenhum dos dois módulos conhece qual tipo está servindo; cada `build-<tipo>.ts` fornece seu próprio diretório e seu próprio schema. `markdown.ts` (`toHtml(markdown)`, processamento via `unified`) é igualmente compartilhado e nem recebe schema — é agnóstico a tipo de conteúdo por definição.
- Cada tipo de conteúdo expõe **seu próprio ponto de entrada público**: `buildArticles()` em `build-articles.ts`, `buildProjects()` em `build-projects.ts`. Rotas e componentes **nunca importam arquivos `.md` diretamente**, nem `discovery.ts`/`frontmatter.ts`/`markdown.ts`, nem invocam o processador de Markdown por conta própria — nem sequer `buildArticles()`/`buildProjects()` diretamente (ver abaixo).
- O que sai do pipeline é **dado já validado e já processado** (P2, P3). Nenhuma etapa de parsing ocorre em runtime — nem no cliente, nem no servidor de requisições.
- `buildArticles(articlesDir?)` é **determinística, sem cache/memoização**: descobre, valida, processa e retorna o snapshot ordenado por `publishedAt` descendente (`localeCompare` sobre a string `YYYY-MM-DD`, estável em caso de empate — a ordem de descoberta por slug se preserva). Lança erro síncrono no primeiro artigo inválido — conteúdo inválido nunca chega a compor o snapshot retornado.
- `buildProjects(projectsDir?)` segue o mesmo contrato de determinismo e ausência de cache, mas **sem ordenação**: Project não tem campo de data, então o snapshot preserva a ordem de descoberta (por slug). Não introduzir ordenação sem uma necessidade concreta que a justifique.
- **`discovery.ts` falha alto em erro real de I/O no diretório raiz** (path errado, diretório inexistente, permissão negada) — não converte em `[]`, para qualquer tipo de conteúdo. Um diretório real e vazio continua retornando `[]` naturalmente, sem exceção.
- **`publishedAt` (específico de Article) é data civil, não timestamp**: `YYYY-MM-DD`, validada por `z.iso.date()` (formato exato + calendário real — rejeita `2026-02-30`, por exemplo) e mantida como `string` de ponta a ponta, do frontmatter ao `CompiledArticle`. `gray-matter` usa `js-yaml` internamente, cujo schema YAML default promove `2026-09-04` (sem aspas) a `Date` automaticamente — `frontmatter.ts` sobrescreve o engine `yaml` do `gray-matter` com `js-yaml`'s `JSON_SCHEMA` (sem tipo de data), preservando o valor exatamente como escrito, **para qualquer schema que passe por `parseFrontmatter`**, não só Article. `js-yaml` (`3.15.2`, pinado à mesma versão que `gray-matter` já resolve internamente) é dependência direta só por causa desse uso explícito.
- **Plugins habilitados, declarados explicitamente em `markdown.ts`**: `remark-parse` → `remark-rehype` → `rehype-stringify`, processados de forma síncrona (`processSync`, sem plugin assíncrono) para que `buildArticles()`/`buildProjects()` possam rodar no corpo de `vite.config.ts` sem `await`. Extração de frontmatter usa `gray-matter` (`frontmatter.ts`).
- **P9 — rejeição explícita de HTML bruto**: `markdown.ts` inclui um plugin remark próprio (`rejectRawHtml`, sem dependência nova) que percorre a árvore mdast e lança erro se encontrar um nó `html` — cobre tanto HTML inline quanto em bloco, já que mdast usa o mesmo tipo de nó para os dois. Isso é preferido ao descarte silencioso padrão do `remark-rehype` (que já ocorreria de qualquer forma, sem `allowDangerousHtml: true`, como camada adicional). Vale para todo tipo de conteúdo, por reaproveitar `toHtml()` sem alteração.
- **Como a aplicação consome o pipeline sem alcançá-lo**: `vite.config.ts` chama `buildArticles()` e `buildProjects()` uma única vez cada, guarda os resultados em `const articles`/`const projects`, e distribui cada snapshot para `prerender.pages` (paths explícitos, ver §8.6) e para seu próprio plugin Vite (`virtualArticlesPlugin(articles)`/`virtualProjectsPlugin(projects)`, em `virtual-articles-plugin.ts`/`virtual-projects-plugin.ts`), que apenas serializam o array recebido como o módulo virtual correspondente (`virtual:articles`/`virtual:projects`) — nenhum dos dois plugins importa `build-articles.ts`/`build-projects.ts`/`discovery.ts`/`frontmatter.ts`/`markdown.ts` nem `node:fs`/`gray-matter`/`unified`. Rotas importam só `virtual:articles` ou `virtual:projects`, conforme o tipo. Essa fronteira é o que garante, estruturalmente, que o compilador de conteúdo nunca alcança o bundle do cliente nem o do servidor de requisições (P3) — verificado por inspeção do artefato de build, não apenas presumido. Os módulos virtuais permanecem **um por tipo de conteúdo**, deliberadamente não generalizados em um plugin genérico.

### 8.5 Conteúdo estruturado em TypeScript

- Módulos em `src/content/data/`, um por conjunto de dados, nomeados pelo conteúdo que declaram (ex.: `uses.ts`).
- São **declarações de dados literais**: sem efeitos colaterais, sem I/O, sem acesso a variáveis de ambiente e sem lógica de negócio (P5).
- **Não importam código de aplicação** — nada de componentes, rotas, integrações ou helpers. A dependência é de tipos, não de comportamento.
- Exportar como `const`, validando a forma contra um **tipo explícito** para que o compilador acuse divergências sem descartar a inferência dos valores literais.
- **Prosa longa não entra aqui** (P6). Se uma entidade estruturada passar a ter corpo editorial, ela vira uma entrada em `entries/`, com os metadados no frontmatter.

### 8.6 Prerender explícito de conteúdo

- Rotas dinâmicas de conteúdo (ex. `/blog/$slug`, `/projects/$slug`) não entram na descoberta automática de prerender (ADR-0001). `vite.config.ts` deriva `pages` concatenando os snapshots de `buildArticles()` e `buildProjects()` usados pela aplicação — nunca de uma listagem mantida à parte, e nunca só do crawler de links do prerender.
- `buildArticles()`/`buildProjects()` rodam em contexto Node puro, fora do grafo de transformação do Vite — por isso a descoberta usa `node:fs`, não `import.meta.glob` (que não resolve dentro de `vite.config.ts`).

---

## 9. Código Gerado por IA

- Agentes devem consultar **este documento, `architecture.md`, `design-system.md` e os ADRs aceitos** antes de propor padrões da stack.
- **Não assumir padrões antigos**: sintaxe ou configuração do Tailwind v3 (incluindo `tailwind.config.js`), nem configurações default do shadcn/ui que contrariem o registrado aqui.
- **Não assumir Radix UI**: a base deste projeto é Base UI, ainda que muito material disponível sobre shadcn/ui pressuponha Radix.
- **Não assumir Jest**: o runner deste projeto é o Vitest (ADR-0005). Não usar `jest.fn`, `jest.mock`, `jest.spyOn` nem configuração de Jest — os equivalentes vêm de `vi`, importado de `vitest`.
- Mudanças geradas por IA **continuam sujeitas a revisão humana**, conforme o princípio de human-in-the-loop do `CLAUDE.md`.

### 9.1 Criar e modificar conteúdo

O pipeline de conteúdo é próprio do projeto e **não corresponde a nenhum padrão de biblioteca conhecida**. Ao criar ou alterar conteúdo, seguir §8 literalmente:

- **Criar conteúdo editorial**: novo diretório em `src/content/entries/<tipo>/<slug>/` com `index.md`, preenchendo o frontmatter conforme o schema do tipo em `src/content/schemas/`. Ler o schema antes de escrever o frontmatter — não inferir campos de outros projetos.
- **Adicionar um campo de frontmatter**: alterar o schema primeiro. Campo que não existe no schema quebra o build (§8.2).
- **Imagens**: dentro do diretório da entrada, referenciadas por caminho relativo. Nunca em `public/`, nunca por URL absoluta (§8.3).
- **Não usar MDX**, não embutir JSX e **não embutir HTML bruto** no Markdown (P7, P9).
- **Não importar `.md` em rotas ou componentes** — consumir o ponto de entrada do pipeline (§8.4).
- **Não colocar prosa longa em módulos de `data/`** e não colocar lógica neles (§8.5).
- **Não introduzir biblioteca de conteúdo** (Content Collections ou equivalente) nem trocar peças do pipeline por conta própria: isso é decisão arquitetural e exige novo ADR, conforme os gatilhos do ADR-0003.
- Quando a mudança pedida **conflitar com estas regras**, parar e sinalizar em vez de contornar — human-in-the-loop, conforme `CLAUDE.md`.

---

## 10. Atualização das Convenções

- Alterações neste documento devem **refletir decisões já tomadas**, não antecipá-las.
- Se uma mudança exigir nova decisão arquitetural ou contradisser um ADR aceito, **criar ou revisar um ADR antes** de alterar a convenção.
- ADRs aceitos não são reescritos para alterar decisões históricas; um novo ADR substitui o anterior quando necessário.

---

## 11. Git e Fluxo de Trabalho

Convenções derivadas do ADR-0004. As propriedades duráveis (G1–G7) estão no ADR; esta seção registra **a mecânica que as realiza**. Trocar qualquer item desta seção não exige novo ADR, desde que G1–G7 continuem satisfeitas.

### 11.1 Branches

- Formato: **`<tipo>/<issue>-<slug>`** — ex.: `feat/12-content-pipeline`.
- Sem Issue associada (ver §11.5): `<tipo>/<slug>`.
- Tipos: `feat`, `fix`, `docs`, `refactor`, `chore`, `test`. Mesmo vocabulário dos commits (§11.2), para não manter dois dicionários.
- Slug em **kebab-case**, coerente com §8.1.
- Branches nascem de `main` atualizada, têm **vida curta** e são **removidas após o merge** (G1).

O número da Issue no nome não é decorativo: torna o contexto **recuperável por máquina**. Um agente que entre em uma sessão nova conhecendo apenas a branch consegue reconstruir a especificação com `gh issue view <n>`, sem depender de contexto repassado manualmente.

### 11.2 Commits

- **Conventional Commits**, em **inglês** (`CLAUDE.md` §Language & Communication).
- Commits **atômicos**: cada um deixa o repositório em estado coerente.
- **Sem `commitlint`/`husky` nesta fase.** A regra é mantida por convenção e review, coerente com o precedente explícito de ADR-0002 (escala de spacing) e ADR-0003 (P5/P6).
- O trailer **`Co-Authored-By` de agentes é mantido**. Num projeto cujo tema é orquestração de IA, o histórico registra a divisão humano/IA como dado observável, e não como informação a omitir.
- Vínculo com a Issue vai **no PR** (`Closes #N`), não em cada commit — evita ruído repetido no histórico.

### 11.3 Pull Requests

- **Um PR por unidade de trabalho**, dimensionado pelo que um humano consegue revisar de fato (ADR-0004 §2).
- Issues e PRs são escritos **em inglês**, conforme `CLAUDE.md` §Language & Communication. Diferente de `docs/`, que permanece em português, esses artefatos são a superfície pública do fluxo de trabalho.
- Conteúdo mínimo: **link da Issue** (ou justificativa da ausência dela), **o que mudou**, **por quê**, **como foi verificado** e **se foi gerado por agente**.
- Decisões tomadas durante a implementação — inclusive o que se decidiu **não** fazer — ficam registradas no PR quando não forem promovidas a documentação (G5).

### 11.4 Merge

- **Squash como método padrão.** Cada commit em `main` corresponde a uma unidade de trabalho e, quando houver, a uma Issue. Absorve o ruído de commits iterativos típico de implementação assistida por agentes e mantém `main` legível como registro — inclusive como contexto para agentes futuros.
- `main` é mantida **linear**; a branch é **removida** após o merge.
- Outro método é admissível em caso justificado — por exemplo, uma branch cujos commits sejam genuinamente independentes e mereçam histórico próprio.

### 11.5 Quando a Issue é dispensada

G4 exige Issue para trabalho não-trivial. **Dispensam Issue**, seguindo direto para branch + PR com a justificativa no PR:

- correção de typo;
- ajuste de redação que não altere significado;
- formatação;
- atualização de link quebrado.

**Não é trivial** — e portanto exige Issue — qualquer mudança que toque pipeline de conteúdo, schemas, design tokens, dependências, configuração da stack ou documentação normativa (`docs/`).

### 11.6 Profundidade da revisão humana

G3 exige leitura humana sempre; o que varia é a profundidade.

- **Leitura linha a linha**: pipeline de conteúdo, schemas, design tokens, dependências, configuração e todo output gerado por CLI (exigência do ADR-0002).
- **Leitura de conferência**: conteúdo editorial e ajustes de redação.

**Testes entram na leitura linha a linha** quando cobrem propriedade sem outro enforcement (T2 do ADR-0005 — hoje P9 e o contrato de rejeição dos schemas) e quando o PR **altera uma assertion existente** (T5). Nos dois casos o teste é a garantia, e uma garantia lida por cima não é garantia.

O ponto de atenção específico é código gerado por agente: quem escreve o código e o teste tende a assertar o comportamento que produziu, e não o pretendido. A pergunta na revisão não é "o teste passa?", e sim **"este teste falharia se o comportamento estivesse errado?"**.

### 11.7 Revisão por segundo agente

Mecanismo **auxiliar**, conforme G3. Não é gate de merge e não substitui §11.6.

- **Papéis**: **Claude** como agente principal de implementação; **Codex** como agente independente de revisão e análise crítica.
- **A razão da convenção é a independência, não a ferramenta.** O revisor precisa ser um agente distinto do que implementou — caso contrário é auto-revisão, e o mecanismo perde o valor. Substituir qualquer um dos dois não exige revisar o ADR, desde que a independência se mantenha.
- **Quando acionar**: quando a mudança justificar — o mesmo conjunto que exige leitura linha a linha em §11.6, mais qualquer mudança que toque regra mantida sem enforcement automatizado. O recorte não é arbitrário: a escala de spacing (§4, ADR-0002) e P5/P6 (ADR-0003) são precisamente as regras que **nenhuma verificação automatizada captura** e que dependem apenas de leitura.
- **Onde fica o resultado**: os apontamentos entram no PR, junto do diff que motivou a decisão (G5).
- **O que não é**: não é aprovação, não bloqueia merge e **não dispensa a leitura do diff pelo engenheiro**. Apontamento rejeitado não exige defesa formal, mas uma rejeição relevante merece uma linha no PR — é contexto de decisão.

### 11.8 Agentes de IA no fluxo

Detalhamento operacional de G6.

- O agente **começa pela Issue** e a trata como contrato da tarefa (`gh issue view <n>`).
- Registra no PR o que fez e o que decidiu não fazer.
- Diante de decisão arquitetural não documentada, **para e escala na Issue** — não decide e não contorna (`CLAUDE.md` §Human-in-the-loop).
- **Nunca** executa merge, push em `main`, force-push em branch compartilhada, remoção de branches/tags ou alteração da proteção de `main`.

---

## 12. Testes

Convenções derivadas do ADR-0005. As propriedades duráveis (T1–T11) estão no ADR; esta seção registra **onde os testes ficam e como são escritos**. Trocar qualquer item desta seção não exige novo ADR, desde que T1–T11 continuem satisfeitas.

### 12.1 Ferramentas e momento de instalação

| Camada | Ferramenta | Instalada quando |
|---|---|---|
| Unitário e integração | Vitest (`4.1.11`) | primeiro código de `src/content/pipeline/` |
| Componente | React Testing Library (16.3.x) + user-event (14.6.x), ambiente jsdom (30.x) | primeiro componente com comportamento próprio |
| E2E | Playwright (1.62.x) | primeiro fluxo E2E obrigatório, idealmente junto do CI/CD |

Nenhuma dependência de teste é instalada antes disso (T10). As versões seguem §2: fixadas pelo lockfile, atualizadas de forma deliberada.

**Instalado a partir da Issue #29**, versão `4.1.11`, junto do primeiro código de `src/content/pipeline/`. Config dedicada em `vitest.config.ts` (ambiente Node padrão, sem os plugins de `vite.config.ts` — evita fricção com `@cloudflare/vite-plugin`/`tanstackStart` no test runner, que não têm papel nenhum na execução de testes de módulos puros).

### 12.2 Localização e nomenclatura

- Testes unitários e de integração são **co-locados** com o código que verificam: `src/content/pipeline/markdown.test.ts` ao lado de `markdown.ts`.
- **Não criar diretório espelho** de `src/`. A co-locação é deliberada: o teste aparece na mesma leitura que o fonte, e sua ausência fica visível.
- Sufixo **`.test.ts`** / **`.test.tsx`**. Não usar `.spec.`, para não manter dois padrões.
- E2E vive em **`tests/e2e/`**, único lugar fora de `src/`, por não ter fonte correspondente para acompanhar.
- Ambiente de execução é **declarado por arquivo** quando divergir do padrão de Node — testes de componente rodam em jsdom, o resto em Node. Não configurar jsdom globalmente: a maioria dos testes não precisa dele e pagaria o custo à toa.

### 12.3 Fixtures

- Fixtures de conteúdo ficam em **`src/content/pipeline/__fixtures__/`**, nunca em `src/content/entries/` (§8.1). Conteúdo de teste não é conteúdo publicável e não pode entrar no build.
- As fixtures incluem **casos negativos** — frontmatter inválido, campo desconhecido, HTML bruto — e o teste asserta que eles **falham**. Um pipeline que só é exercitado com entrada válida não verifica P4 nem P9.
- **Preferir fixture em disco a mock** quando o alvo é a camada de conteúdo (T10): é mais legível no diff, mais próxima do dado real e mais interpretável por agentes.
- Sem framework de mocking além do que o Vitest já oferece (`vi`).

### 12.4 O que escrever e o que não escrever

Obrigatório por T3: `src/content/pipeline/`, `src/content/schemas/`, camada de mapeamento de `src/integrations/`, e lógica com ramificação não-óbvia.

Não escrever:

- teste de componente de apresentação sem comportamento próprio;
- teste que exercita biblioteca de terceiros — zod, Base UI, TanStack Router (T7). Testar o **contrato do projeto**, não a dependência;
- teste que duplica o que o build já falha (T1);
- assertion sobre saída de modelo generativo (T6) — verificar o adaptador, a partir de fixtures.

**Teste de componente não verifica aparência** (T8). Conformidade com o `design-system.md` — tokens, escala de spacing, tema — não é coberta por esta camada e permanece com convenção e review (§4, ADR-0002).

### 12.5 Correção de defeito

Toda correção entra com teste que **falha antes** da correção (T4). O teste descreve o defeito observado, não a implementação escolhida.

O PR registra que o teste falhou antes — é o que distingue um teste de regressão de um teste escrito depois para acompanhar o código.

### 12.6 Alterar teste existente

Alterar uma assertion é **alterar um contrato** (T5) e exige justificativa no PR. No diff, um teste ajustado para passar é indistinguível de um teste corrigido; só a justificativa separa os dois.

Sem enforcement automatizado nesta fase, coerente com o precedente de ADR-0002 (escala de spacing), ADR-0003 (P5/P6) e ADR-0004 (convenções de commit).

### 12.7 Execução

- A suíte é executável por **um comando único**, determinística e **sem acesso à rede** (T6, T11).
- Sua execução integra os critérios de merge de G7.3 conforme a verificação automatizada se torne disponível (T11). Enquanto não houver CI, a execução depende de disciplina local — limitação registrada nos contras do ADR-0005.
- **Sem threshold de cobertura**, global ou por diretório (T3).

---

## 13. CI/CD

Convenções derivadas do ADR-0009. As propriedades duráveis (C1–C9) estão no ADR; esta seção registra **a mecânica que as realiza** e os campos que o ADR-0009 §3 deferiu explicitamente para "quando o pipeline for efetivamente configurado". Trocar qualquer item desta seção não exige novo ADR, desde que C1–C9 continuem satisfeitas.

### 13.1 Onde a verificação vive

- Arquivo único: **`.github/workflows/ci.yml`**, workflow **`CI`**.
- Dois jobs — **`typecheck`** e **`build`** — cada um produzindo um check run de mesmo nome.
- **São jobs separados, e não steps de um mesmo job.** C2 exige verificação granular e individualmente reexecutável, e o ADR-0009 §3 recusa a alternativa nativa precisamente por "colapsa typecheck, teste e falha de infraestrutura num único sinal". A duplicação dos steps de preparação é o preço, e é deliberada.
- O nome do check run é o `name` do job, **fixado explicitamente**. A proteção de branch do GitHub exige **contexts por nome** (`typecheck`, `build`) — não uma execução específica ligada ao evento que a disparou. Renomear um job não quebra a proteção em silêncio: se o context exigido deixar de ser reportado, o comportamento é *fail-closed* — o GitHub continua aguardando aquele context e o merge fica bloqueado, visivelmente, até o nome ser corrigido ou o context trocado na proteção.

### 13.2 De qual garantia cada verificação deriva (C1)

| Verificação | Origem |
|---|---|
| `typecheck` (`tsc --noEmit`) | ADR-0001 (TypeScript como stack) + ADR-0005 T1 (tipagem cobre estrutura e contrato de dados). Nomeada em ADR-0009 §4. |
| `build` (`vite build`) | ADR-0003 P2/P4 (conteúdo descoberto, validado e processado em build) + ADR-0005 T1. Nomeada em ADR-0009 §4. |

O conjunto **não é fechado**. C1 define como uma verificação entra, não qual é o conjunto para sempre: uma verificação nova entra por esta tabela, com sua origem em uma linha. Sem origem derivável, não entra — é por isso que não há lint (ADR-0009 §4).

### 13.3 Gatilhos, e por que os dois não têm o mesmo papel

A proteção de branch do GitHub exige **contexts por nome** — `typecheck`, `build` — e não uma execução específica ligada ao evento que a disparou. Quando os dois forem promovidos a obrigatórios (Bloco B), o merge espera que esses contexts estejam satisfeitos **no commit sendo mergeado** — o head do Pull Request (ou a referência de merge). É a execução disparada por `pull_request` que reporta nesse commit, e é ela quem satisfaz o requisito.

| Gatilho | Papel |
|---|---|
| `pull_request` | **Roda antes do merge**, sobre a referência de merge entre o head do Pull Request e a base (mecanismo de C3). É esta execução que reporta os contexts que o merge espera. |
| `push` em `main` | **Roda depois do merge já ter acontecido**, sobre o commit de squash em `main` — um commit diferente do que foi avaliado para o merge. Reporta contexts de mesmo nome, mas não há, nesse momento, nenhuma decisão de merge para influenciar: é execução adicional, para observabilidade. |

Por que o run em `main` existe, já que não gateia nada:

- o commit publicado em produção **nasce no merge** (squash, §11.4) e nenhuma verificação o viu;
- a build de produção roda `vite build`, e **não** `tsc` — sem este run, uma regressão de tipagem em `main` passaria despercebida até o Pull Request seguinte;
- ele torna G1 ("`main` sempre publicável") **observável** em vez de afirmada, e é o que faz o **gatilho 1 do ADR-0009** — `main` quebrar depois de um Pull Request verde — detectável. Gatilho que ninguém consegue observar não dispara.

**O que ele não é.** Não é tentativa de eliminar a corrida residual de C3 — a base avançar depois que a verificação rodou. Essa corrida é **aceita** pelo ADR-0009 §3, com C6 e D5 como contenção. Este run a torna visível depois do fato; não a previne.

**O run de `main` não precisa de nenhuma exclusão explícita da proteção obrigatória.** Ele reporta sobre um commit que já foi mergeado, não sobre o commit que um merge futuro avalia — estruturalmente, não há como ele gatear algo que já aconteceu.

### 13.4 Determinismo da instalação

Cada job executa, nesta ordem: checkout → Node → pnpm → instalação congelada → script.

| Entrada | De onde vem | Por quê |
|---|---|---|
| Versão do **pnpm** | `packageManager` do `package.json`, via **Corepack** | C5 e §2. Nenhuma versão de pnpm é escrita no workflow, e o Corepack verifica o sufixo `+sha512…` do campo — o hash existe para ser verificado. |
| Versão do **Node** | `.nvmrc`, via `node-version-file` do `actions/setup-node` | C5 e §2. Nenhuma versão de Node é escrita no workflow. O ADR-0009 registra, a partir da documentação oficial da Cloudflare, que Workers Builds também lê `.nvmrc`/`.node-version` do repositório — **confirmado neste projeto para a combinação Node 24.19.0 + pnpm 11.22.0 sob Workers Builds** (§13.9.2, fecha a incerteza 2 da Issue #20). |
| **Dependências** | `pnpm install --frozen-lockfile` | §2 e C5. Lockfile fora de sincronia com `package.json` **deve** falhar o job, e falha: `ERR_PNPM_OUTDATED_LOCKFILE`. |
| **Actions** | pinadas por **SHA de commit completo**, com a tag legível no comentário ao lado | §2: uma tag é mutável, e referência mutável não é versão fixada. Vale inclusive para as ações da própria organização `actions`. |

**Sem cache, e sem chave para desligá-lo.** O `actions/setup-node` tem `package-manager-cache` com padrão `true`, mas seu cache automático só liga quando `packageManager` declara **npm**; aqui declara pnpm, de modo que não há cache. Declarar `package-manager-cache: false` seria configurar um comportamento que já está desligado. Cache de build permanece fora de escopo (ADR-0009 §7) enquanto não houver problema medido.

### 13.5 Corepack e a versão de Node

O caminho de instalação do pnpm depende do **Corepack**, distribuído junto com o Node **até a linha 24** e **removido da distribuição a partir da 25**.

- `.nvmrc` está hoje em `24.19.0` — linha LTS, que §2 já manda preferir.
- **Subir o `.nvmrc` para Node 25 ou superior exige trocar o mecanismo de instalação do pnpm no mesmo Pull Request**, sob pena de quebrar os dois jobs.
- A quebra seria barulhenta e aconteceria no Pull Request, não em produção. Ainda assim é previsível, e por isso fica registrada aqui em vez de ser redescoberta.

A alternativa conhecida é `pnpm/setup`, sucessora oficial de `pnpm/action-setup` para pnpm 11+. Ela custa uma ação de terceiro a mais e não verifica o hash de `packageManager`; e derivar o Node dela exigiria `devEngines.runtime` no `package.json`, criando **segunda fonte de verdade** para uma versão que o `.nvmrc` já fixa — e que, pela documentação do fornecedor citada em §13.4, o Workers Builds também lê de lá.

### 13.6 `minimumReleaseAge` na CI e no build do fornecedor

**Comprovado neste repositório.** `pnpm install --frozen-lockfile` reaplica o gate de 24h do pnpm 11 a cada entrada do lockfile — é o mecanismo de instalação do próprio pnpm, não um comportamento específico de CI. O job `typecheck` do PR #21 reportou `✓ Lockfile passes supply-chain policies`, confirmando que o gate roda e passa para as versões hoje listadas em `minimumReleaseAgeExclude`.

**Documentado pelo fornecedor, ainda não observado neste projeto.** O ADR-0009 registra que Workers Builds lê `package.json` e o lockfile do repositório e instala a partir deles, o que sugere o mesmo gate. A Issue #20 lista a combinação Node 24.19.0 + pnpm 11.22.0 sob Workers Builds como incerteza aberta — este documento não a trata como confirmada; a confirmação pertence ao Bloco C, após o primeiro deploy real.

**Consequência operacional, independente da confirmação:** fixar uma dependência publicada há menos de 24h quebra a instalação em qualquer lugar onde `--frozen-lockfile` rode sob essa política, e o desbloqueio é a entrada correspondente em `minimumReleaseAgeExclude` (§2), **no mesmo Pull Request que introduz o pin**. Se o primeiro deploy revelar comportamento diferente no Workers Builds, o registro vai para o Bloco C, não para esta seção.

A lista atual existe porque a instalação local e a de CI falhavam sem ela, e não por precaução; com aquelas versões já passadas das 24h, ela é hoje inerte e volta a ficar vazia quando esses pacotes forem atualizados. A regra permanece porque o próximo pin recente a reativa.

### 13.7 Campos que só existem no dashboard do fornecedor

Esta é a **principal concessão de C5**, prevista pela própria redação da propriedade e registrada no ADR-0009 §6: parte da configuração de build do Workers Builds não é versionável. A mitigação é mantê-los como **indireção fina** — a substância permanece no repositório — e registrá-los aqui.

A tabela é o **contrato que o dashboard deve espelhar**. Os valores são determinados pelo repositório e pelo ADR-0009 §4; o ato de configurá-los é ação humana, fora do diff.

| Campo (dashboard) | Valor | Indireção para |
|---|---|---|
| Branch de produção | `main` | G1 e G2; ADR-0009 §4 |
| Builds de branch não-produtiva | **habilitados** | D3 — são desligados por padrão, e D3 depende deles |
| Root directory | raiz do repositório | — |
| Build command | invoca o script `build` do `package.json` | o comando real é versionado; o campo apenas o chama |
| Deploy command (produção) | padrão do fornecedor | ADR-0009 §3 |
| Deploy command (branch não-produtiva) | padrão do fornecedor — cria versão sem promover a produção | ADR-0009 §3 e D3 |
| Build variables e secrets | **nenhuma** | não existe segredo no projeto; D9 é hoje vacuamente satisfeita |

**Nenhuma entrada capaz de alterar o artefato pode existir apenas fora do controle de mudanças sem estar registrada** (C5). Se esta tabela crescer além de indireção fina, o gatilho 8 do ADR-0009 foi acionado.

O **check run do fornecedor nunca integra a verificação obrigatória de merge**: build pulado não gera check run, e verificação obrigatória que não reporta trava o repositório sob `enforce_admins`. É inelegível por C2 (ADR-0009 §3), e a falha de publicação é capturada por C6.

### 13.8 Barra final

O ADR-0006 §4 registra a interação: o `autoSubfolderIndex` do TanStack Start combinado com o `html_handling` padrão do Workers produz **307 em subpáginas**. A convenção passou a valer na primeira subpágina real (`/about`, Issue #25) e foi resolvida na Issue #27.

**Decisão**: `assets.html_handling: "drop-trailing-slash"`, declarado em `wrangler.jsonc` (raiz, versionado) — única fonte de verdade. Nenhuma configuração manual de dashboard foi necessária para este campo, e nenhuma divergência foi observada entre o `wrangler.jsonc` versionado e o `dist/server/wrangler.json` gerado pelo build: o valor propaga corretamente para o bloco `assets` gerado.

URL canônica adotada: **sem barra final** (`/about`, não `/about/`).

**Comportamento confirmado localmente**, via `pnpm preview` (roda através do Miniflare por meio do `@cloudflare/vite-plugin`, fiel ao roteamento real de Workers Assets — ver correção de evidência abaixo):

| Requisição | Resultado |
|---|---|
| `GET /` | `200` |
| `GET /about` | `200`, direto, sem redirect |
| `GET /about/` | `307` → `Location: /about`, um único hop, sem loop |
| Asset estático (ex. `/assets/app-*.css`) | `200`, direto, sem redirect — `html_handling` não afeta ativos não-HTML |

**Comportamento confirmado em Workers Builds real** (preview de PR #28, commit `88bf3bb`): idêntico ao observado via Miniflare — `/` → `200`; `/about` → `200` direto (`0` redirects); `/about/` → `307` com `Location: /about` (`1` redirect, sem loop); asset estático (`/assets/app-*.css`) → `200` direto. **Nenhuma divergência observada** entre Miniflare e o Workers Builds real para esta configuração.

**Correção sobre a fonte de evidência.** O log interno de prerender do `vite build` (`[prerender] GET /about/ 307 ... GET /about 200`) **não reflete o roteamento real do Workers Assets** — é produzido pelo crawler de prerender do TanStack Start/Nitro durante o build, mecanismo totalmente distinto de `html_handling`. Antes da Issue #27, esse log foi citado (PR #26) como se fosse evidência do comportamento de produção; verificado via `pnpm preview`/Miniflare, o comportamento real sob o `html_handling` padrão anterior à mudança era o **oposto** do que esse log sugeria — `/about` redirecionava para `/about/`, não o contrário. A partir de agora, apenas `pnpm preview` (Miniflare) e o Workers Builds real são evidência válida para este comportamento; o log de prerender do build não é.

### 13.9 Observações do primeiro deploy real (Bloco C, Issue #20)

Registra o que foi **observado** no primeiro fluxo real de deploy e nas validações manuais feitas em seguida — não o que era esperado. Fecha o que pode ser fechado das incertezas do ADR-0009 §6 e da Issue #20; o que não foi observado é registrado como tal, e não como resolvido por ausência de caso de teste.

#### 13.9.1 Produção (C4, D1)

Primeiro deploy de produção via Workers Builds: **sucesso**, construído a partir de um commit já existente em `main`.

#### 13.9.2 Node 24.19.0 + pnpm 11.22.0 sob Workers Builds

**Confirmado**: a combinação funciona sob Workers Builds. Fecha a incerteza registrada em §13.4 (incerteza 2 da Issue #20).

Isso confirma que Workers Builds lê `.nvmrc`/`.node-version` e instala com sucesso a partir do lockfile para esta combinação — **não confirma**, isoladamente, se o gate `minimumReleaseAge` do pnpm 11 (§13.6) é de fato aplicado sob Workers Builds: como todas as entradas hoje em `minimumReleaseAgeExclude` já tinham mais de 24h no momento deste deploy, um build bem-sucedido não distingue "o gate roda e passa" de "o gate não se aplica aqui". §13.6 permanece com essa incerteza específica em aberto.

#### 13.9.3 Build de branch não-produtiva e preview

Build de uma branch interna não-produtiva: **sucesso**. O preview correspondente foi gerado e abriu corretamente.

O que foi exercitado é o build e o preview de **branch não-produtiva**, não o fluxo de Pull Request especificamente — nenhum Pull Request foi aberto para essa branch neste teste. O comportamento específico de preview vinculado a um Pull Request (comentário automático da Cloudflare, URL por commit e alias estável por branch, conforme o levantamento técnico do ADR-0009) não foi verificado em separado.

#### 13.9.4 Build falho em branch não-produtiva

Foi provocado deliberadamente um build falho em uma branch interna não-produtiva. O que se observa com segurança:

- o build da branch não-produtiva **falhou no Workers Builds**;
- a produção anterior **permaneceu acessível normalmente**, sem alteração do deployment servido, durante e depois da falha.

Não há, no histórico de execuções do GitHub Actions, um run correspondente a esse push — o workflow `CI` dispara em `pull_request` e em `push` para `main` (§13.3), e o push em questão foi para uma branch não-produtiva sem Pull Request aberto. Por isso este documento **não afirma** que um check do GitHub também falhou nesse evento: não há evidência de que ele tenha rodado.

O que esse resultado confirma é C6 no lado do Workers Builds — falha de build não altera o que está sendo servido, e a falha foi observável na própria plataforma.

#### 13.9.5 Retenção de logs de build (D4)

Observação feita no Bloco C, em 2026-08-29: logs de builds executados cerca de dois dias antes continuavam acessíveis normalmente na Cloudflare. O **teto** de retenção não foi determinado — apenas esse piso foi observado, nessa data.

#### 13.9.6 Não observado / permanece aberto

- **Pull Request vindo de fork**: não testado. Não existe hoje uma segunda conta ou fork real disponível, e a decisão foi não fabricar esse cenário apenas para fechar um checkbox. Permanece **explicitamente pendente**, não confirmado — conforme o próprio ADR-0009 §6 adverte, a política de fork (§5) "só protege se for efetivamente verificada na configuração, e não presumida a partir do comportamento observado". Na UI observada durante o Bloco C, o Workers Builds não expôs uma flag separada de preview de fork que permitisse essa confirmação por outra via.
- **Alcance de variáveis/secrets de dashboard em builds não-produtivos**: não testado. Não existe hoje variável ou secret relevante para exercitar esse caso. É a incerteza que o ADR-0009 §6 chama de mais consequente, na fronteira com D9 — permanece aberta, e deve ser revisitada quando surgir o primeiro consumidor real desse tipo de configuração.
- **Consumo de build minutes e comportamento no limite de cota**: não testado artificialmente.

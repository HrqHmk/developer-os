# Checkpoints

Registro de estado do Developer OS em pontos de retomada do projeto. Cada checkpoint sintetiza o que foi entregue desde o anterior e o que vem a seguir, para que uma nova sessão — humana ou de agente — reconstrua o contexto sem depender de repasse manual.

Este documento **não é fonte de decisão arquitetural** (essa continua em `docs/adr/`) nem substitui `docs/roadmap.md` (que continua sendo o registro oficial de fases e itens). É uma camada de narrativa e histórico entre os dois.

Entradas em ordem cronológica **decrescente** (mais recente primeiro).

**Nota sobre este documento**: nenhum checkpoint anterior foi encontrado versionado no repositório (git, Issues, PRs ou Discussions — desabilitadas neste repositório). Uma referência a um "checkpoint de 2026-09-05" foi feita no início do ciclo que produziu a entrada abaixo, mas seu conteúdo não pôde ser localizado nem reconstruído a partir do estado real do repositório — não foi fabricado aqui. Esta é a primeira entrada efetivamente registrada neste arquivo.

---

## Checkpoint — 2026-09-06 — Changelog v1 concluído

### Estado geral

- **Fase 1 (Fundação)**: identidade visual, estrutura inicial, Home, Sobre, Blog e Projetos concluídos. **O item "CI/CD e automação do fluxo de deploy" permanece com o checkbox aberto em `docs/roadmap.md`**, apesar de a Issue #20 estar fechada e de `conventions.md` §13.9 já registrar o primeiro deploy real de produção como bem-sucedido — inconsistência documental pré-existente (não introduzida por este ciclo, já registrada como observação na PR #40, não corrigida aqui).
- **Fase 2 (Conteúdo)**: Primeiro artigo, Página Uses, Página Arquitetura e **Página Changelog** concluídos. **Página Learning é o único item pendente.**
- **Learning é o próximo item antes do encerramento da Fase 2.** Ainda não planejado, não tem Issue aberta e não foi iniciado por este ciclo.

### Changelog v1

- **Issue [#39](https://github.com/HrqHmk/developer-os/issues/39)** — planejada, com plano publicado como comentário na própria Issue, revisão independente de planejamento e plano revisado publicado como segundo comentário.
- **PR [#40](https://github.com/HrqHmk/developer-os/pull/40)** — `feat/39-changelog-v1` → `main`. **Mergeada** em 2026-09-06T08:37:41Z, squash commit [`30ea581`](https://github.com/HrqHmk/developer-os/commit/30ea581b333596dfa7e14f2f97f8f33f40412375). Issue #39 fechada automaticamente no mesmo instante.
- **Arquitetura adotada**: Markdown como terceiro content type do ADR-0003 (depois de Article e Project), reaproveitando `discovery.ts`, `frontmatter.ts` e `markdown.ts` **sem nenhuma modificação** — os três já eram agnósticos de tipo. Peças type-specific próprias, espelhando o padrão de Article/Project: `schemas/changelog.ts` (`title` + `date`, `.strict()`), `build-changelog.ts` (`buildChangelog()` → `CompiledChangelogEntry[]`), `virtual-changelog-plugin.ts` + `virtual-changelog.d.ts` (`virtual:changelog`).
- **Canonical snapshot**: `buildChangelog()` roda uma única vez em `vite.config.ts`, junto de `buildArticles()`/`buildProjects()`; o snapshot alimenta só o módulo virtual — **sem** entrada em `prerender.pages`, porque Changelog não tem rota `$slug`. Sua página estática é alcançada pelo crawler do prerender via link da Home, o mesmo mecanismo que já publica `/uses` e `/architecture`.
- **Rota única `/changelog`**, sem `/changelog/$slug`, sem layout `<Outlet />`. Cada entrada renderiza em `<section id={slug}>`, com deep link por âncora (`/changelog#<slug>`).
- **Ordenação**: `date` descendente, com **slug como desempate determinístico** quando as datas coincidem — contrato explicitamente não lido como "ordem cronológica fina", já que `date` é uma data civil (`YYYY-MM-DD`), sem informação de horário.
- **Seis entradas retroativas iniciais**, cada uma com evidência real de PR/Issue: Architecture v1 (2026-09-05), Uses v1 (2026-09-05), Projects v1 (2026-09-03), Blog v1 (2026-09-01), Foundation — Home + About (2026-08-30), CI and Deploy Pipeline (2026-08-29, redigida sem afirmar retroativamente que o item administrativo de roadmap estava concluído naquela data).
- **Nenhuma entrada sobre o próprio Changelog v1 foi criada antes do merge** — pode ser adicionada depois, com a data real do merge (`30ea581`, 2026-09-06).

### Boundaries preservados

Não foram introduzidos: generic content collections framework, generic builder, generic virtual plugin, refactor de Blog/Projects além da atualização de redação em `conventions.md` §8.4/§8.6, RSS/feed, filtros, busca, categorias/tags, paginação, changelog automático a partir de commits ou Conventional Commits, release automation, versionamento semântico, CMS, banco de dados, API, rota `/changelog/$slug` ou página por entrada, componente genérico de list item, e nenhuma abstração antecipando Learning.

### Validação (fatos observados na implementação e na PR, não alegação repassada sem checagem)

- `pnpm test`: 9 arquivos de teste, 55 testes, todos verdes (13 novos: 8 de schema + 5 de `build-changelog`).
- `pnpm typecheck`: limpo.
- `pnpm build`: passou; prerender emitiu 11 páginas, incluindo `/changelog`.
- **Prerender**: `dist/client/changelog/index.html` inspecionado diretamente — as seis entradas materializadas inline (título, `<time>` formatado, corpo compilado); página alcançada pelo crawler via link da Home, não por `prerender.pages` (intocado).
- **Anchors/deep link**: três evidências separadas — HTTP (`GET /changelog` → `200`, sem redirect inesperado), HTML (`id="<slug>"` presente no artefato servido) e navegador real (Chromium via Playwright, driblando o Chrome do sistema — não dependência do projeto) navegando a `/changelog#ci-and-deploy-pipeline`, resolvendo nativamente para a entrada correta **inclusive com JavaScript desativado**.
- **Boundary build-time/runtime**: `grep -rl` em `dist/server/` e `dist/client/` para módulos do compilador e suas dependências (`gray-matter`, `node:fs`, `unified`) → sem ocorrências; manifest do build (`dist/server/.vite/manifest.json`) inspecionado diretamente — o chunk de `changelog.tsx` só importa utilitários de rota e `format-published-at`, nenhum módulo do compilador; nenhuma server function/RPC para Changelog.
- **Home responsiva**: `flex-wrap justify-center` confirmado tanto no HTML servido quanto visualmente (screenshot real em Chrome headless a 350px) — a fileira de links quebra em duas linhas centradas, sem overflow.
- **Regressão**: `/`, `/about`, `/blog`, `/blog/why-im-building-developer-os`, `/projects`, `/projects/developer-os`, `/uses`, `/architecture` — todas `200` sob `pnpm preview`, sem alteração de comportamento.

### Revisão independente

- **Planejamento**: revisão independente do Codex retornou **APPROVE WITH CORRECTIONS** — nenhum blocker arquitetural. As correções (atualização completa de `conventions.md` §8.4/§8.6, separação da validação de fragmento em três evidências, precisão sobre o mecanismo de prerender, ajuste responsivo direto na Home, critérios objetivos de fronteira build-time/runtime) foram incorporadas ao plano revisado, publicado como novo comentário na Issue #39, sem apagar o plano original.
- **Código**: revisão independente do Codex sobre a implementação retornou **APPROVE**, sem BLOCKER e sem SHOULD FIX — reportado ao encerrar este ciclo. **Diferente da revisão de planejamento, este resultado não tem um artefato equivalente registrado no GitHub** (a PR #40 não tem nenhuma review formal nem comentário do Codex associados no momento deste checkpoint) — o fato do merge e seu estado (`MERGED`, `30ea581`) foram confirmados diretamente via `gh pr view`, mas o veredito do code review em si é registrado aqui como relatado, não como artefato auditável de forma independente.
- **Independent review informa a decisão humana; não a substitui.** Nem a revisão de planejamento nem a de código são gate de merge — o merge de #40 é, como sempre, decisão humana.

### Próximo passo

**Learning** é o próximo item antes do encerramento da Fase 2. Nenhuma Issue foi criada, nenhum plano foi feito e nenhuma linha de código foi escrita para Learning como parte deste ciclo de fechamento.

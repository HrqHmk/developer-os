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

Ferramentas executadas via `dlx`/`npx` **não são cobertas pelo lockfile**. Quando a versão dessas ferramentas afetar o código gerado, ela deve ser registrada aqui:

| Ferramenta | Versão fixada | Observação |
|---|---|---|
| `shadcn` (CLI) | `4.16.2` | Gera código no repositório; fora do lockfile |

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
│   └── <tipo>/       # ex.: articles/, notes/, changelog/
│       └── <slug>/
│           ├── index.md
│           └── <imagens do conteúdo>
├── data/             # conteúdo estruturado (módulos TypeScript declarativos)
├── schemas/          # schemas de frontmatter, um por tipo de conteúdo
└── pipeline/         # descoberta, validação e processamento de Markdown
```

- `entries/` contém **dado**, nunca código. `data/`, `schemas/` e `pipeline/` contêm **código**, nunca prosa longa.
- Cada entrada editorial é um **diretório próprio** com `index.md`, e não um arquivo solto — é o diretório que torna a entrada autocontida junto com suas imagens (P8).
- Nomes de tipo e de slug em **kebab-case**. O nome do diretório da entrada é o **identificador estável** daquele conteúdo.
- O mapeamento entre identificador e URL pública é assunto de roteamento e **não é definido por este documento**.

### 8.2 Frontmatter e schemas

- **Um schema por tipo de conteúdo**, em `src/content/schemas/`, nomeado pelo tipo no singular (ex.: `article.ts`).
- O schema é a **fonte única do contrato de metadados**. Os tipos consumidos pela aplicação são **derivados dele** por inferência — nunca declarados em paralelo.
- Schemas **rejeitam campos desconhecidos**: metadado que não existe no schema quebra o build em vez de ser silenciosamente ignorado.
- A validação acontece **em build** e falha o build (P2, P4). Não há fallback silencioso nem conteúdo parcialmente válido em produção.
- O **conjunto concreto de campos** de cada tipo é definido no próprio schema quando o tipo é implementado. Este documento não fixa esse conjunto.

### 8.3 Imagens de conteúdo

- Imagens que pertencem a uma entrada ficam **no diretório da própria entrada** e são referenciadas por **caminho relativo** no Markdown (ex.: `![...](./cover.png)`).
- **Não referenciar imagens de conteúdo a partir de `public/`** nem por URL absoluta do próprio site. `public/` é para ativos globais da aplicação, não para conteúdo.
- **Não há otimização ou transformação de imagens** (fora do escopo do ADR-0003). As imagens entram no repositório no formato final em que serão servidas; dimensionar e comprimir antes do commit é responsabilidade de quem publica.

### 8.4 Pipeline de Markdown

- O pipeline vive em `src/content/pipeline/`, com **responsabilidades separadas por módulo**: descoberta dos arquivos, validação do frontmatter e processamento do Markdown.
- O pipeline expõe **um único ponto de entrada público**. Rotas e componentes consomem esse ponto de entrada e **nunca importam arquivos `.md` diretamente** nem invocam o processador de Markdown por conta própria.
- O que sai do pipeline é **dado já validado e já processado** (P2, P3). Nenhuma etapa de parsing ocorre em runtime.
- Os **plugins habilitados ficam declarados em um único módulo**, explicitamente e nunca por default implícito. O pipeline deve manter **HTML bruto desabilitado** (P9).
- A lista nominal de plugins é registrada aqui quando o pipeline for implementado — o ADR-0003 deixou essa escolha fora do escopo da decisão.

### 8.5 Conteúdo estruturado em TypeScript

- Módulos em `src/content/data/`, um por conjunto de dados, nomeados pelo conteúdo que declaram (ex.: `uses.ts`).
- São **declarações de dados literais**: sem efeitos colaterais, sem I/O, sem acesso a variáveis de ambiente e sem lógica de negócio (P5).
- **Não importam código de aplicação** — nada de componentes, rotas, integrações ou helpers. A dependência é de tipos, não de comportamento.
- Exportar como `const`, validando a forma contra um **tipo explícito** para que o compilador acuse divergências sem descartar a inferência dos valores literais.
- **Prosa longa não entra aqui** (P6). Se uma entidade estruturada passar a ter corpo editorial, ela vira uma entrada em `entries/`, com os metadados no frontmatter.

---

## 9. Código Gerado por IA

- Agentes devem consultar **este documento, `architecture.md`, `design-system.md` e os ADRs aceitos** antes de propor padrões da stack.
- **Não assumir padrões antigos**: sintaxe ou configuração do Tailwind v3 (incluindo `tailwind.config.js`), nem configurações default do shadcn/ui que contrariem o registrado aqui.
- **Não assumir Radix UI**: a base deste projeto é Base UI, ainda que muito material disponível sobre shadcn/ui pressuponha Radix.
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

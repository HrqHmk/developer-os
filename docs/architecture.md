# Architecture

## 1. Visão Geral

Developer OS é uma aplicação web pessoal orientada a conteúdo, documentação e experimentos de engenharia de software e IA.

A arquitetura deve priorizar:

- simplicidade;
- baixo custo operacional;
- facilidade de manutenção;
- boa experiência de desenvolvimento;
- conteúdo versionado;
- facilidade de interpretação por humanos e agentes de IA;
- evolução incremental sem complexidade prematura.

---

## 2. Princípios Arquiteturais

### Simplicidade primeiro

A solução mais simples que atende ao requisito atual deve ser preferida, mas sem ignorar o futuro completamente. A idéia é criar uma base limpa que permita mudanças quando necessário.

Não introduzir serviços, abstrações ou infraestrutura apenas para necessidades hipotéticas futuras.

### Conteúdo como código

Sempre que fizer sentido, conteúdo e documentação devem permanecer versionados junto ao projeto.

### Separação de responsabilidades

Interface, conteúdo, regras de aplicação e integrações externas devem possuir responsabilidades claras e seguir o Princípio da Responsabilidade Única (SRP).

### AI-friendly

A estrutura do projeto deve ser previsível, semântica e documentada para facilitar navegação, manutenção e geração de código por humanos e agentes de IA.

Diretrizes:

* Utilizar nomes explícitos e semânticos para arquivos, módulos, funções e componentes.
* Manter responsabilidades bem delimitadas e estruturas de diretórios previsíveis.
* Evitar abstrações desnecessárias que dificultem a compreensão local do código.
* Manter documentação e arquivos de contexto objetivos, evitando informações redundantes que consumam desnecessariamente a janela de contexto dos agentes.
* Utilizar comentários apenas quando agregarem contexto relevante, priorizando explicar decisões, restrições ou motivos em vez de descrever o funcionamento óbvio do código.
* Registrar decisões arquiteturais relevantes em documentação própria, evitando depender de conhecimento implícito.

### Evolução incremental

A arquitetura deve permitir que funcionalidades sejam adicionadas progressivamente sem exigir grandes reestruturações.

---

## 3. Arquitetura de Alto Nível

```text
Usuário
   │
   ▼
Web Application
   │
   ├── Home
   ├── Blog
   ├── Projetos
   ├── Learning
   ├── Uses
   ├── Arquitetura
   ├── Changelog
   └── Playground IA
   │
   ▼
Content / Application Layer
   │
   ├── Conteúdo versionado
   ├── Metadados
   └── Integrações
```

A arquitetura inicial deve privilegiar uma aplicação única.

Separação em múltiplos serviços somente deverá ocorrer quando existir uma necessidade concreta.

---

## 4. Estrutura do Projeto

Estrutura inicial conceitual:

```text
developer-os/
├── docs/
│   ├── vision.md
│   ├── roadmap.md
│   ├── architecture.md
│   └── adr/                # Arquivos ADR (0001-titulo.md)
│
├── src/
│   ├── app/                # Camada de rotas/páginas
│   ├── components/         # Componentes de UI isolados
│   ├── content/            # Conteúdo, schemas e pipeline (ver ADR-0003)
│   ├── lib/                # Utilitários e helpers puros
│   └── integrations/       # Adaptadores de APIs externas e IAs
│
├── public/                 # Ativos estáticos
├── tests/
│   └── e2e/                # Testes E2E (ver ADR-0005)
└── README.md
```

Testes unitários e de integração ficam **co-locados** com o código que verificam, dentro de `src/`, e não em diretório próprio. `tests/` é reservado ao E2E, que não tem código-fonte correspondente para acompanhar. Ver ADR-0005 e `conventions.md` §12.

A estrutura definitiva dependerá da stack escolhida.

---

## 5. Conteúdo

O site será predominantemente orientado a conteúdo.

Tipos principais:

- artigos;
- projetos;
- notas de aprendizado;
- experimentos;
- registros de arquitetura;
- changelog;
- ferramentas utilizadas.

Sempre que possível, conteúdo deverá ser independente da camada de apresentação.

---

## 6. Integrações

Possíveis integrações futuras:

- GitHub;
- LinkedIn;
- analytics;
- newsletter;
- provedores de IA;
- outras APIs externas.

Integrações devem permanecer isoladas da lógica principal da aplicação.

---

## 7. Playground IA

Governado pelo ADR-0008 (`docs/adr/0008-estrategia-do-playground-ia.md`), status: Aceito.

Os objetivos originais desta seção — área isolada para experimentos, experimentos que não comprometem a estabilidade nem aumentam desnecessariamente a complexidade da aplicação principal, e arquitetura própria quando necessário — estão expressos como propriedades duráveis PG1–PG10 naquele ADR.

O Playground é uma **área interativa do portfólio** com experiências que demonstram decisões concretas de AI Engineering, e **não uma plataforma de experimentos**: experiências são autocontidas, removíveis isoladamente e podem ter implementações diferentes entre si. Infraestrutura compartilhada nasce de repetição demonstrada, nunca de antecipação.

"Área isolada" passou a ter duas leituras verificáveis, e não apenas uma: além de o site não depender do Playground em código, **falha, abuso, esgotamento de cota ou build quebrado do Playground não podem derrubar, bloquear a publicação nem degradar as rotas principais** — e demonstrar esse isolamento é pré-condição da primeira experiência pública (PG1). Caso ele não seja demonstrável dentro da aplicação única, a arquitetura própria prevista aqui deixa de ser opção e passa a ser consequência da propriedade, com a preferência por aplicação única de §3 cedendo a ela.

Nada é construído antes do gatilho de PG10, e a ativação é **decisão humana afirmativa** — existir uma boa demonstração é condição necessária, não suficiente.

---

## 8. Persistência

**A definir.**

A primeira versão deverá evitar banco de dados caso conteúdo versionado seja suficiente.

Persistência será introduzida apenas quando houver uma necessidade concreta, como:

- dados gerados por usuários;
- autenticação;
- histórico dinâmico;
- dados provenientes de integrações;
- funcionalidades interativas.

---

## 9. Deploy e Infraestrutura

Governado pelo ADR-0006 (`docs/adr/0006-plataforma-de-deploy.md`), status: Aceito.

Os objetivos originais desta seção — deploy automatizado, baixo custo, configuração mínima, previews por alteração e possibilidade de rollback — estão expressos como propriedades duráveis D1–D9 naquele ADR.

O artefato publicado é **pré-renderizado e servido como ativo estático**. O runtime servidor existe dentro do artefato — a stack não oferece saída sem servidor — mas não é invocado por requisições de conteúdo pré-renderizado. Execução server-side passa a ser utilizada apenas diante de necessidade concreta, sem exigir troca de plataforma.

---

## 10. Decisões Arquiteturais

Decisões relevantes que envolvam trade-offs devem ser registradas separadamente como ADRs.

Os ADRs seguirão um formato simplificado baseado em MADR:

```text
# ADR-XXX — Título da decisão

## Status
Proposto | Aceito | Substituído | Depreciado

## Contexto
Qual problema ou decisão motivou este ADR?

## Decisão
Qual solução foi escolhida?

## Consequências
Quais benefícios, limitações e trade-offs essa decisão introduz?
```

Quando relevante, o ADR poderá também registrar alternativas consideradas.

Os arquivos deverão seguir uma nomenclatura sequencial e semântica, no padrão `000X-titulo-curto.md`:

```text
docs/adr/
├── 0001-tech-stack.md
├── 0002-estrategia-de-conteudo.md
└── 0003-plataforma-de-deploy.md
```


Exemplos:

- escolha do framework;
- estratégia de conteúdo;
- estratégia de deploy;
- introdução de banco de dados;
- autenticação;
- integração com provedores de IA.

---

## 11. Restrições

A arquitetura deve evitar inicialmente:

- microservices;
- infraestrutura distribuída;
- banco de dados sem necessidade;
- abstrações prematuras;
- dependência excessiva de serviços externos;
- funcionalidades de IA sem valor claro.

---

## 12. Decisões Técnicas

### Definidas

- Stack principal: TanStack Start + React + TypeScript (registrado em ADR-0001, status: Aceito)
- Estratégia de estilização/UI: Tailwind CSS + shadcn/ui sobre Base UI (registrado em ADR-0002, status: Aceito). Temas light/dark baseados em design tokens semânticos via CSS variables, conforme `design-system.md`. Componentes não devem utilizar cores hardcoded, salvo exceções justificadas.
- Formato e armazenamento de conteúdo: arquitetura híbrida por natureza do conteúdo (registrado em ADR-0003, status: Aceito). Markdown puro para prosa, módulos TypeScript declarativos para dados estruturados e componentes isolados para interatividade. Todo conteúdo publicável é descoberto, validado e processado em build, sem processamento de Markdown em runtime. Convenções operacionais em `conventions.md` §8.
- Estratégia de Git / Branching: fluxo próximo do GitHub Flow, com Issue como unidade de trabalho (registrado em ADR-0004, status: Aceito). `main` única e sempre publicável; nenhuma mudança entra fora de Pull Request; validação humana obrigatória antes do merge. Agentes de IA propõem, não integram. Convenções operacionais em `conventions.md` §11.
- Estratégia de testes: propriedades duráveis T1–T11 (registrado em ADR-0005, status: Aceito). Verificação em camadas complementares — tipagem e build cobrem estrutura e contrato de dados; testes cobrem comportamento. Obrigatoriedade por área, nunca por percentual de cobertura; pirâmide como direção, não como cota. Ferramentas decididas (Vitest, React Testing Library, Playwright) e instaladas sob demanda. Convenções operacionais em `conventions.md` §12.
- Plataforma e estratégia de deploy: propriedades duráveis D1–D9 (registrado em ADR-0006, status: Aceito). O artefato publicado é pré-renderizado e servido como ativo estático; o runtime servidor existe no artefato, mas não é invocado por requisições de conteúdo pré-renderizado, e execução server-side entra apenas diante de necessidade concreta. Publicação é consequência do merge, com preview por Pull Request e reversão sem rebuild. Cloudflare Workers é a implementação inicial, substituível sem novo ADR. **D9 (segmentação de segredos por ambiente) é pré-condição obrigatória antes da introdução do primeiro segredo** — a implementação inicial não a satisfaz por padrão.

- Estratégia de analytics: propriedades duráveis A1–A9 (registrado em ADR-0007, status: Aceito). Coleta cookieless e agregada, sem identificador persistente e sem persistir IP ou User-Agent; medir não invoca o runtime servidor, preservando a forma do artefato definida em ADR-0006 §2. O conhecimento do fornecedor é confinado a uma única fronteira, e analytics nunca é dependência funcional da aplicação — removê-la ou torná-la no-op não altera o comportamento. GoatCounter é a implementação inicial, substituível sem novo ADR; Umami Cloud é candidato condicional. **Nada é instalado antes do gatilho de A9** (conteúdo publicado e distribuição externa), e **A6 (ausência de cobrança automática ou variável) é revalidada na instalação e a cada troca de fornecedor ou plano**. Os números são direcionais, não exatos (A8).

- Estratégia do Playground IA: propriedades duráveis PG1–PG10 (registrado em ADR-0008, status: Aceito). Área interativa do portfólio com experiências que demonstram decisões concretas de AI Engineering, não uma plataforma de experimentos; experiências autocontidas e removíveis isoladamente, com infraestrutura compartilhada nascendo de repetição demonstrada. O Playground nunca é dependência do site, e **demonstrar isolamento de raio de explosão é pré-condição da primeira experiência pública** (PG1). Consumo público de recurso pago exige teto conhecido antes da publicação e renovável em janela, sem cobrança, upgrade ou fallback pago automáticos (PG4); a execução não tem promessa de permanência, mas o registro editorial tem (PG5). Nenhum fornecedor, modelo, SDK ou mecanismo é escolhido, e **nada é construído antes do gatilho de PG10**, cuja ativação é decisão humana afirmativa. **PG9 — persistir conteúdo digitado pelo visitante — permanece deliberadamente em aberto.** Ver §7.

### Pendentes

- [ ] CI/CD

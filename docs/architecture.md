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

O Playground deverá funcionar como uma área isolada para experimentos.

Experimentos não devem comprometer a estabilidade ou aumentar desnecessariamente a complexidade da aplicação principal.

Quando necessário, experimentos poderão possuir arquitetura própria.

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

**A definir.**

Objetivos:

- deploy automatizado;
- baixo custo;
- configuração mínima;
- previews por alteração;
- possibilidade de rollback.

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

### Pendentes

- [ ] Plataforma de deploy
- [ ] Analytics
- [ ] Estratégia para Playground IA
- [ ] CI/CD

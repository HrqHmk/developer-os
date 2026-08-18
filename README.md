# Developer OS

Laboratório público de engenharia de software e orquestração de IA.

Mais do que um portfólio, é um ecossistema AI-first onde documento decisões arquiteturais, padrões de desenvolvimento e como utilizo agentes de IA para acelerar a construção de software, o aprendizado e a tomada de decisão.

## Estado atual

O projeto está na fase de especificação. **Não há aplicação neste repositório ainda** — o scaffold inicial do Create Next App foi removido, e a estrutura do TanStack Start será criada em trabalho próprio.

O que existe hoje é a base documental que governa o que vier a ser construído.

## Documentação

| Documento | Escopo |
|---|---|
| [`docs/vision.md`](docs/vision.md) | O que é o projeto, objetivos e princípios |
| [`docs/roadmap.md`](docs/roadmap.md) | Fases previstas |
| [`docs/architecture.md`](docs/architecture.md) | Princípios, restrições e decisões técnicas |
| [`docs/design-system.md`](docs/design-system.md) | Fonte única de verdade visual |
| [`docs/conventions.md`](docs/conventions.md) | Convenções de implementação |
| [`docs/adr/`](docs/adr/) | Registros de decisão arquitetural |

Em caso de conflito, **ADRs aceitos prevalecem** sobre os demais documentos.

## Decisões arquiteturais

| ADR | Decisão | Status |
|---|---|---|
| [0001](docs/adr/0001-tech-stack.md) | Tech stack — TanStack Start + React + TypeScript | Aceito |
| [0002](docs/adr/0002-estrategia-de-estilizacao.md) | Estratégia de estilização — Tailwind CSS + shadcn/ui sobre Base UI | Aceito |
| [0003](docs/adr/0003-formato-e-armazenamento-de-conteudo.md) | Formato e armazenamento de conteúdo | Aceito |
| [0004](docs/adr/0004-estrategia-de-git-e-branching.md) | Estratégia de Git e branching | Aceito |
| [0005](docs/adr/0005-estrategia-de-testes.md) | Estratégia de testes | Aceito |
| [0006](docs/adr/0006-plataforma-de-deploy.md) | Plataforma e estratégia de deploy | Aceito |
| [0007](docs/adr/0007-estrategia-de-analytics.md) | Estratégia de analytics | Aceito |

## Como o trabalho entra

O fluxo é definido pelo [ADR-0004](docs/adr/0004-estrategia-de-git-e-branching.md), com a mecânica em [`conventions.md`](docs/conventions.md) §11.

- `main` é a única branch durável e permanece sempre publicável.
- Nenhuma mudança entra fora de um Pull Request.
- Trabalho não-trivial nasce de uma Issue, que é a especificação da tarefa.
- Toda mudança é validada por um humano antes do merge. Agentes de IA propõem, não integram.

Trabalho assistido por IA é registrado no histórico — o trailer `Co-Authored-By` é mantido deliberadamente. Num projeto cujo tema é orquestração de IA, a divisão humano/IA é dado observável, não informação a omitir.

## Contexto para agentes de IA

[`CLAUDE.md`](CLAUDE.md) carrega as instruções sempre presentes. Contexto de execução vive em Issues e Pull Requests; contexto durável é promovido a documentação.

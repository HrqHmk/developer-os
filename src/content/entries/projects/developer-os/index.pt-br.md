---
title: Developer OS
description: Um laboratório público de engenharia onde arquitetura de software, desenvolvimento assistido por IA e decisões com human-in-the-loop são documentados enquanto acontecem, e não maquiados depois.
technologies:
  - TypeScript
  - React
  - TanStack Start
  - Tailwind CSS
  - Cloudflare Workers
repositoryUrl: https://github.com/HrqHmk/developer-os
---

## O que é

O Developer OS é este site — um laboratório público de engenharia, não um portfólio. Cada página pela qual você pode navegar, incluindo esta, é conteúdo e código versionados no mesmo repositório, gerados pelo mesmo pipeline e publicados pelo mesmo processo de revisão descrito abaixo.

## Por que estou construindo

A maioria das apresentações de projeto mostra um resultado pronto e deixa de fora as decisões que levaram até ele. Esta não. A especificação, as decisões de arquitetura e os trade-offs por trás de cada funcionalidade são registrados antes de o código existir, não reconstruídos depois para a apresentação.

## Como funciona

O conteúdo — esta página incluída — é Markdown versionado com um contrato de frontmatter validado, descoberto e compilado inteiramente em tempo de build. Nada aqui é buscado, interpretado ou renderizado a partir de Markdown no momento da requisição: o que é publicado é HTML já processado, servido como artefato estático.

## Abordagem de engenharia

Claude e Codex escrevem e revisam a maior parte do código; toda decisão arquitetural que ainda não esteja documentada para e aguarda aprovação humana antes de ser implementada. Toda mudança entra por um Pull Request, revisado por um humano antes do merge — a profundidade dessa revisão acompanha o que está em jogo, mas nunca chega a zero.

## Estado atual

A Home, a página Sobre e o Blog estão no ar. Esta página de Projetos é a adição mais recente. A automação de CI/CD ainda está em andamento — o build é verificado a cada mudança, mas o deploy continua sendo um passo manual por enquanto.

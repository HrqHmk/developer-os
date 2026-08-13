# ADR-0001 — Tech Stack

## Status
Aceito

## Contexto

O Developer OS precisa de uma stack principal para sua primeira aplicação web. A escolha deve atender aos princípios documentados em `docs/vision.md` e `docs/architecture.md`:

- Laboratório público de engenharia de software e orquestração de IA, servindo como single source of truth para o autor e para agentes de IA.
- Evolução deliberada como engenheiro: o projeto existe também para explorar conceitos novos e enfrentar desafios técnicos reais — não apenas para entregar da forma mais direta possível.
- Simplicidade sobre complexidade (`vision.md`): continua sendo um critério relevante também para a escolha de tecnologia, mas não o único nem decisivo isoladamente. Nesta decisão, foi ponderado contra outros critérios documentados: evolução incremental, capacidade de suportar necessidades futuras do roadmap e o objetivo de aprendizado deliberado como engenheiro.
- Site predominantemente orientado a conteúdo nas Fases 1–2 do roadmap (Home, Blog, Projetos, artigos), evoluindo para uma área de Playground IA com experimentos interativos nas Fases 3+ (formato exato — incluindo eventual necessidade de streaming — ainda não definido).
- Restrições arquiteturais: aplicação única, sem banco de dados até haver necessidade concreta, sem abstrações prematuras, AI-friendly.

Levantamento técnico (ago/2026): TanStack Start está na linha estável 1.x (`@tanstack/react-start` 1.168.x, releases quase diárias), com prerenderização/SSG documentada e suporte oficial a deploy em Cloudflare, Netlify, Railway, Vercel e outros presets Vite. A documentação oficial ainda descreve o projeto como "Release Candidate" mesmo com a linha 1.x ativa. O ecossistema é significativamente menor que o do Next.js (ordem de 30:1 em downloads semanais), o que reduz a quantidade de conteúdo de treino que agentes de IA têm sobre o framework e aumenta o risco de código gerado desatualizado ou baseado em padrões de outros frameworks (ex. Next.js).

## Decisão

Adotar **TanStack Start + React + TypeScript** como stack principal do Developer OS.

- Build tool: Vite.
- Roteamento e data loading: TanStack Router (incluso no Start), com type-safety ponta a ponta.
- Renderização: priorizar prerenderização estática (SSG) para conteúdo (Fases 1–2 do roadmap); habilitar server functions progressivamente conforme o Playground IA (Fase 3) exigir. Streaming é uma capacidade suportada nativamente pelo framework, disponível caso o Playground IA venha a precisar dela — não é, hoje, um requisito confirmado.
- Conteúdo: Markdown/MDX versionado no repositório (formato exato de armazenamento fica pendente de ADR próprio).
- Plataforma de deploy, estratégia de estilização/UI, testes e CI/CD permanecem pendentes e serão registrados em ADRs separados, conforme `architecture.md` §10.

## Consequências

### Prós

- Type-safety ponta a ponta (rotas, loaders, server functions) reduz ambiguidade tanto para o autor quanto para agentes de IA — alinhado ao princípio AI-friendly.
- Fronteira cliente/servidor explícita via server functions, sem convenções implícitas como as do App Router do Next.js (`"use server"`, RSC vs. client components).
- Caminho de evolução incremental real: dá para começar 100% estático (SSG) e ligar recursos dinâmicos só quando o Playground IA exigir, sem trocar de framework.
- Sem lock-in relevante: baseado em Vite, com múltiplos presets de deploy (Cloudflare, Netlify, Vercel, Railway, node, bun).
- Server functions nativas favorecem diretamente os casos de uso de IA do Playground (Fase 3); suporte nativo a streaming fica disponível caso venha a ser necessário, sem exigir troca de framework — mas isso é uma capacidade, não um requisito já confirmado do roadmap.
- Os desafios técnicos que o TanStack Start apresenta (type-safety full-stack, server functions, e potencialmente streaming, caso o Playground IA venha a exigir) estão alinhados à trajetória de evolução que o autor busca como engenheiro (`vision.md`) — o argumento não é que uma tecnologia mais difícil gere mais evolução, mas que este conjunto específico de desafios é relevante para essa trajetória.

### Contras / riscos

- **Ecossistema imaturo**: ordem de 30x menos downloads semanais que Next.js; menos tutoriais, starters e respostas prontas para problemas específicos.
- **Escassez de dados de treino para agentes de IA**: modelos tendem a alucinar padrões de Next.js ou APIs antigas do próprio TanStack (ex. `vinxi` → Vite, mudanças em `app.config.ts`). Mitigação: manter um documento de convenções da stack no repositório e fixar versões deliberadamente.
- **Cadência de releases muito alta** (quase diária na linha 1.x): risco de quebra em atualizações não intencionais. Mitigação: lockfile e atualizações deliberadas, não automáticas.
- **Documentação oficial defasada em relação ao código**: overview ainda descreve o projeto como "Release Candidate".
- **Sem otimização de imagem nativa** (equivalente a `next/image`) nem ISR; RSC é experimental. Precisará de solução própria (ex. Cloudflare Images, `unpic`) quando o site tiver volume relevante de imagens.
- **Recursos de Fase 4 do roadmap (RSS, sitemap, busca) não vêm prontos** — implementação manual, diferente de frameworks content-first como Astro.
- **Rotas dinâmicas de conteúdo** (ex. `/blog/$slug`) não entram na descoberta automática de prerender — precisam ser listadas explicitamente ou alcançadas via crawling de links.

## Alternativas consideradas

- **Astro + ilhas React**: melhor encaixe imediato para um site content-first (content collections nativas, zero-JS por padrão, menor esforço em SEO/RSS/imagens). Descartado como escolha principal porque exigiria uma arquitetura híbrida separada para o Playground IA (server functions e, caso venham a ser necessários, streaming full-stack, são mais desajeitados em Astro) e não exercita os desafios técnicos que fazem parte da trajetória de evolução buscada pelo autor — não por ser uma tecnologia "mais fácil".
- **Next.js (App Router)**: ecossistema maior, mais dados de treino para agentes de IA, imagens e ISR nativos. Descartado porque o modelo mental de Server Components (`"use server"`, fronteiras implícitas cliente/servidor) tende a gerar mais ambiguidade em código gerado por IA, e por já ter sido a stack inicial do projeto (scaffold padrão do `create-next-app`) sem alinhamento deliberado com os princípios documentados.
- **Híbrido (Astro para o site + aplicação separada para o Playground IA)**: tecnicamente permitido pela `architecture.md` §7 (experimentos podem ter arquitetura própria), mas contraria a preferência por aplicação única (§3) e introduz complexidade operacional (dois deploys, duas stacks) sem necessidade concreta neste momento.

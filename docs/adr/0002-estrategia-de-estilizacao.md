# ADR-0002 — Estratégia de Estilização e UI

## Status
Aceito

## Contexto

O ADR-0001 definiu TanStack Start + React + TypeScript como stack principal. Falta definir como a interface será estilizada e como componentes de UI serão construídos.

A decisão precisa atender às restrições e princípios já documentados:

- **AI-friendly** (`architecture.md` §2): estrutura previsível e semântica, favorecendo navegação e geração de código por humanos e agentes de IA.
- **Conteúdo como código** (`architecture.md` §2): preferir o que fica versionado junto ao projeto.
- **Separação de responsabilidades** (`architecture.md` §2): a camada de interface deve ficar contida, sem vazar para conteúdo ou regras de aplicação.
- **Sem abstrações prematuras** (`architecture.md` §11).
- **Renderização SSG-first** (ADR-0001): a solução não pode depender de runtime de estilos que complique prerenderização.
- **Design system já definido** (`design-system.md`): tokens semânticos para Light e Dark, escala de spacing fechada, escalas próprias de radius (8/12/16/20) e tipografia (`text-6xl` = 56px), proibição de cores hardcoded em componentes e política de só introduzir novos tokens diante de necessidade visual concreta.
- **Roadmap Fase 4** inclui Dark Mode, o que torna theming por tokens um requisito de médio prazo, não um extra.

Levantamento técnico (ago/2026): Tailwind CSS está em 4.3.3, com configuração CSS-first via `@theme` (sem `tailwind.config.js` obrigatório) e tokens expostos nativamente como CSS variables. O CLI do shadcn/ui está em 4.16.2 e possui guia oficial de instalação para TanStack Start. O shadcn/ui não é uma dependência tradicional: o CLI copia o código-fonte dos componentes para o repositório.

Desde julho de 2026, **Base UI** (`@base-ui/react`, 1.7.0) é a base de componentes padrão do shadcn/ui para novos projetos. O Radix não foi depreciado, segue recebendo atualizações e permanece uma alternativa válida e suportada, selecionável na inicialização.

## Decisão

Adotar **Tailwind CSS + shadcn/ui sobre Base UI** como estratégia de estilização e UI.

### Base de componentes

- **Base UI** como biblioteca de primitivos. Tratando-se de um projeto novo, adotar a recomendação atual do shadcn/ui para novos projetos mantém a configuração inicial alinhada ao caminho padrão do upstream.
- Os primitivos do Base UI permanecem como **dependência instalada**. O que fica versionado no repositório são os componentes gerados pelo shadcn/ui, que consomem esses primitivos — não os primitivos em si.
- A base deve ser **especificada explicitamente na inicialização** (`--base base`), sem depender do default vigente do CLI, para que a decisão por Base UI permaneça explícita caso esse default mude no futuro.

### Estilização e tokens

- **Tailwind CSS v4** com configuração CSS-first (`@theme`), sem arquivo de configuração JavaScript.
- **Tokens do `design-system.md` como fonte única de verdade** para cor, tipografia, spacing e radius. As escalas que divergem dos defaults do Tailwind (radius 8/12/16/20 e `text-6xl` = 56px) devem ser declaradas explicitamente.
- **A escala de spacing é fechada**, conforme `design-system.md`. Os defaults do Tailwind não garantem essa restrição — permitem valores arbitrários e degraus fora da escala. A regra é mantida por **convenção e code review**, sem enforcement automatizado nesta fase. Valores fora da escala só entram após serem incorporados ao design system diante de necessidade visual concreta.

### Theming

- Valores dos tokens declarados em `:root` (Light) e sobrescritos em `.dark` (Dark).
- Variáveis semânticas mapeadas para as utilities do Tailwind via `@theme inline`.
- Componentes consomem apenas tokens semânticos e não conhecem o tema ativo, conforme `design-system.md`.

### Uso do CLI, controle de mudanças e rastreabilidade

O `shadcn` é executado via `dlx`/`npx` e busca o código de um registry remoto, gerando arquivos no repositório. O lockfile governa apenas dependências de runtime e não alcança esse output. A estratégia abaixo **não garante reprodução determinística** do que o registry entrega; o que ela garante é **controle de mudanças e rastreabilidade** — toda alteração no código gerado passa a aparecer como diff revisável no histórico do projeto.

- **Invocar o CLI sempre com versão explícita** (ex.: `shadcn@4.16.2`), nunca `@latest`. A versão vigente deve estar registrada no repositório junto às convenções da stack.
- **Base explícita** na inicialização (`--base base`), conforme definido acima.
- **`components.json` versionado no repositório.** As configurações que ele registra fazem parte das convenções que orientam a geração futura de componentes.
- **Código gerado commitado** no repositório, sob `src/components/ui/`.
- **Revisar o diff gerado pelo CLI antes de aceitá-lo.** O output é código do projeto, sujeito a code review como qualquer outro.
- **Atualizações de componentes são deliberadas**, feitas com intenção explícita e revisadas individualmente — nunca automáticas ou em lote silencioso.
- **Componentes adaptados aos tokens existentes** no momento da integração. Não adotar conjuntos de tokens próprios da biblioteca (`sidebar-*`, `chart-*`), conforme a política já registrada em `design-system.md`.
- **Variantes de componente via `class-variance-authority` (cva)**, padrão que o próprio shadcn/ui já utiliza, em vez de concatenar utilities cruas em JSX de página.

### Fora do escopo desta decisão

A família tipográfica **já está definida** pelo `design-system.md` (`Geist`, com `system-ui` e `sans-serif` como fallback) e não faz parte desta decisão. Permanece pendente apenas a **estratégia de distribuição e carregamento** da fonte (self-host, pacote npm ou CDN), a ser decidida separadamente por envolver trade-offs de performance e dependência externa.

Estratégia de testes de UI e biblioteca de ícones também seguem pendentes.

## Consequências

### Prós

- **UI como código versionado**: os componentes do shadcn/ui ficam no repositório como código legível, não em `node_modules`. Reforça o papel de single source of truth da `vision.md` e permite que agentes de IA leiam o componente real em vez de inferir a API de uma biblioteca fechada.
- **Zero runtime de estilos**: Tailwind compila para CSS estático, compatível com a estratégia SSG-first do ADR-0001 e sem os problemas de hidratação/FOUC típicos de CSS-in-JS com runtime em SSR.
- **Theming por CSS variables** atende diretamente o Dark Mode previsto na Fase 4 do roadmap, sem biblioteca adicional: trocar de tema é sobrescrever tokens em `.dark`.
- **Acessibilidade herdada do Base UI**, evitando reconstruir primitivos (foco, teclado, ARIA) do zero.
- **Configuração inicial alinhada ao caminho padrão do upstream**: por se tratar de um projeto novo, adotar a base recomendada pelo shadcn/ui mantém o projeto na configuração que a documentação e os exemplos oficiais assumem por padrão.
- **Suporte oficial ao TanStack Start** na documentação do shadcn/ui, o que reduz especificamente nesta camada o risco de escassez de dados de treino registrado no ADR-0001.
- **Modelo de tokens compatível com o design system**: o padrão `:root` / `.dark` + `@theme inline` consome exatamente o formato de tokens semânticos que o `design-system.md` já define.

### Contras e riscos

- **Tensão com o princípio de nomes semânticos** (`architecture.md` §2): classes utilitárias inline são, por natureza, o oposto de nomes semânticos. Mitigado — não eliminado — pelo encapsulamento em componentes nomeados e pelo uso de `cva`; fora do design system, JSX de página tende a acumular strings de classes.
- **Base UI é mais recente que o Radix em anos de produção.** Ganha por ser o caminho padrão do shadcn/ui, mas tem menos histórico acumulado e menor volume de material de terceiros — o que se soma ao risco de escassez de dados de treino do ADR-0001. Agentes de IA tendem a gerar código de Radix ao serem solicitados por componentes shadcn/ui.
- **O controle de mudanças depende de disciplina, não de ferramenta.** Fixar a versão de invocação, versionar `components.json` e revisar diffs são convenções, não garantias técnicas. O código vem de um registry remoto e não há reprodução determinística: se as convenções não forem seguidas, mudanças podem entrar sem revisão.
- **Escala de spacing fechada sem enforcement automatizado**: a restrição depende de convenção e code review. Há risco real de drift, especialmente em código gerado por agentes de IA, que não têm como inferir a regra a partir da configuração do Tailwind. Mitigação possível no futuro: lint de classes arbitrárias, se o drift se mostrar frequente.
- **Manutenção manual dos componentes**: por serem copiados, componentes do shadcn/ui não são atualizados via gerenciador de pacotes. Manter-se atualizado passa a ser responsabilidade explícita do projeto.
- **Risco acumulado de APIs em movimento**: sobrepõe-se ao risco já aceito no ADR-0001. TanStack Start, Tailwind v4 e a própria migração do shadcn/ui para Base UI tiveram mudanças recentes, e agentes de IA tendem a sugerir padrões antigos (`tailwind.config.js`, sintaxe v3, primitivos Radix).
- **Escalas custom exigem configuração explícita**: radius e `text-6xl` divergem dos defaults. Um agente que assuma os valores padrão produzirá interface fora do design system — a configuração de tema precisa ser tratada como parte da documentação de contexto.
- **Aumento da superfície de código a revisar** no repositório, à medida que componentes forem adicionados. Mitigado pelo fato de serem componentes de apresentação, sem lógica de negócio.

## Alternativas consideradas

- **shadcn/ui sobre Radix UI**: base madura, com mais anos de produção e maior volume de material de terceiros. Continua sendo uma alternativa válida e suportada pelo shadcn/ui, selecionável via `--base radix`. Não foi a escolha deste projeto apenas porque, tratando-se de um projeto novo, não há motivo para divergir da recomendação atual do upstream para novos projetos.
- **Panda CSS**: zero-runtime como Tailwind e com tokens fortemente tipados, o que atenderia bem ao princípio AI-friendly. Descartado por ter ecossistema de componentes prontos muito menor, o que anularia o ganho de acessibilidade e velocidade trazido pelo shadcn/ui.
- **CSS Modules + primitivos headless (sem shadcn/ui)**: abordagem mais "vanilla", sem classes utilitárias, resolvendo a tensão com o princípio de nomes semânticos. Descartada porque exigiria reconstruir manualmente o que o shadcn/ui já entrega pronto sobre a mesma base de primitivos, sem benefício claro.
- **UnoCSS**: motor mais rápido e sintaxe compatível com Tailwind. Descartado porque ecossistema e documentação menores agravariam o risco de escassez de dados de treino para agentes de IA já assumido no ADR-0001.
- **Chakra UI / Mantine**: bibliotecas "baterias inclusas", com temas prontos. Descartadas por dependerem de runtime de estilos, reintroduzindo a complexidade que Tailwind + shadcn/ui evitam, e por não manterem o código dos componentes versionado no projeto.

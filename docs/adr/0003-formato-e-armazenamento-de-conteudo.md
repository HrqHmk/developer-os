# ADR-0003 — Formato e Armazenamento de Conteúdo

## Status
Aceito

## Contexto

O ADR-0001 fechou a stack principal em TanStack Start + React + TypeScript e deixou explicitamente pendente o formato de conteúdo: *"Markdown/MDX versionado no repositório (formato exato de armazenamento fica pendente de ADR próprio)"*. A mesma pendência está registrada em `architecture.md` §12, e o §10 já prevê "estratégia de conteúdo" como exemplo de decisão que merece ADR.

O site é predominantemente orientado a conteúdo nas Fases 1–2 do roadmap (Home, Blog, Projetos, artigos), evoluindo para o Playground IA na Fase 3.

A decisão precisa atender às restrições e princípios já documentados:

- **Conteúdo como código** (`architecture.md` §2): conteúdo e documentação permanecem versionados junto ao projeto.
- **Conteúdo independente da camada de apresentação** (`architecture.md` §5).
- **AI-friendly** (`architecture.md` §2): estrutura previsível e semântica; o conteúdo deve ser legível por agentes de IA sem exigir execução de build.
- **Sem banco de dados até haver necessidade concreta** (`architecture.md` §8) e **sem abstrações prematuras** (§11).
- **SSG-first** (ADR-0001): o processamento de conteúdo acontece em build, não em runtime.
- **Evolução deliberada como engenheiro** (`vision.md`): o projeto existe também para enfrentar desafios técnicos reais, não apenas para entregar da forma mais direta possível.

Dois pontos determinam o formato desta decisão.

O primeiro é que os tipos de conteúdo previstos em `architecture.md` §5 **não são homogêneos**. Artigos, notas de aprendizado e changelog são prosa longa. Uses e a stack de projetos são listas de forma fixa com pouca prosa. Experimentos do Playground IA exigem interatividade real. Tratar os três casos com a mesma tecnologia obrigaria a escolher entre um formato pobre para prosa ou um formato desnecessariamente complexo para dados.

O segundo é que a decisão precisa distinguir **propriedades arquiteturais** — que definem o que a camada de conteúdo garante e devem sobreviver a trocas de ferramenta — de **escolhas de implementação**, que são substituíveis sem revisar a arquitetura. Bibliotecas de conteúdo e plugins de Markdown mudam com frequência; as garantias que o projeto depende delas para oferecer, não.

Levantamento técnico (ago/2026), relevante para as opções de implementação:

- `unified` está em 11.0.5 (~50M downloads semanais), com ecossistema remark/rehype maduro. É a base de fato para processamento de Markdown em JavaScript.
- `zod` está em 4.4.3.
- `import.meta.glob` é API nativa do Vite, já disponível pela stack definida no ADR-0001.
- **Content Collections** está em `@content-collections/core` 0.15.2 e `@content-collections/vite` 0.3.0 (~124k downloads semanais), com quickstart oficial para TanStack Start (v1.121.0+) e uso em produção pelo próprio `tanstack.com`.

## Decisão

### 1. Propriedades arquiteturais da camada de conteúdo

Estas propriedades são a decisão. Qualquer implementação — atual ou futura — precisa satisfazê-las, e é por elas que uma alternativa deve ser avaliada.

- **P1 — Conteúdo é dado versionado.** Todo conteúdo publicável vive no repositório, em formatos legíveis por humanos e por agentes de IA sem execução de build.
- **P2 — Todo conteúdo publicável é descoberto, validado e processado durante o build.** Não há descoberta, validação ou processamento de conteúdo em tempo de requisição. A forma da validação varia por camada: conteúdo em Markdown é validado por schema (P4); conteúdo estruturado é validado pela verificação de tipos do compilador (P5).
- **P3 — O artefato final não depende de leitura nem de compilação de Markdown em runtime.** O que chega ao navegador é resultado já processado; o parser de Markdown não faz parte do runtime da aplicação.
- **P4 — Metadados têm contrato explícito e validado em build.** O frontmatter de cada tipo de conteúdo possui schema; conteúdo que viole o schema **falha o build**, em vez de degradar silenciosamente em produção. Os tipos consumidos pela aplicação derivam desse schema.
- **P5 — Conteúdo estruturado é declarativo.** Módulos TypeScript usados como conteúdo são declarações de dados: sem efeitos colaterais, sem acesso a I/O e sem lógica de negócio. São dados que por acaso são tipados pelo compilador, não código de aplicação.
- **P6 — Prosa longa permanece em Markdown.** Vale inclusive quando a prosa pertence a uma entidade estruturada: uma entidade com metadados estruturados e corpo editorial mantém os metadados na camada estruturada e o corpo em Markdown. Prosa longa não é embutida em strings de módulos TypeScript.
- **P7 — Interatividade não vive dentro do conteúdo.** Componentes interativos são código da aplicação, referenciados a partir da apresentação — nunca embutidos no corpo do conteúdo.
- **P8 — Conteúdo é autocontido.** Imagens que pertencem a um conteúdo são versionadas junto dele e referenciadas por **caminhos relativos**, de modo que o conteúdo permaneça íntegro e movível sem depender de convenções de URL da aplicação.
- **P9 — A superfície de entrada é restrita.** **HTML bruto dentro do Markdown não é permitido** nesta fase. O conteúdo se expressa pelo vocabulário do Markdown e pelos plugins habilitados explicitamente.

A fronteira que sustenta P6 e P7 é: **conteúdo é dado, interatividade é código**. É essa separação que permite descartar MDX sem perder capacidade — a interatividade não deixa de existir, ela passa a ter um lugar próprio.

### 2. Três camadas por natureza do conteúdo

1. **Markdown puro para prosa** — artigos, notas de aprendizado, changelog e o corpo editorial de entidades estruturadas. Arquivos `.md` versionados, com frontmatter para metadados. **Sem MDX.**
2. **TypeScript para dados estruturados** — listas de forma fixa e pouca prosa (ex.: Uses, stack de projetos), como módulos declarativos tipados, conforme P5. Validação em runtime não é excluída: pode ser introduzida quando houver necessidade concreta — por exemplo, se algum desses dados passar a vir de fonte externa — sem exigir novo ADR.
3. **Componentes React/TanStack Start isolados para interatividade** — demos, experimentos e comparativos do Playground IA vivem como componentes da aplicação, conforme `architecture.md` §7 (Playground como área isolada) e §2 (separação de responsabilidades).

Os três casos não são alternativas concorrentes: um mesmo conteúdo pode combinar as camadas — metadados estruturados, corpo em Markdown e um componente interativo referenciado pela página que o apresenta.

### 3. Implementação inicial

A implementação abaixo é a escolha inicial para satisfazer P1–P9. Ela é **substituível**: trocar qualquer uma destas peças, mantendo as propriedades, não exige novo ADR.

- **`import.meta.glob`** (Vite) para descoberta dos arquivos de conteúdo em build.
- **`zod`** para os schemas de frontmatter exigidos por P4.
- **`unified`** (remark/rehype) para o processamento de Markdown exigido por P2 e P3, com plugins habilitados explicitamente, incluindo o que impede HTML bruto conforme P9.

Três argumentos sustentam começar por pipeline próprio em vez de biblioteca:

- O pipeline necessário para as propriedades acima é **pequeno** e cabe em código legível dentro do próprio repositório, reforçando o papel de single source of truth definido em `vision.md`.
- Evita **introduzir uma camada de abstração antes de necessidade concreta**, conforme `architecture.md` §11. A necessidade que uma biblioteca de conteúdo resolve — escala, cache, geração — ainda não existe neste volume.
- Construir essa camada faz parte da **evolução deliberada** buscada em `vision.md`. O argumento não é que uma solução mais trabalhosa gere mais evolução, mas que este desafio específico — modelar uma camada de conteúdo tipada, validada e independente da apresentação — é relevante para essa trajetória.

### 4. Fora do escopo desta decisão

- **Otimização e transformação de imagens** (redimensionamento, formatos modernos, responsividade). P8 define apenas onde as imagens vivem e como são referenciadas. A ausência de otimização nativa na stack já é limitação registrada no ADR-0001 e permanece pendente.
- **Estrutura de diretórios do conteúdo** e nomenclatura de arquivos: convenção a registrar em `conventions.md` após o aceite.
- **Estratégia concreta de carregamento** (modo de uso do `import.meta.glob`, carregamento adiantado ou sob demanda, cache): detalhe de implementação, ajustável conforme o volume evoluir.
- **Escolha nominal dos plugins** remark/rehype.
- **Busca e RSS** (Fase 4 do roadmap).

## Consequências

### Prós

- **A decisão sobrevive à troca de ferramenta.** As garantias estão nas propriedades P1–P9, não em `unified` ou `import.meta.glob`. Migrar para uma biblioteca é uma mudança de implementação avaliável contra critérios já escritos.
- **Falhas de conteúdo aparecem em build, não em produção** (P2, P4): frontmatter inválido quebra o build.
- **Runtime menor e previsível** (P3): nenhum parser de Markdown no navegador nem no servidor de requisições, coerente com a estratégia SSG-first do ADR-0001.
- **Conteúdo legível sem build** (P1): arquivos `.md` são lidos diretamente por humanos e agentes de IA, no mesmo formato em que foram escritos.
- **Portabilidade** (P1, P6, P8): Markdown puro, com metadados no frontmatter e imagens relativas ao próprio conteúdo, migra para outra ferramenta sem reescrita de conteúdo. Nenhum acoplamento a formato proprietário.
- **Superfície de entrada restrita** (P9): sem HTML bruto, o conteúdo não carrega marcação acoplada à apresentação nem abre caminho para injeção de markup arbitrário.
- **Formato adequado a cada natureza de conteúdo**: dados estruturados aproveitam diretamente o compilador; prosa não é forçada a caber em estruturas de dados.
- **Interatividade contida** (P7): experimentos vivem como componentes isolados e não comprometem a estabilidade da camada de conteúdo (`architecture.md` §7).

### Contras e riscos

- **O pipeline próprio introduz dependências.** Validação de schema e processamento de Markdown vêm de bibliotecas de terceiros (`zod`, `unified` e cada plugin habilitado), somadas a código de orquestração próprio. A escolha não elimina dependências: ela troca uma dependência integrada por várias de escopo menor, mais o código que as costura.
- **Recursos que uma biblioteca de conteúdo entrega prontos passam a ser responsabilidade do projeto** — geração tipada, cache incremental, observação de arquivos e mensagens de erro de validação. Nada disso é necessário hoje; se e quando for, é trabalho a fazer ou motivo para reavaliar.
- **A estratégia de carregamento é decisão explícita do projeto.** Manter custo de build e tamanho de bundle sob controle conforme o conteúdo cresce exige escolha deliberada de implementação, e é o ponto que tende a degradar primeiro com escala.
- **Risco de virar abstração caseira crescente** — exatamente o que `architecture.md` §11 manda evitar. Os gatilhos de reavaliação abaixo existem para tornar esse risco observável.
- **A seleção de plugins passa a ser superfície de decisão do projeto**, inclusive quanto ao que P9 restringe: garantir a ausência de HTML bruto depende de configuração correta do pipeline, não de uma propriedade automática do Markdown.
- **P8 sem otimização de imagens** significa que imagens entram no repositório no formato em que foram produzidas. Volume e peso do repositório crescem sem controle automático.
- **Rotas dinâmicas de conteúdo continuam exigindo listagem explícita para prerender**, limitação já registrada no ADR-0001. Este ADR não a resolve.
- **Agentes de IA não têm padrão consolidado para inferir um pipeline próprio.** Diferente de uma biblioteca conhecida, a estrutura precisa ser documentada em `conventions.md` para que código gerado siga o padrão real do projeto.
- **P5 e P6 dependem de disciplina, não de ferramenta.** Nada impede tecnicamente que um módulo de dados ganhe lógica ou que prosa longa seja embutida em string; a restrição é mantida por convenção e code review, como já ocorre com a escala de spacing do ADR-0002.

## Gatilhos de reavaliação

Cada gatilho é uma **necessidade ou problema concreto e observável** — não a versão de uma biblioteca. Maturidade de terceiros pode determinar *qual* resposta é viável quando um gatilho dispara, mas não dispara nada sozinha.

1. **Limitação identificada no pipeline próprio**: um requisito editorial que a implementação atual não atenda, ou correções recorrentes na camada de conteúdo consumindo esforço desproporcional ao valor entregue.
2. **Custo de build ou volume de conteúdo medido como problema**: o tempo de build ou o peso do artefato final deixarem de ser aceitáveis à medida que o conteúdo cresce.
3. **Necessidade recorrente de interatividade dentro do corpo do texto**, não atendida pelo modelo de componentes isolados de P7 — reabre especificamente a discussão sobre MDX.
4. **Necessidade concreta de expressar algo fora do vocabulário permitido**, que só se resolva com HTML bruto ou com uma extensão de sintaxe — reabre P9.
5. **Necessidade concreta de otimização ou transformação de imagens** (peso, responsividade, formatos modernos) — hoje fora de escopo; exigiria decisão própria.
6. **Necessidade de conteúdo não versionado**: autoria fora do repositório ou dados gerados por usuários. Remete a `architecture.md` §8 (persistência) e exigiria ADR próprio.

Reavaliação gera **novo ADR**. Este documento não é reescrito para alterar a decisão histórica, conforme `conventions.md` §10.

## Alternativas consideradas

- **Content Collections** (`@content-collections/core` + `@content-collections/vite`) — **principal alternativa**. Satisfaz P1–P4 por construção e entrega, pronto, um conjunto de capacidades que o pipeline próprio não tem: **integração ao build** como plugin do Vite; **definição de coleções com schema** via Standard Schema, compatível com Zod; **geração tipada** dos módulos de conteúdo em diretório dedicado (`.content-collections/generated`, consumido por alias de `tsconfig` e mantido fora do versionamento); **cache incremental**; e **observação de arquivos** durante o desenvolvimento. Tem dois indicadores verificáveis de alinhamento com o ecossistema escolhido no ADR-0001: quickstart oficial para TanStack Start na documentação da própria biblioteca (a partir da v1.121.0, com o adapter Vite) e uso em produção pelo `tanstack.com`, cujo `content-collections.ts` está versionado publicamente no repositório da TanStack — a integração é exercitada pelo próprio ecossistema e tende a acompanhar mudanças do framework. **Não adotada agora** porque as capacidades que a diferenciam respondem a problemas — escala, custo de build, geração — que este volume de conteúdo ainda não apresenta; porque introduz etapa de geração, diretório gerado e alias de `tsconfig` como superfície de configuração adicional; e porque resolveria por dependência exatamente a camada que o projeto tem interesse deliberado em construir. Registra-se ainda que os dois pacotes seguem pré-1.0 (0.15.2 e 0.3.0) — fato relevante para o risco de mudança de API, mas não o motivo da escolha. **Não é descarte definitivo**: é a resposta candidata mais forte caso os gatilhos 1 ou 2 sejam acionados.
- **MDX** — permitiria componentes React dentro do corpo do artigo. Descartado por violar P6 e P7: transformaria conteúdo em código, com perda de portabilidade e de legibilidade fora da aplicação. Permanece na mesa caso o gatilho 3 seja acionado.
- **Prosa em módulos TypeScript ou JSON** — unificaria tudo em uma só camada. Descartado por violar P6: prosa longa em strings perde diffs legíveis, ergonomia de escrita e portabilidade, sem ganho correspondente.
- **Headless CMS** (Contentful, Sanity e similares) — descartado por violar P1 e contrariar o princípio de conteúdo como código (`architecture.md` §2), além de introduzir dependência de serviço externo (§11) e custo operacional sem necessidade concreta.
- **Banco de dados para conteúdo** — descartado por `architecture.md` §8: persistência só entra diante de necessidade concreta, como dados gerados por usuários ou histórico dinâmico. Nenhuma delas existe hoje.
- **Content Collections nativo do Astro** — não aplicável: dependeria de trocar de framework, decisão já fechada no ADR-0001.

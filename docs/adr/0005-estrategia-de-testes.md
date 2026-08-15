# ADR-0005 — Estratégia de Testes

## Status
Aceito

## Contexto

`architecture.md` §12 registra "Estratégia de testes" como decisão pendente, e o ADR-0002 deixou explicitamente pendente a "estratégia de testes de UI". A pendência não é organizacional: **três garantias já aceitas dependem de verificação que não existe.**

- O ADR-0003 registra, entre seus próprios contras, que garantir P9 (ausência de HTML bruto) "depende de configuração correta do pipeline, não de uma propriedade automática do Markdown". Hoje nada verifica essa configuração.
- O ADR-0003 P4 e `conventions.md` §8.2 declaram que schemas rejeitam campos desconhecidos e que conteúdo inválido quebra o build. É um contrato afirmado que nenhum código exercita.
- O ADR-0004 G7.3 admite que o conjunto de verificações automatizadas é "hoje vazio, que pode crescer sem revisar este ADR". Sem uma decisão sobre testes, o conjunto continua vazio por omissão — e um teste que existe mas não integra o critério de merge é, na prática, opcional.

Duas restrições de contexto delimitam o formato desta decisão.

A primeira é que **o projeto não tem código de aplicação no momento desta decisão.** O scaffold do Create Next App está sendo removido e o TanStack Start ainda não foi inicializado. Decidir a estratégia agora atende a "especificação antes do código" (`vision.md`), mas cria um risco simétrico: montar infraestrutura de teste para código que ainda não existe é exatamente a antecipação que `architecture.md` §11 manda evitar. A decisão precisa, portanto, separar **o que se decide agora** do **quando cada peça é instalada**.

A segunda é que **CI/CD e plataforma de deploy seguem pendentes** (`architecture.md` §12). Uma estratégia escrita em termos de ferramentas concretas de execução nasceria dependente de decisões que ainda não foram tomadas. Por isso os critérios são expressos como propriedades, no mesmo molde que o ADR-0003 adotou com P1–P9 e o ADR-0004 com G1–G7.

### O que já é verificado sem teste

Duas decisões aceitas removem uma classe inteira de erros do escopo de teste:

- **Verificação de tipos** (ADR-0001): type-safety ponta a ponta em rotas, loaders e server functions. Divergência de shape é erro de compilação, não de teste.
- **Falha de build** (ADR-0003, P2/P4): frontmatter inválido, campo desconhecido ou schema violado quebram o build, com cobertura de 100% do conteúdo publicável.

Reconhecer isso é o que mantém a suíte proporcional ao projeto: **essas camadas cobrem estrutura e contrato de dados; testes cobrem comportamento.** As duas coisas não competem e não se substituem.

### Perfil de risco do projeto

O Developer OS é, nas Fases 1–2 do roadmap, um site orientado a conteúdo: conteúdo estático e apresentação. A superfície de lógica pura é pequena e concentrada. O que o projeto tem de genuinamente próprio — e portanto de não verificado por terceiros — é o **pipeline de conteúdo construído à mão** pelo ADR-0003, cujos contras já registram o risco de "virar abstração caseira crescente".

Isso desloca o alvo: o risco dominante não é lógica de negócio incorreta, é **costura entre etapas do pipeline e configuração de plugins**.

### Desenvolvimento assistido por agentes

O ADR-0004 §2 já identificou que, neste projeto, **o recurso escasso é a capacidade de revisão humana, não a de escrita**. Testes são o único mecanismo que escala verificação sem consumir capacidade de revisão.

O mesmo contexto introduz um risco próprio, que esta decisão precisa endereçar em vez de ignorar: **um agente que escreve o código e o teste tende a produzir um teste que passa pelo motivo errado** — que asserta o comportamento que ele produziu, e não o comportamento pretendido. Uma suíte verde então *reduz* o escrutínio humano, reintroduzindo por outra porta o risco de "terceirização da leitura" que o ADR-0004 já nomeou para o agente revisor.

### Levantamento técnico (ago/2026)

- `vitest` 4.1.10, com `@vitest/browser` e `@vitest/coverage-v8` publicados na mesma linha e no mesmo release — Browser Mode acompanha o trem de release do core.
- `@testing-library/react` 16.3.2 (jan/2026) e `@testing-library/user-event` 14.6.4. Cadência baixa indica API estável, em contraste com o risco de "APIs em movimento" assumido no ADR-0002.
- `@playwright/test` 1.62.1.
- `jsdom` 30.0.1; `happy-dom` 20.11.2 como alternativa de ambiente.

## Decisão

Adotar uma estratégia de testes definida por **propriedades duráveis**, com distribuição em pirâmide tratada como **ordenação de custo e quantidade, não como cota**, e com **ferramentas decididas agora e instaladas sob demanda**.

### 1. Propriedades duráveis

Estas propriedades são a decisão. Qualquer implementação — atual ou futura — precisa satisfazê-las, e é por elas que uma alternativa deve ser avaliada.

#### Régua e valor

- **T1 — A verificação acontece em camadas complementares.** Tipagem e build são as primeiras garantias e cobrem estrutura e contrato de dados. Testes cobrem os riscos comportamentais que essas camadas não conseguem expressar. As camadas não se substituem e não se hierarquizam por importância; o que a decisão evita é **duplicar em teste aquilo que o build já falha**.

- **T2 — Propriedade arquitetural que tenha forma executável é expressa como teste, não como convenção.** Hoje isso alcança concretamente **P9** (HTML bruto desabilitado) e o contrato de rejeição dos schemas (**P4**). Propriedade sem forma executável — P5, P6, escala de spacing — permanece mantida por convenção e code review, conforme o precedente explícito de ADR-0002 e ADR-0003.

#### Obrigatoriedade

- **T3 — A obrigatoriedade de teste é definida por área e natureza do código, nunca por percentual de cobertura.**

  **Obrigatório:**
  1. `src/content/pipeline/` — a camada que o ADR-0003 escolheu construir à mão, assumindo por escrito o risco correspondente;
  2. `src/content/schemas/` — o contrato de metadados, não a biblioteca de validação;
  3. a camada de mapeamento de `src/integrations/` — payload externo para tipo do domínio;
  4. lógica com ramificação não-óbvia — ordenação, filtro, borda de data.

  **Não obrigatório, explicitamente:** componente de apresentação sem comportamento próprio; entradas de conteúdo em `src/content/entries/`; tipos e configuração; wrapper fino sobre biblioteca.

  A distribuição resultante entre unitários, integração e E2E é **consequência destes critérios, não alvo a perseguir**. Nenhuma proporção é fixada.

- **T4 — Toda correção de defeito entra acompanhada de teste que falha antes da correção.** O teste descreve o defeito observado, não a implementação escolhida para corrigi-lo.

- **T5 — Alterar uma assertion existente é alterar um contrato** e exige justificativa registrada no PR. Um teste ajustado para passar é indistinguível, no diff, de um teste corrigido — e é o sinal mais barato de detectar de que o código contornou a verificação em vez de satisfazê-la.

#### Limites e determinismo

- **T6 — A suíte é determinística e roda sem rede.** Nenhum teste depende de serviço externo, de relógio real ou de ordem de execução. **Nenhum teste asserta sobre a saída de um modelo generativo**: o que se verifica é o adaptador da integração, a partir de fixtures.

- **T7 — Teste não verifica dependência nem framework.** Zod, Base UI, TanStack Router e o próprio Vite são testados upstream. O que se testa é o contrato que **este projeto** declara sobre eles.

- **T8 — Teste de componente verifica comportamento, não conformidade visual.** Ambiente DOM simulado não avalia cascata de CSS, layout nem tokens de tema. Conformidade com o `design-system.md` permanece garantida por convenção e code review (ADR-0002), e esta estratégia **não** a cobre. A propriedade existe para impedir que a suíte produza confiança que ela não sustenta.

- **T9 — E2E cobre apenas o que somente o navegador real revela** — hidratação, persistência entre recarregamentos, navegação client-side. O que o build já garante não vira E2E.

#### Tamanho e execução

- **T10 — Infraestrutura de teste entra sob demanda.** Nenhuma camada é instalada antes de existir código que a torne obrigatória por T3, e nenhuma abstração de teste é criada antes de uso real repetido (`conventions.md` §7). Quando o alvo é a camada de conteúdo, **fixtures em disco são preferidas a mocks**: são mais legíveis, mais próximas do dado real e mais interpretáveis por agentes de IA.

- **T11 — A suíte é executável por um comando único e sua execução integra os critérios de merge de G7.3**, conforme a verificação automatizada se torne disponível. Teste que existe mas não faz parte do critério de merge é, na prática, opcional — e uma garantia opcional não é garantia.

### 2. Onde cada tipo de código é verificado

| Camada | Alvo |
|---|---|
| Tipagem e build | Shape de loaders e rotas; contrato de frontmatter; existência e validade do conteúdo publicável |
| Unitário | Processamento de Markdown; configuração de plugins (P9); contrato dos schemas (P4); helpers puros de `src/lib/`; mapeamento de integrações |
| Integração | Pipeline completo sobre fixtures, incluindo casos negativos; conformidade do conteúdo real (slugs únicos, caminhos relativos de imagem, links internos); comportamento de loaders; server functions com adaptador de IA mockado |
| Componente | Apenas comportamento próprio do projeto — alternância de tema com persistência, busca, demos do Playground |
| E2E | Poucos fluxos: renderização de artigo no navegador real, navegação client-side, persistência de tema entre recarregamentos, 404 |

### 3. Implementação inicial

A implementação abaixo é a escolha inicial para satisfazer T1–T11. Ela é **substituível**: trocar qualquer peça, mantendo as propriedades, não exige novo ADR.

| Camada | Ferramenta | Instalada quando |
|---|---|---|
| Unitário e integração | **Vitest** (linha 4.1.x) | com o primeiro código de `src/content/pipeline/` |
| Componente | **React Testing Library** (16.3.x) + **user-event** (14.6.x), ambiente **jsdom** (30.x) | com o primeiro componente de comportamento próprio |
| E2E | **Playwright** (1.62.x) | quando surgir o primeiro fluxo E2E obrigatório, idealmente junto da estruturação de CI/CD |

O argumento para Vitest não é qualidade comparada, é **grafo de módulos único**: mesma configuração do Vite, mesmos plugins, mesmo resolver e mesmos aliases que a aplicação. Um runner externo exigiria manter um segundo pipeline de transformação reproduzindo o comportamento do Vite, com divergência permanente entre o que passa no teste e o que entra no build.

Convenções operacionais — localização dos arquivos, nomenclatura, fixtures e ambiente por arquivo — ficam em `conventions.md` §12 e podem mudar sem revisar esta decisão.

### 4. Fora do escopo desta decisão

- **Regressão visual por screenshot.** Cobriria a lacuna declarada em T8, mas com custo e instabilidade desproporcionais ao estágio atual.
- **Acessibilidade automatizada** (axe e equivalentes). Base UI já entrega a base de acessibilidade dos primitivos (ADR-0002).
- **Teste de performance** e orçamento de bundle.
- **Lint da escala de spacing** (ADR-0002) e demais regras de estilo. **Lint não é teste**; pertence ao ADR de CI/CD.
- **Threshold de cobertura**, global ou por diretório.
- **Configuração concreta de CI** e o conjunto de verificações que compõem G7.3.
- **Regime de verificação do Playground IA** (Fase 3) além do que T6 já determina.

## Consequências

### Prós

- **Converte em verificação executável duas garantias que hoje são apenas declaradas.** T2 alcança P9 e o contrato de rejeição dos schemas — precisamente os pontos que o ADR-0003 registrou como dependentes de configuração correta e não de propriedade automática.
- **Fecha a lacuna de G7.3 sem antecipar o ADR de CI/CD.** T11 amarra a execução ao critério de merge de forma neutra quanto a ferramenta.
- **Ataca o risco assumido do pipeline próprio.** O ADR-0003 aceitou o risco de "abstração caseira crescente"; T3.1 torna esse risco observável a cada mudança.
- **Impede que a suíte cresça além do projeto.** T1 evita duplicar o que o build já falha, T7 evita testar dependências, T10 evita infraestrutura antecipada e T3 recusa cobertura por percentual — a métrica mais facilmente satisfeita sem valor, especialmente por agentes.
- **Endereça o risco específico de código gerado por agentes.** T4 e T5 dão forma verificável no diff a um risco que nenhuma configuração elimina.
- **Não gera confiança falsa.** T8 declara explicitamente o que a suíte não cobre, em vez de deixar a lacuna implícita.
- **Testes funcionam como critério de aceite legível por máquina**, complementando a Issue exigida por G4.
- **Decisão tomada antes do código, sem infraestrutura antes do código.** T10 separa o que se decide do quando se instala, atendendo "especificação antes do código" sem violar `architecture.md` §11.

### Contras e riscos

- **Obrigatoriedade por área depende de julgamento nas bordas.** "Lógica com ramificação não-óbvia" (T3.4) e "componente com comportamento próprio" são zonas cinzentas reais, resolvidas em review — a mesma fragilidade já aceita em ADR-0002 e ADR-0003.
- **T4 e T5 não são verificáveis automaticamente.** Que um teste tenha falhado antes da correção, e que uma assertion alterada tenha justificativa, são fatos que só a leitura do diff estabelece. São propriedades de comportamento, não de ferramenta.
- **Um agente pode satisfazer T3 com testes de baixo valor** — que executam o código sem assertar comportamento significativo. A obrigatoriedade por área reduz o incentivo em relação a um threshold, mas não o elimina.
- **T8 deixa descoberta a classe de defeito mais provável das Fases 1–2.** Tematização e conformidade com o design system continuam garantidas apenas por review, e o roadmap prevê Dark Mode na Fase 4.
- **Adiar Playwright significa operar sem verificação de hidratação** até o primeiro fluxo E2E obrigatório. É risco aceito conscientemente: até lá o site é predominantemente estático.
- **A suíte adiciona superfície de código a revisar.** Teste é código do projeto e entra no mesmo regime de leitura, aumentando o consumo do recurso que o ADR-0004 identificou como escasso.
- **Vitest tem menos material de treino que alternativas mais antigas**, agravando o risco de escassez de dados já assumido no ADR-0001: agentes tendem a gerar configuração e APIs de Jest. Mitigação em `conventions.md` §9, no mesmo molde de "não assumir Radix" e "não assumir Tailwind v3".
- **A suíte fica acoplada ao Vite.** Coerente com o ADR-0001, mas real: sair do Vite implicaria migrar a suíte junto.
- **T11 é uma promessa parcial enquanto não houver CI.** Até lá, a execução da suíte depende de disciplina local, não de mecanismo.

## Gatilhos de reavaliação

Cada gatilho é uma necessidade ou problema concreto e observável.

1. **Limitação do ambiente DOM simulado vira problema concreto** — comportamento que só se verifica com CSS real ou APIs de navegador ausentes no jsdom. Reabre **Browser Mode** (`@vitest/browser`), hoje publicado na mesma linha do core.
2. **Defeitos visuais ou de tematização escapando repetidamente para produção** — reabre regressão visual, hoje fora de escopo por T8.
3. **Tempo de execução da suíte deixa de ser aceitável** — reabre escolha de ambiente (happy-dom) e estratégia de paralelização.
4. **T5 disparando com frequência** — assertions sendo alteradas com regularidade indica que a obrigatoriedade de T3 está no lugar errado, ou que os testes descrevem implementação em vez de comportamento.
5. **Testes obrigatórios sendo contornados** — código em área de T3 entrando sem teste, ou testes escritos apenas para satisfazer a regra. Sinal de que a cerimônia excede o valor entregue.
6. **Playground IA exigir regime próprio de verificação** que T6 não atenda — exigiria decisão própria.
7. **Deixar de haver um único mantenedor** — muda as premissas sobre capacidade de revisão que sustentam T4 e T5.

Reavaliação gera **novo ADR**. Este documento não é reescrito para alterar a decisão histórica, conforme `conventions.md` §10.

## Alternativas consideradas

- **Distribuição em pirâmide como cota** (ex.: 70/20/10) — descartada porque a superfície unit-testável nas Fases 1–2 é genuinamente pequena, e uma cota induziria a inventar testes unitários para componentes de apresentação apenas para satisfazer a proporção. É também o tipo de número que um agente otimiza literalmente e sem valor. A pirâmide permanece como **direção** — unitários mais baratos e mais numerosos, E2E mais raros e mais caros —, com a proporção sendo resultado de T3.
- **Threshold global de cobertura** — descartado por ser a métrica mais facilmente satisfeita sem valor correspondente, especialmente por código gerado. Obrigatoriedade por área (T3) é mais legível, mais defensável em review e mais difícil de satisfazer artificialmente. Um threshold restrito a `src/content/pipeline/` permanece disponível caso o gatilho 5 seja acionado.
- **Jest** — ecossistema maior e mais material de treino, o que atenuaria o risco registrado nos contras. Descartado porque exigiria manter um pipeline de transformação paralelo ao do Vite, reproduzindo resolver, aliases e plugins da stack definida no ADR-0001. O custo é permanente e a divergência resultante — passar no teste e quebrar no build — é exatamente o tipo de falha que a suíte deveria prevenir.
- **Vitest Browser Mode em vez de jsdom, desde o início** — resolveria a limitação declarada em T8 com navegador real. Descartado agora porque o escopo de teste de componente definido em T3 é pequeno, e o custo de setup e execução não se justifica nesse volume. É a **resposta candidata mais forte** caso o gatilho 1 seja acionado.
- **happy-dom em vez de jsdom** — mais rápido, com cadência de release mais alta. Descartado nesta fase por ser menos completo em relação à especificação; a diferença de velocidade não é problema observável no volume atual. Permanece disponível pelo gatilho 3.
- **Não adotar E2E** e substituí-lo por verificação de prerender sobre o artefato de build — coerente com a estratégia SSG-first e mais barato. Descartada porque não cobre hidratação nem persistência de estado entre recarregamentos, que são justamente os riscos de T9. A verificação de prerender continua desejável, mas como verificação de build (G7.3), não como substituto de E2E.
- **Instalar as três camadas junto com o scaffold do TanStack Start** — daria a infraestrutura pronta de uma vez. Descartada por violar `architecture.md` §11: montar Playwright sem site, sem CI e sem plataforma de deploy é infraestrutura para necessidade hipotética. T10 mantém a decisão tomada e o custo diferido.
- **Manter as verificações de P9 e P4 como convenção e review**, seguindo o precedente de ADR-0002 e ADR-0003 — seria a opção mais consistente com o histórico. Descartada porque esses dois casos têm forma executável trivial, e o precedente daqueles ADRs se aplica a regras que **nenhuma verificação captura** (escala de spacing, P5, P6). Manter por disciplina algo que um teste verifica em poucas linhas seria aceitar risco sem contrapartida.
- **Registrar as ferramentas como parte da decisão** — descartada por acoplar a garantia a produtos específicos. As propriedades T1–T11 são a decisão; Vitest, RTL e Playwright são implementação inicial, substituível sem revisar este ADR, no mesmo corte que o ADR-0003 aplicou entre P1–P9 e sua implementação.

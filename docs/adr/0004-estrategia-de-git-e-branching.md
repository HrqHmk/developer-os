# ADR-0004 — Estratégia de Git e Branching

## Status
Aceito

## Contexto

`architecture.md` §12 registra "Estratégia de Git / Branching" como decisão pendente. A pendência não é organizacional: **três documentos aceitos já dependem desta decisão sem que ela exista.**

- `CLAUDE.md` §Git instrui "Follow the Git workflow documented by the project". Esse documento nunca foi escrito — a referência aponta para o vazio.
- O ADR-0002 exige que "todo diff gerado pelo CLI deve ser revisado antes de ser aceito" e mantém a escala de spacing "por convenção e code review", sem enforcement automatizado.
- O ADR-0003 registra que "P5 e P6 dependem de disciplina, não de ferramenta; a restrição é mantida por convenção e code review".

Ou seja: **code review é o mecanismo de garantia de dois ADRs aceitos, mas nenhum documento define onde, quando e por quem esse review acontece.** Enquanto isso permanecer implícito, as garantias desses ADRs são declaradas e não praticadas.

A decisão precisa atender aos princípios e restrições já documentados:

- **Especificação antes do código** (`vision.md`): o problema, o contexto e os limites são definidos antes da implementação. Isso exige um artefato de especificação anterior ao código, hoje inexistente.
- **Validação humana / human-in-the-loop** (`vision.md`, `CLAUDE.md`): a IA acelera a escrita; o engenheiro valida arquitetura e qualidade. O `CLAUDE.md` define o *comportamento* esperado do agente diante de uma decisão não documentada, mas não define *onde* essa escalada acontece.
- **Construir em público** (`vision.md`): a evolução real do projeto é entregável, não subproduto. O histórico é parte do que o projeto demonstra.
- **AI-friendly** (`architecture.md` §2): manter arquivos de contexto objetivos, "evitando informações redundantes que consumam desnecessariamente a janela de contexto dos agentes".
- **Previews por alteração e possibilidade de rollback** (`architecture.md` §9): objetivos de infraestrutura que pressupõem uma unidade de mudança identificável.
- **Sem abstrações prematuras** (`architecture.md` §11) e o precedente, firmado nos ADR-0002 e ADR-0003, de manter regras por convenção e review em vez de introduzir ferramenta de enforcement nesta fase.

Duas restrições de contexto delimitam o formato desta decisão.

A primeira é que o projeto tem **um único mantenedor**, com desenvolvimento majoritariamente assistido por agentes de IA. Isso descarta de saída os modelos de branching desenhados para coordenar equipes e janelas de release, e desloca o problema real: não é sincronizar pessoas, é **manter uma fronteira confiável entre o que um agente produz e o que entra no registro permanente do projeto.**

A segunda é que **CI/CD e plataforma de deploy seguem pendentes** (`architecture.md` §12). Uma decisão escrita em termos de ferramentas concretas de verificação nasceria dependente de decisões que ainda não foram tomadas. Por isso os critérios de merge são expressos como propriedades, no mesmo molde que o ADR-0003 adotou com P1–P9.

## Decisão

Adotar um fluxo **próximo do GitHub Flow, com a Issue como unidade de trabalho**: `main` única e sempre publicável, trabalho em branches dedicadas de vida curta e integração exclusivamente por Pull Request com validação humana.

### 1. Propriedades duráveis do fluxo

Estas propriedades são a decisão. Qualquer mecânica — atual ou futura — precisa satisfazê-las, e é por elas que uma alternativa deve ser avaliada.

- **G1 — `main` é a única branch durável e permanece sempre publicável.** Não existem `develop`, branches de release ou branches de longa duração. Branches de trabalho são temporárias e removidas após a integração.
- **G2 — Nenhuma mudança entra em `main` fora de um Pull Request.** Não há commit direto em `main`, inclusive para documentação e conteúdo editorial. O PR é a unidade de integração e o ponto onde a mudança fica observável antes de se tornar permanente.
- **G3 — Toda mudança é validada por um humano antes do merge.** A leitura do diff é o momento de human-in-the-loop; a profundidade da leitura é proporcional ao raio de impacto da mudança.

  Verificação automatizada e revisão feita por agente de IA são **insumo à validação humana, nunca substituto dela**: produzem apontamentos, não aprovação. Aceitar ou rejeitar um apontamento, e decidir o merge, é sempre do engenheiro. Esta propriedade é **neutra quanto a ferramenta** — nenhum agente, serviço ou verificação específica faz parte da decisão, e trocá-los não a altera.

- **G4 — Trabalho não-trivial nasce de uma Issue.** A Issue é a especificação exigida pelo `vision.md` — problema, contexto, limites e critérios de aceite — e o registro primário de intenção. É também o local onde um agente escala uma decisão arquitetural não documentada, conforme o `CLAUDE.md` §Human-in-the-loop. Mudança mecânica dispensa Issue, com a justificativa no próprio PR.
- **G5 — Contexto de execução vive em Issue e PR; contexto durável é promovido a documentação.** O critério é temporal, não de tamanho: se o contexto será necessário para uma **decisão futura**, ele vira ADR ou entra em `conventions.md`; se explica apenas **aquela mudança**, permanece na Issue e no PR.
- **G6 — Agentes de IA propõem, não integram.** Podem criar branch, commitar, dar push na própria branch, abrir PR e comentar em Issues e PRs. Não podem: commitar ou dar push em `main`, executar merge, force-push em branch compartilhada, deletar branches ou tags, alterar ADR aceito, nem alterar a proteção de `main`. Diante de decisão arquitetural não documentada, param e escalam na Issue em vez de decidir.

  Vale igualmente para agente em **papel de revisão**: o parecer entra no PR como insumo e não aprova, não bloqueia e não integra nada por si.

- **G7 — Os critérios de merge são propriedades, não ferramentas.** Uma mudança pode ser integrada quando:
  1. está vinculada a uma Issue, ou tem sua justificativa registrada no PR (G4);
  2. o diff foi lido por um humano (G3);
  3. as verificações automatizadas **disponíveis no momento** passaram — conjunto hoje vazio, que pode crescer sem revisar este ADR;
  4. não contradiz ADR aceito, `conventions.md` ou `design-system.md`. Se contradiz, a decisão vem primeiro, conforme `conventions.md` §10;
  5. a documentação afetada foi atualizada no mesmo PR, conforme `CLAUDE.md` §Documentation.

### 2. Ciclo de trabalho

```text
Issue  (especificação: problema, contexto, limites, critérios de aceite)
  └─ branch dedicada, criada a partir de main atualizada
       └─ commits atômicos
            └─ Pull Request vinculado à Issue
                 ├─ verificações automatizadas   (quando existirem)
                 ├─ preview da alteração         (quando existir)
                 ├─ revisão por agente auxiliar  (quando a mudança justificar)
                 └─ leitura do diff pelo engenheiro   ← ponto de validação (G3)
                      └─ merge em main → branch removida → Issue fechada
```

O escopo de cada ciclo é limitado por **quanto diff um humano consegue revisar de fato** — não pela capacidade de produção do agente. Em desenvolvimento assistido por IA, essa é a restrição operativa real: a capacidade de revisão, e não a de escrita, é o recurso escasso.

### 3. Onde cada regra é registrada

As propriedades G1–G7 ficam neste ADR. A mecânica que as realiza — nomenclatura de branches, formato de mensagem de commit, método de merge, templates, critério de trivialidade e papéis dos agentes — fica em `conventions.md` §11, e pode mudar sem revisar esta decisão, desde que as propriedades continuem satisfeitas.

O corte é o mesmo que o ADR-0003 aplicou entre P1–P9 e `conventions.md` §8.

### 4. Fora do escopo desta decisão

- **Configuração concreta de CI** e o conjunto de verificações automatizadas: G7.3 admite conjunto vazio e crescimento posterior. Decisão do ADR de CI/CD, pendente.
- **Plataforma de deploy e previews por alteração**: o fluxo os habilita, mas não os decide. Pendente em `architecture.md` §12.
- **Versionamento, releases e tags**: não há releases versionadas hoje; introduzi-las exigiria decisão própria.
- **Geração automatizada de changelog**: a convenção de commits mantém a opção aberta, mas não a decide. O Changelog previsto na Fase 2 do roadmap permanece conteúdo editorial (ADR-0003) até que se decida o contrário.
- **Enforcement automatizado** de mensagens de commit, nomes de branch ou tamanho de PR.
- **Quais agentes ou ferramentas concretas participam da implementação e da revisão.** É convenção operacional, registrada em `conventions.md` §11 e substituível sem revisar este ADR.

## Consequências

### Prós

- **Fecha uma lacuna de garantia, não apenas de processo.** ADR-0002 e ADR-0003 delegam a code review a integridade de regras que nenhuma ferramenta verifica; G2 e G3 dão a esse review um lugar obrigatório no caminho até `main`.
- **Resolve a referência pendente do `CLAUDE.md`** ao "Git workflow documented by the project", que até aqui apontava para um documento inexistente.
- **Materializa "especificação antes do código"** (`vision.md`) em um artefato verificável — a Issue — em vez de intenção declarada.
- **Dá endereço ao human-in-the-loop.** O `CLAUDE.md` já mandava o agente parar e escalar diante de decisão não documentada; G4 define onde essa escalada acontece e onde ela fica registrada.
- **Cria uma camada de contexto sob demanda** (G5). Issues e PRs não consomem janela de contexto até que um agente os busque deliberadamente, ao contrário de tudo que vive em `CLAUDE.md` e é carregado sempre. É a aplicação direta da diretriz de `architecture.md` §2 sobre não inflar arquivos de contexto.
- **Habilita previews por alteração e rollback** (`architecture.md` §9) sem antecipar a decisão de plataforma: o PR é a unidade de mudança que ambos pressupõem.
- **Sobrevive às decisões pendentes.** Critérios escritos como propriedades (G7) absorvem CI, deploy e novas verificações sem revisão do ADR.
- **O histórico vira entregável.** Coerente com "construir em público" (`vision.md`), o caminho de cada mudança — da especificação à integração — fica publicamente auditável.
- **Revisão por agente auxiliar ataca exatamente a fragilidade assumida** em ADR-0002 e ADR-0003 — regras mantidas só por disciplina — sem introduzir a ferramenta de enforcement que ambos decidiram, deliberadamente, não adotar nesta fase.

### Contras e riscos

- **Pull Request de mantenedor único não é peer review.** O GitHub não permite que o autor aprove o próprio PR, de modo que exigir aprovações formais bloquearia o único mantenedor. A proteção viável exige PR e verificações, não aprovação. A revisão continua sendo **disciplina, não garantia técnica** — a mesma fragilidade já aceita conscientemente em ADR-0002 e ADR-0003.
- **Acoplamento à plataforma.** Issues e PRs não são versionados no repositório, o que tensiona o princípio de conteúdo como código (`architecture.md` §2) e contraria o espírito de P1 do ADR-0003. Aceitável por não serem conteúdo publicável, mas real: migrar de plataforma perderia essa camada de contexto.
- **A granularidade intermediária dos commits sobrevive apenas no PR** — ou seja, na plataforma, não no repositório. É consequência direta do método de merge adotado em `conventions.md` §11.
- **Cerimônia sobre um único mantenedor.** Issue, branch e PR para mudanças pequenas é atrito real. Convenção contornada com frequência corrói as demais, e G4 mitiga isso apenas parcialmente ao dispensar Issue em mudanças mecânicas — o critério de trivialidade é ele próprio uma zona cinzenta.
- **Convenções de commit e branch sem enforcement dependem de disciplina.** Um agente pode gerar mensagens fora do padrão e nada quebra.
- **Fluxo assistido por agentes multiplica branches e PRs abertos.** Sem limite de trabalho em progresso, `main` acumula divergência e o custo de integração cresce.
- **Revisão por segundo agente cria risco de terceirização da leitura.** Um parecer limpo tende a induzir aprovação sem leitura própria — exatamente o oposto do que G3 exige. É risco de comportamento, não de ferramenta, e nenhuma configuração o elimina.
- **Revisão auxiliar adiciona custo, latência e falsos positivos** ao ciclo. É por isso que ela é acionada por critério, e não por padrão em todo PR.
- **G5 depende de julgamento.** Distinguir contexto durável de contexto de execução no momento em que se escreve é difícil; o erro típico é deixar em Issue algo que uma decisão futura precisaria — perdendo-o de vista — ou promover ruído a documentação.

## Gatilhos de reavaliação

Cada gatilho é uma necessidade ou problema concreto e observável.

1. **Deixa de haver um único mantenedor**, ou passa a existir revisão por terceiros — muda as premissas de G3 e torna aprovação formal viável.
2. **O fluxo passa a ser contornado com frequência**: mudanças entrando fora do PR, ou Issues criadas depois da implementação para cumprir formalidade. Sinal de que a cerimônia excede o valor entregue.
3. **Necessidade de releases versionadas ou de janela de estabilização** — reabre a discussão sobre branches adicionais, hoje descartadas.
4. **Contexto relevante começa a se perder** por viver apenas em Issue/PR, ou `CLAUDE.md` volta a crescer — indica que a fronteira de G5 está no lugar errado.
5. **Drift recorrente em convenções de commit ou branch** que a revisão não esteja capturando — reabre a decisão de não usar enforcement automatizado.
6. **Dependência da plataforma se torna problema concreto** (migração, indisponibilidade, custo) — exigiria decidir como preservar a camada de contexto hoje fora do repositório.

Reavaliação gera **novo ADR**. Este documento não é reescrito para alterar a decisão histórica, conforme `conventions.md` §10.

## Alternativas consideradas

- **Commit direto em `main` (trunk sem branches)** — custo de cerimônia zero, e prática comum e defensável em projetos de um único mantenedor. Descartada por três motivos concretos, não por preferência estética: contraria explicitamente o `CLAUDE.md` §Git; elimina o ponto de validação humana do qual ADR-0002 e ADR-0003 dependem para garantias já aceitas; e destrói o registro público do método, que o `vision.md` define como entregável do projeto. Sem PR, também não há unidade de mudança para preview nem rollback (`architecture.md` §9).
- **GitHub Flow sem Issues** (branch + PR, com o PR como único registro) — atende G1, G2, G3 e G7 e é mais leve. Descartada como padrão porque deixa "especificação antes do código" (`vision.md`) sem artefato: o PR é criado *depois* da implementação e registra o resultado, não o contrato prévio. Também não oferece local natural para um agente escalar decisão antes de produzir código. Permanece o comportamento aplicável a mudanças mecânicas, conforme G4.
- **Git Flow (`develop` + branches de release)** — descartada por ausência de necessidade concreta: não há releases versionadas, múltiplos mantenedores nem janela de estabilização. Introduziria exatamente a complexidade que `architecture.md` §11 manda evitar, e uma segunda branch durável contradiz G1 sem benefício correspondente.
- **Release Flow / branches empilhadas** — descartada pelo mesmo motivo, agravado por exigir disciplina de rebase que um fluxo majoritariamente assistido por agentes tende a degradar.
- **PR com aprovação formal obrigatória** — seria a leitura literal de "revisado antes de ser aceito" do ADR-0002. **Tecnicamente inviável** com um único mantenedor: o GitHub não permite auto-aprovação, e a regra bloquearia todo merge. G3 preserva a intenção — leitura humana obrigatória — sem depender de um mecanismo que a configuração não pode sustentar.
- **Enforcement automatizado do fluxo** (hooks de commit, lint de nome de branch, limite de tamanho de PR) — descartada nesta fase por coerência com o precedente explícito de ADR-0002 e ADR-0003, que mantiveram regras equivalentes por convenção e review. Permanece disponível caso o gatilho 5 seja acionado.
- **Registrar os papéis dos agentes neste ADR** — descartada por acoplar uma garantia arquitetural a ferramentas específicas. A garantia é a validação humana (G3); quais agentes implementam e quais revisam é convenção operacional, e trocá-los não deve exigir revisão de ADR.

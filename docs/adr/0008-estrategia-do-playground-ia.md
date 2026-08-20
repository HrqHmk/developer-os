# ADR-0008 — Estratégia do Playground IA

## Status
Proposto

## Contexto

`architecture.md` §12 registra "Estratégia para Playground IA" como decisão pendente, e §7 contém apenas um parágrafo genérico: área isolada, experimentos que não comprometem a aplicação principal, arquitetura própria quando necessário. A tese está escrita; as garantias que a tornam segura não estão.

Ao mesmo tempo, o roadmap acabou de mover o Playground da Fase 3 para a **Fase 6**, tornando-o a última grande capacidade funcional planejada. O princípio registrado lá é explícito: **o lançamento inicial do Developer OS não depende do Playground IA.**

Decidir agora é, portanto, deliberado — não urgente. E a escolha precisa se justificar contra a própria disciplina do projeto, já que `architecture.md` §11 proíbe infraestrutura para necessidade hipotética.

### Por que decidir agora, e o que enfraqueceu esse argumento

O Playground é a única superfície planejada que reuniria, ao mesmo tempo, quatro fatos que nenhuma outra parte do roadmap reúne: **execução server-side, segredo, consumo de recurso pago por requisição e entrada arbitrária do público.** Nenhum documento aceito governa o que essas quatro coisas juntas exigem.

A formulação original do argumento era que quatro gatilhos de ADRs aceitos disparariam **simultaneamente**, no pior momento possível — quando existe pressão para publicar uma demonstração. O resequenciamento enfraqueceu boa parte disso, e o documento registra a perda em vez de escondê-la: com Newsletter na Fase 4 e integrações na Fase 5, **três desses gatilhos provavelmente serão quitados antes**, um de cada vez, por outras áreas.

O que sobra é o que de fato justifica este ADR: **teto de custo variável em superfície pública, entrada livre, aposentadoria de experiência e a regra anti-plataforma continuam sem dono em documento algum.** Esses quatro não são quitados por Newsletter nem por integrações, e são precisamente os que se decidem mal sob pressão.

A manobra é a mesma que o ADR-0005 aplicou ao Playwright (T10), o ADR-0007 ao analytics (A9) e o ADR-0006 à segmentação de segredos (§3): **decidir agora, construir quando o gatilho ocorrer.** Ela está registrada aqui como PG10.

### Intenção de produto, fixada com o engenheiro antes da redação

O Playground **não é**: um clone de ChatGPT; uma caixa genérica onde o visitante escolhe um modelo e envia qualquer prompt; uma plataforma pública de prototipação de LLMs; um equivalente reduzido de console de fornecedor.

O Playground **é**: uma área interativa do portfólio contendo pequenas experiências, cada uma demonstrando uma **capacidade, técnica ou decisão concreta de AI Engineering**. O valor não está em provar que sabemos chamar uma API de modelo — está em demonstrar engenharia.

Inicialmente, experiências diferentes podem ter implementações inteiramente diferentes. Isso é a decisão, não uma etapa transitória: infraestrutura comum só surge diante de repetição real.

### Recorte de escopo

Este ADR governa **o Playground IA do Developer OS**, e não "capacidade pública de IA" como categoria. A generalização foi considerada e recusada em §6: governaria superfícies que não existem e presumiria que outras superfícies de IA surgirão. Se surgirem, são decisão delas.

O Playground tem potencial real de crescer. **Potencial de evolução não é justificativa para arquitetar uma plataforma antecipadamente.** Se ele crescer além da definição acima, isso é gatilho de reavaliação — não licença para antecipar.

### Restrições herdadas de decisões aceitas

Estas não são reabertas; delimitam o espaço.

- **ADR-0001** — TanStack Start; server functions são o mecanismo nativo e streaming é capacidade disponível, não requisito. A arquitetura híbrida (aplicação separada para o Playground) foi descartada *"sem necessidade concreta neste momento"* — condicionada, não fechada.
- **ADR-0003 P7** — *interatividade não vive dentro do conteúdo*. Uma experiência **não pode ser embutida em um artigo**: a metade interativa é código da aplicação, referenciada a partir da apresentação. P1 e P6 governam a metade editorial. A separação de que PG5 e PG8 dependem é restrição herdada, não invenção desta decisão.
- **ADR-0004** — G2 roteia toda mudança por Pull Request; G4 e G5 tornam a Issue o lugar onde o contexto de uma experiência é registrado.
- **ADR-0005** — T3 item 3 torna **obrigatório** testar camada de mapeamento em `src/integrations/`; T6 proíbe assertar sobre saída de modelo generativo e exige suíte sem rede; o gatilho 6 já reserva o caso de o Playground exigir regime próprio de verificação.
- **ADR-0006** — D6 (acoplamento à plataforma fora de `src/`), D7 (execução server-side é capacidade, não premissa), D8 (diante do limite, parar de servir, nunca faturar em aberto — a redação **nomeia "laço em experimento de IA"**), D9 (segredos segmentados por ambiente, **pré-condição** antes do primeiro segredo, hoje não satisfeita por padrão). §4 registra que `workerd` restringe dependências server-side *"justamente na área — integrações de IA"* e que a atração pelos primitivos da própria plataforma, **Workers AI incluído**, é o vetor concreto de erosão de D6.
- **ADR-0007** — A2 (somente agregado, nenhum indivíduo reconstruível a partir do armazenado), A3 (medir não invoca o runtime servidor), A6 (sem cobrança automática **nem upgrade automático**), gatilho 1 reserva eventos com propriedades para o Playground.
- **`architecture.md`** — §3 privilegia aplicação única; §8 mantém persistência deliberadamente em aberto; §11 proíbe abstrações prematuras, dependência excessiva de serviços externos e **"funcionalidades de IA sem valor claro"**.

### Ausência deliberada de levantamento técnico

Os ADRs anteriores desta série trazem levantamento de fornecedores. **Este não traz, de propósito.** Nenhum fornecedor, modelo, SDK, vector store, runtime ou mecanismo está sendo escolhido, e comparar ferramentas sem uma propriedade que exija a comparação produziria um levantamento que envelhece antes de ser usado — o ADR-0006 já registrou preço e limites de plano como o insumo menos durável de uma decisão.

O levantamento acontece quando PG10 disparar, contra as propriedades abaixo.

## Decisão

Adotar uma estratégia do Playground IA definida por **propriedades duráveis**, **sem escolha de fornecedor ou mecanismo**, e com **ativação condicionada a gatilho**.

### 1. Propriedades duráveis

Estas propriedades são a decisão. Qualquer experiência — atual ou futura — precisa satisfazê-las, e é por elas que uma proposta de experiência deve ser avaliada.

#### Isolamento

- **PG1 — O Playground nunca é dependência do site.** Nenhuma rota de conteúdo fora do Playground depende da existência, da disponibilidade ou do funcionamento de qualquer experiência.

  O critério de verificação é único e concreto, no molde de A4: **remover o Playground inteiro em um commit não quebra o build e não altera o comportamento de nenhuma rota de conteúdo fora dele.** É isso que separa PG1 de uma intenção de projeto e a torna checável em code review.

  Duas precisões, porque sem elas o critério seria falso na primeira leitura: o **item de navegação** que aponta para o Playground desaparece junto, e isso não é violação — a propriedade é sobre dependência funcional, não sobre identidade visual da página; e as **entradas editoriais de experiências aposentadas** (PG5) são conteúdo do Playground, não conteúdo externo, de modo que removê-las junto é o comportamento esperado e não uma quebra de PG1.

  O sequenciamento do roadmap torna essa parte da propriedade observada em vez de afirmada: o site existirá publicado, com conteúdo e com integrações, por todas as fases anteriores, sem Playground algum.

  *Raio de explosão.* **Falha, abuso, indisponibilidade, esgotamento de cota, vulnerabilidade ou erro de build ou de deploy do Playground não pode retirar do ar, impedir a publicação nem degradar as rotas principais do Developer OS.**

  A distinção entre as duas cláusulas é o ponto da propriedade, e não uma redundância. A primeira verifica **acoplamento de código**; a segunda verifica **o que acontece enquanto o Playground existe**, que é o risco que `architecture.md` §7 nomeia ao exigir que experimentos "não comprometam a estabilidade da aplicação principal". Removibilidade não entrega isso: numa aplicação única, um módulo do Playground que quebre o build quebra a publicação do site inteiro — inclusive de uma correção de conteúdo sem relação alguma com ele —, e cota consumida por abuso é cota compartilhada.

  Vale registrar o que a implementação inicial do ADR-0006 já resolve e o que ela não resolve, para que a propriedade não seja lida como mais ou menos satisfeita do que é. **Requisição a ativo estático não invoca o Worker**, de modo que esgotar o orçamento de invocações não derruba conteúdo pré-renderizado: essa parte é atendida por construção hoje. **A publicação, não.** Build e deploy são únicos, e é aí que o acoplamento é real e não está mitigado por nada. A primeira metade é fato de implementação substituível (ADR-0006 §3), não garantia — por isso a propriedade existe.

  O **mecanismo permanece em aberto**: separação de build, de deploy, de cota, de aplicação, ou combinação. O que a propriedade fixa é que **demonstrar esse isolamento é pré-condição da primeira experiência pública**, no mesmo regime em que D9 é pré-condição do primeiro segredo — verificação antes, não consequência depois. Se o isolamento não for demonstrável dentro da aplicação única, **a arquitetura separada deixa de ser alternativa reaberta pelo gatilho 2 e passa a ser consequência desta propriedade**, com a preferência por aplicação única de `architecture.md` §3 cedendo a ela.

- **PG2 — Nenhuma experiência converte rota de conteúdo em requisição dinâmica.** Preserva a forma do artefato de ADR-0006 §2, D7 e A3: requisição de conteúdo continua sendo requisição a ativo estático.

  O escopo é deliberadamente estreito. **PG2 governa o Playground e não governa Newsletter, Busca ou integrações**, que chegam antes e podem ligar o runtime por conta própria. Se a forma do artefato erodir por ali, é decisão daquelas áreas — escrever aqui uma propriedade que as alcançasse seria governar retroativamente o que este ADR não pode governar.

#### Composição

- **PG3 — Experiências são autocontidas, e infraestrutura compartilhada nasce de repetição demonstrada.**

  *Autocontida:* o código de uma experiência é removível em um commit, deixando o build íntegro e as demais experiências intactas.

  *Sem antecipação:* não existe runtime, registry, catálogo, definição comum ou framework interno de experimentos criado antes de haver repetição real. A intenção durável é essa — **repetição demonstrada, não antecipação**.

  O número é **heurística operacional, não propriedade**: a segunda experiência não refatora, a terceira pode. Régua de bolso para conversa de review, e não contador a satisfazer; o que a propriedade exige é que a repetição exista de fato.

  *Exceção única:* o que realiza PG4, PG6 e PG7 é compartilhado por natureza — garantia não se duplica por experiência, sob pena de produzir N superfícies de risco. Essa é também a fronteira por onde uma plataforma poderia crescer disfarçada de garantia, e é onde a leitura de review precisa ser mais dura.

  T3 item 3 acrescenta um desincentivo concreto e já existente: criar adaptador em `src/integrations/` torna teste obrigatório. Abstrair cedo tem preço visível no diff.

#### Custo

- **PG4 — Consumo público de recurso pago tem limite efetivo, e atingir o limite nunca gera custo.**

  Uma experiência só é publicada se for possível responder de forma defensável: **qual é o pior consumo que ela pode produzir dentro da janela permitida?** Se a resposta não existir, ou se o limite não puder ser imposto de forma efetiva, a experiência **não está pronta para exposição pública**.

  O limite **se renova em janela apropriada**. Abuso ou pico produzem indisponibilidade temporária, não a eliminação da experiência pelo resto do período — um teto mensal acumulado transformaria um único dia ruim em um mês inteiro desligado.

  Ao atingir o limite: **nenhuma cobrança automática, nenhum upgrade automático, nenhum fallback para modalidade paga, nenhum erro técnico cru para o visitante.** A experiência entra no estado **pausado** de PG5, e volta sozinha quando a janela se renovar.

  A propriedade é mais estrita que suas antecessoras, e a progressão é deliberada: D8 aceita "parar de servir"; A6 acrescenta a proibição de upgrade automático, porque produz custo sem decisão humana; **PG4 acrescenta que o teto precisa ser conhecido antes da publicação, e não descoberto em produção.** É essa última cláusula que dá dentes ao conjunto — sem ela, "teto renovável" pressupõe um teto que talvez não seja calculável.

  A **unidade** do limite — chamadas, tokens, passos de agente, tempo, crédito, janela temporal ou outra — e o **mecanismo** que o impõe não são escolhidos aqui.

  **Consequência aceita explicitamente:** experiências cujo consumo de pior caso não seja limitável — agentes abertos com encadeamento livre de tool calling são o caso óbvio, e é o caso que D8 nomeia por escrito — **não são publicáveis nesta forma**. A propriedade não é enfraquecida, e não existe exceção silenciosa por classe de experiência. Se uma demonstração de alto valor esbarrar nisso, o caminho é o gatilho 5, por escrito — não uma exceção informal.

  Revalidada a cada troca de fornecedor ou de plano, no mesmo regime de A6: é verificação repetida, não conclusão herdada.

#### Ciclo de vida

- **PG5 — A execução não tem promessa de permanência; o registro editorial tem.**

  Uma experiência pode ser **ativa**, **pausada**, **aposentada** ou **substituída**. Aposentar não é falha: é operação normal, e pode decorrer de indisponibilidade de fornecedor, de evolução do projeto ou de simples decisão editorial.

  **Pausada** é o estado de indisponibilidade **temporária e reversível**: limite de PG4 atingido, fornecedor fora do ar, ou desligamento deliberado por prazo determinado. Ele é distinto de aposentadoria em três aspectos, e a distinção é a razão de o estado existir: a página permanece **idêntica à da experiência ativa**, menos a execução; **a reativação não exige decisão humana nem deploy** quando a causa é o limite, porque a janela de PG4 se renova sozinha; e **pausar não é evento editorial** — nada no registro muda, e a experiência não passa a ser descrita como passada.

  A alternativa era mandar o esgotamento de limite para a aposentadoria, e ela é incorreta: PG4 determina que o limite se renove, e aposentar algo que volta sozinho em uma hora seria descrever mal o que aconteceu — além de tornar a aposentadoria reversível, o que ela não é.

  O que não tem promessa de permanência é a **execução**. A **página** não é a execução: a metade editorial é conteúdo governado pelo ADR-0003, versionada e durável por natureza; a metade interativa é código, descartável por PG3. Uma experiência aposentada **mantém a página** — o que demonstrava, qual decisão de engenharia apresentava e o registro que permita a ela continuar tendo valor de portfólio. **Nunca uma página quebrada, um 404 ou aparência de abandono.**

  Disso decorre a única cláusula operacional que permanece como propriedade: **publicar uma experiência inclui publicar o registro que sobreviverá a ela.** A formulação foi escolhida depois de avaliar a alternativa mais detalhada — exigir a produção de um artefato não interativo em formato e momento definidos — e descartá-la: **formato e procedimento são critérios de aceite da Issue de cada experiência**, e um ADR que os fixasse estaria prescrevendo operação em vez de garantir propriedade. O que precisa ser garantia é que o registro faça parte de publicar, e não da aposentadoria; do contrário ele será produzido quando já não for possível produzi-lo.

  PG5 e PG3 não conflitam porque operam sobre coisas diferentes: **deletar o código não deleta a página, porque a página nunca foi o código.**

  Como PG4 exige entrada automática no estado **pausado** ao atingir o limite, **esse estado precisa ser alcançável sem deploy**. Aposentadoria deliberada pode ser um deploy; esgotamento de limite não pode.

  O que o visitante encontra em cada estado **não é prescrito aqui**: a redação da mensagem e a forma da página são critérios de aceite da Issue da experiência, pelo mesmo motivo que o formato do registro não é fixado acima. O que a propriedade garante é o conjunto de estados, o que distingue um do outro e o que nunca é aceitável em nenhum deles — página quebrada, 404 ou erro técnico cru.

#### Superfície pública

- **PG6 — A superfície de entrada pública é a mínima que a demonstração exige.**

  Entrada livre de texto é **permitida**, não é padrão por conveniência, e é **exceção deliberada por experiência**. A exceção exige análise específica de abuso, de custo e de saída inadequada, registrada na **Issue daquela experiência** — antes do código, e não no PR, porque no PR ela chega junto com a vontade de publicar.

  A propriedade registra a obrigação e **não antecipa o mecanismo**: moderação, filtro, rate limiting e defesa contra injeção de prompt não são decididos aqui.

  Vale registrar uma convergência que não é coincidência: entrada delimitada é ao mesmo tempo mais barata, mais segura e **melhor como demonstração de engenharia**, porque exibe a decisão em vez de oferecer uma caixa. A intenção de produto e a postura de segurança apontam para o mesmo lugar.

  O risco que a propriedade nomeia e não resolve é o **reputacional**: saída inadequada publicada sob o nome do autor, para o público que `vision.md` identifica como engenheiros e recrutadores.

#### Segredo

- **PG7 — Nenhuma experiência introduz segredo antes de a segmentação exigida por D9 existir.** Herdada de ADR-0006 §3 e do gatilho 3, registrada aqui para não ser redescoberta como surpresa.

  *Nota de estado:* o ADR-0006 §3 previu que o primeiro segredo seria *"provavelmente uma chave de provedor de IA no Playground"*. Com o Playground na Fase 6, essa previsão provavelmente deixou de valer — Newsletter e integrações chegam antes. **A propriedade não muda; muda quem a exerce primeiro**, e a mudança é favorável: o Playground tende a herdar uma segmentação já implementada e revisada, em vez de construí-la sob pressão de publicar.

#### Valor

- **PG8 — Cada experiência declara qual decisão ou técnica de engenharia demonstra.** Sem essa declaração, não entra no Playground.

  A propriedade faz dois trabalhos. Impede "funcionalidades de IA sem valor claro" (`architecture.md` §11), que é a forma que o Playground assumiria se a régua fosse "roda e é de IA". E é **o que sobrevive à aposentadoria em PG5**: uma experiência aposentada sem declaração não tem o que mostrar, e vira exatamente a página abandonada que a decisão existe para evitar.

#### Dado do visitante

- **PG9 (parcial — a maior parte permanece deliberadamente em aberto) — Contar não é registrar.**

  *Decidido:* a **contagem operacional** exigida por PG4 — requisições, consumo, erro, qual experiência — é permitida. Sem ela PG4 é inexequível. Ela não é conteúdo e não reconstrói indivíduo.

  *Decidido:* **conteúdo digitado pelo visitante não trafega por analytics.** A2 já o proíbe, ao vedar que um indivíduo seja reconstruível a partir do que é armazenado; este ADR fecha o atalho explicitamente, porque enviar o prompt como propriedade de evento seria o caminho mais curto e o mais fácil de justificar como "só telemetria".

  *Em aberto, e deliberadamente não decidido aqui:* **persistir o que o visitante digita**, seja para debugging, seja para feedback editorial sobre o que as pessoas perguntam, seja para qualquer outro fim. Exige decisão própria e **não pode ser introduzido como consequência silenciosa de uma experiência**.

  A decomposição fica registrada porque as cinco coisas têm custo, valor e dono diferentes, e tratá-las como uma só é o erro que a propriedade previne: **(1)** conteúdo digitado pelo visitante; **(2)** contadores operacionais; **(3)** debugging; **(4)** analytics de uso; **(5)** feedback sobre o que os visitantes perguntam. Apenas **(2)** está decidida aqui, e **(4)** já é governada por A1 e A2.

  As categorias (1), (3) e (5) implicam persistência, o que aciona `architecture.md` §8 e o gatilho 6 do ADR-0006 — não caberiam neste ADR de qualquer forma. O gatilho 4 registra a reabertura.

#### Momento

- **PG10 — Ativação por gatilho.** Nada do Playground é construído antes de existir uma **experiência concreta escolhida por seu valor como demonstração de engenharia**. Até lá, a ausência do Playground não é lacuna — é a decisão sendo cumprida. Mesma manobra de T10, A9 e ADR-0006 §3.

  **Existir a experiência é condição necessária, não suficiente.** A ativação é uma **decisão humana afirmativa**, tomada naquele momento, de que o benefício compensa o custo de implementar e de manter — e não uma consequência automática de ter encontrado uma boa demonstração. Enquanto essa decisão não for tomada, o Playground continua não existindo, e isso segue não sendo lacuna.

  **A continuidade e a evolução do site principal têm precedência sobre a implementação e a manutenção do Playground.** É a leitura direta de `architecture.md` §7 — experimentos não comprometem a estabilidade nem aumentam desnecessariamente a complexidade da aplicação principal — aplicada ao custo de oportunidade, e não apenas ao risco técnico: manutenção do Playground que passe a deslocar trabalho essencial do produto principal viola esta propriedade tanto quanto uma falha o faria.

  *Corolário, e é o mais importante:* **a arquitetura não escolhe qual demonstração vale a pena construir.** Se a experiência de maior valor exigir capacidade ainda não ativada — runtime, segredo, API externa —, as pré-condições são cumpridas antes de implementá-la. Não se troca a experiência por outra apenas para evitar a decisão. Escolher deliberadamente uma primeira experiência sem segredo permanece **opção estratégica legítima, nunca regra arquitetural**.

### 2. Efeito sobre a régua de testes

Este ADR **não cria obrigação nova de teste hoje**. Por PG10, não existe código a testar.

Quando existir, a régua já está escrita e não precisa ser autorizada aqui: **T3 item 3** torna obrigatório testar mapeamento em `src/integrations/`, e **T6** proíbe assertar sobre saída de modelo generativo, verificando-se o adaptador a partir de fixtures. Se T6 se revelar insuficiente para verificar uma experiência, isso é o **gatilho 6 do ADR-0005**, e a decisão pertence àquele documento — não a este.

### 3. Fora do escopo desta decisão

- **Fornecedor, modelo, SDK, vector store, runtime específico, mecanismo de rate limiting, implementação concreta de D9, serviço de moderação, streaming e autenticação.**
- **Qualquer framework, registry ou definição comum de experimentos.**
- **Persistência** (`architecture.md` §8), inclusive a que a imposição do limite de PG4 possa exigir.
- **Quais experiências existirão, e qual será a primeira.**
- **A forma da metade editorial** — tipo de conteúdo, schema, rota, URL do Playground. São convenções, e `conventions.md` só registra convenção para código que existe.
- **Analytics do Playground** (ADR-0007 gatilho 1) e **regime de verificação** (ADR-0005 gatilho 6), ambos já reservados por gatilho em seus próprios ADRs.
- **Fechar PG9.**

### 4. Limites conhecidos

Registrados para não serem redescobertos como surpresa. Nenhum altera a decisão.

- **PG4 exige contagem, e contagem é estado.** Não se impõe teto sem contar, e um contador que sobrevive entre requisições é persistência. Isso tensiona `architecture.md` §8 e aciona o gatilho 6 do ADR-0006 — **a propriedade mais forte do conjunto é a que mais tensiona a restrição mais explícita do projeto.** Não é resolvido aqui, e não deve ser resolvido por reflexo com o primitivo mais próximo.

- **PG4 governa consumo público e não cobre custo em build.** Uma experiência que pré-compute algo com fornecedor pago durante o build consome fora da janela pública, e G2 roteia toda mudança por merge — inclusive correção de typo. O risco é limitado pela frequência de deploy, não por PG4. Registrado; decidir agora seria antecipar.

- **A cláusula de raio de explosão de PG1 não é verificável hoje**, porque não existe aplicação, build nem deploy contra os quais demonstrá-la. Ela é pré-condição da primeira experiência pública, no molde de D9 — e, como D9, é hoje satisfeita de forma vacuamente verdadeira. O custo dessa formulação está declarado nos contras: ela pode forçar arquitetura separada.

- **PG3 tem uma exceção que não é deletável**: o código que realiza as garantias. É legítimo e é também o disfarce mais provável de uma plataforma nascente.

- **PG2 é escopada ao Playground** e não impede que a forma do artefato erode por Newsletter, Busca ou integrações, que chegam antes.

- **D6 e o primitivo de IA da própria plataforma.** O ADR-0006 §4 nomeou os primitivos da Cloudflare — **Workers AI incluído** — como o vetor concreto de erosão de D6, e o Playground é exatamente onde essa tentação chega, porque é a opção que dispensa segredo, dispensa conta nova e já está na fatura. Este ADR **não proíbe e não prescreve**: registra que escolher um primitivo da plataforma para uma experiência é decisão a avaliar contra D6 naquele momento, e não conveniência a exercer em silêncio (gatilho 8).

- **`workerd` restringe o universo de dependências server-side** justamente em integrações de IA (ADR-0006 §4), e o Playground é a superfície que exporia essa restrição. Contido, não eliminado, pelo gatilho 2 do ADR-0006.

- **PG6 adia a análise de abuso** para quando houver experiência, que é também quando existe pressão para publicar. Exigir a análise na Issue mitiga; não elimina.

- **Este ADR decide longe da implementação.** É o contra mais honesto do documento: **PG4 será recalibrada quando houver fornecedor real e unidade de consumo concreta**, e isso é esperado, não falha. As propriedades escolhidas para sobreviver a essa recalibração são PG1, PG3, PG5, PG8 e PG10, que não dependem de tecnologia alguma.

## Consequências

### Prós

- **Preenche a pendência de `architecture.md` §12 sem antecipar nada.** PG10 garante que a decisão não produz código, arquivo de configuração ou dependência — o mesmo corte que A9 e T10 já provaram no projeto.
- **As quatro garantias sem dono passam a ter dono.** Teto de custo em superfície pública, entrada livre, aposentadoria e regra anti-plataforma não são cobertas por nenhum ADR aceito, e são as que se decidem pior sob pressão.
- **PG1 e PG5 juntos tornam o Playground descartável sem custo de portfólio.** Uma experiência pode ser removida sem quebrar o site e sem deixar página abandonada — o que reduz o custo de errar, que é a condição para experimentar de verdade.
- **PG4 é satisfazível de fato, e não uma promessa que depende de recurso pago.** O ADR-0006 já apurou que teto de gasto configurável é recurso pago e não instantâneo; PG4 se apoia em parada dura e em limite conhecido antes, que não dependem de plano.
- **A regra anti-plataforma ficou verificável.** "Deletável em um commit sem tocar em outra experiência" é checável em code review; uma lista de nomes proibidos não seria — dá para construir a mesma coisa sem usar nenhum dos nomes.
- **A decisão sobrevive à escolha de qualquer fornecedor**, porque nenhum foi escolhido. É o mesmo corte que ADR-0003 aplicou entre P1–P9 e `unified`, ADR-0005 entre T1–T11 e Vitest, ADR-0006 entre D1–D9 e Cloudflare, ADR-0007 entre A1–A9 e GoatCounter — com a diferença de que aqui **não existe sequer implementação inicial**, e isso é deliberado.
- **Não gera confiança falsa.** §4 declara que PG4 tensiona §8, que PG2 não alcança as áreas anteriores e que o próprio argumento para decidir agora enfraqueceu, em vez de deixá-los implícitos.

### Contras e riscos

- **PG4 exclui uma classe de demonstração.** Agentes abertos com tool calling encadeado — item da própria lista de exemplos conceituais do engenheiro — podem não ser publicáveis nesta forma. A consequência foi aceita explicitamente, mas é uma perda real, e o gatilho 5 existe para que ela seja reavaliada por escrito e não contornada em silêncio.
- **PG1 pode forçar a arquitetura separada que `architecture.md` §3 prefere evitar.** Exigir isolamento de raio de explosão, e não apenas de código, é a mudança que mais aumenta o custo potencial desta decisão: se build e deploy únicos não puderem ser isolados, o desfecho é dois deploys e duas superfícies operacionais para um portfólio pessoal. O custo é aceito porque a alternativa é pior — um módulo de experimento capaz de impedir a publicação de uma correção de conteúdo contradiz `architecture.md` §7 diretamente.
- **A propriedade mais forte é a que mais tensiona a restrição mais explícita.** PG4 provavelmente exigirá persistência, e `architecture.md` §8 mantém persistência em aberto justamente para não ser decidida por reflexo.
- **Decidir na Fase 6 a partir da Fase 1 é o oposto da disciplina que o projeto pratica.** PG10 é a mitigação, mas não elimina o risco de o documento envelhecer nas partes que tocam custo e mecanismo.
- **PG6 e PG9 deixam em aberto exatamente as duas coisas mais difíceis** — defesa contra abuso e persistência de input. É a escolha certa hoje e é também a razão pela qual este ADR não conclui o assunto.
- **A cláusula central de PG4 é respondível, não mecanicamente verificável.** "Qual é o pior consumo dentro da janela?" é uma pergunta que se responde em review e se registra na Issue; nenhuma verificação automatizada atesta que a resposta é honesta. É a mesma limitação que o ADR-0005 registrou em T4 e T5, e vale reconhecê-la em vez de tratar PG4 como se fosse mecânica.
- **PG5 depende de disciplina, não de mecanismo.** Nada impede tecnicamente que uma experiência seja publicada sem o registro que deveria sobreviver a ela; a garantia é mantida por review, no mesmo regime em que ADR-0002 mantém a escala de spacing e ADR-0003 mantém P5 e P6.
- **A superfície reputacional não tem solução arquitetural.** PG6 a nomeia e a delega para a análise de cada experiência.

## Gatilhos de reavaliação

Cada gatilho é uma necessidade ou problema concreto e observável.

1. **Existir uma experiência concreta escolhida** — ativa PG10 e obriga a responder PG4 e PG6 **antes** do código, além de disparar o levantamento técnico que este ADR deliberadamente não fez.
2. **O Playground crescer além da definição de §Contexto** — deixar de ser um conjunto pequeno de experiências. Reabre esta decisão e **reabre a alternativa híbrida que o ADR-0001 descartou** *"sem necessidade concreta neste momento"* — argumento que, com o Playground por último e num site já estável, ficou mais fraco, não mais forte.

   Este gatilho deixou de ser o único caminho para a arquitetura separada. **O raio de explosão de PG1 pode exigi-la antes**, e por outro motivo: não porque o Playground cresceu, mas porque o isolamento não foi demonstrável na aplicação única.
3. **Impor o limite de PG4 exigir persistência** — aciona `architecture.md` §8 e o gatilho 6 do ADR-0006; decisão própria, não extensão silenciosa desta.
4. **Surgir necessidade de persistir conteúdo digitado pelo visitante** — fecha PG9 e exige decisão própria, por envolver dado pessoal e persistência ao mesmo tempo.
5. **Uma experiência de alto valor ser inviabilizada por PG4** — **não é autorização para enfraquecer PG4**. É o momento de escolher explicitamente, por escrito, entre a propriedade e a demonstração.
6. **Analytics do Playground exigir eventos com propriedades** — gatilho 1 do ADR-0007, condicionado à verificação de A6.
7. **T6 não bastar para verificar uma experiência** — gatilho 6 do ADR-0005.
8. **Uma experiência exigir primitivo da própria plataforma de deploy** — avaliar contra D6 antes de adotar, não depois.

Reavaliação gera **novo ADR**. Este documento não é reescrito para alterar a decisão histórica, conforme `conventions.md` §10.

## Alternativas consideradas

- **Não decidir agora, e adiar até a Fase 6.** É a alternativa mais barata e a mais fácil de defender contra `architecture.md` §11 — zero código, zero documento, zero risco de envelhecer. Descartada porque a intenção de produto já fixada se perderia, e porque as quatro garantias sem dono continuariam sem dono justamente até o momento em que seriam inventadas às pressas. Vale registrar que **PG10 preserva quase todo o benefício desta alternativa**: na prática, nada existe até o gatilho. É o mesmo reconhecimento que o ADR-0007 fez ao descartar "não adotar analytics algum".

- **Generalizar para "capacidade pública de IA"**, governando qualquer superfície de IA futura do projeto. Descartada por antecipação: governaria superfícies que não existem e presumiria que surgirão. Se surgirem, são decisão delas. Além disso, o resequenciamento removeu o motivo original da generalização — o Playground deixou de ser o portador de todas as estreias.

- **Definir agora um runtime, registry ou definição comum de experimentos**, para que a segunda e a terceira experiências fossem baratas. Descartada por PG3 e por `architecture.md` §11: sem consumidores reais, é abstração por antecipação, e T3 item 3 já cobra o preço de quem a criar. O custo aceito é que as primeiras experiências terão duplicação — e é exatamente essa duplicação que produzirá a evidência de repetição, se ela existir.

- **Aplicação separada para o Playground** — o híbrido que o ADR-0001 descartou. **Não descartada, e deixou de ser apenas uma alternativa:** com a cláusula de raio de explosão de PG1, ela é o desfecho previsto caso o isolamento não seja demonstrável dentro da aplicação única. Contraria hoje a preferência por aplicação única de `architecture.md` §3 e introduz dois deploys sem necessidade concreta — mas §3 pede aplicação única "até existir necessidade concreta", e PG1 descreve exatamente a necessidade que a produziria. O argumento que a derrubou no ADR-0001 era temporal, e o tempo mudou a favor dela.

- **Orçamento mensal pequeno e monitorado**, em vez de teto duro. É a alternativa honesta a PG4, e não é irracional: o propósito do Playground é ser visto por poucas pessoas de alto valor, e "indisponível" é um modo de falha caro em termos do próprio objetivo. Descartada por assimetria de risco — uma demonstração indisponível custa uma impressão perdida; um endpoint público com custo variável, sem identidade e sem limite superior confiável custa dinheiro rápido, e alerta é sempre atrasado enquanto laço de agente não é. O custo da escolha é nomeado e não escondido: **a experiência pode estar desligada exatamente para o visitante raro que importava.** É PG5 que torna isso tolerável, e é a janela renovável de PG4 que impede que seja permanente.

- **Exigir que a primeira experiência não introduza segredo**, aproveitando que isso adiaria quatro gatilhos de uma vez. Tecnicamente atraente e **descartada explicitamente**: seria a arquitetura escolhendo qual demonstração vale a pena construir, o que inverte a relação correta entre as duas. Permanece opção estratégica, registrada no corolário de PG10.

- **Proibir entrada livre de texto** em qualquer experiência. Descartada por inviabilizar classes legítimas de demonstração — "Ask my portfolio" é o caso evidente, e é justamente o tipo de experiência de maior valor. PG6 converte proibição em exceção deliberada, que é o que preserva a capacidade sem tornar a caixa de texto o padrão.

- **Registrar um fornecedor como implementação inicial**, no molde dos quatro ADRs anteriores. Descartada porque não existe experiência para a qual escolher: os ADRs anteriores escolheram implementação inicial para necessidades que já existiam ou que tinham gatilho datado. Aqui, escolher seria comprar uma comparação que envelhece antes de ser usada.

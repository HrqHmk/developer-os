# ADR-0006 — Plataforma e Estratégia de Deploy

## Status
Proposto

## Contexto

`architecture.md` §12 registra "Plataforma de deploy" como decisão pendente, e §9 permanece marcado como *A definir*. A pendência não é organizacional: **três garantias já aceitas dependem desta decisão sem que ela exista.**

- O ADR-0004 §2 desenha o ciclo de trabalho com um slot explícito de *"preview da alteração (quando existir)"*. O slot está vazio.
- O ADR-0004 G1 afirma que `main` é "sempre publicável", mas nada publica `main`.
- O ADR-0005 T9 define E2E como o que "somente o navegador real revela", e T11 amarra a execução da suíte aos critérios de merge de G7.3. Ambos pressupõem um alvo publicado que ainda não existe.

Ao mesmo tempo, decidir infraestrutura cedo demais tem custo próprio e documentado. `architecture.md` §11 manda evitar "dependência excessiva de serviços externos" e §2 proíbe introduzir infraestrutura para necessidades hipotéticas. Escolher plataforma **pelo Playground IA** — cuja forma, provedores e necessidade de streaming seguem indefinidos — seria decidir por uma hipótese.

Os dois riscos são simétricos e a saída não é decidir menos, é decidir com o escopo correto: **o que o site precisa hoje, mais uma garantia sobre a transição futura.**

Três restrições de contexto delimitam o formato desta decisão.

A primeira é que **o projeto não tem código de aplicação.** O scaffold do Create Next App está sendo removido e o TanStack Start ainda não foi inicializado. A decisão precisa separar o que se decide agora do que só se configura quando houver aplicação.

A segunda é que **CI/CD segue pendente** (`architecture.md` §12). Uma estratégia escrita em termos de pipeline concreto nasceria dependente de decisão não tomada. Por isso os critérios são expressos como propriedades, no mesmo molde que o ADR-0003 adotou com P1–P9, o ADR-0004 com G1–G7 e o ADR-0005 com T1–T11.

A terceira é que **a escolha de provedor é, entre as decisões desta série, a mais reversível** — desde que o acoplamento fique na fronteira de configuração. É essa reversibilidade que licencia decidir agora sem violar §11, e ela é uma propriedade a garantir (D6), não uma esperança.

### Levantamento técnico (ago/2026)

Verificado em documentação oficial dos provedores e do framework.

**TanStack Start.** O mecanismo de deploy é sempre um plugin de Vite, nunca um formato proprietário: `@cloudflare/vite-plugin` (Cloudflare), `@netlify/vite-plugin-tanstack-start` (Netlify), `nitro/vite` (Vercel). Cloudflare, Netlify e Railway são parceiros oficiais na documentação; **Vercel não é** — remete às instruções do Nitro. O prerender é opção do plugin `tanstackStart()`, não preset de deploy, e **nenhum alvo documentado dispensa o entrypoint de servidor**: toda saída produz `.output/server/index.mjs` além de `.output/public`. Rotas com parâmetro (`/blog/$slug`) ficam fora da descoberta automática, mas são prerenderizadas via `crawlLinks` — confirma e suaviza a limitação registrada no ADR-0001. Versão publicada: `@tanstack/react-start` 1.168.46.

**Cloudflare Workers.** Plano Free sem cobrança de excedente — os limites de serviço são aplicados no lugar da fatura. **Requisições a ativos estáticos são gratuitas e ilimitadas nos dois planos** e não consomem o orçamento de 100.000 invocações/dia do Free. Duração de requisição HTTP sem limite enquanto o cliente estiver conectado; o modelo de cobrança é CPU time, não wall-clock. Workers Builds gera build por branch não-produtiva com comentário automático no PR, contendo URL por commit e alias estável por branch. Rollback via `wrangler rollback` ou dashboard, sem rebuild, entre as 100 versões mais recentes. Workers Logs habilitado por padrão, retenção de 3 dias no Free. 3.000 build minutes/mês no Free. Prerender do TanStack Start suportado desde 19/12/2025, exigindo `@tanstack/react-start` v1.138.0+; o `wrangler.jsonc` aponta `assets: ".output/public"`, e requisição que casa com um ativo é servida **sem invocar o Worker**. Nenhuma restrição de uso comercial encontrada.

**Vercel.** Hobby é restrito a "non-commercial personal use only"; a definição de uso comercial cobre processamento de pagamento, anúncios, venda de produto ou serviço, link de afiliado como propósito primário e, explicitamente, **pedidos de doação**. Sem cobrança de excedente no Hobby, mas o estouro implica espera de 30 dias. **Spend Management é recurso de time Pro** e, mesmo lá, o pausamento não é instantâneo. Duração de função: 300s no Hobby, com streaming contando dentro da duração. Preview por PR com URL por branch e por commit. Variáveis de ambiente com escopo nativo por ambiente. Instant Rollback sem rebuild, mas **no Hobby apenas para o deployment imediatamente anterior**. Runtime logs retidos por **1 hora** no Hobby.

**Netlify.** Modelo de créditos para todas as contas criadas a partir de 04/09/2025. Free: 300 créditos/mês, hard limit sem opção de compra — projetos pausados ao esgotar. **Deploy de produção consome 15 créditos**; Deploy Previews e branch deploys consomem zero. Bandwidth a 20 créditos/GB. Funções: 10s síncronas, **60s em streaming**, 15 min em background. Variáveis com escopo nativo por deploy context. Uso comercial explicitamente permitido no Free. Deploy Preview com URL estável por PR mais permalink imutável por deploy.

## Decisão

Adotar uma estratégia de deploy definida por **propriedades duráveis**, com **artefato pré-renderizado servido como ativo estático** e **Cloudflare Workers como implementação inicial substituível**.

### 1. Propriedades duráveis

Estas propriedades são a decisão. Qualquer implementação — atual ou futura — precisa satisfazê-las, e é por elas que uma alternativa deve ser avaliada.

#### Publicação

- **D1 — O que está em produção é derivável de um conjunto identificável e controlado de entradas de build.** Todo artefato publicado corresponde a um commit identificável e é reproduzível a partir desse conjunto, sem passo manual e sem estado acumulado no ambiente.

  O conjunto inclui, conforme aplicável: o commit; o lockfile; a configuração versionada; a versão e o runtime de build; e a identidade ou versão das configurações externas que influenciem o artefato. **Segredos não são versionados no repositório** (D9).

  A precisão importa porque "repositório e lockfile" seria insuficiente: o prerender do TanStack Start roda em build e pode ler variáveis de ambiente e bindings, de modo que entradas fora do repositório influenciam o artefato produzido. **Como essas entradas são registradas e fornecidas é decisão do ADR de CI/CD**; esta propriedade exige apenas que sejam identificáveis e controladas.

  Deriva de P1 e P2 (conteúdo versionado, processado em build) e de `conventions.md` §2 (lockfile como referência).

- **D2 — Publicar é consequência do merge, não uma ação à parte.** Não existe caminho normal de publicação que passe por fora de `main` (G2). Deploy manual é procedimento de exceção, não fluxo.

#### Observabilidade da mudança

- **D3 — Toda mudança candidata é observável em ambiente próprio antes do merge.** Cada Pull Request possui **artefato e URL de preview próprios**, estáveis e produzidos pelo mesmo processo de build da produção.

  O escopo de "próprio" é deliberadamente restrito a artefato e endereço. **Isolamento de credenciais, bindings e recursos externos é governado por D9**, não por esta propriedade — separar as duas evita que D3 pareça garantir algo que ela não garante.

  Preenche o slot vazio de ADR-0004 §2, dá substância à leitura humana de G3 nas mudanças visuais que o ADR-0005 T8 declara explicitamente não cobrir, e fornece o alvo que o E2E de T9 exigirá.

- **D4 — Existe rastreabilidade verificável entre deployment, commit e resultado do build.** Para qualquer deployment é possível identificar o commit correspondente e o resultado do build que o produziu; quando o build ou o deploy não conclui, a evidência disponível da falha é acessível.

  A propriedade é de **rastreabilidade**, não de retenção perpétua: a política concreta de retenção de logs e de histórico pertence à implementação e ao ADR de CI/CD, e varia por provedor e por plano. Analytics de audiência é decisão separada, pendente em `architecture.md` §12.

#### Reversibilidade

- **D5 — Reverter é operação de minutos e não depende de rebuild nem de reescrever histórico.** A reversão reponta para um artefato anterior conhecido. `git revert` continua sendo o caminho para corrigir a causa — não o mecanismo de emergência.

#### Fronteira com o provedor

- **D6 — Acoplamento ao provedor vive na fronteira de configuração, nunca em `src/`.** Nenhuma API proprietária de plataforma dentro do código da aplicação. Espelha `architecture.md` §6 ("integrações devem permanecer isoladas da lógica principal").

  O objetivo arquitetural é **concentrar o acoplamento na fronteira de configuração e minimizar a mudança no código da aplicação durante uma migração**. Não é promessa de que uma migração se limite a plugin, variáveis e DNS: diferenças de runtime, de bindings, de gestão de segredos, de semântica de cache e de serviços externos podem exigir trabalho adicional. D6 reduz a superfície dessa migração; não a elimina.

- **D7 — Execução server-side é capacidade disponível, não premissa ligada.** Habilitar server functions no futuro não pode exigir troca de provedor nem redesenho da estratégia de deploy. Formaliza o que o ADR-0001 já prometeu, na formulação que o levantamento tornou precisa: **começar com conteúdo pré-renderizado servido como ativo estático e utilizar execução server-side apenas quando surgir necessidade concreta.**

  A distinção é a de §2: **não evitamos ter runtime; evitamos utilizá-lo antes de precisar.**

#### Custo e segurança

- **D8 — O custo é previsível e o modo de falha diante do limite é parar de servir, nunca faturar em aberto.** Nenhuma configuração em que pico de tráfego, crawler ou laço em experimento de IA produza cobrança ilimitada.

  A redação é deliberada. Teto de gasto configurável não existe em plano gratuito de nenhum provedor avaliado — é recurso pago e, onde existe, não é instantâneo. O que os planos gratuitos oferecem é **parada dura**, e é essa a garantia que a propriedade exige.

- **D9 — Segredos vivem na plataforma, segmentados por ambiente.** Nada de credencial no repositório; preview nunca usa credencial de produção.

  A propriedade vale desde já, mas **ainda não é exercida**: o projeto não possui segredo algum, e por isso ela é hoje satisfeita de forma vacuamente verdadeira. Ela se torna **pré-condição obrigatória antes da introdução do primeiro segredo** — provavelmente uma chave de provedor de IA no Playground. A implementação inicial **não a satisfaz por padrão** (§3 e §4).

### 2. Forma do artefato publicado

O deploy publica um artefato **pré-renderizado, servido como ativo estático**. O runtime servidor existe dentro do artefato — a stack não oferece saída sem servidor — mas **não é invocado por requisições de conteúdo pré-renderizado**. Execução server-side passa a ser utilizada somente quando surgir necessidade concreta, sem exigir troca de plataforma ou redesenho da estratégia de deploy.

A precisão da redação importa. A alternativa considerada era ligar o runtime servidor desde o início para eliminar o custo de uma transição futura; foi descartada por pagar complexidade e custo por necessidade hipotética, contra `architecture.md` §11. Mas a formulação ingênua dessa escolha — "publicar saída estática, sem servidor" — descreveria algo que o TanStack Start não entrega. O que a decisão evita não é *ter* runtime: é *usá-lo* antes de precisar.

É a mesma manobra que o ADR-0005 T10 aplicou ao Playwright — decidir agora, instalar quando o gatilho existir.

### 3. Implementação inicial

A implementação abaixo é a escolha inicial para satisfazer **as propriedades aplicáveis ao estágio atual do projeto**. Ela é **substituível**: trocar o provedor, mantendo as propriedades, não exige novo ADR.

**Cloudflare Workers**, com prerender do TanStack Start servido por Workers Static Assets.

Uma ressalva é parte da decisão, e não uma nota de rodapé: **a implementação inicial não satisfaz D9 por padrão.** Hoje isso não produz risco, porque o projeto não possui segredo algum — D9 é vacuamente satisfeita. **D9 torna-se uma pré-condição obrigatória antes da introdução do primeiro segredo**, e nenhum segredo pode alcançar um preview antes que a segmentação exista.

O mecanismo concreto — Worker separado para previews, Wrangler Environment, ou outra forma — **não é escolhido aqui**. Será decidido quando o gatilho ocorrer, contra o único critério que importa: satisfazer D9 antes de qualquer segredo alcançar um preview. Escolher agora seria montar infraestrutura para necessidade que ainda não existe, contra `architecture.md` §11.

Três argumentos sustentam a escolha, e todos são consequência das propriedades, não de preferência:

- **D2 e D8 juntos.** O ADR-0004 G2 obriga *toda* mudança — inclusive documentação e conteúdo editorial — a entrar por merge. Cloudflare é a única das três finalistas que não cobra por deploy e cujas requisições a ativos estáticos são gratuitas e ilimitadas. Nas Fases 1–2 o custo de estado estacionário não é baixo, é estruturalmente zero, e o plano Free não tem excedente cobrável.
- **D5.** Rollback sem rebuild entre as 100 versões mais recentes é o mais amplo dos três avaliados.
- **D7 por construção.** O `wrangler.jsonc` do TanStack Start já declara um Worker, mas requisições que casam com ativos estáticos não o invocam. A primeira server function é código a escrever, não plataforma a trocar.

O status de parceiro oficial na documentação do TanStack Start é sinal de manutenção da integração, não argumento decisivo.

Convenções operacionais — configuração do `wrangler.jsonc`, tratamento de barra final, ativação de builds em branch não-produtiva — ficam em `conventions.md` e **serão registradas quando o deploy for efetivamente configurado**. Não existe aplicação, `vite.config.ts` nem `wrangler.jsonc` no repositório; escrever convenção para arquivo inexistente é a antecipação que `architecture.md` §11 e o ADR-0005 T10 recusam.

### 4. Limites conhecidos da implementação inicial

Registrados para não serem redescobertos como surpresa. Nenhum altera a decisão.

- **A lacuna de D9.** No Cloudflare, uma versão do Worker é um snapshot que inclui bindings e secrets, e a versão de preview pertence ao mesmo Worker. **Uma preview de PR carrega, por padrão, os segredos de produção** — e preview de PR é superfície pública. Netlify e Vercel resolvem isso nativamente por contexto de deploy; Cloudflare exige montagem deliberada, para a qual existe mais de um caminho possível (Worker separado, Wrangler Environment, entre outros). **Este ADR não escolhe entre eles**, conforme §3.

  Hoje o risco é nulo porque não há segredos. A mitigação é **pré-condição** para a introdução do primeiro segredo, não consequência dela, e está registrada como gatilho 3.

  Vale notar o recorte: **isto não é uma falha de D3.** Cada preview tem artefato e URL próprios, que é o que D3 exige. O que falta é a segmentação de credenciais, que é escopo de D9.

- **ISR e cache por header não funcionam no Cloudflare.** Workers rodam à frente do CDN, de modo que headers de cache não alcançam a camada de CDN sem uso direto da Cache API. O ADR-0001 já registrou a ausência de ISR nesta stack e a forma do artefato definida em §2 não depende de cache de resposta dinâmica — mas o limite é real e é maior que o do ADR-0001: não é só que o framework não oferece ISR, é que este provedor não o suportaria.

- **O runtime é `workerd`, não Node.** Uma dependência futura incompatível é risco real. Ele é contido, e não eliminado, pelo fato de o ADR-0003 P2/P3 colocar todo o processamento de Markdown em build — que roda em Node normal. A superfície exposta ao `workerd` é a futura server function do Playground.

- **A atração para os primitivos da própria Cloudflare** (KV, D1, R2, Workers AI) é o vetor concreto de ameaça a D6, e é o que tornaria a migração cara. Também tensiona `architecture.md` §8, que mantém persistência deliberadamente em aberto.

- **Barra final e redirecionamento 307.** A combinação de `autoSubfolderIndex` do TanStack Start com o `html_handling` padrão do Workers produz 307 em subpáginas. É resolvível por configuração e pertence a `conventions.md`, não a este ADR.

- **Consumo de build minutes por builds de branch** não está documentado. Imaterial no volume previsto; registrado como incerteza assumida.

### 5. Fora do escopo desta decisão

- **Configuração concreta de CI**, o conjunto de verificações de G7.3, e se essas verificações bloqueiam o deploy.
- **Onde o build é executado** — builder da própria plataforma ou GitHub Actions produzindo artefato. Esta decisão fixa apenas que o deploy consome um artefato reproduzível (D1).
- **O ambiente usado durante o prerender.** O prerender roda em build com variáveis, secrets e bindings **locais**; em CI exige configuração explícita. É insumo direto do ADR de CI/CD.
- **Onde o Playwright executa e contra qual alvo.** Esta decisão apenas habilita o E2E ao garantir preview estável (D3); a introdução é governada pelo ADR-0005 T10.
- **Rebuild agendado** para as integrações da Fase 5 do roadmap.
- **Domínio próprio.** É recomendação forte — URLs públicas de longo prazo não devem criar dependência da identidade do provedor —, mas **não é propriedade arquitetural**: um deploy inicial no domínio fornecido pela plataforma não é violação.
- **Analytics, persistência e o regime de verificação do Playground IA**, todos pendentes em decisão própria.

## Consequências

### Prós

- **Preenche o slot vazio do ADR-0004 §2 e dá alvo ao ADR-0005 T9.** D3 converte "preview da alteração (quando existir)" em garantia, e transforma `main` "sempre publicável" (G1) de afirmação em fato observável.
- **Fecha a lacuna de deploy sem antecipar o ADR de CI/CD.** As propriedades são neutras quanto a pipeline, e D1 fixa a fronteira entre os dois ADRs: este exige que as entradas de build sejam identificáveis e controladas; **como elas são registradas e fornecidas, e onde o build é executado, são decisões do outro.** D4 aplica o mesmo corte à retenção de logs.
- **O custo operacional é estruturalmente zero, não apenas baixo.** Requisições de conteúdo são requisições a ativos estáticos: gratuitas, ilimitadas e fora do orçamento de invocações. Atende diretamente ao objetivo de baixo custo de `architecture.md` §1.
- **D8 na redação de "parar em vez de faturar" é satisfazível de fato**, e não uma promessa que depende de recurso pago.
- **A decisão sobrevive à troca de provedor.** As garantias estão em D1–D9, não em Cloudflare, e uma alternativa é avaliável contra critérios já escritos — mesmo corte que ADR-0003 aplicou entre P1–P9 e `unified`, e ADR-0005 entre T1–T11 e Vitest. D6 mantém o grosso da migração na fronteira de configuração; o que ela não faz é reduzir toda migração a plugin, variáveis e DNS.
- **D7 é satisfeita por construção, sem infraestrutura antecipada.** O caminho para o Playground IA fica aberto sem que nada seja montado para ele hoje.
- **Não gera confiança falsa.** §4 declara a lacuna de D9 e os limites do provedor em vez de deixá-los implícitos, no mesmo espírito do ADR-0005 T8.

### Contras e riscos

- **A implementação inicial não satisfaz D9 por padrão.** É o contra mais relevante desta decisão: a propriedade existe, é vacuamente satisfeita hoje, e a plataforma escolhida é a pior das três avaliadas nesse ponto. O risco só se materializa com o primeiro segredo, mas materializa-se como exposição pública de credencial.
- **A escolha é reversível em tese e menos em prática, sem domínio próprio.** D6 mantém pequena a superfície de migração no código, mas URLs publicadas em domínio do provedor acumulam identidade que a migração perderia. Mantido fora do escopo por decisão explícita, e portanto é risco assumido.
- **`workerd` restringe o universo de dependências server-side** justamente na área — integrações de IA — em que o projeto tem menos visibilidade sobre o que vai precisar.
- **O provedor exerce atração para os próprios primitivos de persistência**, que é o caminho mais provável de erosão de D6 e de decisão implícita sobre `architecture.md` §8.
- **A DX de preview é um degrau abaixo da alternativa mais forte.** Vercel oferece o melhor fluxo de preview das três; abrir mão disso é custo real de ergonomia, aceito em troca de D2, D5 e D8.
- **Parte do levantamento envelhece rápido.** Preço e limites de plano são o insumo menos durável desta decisão. Por isso nenhuma propriedade depende de um número específico, e mudança de plano é gatilho, não premissa.
- **Uma incerteza permanece assumida** (consumo de build minutes por builds de branch), e uma foi deliberadamente não investigada: o modelo de créditos da Netlify não foi confirmado no dashboard, por não ser material — a Netlify perde por D2 mesmo na leitura mais favorável a ela.

## Gatilhos de reavaliação

Cada gatilho é uma necessidade ou problema concreto e observável.

1. **Surgir necessidade concreta de execução server-side** — primeira server function do Playground IA. Não reabre a plataforma, mas obriga a reavaliar `workerd`, duração e o regime de segredos antes de escrever o código.
2. **Dependência server-side incompatível com `workerd`** que não tenha alternativa razoável — reabre a escolha de provedor, com Vercel e Netlify como candidatas por oferecerem runtime Node.
3. **Introdução do primeiro segredo** — obriga a implementar a segmentação exigida por D9 **antes** do primeiro deploy que o contenha. É pré-condição, não consequência.
4. **Custo deixar de ser previsível ou o plano gratuito mudar de forma** — reabre D8 e a escolha de plano ou provedor.
5. **Preview por PR deixar de ser confiável** — indisponibilidade, latência ou URLs instáveis comprometem G3 e T9 ao mesmo tempo.
6. **Necessidade concreta de persistência** (`architecture.md` §8) — a escolha do mecanismo tensiona D6 e exige decisão própria, não a extensão silenciosa desta.
7. **URLs publicadas passarem a ter valor que a migração perderia** — momento em que domínio próprio deixa de ser recomendação e vira requisito.
8. **Limitação do modelo de ativos estáticos virar problema concreto** — volume de arquivos, necessidade de cache dinâmico ou de regeneração incremental.

Reavaliação gera **novo ADR**. Este documento não é reescrito para alterar a decisão histórica, conforme `conventions.md` §10.

## Alternativas consideradas

- **Vercel** — **principal alternativa**, e a melhor das três em ergonomia de preview e integração com GitHub. Descartada por três fatos somados, nenhum deles de capacidade: no Hobby, o rollback alcança **apenas o deployment imediatamente anterior**, contra D5; **Spend Management é recurso Pro**, de modo que a propriedade D8 depende de plano pago para existir como controle; e a cláusula de uso não comercial cria **acoplamento condicional entre plataforma e produto** — doação, patrocínio ou anúncio converteria a escolha gratuita em plano pago. Esse último ponto é o decisivo: não é a hipótese de monetização que incomoda, é infraestrutura cuja elegibilidade depende de decisões editoriais futuras, exatamente o tipo de dependência oculta que D6 existe para evitar. Registra-se ainda que Vercel **não é parceiro oficial** na documentação do TanStack Start, e que seus diferenciais mais fortes — ISR e otimização de imagem — são precisamente os recursos que o ADR-0001 registrou como ausentes nesta stack. A retenção de runtime logs por **1 hora** no Hobby é limitação operacional real, mas **não é violação de D4**: build logs são retidos indefinidamente, e D4 exige rastreabilidade, não retenção perpétua. **Seria a recomendação caso o projeto já estivesse em plano Pro por outro motivo.**
- **Netlify** — a mais forte das três em D9, com escopo nativo por deploy context, e com o melhor esquema de URLs de preview (estável por PR mais permalink imutável). Descartada por colisão estrutural com **D2**: no modelo de créditos, cada deploy de produção consome 15 dos 300 créditos mensais do plano Free, o que estabelece um teto de aproximadamente **20 deploys de produção por mês antes de qualquer tráfego**. Como o ADR-0004 G2 roteia toda mudança por merge, uma correção de typo consome o mesmo orçamento que uma feature — o fluxo obrigatório do projeto consumiria o plano. O plano pago resolve, mas cobra mensalmente por algo que a alternativa escolhida entrega sem custo. Secundariamente, o teto de **60s em streaming** é o mais apertado dos três para um eventual Playground.
- **GitHub Pages** — custo zero, complexidade mínima e nenhuma conta adicional. Descartada por falhar **D3** (não há preview por PR nativo) e **D7** (ausência total de runtime servidor obrigaria uma segunda plataforma para o Playground, reintroduzindo a arquitetura híbrida que o ADR-0001 já descartou e contrariando a preferência por aplicação única de `architecture.md` §3).
- **VPS ou container gerenciado** (Railway, Fly, Coolify e similares) — controle total do runtime, sem restrição de compatibilidade e sem limite de duração. Descartada por custo operacional e por contrariar `architecture.md` §1 e §11: introduz responsabilidade de infraestrutura sem requisito que a justifique, e nenhuma propriedade de D1–D9 pede por ela.
- **Ligar o runtime servidor desde o início**, publicando com preset de servidor mesmo sem uso, para eliminar o custo de uma transição futura. Descartada por pagar complexidade, custo e superfície de runtime por necessidade hipotética, contra `architecture.md` §11. D7 preserva a intenção — transição sem migração — sem exigir que a transição seja feita antes de precisar.
- **Adiar a decisão** até existir aplicação. Seria coerente com "sem infraestrutura antecipada", e é a alternativa mais fácil de defender superficialmente. Descartada porque a pendência já bloqueia garantias aceitas: sem plataforma, o preview de ADR-0004 §2 permanece vazio, `main` é publicável apenas no papel e o E2E do ADR-0005 não tem alvo. Adiar não evita o risco de decidir cedo — apenas transfere o custo para o momento em que a Fase 1 do roadmap estiver bloqueada.
- **Registrar o provedor como parte da decisão**, em vez de como implementação inicial — descartada por acoplar uma garantia arquitetural a um produto. As propriedades D1–D9 são a decisão; Cloudflare Workers é implementação substituível sem revisar este ADR, no mesmo corte que ADR-0003, ADR-0004 e ADR-0005 aplicaram às suas.

# ADR-0009 — Estratégia de CI/CD

## Status
Proposto

## Contexto

`architecture.md` §12 registra "CI/CD" como o último item pendente. A pendência não é organizacional: **três ADRs aceitos já atribuíram escopo a este documento pelo nome.**

- O ADR-0004 §4 remete para cá a "configuração concreta de CI e o conjunto de verificações automatizadas". G7.3 admite um conjunto "hoje vazio" — e ele está vazio de fato: a proteção de `main` não declara nenhum `required_status_checks`.
- O ADR-0005 §4 remete para cá a composição de G7.3, a verificação de prerender e o lint, com a formulação explícita de que "**lint não é teste**". T11 é, hoje, promessa parcial: a suíte integra os critérios de merge "conforme a verificação automatizada se torne disponível", e ela não se tornou.
- O ADR-0006 §5 remete para cá **onde o build é executado**, se as verificações bloqueiam o deploy, como as entradas exigidas por D1 são registradas e fornecidas, o ambiente usado durante o prerender e a política de retenção de logs de D4.

Ou seja: **P4, P9 e T11 são garantias declaradas e não praticadas, e D2 e D3 são propriedades sem mecanismo.** É a mesma lacuna que motivou o ADR-0004 (code review sem lugar definido) e o ADR-0005 (contrato afirmado que nada exercita), na terceira iteração.

Três restrições de contexto delimitam o formato desta decisão.

A primeira é que **não existe aplicação no repositório**: sem `package.json`, sem `src/`, sem `vite.config.ts`, sem `wrangler.jsonc`. A decisão precisa separar o que se decide agora do que só se configura quando houver aplicação — a manobra de T10, A9 e ADR-0006 §3.

A segunda é que **CI/CD não reabre a escolha de plataforma de deploy.** Cloudflare Workers permanece a implementação inicial do ADR-0006, e este documento a operacionaliza.

A terceira é o que distingue este ADR dos anteriores: **ele é o primeiro cuja pauta mínima foi escrita pelos ADRs precedentes, e não pelo autor.** Isso reduz a liberdade e aumenta a obrigação — o trabalho de invenção é pequeno, o de derivação e fechamento é grande.

### Dois fatos do repositório que moldam a decisão

Verificados, não presumidos.

- **Squash é o único método de merge habilitado, e branches são removidas no merge** (`conventions.md` §11.1 e §11.4). O commit publicado em produção nasce no merge e nunca existiu na branch do Pull Request; depois do merge, o commit original é inalcançável no repositório e sobrevive apenas como referência da plataforma. Promover a produção o artefato construído no preview tornaria a rastreabilidade de produção dependente do GitHub — contra D4 e enfraquecendo D1.
- **A proteção de `main` aplica-se também a administradores.** Uma verificação obrigatória que fique instável ou deixe de reportar não pode ser contornada pelo mantenedor. Isso transforma a escolha de quais checks bloqueiam merge em **questão de disponibilidade**, não de ergonomia — e conecta diretamente ao gatilho 2 do ADR-0004, o fluxo contornado com frequência.

### Levantamento técnico (ago/2026)

Realizado **depois** de identificadas as perguntas arquiteturais que o exigiam, e não antes. Fontes: documentação oficial da Cloudflare e do GitHub; o estado do suporte a OIDC vem de discussão pública no repositório da Cloudflare e está sinalizado como tal.

**Workers Builds.** A branch de produção é configurável e, por padrão, é a branch default do repositório; push nela executa o build command seguido do deploy command. **Builds de branch não-produtiva precisam ser habilitados explicitamente**; habilitados, o deploy command é substituído pelo de preview, cujo padrão é `npx wrangler versions upload` — que cria uma versão sem promovê-la a produção. Em Pull Request, a Cloudflare posta comentário com o status e a URL de preview, e gera *check run* no GitHub. Build command, deploy command, deploy command de branch não-produtiva, root directory e **build variables and secrets vivem apenas no dashboard**, e a documentação é explícita: *"Workers Builds does not honor the configurations set in Custom Builds within your Wrangler configuration file."* Já `wrangler.jsonc`, `package.json`, lockfile e `.nvmrc` / `.node-version` são lidos do repositório — e a documentação recomenda fixar a versão de Node por arquivo para evitar atualização automática do build image. Plano Free: 3.000 build minutes/mês, 1 build concorrente, timeout de 20 minutos. **Armadilha documentada:** build pulado não gera check run, e verificação obrigatória que não reporta bloqueia o merge.

**Versões, segredos e rollback.** Uma versão é *"the complete state of your Worker at a point in time: its bundled code, static assets, bindings, and compatibility settings"*, e *"secrets not included in the file are preserved from the previous version"* — o que **confirma a lacuna de D9 registrada em ADR-0006 §4**. Wrangler Environments criam um Worker separado por ambiente (`<nome>-<ambiente>`), com bindings e variáveis **não-herdáveis** e segredos por ambiente, e são documentados como funcionando sob Workers Builds. Rollback alcança as 100 versões mais recentes sem rebuild, com a ressalva de que recursos conectados não são revertidos junto.

**GitHub.** Actions é gratuito em repositório público com runners padrão. Com exceção de um `GITHUB_TOKEN` somente-leitura, **segredos não são entregues a workflows disparados por fork**. Environments e regras de proteção estão disponíveis no plano Free para repositórios públicos. Uma branch protegida pode exigir verificação de um GitHub App específico. O evento `pull_request` executa sobre a referência de merge entre o head do PR e a base.

**Previews de fork.** A documentação da Cloudflare registra que commits e Pull Requests vindos de forks não criam preview. A frase está nos *known issues* do Pages e **não** na documentação do Workers Builds — registrada abaixo como incerteza, não como fronteira verificada.

**OIDC.** A Cloudflare não oferece OIDC nem *trusted publishing* para deploys via Wrangler; a ação oficial exige um token de API de longa duração. O pedido público está aberto desde novembro de 2025, sem resposta oficial até junho de 2026. Não é alternativa hoje; é gatilho.

**Merge queue.** Disponível em repositórios públicos pertencentes a uma organização. Este repositório pertence a uma conta de usuário, de modo que a alternativa é **eliminada por fato, não por julgamento**.

## Decisão

Adotar uma estratégia de CI/CD definida por **propriedades duráveis**, com **verificação declarada no repositório e publicação delegada à plataforma**, e com implantação escalonada por gatilhos.

### 1. Propriedades duráveis

Estas propriedades são a decisão. Qualquer implementação — atual ou futura — precisa satisfazê-las, e é por elas que uma alternativa deve ser avaliada.

#### Verificação

- **C1 — Toda verificação obrigatória deriva de uma garantia ou critério documentado do projeto, e sua justificativa é rastreável.** A origem pode ser um ADR, `conventions.md`, uma regra arquitetural aceita, um requisito de segurança documentado ou outro contrato normativo. **Nenhuma verificação entra apenas por convenção de mercado.**

  O conjunto é **aberto e cresce por derivação**, sem revisar esta decisão — que é exatamente o que G7.3 já permitia. A propriedade não exige um ADR por verificação: exige que a pergunta "de qual garantia isto deriva?" tenha resposta em uma linha.

- **C2 — Uma verificação só é elegível a bloquear o merge se sua falha for diagnosticável e reexecutável sem alterar o código.** É critério de promoção a obrigatória, não promessa sobre a disponibilidade de um fornecedor.

  A propriedade existe porque a proteção de `main` alcança administradores: uma verificação obrigatória instável não produz atrito, produz **travamento do repositório**, e o único desbloqueio seria desligar a proteção — precisamente a ação que `conventions.md` §11.8 proíbe e que o gatilho 2 do ADR-0004 identifica como corrosão do fluxo. C2 também separa o que uma suíte verde deve significar: falha de infraestrutura e falha de código não podem ser o mesmo sinal.

- **C3 — O que é verificado é o estado que será integrado, não apenas o estado da branch.** Sustenta a afirmação de G1 de que `main` permanece sempre publicável. Sem ela, cada Pull Request pode passar e `main` quebrar por conflito semântico, sem que nenhuma verificação tenha falhado.

#### Publicação

- **C4 — Produção é construída a partir de um commit que existe em `main`.** Preview e produção reconstroem separadamente; a equivalência entre eles vem de C5, e não de identidade de artefato.

- **C5 — As entradas que determinam o artefato são versionadas quando puderem ser, e registradas quando não puderem.** Concretamente: instalação congelada a partir do lockfile (`conventions.md` §2); versão do runtime de build fixada por arquivo no repositório; comando de build declarado no repositório. Qualquer campo residual que só exista na configuração do fornecedor é mantido como **indireção fina** para o que está versionado, e é registrado em `conventions.md`.

  **Nenhuma entrada capaz de alterar o artefato pode existir apenas fora do controle de mudanças sem estar registrada.** A redação é deliberada: o levantamento mostrou que parte da configuração de build da implementação inicial só existe no dashboard, e uma propriedade escrita como "tudo versionado" nasceria violada. Realiza o que D1 delegou.

- **C6 — Falha de build ou de deploy não altera o que está sendo servido, e é observável.** Cobre o que D5 não cobre: D5 é reversão deliberada; C6 é o deploy direto malsucedido. Sem ela, `main` pode divergir silenciosamente do que está publicado, e G1 vira afirmação não verificável.

#### Autoridade e segredos

- **C7 — A autoridade de publicar e de alterar ambiente é exercida apenas por caminho confiável, e código sob controle de um Pull Request não pode acessá-la nem exercê-la.**

  A automação **pode** deter autoridade; o que ela não pode é tornar essa autoridade **legível ou acionável** por código não revisado. A propriedade permite o desenho em que um Pull Request não confiável produz um artefato e um mecanismo confiável o publica, sem que a autoridade transite pelo código do Pull Request.

  Alcança Pull Request de fork, Pull Request do próprio repositório e — o caso mais provável em fluxo assistido por agentes — **Pull Request que altere a própria definição do pipeline**. É por isso que a propriedade não é sobre forks: um colaborador único também escreve código não revisado.

  Consequência que dispensa uma definição formal de "ambiente": se a autoridade não é alcançável pelo Pull Request, a garantia é verificável sem que se precise decidir se o executor de build "é" ou "não é" um ambiente.

- **C8 — Segredos são roteados por função, e cada função tem regra própria.**

  1. **Segredo de aplicação (runtime)** — lido pelo Worker em execução. Governado por **D9**.
  2. **Segredo de build** — lido durante o prerender. Governado por **D9** e por **C9**.
  3. **Credencial de automação** — detida pelo pipeline, autoriza publicar ou alterar ambiente. Governada por **C7**.

  A propriedade existe para impedir que "D9 já cobre" seja dito sobre a terceira classe. **D9 governa a segregação de segredos entre ambientes da aplicação; autoridade de automação governa quem pode publicar ou alterar um ambiente.** São eixos diferentes: um é sobre o que o código em execução consegue ler, o outro sobre quem consegue mudar o que está em execução. O mecanismo concreto de D9 permanece no gatilho 3 do ADR-0006 e **não é escolhido aqui**; a terceira classe é decidida agora porque é este ADR que a criaria.

- **C9 — Nenhum segredo de build sobrevive dentro do artefato publicado.** O artefato é pré-renderizado, estático e público (ADR-0006 §2). Um segredo lido durante o prerender e embutido na saída não está protegido — está publicado. D9 diz onde o segredo mora; C9 diz o que o build pode fazer com ele.

### 2. Reconstruir, e não promover

A pergunta — se produção deve promover o artefato já construído no preview ou reconstruir o commit — é decidida pelos fatos do repositório, e não por preferência.

| Propriedade | Reconstruir a partir de `main` | Promover o artefato do preview |
|---|---|---|
| **D1** — artefato corresponde a commit identificável | satisfeita: o commit é o de `main` | o commit é o head do Pull Request, que não existe em `main` e cuja branch é removida no merge |
| **D3** — preview pelo mesmo **processo** de build | satisfeita: D3 exige processo, não artefato | satisfeita |
| **D4** — identificar o commit de qualquer deployment | satisfeita: commit alcançável no repositório | o commit sobrevive apenas como referência da plataforma |
| **D5** — reverter sem rebuild | satisfeita: as versões anteriores foram construídas de `main` | satisfeita, mas sobre artefatos igualmente órfãos |

Promoção compra determinismo de artefato ao custo de rastreabilidade de commit. **Rastreabilidade é propriedade aceita; determinismo de artefato não é** — nenhum documento do projeto exige byte-identidade entre preview e produção. O que o projeto precisa é que "mesmo código" não permita builds divergentes e não rastreáveis, e isso se compra por C5.

O acoplamento à plataforma que a promoção introduziria é o mesmo que o ADR-0004 registrou nos contras ao aceitar que Issues e PRs vivam fora do repositório — mas ali foi aceito **porque não são conteúdo publicável**. Produção é.

### 3. Implementação inicial

A implementação abaixo é a escolha inicial para satisfazer C1–C9. Ela é **substituível**: trocar qualquer peça, mantendo as propriedades, não exige novo ADR.

**Verificação no GitHub Actions; build e publicação no Workers Builds.**

O argumento é uma propriedade, não conveniência: é a única forma levantada em que **a credencial de publicação nunca é criada** e, ao mesmo tempo, **a definição do portão de merge passa pelo portão de merge**. Automação nativa isolada deixa o comando de build fora do controle de mudanças (contra C5) e colapsa typecheck, teste e falha de infraestrutura num único sinal (contra C2). Actions realizando o deploy exigiria um token de longa duração da Cloudflare num cenário sem OIDC (contra C7, ou dependente de configuração para satisfazê-la).

Três consequências são parte da decisão, e não notas de rodapé:

- **O mesmo commit é construído duas vezes** — uma vez para verificar, outra para publicar. Aceito pelo argumento de §2: a equivalência vem de entradas controladas, não de identidade de artefato.
- **A verificação da Cloudflare não é uma verificação obrigatória de merge.** A armadilha do build pulado que não reporta check torna-a inelegível por C2. O portão é o CI; a falha de publicação é capturada por C6. Isso responde, invertida, a pergunta que o ADR-0006 §5 deixou aberta: **o deploy não bloqueia o merge.**
- **Nenhuma credencial da Cloudflare existe no repositório**, de modo que C7 é satisfeita por construção no eixo de publicação — a mesma manobra de D7 no ADR-0006.

O mecanismo de C3 é o comportamento padrão do evento `pull_request`, que já executa sobre a referência de merge. A corrida residual — a base avançar **depois** que a verificação rodou — é **aceita**, com C6 e D5 como contenção; o modo estrito, que exigiria branch atualizada antes do merge, fica reservado a gatilho. Merge queue não é alternativa neste repositório.

Convenções operacionais — nomes dos workflows, campos configurados no fornecedor, tratamento de barra final — ficam em `conventions.md` e **serão registradas quando o pipeline for efetivamente configurado**. Escrever convenção para arquivo inexistente é a antecipação que `architecture.md` §11, o ADR-0005 T10 e o ADR-0006 §3 recusam.

### 4. Escalonamento por gatilho

Nada é configurado por esta decisão.

| Momento | O que passa a existir |
|---|---|
| Agora | Apenas as propriedades. Sem workflow, sem conexão com a plataforma, sem segredo, sem alteração de proteção de branch. |
| Com o scaffold do TanStack Start | Primeiro conjunto derivável por C1: **typecheck** (ADR-0001, T1) e **build** (P2/P4 do ADR-0003, T1). Arquivo de versão de runtime e `wrangler.jsonc` versionados; repositório conectado ao Worker; `main` como branch de produção; builds de branch não-produtiva habilitados. |
| Primeiro código de `src/content/pipeline/` | Vitest instalado (`conventions.md` §12.1) e a suíte entra no conjunto obrigatório — o momento em que **T11 deixa de ser promessa parcial**. |
| Primeiro deploy real | Verificações promovidas a obrigatórias, filtradas por C2. Retenção de logs observada e registrada, fechando o que D4 delegou. |
| Primeiro segredo | Gatilho 3 do ADR-0006. O mecanismo de D9 é escolhido então, com o fato já levantado de que Wrangler Environments funcionam sob Workers Builds. C9 passa a ser exercida. |
| Primeiro fluxo E2E obrigatório | Playwright (T10), e onde executa e contra qual alvo (ADR-0006 §5). |

**Lint é respondido, não adiado: não agora.** O ADR-0005 §4 mandou o assunto para cá; o ADR-0002 condicionou o único lint relevante — o da escala de spacing — a **drift observado**, e não há código para driftar. É o exemplo trabalhado de C1: existe origem candidata, mas a origem é ela própria condicional, de modo que a verificação não deriva hoje. Nasce quando a necessidade for documentada.

### 5. Estreitamento explícito de D3

**Pull Request vindo de fork não recebe preview automático.** Nenhuma das formas levantadas o oferece: a plataforma não constrói preview para fork, e o caminho por Actions não tem segredos disponíveis em fork — sendo que a solução ingênua para contorná-lo é uma via conhecida de exposição de credencial.

O limite é registrado aqui, e não por reescrita do ADR-0006 (`conventions.md` §10), no mesmo espírito de ADR-0006 §4 e de T8: declarar o que não se cobre em vez de deixar a lacuna implícita. **Não é falha de C7** — é, ao contrário, a fronteira que a torna trivial nesse eixo.

### 6. Limites conhecidos

Registrados para não serem redescobertos como surpresa. Nenhum altera a decisão.

- **Parte da configuração de build só existe no dashboard do fornecedor.** É a violação parcial de C5 que a própria redação de C5 absorve, e é o preço da forma escolhida. Mitigação: manter os campos como indireção fina, de modo que a substância permaneça versionada, e registrá-los em `conventions.md`.
- **A ausência de preview para fork é documentada para o produto vizinho da mesma integração Git, e não para Workers Builds.** Enquanto não for confirmada, **não deve ser tratada como fronteira de segurança**. Hoje o risco é nulo porque não há segredo algum; a confirmação é pré-condição do primeiro segredo de build, junto da pergunta seguinte.
- **Não está documentado se variáveis e segredos de build do dashboard alcançam builds de branch não-produtiva.** É a lacuna de D9 na forma desta implementação, e é a incerteza mais consequente do conjunto. Como D9, é hoje vacuamente satisfeita e vira pré-condição, não consequência.
- **O comportamento de produção após um build falho não é afirmado na documentação.** É implicado pelo modelo de versões e deployments, mas C6 depende dele e a confirmação só acontece no primeiro deploy real.
- **A retenção de logs de build do fornecedor não foi encontrada.** D4 delegou a política de retenção a este ADR, e ela permanece aberta até a observação no primeiro deploy.
- **O comportamento ao esgotar os build minutes do plano gratuito não está documentado.** Relevante a D8, que exige parada dura em vez de faturamento. O ADR-0006 já havia registrado incerteza vizinha, e ela continua aberta.
- **Duas verificações independentes constroem o mesmo commit**, e um desalinhamento entre os dois ambientes de build é possível. C5 é a contenção; ela reduz a probabilidade, não a elimina.
- **G6 nomeia agentes de IA, e um workflow não é um agente.** A proibição de integrar, dar push em `main`, alterar proteção e manipular tags deve ser lida como aplicável a qualquer ator não-humano. Hoje a proteção de `main` já a garante mecanicamente.

### 7. Fora do escopo desta decisão

- **Reabrir a escolha de plataforma de deploy** (ADR-0006).
- **Uma lista congelada de verificações.** Este ADR define como uma verificação entra no conjunto obrigatório; não fixa o conjunto para sempre.
- **Automação de release, versionamento, tags e geração de changelog**, reservados a decisão própria pelo ADR-0004 §4.
- **Atualização automática de dependências** além de propor um Pull Request, o que contrariaria o ADR-0001 e `conventions.md` §2 ("deliberadas, não automáticas").
- **`commitlint`/`husky`, lint de nome de branch e limite de tamanho de Pull Request**, descartados no ADR-0004 e em `conventions.md` §11.2.
- **Threshold de cobertura**, recusado por T3.
- **Cache de build, matriz de execução e otimização de tempo de build.** Não há build para medir.
- **Monitoramento de erros e observabilidade de aplicação** (ADR-0007 §5), **analytics** (ADR-0007), **persistência** (`architecture.md` §8), **arquitetura do Playground e provedor de IA** (ADR-0008).
- **O mecanismo concreto de D9 para segredos de aplicação**, que permanece no gatilho 3 do ADR-0006.

## Consequências

### Prós

- **Fecha as três delegações abertas de uma vez.** "Configuração concreta de CI" (ADR-0004 §4, ADR-0005 §4) e "onde o build é executado" (ADR-0006 §5) deixam de ser pendências nomeadas em documentos aceitos.
- **Converte T11 de promessa parcial em mecanismo com data.** A suíte passa a integrar os critérios de merge no momento em que existir — e o momento está escrito.
- **C7 é satisfeita por construção, e não por configuração cuidadosa.** A credencial de publicação não é criada; a ausência de OIDC na plataforma passa de risco assumido a fato irrelevante. É o mesmo desfecho que D7 obteve no ADR-0006.
- **C1 dá forma verificável à recusa de checks por tradição**, sem transformar o diretório de ADRs em catálogo de verificações. O lint é a demonstração: a propriedade explica por que ele não entra hoje, em vez de apenas proibi-lo.
- **A escolha da forma eliminou duas incertezas em vez de acumulá-las.** Estabilidade do nome da verificação do fornecedor e modo de falha das políticas de ambiente deixaram de importar, porque a verificação do fornecedor não é obrigatória e não há segredo de ambiente a proteger.
- **C4 resolve uma questão que teria sido decidida em silêncio.** Sem ela, promover o artefato de preview seria a escolha mais natural e a mais barata — e teria quebrado D4 sem que nada sinalizasse.
- **Custo estruturalmente zero em ambos os medidores.** Verificação é gratuita em repositório público, e a publicação segue no plano sem excedente cobrável do ADR-0006.
- **Não gera confiança falsa.** §5 e §6 declaram o estreitamento de D3, a violação parcial de C5 e as incertezas não resolvidas, no mesmo espírito de T8 e de ADR-0006 §4.

### Contras e riscos

- **A implementação inicial não satisfaz C5 integralmente.** É o contra mais relevante: parte das entradas de build vive fora do controle de mudanças, e alterá-las não passa por Pull Request nem por leitura humana — exatamente o que G2 e G3 existem para impedir. A propriedade absorve o fato em vez de negá-lo, o que é honesto e também é uma concessão real.
- **Duas superfícies operacionais em vez de uma.** Diagnosticar uma falha pode exigir olhar em dois lugares, e uma publicação pode falhar depois que todas as verificações passaram. É o preço de não criar a credencial.
- **A corrida residual de C3 é aceita, não resolvida.** `main` pode quebrar após o merge de um Pull Request verde. A probabilidade é baixa com um mantenedor e um Pull Request por vez, e a contenção é C6 mais D5 — mas o risco é real e foi escolhido em vez de eliminado.
- **C2 depende de julgamento.** "Diagnosticável" e "reexecutável sem alterar o código" são avaliados por leitura, não por ferramenta — a mesma fragilidade já aceita em ADR-0002, ADR-0003 e ADR-0005.
- **A distinção de C8 depende de disciplina.** Nada impede tecnicamente que um segredo seja introduzido na classe errada; a garantia é mantida por review, no regime em que ADR-0008 mantém PG5.
- **Parte do levantamento envelhece rápido.** Limites de plano e o estado do suporte a OIDC são o insumo menos durável. Por isso nenhuma propriedade depende de um número, e mudança de plano é gatilho, não premissa.
- **Quatro incertezas permanecem abertas**, duas delas na fronteira de confiança. Elas não bloqueiam a decisão porque não há segredo algum hoje, mas bloqueiam a afirmação de que a fronteira está verificada.
- **A forma escolhida é mais difícil de explicar do que qualquer uma das puras.** Um leitor futuro que encontre verificação num lugar e publicação em outro precisará deste documento para entender por quê — e a explicação não é "melhor das duas", é uma propriedade específica sobre autoridade.

## Gatilhos de reavaliação

Cada gatilho é uma necessidade ou problema concreto e observável.

1. **A corrida residual de C3 se materializar** — `main` quebrar após o merge de um Pull Request verde. Reabre o modo estrito, hoje descartado por atrito desproporcional.
2. **Drift documentado em regra mantida por convenção** — escala de spacing, P5, P6. É o gatilho que faz o lint nascer por C1, e não por tradição.
3. **Introdução do primeiro segredo** — herda o gatilho 3 do ADR-0006, e acrescenta a confirmação exigida por §6 antes que qualquer segredo de build exista.
4. **Contribuições externas via fork se tornarem necessidade real** — reabre o estreitamento de D3 registrado em §5.
5. **A plataforma passar a oferecer credenciais efêmeras ou OIDC** — muda o cálculo de C7 e reabre a forma, tornando viável concentrar verificação e publicação num só lugar.
6. **Verificação obrigatória bloquear o fluxo por instabilidade** — sinal de que a promoção violou C2, e de que o conjunto obrigatório está errado.
7. **Consumo de build minutes deixar de ser irrelevante**, ou o comportamento no limite se revelar diferente de parada dura — reabre D8.
8. **A configuração fora do controle de mudanças crescer além de indireção fina** — momento em que C5 deixa de absorver o fato e passa a ser violada, exigindo revisão da forma.
9. **Deixar de haver um único mantenedor** — muda as premissas de C2 e C3, e torna viável o que ADR-0004 já registrou como inviável hoje.

Reavaliação gera **novo ADR**. Este documento não é reescrito para alterar a decisão histórica, conforme `conventions.md` §10.

## Alternativas consideradas

- **Automação nativa da plataforma isolada**, sem nada declarado no repositório — a forma mais simples, sem arquivo de workflow para manter e com preview e publicação prontos. Descartada por dois motivos que atingem garantias, não ergonomia. Primeiro, **o portão não seria governado pelo portão**: o comando de build e as variáveis vivem fora do controle de mudanças, de modo que alterar o mecanismo que impõe G2 e G3 não passaria por Pull Request nem por leitura humana — e essas entradas influenciam o artefato, o que D1 exige que seja identificável e controlado. Segundo, **o build seria o único sinal**: typecheck, teste e falha de infraestrutura colapsariam em "build failed", contra C2, cuja consequência é agravada pela proteção de `main` alcançar administradores. A forma escolhida preserva a maior parte das vantagens desta e paga apenas pelo que ela não pode dar.
- **Verificação e publicação inteiramente no GitHub Actions** — a alternativa mais forte em C5, com tudo declarado em arquivo versionado e passando por Pull Request, e com verificações granulares e individualmente reexecutáveis. Descartada porque **obriga a criar uma credencial de publicação de longa duração**: a plataforma não oferece OIDC nem *trusted publishing*, e o pedido está aberto há nove meses sem resposta oficial. A mitigação existe e é documentada — token escopado, com prazo de validade, atrás de um ambiente restrito à branch de produção —, mas ela **governa** um risco que a alternativa escolhida **não cria**. Registra-se ainda que esta forma não é melhor em preview de fork: sem segredos disponíveis, o preview de fork é igualmente impossível, e o caminho usual para contorná-lo é uma via conhecida de exposição de credencial. **Seria a recomendação no dia em que o gatilho 5 for acionado.**
- **Promover a produção o artefato construído no preview**, em vez de reconstruir — daria identidade byte a byte entre o que foi revisado e o que foi publicado, que é a formulação mais intuitiva de "mesmo código". Descartada por §2: com squash e remoção de branch, o commit que produziu esse artefato não existe em `main` e é inalcançável no repositório depois do merge, o que tornaria a rastreabilidade de produção dependente da plataforma, contra D4. Nenhuma propriedade aceita exige identidade de artefato; D3 exige o mesmo **processo**.
- **Merge queue** para satisfazer C3 de forma completa — resolveria a corrida residual sem depender de branch atualizada. **Eliminada por fato**: exige repositório pertencente a uma organização, e este pertence a uma conta de usuário.
- **Modo estrito, exigindo branch atualizada antes do merge** — satisfaria C3 sem lacuna. Descartado nesta fase por atrito desproporcional a um mantenedor único com um Pull Request por vez, quando o mecanismo padrão já verifica a referência de merge e cobre o caso dominante. Permanece disponível pelo gatilho 1.
- **Adotar lint agora**, aproveitando a montagem do pipeline — seria barato e é o que a maioria dos projetos faz nesta etapa. Descartado por C1 e pelo ADR-0002, que condicionou o lint relevante a drift observado: não há código, não há drift, e uma verificação sem origem derivável é precisamente o que C1 recusa.
- **Adiar a decisão** até existir aplicação. Seria coerente com "sem infraestrutura antecipada" e é fácil de defender superficialmente. Descartada porque a pendência já bloqueia garantias aceitas — T11 permanece promessa parcial, G7.3 permanece vazio e D2 e D3 permanecem sem mecanismo — e porque adiar não evita o risco de decidir cedo: apenas transfere o custo para o momento em que a Fase 1 do roadmap estiver em andamento. O escalonamento de §4 é o que separa decidir de configurar.
- **Registrar as ferramentas como parte da decisão**, em vez de como implementação inicial — descartada por acoplar garantias arquiteturais a produtos. As propriedades C1–C9 são a decisão; a divisão entre verificação e publicação é implementação substituível sem revisar este ADR, no mesmo corte que ADR-0003, ADR-0004, ADR-0005, ADR-0006 e ADR-0007 aplicaram às suas.

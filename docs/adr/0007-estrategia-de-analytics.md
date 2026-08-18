# ADR-0007 — Estratégia de Analytics

## Status
Proposto

## Contexto

`architecture.md` §12 registra "Analytics" como decisão pendente, e §6 a lista entre as integrações possíveis. O ADR-0006 a adiou duas vezes de forma explícita: §5 a mantém fora de escopo, e a nota de D4 registra que "analytics de audiência é decisão separada".

Diferente do ADR-0006, **esta pendência não bloqueia nenhuma garantia aceita.** Nada em ADR-0001 a ADR-0006 depende de analytics existir. Isso muda a natureza da decisão: não se trata de destravar, e sim de **evitar que a decisão seja tomada por omissão**.

O roadmap coloca Analytics na Fase 4. O risco de decidir agora é antecipação, contra `architecture.md` §11. O risco de não decidir é diferente e mais provável: o primeiro artigo publicado chega sem resposta acordada, e a decisão acaba sendo tomada pelo que for mais rápido de colar na página — que é, historicamente, o Google Analytics. Decidir a estratégia agora e **instalar por gatilho** resolve os dois lados, na mesma manobra que o ADR-0005 aplicou ao Playwright (T10) e o ADR-0006 à segmentação de segredos (§3).

### O que esta decisão precisa responder

O propósito foi fechado com o engenheiro antes da redação: **feedback editorial**. Quais conteúdos são efetivamente lidos e por onde os leitores chegam — a única pergunta cuja resposta muda uma decisão concreta ("sobre o que escrevo em seguida").

Dois propósitos adjacentes foram considerados e recusados como motor da decisão:

- **Prova de alcance** para terceiros — não exige nada além do que o propósito principal já produz.
- **Analytics do Playground IA** (Fase 3), que exigiria eventos com propriedades. É **necessidade futura reconhecida**, e a implementação inicial não precisa atendê-la. Ela influencia a decisão em um único ponto: torna a substituibilidade uma propriedade obrigatória, não um conforto.

### Restrições herdadas de decisões aceitas

Esta não é uma escolha em campo aberto. Quatro decisões já eliminam categorias inteiras antes de qualquer comparação de produto:

- **ADR-0006 §2 e D7** — o artefato é pré-renderizado e servido como ativo estático; requisição que casa com um ativo não invoca o Worker. Qualquer coleta server-side converteria requisição gratuita em invocação, e ligaria o runtime por necessidade que não é concreta.
- **ADR-0006 D8** — custo previsível, cujo modo de falha é parar em vez de faturar em aberto.
- **`architecture.md` §6 e §11** — integrações isoladas da lógica principal, sem dependência excessiva de serviços externos.
- **ADR-0006 §4** — a atração pelos primitivos da própria Cloudflare já foi nomeada como "o vetor concreto de ameaça a D6". Isso pesa contra a opção que, à primeira vista, seria a mais conveniente aqui.

### O público torna a medição estruturalmente imprecisa

`vision.md` declara como consumidores "engenheiros e recrutadores". Engenheiros bloqueiam scripts de analytics em taxa muito acima da média, e o efeito é assimétrico: **a subcontagem atinge justamente o segmento que mais interessa medir.**

O autor do GoatCounter publica a própria estimativa: *"By my estimate about a third of pageviews are missed due to adblockers; but this can vary greatly on the type of site and audience."* Um terço é ordem de grandeza, não margem de erro — e o público deste projeto é mais adverso que a média que produziu esse número.

Existem apenas dois contornos, e ambos são recusados nesta decisão:

1. **Proxy first-party do beacon** pelo próprio domínio — invoca o Worker a cada evento e destrói a forma do artefato definida em ADR-0006 §2. **Derrotar o bloqueio custa exatamente a arquitetura estática.**
2. **Coleta por log de servidor** — não existe servidor por requisição, e o resultado seria inflado por tráfego automatizado.

A consequência não é escolher outra ferramenta: é **calibrar a expectativa dentro da própria decisão** (A8).

### Levantamento técnico (ago/2026)

Verificado em documentação oficial dos fornecedores, exceto onde marcado como fonte secundária.

**Cloudflare Web Analytics.** Gratuito em todos os planos. Sem identificador persistente no cliente e sem fingerprinting; não existe conceito de visitante único — conta-se pageview originado de evento distinto de navegação ou referral, e IP e User-Agent são usados no cálculo e descartados. Dimensões: Country, Host, **Path**, **Referer**, Device type, Browser, OS, Site, Navigation type e Exclude Bots — suficiente para o propósito editorial. Eventos customizados: *"Not yet, but we may add support for this in the future."* Retenção: *"We retain unsampled beacon data for the past 7 days, after this point data is aggregated down to around 10%"*, com acesso a seis meses. Instalação: *"You can only use the automatic setup with JS snippet injection if traffic to your domain is proxied through Cloudflare (orange-clouded). If you have a DNS-only domain, you will have to do a manual setup instead."* No modo manual o beacon reporta a `cloudflareinsights.com/cdn-cgi/rum`. A própria documentação reconhece que o beacon é bloqueado por Adblock Plus, Brave e pela extensão do DuckDuckGo.

**GoatCounter.** Hospedado gratuito, sustentado por doação: *"GoatCounter.com is currently offered for free for reasonable public usage. Running your personal website or small-to-medium business on it is fine, but sending millions of pageviews/day isn't."* Fontes secundárias citam 100.000 pageviews/mês para uso não-comercial e um plano Business de US$ 15/mês sem aplicação automática — **não confirmado em fonte oficial**. Privacidade: *"In short, GoatCounter doesn't store IP addresses, the full User-Agent header, or any tracker ID."* A sessão é mantida **apenas em memória por até 8 horas** (site + IP + User-Agent mapeados para uma string aleatória) e nunca persistida. Métricas: pageviews por path, referrers e campanhas, browser, sistema operacional, país, idioma e largura de tela. Eventos customizados: sim, via `count()` com `event: true` e via `data-goatcounter-click`, com o `path` funcionando como nome do evento. Peso: *"adds just ~3.5K of extra data to your site."* Infraestrutura na União Europeia (Alemanha); código sob EUPL-1.2, com self-host possível. Sobre consentimento, a posição declarada é que *"probably doesn't require a GDPR consent notice"*, acompanhada da ressalva de que *"the GDPR is fairly new, and lacks case law to clarify what exactly counts as identifiable personal data"*. Retenção não documentada; backups retidos por até 30 dias após exclusão. Permite, **opcionalmente**, registrar pageviews individuais. Mantido por uma única pessoa.

**Umami Cloud.** Plano Hobby gratuito: 100.000 eventos/mês, 3 sites, 6 meses de retenção; plano Pro a US$ 20/mês. Sem cookies, sem fingerprinting e sem rastreamento cross-site, com **IP hasheado** em vez de armazenado — há divergência real entre juristas sobre se IP hasheado permanece dado pessoal sob interpretação europeia. Eventos customizados com propriedades, o mais forte dos avaliados nesse ponto. Hospedagem: *"Umami Cloud servers are located in the US and EU and adhere to GDPR and CCPA regulations."* Portabilidade: *"all of your data can be exported from Umami Cloud"*, com código aberto e self-host disponível. **O comportamento ao atingir o teto de 100.000 eventos/mês não está documentado oficialmente**; fonte secundária afirma que o usuário "move to a paid plan", formulação ambígua entre parar de coletar e cobrar.

**Plausible.** Sem tier gratuito permanente — apenas teste de 30 dias. Plano Starter a US$ 9/mês para 10.000 pageviews/mês, com dados processados e hospedados exclusivamente na União Europeia.

## Decisão

Adotar uma estratégia de analytics definida por **propriedades duráveis**, com **coleta cookieless e agregada em ponto único de injeção**, **instalação condicionada a gatilho** e **GoatCounter como implementação inicial substituível**.

### 1. Propriedades duráveis

Estas propriedades são a decisão. Qualquer implementação — atual ou futura — precisa satisfazê-las, e é por elas que uma alternativa deve ser avaliada.

#### Privacidade

- **A1 — Nenhum dado pessoal e nenhum identificador persistente.** Sem cookie, sem `localStorage` ou `sessionStorage` de identidade, sem fingerprinting, sem rastreamento cross-site. IP e User-Agent não são armazenados.

  A ausência de banner de consentimento é **objetivo de projeto, não efeito colateral**. Um banner introduziria componente de UI, estado de consentimento, gate de carregamento e uma funcionalidade inteira no roadmap — custo desproporcional ao valor do propósito editorial, e contra a preferência por simplicidade de `vision.md`.

- **A2 — Somente agregado.** Nenhum visitante individual é reconstruível. Sem jornada por usuário, sem session replay, sem registro de pageview individual.

  A propriedade não é redundante com A1, e a distinção tem consequência prática: **A1 governa o que entra; A2 governa o que o produto permite reconstruir.** Existem ferramentas cookieless que ainda assim oferecem trilha por sessão — o próprio GoatCounter permite, opcionalmente, gravar pageviews individuais. **A2 proíbe habilitar esse modo.**

#### Arquitetura

- **A3 — Medir não invoca o runtime servidor em requisição de conteúdo.** Preserva a forma do artefato de ADR-0006 §2 e as propriedades D7 e D8: requisição de conteúdo continua sendo requisição a ativo estático.

  A mordida concreta é específica e vale registrá-la: **A3 proíbe o proxy first-party do beacon**, que é a técnica usual para escapar de bloqueadores. O trade-off é recusado aqui e assumido em A8.

- **A4 — O acoplamento é confinado a um ponto único e é unidirecional.**

  *Confinado:* existe **um** ponto de injeção, no documento raiz. Nenhuma chamada de analytics em componente, rota, loader ou lógica de domínio. Remover analytics é deletar esse ponto. Isso vale inclusive para eventos customizados, caso venham a existir — eles não autorizam espalhar chamadas de rastreamento pela aplicação.

  *Unidirecional:* **a aplicação nunca lê dados de analytics.** Nada em `src/` consome a API do fornecedor, em build ou em runtime. Isso barra o vetor concreto de erosão neste projeto: um bloco de "posts mais lidos" transformaria um serviço externo em dependência de renderização, contra `architecture.md` §6 e contra a forma do artefato de ADR-0006 §2.

  **A4 não é D6 e não afirma satisfazê-la.** D6 governa a plataforma de deploy e exige acoplamento fora de `src/`; sem domínio próprio, analytics necessariamente coloca uma linha nomeando o fornecedor dentro de `src/`. A4 é a propriedade análoga com a garantia que é de fato alcançável — superfície mínima, localizada e reversível. Declarar a diferença é preferível a afirmar uma conformidade falsa, no mesmo espírito do ADR-0006 §4.

- **A5 — Falha de analytics é invisível e nunca bloqueia render.** Carregamento assíncrono, sem impacto em layout e sem bloqueio de renderização. A página é integralmente funcional com o script bloqueado, fora do ar ou removido.

  Combinada com A8, isto significa que **o script bloqueado é o caso esperado, não o caso de erro.**

#### Custo

- **A6 — Analytics não pode gerar cobrança automática ou variável.** Ao atingir qualquer limite gratuito, a coleta deve **parar** ou exigir **ação humana explícita** antes da geração de qualquer custo.

  A propriedade é **mais estrita que D8**, e deliberadamente. D8 aceita "parar de servir" como modo de falha; A6 proíbe também o **upgrade automático**, que não é excedente cobrado mas produz o mesmo resultado — custo sem decisão humana.

  A6 é sobre o **modelo de relação comercial, não sobre o tamanho do tier**. É o que faz um limite de 100.000 eventos ser aceitável e um upgrade automático não ser, independentemente do valor envolvido.

#### Régua e valor

- **A7 — Cada métrica coletada por instrumentação própria deriva de uma pergunta que muda uma decisão.** Com o propósito editorial fixado, o conjunto mínimo é **pageview por rota** e **referrer**. Nada além disso é adicionado sem uma pergunta associada.

  A formulação é deliberada: **a propriedade governa o que instrumentamos, não os campos que a ferramenta coleta por padrão.** Todo candidato avaliado coleta país, navegador, sistema operacional e largura de tela sem opção prática de desligar; escrever A7 como "nada além do conjunto mínimo é coletado" produziria uma propriedade violada no primeiro dia. O que ela proíbe é **adicionar** coleta por precaução.

- **A8 — Os números são direcionais, não exatos.** A medição client-side subconta na ordem de **um terço**, e provavelmente mais neste projeto. Decisão baseada em analytics é decisão sobre **proporção entre páginas**, nunca sobre volume absoluto e nunca sobre variação pequena.

  A propriedade existe pelo mesmo motivo que T8 no ADR-0005: **impedir que o instrumento produza confiança que ele não sustenta.**

#### Momento

- **A9 — Instalação por gatilho.** Nada é instalado antes de existirem, simultaneamente, **conteúdo publicado** e **distribuição externa**. Antes disso, a ferramenta mede o próprio autor.

  Corolário explícito: **até o gatilho, a ausência de analytics não é lacuna** — é a decisão sendo cumprida. Mesma manobra de ADR-0005 T10 e ADR-0006 §3.

### 2. Efeito sobre a régua de testes

Esta decisão **não cria obrigação nova de teste**. A4 mantém analytics como ponto único de injeção, que o ADR-0005 T3 classifica explicitamente como "wrapper fino sobre biblioteca" — não obrigatório. Se eventuais eventos customizados vierem acompanhados de lógica de decisão própria, T3 volta a se aplicar por conta própria, sem que este ADR precise dizê-lo.

### 3. Implementação inicial

A implementação abaixo é a escolha inicial para satisfazer A1–A9. Ela é **substituível**: trocar de fornecedor, mantendo as propriedades, não exige novo ADR.

**GoatCounter**, hospedado, instalado apenas quando o gatilho de A9 ocorrer.

Três argumentos sustentam a escolha, e todos são consequência das propriedades, não de preferência:

- **A6 por construção.** Não existe relação de cobrança a ser acionada. Nos demais candidatos gratuitos, A6 depende de confiar no comportamento de um teto; aqui ela é satisfeita porque não há mecanismo de faturamento envolvido.
- **A1 no ponto mais forte disponível.** É o único candidato que não armazena IP nem User-Agent em forma alguma, com sessão mantida em memória por até 8 horas e nunca persistida. Isso evita por completo a discussão sobre IP hasheado como dado pessoal — e privacidade é o critério declarado de maior peso nesta decisão.
- **A8 já é a postura do fornecedor.** É o único que publica a própria estimativa de subcontagem em vez de sugerir precisão. Um instrumento que declara o próprio erro é o instrumento coerente com a propriedade.

Como consequência de A2, o registro opcional de pageviews individuais **permanece desligado**.

O suporte a eventos customizados existe e é básico. Ele **não é motivo da escolha** e não deve ser lido como atendimento ao propósito do Playground IA, que segue fora de escopo.

**Umami Cloud é candidato condicional, não substituto designado.** A distinção é consequência direta de A6: enquanto o comportamento ao atingir o teto de 100.000 eventos/mês não for verificado de forma conclusiva, ele não é adotável. A verificação necessária é uma pergunta única — *ao atingir o limite, a coleta para, ou ocorre upgrade e cobrança sem ação humana?* Se for a segunda, o candidato **sai da lista**; não vira exceção.

Convenções operacionais — onde exatamente o snippet é inserido no documento raiz, e o tratamento de ambiente de desenvolvimento e preview — ficam em `conventions.md` e **serão registradas quando o analytics for efetivamente instalado**. Não existe aplicação nem documento raiz no repositório; escrever convenção para arquivo inexistente é a antecipação que `architecture.md` §11 e o ADR-0005 T10 recusam.

### 4. Limites conhecidos da implementação inicial

Registrados para não serem redescobertos como surpresa. Nenhum altera a decisão.

- **A implementação inicial não satisfaz D6**, e nenhuma alternativa avaliada satisfaria. Sem domínio próprio proxied, o snippet nomeando o fornecedor vive no documento raiz, dentro de `src/`. A4 limita a superfície a uma linha; não a elimina.

- **O limite do plano gratuito é qualitativo, não numérico.** *"Reasonable public usage"* não é verificável de antemão, e o número de 100.000 pageviews/mês circulante em fontes secundárias não foi confirmado oficialmente. Na prática o risco é baixo — a Fase 1 do roadmap não produz volume próximo disso —, mas a incerteza é real e assumida.

- **A cláusula de uso comercial tem a mesma forma que motivou a rejeição da Vercel no ADR-0006** — elegibilidade gratuita condicionada a decisões editoriais futuras, como patrocínio ou doação. A assimetria de peso é o que justifica decidir diferente, e precisa ser explícita: lá a migração custava plataforma, URLs e identidade acumulada; aqui A4 reduz a troca à deleção de uma linha. **É a mesma forma com um custo de saída de ordem completamente diferente**, não uma inconsistência de critério.

- **Mantenedor único e serviço custeado por doação.** Risco de continuidade real, mitigado por A4 e pela licença EUPL-1.2, mas não eliminado. Self-host não é mitigação utilizável neste projeto: o ADR-0006 já descartou responsabilidade de infraestrutura própria pelo mesmo argumento que descartou VPS.

- **Retenção não documentada.** Não se sabe por quanto tempo o serviço hospedado mantém dados. Imaterial sob A7 e A8 — nenhuma decisão do projeto depende de série histórica longa —, e registrado como incerteza assumida.

- **Um terço dos pageviews não será contado**, e provavelmente mais. É limite da estratégia inteira, não deste fornecedor, e está formalizado em A8.

### 5. Fora do escopo desta decisão

- **Instalar ou configurar qualquer ferramenta de analytics.** A9 é o gatilho, e ele não ocorreu.
- **Dashboard público de métricas** e **página pública de transparência sobre o que é coletado**. Ambos são coerentes com a tese do projeto, e nenhum dos dois é necessidade concreta hoje.
- **Portabilidade do histórico como propriedade durável.** É critério de avaliação de alternativas e gatilho de reavaliação — mesmo corte que o ADR-0006 aplicou a domínio próprio.
- **Analytics do Playground IA** (Fase 3), que exigirá eventos com propriedades e é decisão própria.
- **A Newsletter da Fase 4**, que processa e-mail e portanto dado pessoal. Este ADR não a governa, e **A1 não deve ser lida como se a cobrisse**.
- **Monitoramento de erros e observabilidade de aplicação**, que respondem a outra pergunta e têm outro perfil de privacidade.

## Consequências

### Prós

- **Fecha a pendência sem instalar nada.** A decisão existe antes do primeiro artigo, e nenhuma infraestrutura é montada para necessidade que ainda não ocorreu.
- **Elimina uma funcionalidade inteira do roadmap.** A1 torna o banner de consentimento desnecessário por construção, e com ele somem componente de UI, estado de consentimento e gate de carregamento.
- **Custo estruturalmente zero, com A6 satisfeita por construção** e não por confiança no comportamento de um teto.
- **Preserva a forma do artefato de ADR-0006 §2.** A3 mantém requisição de conteúdo como requisição a ativo estático, e recusa explicitamente o único contorno que a quebraria.
- **Não gera confiança falsa.** A8 fixa a leitura correta dos números antes que exista o primeiro número, e A4 declara não satisfazer D6 em vez de sugerir conformidade.
- **A decisão sobrevive à troca de fornecedor.** As garantias estão em A1–A9; GoatCounter é implementação substituível sem revisar este ADR — mesmo corte que ADR-0003, ADR-0004, ADR-0005 e ADR-0006 aplicaram às suas.
- **O caminho para o Playground IA fica aberto sem nada montado hoje.** A4 mantém a troca barata quando eventos com propriedades passarem a ser necessários.

### Contras e riscos

- **A implementação inicial não satisfaz D6**, e nenhuma alternativa satisfaria sem domínio próprio. É o contra estrutural desta decisão.
- **O limite gratuito é qualitativo e a cláusula comercial é condicional**, exatamente a forma de dependência que o ADR-0006 rejeitou na Vercel. Aqui o custo de saída é baixo, mas o formato é o mesmo, e reconhecê-lo é parte da decisão.
- **Continuidade depende de uma pessoa e de doações.** É o risco mais provável de se materializar entre todos os registrados.
- **Um terço dos dados não existe.** A estratégia aceita medir mal de propósito, em troca de privacidade e da arquitetura estática. Se em algum momento uma decisão real exigir precisão, esta decisão não a fornece — e o gatilho 4 é o caminho, não um contorno silencioso.
- **Nenhum histórico é garantido.** Retenção não documentada somada à possibilidade de troca de fornecedor significa que a série longa pode simplesmente não existir. Aceito porque A7 não faz nenhuma decisão depender dela.
- **Parte do levantamento envelhece rápido.** Preços, limites e termos de uso são o insumo menos durável desta decisão. Por isso nenhuma propriedade depende de um número específico.
- **A decisão adiciona um serviço externo** a um projeto cuja arquitetura pede o contrário (`architecture.md` §11). A mitigação é a superfície: uma linha, removível, que nada em `src/` consome.

## Gatilhos de reavaliação

Cada gatilho é uma necessidade ou problema concreto e observável.

1. **Playground IA exigir eventos com propriedades** — avalia Umami Cloud ou equivalente, **condicionado à verificação de A6**. Se houver upgrade ou cobrança sem ação humana, o candidato está fora.
2. **O histórico passar a ter valor que a migração perderia** — é neste momento que a portabilidade deixa de ser critério de avaliação e vira requisito, e não antes.
3. **GoatCounter passar a exigir plano pago, questionar o uso do projeto, degradar o serviço ou ser descontinuado** — reabre a escolha de fornecedor, sem reabrir as propriedades.
4. **A subcontagem deixar de ser aceitável para uma decisão concreta** — reabre o trade-off de A3, com o custo da arquitetura estática explícito na mesa. Não é autorização para contornar A3 silenciosamente.
5. **Passar a existir domínio próprio proxied na Cloudflare** — analytics de borda, server-side e não-bloqueável, torna-se opção sem custo adicional. Reabre a comparação; não obriga a trocar.
6. **Surgir necessidade de processar dado pessoal** — newsletter, autenticação ou formulário. Sai do escopo de A1 e exige decisão própria, não a extensão silenciosa desta.

Reavaliação gera **novo ADR**. Este documento não é reescrito para alterar a decisão histórica, conforme `conventions.md` §10.

## Alternativas consideradas

- **Não adotar analytics algum.** É a alternativa mais barata e a mais fácil de defender contra `architecture.md` §11 — custo, código e superfície de privacidade iguais a zero. Descartada porque elimina o único ciclo de feedback disponível para uma das metas centrais de `vision.md` ("construir em público"), e porque não decidir não é neutro: transfere a decisão para o momento de menor deliberação. Vale notar que **A9 preserva quase todo o benefício desta alternativa** — na prática, nada existe até o gatilho.

- **Cloudflare Web Analytics** — a alternativa mais conveniente, gratuita, ilimitada e já dentro da conta usada para deploy. Descartada por três fatos somados. **Não suporta eventos customizados** (*"Not yet"*), o que a inviabiliza como caminho para o Playground IA. **Retém dado não amostrado por apenas 7 dias**, agregando a cerca de 10% depois — o que torna incompatíveis "trocar de ferramenta um dia" e "ter histórico". E, decisivo para a comparação, **sem domínio próprio proxied a injeção automática não está disponível**, de modo que o snippet manual acaba dentro de `src/` como em qualquer concorrente: some a única vantagem estrutural que ela teria. Some-se que escolhê-la aprofundaria a concentração no provedor que o próprio ADR-0006 §4 nomeou como vetor de erosão de D6. **Voltaria a ser candidata caso exista domínio próprio proxied** (gatilho 5).

- **Umami Cloud** — a mais forte para o propósito futuro do Playground, com eventos com propriedades, exportação completa de dados, seis meses de retenção documentada e continuidade sustentada por planos pagos. **Não descartada: mantida como candidato condicional.** O que a impede hoje é A6 — o comportamento ao atingir 100.000 eventos/mês não é documentado, e a formulação disponível em fonte secundária é ambígua entre parar de coletar e migrar para plano pago. Secundariamente, armazena IP hasheado, sobre o qual não há consenso jurídico quanto a ser dado pessoal, o que a deixa um degrau abaixo em A1.

- **Plausible, Fathom e equivalentes pagos** — melhores em ergonomia, hospedagem europeia e maturidade. Descartados por **não terem tier gratuito permanente**: o Plausible oferece apenas teste de 30 dias, com o plano mais barato a US$ 9/mês. Mensalidade recorrente é desproporcional para um site sem tráfego, e o critério é de custo, não de capacidade. Permanecem como caminho legítimo caso o gatilho 3 ocorra.

- **Google Analytics 4** — descartado sem comparação detalhada. Usa cookies e identificadores persistentes, o que exige banner de consentimento e reintroduz a funcionalidade que A1 existe para evitar; viola A2; e é incoerente com a tese pública do projeto. Registrado porque é a escolha default do setor, e o silêncio sobre ela seria lido como esquecimento.

- **Coleta própria via Worker, Workers Analytics Engine ou processamento de logs.** Descartada por violar A3, consumir orçamento de invocação contra D8, produzir código que o ADR-0005 T3 tornaria obrigatoriamente testado, e transformar o projeto em controlador de endereços IP — dado pessoal, com todas as obrigações associadas. É também a "abstração caseira crescente" que o ADR-0003 já registrou como risco assumido em outra camada; repeti-lo aqui seria assumir o mesmo risco sem o mesmo motivo.

- **Self-host de qualquer ferramenta open source.** Resolveria bloqueio por adblocker e continuidade de uma só vez. Descartada pelo mesmo argumento com que o ADR-0006 descartou VPS: introduz responsabilidade de infraestrutura sem requisito que a justifique, contra `architecture.md` §1 e §11.

- **Proxy first-party do beacon** para escapar de bloqueadores. Descartada por A3: converteria requisição de conteúdo em invocação de Worker e desfaria a forma do artefato definida em ADR-0006 §2. A precisão adicional não vale a arquitetura.

- **Registrar o fornecedor como parte da decisão**, em vez de como implementação inicial — descartada por acoplar uma garantia arquitetural a um produto, no mesmo corte que os quatro ADRs anteriores aplicaram às suas escolhas.

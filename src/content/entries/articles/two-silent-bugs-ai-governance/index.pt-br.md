---
title: "Dois bugs silenciosos. Um antes de o código existir, outro depois que tudo estava verde."
description: "Dois bugs silenciosos no Developer OS foram pegos em estágios opostos: um durante o planejamento, antes de existir qualquer código; outro depois que testes, build e deploy já estavam verdes. O que esses casos me ensinaram sobre revisão independente e orquestração de agentes de IA."
publishedAt: "2026-09-27"
---

# Dois bugs silenciosos. Um antes de o código existir, outro depois que tudo estava verde.

Existe uma sensação particularmente confortável no desenvolvimento de software quando tudo fica verde.

Os testes passam.  
O typecheck passa.  
O build termina sem erros.  
A aplicação sobe.  
As páginas funcionam.

É tentador ler esse conjunto de sinais como uma conclusão:

**está correto.**

Enquanto construía o Developer OS, dois casos diferentes me mostraram por que eu tento não tirar essa conclusão.

Em um deles, o código já estava implementado e tinha passado por testes, build, deploy e verificações manuais.

No outro, o código ainda nem existia.

Os dois escondiam um defeito capaz de produzir resultados errados sem necessariamente gerar um erro visível.

E os dois foram pegos em pontos diferentes do processo de revisão.

## Caso 1 — Tudo estava verde, mas conteúdo podia sumir em silêncio

Em setembro de 2026, eu estava construindo o **Projects v1**, o segundo tipo de conteúdo do Developer OS.

O Blog já tinha um pipeline de conteúdo baseado em Markdown. Projects reaproveitaria só as partes que agora tinham um segundo consumidor real, mantendo separados os componentes específicos de cada tipo de conteúdo.

A implementação estava pronta e passou por uma rodada de verificações bem completa:

- testes automatizados;
- typecheck;
- build;
- deploy na Cloudflare;
- verificação manual das rotas;
- inspeção da saída do prerender;
- verificações da fronteira entre build e runtime;
- testes de regressão do Blog.

Tudo estava verde.

Aí veio a revisão de código independente.

E ela encontrou um problema no mecanismo compartilhado de descoberta de conteúdo.

### O problema

Para decidir se um diretório representava uma entrada de conteúdo válida, o pipeline verificava a existência de um `index.md` usando `statSync()`.

Simplificando, a lógica funcionava assim:

```text
tenta fazer stat do index.md

em caso de erro:
    trata o index.md como inexistente
```

Isso parece razoável para um caso específico:

```text
ENOENT
→ index.md não existe
→ este diretório não é uma entrada
```

Mas `ENOENT` não é o único motivo pelo qual uma operação de sistema de arquivos pode falhar.

Erros como:

```text
EACCES
EIO
EMFILE
```

também eram reduzidos a `false`.

Na prática:

```text
erro ao acessar o arquivo
→ false
→ conteúdo ignorado
→ o build continua
```

O problema não era simplesmente uma exceção mal tratada.

Era o contrário.

**A exceção era bem tratada demais.**

Um erro operacional real podia ser lido como uma ausência legítima de conteúdo.

O build podia terminar com sucesso enquanto uma entrada sumia do resultado em silêncio.

### Por que os testes não pegaram?

Porque todos os mecanismos até ali estavam respondendo a uma pergunta diferente.

Os testes verificavam os cenários que de fato tinham sido escritos neles.

O typecheck verificava relações entre tipos.

O build verificava se a aplicação podia ser gerada.

O deploy verificava se o artefato funcionava nos caminhos que foram exercitados.

As verificações manuais confirmavam que páginas e navegação se comportavam normalmente.

Nenhum deles perguntava:

**"O que acontece se o sistema de arquivos falhar por outro motivo que não a ausência do arquivo?"**

A revisão de código perguntou.

A correção foi pequena:

```text
ENOENT
→ o index.md realmente não existe
→ ignora

qualquer outro erro
→ relança com contexto
→ falha o build
```

Também entrou um teste dedicado para fixar essa distinção.

Tem mais um detalhe que vale notar sobre esse caso.

O defeito não foi introduzido pelo Projects v1.

Ele já existia.

Mas o Projects estava generalizando o módulo de descoberta para que ele servisse tanto ao Blog quanto ao Projects.

Uma falha silenciosa que antes tinha um raio de impacto menor estava prestes a virar comportamento de infraestrutura compartilhada.

Foi exatamente nesse momento que a revisão a pegou.

## Caso 2 — O bug que foi pego antes de existir

Dez dias depois, aconteceu algo diferente.

Eu estava planejando o **Analytics v1** do Developer OS.

O plano era usar o GoatCounter para analytics, mas havia antes um problema de inicialização para resolver.

O script externo carrega de forma assíncrona.

Isso significa que uma navegação pode se resolver antes de a API de analytics estar pronta para registrar o pageview.

O sistema precisava guardar essas navegações e enviá-las depois, sem perder eventos e sem introduzir uma deduplicação incorreta.

Durante o planejamento, surgiu uma solução: uma fila ordenada de caminhos pendentes.

Parecia razoável.

Tinha até o que parecia uma salvaguarda defensiva:

**limitar a fila a oito caminhos.**

Foi aí que a revisão independente do plano encontrou o primeiro problema.

### O nono caminho

O contrato dizia que todo pathname resolvido antes de o analytics ficar disponível precisava ser preservado, em ordem.

Mas a implementação planejada limitava a fila a oito elementos.

Então:

```text
caminho 1 → mantido
caminho 2 → mantido
...
caminho 8 → mantido
caminho 9 → descartado
```

Essa não seria uma perda aleatória.

Seria uma perda determinística, embutida no próprio algoritmo.

E provavelmente difícil de perceber.

O dashboard continuaria recebendo dados.

Algumas páginas seriam contadas.

Outras simplesmente sumiriam.

Os números continuariam parecendo plausíveis.

### O problema, na verdade, era um pouco pior

Havia também uma confusão entre dois estados:

```text
pendente
```

e

```text
enviado
```

O algoritmo planejado podia avançar o estado interno que marcava um caminho como contado antes de confirmar que esse caminho tinha de fato sido entregue à chamada local do GoatCounter.

Isso criava uma falsa verdade interna:

```text
a aplicação:
"eu já enviei isso"

a realidade:
"eu só coloquei na fila"
```

Se esse envio se perdesse, ou um flush falhasse, a deduplicação podia então bloquear qualquer nova tentativa.

O sistema não perderia só o dado.

**Ele acreditaria que não precisava mais tentar enviá-lo.**

De novo, não havia necessariamente nenhum crash envolvido.

Nenhum erro necessariamente visível.

O analytics simplesmente ficaria incompleto.

### Só que havia uma diferença fundamental

Esse bug nunca existiu em código.

A branch ainda não existia.

O PR ainda não existia.

Nenhuma conta no provedor tinha sido criada para essa implementação.

Nenhuma mudança de runtime tinha sido feita.

O defeito existia apenas como propriedade do algoritmo descrito no plano.

A revisão aconteceu antes mesmo de a implementação ser autorizada.

O contrato e o algoritmo foram corrigidos.

A fila perdeu sua política arbitrária de descarte.

`pendente` e `enviado` passaram a ser estados semanticamente distintos.

E um item só podia sair da fila depois que a chamada local `count(path)` retornasse com sucesso.

Também foi previsto um teste com pelo menos dez caminhos pendentes, justamente para impedir que um limite arbitrário parecido voltasse a aparecer mais tarde.

O bug morreu no planejamento.

## Dois bugs, dois momentos diferentes

Os dois casos parecem parecidos porque ambos envolviam falhas silenciosas.

Mas foram pegos por controles diferentes.

No Projects v1:

```text
implementação
→ testes
→ typecheck
→ build
→ deploy
→ verificações manuais
→ revisão de código independente
→ defeito encontrado
```

No Analytics v1:

```text
contrato
→ plano de implementação
→ revisão independente do plano
→ defeito encontrado
→ plano corrigido
→ a implementação nem tinha começado
```

Isso mudou a forma como eu penso sobre revisão no Developer OS.

Eu associava revisão principalmente a código.

Agora vejo pelo menos duas perguntas diferentes.

Antes da implementação:

**Estamos prestes a construir a decisão certa?**

Depois da implementação:

**O código realmente preservou essa decisão e suas garantias?**

São problemas diferentes.

E, por isso, controles diferentes podem pegar classes diferentes de erro.

## "Tudo verde" não significa o mesmo que "correto"

Nada disso diminui o valor de testes, CI, typecheck ou build.

Muito pelo contrário.

Cada um deles fornece evidência sobre uma propriedade específica do sistema.

O problema aparece quando tratamos uma pilha de evidências parciais como uma garantia que ela nunca ofereceu de fato.

Um teste passando significa que o comportamento que ele exercita passou.

Um typecheck passando significa que certas relações entre tipos se mantêm.

Um build passando significa que conseguimos gerar o artefato.

Um deploy funcionando significa que conseguimos exercitar certos caminhos do sistema naquele ambiente.

Nenhuma dessas afirmações significa automaticamente:

**"Não existe nenhuma classe importante de comportamento que esquecemos de verificar."**

Esse é um dos papéis que encontrei para a revisão independente.

Não substituir testes.

Não substituir execução.

Não substituir julgamento humano.

Mas tentar encontrar os pontos cegos entre eles.

## Por que a independência importa

No Developer OS, o agente que implementa e o agente que revisa têm responsabilidades diferentes.

Quem implementa precisa construir uma solução coerente.

Ao longo do caminho, naturalmente constrói um modelo mental dessa solução.

Isso é necessário para executar bem.

Mas o mesmo modelo mental também pode tornar algumas suposições mais difíceis de enxergar.

Quem revisa parte de outra posição.

Não precisa defender as decisões que levaram ao código.

Pode comparar contrato, plano, implementação, testes e garantias como artefatos separados.

Pode perguntar:

```text
por que isso é seguro?
```

em vez de apenas entender:

```text
por que isso foi construído assim?
```

Eu não vejo isso como uma competição entre agentes.

O objetivo é a **detecção independente de erros**.

## O que muda quando um projeto é construído com agentes

Esses dois casos têm outra dimensão que eu acho importante.

O Developer OS é, no fundo, um projeto solo.

Num fluxo tradicional, isso significa que eu provavelmente ocuparia quase todos os papéis sozinho:

```text
eu defino o problema
↓
eu desenho a solução
↓
eu implemento
↓
eu escrevo os testes
↓
eu valido
↓
eu reviso meu próprio código
```

Nada aqui sugere que um desenvolvedor humano não poderia ter encontrado qualquer um desses bugs.

Um engenheiro experiente poderia muito bem ter notado a semântica errada no tratamento de erros do sistema de arquivos, ou a perda de estado no algoritmo de analytics.

O problema real é outro:

**quem implementa algo também carrega as suposições que produziram aquela implementação.**

Revisar o próprio trabalho não cria automaticamente uma segunda perspectiva.

Num time tradicional, parte desse problema é resolvida por outras pessoas.

Outro engenheiro revisa o PR.

Uma decisão arquitetural é discutida antes da implementação.

Alguém que não participou da construção original pode fazer uma pergunta que o autor nunca pensou em fazer.

Num projeto solo, conseguir esse tipo de independência costuma ser mais difícil.

É aqui que a orquestração de agentes mudou meu fluxo de trabalho.

O processo agora se parece mais com isto:

```text
o humano define o problema e as restrições
↓
um agente investiga e planeja
↓
outro agente revisa o plano
↓
o humano decide
↓
um agente implementa
↓
verificações automatizadas
↓
outro agente revisa a implementação
↓
o humano decide sobre o merge
```

Nada disso transforma a IA em autoridade técnica.

Também não significa que dois agentes estão necessariamente certos só porque concordam.

A decisão continua humana.

O que muda é o custo de introduzir **separação entre autoria e revisão** num projeto que, de outra forma, teria exatamente um desenvolvedor.

E o que torna esses dois casos interessantes é que perspectivas independentes pegaram problemas em lados opostos da implementação.

No Analytics, o revisor questionou uma decisão antes de ela virar código.

No Projects, o revisor questionou uma implementação depois que quase todas as outras verificações já estavam verdes.

Para mim, essa talvez seja uma das aplicações mais interessantes de agentes de IA na engenharia de software.

Não só escrever código mais rápido.

**Permitir que um desenvolvedor solo trabalhe com algo mais próximo de uma pequena estrutura de engenharia — desde que continue responsável pelas decisões, pelos contratos e pelas evidências que escolhe aceitar.**

## Mas isso também pode virar burocracia

A conclusão mais perigosa a tirar desses casos seria transformar cada mudança num ritual de múltiplas revisões.

Não é isso que estou tentando fazer aqui.

Um pequeno ajuste de documentação não precisa passar pelo mesmo processo que uma mudança que toca:

- arquitetura;
- infraestrutura compartilhada;
- o sistema de arquivos;
- a fronteira entre build e runtime;
- a geração de artefatos;
- garantias difíceis de observar a partir de um build verde;
- comportamento cuja falha ainda pareceria um resultado válido.

O Projects v1 atendia a vários desses critérios.

O Analytics v1 também.

A revisão precisa ser proporcional ao risco.

Caso contrário, a governança deixa de reduzir risco e passa só a adicionar custo.

## O que esses dois casos mudaram no Developer OS

Hoje consigo resumir a ideia numa sequência bem simples:

```text
problema
↓
requisitos / arquitetura
↓
plano
↓
revisão independente do plano, quando o risco justifica
↓
decisão humana
↓
implementação
↓
PR
↓
revisão de código independente, quando o risco justifica
↓
correções pontuais
↓
decisão humana sobre o merge
```

A revisão do plano procura decisões erradas ou incompletas **antes que virem código**.

A revisão de código procura implementações erradas ou incompletas **depois que a decisão foi codificada**.

Nenhuma substitui os testes.

Nenhuma substitui o julgamento humano.

E nenhuma precisa existir só para cumprir processo.

## A parte que mais me interessa

O caso do Projects mostrou que uma implementação pode passar por uma quantidade considerável de validação e ainda carregar um defeito silencioso.

O caso do Analytics mostrou algo talvez ainda mais interessante:

**o momento mais barato para corrigir um bug pode ser enquanto ele ainda é só uma frase num plano.**

No primeiro caso, a governança impediu que um erro operacional virasse, em silêncio, conteúdo faltando.

No segundo, impediu que uma estratégia de analytics começasse a vida já capaz de perder dados enquanto acreditava, internamente, que eles tinham sido enviados.

Nenhum dos dois bugs chegou à produção.

O que é justamente o problema de escrever sobre eles.

Não há screenshot de página quebrada.

Não há postmortem de indisponibilidade.

Não há gráfico mostrando usuários afetados.

Há só uma coisa consideravelmente menos dramática:

**evidência de que o processo pegou os problemas enquanto eles ainda eram baratos.**

E talvez seja exatamente esse o tipo de bug sobre o qual eu prefiro ter uma história.

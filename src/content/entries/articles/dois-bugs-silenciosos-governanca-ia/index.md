---
title: "Dois bugs silenciosos. Um antes do código existir, outro depois de tudo ficar verde."
description: "Dois bugs silenciosos no Developer OS foram encontrados em momentos opostos: um durante o planejamento, antes de existir código; outro depois de testes, build e deploy estarem verdes. O que esses casos ensinaram sobre revisão independente e orquestração de agentes de IA."
publishedAt: "2026-09-27"
---

# Dois bugs silenciosos. Um antes do código existir, outro depois de tudo ficar verde.

Existe uma sensação particularmente confortável no desenvolvimento de software quando tudo fica verde.

Os testes passam.  
O typecheck passa.  
O build termina sem erros.  
A aplicação sobe.  
As páginas funcionam.

É tentador interpretar esse conjunto de sinais como uma conclusão:

**está correto.**

Durante o desenvolvimento do Developer OS, dois casos separados mostraram por que tento evitar essa conclusão.

Em um deles, o código já estava implementado e havia passado por testes, build, deploy e verificações manuais.

No outro, o código sequer existia.

Os dois continham falhas que poderiam produzir resultados incorretos sem necessariamente gerar um erro visível.

E os dois foram encontrados em momentos diferentes do processo de revisão.

## Caso 1 — Tudo estava verde, mas conteúdo poderia desaparecer

Em setembro de 2026, eu estava implementando o **Projects v1**, o segundo tipo de conteúdo do Developer OS.

O Blog já possuía um pipeline de conteúdo baseado em Markdown. Projects reutilizaria apenas as partes que agora tinham um segundo consumidor real, mantendo separados os componentes específicos de cada tipo de conteúdo.

A implementação foi concluída e passou por uma bateria considerável de validações:

- testes automatizados;
- typecheck;
- build;
- deploy na Cloudflare;
- verificações manuais das rotas;
- inspeção do prerender;
- verificações da separação entre runtime e compilação;
- testes de regressão do Blog.

Tudo estava verde.

Então veio a revisão independente do código.

E ela encontrou um problema no mecanismo compartilhado de descoberta de conteúdo.

### O problema

Para determinar se um diretório representava uma entrada válida de conteúdo, o pipeline verificava a existência de um `index.md` usando `statSync()`.

A lógica, de forma simplificada, se comportava assim:

```text
tentar verificar index.md

se ocorrer erro:
    considerar que index.md não existe
```

Isso parece razoável para um caso específico:

```text
ENOENT
→ index.md não existe
→ o diretório não representa uma entrada
```

Mas `ENOENT` não é o único motivo pelo qual uma operação de filesystem pode falhar.

Erros como:

```text
EACCES
EIO
EMFILE
```

também acabavam convertidos em `false`.

Na prática:

```text
erro ao acessar arquivo
→ false
→ conteúdo ignorado
→ build continua
```

O problema não era simplesmente uma exceção mal tratada.

Era o contrário.

**A exceção estava sendo tratada demais.**

Um erro operacional real poderia ser interpretado como ausência legítima de conteúdo.

O build poderia terminar com sucesso enquanto uma entrada desaparecia silenciosamente do resultado.

### Por que os testes não encontraram?

Porque todos os mecanismos anteriores estavam respondendo perguntas diferentes.

Os testes verificavam os cenários que haviam sido codificados.

O typecheck verificava relações de tipos.

O build verificava se a aplicação podia ser produzida.

O deploy verificava se o artefato funcionava nos caminhos testados.

As verificações manuais confirmavam que páginas e navegação funcionavam normalmente.

Nenhum deles perguntava:

**"O que acontece se o filesystem falhar por um motivo diferente de arquivo inexistente?"**

A revisão de código perguntou.

A correção foi pequena:

```text
ENOENT
→ arquivo realmente não existe
→ ignorar

qualquer outro erro
→ propagar erro com contexto
→ falhar o build
```

Também foi adicionado um teste específico protegendo essa distinção.

Há ainda um detalhe importante nesse caso.

O defeito não havia sido introduzido pelo Projects v1.

Ele já existia.

Mas Projects estava generalizando o módulo de discovery para que ele passasse a atender tanto Blog quanto Projects.

Uma falha silenciosa que antes tinha um alcance menor estava prestes a se tornar comportamento de infraestrutura compartilhada.

Foi justamente nesse momento que a revisão a encontrou.

## Caso 2 — O bug que foi encontrado antes de existir

Dez dias depois, aconteceu algo diferente.

Eu estava planejando o **Analytics v1** do Developer OS.

A ideia era utilizar GoatCounter para analytics, mas havia um problema de inicialização a resolver.

O script externo é assíncrono.

Isso significa que uma navegação pode ser resolvida antes de a API de analytics estar pronta para receber o pageview.

O sistema precisava preservar essas navegações e enviá-las posteriormente, sem perder eventos e sem introduzir deduplicação incorreta.

Durante o planejamento surgiu uma solução com uma fila ordenada de caminhos pendentes.

Ela parecia razoável.

Inclusive havia uma proteção aparentemente defensiva:

**limitar a fila a oito caminhos.**

Foi aí que a revisão independente do plano encontrou o primeiro problema.

### O nono caminho

O contrato estabelecia que todos os pathnames resolvidos antes da disponibilidade do analytics deveriam ser preservados em ordem.

Mas a implementação planejada limitava a fila a oito elementos.

Portanto:

```text
path 1 → preservado
path 2 → preservado
...
path 8 → preservado
path 9 → descartado
```

Não seria uma perda aleatória.

Seria uma perda determinística criada pelo próprio algoritmo.

E provavelmente seria difícil percebê-la.

O dashboard continuaria recebendo dados.

Algumas páginas seriam contabilizadas.

Outras desapareceriam.

Os números ainda pareceriam plausíveis.

### O problema era ainda um pouco pior

Havia também uma confusão entre dois estados:

```text
pending
```

e

```text
sent
```

O algoritmo planejado poderia avançar o estado interno que representava um caminho contabilizado antes de confirmar que aquele caminho havia sido realmente entregue à chamada local do GoatCounter.

Isso criava uma verdade interna falsa:

```text
aplicação:
"já enviei"

realidade:
"apenas coloquei na fila"
```

Se aquele envio fosse perdido ou um flush falhasse, a deduplicação poderia impedir uma tentativa posterior.

O sistema não apenas perderia o dado.

**Ele poderia acreditar que não precisava mais tentar enviá-lo.**

Novamente, não havia necessariamente crash.

Não havia necessariamente erro visível.

O analytics simplesmente ficaria incompleto.

### Só que havia uma diferença fundamental

Esse bug nunca existiu no código.

A branch ainda não existia.

O PR ainda não existia.

Nenhuma conta do provider havia sido criada para essa implementação.

Nenhuma mudança de runtime havia sido feita.

A falha existia apenas como uma propriedade do algoritmo descrito no plano.

A revisão aconteceu antes da autorização para implementar.

O contrato e o algoritmo foram corrigidos.

A fila deixou de possuir uma política arbitrária de descarte.

`pending` e `sent` passaram a representar estados semanticamente diferentes.

E um item só poderia sair da fila depois que a chamada local de `count(path)` retornasse normalmente.

Também foi definido um teste com pelo menos dez caminhos pendentes para impedir que um limite arbitrário semelhante reaparecesse no futuro.

O bug morreu no planejamento.

## Dois bugs, dois momentos diferentes

Os dois casos parecem semelhantes porque ambos envolviam falhas silenciosas.

Mas foram encontrados por controles diferentes.

No Projects v1:

```text
implementação
→ testes
→ typecheck
→ build
→ deploy
→ verificações manuais
→ revisão independente de código
→ falha encontrada
```

No Analytics v1:

```text
contrato
→ plano de implementação
→ revisão independente do plano
→ falha encontrada
→ plano corrigido
→ implementação nem começou
```

Isso mudou a maneira como penso sobre revisão no Developer OS.

Eu costumava associar revisão principalmente a código.

Hoje vejo pelo menos duas perguntas diferentes.

Antes da implementação:

**Estamos prestes a implementar a decisão correta?**

Depois da implementação:

**O código realmente preservou a decisão e suas garantias?**

São problemas diferentes.

E, portanto, controles diferentes podem encontrar classes diferentes de erro.

## "Tudo verde" não significa a mesma coisa que "correto"

Nada disso reduz o valor de testes, CI, typecheck ou build.

Pelo contrário.

Cada um deles fornece evidência sobre uma propriedade específica do sistema.

O problema aparece quando transformamos várias evidências parciais em uma garantia que elas nunca ofereceram.

Um teste passando significa que o comportamento testado passou.

Um typecheck passando significa que determinadas relações de tipos são válidas.

Um build passando significa que conseguimos produzir o artefato.

Um deploy funcionando significa que conseguimos executar determinados caminhos do sistema naquele ambiente.

Nenhuma dessas afirmações significa automaticamente:

**"Não existe uma classe importante de comportamento que esquecemos de verificar."**

Esse é um dos papéis que encontrei para revisão independente.

Não substituir testes.

Não substituir execução.

Não substituir decisão humana.

Mas tentar encontrar os pontos cegos entre eles.

## Por que a independência importa

No Developer OS, o agente que implementa e o agente que revisa possuem responsabilidades diferentes.

O implementador precisa construir uma solução coerente.

Durante esse processo, naturalmente desenvolve um modelo mental daquela solução.

Isso é necessário para executar bem.

Mas o mesmo modelo mental também pode tornar algumas premissas menos visíveis.

O revisor começa de outra posição.

Ele não precisa defender as decisões que levaram ao código.

Pode comparar contrato, plano, implementação, testes e garantias como artefatos diferentes.

Pode perguntar:

```text
por que isso é seguro?
```

em vez de apenas compreender:

```text
por que isso foi implementado assim?
```

Não considero isso uma competição entre agentes.

O objetivo é **detecção independente de erros**.

## O que muda quando o projeto é desenvolvido com agentes

Existe outra dimensão nesses dois casos que considero importante.

O Developer OS é essencialmente um projeto individual.

Em um fluxo tradicional, isso significa que eu provavelmente ocuparia quase todos os papéis:

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

Nada impede que um desenvolvedor encontre os dois problemas descritos neste artigo.

Um humano experiente poderia perceber tanto a semântica incorreta do tratamento de erros de filesystem quanto a perda de estado no algoritmo de analytics.

O problema é outro:

**quem implementa também carrega consigo as premissas que produziram aquela implementação.**

Revisar o próprio trabalho não cria automaticamente uma segunda perspectiva.

Em uma equipe tradicional, parte desse problema é resolvida por outras pessoas.

Outro engenheiro revisa o PR.

Uma decisão arquitetural pode ser discutida antes da implementação.

Alguém que não participou da construção original pode fazer uma pergunta que o autor deixou de fazer.

Em um projeto individual, obter essa independência normalmente é mais difícil.

Foi aqui que a orquestração de agentes mudou meu workflow.

O processo passou a se parecer mais com:

```text
humano define problema e restrições
↓
agente investiga e planeja
↓
outro agente revisa o plano
↓
humano decide
↓
agente implementa
↓
validações automatizadas
↓
outro agente revisa a implementação
↓
humano decide o merge
```

Isso não transforma IA em autoridade técnica.

Também não significa que dois agentes estejam necessariamente corretos quando concordam.

A decisão continua humana.

O que muda é o custo de introduzir **separação entre autoria e revisão** em um projeto que, de outra forma, teria apenas um desenvolvedor.

E os dois casos deste artigo são interessantes justamente porque as perspectivas independentes encontraram problemas em lados diferentes da implementação.

No Analytics, o revisor questionou uma decisão antes que ela se tornasse código.

No Projects, o revisor questionou uma implementação depois que praticamente todas as outras verificações estavam verdes.

Talvez essa seja, para mim, uma das aplicações mais interessantes de agentes de IA em engenharia de software.

Não apenas escrever código mais rápido.

**Permitir que um desenvolvedor individual trabalhe com algo mais próximo de uma pequena estrutura de engenharia — desde que continue responsável pelas decisões, pelos contratos e pelas evidências que aceita.**

## Mas isso também pode virar burocracia

A conclusão mais perigosa desses casos seria transformar toda mudança em um ritual de múltiplas revisões.

Não é isso que tento fazer.

Uma alteração pequena de documentação não precisa necessariamente passar pelo mesmo processo de uma mudança que toca:

- arquitetura;
- infraestrutura compartilhada;
- filesystem;
- fronteiras entre build e runtime;
- geração de artefatos;
- garantias difíceis de observar em um build verde;
- comportamentos cujo erro produziria um resultado aparentemente válido.

Projects v1 atendia a vários desses critérios.

Analytics v1 também.

A revisão precisa ser proporcional ao risco.

Caso contrário, governança deixa de reduzir risco e passa apenas a aumentar custo.

## O que esses dois casos mudaram no Developer OS

Hoje consigo resumir a ideia em uma sequência relativamente simples:

```text
problema
↓
requisitos / arquitetura
↓
plano
↓
revisão independente do plano, quando o risco justificar
↓
decisão humana
↓
implementação
↓
PR
↓
revisão independente do código, quando o risco justificar
↓
correções localizadas
↓
decisão humana de merge
```

A revisão de planejamento procura decisões erradas ou incompletas **antes que elas se tornem código**.

A revisão de código procura implementações erradas ou incompletas **depois que a decisão foi codificada**.

Nenhuma substitui testes.

Nenhuma substitui julgamento humano.

E nenhuma precisa existir apenas para cumprir processo.

## A parte que mais me interessa

O caso de Projects mostrou que uma implementação pode passar por uma quantidade considerável de validações e ainda carregar uma falha silenciosa.

O caso de Analytics mostrou algo talvez ainda mais interessante:

**o momento mais barato para corrigir um bug pode ser quando ele ainda é apenas uma frase em um plano.**

No primeiro caso, a governança impediu que um erro operacional fosse transformado silenciosamente em ausência de conteúdo.

No segundo, impediu que uma estratégia de analytics começasse sua vida já capaz de perder dados enquanto afirmava internamente que eles haviam sido enviados.

Nenhum dos dois bugs chegou à produção.

Esse é justamente o problema de escrever sobre eles.

Não existe screenshot de uma página quebrada.

Não existe post-mortem de outage.

Não existe gráfico mostrando usuários afetados.

Existe apenas uma coisa bem menos dramática:

**evidência de que o processo encontrou os problemas enquanto eles ainda eram baratos.**

E talvez esse seja exatamente o tipo de bug que eu prefiro ter para contar.

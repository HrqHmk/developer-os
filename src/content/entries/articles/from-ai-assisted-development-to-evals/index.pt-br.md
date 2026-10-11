---
title: "De desenvolvimento assistido por IA a Evals: o que aprendi em três casos reais"
description: "Como comecei a transformar tarefas de desenvolvimento com agentes de IA em experimentos avaliáveis, com critérios explícitos, evidências e decisões humanas, a partir de três casos reais no Developer OS."
publishedAt: "2026-10-11"
---

*Como comecei a transformar tarefas de desenvolvimento com agentes de IA em experimentos avaliáveis, com critérios explícitos, evidências e decisões humanas.*

## O problema não era fazer a IA escrever código

Quando comecei a desenvolver o Developer OS, minha preocupação principal era encontrar uma maneira de utilizar agentes de IA sem perder o controle sobre as decisões técnicas.

O processo começou de forma relativamente simples: um agente planejava e implementava, outro realizava revisões independentes, e a decisão final continuava sendo humana.

Essa separação trouxe resultados interessantes.

Durante o desenvolvimento do Blog, por exemplo, uma revisão independente identificou que a abordagem proposta poderia violar uma decisão arquitetural do projeto: o conteúdo deveria ser processado durante o build, não em tempo de execução.

O problema foi identificado antes que o código fosse escrito.

Em outro momento, uma implementação passou pelos testes, typecheck e build, mas a revisão encontrou problemas relacionados à validação de datas, timezone e tratamento de erros de filesystem.

A automação estava verde. Isso não significava que a implementação estava correta.

Esses episódios reforçaram minha confiança na revisão independente, mas também me fizeram perceber uma limitação no processo.

**Eu tinha mecanismos para encontrar erros, mas ainda não possuía um sistema suficientemente estruturado para avaliar as execuções dos agentes.**

Foi nesse contexto que comecei a estudar Evals.

## De revisão de código a avaliação de agentes

Uma revisão tradicional procura identificar problemas em uma implementação.

Um Eval, no contexto que estou explorando, precisa responder a um conjunto mais amplo de perguntas:

- O agente cumpriu os requisitos da missão?
- Quais critérios foram satisfeitos?
- Que evidências sustentam essa conclusão?
- Quais falhas foram encontradas?
- Essas falhas foram introduzidas pela implementação ou já existiam?
- Quanto de intervenção humana foi necessário?

A diferença é importante.

Não quero apenas saber se o código produzido funciona. Quero entender o comportamento do sistema de desenvolvimento assistido por IA.

Para isso, comecei a formalizar um protocolo de avaliação no Developer OS.

A unidade de avaliação passou a ser uma missão real do projeto, normalmente representada por uma GitHub Issue.

Antes da implementação, defino o contrato: requisitos, critérios de aceite, restrições e evidências esperadas.

O agente responsável pelo planejamento tem autonomia para propor a abordagem técnica. O implementador executa. Um evaluator independente verifica o resultado.

E as decisões que exigem julgamento de produto, aceitação de riscos ou mudança de escopo continuam sendo humanas.

O objetivo não é controlar cada passo do agente.

É estabelecer limites verificáveis para o trabalho que ele realiza.

## Caso 001 — Um FAIL que revelou uma falha no próprio protocolo

O primeiro Eval formal teve um resultado interessante: **FAIL**.

A funcionalidade principal havia sido implementada e funcionava, mas um dos critérios de acessibilidade não foi satisfeito.

O detalhe mais importante apareceu durante a análise da falha.

O problema já existia no baseline do projeto, antes da implementação avaliada.

Isso criou uma distinção que meu protocolo inicial não tratava adequadamente.

O resultado da missão podia ser considerado FAIL porque o contrato de aceite não havia sido integralmente satisfeito.

Mas seria incorreto concluir, a partir desse resultado, que o agente implementador havia introduzido aquele defeito.

São afirmações diferentes.

Uma descreve o resultado da avaliação.

A outra atribui a origem de uma falha.

Essa descoberta mostrou que eu precisava melhorar não apenas a implementação, mas o próprio sistema de avaliação.

A retrospectiva do primeiro caso levou à criação do **Evaluation Protocol v2**.

Entre as mudanças mais importantes estavam:

- Verificação explícita do baseline antes da implementação.
- Separação entre tipo de falha e origem da falha.
- Requisitos de evidência publicada e auditável.
- Separação mais rigorosa entre responsabilidades do implementador e do evaluator.
- Um espaço reservado para avaliações humanas de experiência e decisões de produto.

Também estabeleci que novas versões do protocolo não deveriam alterar retroativamente os resultados anteriores.

Um Eval precisa preservar o contexto em que foi executado. Caso contrário, o histórico perde parte do seu valor.

O primeiro FAIL, portanto, produziu dois resultados: revelou um critério não satisfeito e expôs uma deficiência na forma como eu estava avaliando.

O segundo resultado provavelmente foi o mais importante naquele momento.

## Caso 002 — Corrigindo o defeito com um contrato mais maduro

O segundo caso nasceu diretamente do primeiro.

A missão era corrigir o problema de acessibilidade identificado anteriormente.

Dessa vez, porém, o processo já contava com as melhorias introduzidas no protocolo.

O baseline passou a ser uma referência explícita.

As evidências de comportamento no navegador ganharam importância, em vez de depender exclusivamente de testes automatizados ou declarações do agente.

A avaliação independente também permaneceu separada da implementação.

O resultado foi **PASS**.

Mas o aprendizado não foi simplesmente que o segundo agente acertou enquanto o primeiro errou.

As missões eram diferentes, e os resultados não permitem essa comparação direta.

O que o segundo caso demonstrou foi a aplicação prática das melhorias de governança: um defeito conhecido foi tratado com critérios mais claros, evidência observável e verificação independente.

O processo também começou a produzir algo que considero importante: rastreabilidade.

Era possível relacionar o problema encontrado, a missão criada para resolvê-lo, o trabalho executado e o resultado da avaliação.

Cada execução deixava de ser apenas uma mudança no repositório e passava a contribuir para o histórico de engenharia do projeto.

## Caso 003 — Quando a avaliação precisou acompanhar uma mudança maior de produto

O terceiro Eval ampliou consideravelmente o escopo.

A missão era tornar o Developer OS bilíngue, tratando PT-BR como uma experiência nativa, não como uma tradução secundária.

Essa decisão afetava diferentes partes do projeto:

- Estrutura de rotas e navegação.
- Organização e disponibilidade do conteúdo nos dois idiomas.
- Metadata e comportamento de SEO.
- Busca.
- Acessibilidade.
- Responsividade.
- Decisões de experiência e apresentação do produto.

Esse tipo de missão é interessante porque não pode ser avaliado adequadamente apenas verificando se o projeto compila.

Uma aplicação pode passar pelo build e ainda apresentar links incorretos, conteúdo indisponível em determinado idioma ou inconsistências de navegação.

Além disso, algumas decisões envolvem julgamento humano.

Uma mudança pode ser tecnicamente válida e, mesmo assim, não oferecer a experiência que desejo para o produto.

Foi nesse terceiro caso que a separação de responsabilidades começou a fazer mais sentido para mim.

A Issue estabelecia o problema, as restrições e os critérios de aceite.

O planner podia investigar o repositório e escolher a abordagem.

O implementador tinha autonomia para executar a solução.

O evaluator precisava produzir um julgamento fundamentado em evidências, sem simplesmente aceitar as declarações do implementador.

E eu permanecia responsável pelas decisões de produto e pelos critérios que exigiam avaliação humana.

**O ganho de controle não veio de restringir a autonomia técnica dos agentes. Veio de definir melhor as responsabilidades, os contratos e as evidências.**

Essa distinção mudou a maneira como comecei a pensar em orquestração.

## Governança não é microgerenciamento

Existe uma tentação natural de tentar melhorar os resultados da IA escrevendo instruções cada vez mais detalhadas.

Isso pode funcionar em determinadas situações, mas também pode transformar a especificação em uma implementação disfarçada.

Se eu já determino toda a arquitetura, cada estrutura de dados e cada decisão técnica, o espaço de raciocínio do agente diminui.

O caminho que estou explorando é diferente.

Quero especificar o problema com precisão suficiente para avaliar o resultado, sem antecipar desnecessariamente a solução.

Isso significa estabelecer o que precisa ser verdadeiro ao final da missão.

Também significa identificar quais decisões pertencem aos agentes e quais continuam sob responsabilidade humana.

Na prática, meu fluxo atual pode ser resumido assim:

**Contrato da missão → Planejamento → Implementação → Avaliação independente → Decisão humana → Retrospectiva**

O fluxo não precisa ter a mesma complexidade em todas as tarefas. Revisões adicionais devem ser proporcionais ao risco, e a governança não pode se transformar em um obstáculo maior do que o problema que pretende resolver.

O objetivo continua sendo desenvolver software.

O protocolo existe para aumentar a confiança no processo, não para criar burocracia em torno dele.

## O próximo desafio: transformar execuções em dados

Os três casos também revelaram uma oportunidade que pretendo explorar nos próximos experimentos.

Quero começar a acumular dados estruturados sobre o desempenho dos agentes em missões reais.

Não apenas resultados binários de PASS ou FAIL.

Quero identificar padrões como:

- Quais tipos de missão apresentam mais falhas?
- Quais categorias de erro aparecem com maior frequência?
- Em quais etapas a revisão independente gera mais valor?
- Quanto de intervenção humana cada missão exige?
- Quais falhas são encontradas pelo evaluator e quais chegam até a revisão humana?
- Como o protocolo evolui à medida que novos problemas aparecem?

Para isso, estou trabalhando na classificação das falhas por tipo, severidade e mecanismo de detecção, mantendo separada a informação sobre sua origem.

Essa separação é fundamental para não produzir conclusões enganosas.

Um FAIL causado por um problema preexistente no baseline não deve ser contabilizado da mesma maneira que um defeito introduzido pelo agente.

Da mesma forma, uma falha do implementador e uma falha do processo de avaliação não são a mesma coisa.

Se o agente entrega um teste insuficiente, existe um problema no artefato produzido.

Se meu sistema de avaliação aceita esse teste como evidência suficiente e deixa passar um defeito, existe também uma questão sobre a eficácia do próprio Eval.

São dimensões que precisam ser observadas separadamente.

Ainda não tenho volume de dados para tirar conclusões estatísticas.

Três casos são uma amostra pequena, com missões diferentes e um protocolo que evoluiu ao longo do caminho.

Comparar diretamente seus resultados seria prematuro.

Mas já existe um começo de histórico, e isso muda o que posso aprender com os próximos experimentos.

## Conclusão — O Eval também precisa evoluir

Quando comecei a estudar Evals, minha expectativa inicial era melhorar a capacidade de identificar problemas no código produzido pelos agentes.

Os primeiros experimentos ampliaram essa perspectiva.

Percebi que também precisava avaliar a qualidade dos critérios, a confiabilidade das evidências e a maneira como interpreto os resultados.

O primeiro caso mostrou que um FAIL pode esconder diferentes causas.

O segundo mostrou o valor de um baseline explícito e de evidência verificável.

O terceiro ampliou a aplicação do processo para uma mudança de produto com várias dimensões técnicas e decisões humanas.

Ainda estou no início dessa investigação.

Não tenho uma fórmula definitiva para avaliar agentes de desenvolvimento, nem evidências suficientes para afirmar que meu protocolo representa a melhor abordagem.

O que tenho é um processo que começou a gerar conhecimento reaproveitável.

E essa é a ideia que quero continuar explorando no Developer OS:

**Um Eval não deveria servir apenas para decidir se uma execução passou ou falhou. Ele deveria transformar cada execução em informação capaz de melhorar a próxima.**

---

*Este artigo registra o estágio inicial do estudo de Evals no Developer OS. Os experimentos são realizados sobre missões reais do projeto, com o objetivo de investigar governança, avaliação independente e qualidade de software em fluxos assistidos por agentes de IA.*

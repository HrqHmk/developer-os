# Developer-OS — Evaluation Protocol v2

Protocolo para avaliação de execuções agentic em tarefas de desenvolvimento

Versão: v2  |  Status: baseline congelado após retro do Eval Case 001

## 0. Mudanças da v1 para a v2

A v2 preserva a estrutura central da v1 e incorpora aprendizados observados no Eval Case 001. As mudanças não reescrevem retroativamente o resultado do Case 001; elas passam a valer para casos futuros.

- Baseline verification explícita antes da implementação: critérios que dependem de comportamento já existente devem ser verificados no baseline, em vez de apenas assumidos pelo planner.
- Failure origin separada da failure taxonomy: distinguir defeito introduzido pela mudança, defeito preexistente no baseline, problema de ambiente/tooling e origem desconhecida.
- Human Experience Gate explícito: estética, sensação de produto e preferência visual não são encerradas pelo planner, implementador ou evaluator como fatos objetivos.
- Evidence publication gate: evidência relevante para o veredito deve estar publicada e auditável; artefatos somente locais permanecem classificados como “reportados, não auditáveis”.
- Separação de papéis reforçada: planner e implementador não atribuem PASS/FAIL/PASS WITH CONDITIONS à própria execução; o evaluator conserva liberdade de finding dentro do contrato congelado.
- Retro curta obrigatória ao final de cada caso para alimentar a próxima versão do protocolo ou do workflow sem alterar retroativamente o caso avaliado.
## 1. Objetivo

O Evaluation Protocol v2 formaliza como o Developer-OS avalia uma execução realizada por um agente de desenvolvimento. O objetivo não é apenas dizer se o agente “foi bem”, mas verificar o resultado da missão, identificar falhas, localizar sua origem e produzir evidência útil para melhorar o sistema de trabalho.

A unidade básica do eval é uma missão real do projeto, normalmente representada por uma GitHub Issue com critérios de aceite definidos antes da implementação.

## 2. Princípios

- Critérios antes da implementação: o contrato de avaliação deve existir antes de observar o resultado.
- Separação de papéis: planner e implementador não atribuem nota ou veredito à própria execução.
- Independência do evaluator: o avaliador usa o contrato congelado, mas mantém liberdade para encontrar problemas sustentados por evidência que não foram antecipados pelo implementador.
- Evidência antes de opinião: conclusões devem apontar para testes, diff, build, screenshots, comportamento observado ou outra evidência auditável.
- Taxonomia antes de métricas: primeiro classificar por que uma execução falhou; só depois agregar taxas ou tendências.
- Origem separada da causa: failure taxonomy explica o tipo de falha; failure origin explica onde ela nasceu.
- Problema antes da solução: a missão deve especificar comportamento e critérios sem entregar desnecessariamente a solução técnica.
- Baseline explícito: não presumir que constraints existentes atendem ao contrato; verificar quando forem relevantes para acceptance criteria.
- Escopo controlado: mudanças fora do escopo precisam ser tratadas como finding, bloqueio ou nova issue — não absorvidas silenciosamente.
- Julgamento humano permanece no gate: preferências visuais, sensação de produto, trade-offs de UX e decisões de merge não são delegadas automaticamente ao evaluator.
## 3. Artefatos do eval

| Artefato | Função |
| --- | --- |
| Mission / GitHub Issue | Fonte de verdade da tarefa, problema, escopo, acceptance criteria e evidências esperadas. |
| Baseline record | Branch/commit inicial e verificações do comportamento preexistente relevante para os critérios. |
| Implementation Plan | Registra interpretação do problema, abordagem proposta, riscos, testes e hipóteses antes do código. |
| Implementação / PR | Diff executado, commits, validações, evidências e divergências em relação ao plano. |
| Evaluation Protocol v2 | Define como o evaluator deve julgar a execução. |
| Eval Case record | Relaciona missão, protocolo, baseline, execução e resultado sem duplicar a Issue. |
| Retro record | Registra aprendizados do processo e mudanças propostas para casos futuros. |

## 4. Papéis

| Papel | Responsabilidade |
| --- | --- |
| Issue designer | Transforma o problema em missão verificável sem prescrever solução desnecessariamente. |
| Planner | Inspeciona repositório, verifica constraints relevantes do baseline e produz o Implementation Plan. Não implementa nessa fase e não atribui veredito. |
| Implementador | Executa a missão, valida e coleta evidências. Não atribui PASS/FAIL/PASS WITH CONDITIONS à própria execução. |
| Avaliador independente | Compara missão, baseline, plano, execução e evidências. No workflow atual, Codex. |
| Gate humano | Henrique + Friday resolvem julgamentos humanos, especialmente UX/estética, e decidem merge/remediação. |
| Retro owner | Consolida aprendizados após o caso e propõe mudanças para o próximo protocolo/workflow sem alterar o resultado já congelado. |

## 5. Fluxo

1. Criar a Issue com problema, escopo, acceptance criteria e evidências esperadas.

2. Congelar a missão.

3. Identificar baseline (branch/commit) e verificar behavior/constraints preexistentes relevantes para os acceptance criteria.

4. Produzir e congelar o Implementation Plan, distinguindo fatos observados de hipóteses a confirmar durante a execução.

5. Implementar a missão em branch própria, sem ampliar escopo silenciosamente.

6. Executar testes/checks e coletar evidências técnicas e visuais aplicáveis.

7. Publicar as evidências necessárias para auditoria antes da avaliação independente.

8. Congelar a execução: não corrigir findings descobertos antes do evaluator registrar o resultado inicial.

9. O evaluator compara Issue → Baseline → Plan → Diff/PR → Evidências.

10. Classificar failure taxonomy, failure origin e resultado final do caso.

11. Gate humano decide merge, remediation cycle ou nova issue; julgamentos estéticos permanecem aqui quando não houver critério objetivo suficiente.

12. Executar retro curta e registrar mudanças apenas para casos futuros.

## 6. Baseline verification

Antes de implementar, o workflow deve verificar o baseline quando um acceptance criterion depender de uma propriedade já existente. O objetivo não é procurar defeitos indiscriminadamente no repositório inteiro, mas testar as premissas que a missão assume como verdade.

- Para cada acceptance criterion, perguntar: este critério depende de comportamento preexistente?
- Se sim, registrar evidência mínima do baseline antes do código.
- Se o baseline já falha, registrar o finding sem reescrever a Issue retroativamente.
- O planner deve distinguir “observado no baseline” de “hipótese ainda não verificada”.
- Um defeito preexistente pode impedir a missão de passar, mas não deve ser atribuído causalmente ao patch.
## 7. Dimensões de avaliação

### 7.1 Adherence to mission

- A implementação resolve o problema descrito na Issue?
- Algum acceptance criterion ficou sem atendimento?
- Houve mudança fora de escopo ou feature creep?
### 7.2 Plan fidelity

- A execução seguiu o Implementation Plan?
- Quais hipóteses foram confirmadas?
- Quais hipóteses foram refutadas ou exigiram adaptação?
- O planner tratou como fato algo que deveria ter sido verificado no baseline?
### 7.3 Acceptance criteria

- Avaliar cada critério individualmente.
- Não converter “testes verdes” automaticamente em atendimento do critério.
- Quando houver critério subjetivo, separar observação factual de julgamento humano.
### 7.4 Evidence quality

- A evidência é suficiente para sustentar a conclusão?
- Distinguir: verificado automaticamente; verificado visualmente; reportado mas não auditável; não verificado.
- Evidência deve ser mínima, representativa e auditável; volume não substitui qualidade.
- Se uma conclusão depender de artefato somente local, declarar a limitação explicitamente.
### 7.5 Regression and scope review

- Inspecionar diff por regressões, mudanças desnecessárias e enfraquecimento de testes.
- Comparar com o baseline para distinguir preservação, regressão e defeito preexistente.
### 7.6 Accessibility

- Verificar requisitos de acessibilidade definidos na missão.
- Distinguir regressão introduzida de falha preexistente descoberta durante o eval.
- Uma falha preexistente pode impedir um critério de ser satisfeito, mesmo sem ter sido causada pelo patch.
### 7.7 Trade-offs e Human Experience Gate

O sistema pode medir comportamento e descrever trade-offs; não pode transformar sentimento humano sobre a ferramenta em fato objetivo quando a missão não fornece um critério mensurável.

- Separar cumprimento objetivo de preferência estética ou decisão de produto.
- Registrar fatos observáveis: altura, densidade, consistência, número de linhas, overflow, contraste, tempo de interação, etc.
- Não declarar “ficou melhor”, “mais bonito” ou “parece mais profissional” como resultado técnico sem critério previamente definido.
- Quando a aceitação depender de sensação visual/UX, marcar Human Experience Gate = required e encaminhar ao gate humano.
- O evaluator pode apontar trade-offs e riscos; a decisão de preferência permanece humana.
## 8. Failure taxonomy

Quando houver falha, classificar a causa antes de calcular métricas agregadas. Pode existir uma categoria primária e categorias secundárias. Se nenhuma categoria se aplicar com segurança, registrar a lacuna em vez de forçar uma classificação.

| Categoria | Definição |
| --- | --- |
| SPEC_AMBIGUITY | A missão ou critério permitiu interpretações relevantes diferentes e a ambiguidade contribuiu para o resultado. |
| MISSING_CONTEXT | Contexto necessário não estava disponível, estava desatualizado ou não foi fornecido de forma suficiente. |
| SCOPE_CREEP | A execução modificou ou incluiu trabalho fora do escopo necessário da missão. |
| REASONING_ERROR | O agente tinha contexto e contrato suficientes, mas chegou a uma conclusão, premissa ou implementação incorreta. |
| WEAK_TEST | Os testes/validações não detectaram uma implementação ou comportamento incorreto que deveriam proteger. |

## 9. Failure origin

Failure origin é uma dimensão ortogonal à taxonomia. Ela evita atribuir ao patch um defeito que já existia e evita usar a taxonomia causal para representar origem.

| Origem | Uso |
| --- | --- |
| INTRODUCED_BY_CHANGE | O comportamento incorreto surgiu com a execução avaliada. |
| PREEXISTING_BASELINE | O defeito já existia no baseline e foi descoberto ou confirmado durante o eval. |
| ENVIRONMENT_TOOLING | A falha decorre principalmente de ambiente, ferramenta, infraestrutura ou limitação externa à mudança. |
| UNKNOWN | As evidências não permitem localizar a origem com segurança. |

Exemplo: um acceptance criterion pode falhar com taxonomy = REASONING_ERROR e origin = PREEXISTING_BASELINE quando o planner assumiu incorretamente que uma constraint existente estava válida, embora o patch não tenha criado o defeito.

## 10. Resultado do caso

O resultado do evaluator informa o gate humano; ele não substitui a decisão humana de merge.

| Resultado | Uso |
| --- | --- |
| PASS | Os critérios essenciais da missão foram satisfeitos e não existe finding que exija correção antes do fechamento. |
| PASS WITH CONDITIONS | A missão foi substancialmente atendida, mas existe condição, ressalva ou correção delimitada que precisa ser resolvida/decidida antes do fechamento. |
| FAIL | Um ou mais critérios essenciais não foram atendidos, a evidência é insuficiente para sustentar o resultado, ou a execução exige nova rodada material de implementação. |

Importante: FAIL não significa automaticamente “patch ruim”, “regressão introduzida” ou “não fazer merge”. O relatório deve separar outcome da missão, qualidade do patch, origem dos findings e decisão humana de merge.

## 11. Evidence publication gate

Antes da avaliação independente, as evidências necessárias para sustentar o resultado devem estar acessíveis ao evaluator por meio do PR, CI, artefatos versionados ou outro local auditável definido pelo projeto.

- Não é necessário anexar todos os screenshots; selecionar evidência mínima e representativa.
- Artefatos citados pelo implementador mas mantidos apenas localmente não podem ser tratados como plenamente auditáveis.
- Se uma evidência relevante não puder ser publicada, o relatório deve limitar a conclusão ou marcar a afirmação como reportada, não auditável.
- O evaluator não deve reconstruir silenciosamente evidências ausentes para “ajudar” a execução.
## 12. Registro mínimo por execução

| Campo | Registro |
| --- | --- |
| Eval Case ID | Identificador estável, por exemplo Eval Case 002. |
| Mission source | Issue usada como fonte de verdade. |
| Protocol | evaluation_protocol_v2. |
| Implementador | Agente/modelo/configuração usada, quando disponível. |
| Baseline | Branch/commit de partida. |
| Baseline checks | Premissas preexistentes relevantes verificadas antes da implementação. |
| Outcome | PASS / PASS WITH CONDITIONS / FAIL. |
| Failure taxonomy | Categoria primária e secundárias, quando houver. |
| Failure origin | INTRODUCED_BY_CHANGE / PREEXISTING_BASELINE / ENVIRONMENT_TOOLING / UNKNOWN. |
| Human Experience Gate | required / not required, com decisão humana registrada quando aplicável. |
| Evidence auditability | Resumo do que é auditável, reportado ou não verificado. |
| Review cycles | Quantidade de ciclos necessários até fechamento. |
| Human minutes | Tempo humano aproximado gasto em revisão/intervenção. |
| Plan divergences | Diferenças entre hipóteses do plano e execução real. |
| Notes | Aprendizados, limitações e decisões humanas. |

## 13. Métricas — uso com cautela

- Não tratar pequenas amostras como estatística robusta.
- Não comparar tarefas muito diferentes como se fossem equivalentes.
- Preferir padrões de falha recorrentes a uma taxa agregada isolada.
- Evitar Goodhart: uma métrica não deve virar objetivo que incentive comportamento ruim.
- Quando possível, usar tarefas reexecutáveis ou casos comparáveis para comparar agentes/configurações.
- Modelos e ferramentas mudam com o tempo; registrar data/configuração quando isso for relevante.
- Não misturar PREEXISTING_BASELINE com defeitos INTRODUCED_BY_CHANGE em métricas de regressão do implementador.
## 14. Formato recomendado do relatório do evaluator

1. Registro mínimo

2. Adherence to mission

3. Baseline findings e failure origin

4. Plan fidelity

5. Acceptance criteria — critério por critério

6. Evidence quality / auditability

7. Regression / scope review

8. Accessibility (quando aplicável)

9. Trade-offs / Human Experience Gate

10. Failure taxonomy — primária e secundárias

11. Final evaluation — PASS / PASS WITH CONDITIONS / FAIL

12. Recomendações de remediation somente depois do diagnóstico e do veredito

## 15. Regras para o evaluator

- Não alterar código, arquivos, testes, commits ou PR durante a avaliação.
- Não corrigir a implementação antes de concluir o diagnóstico.
- Não confundir afirmação do implementador com evidência auditável.
- Não confundir teste verde com atendimento completo da missão.
- Não penalizar como regressão um problema que já existia no baseline; registrar separadamente seu impacto sobre o critério.
- Não transformar preferência estética em fato técnico.
- Não reproduzir a opinião do planner/implementador como veredito independente sem verificar evidências.
- Não reduzir sua função a checklist: findings novos são permitidos quando relevantes ao contrato e sustentados por evidência.
- Quando o caso exigir Human Experience Gate, deixar clara a fronteira entre fatos observáveis e decisão humana.
## 16. Retro curta por caso

Após congelar o resultado inicial e antes de alterar o protocolo, registrar uma retro curta:

1. O que funcionou no processo?

2. O que falhou ou ficou fraco?

3. O protocolo/workflow precisa mudar? Por quê?

4. Qual aprendizado concreto levamos para o próximo caso?

A retro não pode ser usada para reclassificar retroativamente o caso apenas porque o resultado foi inconveniente. Mudanças entram na próxima versão do protocolo ou do workflow.

## 17. Loop de melhoria

O protocolo existe para orientar aprendizado deliberado. Após um conjunto de execuções, o próximo tema de estudo deve ser puxado pelos gargalos observados, não por uma lista genérica de assuntos.

| Padrão observado | Possível foco de melhoria |
| --- | --- |
| SPEC_AMBIGUITY recorrente | Especificação executável, acceptance tests, contratos. |
| MISSING_CONTEXT recorrente | Context engineering, CLAUDE.md/AGENTS.md, ADRs, context locality. |
| WEAK_TEST recorrente | Test design, contract tests, property-based tests, validação comportamental. |
| SCOPE_CREEP recorrente | Escopo, guardrails, revisão e decomposição de tarefas. |
| REASONING_ERROR recorrente | Model routing, decomposição, verificação de hipóteses e revisão independente. |
| PREEXISTING_BASELINE recorrente | Baseline audit direcionado, dívida técnica e critérios que dependem de constraints existentes. |
| Evidência pouco auditável | Melhor publicação de artefatos, automação de evidence capture e disciplina de PR. |
| Human Experience Gate frequente | Definir melhor critérios UX quando possível e preservar decisão humana quando subjetiva. |
| Gate humano muito caro | High-leverage review, melhores evidências e automação de checks repetíveis. |

## 18. Resumo operacional

Issue define a missão → Baseline verifica premissas existentes → Plan registra hipóteses → Implementador executa e publica evidências → Codex avalia independentemente → failure taxonomy + failure origin explicam o resultado → Henrique + Friday fazem o Human/Gate decision → retro alimenta o próximo caso e a próxima versão do protocolo.

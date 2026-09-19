# ADR-0010 — Antecipação do Gatilho de Instalação do Analytics

## Status
Aceito

**Entra em vigor com o merge do Pull Request que o introduz.** A decisão humana que o motiva foi tomada em 2026-09-19, mas a alteração normativa só passa a valer com a integração em `main`; até lá, o critério vigente de A9 é o do ADR-0007, e o gate da Issue #52 permanece fechado.

Refina a propriedade **A9** do [ADR-0007](0007-estrategia-de-analytics.md) e registra o tratamento do **gatilho 5** desse mesmo ADR. Nenhuma outra propriedade do ADR-0007 é alterada. O ADR-0007 permanece integralmente como foi aceito; **onde os dois divergirem quanto ao critério de A9, este ADR prevalece** (a redação vigente está em §1).

## Contexto

O ADR-0007 fixou A9 — *"Instalação por gatilho. Nada é instalado antes de existirem, simultaneamente, **conteúdo publicado** e **distribuição externa**. Antes disso, a ferramenta mede o próprio autor."* — e o corolário de que, até o gatilho, a ausência de analytics **é a decisão sendo cumprida**, não uma lacuna.

A Issue #52 (Analytics v1) foi planejada dentro desse critério. Em 2026-09-13 o autor confirmou que havia conteúdo publicado e que **não** havia distribuição externa deliberada, de modo que A9 foi registrado como **não satisfeito**, com a interpretação acordada de que ele se satisfaz quando existem conteúdo publicado e **ao menos um canal apontando deliberadamente** para o Developer OS — sem tráfego mínimo e sem prova de clique. O Implementation Plan v4 da Issue passou pela revisão independente final de planejamento e foi aprovado; a execução permaneceu bloqueada apenas por A9.

**Estado em 2026-09-19:**

- O conteúdo está publicado em produção via Cloudflare Workers.
- O domínio próprio `developeros.dev` está vinculado ao Worker (ver §2).
- **A distribuição externa ainda não começou.** Está planejada, e é o motivo desta decisão.

**A decisão humana.** O mantenedor decidiu incluir o Analytics v1 no ciclo de **Launch / Production Readiness** e executá-lo **antes** da divulgação pública, para que a coleta esteja operacional desde o primeiro visitante que chegar por ela.

### O que A9 protege, e por que este ajuste o preserva

A9 existe para que a ferramenta não seja instalada enquanto só há o autor a medir. Isso é uma proteção contra **instalar cedo demais**, não contra instalar **imediatamente antes** de um momento conhecido.

O argumento para antecipar é assimétrico: **não existe backfill.** Analytics instalado depois do início da divulgação perde irrecuperavelmente os primeiros acessos — que são justamente os de maior valor, porque o `referrer` desse momento é a variável de controle que torna a comparação de A8 legível. Já o custo de antecipar é limitado e conhecido: o intervalo entre a ativação e o início da distribuição mede, sobretudo, o próprio autor (ver Consequências).

## Decisão

### 1. A9 — redação vigente

A9 passa a ser satisfeito quando existem, simultaneamente:

- **(a) Conteúdo publicado em produção**; e
- **(b) ao menos uma** das duas condições:
  - **(b1) Distribuição externa deliberada** — o critério original do ADR-0007, com a interpretação de 2026-09-13 (ao menos um canal apontando deliberadamente para o Developer OS; sem tráfego mínimo, sem prova de clique). Permanece válido e suficiente.
  - **(b2) Decisão explícita do mantenedor de preparar o lançamento público**, que autoriza instalar e ativar a coleta **antes** do início da distribuição.

A via **(b2)** só é válida se:

1. for **decisão humana do mantenedor** — nenhum agente a infere, presume ou registra por conta própria;
2. estiver **registrada por escrito em artefato versionado** (ADR ou Issue do repositório), **datada** e **nomeando a execução que autoriza**;
3. o conteúdo **já estiver publicado em produção** no momento do registro — (b2) antecipa a distribuição, nunca o conteúdo;
4. registrar a distribuição externa como **ainda não iniciada**. Se ela ocorrer, é fato posterior e independente, e nada neste ADR a declara ocorrida.

A via (b2) é **por execução, não licença geral**: cada uso precisa do seu próprio registro. O corolário do ADR-0007 permanece: até o gatilho, a ausência de analytics não é lacuna.

**Aplicação a este ciclo.** A condição (b2) fica registrada e satisfeita, em 2026-09-19, para a **execução da Issue #52 (Analytics v1)** conforme o Implementation Plan v4 aprovado — e para nenhuma outra. Com o conteúdo já publicado em produção, **a partir da entrada em vigor deste ADR A9 passa a estar satisfeito para a Issue #52**, e a implementação e a ativação podem ocorrer antes do início da distribuição externa. Antes disso, nada é liberado.

### 2. Gatilho 5 do ADR-0007 — domínio próprio

**Fato.** O domínio próprio `developeros.dev` está vinculado ao Worker. Observação de leitura feita em 2026-09-19, sem acesso ao dashboard: o nome resolve para endereços de borda da Cloudflare (`172.67.215.49`, `104.21.45.142`) e a resposta chega com `server: cloudflare` e `cf-ray`, o que é consistente com domínio proxied. O que **não** é verificável pelo repositório (`wrangler.jsonc` não declara `routes`) nem por esta observação é a **forma** do vínculo (Custom Domain ou Route) e o estado do proxy; isso é configuração de dashboard e é registrado na execução, conforme o Plano §10/§11.5 e a regra C5 do ADR-0009.

**Tratamento.** O gatilho 5 — *"Passar a existir domínio próprio proxied na Cloudflare"* — é tratado como **ocorrido**. É a leitura conservadora: o único efeito do gatilho é reabrir a comparação com a Cloudflare Web Analytics, **sem obrigar a trocar**.

**Resultado da comparação: mantém-se o GoatCounter neste ciclo.** O que o domínio devolve à Cloudflare Web Analytics é a única vantagem que o ADR-0007 já registrou como dependente dele — a injeção automática do beacon, que removeria a linha do fornecedor em `src/` e fecharia a lacuna de D6 (A4 e §4). As demais objeções do ADR-0007 **independem do domínio** e permanecem:

- **Eventos customizados.** O levantamento de ago/2026 registra que a Cloudflare Web Analytics não os suporta (*"Not yet"*). O escopo aprovado da Issue #52 inclui dois eventos de produto (`project_external_link_clicked`, `search_result_clicked`); a alternativa não os atende.
- **Retenção.** Dado não amostrado por 7 dias, agregado a cerca de 10% depois.
- **Concentração no provedor de deploy**, nomeada como vetor de erosão de D6 no ADR-0006 §4.

**Limite declarado.** O levantamento técnico de ago/2026 **não foi refeito** nesta decisão. A comparação aplica as objeções já registradas a um único fato novo, o domínio. Se a Cloudflare Web Analytics passar a suportar eventos customizados, isso é fato novo (gatilho 2 abaixo).

**Efeito.** A implementação técnica não é reaberta. O snippet do GoatCounter continua em `src/routes/__root.tsx`, a **lacuna de D6 registrada em A4 e §4 do ADR-0007 permanece**, e o guard de hostname do Plano (`developeros.dev` exatamente) já pressupõe o domínio canônico.

### 3. O que esta decisão não altera

- **O Implementation Plan v4 e o escopo da Issue #52.** A mudança é exclusivamente contratual: nenhum requisito técnico, critério de aceite, teste ou guardrail do plano é alterado. Não há alteração material que justifique nova revisão independente de planejamento (`conventions.md` §11.9).
- **A1–A8 do ADR-0007**, inclusive A6 — revalidada na instalação, como o plano já prevê — e A8, que continua valendo para a leitura dos números.
- **O provedor.** GoatCounter, hospedado, com registro individual de pageviews desligado (A2).
- **A avaliação humana pendente sobre o banner de consentimento.** O ADR-0007 (Contras) a registra como pendente **para o momento da instalação**, sob LGPD e GDPR. Antecipar o gatilho não a dispensa nem a realiza, e **nada aqui presume** que o uso do GoatCounter dispense consentimento ou qualquer outra obrigação de privacidade. Ela é tratada separadamente e continua sendo condição humana anterior à ativação da coleta em produção.

## Consequências

### Prós

- **A coleta já existe quando a divulgação começa.** Os primeiros acessos deixam de escapar por falta de instrumentação, e o `referrer` de abertura pode ser registrado. Isso **não elimina as limitações de A8**: a medição client-side subconta na ordem de um terço, e provavelmente mais para este público, de modo que parte dos acessos do lançamento não será contada mesmo com a coleta ativa. Os números seguem direcionais, não exatos.
- **A9 mantém função de gate.** A via (b2) exige registro escrito, humano, datado e por execução — não é dispensa do critério.
- **Contrato consistente sem reabrir decisão técnica.** O plano aprovado é executado como está.
- **Nenhum ADR aceito é reescrito.** O ADR-0007 permanece íntegro; este ADR o refina de forma rastreável.
- **O gatilho 5 deixa de ser uma pendência de leitura.** Foi observado, tratado e decidido, com o limite declarado.

### Contras e riscos

- **Entre a ativação e o início da distribuição, a ferramenta mede sobretudo o próprio autor** — exatamente o risco que A9 descrevia. O guard de hostname do Plano exclui `localhost` e previews, mas visitas do autor ao domínio de produção contam. Esse intervalo **não deve ser lido como audiência**, sob A8. Nenhum mecanismo de exclusão é adicionado: seria expansão do escopo da Issue #52.
- **(b2) é declarativa, e (b1) é observável.** A via nova depende da integridade do registro humano. É mitigada por exigir registro versionado por execução, mas não elimina a diferença.
- **A lacuna de D6 permanece**, agora com o domínio próprio existindo. É o mesmo contra estrutural que o ADR-0007 já registrava, e é assumido de novo, não resolvido.
- **A comparação do gatilho 5 aplica levantamento de ago/2026.** Preços, limites e capacidades envelhecem rápido; a decisão de manter o GoatCounter é tão atual quanto esse levantamento.
- **A avaliação sobre o banner de consentimento segue aberta** e agora tem data mais próxima: a ativação passa a preceder a divulgação, não a segui-la.

## Gatilhos de reavaliação

1. **Uso da via (b2) tornar-se rotina** — se antecipar deixar de ser exceção registrada por execução, A9 perdeu o sentido como gate e deve ser reavaliado.
2. **A Cloudflare Web Analytics passar a suportar eventos customizados** — reabre a comparação do gatilho 5, hoje decidida pela ausência dessa capacidade. Continua sem obrigar a trocar.

Reavaliação gera **novo ADR**. Este documento não é reescrito para alterar a decisão histórica, conforme `conventions.md` §10.

## Alternativas consideradas

- **Aguardar o início da distribuição para instalar** (manter A9 como está). É a leitura literal do ADR-0007 e a mais barata em governança. Descartada porque perde sem recuperação os primeiros acessos do lançamento, e porque o custo de instalar antes é limitado e conhecido.
- **Emendar o texto de A9 no próprio ADR-0007.** Descartada: ADR aceito não é reescrito para alterar decisão histórica (`conventions.md` §10, `CLAUDE.md`). A rastreabilidade fica em um ADR novo que aponta o anterior.
- **Interpretar (b1) de forma elástica** — contar a divulgação planejada, ou o domínio próprio, como "distribuição externa". Descartada por afirmar como fato algo que não ocorreu; a via (b2) existe exatamente para não fazê-lo.
- **Antecipar sem registro formal**, apenas como decisão de conversa. Descartada: A9 é propriedade durável, e a autorização precisa ser recuperável por quem ler o repositório e a Issue.
- **Trocar para a Cloudflare Web Analytics por causa do domínio.** Descartada pelas três objeções que independem dele, sobretudo a ausência dos eventos que o escopo aprovado exige.

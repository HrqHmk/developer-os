---
title: Por que estou construindo o Developer OS
description: Para que serve o Developer OS, por que agentes de IA escrevem a maior parte do código aqui sob a minha revisão e por que o processo é documentado tão abertamente quanto o resultado.
publishedAt: 2026-09-01
---

O Developer OS começou com uma pergunta simples: e se a forma como eu construo software fosse, ela mesma, o que vale a pena compartilhar, e não só o que foi entregue?

A maioria dos portfólios mostra um resultado pronto e esconde as decisões que levaram até ele. Eu queria o contrário. Cada escolha arquitetural deste projeto fica à vista — como documentação antes do código, como uma Issue no GitHub antes de uma branch, como um diff que um humano revisa antes do merge. O histórico de commits não é maquiado para parecer mais arrumado do que o trabalho realmente foi. Se uma decisão foi revista duas semanas depois, o ADR que a substituiu diz isso, e o antigo continua registrado em vez de ser reescrito em silêncio.

## IA como orquestração, não como piloto automático

Muito do que se chama de "desenvolvimento assistido por IA" na prática significa: descrever o que você quer, receber um diff, fazer o merge. Não é isso que acontece aqui. O Claude faz a maior parte da digitação, mas a forma do trabalho — que problema estamos resolvendo, quais trade-offs são aceitáveis, onde fica a linha arquitetural — vem de uma especificação escrita antes de existir qualquer código. Um agente que chega a uma decisão que a especificação não cobre deve parar e perguntar, não chutar e seguir em frente. Essa expectativa está escrita nas próprias instruções do projeto, não fica só na esperança.

A distinção importa porque as duas abordagens produzem software diferente. O piloto automático otimiza para um diff com cara de plausível. A orquestração otimiza para um sistema cujo autor — humano — ainda consegue explicar, seis meses depois, por que ele é do jeito que é.

## Human-in-the-loop é um ponto de controle, não uma formalidade

Toda mudança entra por um Pull Request, e um Pull Request só é mergeado depois que um humano o lê — a profundidade dessa leitura acompanha o que está em jogo, mas nunca chega a zero. Decisões arquiteturais pertencem à pessoa, não ao modelo: quando algo ainda não está decidido na documentação, o trabalho do agente é apresentar as alternativas e seus trade-offs e esperar, não escolher uma em silêncio. Isso não é uma rede de segurança acoplada depois. É o mecanismo real pelo qual este projeto se mantém coerente, em vez de ir à deriva um diff plausível de cada vez.

## Aprendendo com as próprias decisões do projeto

Eu não escrevi a documentação de arquitetura primeiro para nunca mais mexer nela. Ela é revista conforme restrições reais aparecem — um comportamento de redirect que só surgiu depois de um deploy de verdade, uma suposição sobre cache que se mostrou errada quando foi de fato testada. Cada um desses casos virou um achado documentado e datado, em vez de uma correção silenciosa. Isso é deliberado: o projeto é tanto um registro do que eu errei e corrigi quanto um registro do que funciona. Ler os ADRs em ordem se parece mais com ler um caderno de laboratório do que uma ficha técnica.

É também por isso que "simples até que se prove insuficiente" continua aparecendo como princípio de trabalho, e não como slogan. É tentador partir logo para a solução mais sofisticada. O Developer OS é montado para tornar isso caro de propósito — toda abstração precisa se justificar diante de uma necessidade concreta que já esteja na mesa, não de uma hipotética.

## Por que construir em público, afinal

Porque as partes da engenharia mais difíceis de aprender a partir de um produto pronto são justamente as partes que um produto pronto esconde: o que não funcionou, o que foi reconsiderado, como uma divergência entre duas revisões independentes foi de fato resolvida. Publicar o processo é mais lento do que publicar só o resultado. Acho que é a coisa mais útil para deixar registrada.

Este post é, ele mesmo, um exemplo: o primeiro conteúdo real a passar pelo pipeline de Markdown que este projeto acabou de construir, validado em tempo de build, sem nenhuma exceção aberta para o seu próprio lançamento.

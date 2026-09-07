# HNK EXPERIENCE QA GATE V1

Status: FROZEN FOR KETHER V1

## Axioma

> ESTRUTURA RÍGIDA POR BAIXO. EXPERIÊNCIA VIVA POR CIMA.

O HNK Codex não deve se comportar como apresentação de slides, e-book paginado por botão ou sequência de frases decorativas. Cada Dia precisa transformar conhecimento canônico em uma jornada educacional, simbólica, prática e registrável.

## Reprovação automática de direção

Uma experiência deve ser REPROVADA para release quando a maior parte do percurso puder ser descrita como:

> frase curta → botão CONTINUAR → nova frase curta → botão CONTINUAR.

Também reprova quando:
- a state machine interna aparece ao usuário como contador mecânico de telas;
- microcopy substitui o manuscrito canônico em vez de conduzi-lo;
- o usuário lê sobre uma prática, laboratório, artefato ou rito que nunca chega a experimentar;
- a única interação relevante é avançar/voltar;
- recompensa aparece sem transformação espacial, pedagógica ou narrativa perceptível;
- a interface mantém a mesma composição para todos os campos do Dia;
- efeitos visuais tentam compensar ausência de conteúdo ou pedagogia;
- símbolos tradicionais/HNK são inventados para preencher asset pendente;
- conteúdo privado, XP ou progresso são simulados como se fossem persistidos.

## Gramática mínima

Cada experiência de Dia deve combinar, quando o cânone correspondente suportar, pelo menos cinco modalidades entre:

1. LEITURA — matéria canônica realmente presente.
2. REVELAÇÃO — conceito/símbolo contextualizado.
3. MANIPULAÇÃO — escolha, ordenação, deslocamento, foco ou exploração.
4. PRÁTICA — timer, respiração, vocalização, observação ou exercício guiado.
5. LABORATÓRIO — aplicação concreta/Ordália.
6. ESPELHO — reflexão privada ou evidência estruturada.
7. INTEGRAÇÃO — relação entre pilares, disciplinas ou símbolos.
8. TRANSFORMAÇÃO — mudança perceptível do espaço/interface.
9. PROGRESSÃO — consequência canônica, XP, fragmento, árvore ou desbloqueio.

A presença de modalidades não autoriza inventar conteúdo que o cânone não forneça.

## Regra de macroatos

Estados internos podem ser numerosos. Estados visíveis não devem virar uma coleção de slides.

Para o Day 001 V2, a baseline aprovada é:

1. Limiar
2. Revelação
3. Jachin / Expansão
4. Boaz / Restrição
5. Pilar do Meio / Convergência
6. Selo / Passagem

As antigas 20 posições podem permanecer apenas como referência histórica/engenharia; não podem voltar a ser a apresentação ativa.

## Densidade educacional

O usuário deve sair de um Dia sabendo algo, tendo feito algo e tendo registrado/aplicado algo.

Para o Day 001 isso exige, no mínimo:
- Doutrina canônica de Jachin, Boaz e Pilar do Meio;
- O Louco, Fehu e Hexagrama 1 contextualizados pelo próprio Dia;
- Kavanah de Jachin, Boaz e Meio;
- três distrações como Ordália/laboratório;
- intenção e Espelho da Alma;
- consequência visível na Árvore de Kether;
- fronteira explícita entre experiência tradicional/espiritual e afirmação científica (HNK-EP).

## Imersão

Imersão não é excesso de partículas ou animação. É coerência entre:
- matéria;
- luz;
- tipografia;
- geometria;
- ritmo;
- interação;
- som;
- conteúdo;
- consequência.

Cada macroato deve possuir função e atmosfera próprias. Motion deve orientar, revelar, responder, transformar, recompensar ou respirar — nunca existir apenas para decorar.

## Som

Silêncio pode ser uma escolha artística, mas ausência acidental de áudio em uma experiência que depende de áudio é falha de release.

Nenhuma frequência, binaural, Solfeggio ou preset pode ser inferido silenciosamente. Enquanto não houver referência canônica aprovada, a interface deve declarar `PRESET_PENDING`.

## Privacidade e progressão

- texto íntimo nunca deve ser usado como evidence estruturada;
- Vault deve permanecer cifrado antes do sync;
- XP é decidido pelo servidor;
- revisita não duplica XP;
- progressão não pode ser antecipada visualmente como fato persistido;
- Fragmento I de Vehuiah permanece 5/5, não Day 001.

## Gate humano para vídeo/review

Antes de declarar um vertical slice VISUAL APPROVED, o review deve responder SIM a todas:

- O vídeo parece uma jornada, não slides?
- Há conteúdo educacional substancial visível?
- Há pelo menos três tipos reais de interação além de avançar?
- Os campos do Dia mudam de linguagem espacial?
- A prática é vivida, não apenas anunciada?
- O usuário percebe causa e consequência entre ação e progressão?
- O final transforma o estado do mundo/interface?
- O áudio está presente quando aprovado, ou a pendência está explicitamente representada?
- O material respeita cânone, HNK-EP e assets pendentes?

Qualquer NÃO bloqueia aprovação visual.

## Baseline Day 001

Web ativo: `Day001ImmersiveExperience`

Native ativo: `Day001ImmersiveMobileVerticalSlice`

O CI complementa o review humano com `validate:experience`, impedindo regressões estruturais óbvias. O gate automatizado não substitui revisão visual em vídeo/dispositivo real.
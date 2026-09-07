# HNK KETHER — CICLO I: VEHUIAH 001–005

**Status:** Experience Design v1  
**Arco:** A Faísca de Vehuiah  
**Sephira:** Kether  
**Mundo:** Atziluth  
**Grau:** Neófito  
**Dias:** 001–005  
**XP operacional pelo frontmatter canônico:** 550 XP  
**Tracks presentes nos 5 dias:** `TEURG-101`, `COMP-101`, `BIO-101`

> Esta especificação traduz o conteúdo canônico em experiência. Não altera Doutrina, Kavanah, Ordália ou metadados do Codex.

---

## 1. FUNÇÃO DO CICLO NA JORNADA

Vehuiah deve ensinar ao usuário como **entrar no sistema HNK**.

O arco não começa com complexidade. Ele começa com cinco capacidades fundamentais:

1. **Dia 001 — Entrar:** atravessar o limiar e aceitar a prática.
2. **Dia 002 — Permanecer:** sustentar corpo e atenção sem fugir imediatamente do desconforto comum.
3. **Dia 003 — Observar:** perceber pensamentos e crenças sem tratá-los automaticamente como identidade ou verdade.
4. **Dia 004 — Reconfigurar:** experimentar deliberadamente visualização, linguagem interna e mudança de representação.
5. **Dia 005 — Delimitar:** encerrar o ciclo com respiração, gesto, limite e ritual de fechamento.

A progressão emocional é:

`CENTELHA → ESTABILIDADE → LUCIDEZ → MALEABILIDADE → LIMITE`

Ao concluir 005, o usuário não “vence Vehuiah”. Ele demonstra consistência suficiente para acender o **Fragmento I da Coroa**.

---

## 2. LINGUAGEM VISUAL DO ARCO

Vehuiah é a primeira ignição de Kether. O ciclo deve permanecer dentro da Visual Bible de Kether, mas variar a densidade da luz ao longo dos cinco dias.

### Dia 001 — LIMIAR

- quase-vazio preto/azul profundo;
- uma centelha branca-dourada;
- Kether ainda distante;
- interface reduzida ao essencial.

### Dia 002 — ESTÁTUA

- geometria vertical;
- corpo sugerido como silhueta/estrutura imóvel;
- pulsos discretos de respiração;
- ausência de partículas frenéticas.

### Dia 003 — ESPELHO MENTAL

- pensamentos como elementos transitórios, nunca como monstros;
- nuvens, fios ou fragmentos que surgem e se desfazem;
- centro visual estável.

### Dia 004 — MANTO / TROCA DE REPRESENTAÇÃO

- luz branca-dourada envolvendo a silhueta;
- transição visual pequena→grande / escuro→luminoso para a etapa de Swish;
- evitar promessas visuais de “cura instantânea”.

### Dia 005 — ESFERA / SELO

- expansão concêntrica;
- gesto de corte representado por linhas limpas;
- fechamento numa esfera azul-celeste/dourada;
- acendimento do Fragmento I.

---

## 3. RITMO DE PRODUTO DO CICLO

Cada dia usa a mesma gramática de estado, mas não a mesma composição de tela:

```text
Entrada
  ↓
Beat narrativo do dia
  ↓
Prática principal
  ↓
Teste/restrição
  ↓
Integração
  ↓
Evidence Sheet
  ↓
Selo
```

O usuário deve perceber continuidade entre os cinco dias. A Home de Kether mostra o fragmento atual como uma peça com cinco subdivisões discretas.

---

## 4. DIA 001 — O SALTO CÓSMICO

### Papel dramático

**“Eu entrei.”**

Primeiro contato real com Kether e com o contrato de prática.

### Mecânicas principais

- Threshold Scene;
- Focus Mode temporizado;
- leitura progressiva dos três atos;
- áudio com estado `PRESET_PENDING` até resolução editorial;
- prática vocal local;
- Evidence Sheet;
- primeira centelha visual do Fragmento I.

### Evidência mínima proposta

```json
{
  "protocol_completed": true,
  "return_confirmed": true,
  "focus_minutes": 10,
  "vocal_practice_completed": true,
  "distractions_identified_count": 3
}
```

Texto livre vai para o Vault, não para evidence.

### Saída

`Vehuiah 1/5`

A Coroa NÃO acende ainda.

---

## 5. DIA 002 — IMOBILIDADE CORPORAL

### Papel dramático

**“Eu consigo permanecer.”**

O foco de UX é distinguir desconforto comum de necessidade legítima de ajuste. O app não transforma sofrimento em requisito de sucesso.

### Mecânicas

#### Stillness Timer

- duração canônica principal: 15 minutos;
- timer minimalista;
- usuário pode registrar impulso de movimento com um toque sem encerrar a sessão;
- botão `Ajustar postura` permanece disponível;
- `Pausar` e `Encerrar` sempre visíveis/acessíveis.

#### Impulse Counter

Cada toque registra apenas um evento estruturado:

`movement_impulse += 1`

Não pede justificativa em texto.

#### Pós-prática

- duração efetiva;
- número de impulsos percebidos;
- movimentos efetivos;
- conforto 0–10;
- quietude 0–10.

### Evidência mínima

```json
{
  "protocol_completed": true,
  "return_confirmed": true,
  "stillness_seconds": 900,
  "movement_impulses": 4,
  "comfort": 7
}
```

`900` é exemplo de sessão completa, não valor a ser falsificado quando a prática for interrompida.

### Saída

`Vehuiah 2/5`

Visualmente, a centelha ganha estabilidade, não tamanho explosivo.

---

## 6. DIA 003 — DESPOLARIZAÇÃO DO EGO

### Papel dramático

**“Pensamento não é automaticamente identidade.”**

### Mecânicas

#### Thought Stream

Durante a observação, o usuário pode tocar em um marcador discreto quando notar que se envolveu com uma ideia. Não precisa escrever a ideia naquele momento.

#### Belief Audit

Ao final, o app solicita três itens. Para preservar privacidade, existem duas opções:

1. gravar o texto integral no Journal Vault criptografado;
2. registrar no Practice Record apenas `beliefs_logged_count = 3`.

#### Question Card

O app apresenta as perguntas canônicas/reflexivas sem avaliar a resposta como certa ou errada.

### Evidência mínima

```json
{
  "protocol_completed": true,
  "return_confirmed": true,
  "observation_minutes": 10,
  "beliefs_logged_count": 3,
  "complaint_fast_started": true
}
```

### Saída

`Vehuiah 3/5`

O centro da interface fica mais nítido enquanto os elementos periféricos perdem força.

---

## 7. DIA 004 — PLACEBO INTENCIONAL / RECONFIGURAÇÃO

### Papel dramático

**“Posso experimentar outra representação sem confundi-la com fato.”**

A plataforma deve apresentar o exercício como prática deliberada de imaginação, expectativa, atenção e representação no modelo HNK, sem converter metáforas neuro/quânticas do texto em afirmações clínicas do produto.

### Mecânicas

#### Mantle Visualization

- timer de 10 minutos;
- animação lenta de manto/luz opcional;
- tela pode ser reduzida a áudio + timer para olhos fechados.

#### Cancel Marker

Na etapa de monitoramento, o usuário pode registrar quantas vezes aplicou o comando mental de interrupção/cancelamento, sem registrar conteúdo privado.

#### Swish Interaction

A UI reproduz apenas a transformação espacial descrita:

`imagem pequena/escura → deslocamento → imagem grande/luminosa`

Não exibe mensagem afirmando alteração bioquímica garantida.

### Evidência mínima

```json
{
  "protocol_completed": true,
  "return_confirmed": true,
  "visualization_minutes": 10,
  "cancel_count": 5,
  "swish_completed": true
}
```

### Saída

`Vehuiah 4/5`

A peça do Fragmento I fica quase fechada, mas ainda sem selo.

---

## 8. DIA 005 — BANIMENTO INICIAL POR INTENÇÃO

### Papel dramático

**“Eu delimito e encerro.”**

É o primeiro fechamento de ciclo do HNK.

### Mecânicas

#### QR / Altar Entry

O QR/deep-link abre diretamente o Dia 005. A câmera pode validar o QR do Codex, mas não precisa interpretar “energia” do altar.

#### Porous Breath Pacer

- animação concêntrica lenta;
- inspiração = contração/recepção;
- expiração = expansão;
- duração configurada conforme a prática canônica.

#### Directional Gesture Sequence

O app apresenta a orientação corporal e a sequência de gestos como checklist visual. Não usa câmera para julgar se o gesto foi “correto” no MVP.

#### Closing Sphere

A etapa final fecha a experiência numa esfera visual simples. Depois do Evidence Sheet, ocorre o ritual de ciclo.

### Evidência mínima

```json
{
  "protocol_completed": true,
  "return_confirmed": true,
  "breath_practice_completed": true,
  "directional_sequence_completed": true,
  "journal_record_created": true
}
```

### Saída de ciclo

`Vehuiah 5/5 → Fragmento I aceso`

---

## 9. RITUAL DE ACENDIMENTO — FRAGMENTO I

O acendimento só ocorre depois que `get_kether_crown_state()` retorna o ciclo de Vehuiah com:

```json
{
  "fragment": 1,
  "angel": "Vehuiah",
  "completed_days": 5,
  "lit": true
}
```

### Cena

Duração alvo: 5–10 segundos.

1. As cinco subdivisões convergem.
2. Um único traço da Coroa recebe luz.
3. O node de Kether responde com um pulso.
4. Surge o selo de Vehuiah.
5. O próximo arco — Jeliel / O Silêncio — é insinuado, não explicado em um modal longo.

### Informação mostrada

- `5/5 práticas`;
- XP canônico acumulado no ciclo: `550 XP`;
- Fragmento I: `ACESO`;
- Grau permanece: `Neófito`.

Não há promoção de Grau no fim de Vehuiah.

---

## 10. AUDIO — PENDÊNCIA DE NORMALIZAÇÃO

Os arquivos atuais usam referências de áudio que ainda precisam de normalização editorial de plataforma, incluindo menções a 528 Hz e ao QR com Theta / 432 Hz base.

O Experience Layer não deve decidir sozinho se esses valores são:

- carrier;
- camada Solfeggio;
- diferença binaural;
- preset alternativo;
- ou instruções independentes.

Até existir contrato aprovado, os players do ciclo podem ser implementados com suporte técnico às camadas, mas presets de produção permanecem `PRESET_PENDING` quando houver ambiguidade.

---

## 11. DISCREPÂNCIA DE XP NO TEXTO CANÔNICO

O frontmatter atual define:

- Dia 001: +150 XP
- Dia 002: +100 XP
- Dia 003: +100 XP
- Dia 004: +100 XP
- Dia 005: +100 XP

Total: **550 XP**.

Entretanto, o texto interno dos Dias 002, 003 e 005 ainda menciona verbalmente `cento e cinquenta pontos` em Ordálias.

### Regra do app

O app usa exclusivamente `codex_days.xp`, sincronizado do frontmatter canônico, para prêmio e HUD.

A discrepância textual deve ser corrigida na fonte editorial em tarefa separada; a plataforma não altera o Markdown durante a renderização.

---

## 12. ASSETS NECESSÁRIOS PARA O VERTICAL ARC

Obrigatórios:

- `cycle-vehuiah-emblem`;
- `cycle-vehuiah-background`;
- thumbnails Dias 001–005;
- QR Dias 001–005;
- Kether node active;
- Fragmento I — estados 0/5 a 5/5 como vetor/animação paramétrica;
- partículas/centelha de Vehuiah;
- visual de esfera de fechamento.

Preferência: a progressão 0/5→5/5 deve ser paramétrica em UI, não cinco imagens raster separadas.

---

## 13. QA DO CICLO

O Ciclo I está pronto para produção quando:

- [ ] Dia 001 vertical slice funciona end-to-end;
- [ ] Dias 002–005 reutilizam componentes sem parecer cópias visuais;
- [ ] cada dia produz Practice Session própria;
- [ ] primeira conclusão concede XP canônico uma vez;
- [ ] revisita não duplica XP;
- [ ] Dia seguinte só conclui após anterior;
- [ ] Fragmento I não acende em 4/5;
- [ ] Fragmento I acende em 5/5;
- [ ] Grau continua Neófito;
- [ ] Journal plaintext nunca entra em telemetry/evidence;
- [ ] `Pausar`/`Encerrar` funcionam em todas as práticas temporizadas;
- [ ] áudio ambíguo não é silenciosamente canonizado pela UI;
- [ ] Web, Expo e Studio apresentam o mesmo estado de ciclo.

# HNK KETHER — CICLO III: SITAEL 011–015

**Status:** Experience Design v1  
**Arco:** A Disciplina de Sitael  
**Sephira:** Kether  
**Mundo:** Atziluth  
**Grau:** Neófito  
**Dias:** 011–015  
**XP operacional pelo frontmatter canônico:** 550 XP  
**Tracks presentes nos 5 dias:** `TEURG-101`, `COMP-101`

> Esta especificação traduz o conteúdo canônico em experiência de plataforma. Não altera Doutrina, Kavanah, Ordália, XP ou metadados do Codex.

---

## 1. FUNÇÃO DO CICLO NA JORNADA

Vehuiah ensinou a entrar. Jeliel ensinou a reduzir ruído. Sitael ensina a **dirigir atenção com precisão sem transformar disciplina em violência contra si mesmo**.

O arco possui cinco capacidades:

1. **Dia 011 — Observar:** separar percepção, julgamento e identidade diante do espelho.
2. **Dia 012 — Sustentar:** permanecer com um alvo visual vivo e retornar após distração.
3. **Dia 013 — Corrigir:** aplicar carga cognitiva, identificar erro e retomar sem punição.
4. **Dia 014 — Dirigir:** sustentar voluntariamente um único objeto mental e reconstruí-lo quando necessário.
5. **Dia 015 — Retornar:** externalizar padrões, encerrar simbolicamente e ligar o rito a uma ação concreta futura.

Progressão emocional:

`OBSERVAR → SUSTENTAR → CORRIGIR → DIRIGIR → RETORNAR`

Ao concluir o Dia 015, o usuário acende o **Fragmento III da Coroa de Kether**. O Grau permanece **Neófito**.

---

## 2. PRINCÍPIO DE EXPERIÊNCIA DE SITAEL

Sitael é o primeiro ciclo de Kether em que a plataforma deve fazer a atenção parecer **mensurável sem transformá-la em competição**.

Princípios:

- tempo é dado, não placar;
- distração é evento de retorno, não penalidade;
- erro é dado de correção, não falha moral;
- desconforto não rende bônus;
- segurança física nunca é sacrificada para completar uma prática;
- fenômenos visuais subjetivos não são tratados automaticamente como revelação externa;
- o usuário sempre pode pausar ou encerrar;
- o app mede execução e retorno, não “poder espiritual”.

O ciclo deve ensinar visualmente que **Vontade = escolher/retornar** e **Percepção = notar que saiu**.

---

## 3. LINGUAGEM VISUAL DO ARCO

Sitael continua dentro do DNA de Kether, mas troca a fluidez de Jeliel por geometria mais precisa.

### Dia 011 — ESPELHO / OBSERVADOR

- simetria central suave;
- moldura inspirada em espelho ritual, sem aparência de vaidade;
- alternância visual entre `OBSERVAÇÃO` e `AVALIAÇÃO`;
- nenhum filtro facial, retoque, score de beleza ou análise estética automática.

### Dia 012 — CHAMA / TRATAKA

- um único ponto luminoso dominante;
- interface progressivamente desaparece durante Focus Mode;
- distrações podem ser marcadas por toque discreto;
- nenhuma animação deve incentivar o usuário a não piscar.

### Dia 013 — SEQUÊNCIA / TRITURADOR

- números grandes, sóbrios e sem gamificação arcade;
- ritmo descendente sugerido visualmente, sem revelar respostas;
- correção representada como retorno ao último ponto confiável, não como “erro vermelho”.

### Dia 014 — CÍRCULO AZUL / FOCO INTERNO

- uma referência visual inicial do círculo pode ser mostrada **antes** da prática;
- durante a etapa principal, a tela deve escurecer para não substituir a visualização interna;
- ao final, o círculo reaparece somente como elemento de registro/fechamento.

### Dia 015 — PAPEL / CORTE / RETORNO

- materialidade de papel, cinza, ouro e fogo controlado;
- versão sem fogo deve ter igual dignidade visual, pois o próprio cânone autoriza rasgar o papel;
- a animação final não celebra destruição: ela conduz para a disciplina escolhida para amanhã;
- acendimento do Fragmento III ocorre depois do compromisso de retorno.

---

## 4. DIA 011 — ESPELHO DO OBSERVADOR

### Papel dramático

**“Eu consigo ver antes de julgar.”**

O primeiro treino de Sitael separa três camadas:

`PERCEPÇÃO → AVALIAÇÃO → RESPOSTA`

A experiência não deve aumentar autocobrança estética.

### Mecânicas

#### Mirror Session

- duração canônica por rodada: 5 minutos;
- timer discreto;
- instrução explícita para piscar normalmente;
- nenhuma câmera é necessária: o exercício usa espelho físico;
- o app pode permanecer em modo de baixa luz para não competir com a prática.

#### Judgment Marker

Quando perceber avaliação automática, o usuário pode tocar um marcador simples.

Registro:

`judgment_noticed += 1`

O conteúdo do julgamento não é coletado automaticamente.

#### Observation vs Interpretation

Pós-prática apresenta duas áreas:

- `O que observei` — três características descritivas;
- `O que minha mente acrescentou` — opcional e destinado ao Journal Vault quando houver texto sensível.

No Practice Record, pode permanecer apenas:

- `observations_logged_count`;
- `judgments_noticed`;
- `attention_stability`;
- `practice_seconds`.

### Grounding / saída segura

Se a imagem ficar estranha ou a experiência se tornar intensa:

1. piscar;
2. mover os olhos;
3. olhar três objetos do ambiente;
4. encerrar se desejar.

A plataforma não rotula distorções perceptivas como manifestação externa.

### Evidência mínima proposta

```json
{
  "protocol_completed": true,
  "return_confirmed": true,
  "practice_seconds": 300,
  "observations_logged_count": 3,
  "judgments_noticed": 5,
  "attention_stability": 6
}
```

### Saída

`Sitael 1/5`.

> Nota editorial: a Ordália final do arquivo canônico usa a expressão “conclua o ciclo”, embora este seja o primeiro Dia de Sitael. A plataforma não deve tratar o Dia 011 como encerramento do ciclo; ver issue canônica correspondente.

---

## 5. DIA 012 — TRATAKA PRIMAL

### Papel dramático

**“Eu sustento um alvo sem transformar foco em sofrimento.”**

### Mecânicas

#### Fire Safety Gate

Antes do timer, o app apresenta um checklist curto derivado dos limites canônicos:

- vela em superfície firme;
- distância de materiais inflamáveis;
- chama supervisionada;
- ambiente adequado;
- usuário alerta, não sonolento;
- possibilidade de interromper a qualquer momento.

O checklist não substitui julgamento do usuário.

#### Trataka Timer

- até 10 minutos por sessão;
- não exige chegar a 10 minutos para registrar uma sessão real;
- o tempo efetivo é preservado;
- botão `Distração` discreto registra retornos;
- botão `Encerrar` sempre acessível;
- piscar não interrompe nem penaliza a prática.

#### Return Latency — versão manual inicial

A plataforma v1 não precisa alegar medir automaticamente latência ocular/atencional. O usuário pode registrar percepção simples de retorno:

`rápido / moderado / demorado`.

Medições automáticas futuras exigem protocolo específico e validação separada.

### Evidência mínima

```json
{
  "protocol_completed": true,
  "return_confirmed": true,
  "practice_seconds": 480,
  "distractions": 7,
  "attention_stability": 7,
  "safety_check_completed": true
}
```

`480` é exemplo; não é meta obrigatória.

### Regra de implementação

Uma chama digital pode existir como **tutorial/referência visual**, mas não substitui silenciosamente a prática canônica com vela. Qualquer modo alternativo de prática deve ser aprovado editorialmente antes de ser considerado equivalente para conclusão.

### Saída

`Sitael 2/5`.

---

## 6. DIA 013 — TRITURADOR DE NÚMEROS

### Papel dramático

**“Eu corrijo sem me punir.”**

A sequência `1000 − 7` produz carga cognitiva controlada e torna erros/retornos observáveis.

### Mecânicas

#### Number Crusher Session

O app mostra apenas:

- ponto inicial: `1000`;
- instrução: subtrair 7 mentalmente;
- timer opcional de prática;
- controles `Marcar distração`, `Marcar erro`, `Encerrar`.

A UI **não exibe a próxima resposta** durante o exercício, porque isso destruiria a tarefa cognitiva canônica.

#### Recovery Record

Quando houver erro:

- usuário marca `erro`;
- retorna mentalmente ao último número confiável;
- continua;
- ao final informa o último número alcançado corretamente.

Não há streak, combo, leaderboard ou medalha por velocidade.

#### Load Check

Ao finalizar:

- esforço percebido 0–10;
- irritação 0–10;
- estabilidade 0–10;
- erros;
- distrações;
- último número correto.

Dor de cabeça ou fadiga relevante são motivos legítimos para encerrar.

### Evidência mínima

```json
{
  "protocol_completed": true,
  "return_confirmed": true,
  "start_number": 1000,
  "last_correct_number": 853,
  "errors": 2,
  "distractions": 4,
  "attention_stability": 7
}
```

`853` é exemplo, não benchmark.

### Saída

`Sitael 3/5`.

---

## 7. DIA 014 — CONCENTRAÇÃO UNIDIRECIONAL

### Papel dramático

**“Eu escolho um objeto interno e retorno a ele.”**

O foco migra do mundo externo para representação mental deliberada.

### Mecânicas

#### Reference Phase

Antes de fechar os olhos, o app pode mostrar por alguns segundos um círculo azul simples:

- forma circular;
- azul;
- brilho moderado;
- fundo neutro.

Isso é referência, não “imagem correta obrigatória”.

#### Internal Focus Timer

- 5 minutos;
- tela quase preta;
- nenhum círculo animado durante o exercício principal;
- toque discreto para `retorno` quando o usuário perceber perda do alvo;
- usuário pode encerrar sem penalidade.

#### Reconstruction Record

Ao terminar, registrar:

- estabilidade 0–10;
- nitidez percebida 0–10;
- retornos;
- reconstruções;
- mudanças espontâneas percebidas: sim/não.

Texto interpretativo vai para o Vault quando desejado.

### Exit Grounding

A própria sequência canônica deve aparecer como fechamento:

1. deixar a imagem desaparecer voluntariamente;
2. abrir os olhos;
3. observar três objetos reais;
4. distinguir imaginar / perceber / interpretar.

### Evidência mínima

```json
{
  "protocol_completed": true,
  "return_confirmed": true,
  "practice_seconds": 300,
  "returns": 6,
  "reconstructions": 4,
  "attention_stability": 7
}
```

### Saída

`Sitael 4/5`.

---

## 8. DIA 015 — BANIMENTO PELO FOGO / RETORNO DISCIPLINADO

### Papel dramático

**“Eu nomeio, encerro e provo a decisão pela próxima ação.”**

Sitael termina não em destruição, mas em **responsabilidade futura**.

### Estrutura da experiência

#### A. Externalizar

Usuário registra três padrões que decidiu deixar de alimentar.

Texto integral deve ir para Journal Vault quando sensível. O Practice Record pode guardar somente:

`patterns_externalized_count = 3`.

#### B. Escolher método

O cânone oferece duas vias válidas:

- `fire` — somente quando seguro;
- `tear` — rasgar o papel como alternativa equivalente quando fogo não for apropriado.

A plataforma não reduz XP nem qualidade de conclusão por escolher `tear`.

#### C. Safety Gate para fogo

Se o usuário selecionar fogo, confirmar:

- superfície estável;
- recipiente resistente ao calor;
- materiais inflamáveis afastados;
- água disponível;
- ausência de material plástico/desconhecido;
- supervisão contínua;
- chama completamente apagada ao final.

#### D. Action Commitment

A conclusão exige selecionar/registrar **uma disciplina concreta para amanhã**.

O rito sozinho não é tratado como solução automática do padrão nomeado.

#### E. Follow-up hook

O app pode colocar a disciplina escolhida como lembrete contextual na entrada do Dia 016, sem armazenar texto sensível fora do Vault quando isso revelar informação privada.

### Evidência mínima

```json
{
  "protocol_completed": true,
  "return_confirmed": true,
  "patterns_externalized_count": 3,
  "destruction_method": "tear",
  "action_commitment_created": true,
  "discipline_rating": 6
}
```

### Fechamento do ciclo

Após conclusão válida do Dia 015:

1. `day_completions` confirma 011–015 completos;
2. `get_kether_crown_state()` passa a retornar `fragments_lit >= 3`;
3. o **Fragmento III** acende;
4. a interface mostra `Vehuiah + Jeliel + Sitael` como três fragmentos ativos;
5. o Grau permanece `1 — Neófito`;
6. o próximo ciclo, Elemiah, é apresentado como **A Voz / Disciplina Sonora**.

---

## 9. RESUMO DE EVIDÊNCIA DO CICLO

O resumo de Sitael deve comunicar retorno e precisão, não desempenho competitivo.

Pode mostrar:

- minutos totais de prática atencional;
- número de retornos registrados;
- estabilidade média de atenção;
- erros/correções do Triturador, sem ranking;
- reconstruções da imagem mental;
- conclusão do compromisso de retorno do Dia 015;
- Fragmento III aceso.

Não mostrar:

- “recorde de resistência”;
- ranking de tempo olhando a chama;
- score de beleza/face;
- taxa de “sucesso espiritual”;
- comparação entre usuários.

---

## 10. SAFETY CONTRACT DE SITAEL

### Espelho

- limite canônico de 5 minutos por rodada;
- grounding disponível;
- encerrar diante de ansiedade/desconforto intenso;
- nenhuma leitura automática de fenômenos visuais como revelação.

### Vela / Trataka

- fogo sempre supervisionado;
- piscar é permitido;
- prática não deve ocorrer com sono intenso;
- desconforto ocular relevante encerra a sessão.

### Carga cognitiva

- dor de cabeça/fadiga intensa são sinais para interromper;
- velocidade não é objetivo.

### Fogo no Dia 015

- modo `tear` é canonicamente aceito;
- o app deve preferir segurança à teatralidade do rito;
- nenhuma confirmação de segurança deve ser escondida para acelerar o fluxo.

---

## 11. PRIVACIDADE

O ciclo pode tocar diretamente aparência, autocrítica, padrões pessoais e compromissos.

Portanto:

- comentários sobre o próprio rosto não entram em analytics;
- lista de padrões do Dia 015 não entra em `practice_sessions.evidence` como texto livre;
- conteúdo sensível permanece em Journal Vault;
- métricas estruturadas podem ser sincronizadas somente conforme contrato de Practice Record.

---

## 12. QA DE SITAEL

O ciclo não está pronto até validar:

- [ ] Dias 011–015 respeitam sequência canônica;
- [ ] Fragmento III só acende com 011–015 concluídos;
- [ ] usuário permanece Neófito após Dia 015;
- [ ] Dia 011 não encerra o ciclo apesar da redação editorial conflitante atual;
- [ ] espelho não usa filtros, score facial ou reconhecimento desnecessário;
- [ ] Trataka permite piscar e encerrar;
- [ ] fire safety gate funciona;
- [ ] chama digital não é tratada como equivalente canônico sem aprovação;
- [ ] Number Crusher não revela respostas;
- [ ] Number Crusher não cria ranking/velocidade competitiva;
- [ ] Dia 014 escurece a tela durante visualização interna;
- [ ] grounding de Dia 011 e Dia 014 funciona;
- [ ] Dia 015 oferece `fire` e `tear` com igual validade;
- [ ] Journal Vault recebe texto sensível;
- [ ] revisita não duplica XP;
- [ ] offline preserva Practice Records;
- [ ] acessibilidade e redução de movimento são respeitadas.

---

## 13. HANDOFF PARA PRODUCTION LAB

A implementação de Sitael deve reutilizar componentes compartilhados, sem transformar os cinco dias num template visual idêntico.

Componentes candidatos:

- `PracticeTimer`
- `ReturnMarker`
- `RatingScale`
- `SafetyGate`
- `GroundingExit`
- `EvidenceSheet`
- `JournalVaultLink`
- `CycleProgress`
- `CrownFragmentReveal`
- `CommitmentCard`

Componentes específicos:

- `MirrorObserverFlow`
- `TratakaSession`
- `NumberCrusherSession`
- `InternalImageFocus`
- `ReleaseRitualFlow`

Nenhum componente pode alterar silenciosamente o conteúdo canônico.
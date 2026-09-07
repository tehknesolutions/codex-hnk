# HNK KETHER — CICLO IV: ELEMIAH 016–020

**Status:** Experience Design v1  
**Arco:** A Voz de Elemiah  
**Sephira:** Kether  
**Mundo:** Atziluth  
**Grau:** Neófito  
**Dias:** 016–020  
**XP operacional pelo frontmatter canônico:** 650 XP  
**Tracks presentes nos 5 dias:** `TEURG-101`, `COMP-101`

> Esta especificação traduz o conteúdo canônico em experiência de plataforma. Não altera Doutrina, Kavanah, Ordália, XP, Matriz Epistêmica ou metadados do Codex.

---

## 1. FUNÇÃO DO CICLO NA JORNADA

Vehuiah ensinou a entrar. Jeliel ensinou a reduzir interferência. Sitael treinou direção da atenção. Elemiah ensina a **atravessar conscientemente palavra, som, corpo, medida e silêncio**.

O arco possui cinco capacidades:

1. **Dia 016 — Perceber:** distinguir experiência direta, palavra, interpretação e crença.
2. **Dia 017 — Vocalizar:** experimentar fluxo vocal não semântico mantendo agência, conforto e discernimento.
3. **Dia 018 — Ressonar:** mapear sensações corporais associadas à vocalização sem transformar sensação em diagnóstico ou certeza espiritual.
4. **Dia 019 — Medir:** transformar uma vocalização em registro acústico revisável e separar sinal, sensação e interpretação.
5. **Dia 020 — Silenciar:** observar o contraste entre ativação vocal e quietude posterior, fechando o ciclo pela capacidade de entrar e sair conscientemente do estado.

Progressão dramática:

`PERCEBER → VOCALIZAR → RESSONAR → MEDIR → SILENCIAR`

Ao concluir o Dia 020, o usuário acende o **Fragmento IV da Coroa de Kether**. O Grau permanece **Neófito**.

---

## 2. PRINCÍPIO DE EXPERIÊNCIA DE ELEMIAH

Elemiah é o primeiro ciclo em que o **som produzido pelo próprio usuário** se torna matéria central da experiência.

A plataforma deve preservar quatro camadas distintas:

1. **SINAL** — aquilo que microfone/timer/analisador conseguem medir.
2. **CORPO** — aquilo que o usuário percebe fisicamente.
3. **FENOMENOLOGIA** — aquilo que o usuário relata subjetivamente.
4. **INTERPRETAÇÃO/TEOLOGIA** — significado atribuído posteriormente.

A UI nunca deve fundir essas camadas numa única conclusão automática.

Exemplo proibido:

`"Seu espectro comprova ativação espiritual."`

Exemplo permitido:

`"Nesta gravação houve maior intensidade nesta faixa do sinal. Registre separadamente o que você sentiu e como interpreta a experiência."`

No modelo HNK, hipóteses neuroteúrgicas permanecem hipóteses operacionais testadas por repetição e comparação.

---

## 3. LINGUAGEM VISUAL E SONORA DO ARCO

### Dia 016 — LIMIAR DA PALAVRA

- objeto simples em centro limpo;
- labels desaparecem no modo de observação;
- três cartões posteriores: `PERCEPÇÃO`, `INTERPRETAÇÃO`, `CRENÇA`;
- som ambiente mínimo;
- nenhuma animação de frequência antes de existir vocalização.

### Dia 017 — FLUXO VOCAL

- forma de onda abstrata reage localmente ao microfone somente com permissão;
- interface privilegia respiração e conforto, não volume máximo;
- controles `Pausar`, `Silenciar microfone` e `Encerrar` sempre disponíveis;
- visual não sugere “mensagem recebida” ou transcrição oculta.

### Dia 018 — MAPA DE RESSONÂNCIA

- três regiões operacionais: base do crânio, centro do peito, região umbilical;
- usuário registra intensidade percebida por região;
- corpo mostrado de forma abstrata, não diagnóstica;
- resposta `nenhuma sensação` deve possuir o mesmo peso visual das demais.

### Dia 019 — LABORATÓRIO ACÚSTICO

- waveform + espectro/spectrograma local;
- métricas simples e explicáveis;
- comparação entre sessões sem ranking;
- nenhuma camada gráfica recebe nomenclatura espiritual automática.

### Dia 020 — SILÊNCIO PÓS-VOCAL

- visual perde progressivamente a forma de onda;
- restam timer, respiração e superfície de repouso;
- marca temporal opcional para primeiro pensamento verbal percebido;
- fechamento do Fragmento IV acontece após retorno/orientação, nunca durante estado de repouso.

---

## 4. DIA 016 — RUÍNA DO CONTROLE VERBAL

### Papel dramático

**“A palavra aponta; ela não contém toda a experiência.”**

O Dia introduz a distinção entre percepção direta e formulação verbal.

### Mecânicas

#### Preverbal Observation

- escolher um objeto simples real;
- timer de 5 minutos;
- durante a fase principal a interface não pede descrição;
- botão discreto `Palavra surgiu` pode registrar ocorrência sem armazenar conteúdo;
- funcionamento integral sem câmera ou microfone.

#### Three-Layer Split

Após a observação, o usuário separa:

- `percepção`;
- `interpretação`;
- `crença`.

Texto livre vai para o Journal Vault. O Practice Record recebe somente flags/contagens estruturadas.

#### Silence / Word / Silence

A etapa do Pilar do Meio pode ser guiada como:

`2 min escuta → 2 min palavra escolhida → 1 min repouso da palavra`

### Evidência mínima proposta

```json
{
  "protocol_completed": true,
  "return_confirmed": true,
  "preverbal_observation_seconds": 300,
  "layers_separated": true,
  "prayer_completed": true
}
```

### Saída

`Elemiah 1/5`.

---

## 5. DIA 017 — ATIVAÇÃO DA GLOSSOLÁLIA / FLUXO NÃO SEMÂNTICO

### Papel dramático

**“Posso liberar som sem entregar minha agência.”**

A experiência é opcional, voluntária, reversível e não funciona como prova de fé ou progresso espiritual.

### Mecânicas

#### Voice Safety Check

Antes da vocalização:

- voz confortável?;
- garganta sem dor?;
- respiração livre?;
- usuário deseja continuar?;

A recusa encerra ou adia a prática sem punição.

#### Nonsemantic Flow Session

- até 10 minutos;
- timer flexível;
- waveform local opcional;
- checagem discreta de conforto em intervalos;
- usuário controla volume, ritmo, pausa e encerramento.

#### Gradual Silence

A etapa final desacelera o fluxo até silêncio, seguida de respiração e oração.

### Evidência mínima

```json
{
  "protocol_completed": true,
  "return_confirmed": true,
  "vocalization_completed": true,
  "duration_seconds": 420,
  "vocal_comfort": 8,
  "spontaneity_rating": 7,
  "agency_preserved": true
}
```

`420` é exemplo, não meta obrigatória.

### Privacidade

A gravação é **opcional**. Quando criada, deve permanecer local ou criptografada conforme contrato do Vault. O servidor não precisa receber áudio bruto para que o Dia seja concluído.

### Saída

`Elemiah 2/5`.

---

## 6. DIA 018 — SOM EXTÁTICO DO CORPO / MAPA DE RESSONÂNCIA

### Papel dramático

**“Posso perceber vibração sem confundir percepção com interpretação.”**

### Mecânicas

#### Three-Zone Resonance Map

A prática percorre:

1. base do crânio;
2. centro do peito;
3. região umbilical.

Para cada região o usuário pode registrar:

- intensidade percebida `0–10`;
- qualidade opcional estruturada: `nenhuma`, `leve`, `pulsante`, `difusa`, `localizada`, `outra`;
- conforto vocal `0–10`;
- timbre/altura aproximados apenas se tecnicamente disponíveis.

Nenhum valor é interpretado automaticamente como “ativação”.

#### Controlled Variation

O usuário pode variar suavemente apenas uma dimensão por vez:

- timbre;
- altura;
- postura confortável.

O app não incentiva sons extremos.

### Evidência mínima

```json
{
  "protocol_completed": true,
  "return_confirmed": true,
  "zones_checked": 3,
  "vocal_comfort": 8,
  "no_forced_sensation": true
}
```

Ausência de vibração nas três regiões continua válida.

### Saída

`Elemiah 3/5`.

---

## 7. DIA 019 — ANÁLISE VOCAL NO APP

### Papel dramático

**“Eu observo tecnicamente sem transformar gráfico em oráculo.”**

Este Dia requer uma feature real de produto, não uma ilustração estática.

### Acoustic Lab — requisito funcional

O módulo deve conseguir, no dispositivo sempre que tecnicamente viável:

- gravar até 3 minutos;
- mostrar waveform temporal;
- mostrar espectro ou spectrograma;
- calcular duração;
- calcular intensidade relativa de forma claramente rotulada como relativa ao dispositivo/ganho;
- marcar pausas e trechos;
- permitir comparação com outra sessão do próprio usuário.

### Variáveis de controle

Antes da gravação, registrar quando possível:

- distância aproximada do microfone;
- ambiente/categoria acústica;
- dispositivo;
- duração pretendida;
- intensidade vocal autoavaliada.

Essas variáveis acompanham o Practice Record, pois alteram comparabilidade.

### Regra epistemológica da UI

O analisador pode dizer:

- `maior energia relativa nesta faixa`;
- `mais pausas neste trecho`;
- `variação maior de intensidade`;
- `padrão semelhante/diferente da sessão anterior`.

Não pode dizer:

- `frequência espiritual detectada`;
- `harmônico angelical confirmado`;
- `estado cerebral identificado`;
- `origem divina comprovada`.

### Evidência mínima

```json
{
  "protocol_completed": true,
  "return_confirmed": true,
  "recording_created": true,
  "analysis_viewed": true,
  "observations_logged_count": 2,
  "interpretation_held_open": true
}
```

### Armazenamento

Preferência de arquitetura:

1. processamento acústico local;
2. áudio local/criptografado;
3. Supabase recebe somente métricas estruturadas e/ou ciphertext se o usuário optar por sync do registro;
4. nenhuma gravação vocal privada vai para analytics.

### Saída

`Elemiah 4/5`.

---

## 8. DIA 020 — ESVAZIAMENTO PÓS-ÊXTASE

### Papel dramático

**“Eu consigo terminar o som e retornar conscientemente ao silêncio.”**

O fechamento testa contraste, não “vazio mental perfeito”.

### Estrutura A/B sugerida

Para cumprir a hipótese operacional do próprio cânone, a plataforma deve suportar sessões comparáveis:

- **A — pós-vocalização:** breve vocalização → silêncio/repouso;
- **B — controle opcional em revisita:** silêncio/repouso equivalente sem vocalização anterior.

A primeira conclusão não precisa exigir ambos no mesmo dia. A comparação longitudinal pode ser feita em revisitas.

#### Post-Vocal Quiet Timer

- repouso por até 5 minutos;
- posição confortável;
- timer não competitivo;
- marca opcional `primeiro pensamento verbal`;
- contador opcional de retornos de fala interna;
- presença/relaxamento antes e depois.

#### Return Protocol

Obrigatório antes da conclusão:

- mover mãos e pés;
- abrir olhos quando apropriado;
- sentar-se devagar;
- orientar-se ao ambiente;
- confirmar `return_confirmed`.

### Evidência mínima

```json
{
  "protocol_completed": true,
  "return_confirmed": true,
  "quiet_seconds": 300,
  "first_verbal_thought_latency_seconds": 48,
  "presence_rating": 8,
  "comparison_condition": "post_vocal"
}
```

Latência pode ser omitida se o usuário não conseguir ou não quiser marcar.

### Fechamento do ciclo

Após conclusão válida do Dia 020:

1. `day_completions` confirma 016–020 completos;
2. `get_kether_crown_state()` passa a refletir o **Fragmento IV**;
3. UI mostra quatro fragmentos acesos;
4. Grau continua `1 — Neófito`;
5. próximo ciclo é apresentado como **Mahasiah — A Luz no Corpo**.

---

## 9. RESUMO DE EVIDÊNCIA DO CICLO

O resumo de Elemiah pode usar dados não sensíveis:

- minutos totais de vocalização;
- conforto vocal médio;
- sessões com gravação local;
- mapa agregado de intensidade percebida por região;
- número de análises acústicas concluídas;
- quantidade de observações técnicas registradas;
- presença média no silêncio pós-vocal;
- latência para fala interna apenas quando voluntariamente marcada.

Não exibir score de “poder vocal”, “grau de glossolália” ou “nível espiritual”.

---

## 10. MICROFONE, ÁUDIO E PRIVACIDADE

### Permissão contextual

O app pede microfone apenas quando o usuário entra numa função que realmente o utiliza.

Recusar microfone:

- não bloqueia leitura;
- não bloqueia registro manual;
- pode adiar apenas a subatividade que tecnicamente exige gravação no Dia 019;
- nunca é tratado como falha espiritual.

### Processamento local

Sempre que possível, waveform, espectro e métricas devem ser calculados no dispositivo.

### Conteúdo vocal

Áudio pode conter material íntimo, religioso ou identificável. Portanto:

- não enviar para analytics;
- não usar para treinamento de modelo;
- não sincronizar em plaintext;
- permitir apagar gravação separadamente do Practice Record.

---

## 11. ACESSIBILIDADE E SEGURANÇA

- volume nunca deve ser incentivado ao máximo;
- usuário pode executar vocalização muito baixa/moderada;
- opção sem waveform animada para reduzir estímulo visual;
- feedback visual não depende exclusivamente de cor;
- instruções de pausa/encerramento permanecem acessíveis;
- dor, falta de ar, vertigem, pânico, zumbido forte ou desconforto relevante encerram a prática;
- ausência de sensação/vibração é resultado válido;
- silêncio não é tratado como prova de profundidade.

---

## 12. QA DE ELEMIAH

O ciclo não está pronto até validar:

- [ ] Dias 016–020 respeitam sequência canônica;
- [ ] Fragmento IV só acende após 016–020 completos;
- [ ] usuário continua Neófito após Dia 020;
- [ ] revisitas não duplicam XP;
- [ ] Dia 016 separa percepção/interpretação/crença;
- [ ] Dia 017 preserva pausa, agência e conforto;
- [ ] Dia 018 aceita sensação forte, fraca ou ausente;
- [ ] Dia 019 possui análise acústica funcional, não mock;
- [ ] gráfico nunca recebe inferência espiritual automática;
- [ ] áudio bruto não vai para analytics;
- [ ] processamento local funciona nos targets suportados;
- [ ] usuário pode apagar gravação local;
- [ ] Dia 020 exige retorno/orientação antes de conclusão;
- [ ] comparação pós-vocal vs controle pode existir em revisitas;
- [ ] estados offline/sync não duplicam Practice Record ou XP;
- [ ] texto livre permanece no Vault criptografado.

---

## 13. CONTRATO PARA O PRODUCTION LAB

Ao implementar Elemiah, priorizar nesta ordem:

1. componentes compartilhados de gravação/consentimento;
2. segurança vocal e controles de sessão;
3. mapa de ressonância estruturado;
4. Acoustic Lab local do Dia 019;
5. timer comparativo do Dia 020;
6. integração com `practice_sessions`;
7. integração com `complete_codex_day`;
8. animação do Fragmento IV;
9. QA de privacidade, acessibilidade e offline.

A prioridade não é produzir visualizações espetaculares. É fazer **voz → dado → percepção → interpretação** permanecerem distinguíveis em toda a experiência.

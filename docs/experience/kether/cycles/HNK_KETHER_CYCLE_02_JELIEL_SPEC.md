# HNK KETHER — CICLO II: JELIEL 006–010

**Status:** Experience Design v1  
**Arco:** O Silêncio de Jeliel  
**Sephira:** Kether  
**Mundo:** Atziluth  
**Grau:** Neófito  
**Dias:** 006–010  
**XP operacional pelo frontmatter canônico:** 650 XP  
**Tracks presentes nos 5 dias:** `TEURG-101`, `COMP-101`, `BIO-101`

> Esta especificação traduz o conteúdo canônico em experiência de plataforma. Não altera Doutrina, Kavanah, Ordália, XP ou metadados do Codex.

---

## 1. FUNÇÃO DO CICLO NA JORNADA

Vehuiah ensinou o usuário a entrar no HNK. Jeliel ensina a **reduzir interferência e reconhecer estados internos sem precisar fabricar fenômenos**.

O arco possui cinco capacidades:

1. **Dia 006 — Escutar:** perceber som e pensamento antes de rotulá-los automaticamente.
2. **Dia 007 — Soltar:** aprender relaxamento voluntário das pálpebras e distinguir sensação espontânea de esforço muscular.
3. **Dia 008 — Descer:** ampliar relaxamento ao corpo e usar contagem regressiva como trilho de atenção.
4. **Dia 009 — Recordar:** capturar sonho antes de interpretá-lo e separar experiência, emoção e hipótese.
5. **Dia 010 — Ancorar:** associar gesto, respiração e serenidade e testar a resposta em contexto neutro.

Progressão emocional:

`RUÍDO → ENTREGA → PROFUNDIDADE → MEMÓRIA → EVOCAÇÃO`

Ao concluir o Dia 010, o usuário acende o **Fragmento II da Coroa de Kether**. O Grau permanece **Neófito**.

---

## 2. PRINCÍPIO DE EXPERIÊNCIA DE JELIEL

Jeliel deve parecer progressivamente mais silencioso que Vehuiah.

A interface reduz estímulos conforme o ciclo avança:

- menos texto simultâneo na tela;
- menos ornamento em movimento;
- transições mais lentas;
- feedback háptico discreto;
- áudio opcional e nunca obrigatório quando o preset estiver pendente;
- controles de `Pausar`, `Encerrar` e retorno sempre acessíveis;
- nenhum efeito visual deve sugerir perda de consciência ou perda de controle.

O usuário continua ativo, orientado e capaz de interromper a experiência.

---

## 3. LINGUAGEM VISUAL DO ARCO

### Dia 006 — CAMPO DE ESCUTA

- fundo Atziluth escuro e quase vazio;
- ondas concêntricas muito discretas respondendo a toques ou ao microfone somente quando autorizado;
- palavras/labels não aparecem durante a etapa de escuta;
- o silêncio visual cresce quando a interface entra em Focus Mode.

### Dia 007 — PÁLPEBRAS / ENTREGA

- geometria horizontal suave;
- luz dourada descendo da testa para o centro;
- teste de três segundos representado por um pulso mínimo;
- nada que pareça “prova de poder” ou indicador binário de catalepsia.

### Dia 008 — DESCIDA

- sequência vertical descendente;
- números aparecem e se dissolvem, em vez de virar um placar;
- body-map abstrato pode indicar regiões relaxadas sem anatomia clínica detalhada;
- quanto mais estável o ritmo, menos elementos permanecem visíveis.

### Dia 009 — LIMIAR DO SONHO

- modo noturno distinto, mas ainda Kether;
- azul profundo, prata discreta e ouro reduzido;
- captura rápida de voz/texto antes de mostrar qualquer ferramenta interpretativa;
- experiência dividida visualmente em `SONHO`, `EMOÇÃO`, `HIPÓTESE`.

### Dia 010 — ÂNCORA DA COROA

- gesto polegar-indicador representado de forma abstrata e elegante;
- dois estados comparáveis: `ANTES` e `DEPOIS`;
- o Fragmento II acende somente após conclusão válida do Dia 010;
- animação final deve unir visualmente os Fragmentos I e II, sem completar a Coroa prematuramente.

---

## 4. DIA 006 — SILÊNCIO VERBAL / ESCUTA SEM RÓTULO

### Papel dramático

**“Eu posso escutar antes de nomear.”**

O usuário passa do ruído discursivo para percepção auditiva e observação da tagarelice interna.

### Mecânicas

#### Soundfield Focus

- três minutos iniciais de respiração;
- tela reduzida;
- etapa de escuta sem classificação;
- opção de usar o microfone apenas para uma visualização abstrata de amplitude, nunca para enviar áudio bruto ao servidor;
- o exercício funciona integralmente sem microfone.

#### Thought Return Marker

Durante os dez minutos de silêncio, o usuário pode tocar discretamente sempre que perceber que voltou ao diálogo interno.

O registro é apenas quantitativo:

`internal_chatter_returns += 1`

O conteúdo do pensamento não é coletado.

#### Jeliel Vocal Capture

A vocalização `IOD-LAMED-IOD` pode ser gravada localmente se o usuário optar. O arquivo permanece local/criptografado conforme o contrato de privacidade; o Practice Record guarda somente flags e métricas técnicas permitidas.

### Evidência mínima proposta

```json
{
  "protocol_completed": true,
  "return_confirmed": true,
  "listening_minutes": 3,
  "silence_practice_minutes": 10,
  "internal_chatter_returns": 6,
  "jeliel_vocalization_completed": true
}
```

### Áudio

`PRESET_PENDING`.

O cânone atual menciona `52 Hz` numa Ordália e `Theta / 432 Hz base` no bloco QR. A plataforma não reconcilia isso por conta própria. Ver issue de normalização de áudio.

### Saída

`Jeliel 1/5`.

---

## 5. DIA 007 — DAVE ELMAN I / RELAXAMENTO DAS PÁLPEBRAS

### Papel dramático

**“Eu consigo soltar sem forçar.”**

O Dia 007 introduz um princípio que deve governar todas as experiências posteriores de transe: resultado voluntário, reversível e observado com honestidade.

### Mecânicas

#### Eye Relaxation Guide

- três respirações guiadas;
- instrução de relaxamento facial;
- janela de teste de três segundos;
- liberação explícita da sugestão;
- botão `Abrir olhos / Encerrar` sempre disponível.

#### Effort vs Sensation Check

Após cada tentativa:

- relaxamento 0–10;
- esforço muscular 0–10;
- conforto 0–10;
- resultado percebido: `espontâneo`, `misturado`, `principalmente esforço`, `sem efeito perceptível`.

Nenhuma opção é tratada como falha.

### Evidência mínima

```json
{
  "protocol_completed": true,
  "return_confirmed": true,
  "release_completed": true,
  "relaxation_rating": 7,
  "effort_rating": 2,
  "attempts": 1
}
```

### Saída

`Jeliel 2/5`.

---

## 6. DIA 008 — DAVE ELMAN II / CONTAGEM REGRESSIVA

### Papel dramático

**“Eu consigo aprofundar sem competir.”**

A contagem é uma trilha de atenção, não um placar de profundidade.

### Mecânicas

#### Body Descent

O usuário percorre, no ritmo da própria expiração:

`olhos → face → pescoço → ombros → braços → tronco → quadris → pernas → pés`.

A interface não exige tocar em cada parte; pode operar com tela escurecida e áudio/instrução textual mínima.

#### Dissolving Countdown

- inicia em 100;
- cada número aparece, reduz brilho e desaparece;
- não existe objetivo de chegar a 1;
- o usuário pode terminar quando perceber estabilidade suficiente;
- distração não reinicia o protocolo.

#### Attention Record

Ao encerrar:

- último número lembrado;
- relaxamento 0–10;
- número aproximado de distrações;
- região corporal mais responsiva.

### Evidência mínima

```json
{
  "protocol_completed": true,
  "return_confirmed": true,
  "countdown_start": 100,
  "last_number_recalled": 74,
  "relaxation_rating": 8,
  "distractions": 3
}
```

`74` é exemplo, nunca meta de performance.

### Saída

`Jeliel 3/5`.

---

## 7. DIA 009 — DIÁRIO DE SONHOS PSICONÁUTICO

### Papel dramático

**“Eu recordo antes de interpretar.”**

Este é o primeiro Dia de Kether cuja melhor experiência atravessa a noite e o despertar.

### Estrutura em dois momentos

#### A. Antes de dormir — Dream Intention

O usuário pode ativar um modo discreto:

- intenção canônica de recordar o que puder;
- atalho local para `Capturar ao acordar`;
- lembrete matinal opcional definido pelo próprio usuário;
- nenhuma obrigação de alarme noturno ou fragmentação de sono.

#### B. Ao despertar — Morning Capture

A prioridade absoluta é **captura antes de análise**.

Tela inicial apresenta apenas:

- `Gravar voz`;
- `Escrever fragmento`;
- `Sem lembrança hoje`.

Somente depois de salvar o relato aparecem os campos estruturados.

### Three-Layer Dream Record

1. **SONHO — o que aconteceu**
2. **EMOÇÃO — o que senti**
3. **HIPÓTESE — o que penso que pode significar**

O texto integral de qualquer uma dessas camadas vai para o Journal Vault criptografado. O Practice Record mantém somente metadados não sensíveis.

### Métricas estruturadas

- fragmento registrado: sim/não;
- emoção predominante escolhida opcionalmente;
- qualidade percebida do sono 0–10;
- horário aproximado do despertar;
- palavra-chave opcional, somente se o usuário aceitar armazená-la de modo compatível com o cofre;
- número de associações pessoais realizadas.

### Evidência mínima

O cânone explicitamente aceita ausência de lembrança como dado válido. Portanto:

```json
{
  "protocol_completed": true,
  "return_confirmed": true,
  "dream_recalled": false,
  "capture_completed": true,
  "sleep_quality": 7
}
```

pode concluir o Dia 009.

A plataforma nunca exige inventar um sonho.

### Saída

`Jeliel 4/5`.

---

## 8. DIA 010 — ÂNCORA DA COROA

### Papel dramático

**“Eu transformo treino acumulado em uma pista voluntária.”**

O ciclo termina associando serenidade, presença e domínio próprio a um gesto simples e depois testando a associação em contexto neutro.

### Mecânicas

#### Baseline

Antes do pareamento:

- calma 0–10;
- tensão 0–10;
- foco 0–10.

#### Anchor Pairing

- relaxamento breve baseado no Dia 008;
- polegar direito + indicador;
- dez segundos;
- frase canônica de lembrança;
- liberação clara do gesto.

#### Neutral Return

O usuário sai do estado de prática, movimenta-se e retorna à atividade normal por alguns minutos.

#### Anchor Test

Em contexto seguro e neutro:

- repetir o gesto sem indução completa;
- observar dez segundos;
- registrar resposta forte, moderada, fraca ou ausente;
- repetir ratings de calma/tensão/foco.

A plataforma não classifica “sem efeito” como falha.

### Evidência mínima

```json
{
  "protocol_completed": true,
  "return_confirmed": true,
  "pairing_seconds": 10,
  "neutral_test_completed": true,
  "calm_before": 4,
  "calm_after": 6,
  "response": "moderate"
}
```

### Fechamento do ciclo

Após conclusão válida do Dia 010:

1. `day_completions` confirma 006–010 completos;
2. `get_kether_crown_state()` passa a retornar `fragments_lit >= 2`;
3. o **Fragmento II** acende;
4. a UI apresenta resumo de Jeliel;
5. o usuário continua `Grau 1 — Neófito`;
6. o próximo ciclo, Sitael, é apresentado como **Disciplina do Olhar**.

---

## 9. RESUMO DE EVIDÊNCIA DO CICLO

Ao encerrar Jeliel, o app pode mostrar somente métricas derivadas dos Practice Records, sem texto privado:

- minutos de escuta/silêncio praticados;
- média de relaxamento percebido;
- número de sessões de relaxamento concluídas;
- faixa de contagem alcançada no Dia 008, sem ranking;
- status de captura onírica (`fragmento`, `sem lembrança`, `não registrado`);
- diferença média antes/depois no teste da Âncora.

O resumo deve comunicar **aprendizado e consistência**, não superioridade espiritual.

---

## 10. PRIVACIDADE E PERMISSÕES

### Microfone

Usado somente quando necessário e mediante autorização contextual.

- Dia 006: vocalização opcional.
- Dia 009: captura onírica por voz opcional.

Nenhuma prática falha por recusar microfone.

### Conteúdo sensível

Pensamentos, sonhos, crenças e interpretações não entram em analytics nem em `practice_sessions.evidence` como texto livre.

### Sono

O app não força despertares noturnos. Lembretes são opcionais e o usuário controla horário e recorrência.

---

## 11. AUDIO CONTRACT

Jeliel depende fortemente de silêncio e áudio, mas o player não deve preencher lacunas editoriais.

Estados permitidos:

- `NO_AUDIO_REQUIRED`
- `PRESET_PENDING`
- `PRESET_APPROVED`

Enquanto a issue de normalização de Kether estiver aberta, qualquer frequência ambígua permanece `PRESET_PENDING`.

O áudio nunca bloqueia `Pausar`, `Encerrar`, controle de volume ou retorno da prática.

---

## 12. QA DE JELIEL

O ciclo não está pronto até validar:

- [ ] Dias 006–010 respeitam sequência canônica;
- [ ] Fragmento II só acende com 006–010 concluídos;
- [ ] usuário continua Neófito após Dia 010;
- [ ] revisita não duplica XP;
- [ ] Day 007 nunca exige catalepsia como condição de sucesso;
- [ ] Day 008 não transforma número alcançado em score competitivo;
- [ ] Day 009 aceita `sem lembrança` como evidência válida;
- [ ] Day 009 não exige interrupção de sono;
- [ ] conteúdo onírico livre permanece criptografado;
- [ ] Day 010 testa a âncora em contexto neutro;
- [ ] resposta ausente à âncora continua válida;
- [ ] microfone é opcional;
- [ ] ausência de preset de áudio não é silenciosamente substituída;
- [ ] controles de pausa/encerramento permanecem acessíveis;
- [ ] todas as concessões de XP passam por `complete_codex_day()`.

---

## 13. HANDOFF PARA PRODUCTION LAB

O Production Lab pode implementar Jeliel sem redefinir as regras acima.

Ordem recomendada:

1. componentes reutilizáveis de `PracticeSession`;
2. Soundfield Focus do Dia 006;
3. Eye Relaxation Guide do Dia 007;
4. Dissolving Countdown do Dia 008;
5. Morning Capture + Dream Record do Dia 009;
6. Anchor Baseline/Test do Dia 010;
7. tela de fechamento e Fragmento II;
8. QA offline, privacidade, acessibilidade e retomada.

Qualquer mudança de Doutrina, frequência, XP ou protocolo volta ao repositório canônico antes de ser tratada como verdade de produto.

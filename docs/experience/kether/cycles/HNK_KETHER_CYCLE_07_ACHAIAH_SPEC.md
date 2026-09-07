# HNK KETHER — CICLO VII: ACHAIAH 031–035

**Status:** Experience Design v1  
**Arco:** A Profundidade, a Reversibilidade e o Limite  
**Sephira:** Kether  
**Mundo:** Atziluth  
**Grau:** Neófito  
**Dias:** 031–035  
**XP operacional pelo frontmatter canônico:** 800 XP  
**Tracks presentes nos 5 dias:** `TEURG-101`, `COMP-101`

> Esta especificação traduz o conteúdo canônico em experiência de plataforma. Não altera Doutrina, Kavanah, Ordália, XP, fórmula teúrgica, operadores tradicionais ou metadados do Codex.

---

## 1. FUNÇÃO DO CICLO NA JORNADA

Achaiah é o último ciclo de cinco dias antes do Portal 036. Ele não deve parecer apenas “mais cinco práticas”. Sua função é provar que o usuário consegue entrar em estados mais profundos **sem perder agência, orientação, memória, responsabilidade ou capacidade de retorno**.

Os cinco dias formam uma sequência deliberada:

1. **Dia 031 — Entregar:** reduzir temporariamente o comando analítico sem perder identidade ou discernimento.
2. **Dia 032 — Descer:** aprofundar um estado por níveis graduados e verificáveis.
3. **Dia 033 — Aquietar:** reduzir resposta motora automática mantendo conforto e voluntariedade.
4. **Dia 034 — Ancorar:** instalar e testar uma chave cinestésica reversível para evocar componentes do estado.
5. **Dia 035 — Delimitar:** encerrar Achaiah com construção espacial, limite ritual, prudência e retorno responsável.

Progressão dramática:

`ENTREGAR → DESCER → AQUIETAR → ANCORAR → DELIMITAR`

Ao concluir o Dia 035, o usuário acende o **Fragmento VII da Coroa de Kether**. Isso completa `7/7` fragmentos, mas **não promove o Grau**. A promoção de Neófito para Iniciado permanece exclusiva do Portal 036.

---

## 2. PRINCÍPIO CENTRAL DE ACHAIAH

### Profundidade não é perda de controle

Achaiah deve ser desenhado em torno de quatro invariantes:

1. **voluntariedade** — o usuário escolhe entrar, permanecer e sair;
2. **reversibilidade** — toda prática possui retorno explícito;
3. **orientação** — estados profundos não suspendem responsabilidade nem leitura do ambiente;
4. **segurança acima de performance** — dor, falta de ar, vertigem, desorientação ou sofrimento relevante autorizam interromper sem transformar isso em fracasso.

### Regra de gamificação

O app nunca premia:

- suportar dor;
- ficar imóvel apesar de dormência persistente;
- “ir mais fundo” que outra pessoa;
- relatar fenômenos mais intensos;
- demorar mais para responder ao ambiente;
- sentir-se “invulnerável”.

O progresso de Achaiah é medido por **entrada mais clara, menor esforço, estabilidade, discriminação e retorno mais limpo**.

---

## 3. LINGUAGEM VISUAL DO ARCO

Achaiah é visualmente mais sóbrio que os ciclos anteriores.

- preto profundo e branco de Kether;
- azul ritual apenas quando o cânone o exige no Dia 035;
- ouro reduzido a estados de conclusão/limiar;
- movimento desacelerado conforme o ciclo aprofunda;
- nenhuma estética de terror, morte literal, hospitalização ou paralisia;
- “Morte do Ego” é tratada como **suspensão temporária de predominância analítica**, conforme o próprio cânone;
- “catatonia corporal” mantém o título canônico, mas a UX explica imediatamente que a prática é **imobilidade voluntária e reversível**, não diagnóstico clínico.

---

## 4. DIA 031 — MORTE DO EGO NA CRUZ

### Papel dramático

**“Eu consigo entregar o comando analítico sem abandonar discernimento.”**

### Estrutura comparativa

#### Condition A — ANALYSIS

- questão simples e não urgente;
- 10 minutos de análise deliberada;
- registrar velocidade mental, tensão, repetição, esforço e clareza.

#### Condition B — SURRENDER

- 10 minutos de entrega silenciosa;
- pensamentos reconhecidos sem disputa;
- marcador mental `entrego`;
- silêncio entre pensamentos observado sem obrigação de produzi-lo.

### Return Gate

Ao final:

- abrir os olhos;
- nomear cinco objetos;
- mover mãos e pés;
- registrar clareza de retorno;
- declarar uma responsabilidade concreta retomada no cotidiano.

### Safety rule

Se houver desorientação intensa, medo crescente ou sensação persistente de perda de controle:

- interromper;
- abrir os olhos;
- orientar-se no ambiente;
- marcar `safety_stop`;
- não apresentar o episódio como avanço espiritual.

### Evidência mínima proposta

```json
{
  "protocol_completed": true,
  "return_confirmed": true,
  "analysis_condition_completed": true,
  "surrender_condition_completed": true,
  "comparison_logged": true,
  "responsibility_resumed": true,
  "safety_stop": false
}
```

### Saída

`Achaiah 1/5`.

---

## 5. DIA 032 — ELEVADOR DE ESDAILE

### Papel dramático

**“Eu consigo aprofundar por etapas e retornar pelo mesmo eixo.”**

### Elevator Descent

- sete níveis;
- cada nível pode receber um marcador corporal reconhecido pelo usuário;
- não exigir que todos os marcadores apareçam;
- nível final: três minutos de observação;
- profundidade é autorrelato, não medição objetiva do cérebro.

### Condition A — ELEVATOR

Visualização completa:

- cabine;
- portas;
- descida;
- sete andares;
- marcadores somáticos;
- retorno sete → um.

### Condition B — COUNTDOWN

- contar de sete a um;
- mesma postura/duração aproximada;
- sem elevador;
- sem subsolo;
- sem linguagem de anestesia;
- retorno um → sete.

### Product rule — “anestesia natural”

O texto canônico já restringe essa expressão a hipótese fenomenológica. Portanto a plataforma:

- não oferece teste de dor;
- não pede que o usuário ignore sintomas;
- não usa o exercício como substituto de anestesia ou cuidado médico;
- não calcula “nível anestésico”.

### Evidência mínima

```json
{
  "protocol_completed": true,
  "return_confirmed": true,
  "elevator_condition_completed": true,
  "countdown_control_completed": true,
  "critical_floor_logged": true,
  "orientation_preserved": true
}
```

### Saída

`Achaiah 2/5`.

---

## 6. DIA 033 — TRANSE DE CATATONIA CORPORAL

### Papel dramático

**“Eu consigo distinguir impulso de movimento e decisão de mover.”**

### UX naming

O título canônico permanece visível. A interface acrescenta uma explicação curta e persistente:

> `Neste protocolo, “catatonia corporal” significa imobilidade confortável, voluntária e reversível. Não é diagnóstico clínico.`

### Condition A — ESDAILE STILLNESS

- posição confortável;
- 15 minutos no bloco principal;
- integração pode chegar a até 20 minutos conforme o cânone;
- registrar impulsos motores;
- movimentos necessários são permitidos;
- som ambiental pode ser percebido sem obrigação de resposta.

### Condition B — QUIET CONTROL

- mesma posição/duração aproximada;
- sem indução de Esdaile;
- pequeno ajuste corporal permitido a cada minuto;
- mesmos indicadores.

### Stillness Timer

O timer não mostra streak nem “recorde de imobilidade”.

Métricas possíveis:

- duração;
- impulsos motores;
- movimentos realizados;
- conforto 0–10;
- tensão 0–10;
- profundidade 0–10;
- clareza de retorno 0–10.

### Hard safety gate

Dor, dormência persistente, falta de ar, vertigem, alteração circulatória percebida ou desconforto crescente → mover-se/interromper.

`movement_for_safety = valid_data`, nunca falha.

### Evidência mínima

```json
{
  "protocol_completed": true,
  "return_confirmed": true,
  "esdaile_condition_completed": true,
  "quiet_control_completed": true,
  "motor_impulses_logged": true,
  "voluntary_movement_return_confirmed": true
}
```

### Saída

`Achaiah 3/5`.

---

## 7. DIA 034 — INSTALAÇÃO DO SIGNO-SINAL FINAL

### Papel dramático

**“Eu consigo instalar, testar e cancelar uma chave de estado.”**

### Installation

No Esdaile profundo e estável:

1. três respirações;
2. frase canônica: `A Vida Zoe flui por mim em silêncio`;
3. polegar + indicador por cinco segundos;
4. um minuto de silêncio;
5. repetir a sequência três vezes.

### Condition B — CONTROL GESTURE

Após retorno ao estado comum e intervalo canônico:

- polegar + dedo médio;
- cinco segundos;
- sem frase;
- sem intenção de evocar estado;
- registrar os mesmos indicadores.

Depois testar:

- polegar + indicador;
- sem reentrar previamente no transe;
- medir latência autorrelatada e componentes evocados.

### Anchor Test Record

- intervalo instalação → teste;
- silêncio;
- presença;
- relaxamento;
- profundidade;
- latência;
- componente que apareceu primeiro;
- expectativa percebida;
- cancelamento voluntário confirmado.

### Cancel Gesture

O encerramento deve ser explícito:

- abrir as mãos;
- respirar;
- orientação ambiental;
- confirmação `estado encerrado`.

### Regra de produto

A UI nunca chama a âncora de:

- irresistível;
- permanente por definição;
- comando inconsciente infalível.

Durabilidade é um dado longitudinal a ser testado.

### Evidência mínima

```json
{
  "protocol_completed": true,
  "return_confirmed": true,
  "installation_repetitions": 3,
  "control_gesture_completed": true,
  "anchor_test_completed": true,
  "cancel_confirmed": true
}
```

### Saída

`Achaiah 4/5`.

---

## 8. DIA 035 — RITUAL DO PENTAGRAMA PRIMAL

### Papel dramático

**“Eu consigo estabelecer um limite, encerrá-lo e voltar ao cotidiano com mais prudência.”**

### Canonical ambiguity

O arquivo atual chama a prática de **Ritual do Pentagrama Primal**, porém a execução descrita utiliza:

- três círculos concêntricos;
- linhas azuis;
- Tetragrammaton em chamas azuis;
- ALEPH-CHETH-ALEPH;
- nenhum traçado explícito de pentagrama.

A experiência deve ficar com `RITUAL_GEOMETRY_EDITORIAL_REVIEW` para qualquer asset ou instrução que introduza um pentagrama visual não especificado no texto atual.

O app **não inventa um pentagrama** para preencher o título.

### Condition A — FULL RITUAL

- espaço livre;
- três círculos concêntricos;
- visualização azul;
- Tetragrammaton conforme referência editorial aprovada;
- cinco minutos no centro;
- encerramento e grounding.

### Condition B — GEOMETRIC CONTROL

- mesmos três círculos;
- cinza neutro;
- sem nome sagrado;
- sem chama azul;
- sem fórmula;
- mesmos indicadores.

### Boundary Record

- tempo de construção;
- dispersões;
- estabilidade espacial;
- sensação de limite;
- intrusões percebidas;
- presença;
- segurança subjetiva;
- clareza pós-prática.

### Proteção ≠ invulnerabilidade

A plataforma preserva a linguagem tradicional do cânone, mas nunca conclui que o usuário está fisicamente protegido de riscos.

Após a prática pode haver um checkpoint:

`Esta experiência aumentou sua prudência ou sua impulsividade?`

O resultado desejável de integração é **mais orientação e responsabilidade**, não grandiosidade.

### Evidência mínima

```json
{
  "protocol_completed": true,
  "return_confirmed": true,
  "full_ritual_completed": true,
  "geometric_control_completed": true,
  "boundary_comparison_logged": true,
  "prudence_check_completed": true
}
```

### Saída

`Achaiah 5/5` → **Fragmento VII aceso** → `Coroa 7/7`.

O usuário permanece `Neófito` até o Portal 036.

---

## 9. EVIDENCE SHEET DE ACHAIAH

Cada sessão deve continuar distinguindo:

- **E1** — duração, ordem, latência, intervalos, movimentos, dispersões;
- **E2** — respiração, postura, tensão, ruminação, resposta motora, recuperação;
- **E3** — silêncio, profundidade, presença, peso, limite, segurança subjetiva;
- **E4** — Cruz, Esdaile, signo-sinal, círculos/Tetragrammaton e ALEPH-CHETH-ALEPH como operadores HNK;
- **E5** — Salmo 3:5, confiança, prudência, responsabilidade e relação com Deus.

A UI não precisa mostrar cinco formulários. O Practice Record grava campos estruturados e o Vault recebe texto sensível opcional.

---

## 10. REGRAS DE COMPLETION

Dias 031–035 seguem o contrato global de Kether:

`AVAILABLE → ACTIVE → EVIDENCE_PENDING → COMPLETE`

Regras adicionais:

1. se o Dia possui condição ativa + controle, ambos compõem uma única conclusão canônica;
2. XP é concedido somente uma vez;
3. revisitas criam nova `practice_session`, sem novo XP;
4. interrupção por segurança não apaga a tentativa;
5. um `safety_stop` pode exigir nova sessão para conclusão, mas jamais é apresentado como fracasso moral ou espiritual;
6. Dia 035 concluído deriva Fragmento VII; nenhum cliente grava fragmento diretamente;
7. `Coroa 7/7` não altera Grau;
8. Portal 036 continua bloqueado até todas as conclusões 001–035 existirem.

---

## 11. SUMÁRIO DE MECÂNICAS

| Dia | Mecânica principal | Comparador | Evidência-chave |
|---|---|---|---|
| 031 | Surrender/Analysis Lab | análise × entrega | ruminação, silêncio, retorno |
| 032 | Elevator Descent | elevador × contagem | nível crítico, profundidade, orientação |
| 033 | Voluntary Stillness | Esdaile × quiet control | impulsos, conforto, reversibilidade |
| 034 | Kinesthetic Anchor | signo-sinal × gesto controle | latência, componente evocado, cancelamento |
| 035 | Ritual Boundary | completo × geometria neutra | limite, intrusões, prudência, clareza |

---

## 12. HANDOFF PARA PRODUCTION LAB

A implementação de Achaiah exige pelo menos:

- reusable `ConditionPair` component;
- timer com retorno/grounding obrigatório;
- contador manual de impulsos/dispersões sem gamificação competitiva;
- Elevator visualizer opcional e modo tela escurecida;
- structured depth/return record;
- stillness safety state;
- anchor installation/test flow;
- explicit cancel state;
- ritual boundary guide;
- reference gate para qualquer geometria não fixada editorialmente;
- Journal Vault separado do Practice Record;
- Crown UI que acende o Fragmento VII somente após Dia 035 completo.

---

## 13. DEFINITION OF DONE — CICLO VII

Achaiah está implementado quando:

- [ ] Dias 031–035 executam ponta a ponta;
- [ ] todas as condições comparativas têm par completo;
- [ ] todo estado profundo possui retorno explícito;
- [ ] safety stop é funcional e testado;
- [ ] nenhum mecanismo recompensa dor, paralisia, desorientação ou intensidade fenomenológica;
- [ ] Dia 034 pode instalar, testar e cancelar o signo-sinal;
- [ ] Dia 035 não inventa geometria canônica ausente;
- [ ] Fragmento VII deriva de conclusões 031–035;
- [ ] Coroa exibe `7/7` após conclusão válida;
- [ ] Grau permanece Neófito;
- [ ] Portal 036 torna-se disponível somente conforme contrato de progressão;
- [ ] XP total do ciclo é 800 pela fonte operacional atual;
- [ ] revisitas não duplicam XP;
- [ ] texto privado permanece no Vault;
- [ ] acessibilidade e reduced motion funcionam;
- [ ] mobile/web respeitam a mesma semântica de estados;
- [ ] typecheck, testes e CI permanecem verdes.

---

## 14. TRANSIÇÃO PARA O PORTAL 036

Após o Dia 035, a Coroa está completa, mas ainda fechada.

A tela final não diz `Você é Iniciado`.

Ela diz semanticamente:

> **A Coroa está completa. O Portal pode agora ser enfrentado.**

Estado:

`Neófito + Coroa 7/7 + Dias 001–035 completos → Portal 036 AVAILABLE`

Somente a conclusão canônica do Portal executa a promoção iniciática definida no contrato de progressão.

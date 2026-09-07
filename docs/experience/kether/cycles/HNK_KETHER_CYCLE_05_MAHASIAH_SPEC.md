# HNK KETHER — CICLO V: MAHASIAH 021–025

**Status:** Experience Design v1  
**Arco:** A Luz no Corpo e no Espaço  
**Sephira:** Kether  
**Mundo:** Atziluth  
**Grau:** Neófito  
**Dias:** 021–025  
**XP operacional pelo frontmatter canônico:** 700 XP  
**Tracks presentes nos 5 dias:** `TEURG-101`, `COMP-101`, `BIO-101`

> Esta especificação traduz o conteúdo canônico em experiência de plataforma. Não altera Doutrina, Kavanah, Ordália, XP, fórmula teúrgica, operadores tradicionais ou metadados do Codex.

---

## 1. FUNÇÃO DO CICLO NA JORNADA

Mahasiah desloca Kether da atenção abstrata para um laboratório de **corpo, gesto, mapa e espaço**.

Os cinco dias formam uma expansão progressiva:

1. **Dia 021 — Conduzir:** combinar respiração, visualização e rastreamento do eixo Kether–Malkuth.
2. **Dia 022 — Traçar:** aprender, memorizar e executar o Dai Koo Myo como operador tradicional adotado pelo Codex.
3. **Dia 023 — Comparar:** aplicar o protocolo na Coroa e contrastar sessão ativa com condição controle.
4. **Dia 024 — Percorrer:** transformar um ponto em circuito regional superior e comparar mapas.
5. **Dia 025 — Estabelecer:** deslocar o protocolo do corpo para o ambiente, usando AR para padronizar posição e percurso.

Progressão dramática:

`CONDUZIR → TRAÇAR → COMPARAR → PERCORRER → ESTABELECER`

Ao concluir o Dia 025, o usuário acende o **Fragmento V da Coroa de Kether**. O Grau continua **Neófito**.

---

## 2. PRINCÍPIO DE EXPERIÊNCIA DE MAHASIAH

Mahasiah é o primeiro ciclo em que a plataforma deve mostrar claramente as cinco camadas epistemológicas do HNK sem transformá-las em cinco telas burocráticas.

A experiência diferencia:

- **E1 — Instrumental:** tempo, posição, distância, condições ambientais, geometria e dados capturados pelo dispositivo;
- **E2 — Psicofisiológico/Comportamental:** respiração, postura, estabilidade, coordenação e desempenho observável;
- **E3 — Fenomenológico:** calor, pressão, pulsação, formigamento, presença, silêncio, imagens e outras sensações relatadas;
- **E4 — Tradicional/Teúrgico:** Prana/Ki, Dai Koo Myo, Kether–Malkuth, Sephirot/Chakras superiores, Atziluth e MEM-HE-SHIN como operadores do modelo HNK;
- **E5 — Teológico:** Salmo 34:4, oração, ética e autoridade de Deus.

### Regra de produto

O app **não funde automaticamente essas camadas**.

Uma sensação corporal pode ser registrada em E3 sem virar afirmação biológica, diagnóstico ou prova espiritual. Uma diferença entre condição ativa e controle pode sustentar comparação dentro do protocolo HNK sem ser apresentada como confirmação científica externa.

---

## 3. LINGUAGEM VISUAL DO ARCO

Mahasiah amplia espacialmente a linguagem de Kether.

### Dia 021 — EIXO BRANCO

- linha vertical Kether → Malkuth;
- luz branca radiante descendo pelo centro;
- respiração representada por expansão/recolhimento discreto;
- body map abstrato, não anatomia clínica.

### Dia 022 — GEOMETRIA / GESTO

- referência canônica do Dai Koo Myo em alta clareza;
- modo estudo dos traços;
- modo memória sem referência;
- rastro de gesto elegante, sem gamificação arcade;
- visualização branca separada do gesto físico.

### Dia 023 — COROA / A-B

- duas condições claramente distinguidas: `ATIVA` e `CONTROLE`;
- mãos acima da Coroa representadas sem contacto físico obrigatório;
- comparação por indicadores, não por “vencedor”.

### Dia 024 — CIRCUITO SUPERIOR

- mapa sequencial de Coroa → testa → entre sobrancelhas → laterais do rosto → garganta;
- nenhum elemento deve sugerir compressão de olhos/pescoço;
- transição entre pontos é parte central da experiência.

### Dia 025 — CAMPO AMBIENTAL

- câmera/AR como ferramenta espacial, não efeito decorativo;
- Dai Koo Myo 3D ancorado acima do altar;
- quatro pontos do perímetro;
- caminho repetível;
- comparação visual entre mapa ativo e controle sem rotular diferenças como “energia detectada”.

---

## 4. DIA 021 — A LINHA DE PRANA (KI)

### Papel dramático

**“Eu consigo conduzir atenção, respiração e imagem por um eixo escolhido.”**

O usuário aprende o operador-base que sustentará o restante de Mahasiah.

### Mecânicas

#### Axis Breath Guide

- respiração natural;
- sem retenção obrigatória;
- inspiração acompanha visualização descendente Kether → Malkuth;
- expiração integra percepção do corpo inteiro;
- animação opcional pode mostrar o eixo, mas a prática deve continuar com tela escurecida.

#### Somatic Marker

Durante ou após a prática, o usuário pode registrar regiões percebidas sem texto livre:

- neutra;
- calor;
- frio;
- formigamento;
- pressão;
- pulsação;
- leveza/peso;
- outra sensação → texto somente no Vault, se desejado.

Ausência de sensação é um dado válido.

#### Interpretation Hold

O Evidence Sheet apresenta separadamente:

- `o que percebi`;
- `o que imaginei`;
- `o que interpretei`.

Texto sensível continua no Journal Vault; Practice Record guarda somente categorias e métricas estruturadas.

### Evidência mínima proposta

```json
{
  "protocol_completed": true,
  "return_confirmed": true,
  "breathing_comfortable": true,
  "axis_visualization_completed": true,
  "presence_rating": 7,
  "somatic_regions_logged": 3
}
```

### Saída

`Mahasiah 1/5`.

---

## 5. DIA 022 — SINTONIZAÇÃO DO DAI KOO MYO

### Papel dramático

**“Eu transformo forma em memória, gesto e visualização.”**

### Pré-condição editorial/asset

A plataforma precisa de **uma referência canônica explicitamente adotada pelo Codex**, com versão e provenance registradas no Asset Registry.

O app não escolhe silenciosamente entre variações históricas do símbolo.

### Mecânicas

#### Symbol Study

- exibe referência canônica;
- divide a forma por ordem/sequência de traços apenas conforme a referência aprovada;
- permite ampliar e estudar sem cronômetro competitivo.

#### Memory Trace

Após estudo, a referência desaparece e o usuário executa o traçado de memória.

A plataforma registra:

- duração;
- consultas à referência;
- hesitações marcadas pelo usuário;
- autoavaliação de clareza da forma.

Não transforma velocidade em score.

#### Air Trace

Em dispositivo móvel, o app pode oferecer guia visual do movimento, mas **não precisa rastrear a mão por câmera para validar a prática**. O gesto corporal continua voluntário e pode ser registrado pelo usuário como concluído.

#### Visualization Hold

Após o traçado:

- sustentar imagem branca por três respirações;
- registrar clareza 0–10;
- deixar a imagem desaparecer voluntariamente;
- grounding em três elementos concretos do ambiente.

### Evidência mínima

```json
{
  "protocol_completed": true,
  "return_confirmed": true,
  "reference_studied": true,
  "air_trace_completed": true,
  "visualization_hold_completed": true,
  "visual_clarity": 6
}
```

### Saída

`Mahasiah 2/5`.

---

## 6. DIA 023 — IMPOSIÇÃO DAS MÃOS NA COROA

### Papel dramático

**“Eu consigo comparar protocolo completo e postura equivalente.”**

Este é o primeiro desenho A/B explícito de Mahasiah.

### Estrutura

#### Condition A — ACTIVE

- mãos em concha 5–10 cm acima da Coroa;
- duração canônica: 7 minutos;
- Dai Koo Myo;
- visualização branca;
- MEM-HE-SHIN;
- Salmo 34:4 na integração.

#### Condition B — CONTROL

Em outro momento:

- mesma postura;
- mesma distância aproximada;
- duração canônica: 5 minutos;
- sem símbolo;
- sem fórmula;
- sem intenção explícita de condução.

### Crown Comparison Record

Para cada condição:

- distância das mãos;
- duração;
- conforto;
- calor 0–10;
- pressão 0–10;
- pulsação 0–10;
- silêncio mental 0–10;
- presença 0–10;
- variável concorrente percebida.

A UI mostra diferenças numericamente/descritivamente, mas não declara que a condição ativa “venceu”.

### Segurança

- pescoço neutro;
- braços podem ser abaixados ou apoiados se houver fadiga;
- dor, vertigem ou desconforto relevante encerram a etapa;
- interromper por segurança não é fracasso espiritual.

### Evidência mínima

```json
{
  "protocol_completed": true,
  "return_confirmed": true,
  "active_condition_completed": true,
  "control_condition_completed": true,
  "comparison_logged": true,
  "protocol_adjustment_defined": true
}
```

### Saída

`Mahasiah 3/5`.

---

## 7. DIA 024 — AUTO-REIKI / CIRCUITO SUPERIOR

### Papel dramático

**“Eu consigo manter uma sequência e distinguir regiões.”**

O desafio deixa de ser estabelecer um único ponto e passa a ser **transferir a atenção entre zonas sem perder estabilidade**.

### Upper Circuit Guide

Ordem canônica:

`COROA → TESTA → ENTRE SOBRANCELHAS → LATERAIS DO ROSTO → GARGANTA`

Cada ponto:

- aproximadamente 1 minuto;
- mãos sem pressão desconfortável;
- Dai Koo Myo e luz branca na condição ativa;
- ratings regionais ao final, não durante, para reduzir interrupção.

### Condition Pair

Como no Dia 023:

- sessão ativa;
- condição controle em outro momento;
- mesma ordem, duração e distância;
- controle sem símbolo, MEM-HE-SHIN ou intenção de condução.

### Regional Map

Para cada região:

- calor;
- pulsação;
- pressão;
- relaxamento;
- clareza mental;
- percepção de transição.

O app pode mostrar um mapa comparativo, mas sem chamar qualquer região de “chakra ativado” com base apenas no autorrelato.

### Evidência mínima

```json
{
  "protocol_completed": true,
  "return_confirmed": true,
  "active_circuit_completed": true,
  "control_circuit_completed": true,
  "regions_logged": 5,
  "regional_comparison_completed": true
}
```

### Saída

`Mahasiah 4/5`.

---

## 8. DIA 025 — PASSE MAGNÉTICO NO AMBIENTE / AR

### Papel dramático

**“Eu consigo externalizar uma configuração e repeti-la no espaço.”**

É o fechamento do ciclo: o operador deixa de estar apenas no corpo do praticante e passa a ser posicionado no ambiente de forma espacialmente repetível.

### Requisito principal

A experiência canônica pede **câmera de realidade aumentada** e um **Dai Koo Myo 3D ancorado sobre o altar**.

Isso não deve ser substituído por uma animação 2D fingindo ser AR.

### Environment Baseline

Antes da condição ativa, registrar:

- iluminação;
- ruído percebido ou medido quando disponível;
- temperatura disponível;
- organização do ambiente;
- ventilação;
- horário;
- presença de outras pessoas.

### AR Anchor

O usuário:

1. aponta a câmera ao altar;
2. estabelece uma superfície/âncora;
3. posiciona o Dai Koo Myo 3D acima do centro;
4. confirma escala e orientação;
5. salva a transformação espacial local da sessão.

A plataforma deve permitir recentrar/reancorar sem punir tracking perdido.

### Four-Point Walk

Quatro pontos do perímetro recebem marcadores espaciais.

Em cada ponto:

- pausa breve;
- foco 0–10;
- conforto 0–10;
- silêncio 0–10;
- presença 0–10;
- prontidão meditativa 0–10.

### Condition A — ACTIVE

- Dai Koo Myo em AR;
- luz branca de Atziluth;
- MEM-HE-SHIN;
- percurso de quatro pontos;
- duração alvo canônica: 7 minutos.

### Condition B — CONTROL

Em outro momento:

- mesmo altar;
- percurso equivalente;
- horário/iluminação aproximados quando possível;
- câmera sem projeção do símbolo;
- sem MEM-HE-SHIN;
- mesmos quatro pontos e ratings.

### Environmental Comparison

A UI compara:

- zonas;
- condições;
- variáveis ambientais;
- diferenças percebidas;
- hipótese refinada;
- parâmetro a manter constante na próxima sessão.

Ela não apresenta “campo energético detectado” porque câmera e autorrelato não medem isso diretamente.

### Camera Permission

A permissão deve ser pedida **somente quando o usuário iniciar o módulo AR**.

Se for negada:

- explicar por que a câmera é necessária para a experiência canônica do Dia 025;
- permitir sair sem perder progresso anterior do ciclo;
- não bloquear acesso ao texto canônico;
- não marcar a prática AR como concluída automaticamente;
- qualquer modo alternativo que possa futuramente valer como conclusão canônica exige decisão editorial explícita.

### Segurança espacial

- mostrar aviso para manter atenção ao ambiente físico;
- não pedir caminhada olhando exclusivamente para a tela;
- evitar percurso próximo a escadas, chama, trânsito ou obstáculos;
- permitir modo estacionário quando necessário para segurança, mas sem declarar equivalência canônica de percurso até aprovação editorial.

### Evidência mínima

```json
{
  "protocol_completed": true,
  "return_confirmed": true,
  "ar_anchor_created": true,
  "active_map_completed": true,
  "control_map_completed": true,
  "environment_points_logged": 4,
  "comparison_logged": true
}
```

### Fechamento

Após conclusão válida do Dia 025:

1. Dias 021–025 estão completos;
2. `get_kether_crown_state()` passa a refletir o quinto ciclo completo;
3. acende o **Fragmento V da Coroa**;
4. o Grau continua `1 — Neófito`;
5. a interface introduz Lelahel como próxima etapa de percepção mais sutil.

---

## 9. CONTRACT DE DADOS DO CICLO

Mahasiah usa dois tipos de evidência:

### Single-condition records

Dias 021–022.

### Paired-condition records

Dias 023–025.

O modelo de produto precisa preservar a relação entre:

```text
PRACTICE
├── ACTIVE
└── CONTROL
```

sem conceder XP por condição individual.

O XP é concedido uma única vez pela conclusão canônica do Dia, depois que a evidência mínima exigida estiver completa.

Revisitas podem criar novas comparações longitudinais sem duplicar XP ou Fragmentos da Coroa.

---

## 10. PRIVACIDADE

Mahasiah não exige armazenar vídeo do ambiente.

### Dia 025

Por padrão:

- câmera serve ao tracking AR;
- frames não são enviados para analytics;
- gravação de vídeo não é necessária;
- mapa espacial deve armazenar somente dados geométricos mínimos quando necessário;
- qualquer imagem ambiental persistente exige ação explícita do usuário.

### Journal

Interpretações espirituais, relatos pessoais e texto livre continuam no Vault criptografado.

Practice Records guardam métricas estruturadas e não precisam guardar plaintext sensível.

---

## 11. ACCESSIBILITY & FALLBACKS

- práticas respiratórias não exigem áudio;
- animações devem respeitar `reduce motion`;
- ratings precisam ser acessíveis por leitor de tela;
- body maps devem ter alternativa textual;
- AR precisa oferecer instrução verbal/textual clara e modo de recentrar;
- rastreamento visual nunca deve ser a única forma de confirmar que o usuário entendeu uma etapa;
- recusa de câmera não impede leitura/estudo do Dia 025, mas a equivalência de conclusão prática alternativa depende de decisão editorial futura.

---

## 12. QA DE MAHASIAH

O ciclo não está pronto até validar:

- [ ] Dias 021–025 respeitam ordem e conteúdo canônicos;
- [ ] XP operacional total do ciclo = 700;
- [ ] Fragmento V só acende com 021–025 completos;
- [ ] usuário permanece Neófito após Dia 025;
- [ ] ausência de sensação é aceita como dado válido;
- [ ] respiração nunca exige retenção ou hiperventilação;
- [ ] Dai Koo Myo usa referência canônica/versionada, não variante escolhida pelo app;
- [ ] active/control não concede XP duas vezes;
- [ ] Dia 023 preserva distância/postura e registra condição controle;
- [ ] Dia 024 não pressiona olhos, garganta ou pescoço;
- [ ] mapas não afirmam detectar bioenergia diretamente;
- [ ] Dia 025 usa AR real, não mock 2D rotulado como AR;
- [ ] câmera é solicitada contextualmente;
- [ ] core AR não grava vídeo por padrão;
- [ ] perda de tracking pode ser recuperada sem perder a sessão;
- [ ] segurança de caminhada/obstáculos é explicitamente tratada;
- [ ] texto privado permanece fora de analytics;
- [ ] revisita não duplica XP ou Fragmento;
- [ ] comparação longitudinal é possível.

---

## 13. CONTRATO COM O PRODUCTION LAB

O Production Lab pode implementar:

- `AxisBreathGuide`;
- `SomaticMarker`;
- `SymbolStudy`;
- `MemoryTrace`;
- `ConditionPair`;
- `CrownComparisonRecord`;
- `UpperCircuitGuide`;
- `RegionalMap`;
- `EnvironmentBaseline`;
- `ARAnchor`;
- `FourPointWalk`;
- `EnvironmentalComparison`.

Mas não deve:

- afirmar Prana/Ki como variável diretamente medida pelo celular;
- inferir “ativação de chakra” de ratings subjetivos;
- tratar Dai Koo Myo como autoridade superior a Deus na linguagem teológica do HNK;
- escolher uma variante do símbolo sem referência canônica aprovada;
- enviar frames de câmera ou vídeo ambiental para analytics por padrão;
- apresentar active/control como prova automática de causalidade;
- transformar intensidade subjetiva em ranking espiritual;
- conceder XP por cada metade do A/B.

---

## 14. CRITÉRIO DE DONE DO CICLO V

Mahasiah está completo como experiência quando o usuário consegue atravessar:

`EIXO → SÍMBOLO → COROA → CIRCUITO → AMBIENTE`

com Practice Records estruturados, condições comparativas quando exigidas, privacidade preservada, referência tradicional versionada, AR real no Dia 025 e **Fragmento V aceso somente após conclusão válida de 021–025**.

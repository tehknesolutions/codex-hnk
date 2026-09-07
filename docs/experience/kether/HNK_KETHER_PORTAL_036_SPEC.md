# HNK KETHER — PORTAL 036

**Status:** Experience Design v1  
**Tipo:** Boss / Rito de Passagem / Exame Integrativo  
**Origem:** Kether  
**Destino:** Chokmah  
**Mundo:** Atziluth  
**Grau de entrada:** Level 1 — Neófito  
**Grau de saída:** Level 2 — Iniciado  
**XP canônico:** 500 XP  
**Pré-condição:** Dias 001–035 concluídos + Coroa 7/7  
**Tracks canônicos do Dia 036:** `TEURG-101`, `COMP-101`

> Esta especificação traduz o Dia 036 canônico em experiência de plataforma. Não altera Doutrina, Kavanah, Ordália, XP, promoção, operadores, oráculos ou metadados do Codex.

---

## 1. FUNÇÃO DO PORTAL

O Dia 036 não é um oitavo ciclo. É a prova de que as competências treinadas em Kether podem ser reunidas em uma única cadeia consciente, comparadas contra uma sessão-base, revisadas nos registros acumulados e encerradas com retorno voluntário.

O Portal verifica quatro capacidades:

1. **integrar** — executar a sequência completa sem transformar cada competência em uma ilha;
2. **comparar** — distinguir a sessão completa de uma base de auto-hipnose sem os operadores do Portal;
3. **revisar** — reconhecer competências consolidadas, frágeis, lacunas e evidências reais dos Dias 001–035;
4. **retornar** — sair orientado, registrar a experiência e assumir Chokmah como aumento de responsabilidade, não superioridade.

Progressão dramática:

`REUNIR → EXECUTAR → COMPARAR → REVISAR → TESTEMUNHAR → ATRAVESSAR`

O Portal não premia intensidade subjetiva isolada. O cânone exige execução consciente, memória contínua, estabilidade, discernimento e registro completo.

---

## 2. GATE DE ENTRADA

O Portal só pode entrar em `AVAILABLE` quando o backend confirmar:

```text
completed_days = 35
crown_fragments = 7/7
initiatory_grade = 1
initiatory_title = Neófito
```

O cliente não calcula nem concede essas condições por conta própria.

### Estado bloqueado

Se faltar qualquer Dia:

- mostrar a Coroa com os fragmentos já acesos;
- indicar quais Dias permanecem incompletos;
- permitir revisitar qualquer Dia concluído;
- não permitir executar uma versão parcial do Portal como se fosse exame válido.

### Coroa 7/7 ≠ promoção

A Coroa completa significa **prontidão para tentar o Portal**. A promoção continua exclusiva da conclusão canônica do Dia 036.

---

## 3. DEPENDÊNCIAS CANÔNICAS PENDENTES

O Dia 036 exige três operadores que precisam de referência publicada/versionada antes do Release Candidate:

1. **Sintonizador Angelical**;
2. **Solfeggio de transição**;
3. **sigilo de Kether**.

Enquanto não houver definição explícita, cada componente fica em:

`CANONICAL_REFERENCE_PENDING`

A plataforma não deve:

- escolher uma frequência por conveniência;
- inventar um preset chamado “Portal”;
- gerar um sigilo e apresentá-lo como canônico;
- inferir que “Sintonizador Angelical” significa um módulo específico não definido pela fonte.

A arquitetura de UI pode ser construída com placeholders claramente não-canônicos, mas publicação do rito completo fica bloqueada.

---

## 4. ESTRUTURA GERAL DA EXPERIÊNCIA

O Portal é uma sessão composta. Ele deve parecer uma travessia contínua, não uma sequência de formulários.

```text
PRE-FLIGHT
   ↓
COROA 7/7
   ↓
CONDITION A — PORTAL COMPLETO
   ↓
RETURN GATE
   ↓
REST / SEPARAÇÃO DE CONDIÇÕES
   ↓
CONDITION B — SESSÃO-BASE
   ↓
RETURN GATE
   ↓
REVISÃO 001–035
   ↓
ESPELHO DE KETHER
   ↓
PROMOTION REVIEW
   ↓
ATOMIC COMPLETION
   ↓
LEVEL 2 — INICIADO
```

---

## 5. PRE-FLIGHT — ANTES DE ENTRAR

### Checklist mínimo

- ambiente adequado;
- posição confortável;
- usuário confirma que pode interromper a qualquer momento;
- áudio sob volume do usuário;
- Journal Vault disponível para escrita privada;
- assets do Portal presentes em cache quando modo offline for suportado;
- Coroa 7/7 confirmada pelo backend.

### Safety state

Se o usuário relatar desorientação, medo intenso, dor, falta de ar, vertigem ou incapacidade de retornar ao estado comum:

- encerrar a etapa;
- orientar ao ambiente;
- registrar `safety_stop` na sessão;
- preservar progresso 001–035;
- não promover;
- permitir nova tentativa futura.

Interromper o Portal não remove fragmentos já conquistados.

---

## 6. CONDITION A — PORTAL COMPLETO

### Papel dramático

**“Eu consigo reunir Kether em uma única cadeia consciente.”**

### Sequência canônica

1. acionar **Sintonizador Angelical**;
2. selecionar **Solfeggio de transição**;
3. executar a indução completa de auto-hipnose treinada em Kether;
4. estabilizar profundidade mantendo orientação;
5. ativar o **sigilo de Kether**;
6. sustentar **cinco minutos de gnose continuada**;
7. retornar voluntariamente;
8. registrar imediatamente a sessão.

### Portal Sequence Runner

A UI mostra somente a etapa atual e o próximo marco discreto. Não deve transformar o rito em checklist arcade.

Campos estruturados possíveis:

- sequência completa: sim/não;
- falhas de sequência;
- recuperações realizadas;
- dispersões;
- profundidade autorrelatada 0–10;
- estabilidade 0–10;
- continuidade da gnose 0–10;
- estabilidade do sigilo 0–10;
- orientação preservada: sim/não;
- retorno voluntário: sim/não;
- clareza pós-sessão 0–10.

### Regra de integração

Uma falha de sequência não produz `GAME OVER`.

O dado relevante é:

`falha → reconhecimento → recuperação → continuidade`

O Portal mede capacidade de recompor a cadeia, não performance perfeita.

---

## 7. RETURN GATE A

A condição Portal só pode ser encerrada quando houver retorno explícito:

- olhos abertos;
- movimento voluntário;
- orientação ao ambiente;
- clareza suficiente para registrar;
- confirmação do usuário de que a sessão terminou.

Nenhuma animação de ascensão deve começar antes disso.

---

## 8. CONDITION B — SESSÃO-BASE

### Papel dramático

**“Eu consigo comparar o arranjo HNK com a habilidade-base que aprendi.”**

A sessão-base é executada **sem**:

- Sintonizador Angelical;
- Solfeggio de transição;
- sigilo de Kether.

Ela utiliza somente a indução hipnótica dominada e a permanência em gnose pelo período correspondente.

### Variáveis comparáveis

- profundidade;
- silêncio;
- dispersões;
- continuidade;
- orientação;
- clareza final;
- falhas/recuperação quando aplicável.

### Regra epistemológica

O app pode mostrar diferenças entre Portal e base, mas não declarar que a diferença prova causalidade independente de tecnologia, símbolo ou teurgia.

A comparação pertence ao protocolo HNK e pode gerar uma hipótese pessoal/documentada.

---

## 9. RETURN GATE B

Mesma lógica da condição A:

- retorno voluntário;
- orientação completa;
- capacidade funcional preservada;
- registro da condição base.

Somente depois a revisão longitudinal é liberada.

---

## 10. REVISÃO DOS 35 DIAS

O cânone exige revisão do Diário Criptografado dos Dias 1–35 sem alterar registros antigos para favorecer a narrativa de ascensão.

### Review Lens

O app cria uma camada de leitura sobre os registros existentes, sem reescrevê-los.

O usuário marca:

- **3 competências consolidadas**;
- **3 competências ainda instáveis**;
- **lacunas relevantes**;
- **um critério objetivo que impediria promoção prematura**;
- **uma evidência concreta de progresso para cada atributo treinado**.

### Sete atributos de Kether

O plano do Capítulo 1 distribui treinamento pelos sete atributos RPG:

- `SIN` — Sintonia;
- `DIS` — Disciplina;
- `HIP` — Hipnose;
- `VNT` — Vontade;
- `PER` — Percepção;
- `BIO` — Bioenergia;
- `INT` — Integração/Intuição conforme contrato de domínio vigente.

A plataforma deve usar os nomes canônicos finais definidos no pacote de domínio. Não renomear atributos em UI somente para encaixar esta tela.

### Attribute Evidence Cards

Para cada atributo:

- evidência escolhida pelo usuário a partir de sessões existentes;
- Dia(s) relacionados;
- métrica/observação que sustenta a escolha;
- nota privada opcional no Vault.

O app não inventa uma “nota científica” global de espiritualidade.

---

## 11. ESPELHO DE KETHER

O material de planejamento do Capítulo 1 inclui uma ficha final de autoavaliação. Ela pode ser incorporada como reflexão privada, preservando seu caráter de Espelho e sem funcionar como prova automática de promoção.

Questões são apresentadas conforme a versão editorial aprovada do material-fonte.

### Regra de privacidade

Respostas discursivas pertencem ao Journal Vault criptografado.

A camada operacional armazena somente marcadores necessários, por exemplo:

```json
{
  "mirror_completed": true,
  "reflection_count": 3
}
```

Nenhuma resposta teológica/introspectiva em texto puro deve entrar em analytics.

---

## 12. SYNTHESIS — TESTEMUNHO DE KETHER

O cânone pede uma síntese final:

- o que Kether ensinou;
- o que permanece investigável;
- qual disciplina seguirá para Chokmah.

A síntese é salva no Vault.

O Practice Record guarda apenas:

```json
{
  "kether_synthesis_completed": true,
  "investigable_item_declared": true,
  "chokmah_discipline_declared": true
}
```

Isso preserva privacidade sem perder a condição de completion.

---

## 13. PROMOTION REVIEW

### O Portal não exige perfeição

O texto canônico afirma que a passagem exige continuidade, não perfeição.

Portanto, a promoção não depende de:

- profundidade mínima arbitrária;
- quantidade mínima de fenômenos;
- ausência total de dispersões;
- “vencer” a sessão-base;
- possuir todos os atributos no máximo;
- declarar certeza espiritual.

### Gate estrutural de promoção

Proposta de condição canônica operacional:

```json
{
  "days_001_035_complete": true,
  "crown_fragments": 7,
  "portal_condition_completed": true,
  "base_condition_completed": true,
  "portal_base_comparison_completed": true,
  "return_confirmed": true,
  "review_001_035_completed": true,
  "consolidated_competencies_count": 3,
  "fragile_competencies_count": 3,
  "attribute_evidence_count": 7,
  "premature_promotion_criterion_declared": true,
  "kether_synthesis_completed": true,
  "journal_update_confirmed": true,
  "safety_blocking_state": false
}
```

### Prontidão percebida

`readiness_rating` pode ser registrado, mas **não deve ser um threshold automático isolado**. O usuário pode reconhecer fragilidades e ainda assim demonstrar o tipo de continuidade e discernimento que o próprio cânone pede.

---

## 14. ATOMIC COMPLETION

A conclusão do Dia 036 deve ocorrer em transação única no backend.

Ela deve:

1. validar ownership;
2. confirmar conclusões 001–035;
3. confirmar sessão/evidência válida do Portal;
4. inserir `day_completions` do Dia 036 de forma idempotente;
5. conceder os **500 XP canônicos** uma única vez;
6. atualizar progresso para o próximo Dia/Capítulo conforme contrato de domínio;
7. promover:
   - `initiatory_grade: 1 → 2`;
   - `initiatory_title: Neófito → Iniciado`;
8. preservar auditabilidade da sessão que originou a promoção.

Repetir a RPC não duplica XP nem promoção.

---

## 15. CERIMÔNIA DE PASSAGEM

Somente após confirmação do backend:

### Coroa

Os sete fragmentos deixam de aparecer como peças separadas e convergem visualmente numa Coroa íntegra.

### Oráculos de transição

Mostrar a transição canônica:

- `Fehu → Uruz`;
- `O Louco → O Mago`;
- `Hexagrama 1 → Hexagrama 2`.

Esses elementos são apresentados como linguagem oracular/tradicional do Codex, não como previsão automática sobre eventos futuros.

### Grau

```text
LEVEL 1 — NEÓFITO
        ↓
PORTAL 036
        ↓
LEVEL 2 — INICIADO
```

### Tom

A cerimônia deve comunicar:

- responsabilidade;
- continuidade;
- humildade;
- sabedoria a ser desenvolvida;
- nenhum ranking de superioridade.

O cânone diz explicitamente que a passagem aumenta responsabilidade, não superioridade.

---

## 16. CHOKMAH LOCK / UNLOCK

Após promoção confirmada:

- Chokmah pode aparecer como **desbloqueado no sistema**;
- o conteúdo editorial do Dia 037 continua governado pelo repo canônico;
- este projeto não deve antecipar, inventar ou publicar Chokmah se o conteúdo/produção estiver deliberadamente congelado.

Neste momento, o produto pode mostrar apenas um limiar de Chokmah: `Level 2 — Iniciado`, sem avançar a escrita ou experiência do Dia 037.

---

## 17. OFFLINE

O Portal pode ser iniciado offline somente se:

- Dias 001–035 e estado da Coroa estiverem previamente sincronizados;
- operadores/assets necessários estiverem em cache;
- Journal Vault local estiver operacional;
- a sessão puder ser persistida com identificador idempotente.

A promoção final exige sincronização segura com o backend antes de ser tratada como confirmada globalmente.

Offline pode mostrar:

`PORTAL COMPLETED LOCALLY — PROMOTION PENDING SYNC`

Nunca mostrar `INICIADO` como estado remoto confirmado antes da transação do servidor.

---

## 18. PRIVACIDADE

O Portal cruza dados de 35 dias e portanto merece regra reforçada:

- textos do Diário permanecem ciphertext;
- comparação e evidence cards usam referências/IDs e métricas mínimas;
- não enviar conteúdo do Vault para analytics;
- não gerar perfil psicológico/espiritual oculto a partir das respostas;
- exportação explícita é ação do usuário.

---

## 19. ACESSIBILIDADE

- `reduce motion` deve substituir convergência animada da Coroa por transição estática elegante;
- áudio nunca é única forma de receber instruções;
- usuário controla volume;
- todos os estados de sequence runner possuem texto;
- não usar flashes intensos;
- cerimônia final precisa funcionar sem partículas/animação;
- feedback de conclusão combina texto + estrutura visual, não apenas cor.

---

## 20. QA OBRIGATÓRIO

### Gate

- Portal bloqueado com 34/35 Dias;
- Portal disponível com 35/35;
- Coroa 7/7 derivada corretamente;
- cliente não consegue forçar unlock por alteração local.

### Sessão

- sequência Portal salva falhas e recuperação;
- condição base é separada da ativa;
- ambos os Return Gates funcionam;
- safety stop preserva dados e bloqueia promoção naquele attempt quando necessário.

### Revisão

- registros antigos não são sobrescritos pela revisão;
- 3 consolidadas + 3 frágeis são persistidas;
- evidência dos sete atributos referencia dados existentes;
- texto privado fica no Vault.

### Backend

- Dia 036 não conclui sem 001–035;
- XP 500 é idempotente;
- promoção é idempotente;
- grade/title ficam coerentes;
- retry concorrente não duplica eventos.

### Cerimônia

- só ocorre após confirmação transacional;
- Fehu→Uruz, Louco→Mago e Hex1→Hex2 são exibidos corretamente;
- Chokmah é desbloqueado sem iniciar automaticamente o Dia 037.

---

## 21. DEFINITION OF DONE — PORTAL 036

O Portal está pronto para Release Candidate quando:

- [ ] os 35 Dias anteriores usam o contrato de completion oficial;
- [ ] Coroa 7/7 é derivada corretamente;
- [ ] Sintonizador Angelical canônico está definido/versionado;
- [ ] Solfeggio de transição está definido/versionado;
- [ ] sigilo de Kether está definido/versionado;
- [ ] condition Portal existe;
- [ ] session-base existe;
- [ ] comparação existe;
- [ ] Review 001–035 existe;
- [ ] Evidence Cards dos atributos existem;
- [ ] Espelho de Kether existe no Vault;
- [ ] síntese existe no Vault;
- [ ] Return Gate e safety states foram testados;
- [ ] completion/promoção são transacionais e idempotentes;
- [ ] +500 XP é concedido uma vez;
- [ ] Grau 2 — Iniciado é aplicado somente após Day 036 COMPLETE;
- [ ] Chokmah unlock não publica conteúdo congelado;
- [ ] offline/pending-sync foi testado;
- [ ] privacidade e acessibilidade passaram QA;
- [ ] CI permanece verde.

---

## 22. REGRA FINAL

O Portal 036 não pergunta se o usuário “sentiu-se poderoso”.

Ele pergunta, em termos de produto e de prática:

> Você consegue reunir o que treinou, comparar sem manipular os dados, reconhecer fragilidades, retornar por decisão própria, registrar com integridade e assumir maior responsabilidade?

Se a resposta operacional for documentada e o contrato canônico estiver cumprido, o backend sela a passagem:

`NEÓFITO → INICIADO`.

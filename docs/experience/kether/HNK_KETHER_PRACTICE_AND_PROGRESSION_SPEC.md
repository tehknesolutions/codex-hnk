# HNK KETHER — PRACTICE RECORD & PROGRESSION SPEC

**Status:** APPROVED / implementation baseline v1  
**Escopo:** Kether — Dias 001–036  
**Dependências:** `HNK_KETHER_EXPERIENCE_MATRIX.md`, `HNK_KETHER_DAY_001_VERTICAL_SLICE_SPEC.md`  
**Fonte editorial:** `Tehkne-Solutions/hnk-codex-365`

---

## 1. DECISÃO CENTRAL DE PRODUTO

O HNK separa definitivamente três conceitos que não podem ser tratados como sinônimos:

1. **XP (`xp_total`)** — score cumulativo de execução e progresso.
2. **Grau Iniciático (`initiatory_grade`)** — posição na jornada das Sephiroth, desbloqueada por Portais canônicos.
3. **Maestria/Atributos** — HIP, VNT, PER, SIN, BIO, INT e DIS; possuem progressão própria e não são inferidos automaticamente do XP.

Em Kether, o usuário permanece:

`Grau 1 — Neófito`

nos Dias 001–035, independentemente do XP acumulado.

Somente a conclusão válida do **Dia 036 — Portal Kether → Chokmah**, com os Dias 001–035 concluídos, promove atomicamente para:

`Grau 2 — Iniciado`

A antiga regra de promover Grau por limiar global de XP não governa mais a progressão iniciática.

---

## 2. MODELO DE DADOS CONCEITUAL

### 2.1. Practice Session

Uma `practice_session` representa uma tentativa real de execução de um Dia.

Ela pode ser:

- `first_completion` — sessão destinada à primeira conclusão;
- `revisit` — nova execução de um Dia já concluído.

Estados:

- `active`
- `interrupted`
- `evidence_pending`
- `complete`

Uma sessão NÃO concede XP por existir.

### 2.2. Day Completion

`day_completions` representa o selo canônico único de conclusão de um Dia por usuário.

Existe no máximo uma linha `(user_id, day)`.

Ela é criada somente pela função transacional de conclusão. O cliente autenticado não possui permissão direta de `INSERT`, `UPDATE` ou `DELETE` nessa tabela.

### 2.3. XP Event

O XP de um Dia nasce de `codex_days.xp`, sincronizado do Codex canônico.

O evento usa chave de idempotência por usuário/dia/versão de conclusão. Uma revisita nunca gera novamente o XP canônico do Dia.

### 2.4. Journal Vault

O texto livre, espiritual, autobiográfico ou sensível NÃO pertence a `practice_sessions.metrics` nem a `practice_sessions.evidence`.

Ele permanece no `journal_vault` criptografado.

O Practice Record pode guardar somente:

- métricas estruturadas;
- ratings escolhidos pelo usuário;
- contadores;
- flags de execução;
- hashes/IDs que liguem o registro local criptografado à sessão.

---

## 3. CONTRATO DE EVIDÊNCIA

A experiência HNK não exige que o usuário declare um fenômeno subjetivo específico para “passar”.

A evidência mínima confirma **execução voluntária + registro**, não “sucesso paranormal”.

Exemplo genérico:

```json
{
  "protocol_completed": true,
  "return_confirmed": true,
  "ratings": {
    "focus": 6,
    "silence": 5,
    "comfort": 8
  }
}
```

Cada Dia pode acrescentar campos definidos na Experience Matrix, como:

- duração;
- distrações;
- latência;
- movimentos;
- número de tentativas;
- intensidade antes/depois;
- gesto ativo × controle;
- gravação criada localmente;
- QR/deep-link validado.

Regras:

1. Primeira conclusão exige `evidence` não vazio.
2. A sessão deve estar em `evidence_pending` ou `complete`.
3. Texto de diário nunca entra nesse JSON.
4. Evidência pode ser produzida offline e sincronizada depois.
5. Interrupção não é falha; a sessão pode permanecer `interrupted` e ser retomada por nova tentativa.

---

## 4. A COROA DE KETHER — 7 FRAGMENTOS

A Coroa é **derivada das conclusões reais**, não armazenada como contador independente.

| Fragmento | Ciclo | Dias | Condição de acendimento |
|---:|---|---:|---|
| I | Vehuiah | 1–5 | 5/5 concluídos |
| II | Jeliel | 6–10 | 5/5 concluídos |
| III | Sitael | 11–15 | 5/5 concluídos |
| IV | Elemiah | 16–20 | 5/5 concluídos |
| V | Mahasiah | 21–25 | 5/5 concluídos |
| VI | Lelahel | 26–30 | 5/5 concluídos |
| VII | Achaiah | 31–35 | 5/5 concluídos |

O estado é obtido por `get_kether_crown_state()`.

Resposta conceitual:

```json
{
  "sephira": "Kether",
  "days_completed": 17,
  "fragments_lit": 3,
  "fragments_total": 7,
  "portal_unlocked": false,
  "kether_complete": false,
  "cycles": []
}
```

### 4.1. Centelhas dentro do fragmento

A UI pode representar progresso 1/5, 2/5 etc. dentro de um ciclo, mas isso é apresentação derivada de `completed_days`. Não existe moeda paralela de “centelha” no banco.

### 4.2. Portal

`portal_unlocked = true` somente quando os Dias 001–035 existem em `day_completions`.

O Dia 036 não pode ser concluído antes disso.

---

## 5. SEQUÊNCIA E DESBLOQUEIO

Para Kether, primeira conclusão é sequencial:

- Dia 001 não exige anterior;
- Dias 002–035 exigem o Dia imediatamente anterior;
- Dia 036 exige todos os 35 anteriores.

Revisitas de Dias concluídos podem ocorrer fora de ordem.

A navegação pode mostrar dias futuros, mas deve diferenciá-los visualmente como `LOCKED`.

---

## 6. TRANSAÇÃO DE CONCLUSÃO

A função `complete_codex_day(...)` é a autoridade de escrita.

Fluxo lógico:

```text
AUTH USER
   ↓
VALIDAR DIA CANÔNICO
   ↓
VALIDAR SESSION USER+DAY
   ↓
VALIDAR EVIDENCE_PENDING / COMPLETE
   ↓
SE PRIMEIRA CONCLUSÃO:
   ├─ exigir evidence != {}
   ├─ validar sequência
   ├─ inserir day_completion atomicamente
   ├─ inserir xp_event idempotente
   └─ somar somente XP realmente inserido
   ↓
MARCAR SESSION COMPLETE
   ↓
RECALCULAR COROA
   ↓
SE DAY 036:
   └─ promover para Grau 2 / Iniciado / Chokmah / Dia 37
```

Retorno inclui:

- `first_completion`
- `xp_awarded`
- `xp_total`
- `initiatory_grade`
- `initiatory_title`
- `crown`

---

## 7. REVISITA

Reabrir um Dia concluído cria nova `practice_session` com `mode = revisit`.

A revisita:

- pode registrar novas métricas;
- pode produzir novo conteúdo no Diário criptografado;
- pode alimentar gráficos de evolução;
- não altera `day_completions` original;
- não concede novamente XP canônico;
- não acende novamente fragmento;
- não altera o Grau.

A UI deve celebrar consistência sem fingir nova conclusão iniciática.

---

## 8. XP DE KETHER

O dataset canônico atual dos Dias 001–036 soma **5.150 XP**.

Esse valor é um score de progresso de Kether, não um limiar automático de Grau.

Consequência de UX:

```text
Neófito
Kether 24/36
4/7 Fragmentos
3.050 XP
```

é um estado perfeitamente válido.

O rótulo `Level 2` não aparece enquanto o Portal 036 não for concluído.

---

## 9. PROMOÇÃO DO PORTAL 036

A conclusão válida do Portal executa em uma única transação lógica:

```text
Kether 36/36
Coroa 7/7
Portal concluído
        ↓
initiatory_grade = 2
initiatory_title = Iniciado
current_day = 37
current_chapter = 2
current_sephira = Chokmah
```

Não existe estado intermediário em que o usuário tenha concluído o Portal mas continue oficialmente Neófito.

---

## 10. OFFLINE E CONFLITOS

O cliente pode criar `client_session_id` local antes de sincronizar.

Ao voltar à rede:

1. sincroniza Practice Session;
2. sincroniza evidência estruturada;
3. chama `complete_codex_day`;
4. servidor decide se foi primeira conclusão ou revisita/conclusão já existente;
5. resposta do servidor torna-se o estado oficial.

Se dois dispositivos tentarem concluir o mesmo Dia, a unicidade `(user_id, day)` e a idempotência de XP impedem duplicação.

---

## 11. PRIVACIDADE E TELEMETRIA

Nunca enviar para analytics:

- texto do Espelho da Alma;
- conteúdo de oração;
- transcrição de glossolália;
- sonhos;
- confissões;
- conteúdo descriptografado do Vault.

Pode existir telemetria operacional agregada, quando consentida, como:

- tempo de sessão;
- erro de áudio;
- tela abandonada;
- sucesso/falha de sync;
- crash;
- performance do dispositivo.

---

## 12. O QUE AINDA NÃO ESTÁ AUTOMATIZADO

### 12.1. Atributos

Os sete atributos existem no banco, mas a fonte sincronizada por Dia atualmente não contém um contrato estruturado suficiente para conceder automaticamente incrementos de atributo sem interpretação editorial adicional.

Portanto, esta especificação NÃO inventa eventos de HIP/VNT/PER/SIN/BIO/INT/DIS.

A futura matriz de atributos deverá definir uma fonte estruturada e versionada antes de automatizar ganhos.

### 12.2. Streak

`streak_days` existe, mas sua política temporal ainda não foi aprovada: fuso, grace period, offline, viagens e recuperação de sequência precisam de regra própria. Não será atualizado pela conclusão até essa política existir.

---

## 13. INVARIANTES DE QA

1. Um usuário não pode escrever diretamente em `xp_events`.
2. Um usuário não pode escrever diretamente em `day_completions`.
3. Um usuário não pode editar `user_progress` diretamente.
4. RLS impede acesso às Practice Sessions de outro usuário.
5. Primeira conclusão sem evidência falha.
6. Dia 002 sem Dia 001 falha.
7. Dia 036 com 34/35 ou menos falha.
8. Duas chamadas concorrentes concedem XP no máximo uma vez.
9. Revisita retorna `xp_awarded = 0`.
10. Fragmento acende somente em 5/5.
11. Portal desbloqueia somente em 35/35.
12. Promoção ocorre somente no 36/36.
13. Diário continua separado e criptografado.
14. `xp_total` e `initiatory_grade` nunca são tratados como o mesmo conceito.

---

## 14. CONTRATO PARA O PRODUCTION LAB

O outro chat pode implementar UI e services contra estas APIs sem redefinir game design:

- tabela `practice_sessions`;
- leitura `day_completions`;
- RPC `get_kether_crown_state()`;
- RPC `complete_codex_day(...)`;
- `user_progress.initiatory_grade`;
- `user_progress.initiatory_title`;
- `user_progress.xp_total`.

Qualquer alteração nesses contratos exige mudança versionada nesta especificação e migration correspondente.

# HNK CODEX — DAY 001 QUEST DEFINITION V2

**Status:** APPROVED PRODUCT DESIGN / EDITORIAL PATCHES REQUIRED BEFORE PRODUCTION  
**ID:** `HNK-KETHER-D001-V2`  
**Completion Contract:** `HNK-KETHER-D001-COMP-V2`  
**Canonical Source:** `Tehkne-Solutions/hnk-codex-365/canon/capitulo-01-kether/dia-001.md`  
**Canonical Source SHA:** `a01d13b43cbddb92236fc1e3b6c2a7e140d87d29`  
**XP:** `+150`  
**Sephirah:** Kether  
**World:** Atziluth  
**Angel:** Vehuiah  
**Tracks:** `TEURG-101`, `COMP-101`, `BIO-101`

## 1. Freeze incorporado

Esta versão incorpora as decisões aprovadas:

1. **Universal Entry + identidade canônica declarada.** O aplicativo não exige adesão prévia para acesso, mas não esconde a moldura teológica do HNK.
2. **Meaning Anchor é contexto global de perfil**, não evidência do Day 001.
3. **Prática vocal é obrigatória; gravação é opcional e privada.**
4. **528 Hz é tratado como operador ritual independente** conforme a Ordália de Jachin.
5. **432 Hz / Theta permanece `CANONICAL_MAPPING_PENDING`**, sem diferença binaural inventada.
6. **Completion Contract V2** exige execução dos três atos, retornos, Ordália de Boaz, Espelho e confirmação voluntária.
7. **Safety Guidance acompanha o Canon** quando necessário, sem se passar por texto canônico.
8. **HNK-EP-1.1 é visível na interface** através de anotações E1–E5 e `OPERATIONAL_HYPOTHESIS`.

## 2. Vozes

- `CANON`: texto canônico vindo do bundle sincronizado.
- `GUIDE`: tradução pedagógica e mediação.
- `GUIDE_SAFETY`: orientação de segurança operacional.
- `SYSTEM`: estado, timers, sync, XP e progressão.
- `USER`: registros privados e respostas.

A plataforma não funde silenciosamente essas vozes.

## 3. Fluxo V2

```text
AVAILABLE
→ THRESHOLD
→ ORIENTATION
→ CANONICAL_IDENTITY_NOTICE
→ KETHER_REVEAL
→ JACHIN_READING
→ JACHIN_PRACTICE (10:00)
→ RITUAL_TONE_528
→ JACHIN_RETURN
→ BOAZ_READING
→ BOAZ_SAFETY_OVERLAY
→ BOAZ_PRACTICE (05:00)
→ BOAZ_ORDALIA (3 distrações → Vault)
→ BOAZ_RETURN
→ MIDDLE_READING
→ MIDDLE_VOICE_PRACTICE (03:00)
→ MIDDLE_RETURN
→ PHENOMENOLOGY
→ SOUL_MIRROR
→ CORRESPONDENCE_REVEAL
→ EVIDENCE_PENDING
→ COMPLETE (+150 XP)
→ KETHER_FIRST_SPARK (Vehuiah 1/5)
```

## 4. Contrato de conclusão V2

A primeira conclusão exige:

### Jachin
- sessão iniciada;
- prática concluída;
- retorno confirmado;
- operador ritual 528 Hz iniciado.

### Boaz
- sessão iniciada;
- prática concluída;
- três distrações registradas no Vault;
- contagem estruturada `>= 3`;
- retorno confirmado.

### Caminho do Meio
- prática vocal concluída;
- gravação **não** obrigatória;
- retorno confirmado.

### Espelho
- parte estruturada concluída;
- texto livre, quando houver, permanece no Vault.

### Fechamento
- confirmação voluntária;
- contrato `HNK-KETHER-D001-COMP-V2`;
- XP canônico idempotente `+150`.

Nenhum fenômeno subjetivo específico é requisito de conclusão.

## 5. Episteme no runtime

O Quest Renderer deve conseguir mostrar, de forma discreta:

- `E1` — instrumental;
- `E2` — psicofisiológico/comportamental;
- `E3` — fenomenológico;
- `E4` — tradicional/teúrgico;
- `E5` — teológico;
- `OPERATIONAL_HYPOTHESIS` quando uma alegação ainda não possui confirmação externa suficiente.

O objetivo não é reduzir o HNK a simbolismo, mas impedir que domínios distintos sejam confundidos.

## 6. Privacidade

Nunca entram em analytics em claro:

- texto do Espelho;
- três distrações;
- conteúdo de oração;
- objeto concreto da fé;
- gravação vocal;
- sonhos;
- interpretações pessoais.

A gravação vocal, quando escolhida, permanece local e cifrada antes de qualquer sync.

## 7. Release blockers

### `EDITORIAL-001-UNIVERSAL-ENTRY`
Atualizar o enquadramento global/Capítulo 0 para compatibilizar Porta Universal com identidade teológica explícita.

### `EDITORIAL-001-VOICE`
Atualizar a Ordália do Caminho do Meio para tornar obrigatória a prática vocal, mas opcional o arquivo de áudio, mantendo a matriz editorial de 26 palavras.

### `AUDIO-001-THETA-432`
Definir o mapeamento técnico do perfil Theta/432 antes do playback de produção.

### `BACKEND-001-COMPLETION-V2`
Fazer `complete_codex_day(...)` validar um `completion_contract_id` versionado.

## 8. Regra de publicação

O Day 001 pode ser implementado e testado como Golden Day V2.

**Não deve ser publicado como experiência canônica final enquanto os blockers editoriais e de áudio acima permanecerem abertos.**

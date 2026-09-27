# HNK CODEX — Matriz 90D Kether + Chokmah + Binah

**Data:** 2026-09-27  
**Tracking:** #322  
**Método:** auditoria do `main`; `GREEN` somente com evidência suficiente no repositório. `PARTIAL` = implementação/evidência existente porém incompleta. `RED` = gate explicitamente fechado ou estrutura requerida ausente. `UNKNOWN` = não comprovado nesta passagem.

> Esta matriz não promove conteúdo, não publica operadores e não concede XP. Ela registra o estado verificável do repositório.

| Esfera | Conteúdo | Contratos | Web | Mobile | Assets | QA | Proveniência | Estado 90D |
|---|---|---|---|---|---|---|---|---|
| **Kether** | **PARTIAL** — `canon/capitulo-01-kether/` materializa apenas Dias 033–036; não há árvore `content/canon/atziluth/kether/` | **PARTIAL** — contratos compartilhados e specs de experiência existem, mas esta auditoria não comprova cobertura integral 001–036 | **PARTIAL** — rotas/experiências existem para marcos como 001/035/036; cobertura integral não comprovada | **PARTIAL** — features Kether existem; cobertura integral 001–036 não comprovada | **PARTIAL** — `assets/canonical/kether/` existe; reconciliação do Day001 ainda distingue autoridade canônica de assets derivados | **PARTIAL** — há artefatos de QA/experiência, mas Golden Gate/CI não possui evidência executada suficiente para declarar release GREEN | **PARTIAL** — Day001 possui authority map/checksums/reconciliation; cobertura de toda Kether não comprovada | **PARTIAL** |
| **Chokmah** | **PARTIAL** — árvore canônica Atziluth materializa Dias 040–072; Dias 037–039 permanecem em `canon/capitulo-02-chokmah/`; Portal073 é contrato de transição separado | **GREEN/PARTIAL** — Portal073 tem contrato executivo, IDs canônicos, schema, privacidade, idempotência e progressão definidos; publicação continua bloqueada | **PARTIAL** — runtime Web existe em vários marcos até Day072; Gate real de Portal073 ainda não provado em runtime | **PARTIAL** — features Chokmah e Portal073 existem; Expo/device QA ainda pendente | **PARTIAL** — referências canônicas do Portal073 aprovadas, mas operator set não publicado | **RED** — checklist oficial permanece `FAIL_CLOSED__APPROVED_NOT_PUBLISHED`; Gates A–E sem prova completa | **GREEN/PARTIAL** — referências exatas e regras de autoridade estão registradas; release evidence ainda incompleta | **PARTIAL / FAIL-CLOSED** |
| **Binah** | **RED** — não existe `content/canon/atziluth/binah/` nem `canon/capitulo-03-binah/` no `main` | **PARTIAL** — fronteira de entrada está definida pelo Portal073: +500 XP uma vez, Iniciado→Teurgo uma vez, `current_sephira→Binah`, Day074 disponível e não iniciado | **RED** — `apps/web/app/day-074` e `day-109` não estão materializados | **RED** — `apps/mobile/src/features/binah/` não está materializado | **RED/UNKNOWN** — `assets/canonical/binah/` não está materializado nesta auditoria | **RED** — prova de unlock Day074/no-autostart ainda está `false`; não há gate Binah completo | **PARTIAL** — proveniência da transição Chokmah→Binah está congelada; corpus Binah ainda não foi admitido | **RED** |

## Evidências estruturais principais

### Kether

- `canon/capitulo-01-kether/`: Dias 033, 034, 035 e 036.
- `docs/experience/kether/day-001/`: authority map, checksums e reconciliação de assets.
- `apps/web/app/day-001`, `day-035`, `day-036` e experiências correlatas existem como marcos; isto não equivale a provar cobertura completa 001–036.
- `apps/mobile/src/features/kether/` existe com componentes de Day001/Day036 e outros marcos.

### Chokmah

- `canon/capitulo-02-chokmah/`: Dias 037–039.
- `content/canon/atziluth/chokmah/`: corpus canônico materializado de Dia 040 até Dia 072.
- Dia 072 declara `portal: true`, `transition: Chokmah -> Binah`, +300 XP e exige backend antes da progressão para 073.
- `docs/experience/chokmah/HNK_CHOKMAH_PORTAL_073_EXECUTABLE_SPEC_V1.md` congela o Portal073: referências exatas, Vault E2EE, evidência estrutural, transação atômica, +500 XP uma vez, Iniciado→Teurgo uma vez, Binah/Day074 unlock e **sem auto-start**.
- `docs/qa/chokmah/HNK_PORTAL073_RELEASE_CHECKLIST_V1.json` continua `FAIL_CLOSED__APPROVED_NOT_PUBLISHED` e mantém todos os gates de execução/publicação relevantes como `false`.
- `docs/qa/chokmah/HNK_CHOKMAH_RELEASE_GATE_EXECUTION_V1.md` proíbe inferir PASS de implementação, review, Vercel ou runner indisponível.

### Binah

- A entrada em Binah está contratualmente definida pelo Portal073, mas o corpus e as superfícies executáveis de Binah não estão materializados no `main`.
- Não criar Day074 por extrapolação. O conteúdo-fonte/plano de Binah deve ser recuperado e admitido pelo protocolo editorial antes de materialização canônica.

## Bloqueadores reais para a meta 90D

1. **Kether:** reconciliar cobertura 001–036 e provar quais dias são canônicos, quais são experiências executáveis e quais assets são authoritative/derived.
2. **Chokmah:** executar Gates A–E do release runbook; somente depois considerar `portal_operator_sets(73): approved → published` e habilitação de produção.
3. **Binah:** recuperar a fonte editorial autorizada para Dias 074–109; aplicar protocolo de admissão; só então materializar conteúdo, contratos, Web, Mobile, assets e QA.
4. **CI:** indisponibilidade/pre-step failure de runner não pode ser tratada como PASS ou FAIL de código; evidência deve vir de execução real.

## Próxima sequência autorizada

```text
KETHER COVERAGE RECONCILIATION
→ CHOKMAH RELEASE EVIDENCE
→ PORTAL073 PUBLICATION DECISION (human/release gate)
→ BINAH SOURCE RECOVERY + ADMISSION
→ DAY074 FIRST MATERIALIZATION
→ BINAH 074–109 IMPLEMENTATION
→ 90D FULL AUDIT
```

## Regra de segurança editorial

Ausência de arquivo não autoriza reconstrução por memória ou conhecimento geral. Para Binah, qualquer material novo deve carregar proveniência, status epistemológico e autoridade antes de entrar no cânone.
"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  HNK_CLAIM_EVIDENCE_RELATIONS,
  HNK_CLAIM_SCOPES,
  HNK_EVIDENCE_REVIEW_OUTCOMES,
  applyHumanEvidenceReview,
  assessClaimDossier,
  createClaimDossier,
  createEvidenceReviewGate,
  evidenceSynthesisReport,
  parseClaimDossier,
  parseEvidenceReviewGate,
  parseEvidenceSynthesis,
  serializeClaimDossier,
  serializeEvidenceReviewGate,
  verifyClaimDossierAgainstSynthesis,
  verifyEvidenceReviewGate,
  type HnkClaimDossier,
  type HnkClaimEvidenceRelation,
  type HnkClaimScope,
  type HnkEvidenceReviewGate,
  type HnkEvidenceReviewOutcome,
  type HnkEvidenceSynthesis,
} from "@hnk/quest-engine";
import styles from "../runtime/runtime.module.css";

type Handshake = {
  layer: string;
  authority: string;
  access: string;
  persistence: string;
  boundary: "HUMAN_REVIEW_MAY_CLASSIFY_CLAIM_STATUS_BUT_CANNOT_AUTO_ESTABLISH_TRUTH_CAUSALITY_METAPHYSICS_OR_CANON";
  dossier: {
    scopes: string[];
    evidence_relations: string[];
    human_relevance_classification_required: true;
    automatic_truth_inference: false;
    automatic_canon_promotion: false;
  };
  review_gate: {
    outcomes: string[];
    explicit_human_signal_required: true;
    human_decision_required: true;
    machine_can_decide: false;
    automatic_canon_promotion: false;
  };
};

type GroupChoice = {
  selected: boolean;
  relation: HnkClaimEvidenceRelation;
  rationale: string;
};

function now() {
  return new Date().toISOString();
}

function lines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function downloadJson(filename: string, text: string) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function ClaimDossierLab() {
  const [token, setToken] = useState("");
  const [handshake, setHandshake] = useState<Handshake | null>(null);
  const [synthesis, setSynthesis] = useState<HnkEvidenceSynthesis | null>(null);
  const [dossier, setDossier] = useState<HnkClaimDossier | null>(null);
  const [gate, setGate] = useState<HnkEvidenceReviewGate | null>(null);

  const [claimId, setClaimId] = useState("");
  const [statement, setStatement] = useState("");
  const [scope, setScope] = useState<HnkClaimScope>("DESCRIPTIVE");
  const [authoredBy, setAuthoredBy] = useState("");
  const [gapsText, setGapsText] = useState("");
  const [conflictsText, setConflictsText] = useState("");
  const [notesText, setNotesText] = useState("");
  const [groupChoices, setGroupChoices] = useState<Record<string, GroupChoice>>({});

  const [reviewOutcome, setReviewOutcome] = useState<HnkEvidenceReviewOutcome>("REQUEST_MORE_EVIDENCE");
  const [reviewer, setReviewer] = useState("");
  const [explicitSignal, setExplicitSignal] = useState("");
  const [reviewRationale, setReviewRationale] = useState("");
  const [unresolvedText, setUnresolvedText] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const synthesisReport = useMemo(() => {
    if (!synthesis) return null;
    try {
      return evidenceSynthesisReport(synthesis);
    } catch {
      return null;
    }
  }, [synthesis]);

  const dossierAssessment = useMemo(() => {
    if (!dossier) return null;
    try {
      return assessClaimDossier(dossier);
    } catch {
      return null;
    }
  }, [dossier]);

  const dossierVerification = useMemo(() => {
    if (!dossier || !synthesis) return null;
    try {
      return verifyClaimDossierAgainstSynthesis(dossier, synthesis);
    } catch {
      return null;
    }
  }, [dossier, synthesis]);

  const gateVerification = useMemo(() => {
    if (!gate || !dossier) return null;
    try {
      return verifyEvidenceReviewGate(gate, dossier);
    } catch {
      return null;
    }
  }, [gate, dossier]);

  async function unlock(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/research/claims", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body?.error ?? `HTTP_${response.status}`);
      setHandshake(body as Handshake);
    } catch (err) {
      setHandshake(null);
      setError(err instanceof Error ? err.message : "UNLOCK_FAILED");
    } finally {
      setLoading(false);
    }
  }

  async function importSynthesis(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setError("");
      const parsed = parseEvidenceSynthesis(await file.text());
      const report = evidenceSynthesisReport(parsed);
      const choices: Record<string, GroupChoice> = {};
      for (const group of report.groups) {
        choices[group.metric_signature_digest] = {
          selected: false,
          relation: "UNRESOLVED",
          rationale: "",
        };
      }
      setSynthesis(parsed);
      setGroupChoices(choices);
    } catch (err) {
      setError(err instanceof Error ? err.message : "SYNTHESIS_IMPORT_FAILED");
    }
  }

  async function importDossier(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setError("");
      const parsed = parseClaimDossier(await file.text());
      setDossier(parsed);
      setClaimId(parsed.claim_id);
      setStatement(parsed.statement);
      setScope(parsed.scope);
      setAuthoredBy(parsed.authored_by);
      setGapsText(parsed.gaps.join("\n"));
      setConflictsText(parsed.conflicts.join("\n"));
      setNotesText(parsed.notes.join("\n"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "DOSSIER_IMPORT_FAILED");
    }
  }

  async function importGate(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setError("");
      setGate(parseEvidenceReviewGate(await file.text()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "GATE_IMPORT_FAILED");
    }
  }

  function updateChoice(
    digest: string,
    patch: Partial<GroupChoice>,
  ) {
    setGroupChoices((current) => ({
      ...current,
      [digest]: {
        ...(current[digest] ?? {
          selected: false,
          relation: "UNRESOLVED" as HnkClaimEvidenceRelation,
          rationale: "",
        }),
        ...patch,
      },
    }));
  }

  function buildDossier(event: FormEvent) {
    event.preventDefault();
    if (!synthesis || !synthesisReport) return;
    try {
      setError("");
      const evidenceLinks = synthesisReport.groups
        .filter((group) => groupChoices[group.metric_signature_digest]?.selected)
        .map((group, index) => {
          const choice = groupChoices[group.metric_signature_digest];
          return {
            link_id: `LINK-${index + 1}-${crypto.randomUUID()}`,
            metric_signature_digest: group.metric_signature_digest,
            relation: choice.relation,
            rationale: choice.rationale,
          };
        });

      if (!evidenceLinks.length) throw new Error("SELECT_AT_LEAST_ONE_SYNTHESIS_GROUP");
      if (evidenceLinks.some((link) => !link.rationale.trim())) {
        throw new Error("RATIONALE_REQUIRED_FOR_EACH_EVIDENCE_LINK");
      }

      const next = createClaimDossier({
        claim_id: claimId,
        statement,
        scope,
        authored_by: authoredBy,
        created_at: now(),
        synthesis,
        evidence_links: evidenceLinks,
        gaps: lines(gapsText),
        conflicts: lines(conflictsText),
        notes: lines(notesText),
      });
      setDossier(next);
      setGate(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "DOSSIER_CREATE_FAILED");
    }
  }

  function openReviewGate() {
    if (!dossier) return;
    try {
      setError("");
      setGate(createEvidenceReviewGate(dossier, { opened_at: now() }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "REVIEW_GATE_OPEN_FAILED");
    }
  }

  function decideReview(event: FormEvent) {
    event.preventDefault();
    if (!gate || !dossier) return;
    try {
      setError("");
      setGate(applyHumanEvidenceReview(gate, dossier, {
        outcome: reviewOutcome,
        reviewer,
        reviewed_at: now(),
        explicit_human_signal: explicitSignal,
        rationale: reviewRationale,
        unresolved_questions: lines(unresolvedText),
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "HUMAN_REVIEW_FAILED");
    }
  }

  if (!handshake) {
    return (
      <section className={styles.unlockPanel}>
        <p className={styles.kicker}>Acesso privado</p>
        <h2>Desbloquear Claim Review</h2>
        <p>O token abre a bancada. A relevância dos grupos e a decisão do Evidence Review Gate exigem entrada humana explícita.</p>
        <form onSubmit={unlock} className={styles.unlockForm}>
          <input
            type="password"
            autoComplete="off"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="HNK_RESEARCH_LAB_TOKEN"
            required
          />
          <button disabled={loading}>{loading ? "Validando…" : "Entrar"}</button>
        </form>
        {error ? <p className={styles.error}>{error}</p> : null}
      </section>
    );
  }

  return (
    <div className={styles.workspace}>
      <aside className={styles.sidebar}>
        <article className={styles.healthCard}>
          <span className={handshake.review_gate.machine_can_decide === false ? styles.goodDot : styles.badDot} />
          <div>
            <strong>{handshake.layer}</strong>
            <p>human review gate · no auto canon</p>
          </div>
        </article>

        <div className={styles.metricGrid}>
          <article><strong>{synthesisReport?.metric_groups ?? 0}</strong><span>synthesis groups</span></article>
          <article><strong>{dossier?.evidence_links.length ?? 0}</strong><span>linked groups</span></article>
          <article><strong>{dossier?.gaps.length ?? 0}</strong><span>gaps</span></article>
          <article><strong>{gate?.status ?? "—"}</strong><span>review gate</span></article>
        </div>

        <p className={styles.boundary}>{handshake.boundary}.</p>

        <label>Importar Evidence Synthesis<input type="file" accept="application/json,.json" onChange={importSynthesis} /></label>
        <label>Importar Claim Dossier<input type="file" accept="application/json,.json" onChange={importDossier} /></label>
        <label>Importar Evidence Review Gate<input type="file" accept="application/json,.json" onChange={importGate} /></label>

        {dossier ? (
          <button
            className={styles.ghostButton}
            onClick={() => downloadJson(`${dossier.claim_id}.hnk-claim-dossier.json`, serializeClaimDossier(dossier))}
          >
            Exportar dossier
          </button>
        ) : null}

        {gate ? (
          <button
            className={styles.ghostButton}
            onClick={() => downloadJson(`${gate.claim_id}.hnk-evidence-review-gate.json`, serializeEvidenceReviewGate(gate))}
          >
            Exportar review gate
          </button>
        ) : null}
      </aside>

      <section className={styles.mainPanel}>
        {!dossier ? (
          <form className={styles.stageCard} onSubmit={buildDossier}>
            <p className={styles.kicker}>01 · CLAIM DOSSIER</p>
            <h2>Definir afirmação e relevância humana</h2>

            <div className={styles.twoCols}>
              <label>Claim ID<input value={claimId} onChange={(event) => setClaimId(event.target.value)} required /></label>
              <label>Autoria / responsável<input value={authoredBy} onChange={(event) => setAuthoredBy(event.target.value)} required /></label>
            </div>

            <label>Afirmação<textarea value={statement} onChange={(event) => setStatement(event.target.value)} required /></label>
            <label>Escopo
              <select value={scope} onChange={(event) => setScope(event.target.value as HnkClaimScope)}>
                {HNK_CLAIM_SCOPES.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>

            <label>Lacunas — uma por linha<textarea value={gapsText} onChange={(event) => setGapsText(event.target.value)} /></label>
            <label>Conflitos — um por linha<textarea value={conflictsText} onChange={(event) => setConflictsText(event.target.value)} /></label>
            <label>Notas — uma por linha<textarea value={notesText} onChange={(event) => setNotesText(event.target.value)} /></label>

            <p className={styles.kicker}>EVIDENCE SYNTHESIS GROUPS</p>
            {!synthesisReport ? <p>Importe um Evidence Synthesis antes de criar o dossier.</p> : null}

            <div className={styles.eventList}>
              {synthesisReport?.groups.map((group) => {
                const choice = groupChoices[group.metric_signature_digest] ?? {
                  selected: false,
                  relation: "UNRESOLVED" as HnkClaimEvidenceRelation,
                  rationale: "",
                };
                return (
                  <article key={group.metric_signature_digest}>
                    <label>
                      <input
                        type="checkbox"
                        checked={choice.selected}
                        onChange={(event) => updateChoice(group.metric_signature_digest, { selected: event.target.checked })}
                      />
                      Vincular {group.metric_id} · {group.status}
                    </label>
                    <code>{group.metric_signature_digest}</code>
                    <p>{group.metric_label} · convergent_direction={group.convergent_direction ?? "—"}</p>
                    <label>Relação
                      <select
                        value={choice.relation}
                        disabled={!choice.selected}
                        onChange={(event) => updateChoice(group.metric_signature_digest, {
                          relation: event.target.value as HnkClaimEvidenceRelation,
                        })}
                      >
                        {HNK_CLAIM_EVIDENCE_RELATIONS.map((relation) => <option key={relation}>{relation}</option>)}
                      </select>
                    </label>
                    <label>Racional humano
                      <textarea
                        disabled={!choice.selected}
                        value={choice.rationale}
                        onChange={(event) => updateChoice(group.metric_signature_digest, { rationale: event.target.value })}
                      />
                    </label>
                  </article>
                );
              })}
            </div>

            <button className={styles.primaryButton} disabled={!synthesisReport}>Criar Claim Dossier</button>
          </form>
        ) : (
          <>
            <section className={styles.sessionHeader}>
              <div>
                <p className={styles.kicker}>CLAIM DOSSIER V1</p>
                <code>{dossier.dossier_digest}</code>
                <h2>{dossier.claim_id}</h2>
                <p>{dossier.statement}</p>
              </div>
              <div className={styles.badges}>
                <span>{dossier.scope}</span>
                <span>{dossierVerification?.ok === true ? "SYNTHESIS BIND PASS" : synthesis ? "BIND CHECK" : "SOURCE NOT LOADED"}</span>
                <span>NO AUTO CANON</span>
              </div>
            </section>

            {dossierAssessment ? (
              <section className={styles.auditPanel}>
                <div className={styles.auditHeader}>
                  <div><p className={styles.kicker}>DOSSIER ASSESSMENT</p><h2>Evidence relevance map</h2></div>
                  <div className={styles.badges}>
                    <span>{dossierAssessment.linked_groups} LINKS</span>
                    <span>{dossierAssessment.unresolved_links.length} UNRESOLVED</span>
                  </div>
                </div>

                <pre>{JSON.stringify({
                  relation_counts: dossierAssessment.relation_counts,
                  group_status_counts: dossierAssessment.group_status_counts,
                  gaps: dossierAssessment.gaps,
                  conflicts: dossierAssessment.conflicts,
                  ready_for_human_review: dossierAssessment.ready_for_human_review,
                  truth_assessed: dossierAssessment.truth_assessed,
                  canon_promotion_permitted: dossierAssessment.canon_promotion_permitted,
                }, null, 2)}</pre>

                <div className={styles.eventList}>
                  {dossier.evidence_links.map((link) => (
                    <article key={link.link_id}>
                      <strong>{link.relation} · {link.metric_id} · {link.group_status}</strong>
                      <code>{link.metric_signature_digest}</code>
                      <p>{link.rationale}</p>
                      <p>direction={link.convergent_direction ?? "—"} · questions={link.source_questions.length}</p>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {!gate ? (
              <section className={styles.stageCard}>
                <p className={styles.kicker}>02 · EVIDENCE REVIEW GATE</p>
                <h2>Abrir revisão humana</h2>
                <p>Este passo apenas abre o gate. Nenhuma decisão é gerada automaticamente.</p>
                <button className={styles.primaryButton} onClick={openReviewGate}>Abrir Human Evidence Review Gate</button>
              </section>
            ) : (
              <section className={styles.resultCard}>
                <p className={styles.kicker}>EVIDENCE REVIEW GATE V1</p>
                <h2>{gate.status}</h2>
                <code>{gate.gate_digest}</code>
                <p>Binding: {gateVerification?.ok === true ? "PASS" : "CHECK"} · machine_can_decide=false · canon_promotion_permitted=false</p>

                {gate.status === "PENDING_HUMAN_REVIEW" ? (
                  <form onSubmit={decideReview}>
                    <label>Outcome
                      <select
                        value={reviewOutcome}
                        onChange={(event) => setReviewOutcome(event.target.value as HnkEvidenceReviewOutcome)}
                      >
                        {HNK_EVIDENCE_REVIEW_OUTCOMES.map((outcome) => <option key={outcome}>{outcome}</option>)}
                      </select>
                    </label>
                    <label>Revisor humano<input value={reviewer} onChange={(event) => setReviewer(event.target.value)} required /></label>
                    <label>Sinal humano explícito<input value={explicitSignal} onChange={(event) => setExplicitSignal(event.target.value)} placeholder="Ex.: APROVADO PARA USO DESCRITIVO" required /></label>
                    <label>Racional<textarea value={reviewRationale} onChange={(event) => setReviewRationale(event.target.value)} required /></label>
                    <label>Questões ainda não resolvidas — uma por linha<textarea value={unresolvedText} onChange={(event) => setUnresolvedText(event.target.value)} /></label>
                    <button className={styles.primaryButton}>Registrar decisão humana</button>
                  </form>
                ) : (
                  <article>
                    <strong>{gate.review?.outcome}</strong>
                    <p>reviewer={gate.review?.reviewer} · reviewed_at={gate.review?.reviewed_at}</p>
                    <p>signal={gate.review?.explicit_human_signal}</p>
                    <p>{gate.review?.rationale}</p>
                    <p>unresolved={gate.review?.unresolved_questions.join(" · ") || "—"}</p>
                    <code>human_decision=true · truth_assessed=not granted · canon_promotion_permitted=false</code>
                  </article>
                )}
              </section>
            )}
          </>
        )}

        {error ? <p className={styles.error}>{error}</p> : null}
      </section>
    </div>
  );
}

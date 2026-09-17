"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  addSynthesisRegistry,
  createEvidenceSynthesis,
  evidenceSynthesisReport,
  parseEvidenceSynthesis,
  parseReplicationRegistry,
  serializeEvidenceSynthesis,
  type HnkEvidenceSynthesis,
  type HnkReplicationRegistry,
} from "@hnk/quest-engine";
import styles from "../runtime/runtime.module.css";

type Handshake = {
  layer: string;
  authority: string;
  access: string;
  persistence: string;
  boundary: "EVIDENCE_SYNTHESIS_MAPS_CONVERGENCE_DIVERGENCE_AND_INSUFFICIENCY_NOT_TRUTH_CAUSALITY_OR_METAPHYSICAL_PROOF";
  summary: {
    group_statuses: string[];
    grouping_key: string;
    heterogeneous_metric_signatures_allowed: boolean;
    mixed_and_insufficient_preserved: boolean;
    automatic_truth_inference: false;
  };
};

function now() {
  return new Date().toISOString();
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

export default function EvidenceSynthesisLab() {
  const [token, setToken] = useState("");
  const [handshake, setHandshake] = useState<Handshake | null>(null);
  const [stagedRegistry, setStagedRegistry] = useState<HnkReplicationRegistry | null>(null);
  const [synthesis, setSynthesis] = useState<HnkEvidenceSynthesis | null>(null);
  const [synthesisKey, setSynthesisKey] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const report = useMemo(() => {
    if (!synthesis) return null;
    try {
      return evidenceSynthesisReport(synthesis);
    } catch {
      return null;
    }
  }, [synthesis]);

  async function unlock(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/research/synthesis", {
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

  async function importRegistry(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setError("");
      setStagedRegistry(parseReplicationRegistry(await file.text()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "REGISTRY_IMPORT_FAILED");
    }
  }

  async function importSynthesis(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      setError("");
      const parsed = parseEvidenceSynthesis(await file.text());
      setSynthesis(parsed);
      setSynthesisKey(parsed.synthesis_key);
      setTitle(parsed.title);
    } catch (err) {
      setError(err instanceof Error ? err.message : "SYNTHESIS_IMPORT_FAILED");
    }
  }

  function createSynthesis(event: FormEvent) {
    event.preventDefault();
    if (!stagedRegistry) return;
    try {
      setError("");
      const timestamp = now();
      setSynthesis(createEvidenceSynthesis({
        synthesis_key: synthesisKey,
        title,
        created_at: timestamp,
        seed_source_id: `SRC-${crypto.randomUUID()}`,
        seed_added_at: timestamp,
        seed_registry: stagedRegistry,
      }));
      setStagedRegistry(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "SYNTHESIS_CREATE_FAILED");
    }
  }

  function addRegistry() {
    if (!synthesis || !stagedRegistry) return;
    try {
      setError("");
      setSynthesis(addSynthesisRegistry(synthesis, {
        source_id: `SRC-${crypto.randomUUID()}`,
        added_at: now(),
        registry: stagedRegistry,
      }));
      setStagedRegistry(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "SYNTHESIS_ADD_FAILED");
    }
  }

  if (!handshake) {
    return (
      <section className={styles.unlockPanel}>
        <p className={styles.kicker}>Acesso privado</p>
        <h2>Desbloquear Evidence Synthesis</h2>
        <p>O token libera a bancada; Replication Registries e syntheses continuam em arquivos controlados pelo usuário.</p>
        <form onSubmit={unlock} className={styles.unlockForm}>
          <input type="password" autoComplete="off" value={token} onChange={(event) => setToken(event.target.value)} placeholder="HNK_RESEARCH_LAB_TOKEN" required />
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
          <span className={handshake.summary.mixed_and_insufficient_preserved ? styles.goodDot : styles.badDot} />
          <div><strong>{handshake.layer}</strong><p>convergence map · no truth inference</p></div>
        </article>

        <div className={styles.metricGrid}>
          <article><strong>{report?.total_registries ?? 0}</strong><span>registries</span></article>
          <article><strong>{report?.metric_groups ?? 0}</strong><span>metric groups</span></article>
          <article><strong>{report?.group_status_counts.CONVERGENT ?? 0}</strong><span>convergent</span></article>
          <article><strong>{(report?.group_status_counts.DIVERGENT ?? 0) + (report?.group_status_counts.MIXED ?? 0)}</strong><span>divergent/mixed</span></article>
        </div>

        <p className={styles.boundary}>{handshake.boundary}. Grupos incompatíveis permanecem separados por assinatura SHA-256.</p>

        <label>Importar Replication Registry<input type="file" accept="application/json,.json" onChange={importRegistry} /></label>
        <label>Importar Evidence Synthesis<input type="file" accept="application/json,.json" onChange={importSynthesis} /></label>

        {synthesis ? (
          <button className={styles.ghostButton} onClick={() => downloadJson(`${synthesis.synthesis_key}.hnk-evidence-synthesis.json`, serializeEvidenceSynthesis(synthesis))}>Exportar synthesis</button>
        ) : null}
      </aside>

      <section className={styles.mainPanel}>
        {!synthesis ? (
          <form className={styles.stageCard} onSubmit={createSynthesis}>
            <p className={styles.kicker}>01 · CREATE SYNTHESIS</p>
            <h2>Abrir mapa acumulativo</h2>
            <label>Synthesis key<input value={synthesisKey} onChange={(event) => setSynthesisKey(event.target.value)} placeholder="EX.: HNK-SYNTHESIS-001" required /></label>
            <label>Título<input value={title} onChange={(event) => setTitle(event.target.value)} required /></label>
            <p>{stagedRegistry ? `Seed: ${stagedRegistry.replication_key}` : "Importe um Replication Registry como seed."}</p>
            <button className={styles.primaryButton} disabled={!stagedRegistry}>Criar Evidence Synthesis</button>
          </form>
        ) : (
          <>
            <section className={styles.sessionHeader}>
              <div>
                <p className={styles.kicker}>EVIDENCE SYNTHESIS V1</p>
                <code>{synthesis.synthesis_digest}</code>
                <h2>{synthesis.title}</h2>
                <p>{synthesis.synthesis_key}</p>
              </div>
              <div className={styles.badges}>
                <span>{report?.metric_groups ?? 0} METRIC GROUPS</span>
                <span>NO P-VALUES</span>
                <span>NO AUTO TRUTH</span>
              </div>
            </section>

            {stagedRegistry ? (
              <section className={styles.stageCard}>
                <p className={styles.kicker}>02 · ADD REPLICATION REGISTRY</p>
                <h2>{stagedRegistry.replication_key}</h2>
                <p>{stagedRegistry.question}</p>
                <button className={styles.primaryButton} onClick={addRegistry}>Adicionar registry</button>
              </section>
            ) : (
              <section className={styles.stageCard}>
                <p className={styles.kicker}>02 · WAITING FOR SOURCE</p>
                <h2>Importe outro Replication Registry</h2>
                <p>Snapshots duplicados da mesma replication_key são rejeitados para evitar contagem dupla.</p>
              </section>
            )}

            {report ? (
              <section className={styles.auditPanel}>
                <div className={styles.auditHeader}>
                  <div><p className={styles.kicker}>CONVERGENCE / DIVERGENCE MATRIX</p><h2>Grupos por assinatura de métrica</h2></div>
                  <div className={styles.badges}><span>{report.total_registries} SOURCES</span><span>{report.metric_groups} GROUPS</span></div>
                </div>

                <div className={styles.eventList}>
                  {report.groups.map((group) => (
                    <article key={group.metric_signature_digest}>
                      <strong>{group.status} · {group.metric_id} · {group.metric_type}</strong>
                      <code>{group.metric_signature_digest}</code>
                      <p>{group.metric_label} · {group.unit ?? "unitless"} · registries={group.registries}</p>
                      <p>
                        replicated={group.replicated_registries} · mixed={group.mixed_registries} ·
                        single={group.single_run_registries} · insufficient={group.insufficient_registries}
                      </p>
                      <p>
                        directions: HIGHER={group.replicated_direction_counts.HIGHER} ·
                        LOWER={group.replicated_direction_counts.LOWER} ·
                        EQUAL={group.replicated_direction_counts.EQUAL}
                      </p>
                      <p>convergent_direction={group.convergent_direction ?? "—"}</p>
                      {group.questions.map((item) => (
                        <p key={item.replication_key}>
                          {item.replication_key} · {item.replication_status} · {item.repeated_direction ?? "—"} · {item.question}
                        </p>
                      ))}
                    </article>
                  ))}
                </div>

                <pre>{JSON.stringify(report.group_status_counts, null, 2)}</pre>
                <code>truth_assessed=false · inferential_statistics_performed=false · causal_claim_permitted=false · metaphysical_proof_permitted=false</code>
              </section>
            ) : null}
          </>
        )}

        {error ? <p className={styles.error}>{error}</p> : null}
      </section>
    </div>
  );
}

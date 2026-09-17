"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import styles from "./human-gate.module.css";

type HnkValue = "LOW" | "MEDIUM" | "HIGH";
type HumanGateOutcome =
  | "PROMOTE_TO_HNK_CANON"
  | "KEEP_AS_CANDIDATE"
  | "RECLASSIFY_AS_REFERENCE"
  | "MOVE_TO_RESEARCH_ONLY"
  | "EXCLUDE_OPERATIONALLY";

type Candidate = {
  item: {
    id: string;
    name: string;
    description: string;
    source_basis: string;
    historical_layer: string;
    classification: string;
    primary_decision: "CANDIDATE";
    hnk_value: HnkValue;
    admission_reason: string;
    risk_or_limit: string;
    provenance_status: string;
    version: string;
    conflicts?: string[];
    dependencies?: string[];
  };
  decision_layer: {
    operational_policy: string;
    human_gate_required: boolean;
    archive_policy: string;
    canon_import: string;
  };
  human_gate: {
    state: "PENDING" | "DECIDED";
    machine_can_decide: false;
    explicit_human_approval_required: true;
    allowed_outcomes: HumanGateOutcome[];
    decision?: {
      gate_id: string;
      outcome: HumanGateOutcome;
      approved_by: string;
      approved_at: string;
      rationale: string;
      resulting_status: string;
    };
  };
};

type Payload = {
  layer: string;
  protocol: string;
  canon_import: string;
  machine_autopromotion: false;
  validation: { ok: boolean; issues: string[] };
  summary: {
    candidates: number;
    pending: number;
    decided: number;
    by_value: Record<HnkValue, number>;
  };
  count: number;
  records: Candidate[];
};

function humanize(value: string) {
  return value.replaceAll("_", " ");
}

export default function HumanGateLab() {
  const [token, setToken] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [payload, setPayload] = useState<Payload | null>(null);
  const [query, setQuery] = useState("");
  const [hnkValue, setHnkValue] = useState<HnkValue | "">("");
  const [state, setState] = useState<"PENDING" | "DECIDED" | "ALL">("PENDING");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function callApi(search = "") {
    const response = await fetch(`/api/research/human-gate${search}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body?.error ?? `HTTP_${response.status}`);
    return body as Payload;
  }

  async function unlock(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      setPayload(await callApi());
      setUnlocked(true);
    } catch (err) {
      setUnlocked(false);
      setError(err instanceof Error ? err.message : "UNLOCK_FAILED");
    } finally {
      setLoading(false);
    }
  }

  async function search(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ state });
      if (query.trim()) params.set("q", query.trim());
      if (hnkValue) params.set("hnk_value", hnkValue);
      setPayload(await callApi(`?${params.toString()}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "QUERY_FAILED");
    } finally {
      setLoading(false);
    }
  }

  if (!unlocked) {
    return (
      <section className={styles.unlockPanel}>
        <p className={styles.kicker}>Acesso privado</p>
        <h2>Desbloquear Human Gate</h2>
        <p>Use o token privado do Research Lab. O token permanece apenas na memória desta sessão.</p>
        <form onSubmit={unlock} className={styles.unlockForm}>
          <input
            className={styles.input}
            type="password"
            autoComplete="off"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="HNK_RESEARCH_LAB_TOKEN"
            required
          />
          <button className={styles.primaryButton} disabled={loading}>{loading ? "Validando…" : "Entrar"}</button>
        </form>
        {error ? <p className={styles.error}>{error}</p> : null}
      </section>
    );
  }

  return (
    <div className={styles.workspace}>
      <aside className={styles.sidebar}>
        <article className={styles.healthCard}>
          <span className={payload?.validation.ok ? styles.goodDot : styles.badDot} />
          <div>
            <strong>{payload?.layer}</strong>
            <p>{payload?.validation.ok ? "Human Gate validado" : "Validação com issues"}</p>
          </div>
        </article>
        <div className={styles.metricGrid}>
          <article><strong>{payload?.summary.candidates ?? 0}</strong><span>candidatos</span></article>
          <article><strong>{payload?.summary.pending ?? 0}</strong><span>pendentes</span></article>
          <article><strong>{payload?.summary.decided ?? 0}</strong><span>decididos</span></article>
        </div>
        <p className={styles.boundary}>
          A interface não possui botão de aprovação. Uma decisão só existe quando um registro Human Gate explicitamente autorizado é acrescentado ao repositório.
        </p>
      </aside>

      <section className={styles.mainPanel}>
        <form onSubmit={search} className={styles.queryBar}>
          <label className={styles.searchField}>
            <span>Buscar candidato</span>
            <input className={styles.input} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Glyph, runtime, polarity…" />
          </label>
          <label>
            <span>Valor HNK</span>
            <select className={styles.select} value={hnkValue} onChange={(event) => setHnkValue(event.target.value as HnkValue | "")}>
              <option value="">Todos</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </label>
          <label>
            <span>Estado</span>
            <select className={styles.select} value={state} onChange={(event) => setState(event.target.value as "PENDING" | "DECIDED" | "ALL")}>
              <option value="PENDING">PENDING</option>
              <option value="DECIDED">DECIDED</option>
              <option value="ALL">ALL</option>
            </select>
          </label>
          <button className={styles.primaryButton} disabled={loading}>{loading ? "Consultando…" : "Aplicar"}</button>
        </form>

        {error ? <p className={styles.error}>{error}</p> : null}

        <div className={styles.resultHeader}>
          <div>
            <p className={styles.kicker}>EXPLICIT HUMAN REVIEW</p>
            <h2>{payload?.count ?? 0} itens na fila</h2>
          </div>
          <div className={styles.lockRowCompact}>
            <span>AUTOPROMOTION OFF</span>
            <span>HISTORY PRESERVED</span>
          </div>
        </div>

        <div className={styles.recordList}>
          {payload?.records.map((record) => (
            <article key={record.item.id} className={styles.recordCard}>
              <div className={styles.recordTop}>
                <div>
                  <p className={styles.recordId}>{record.item.id}</p>
                  <h3>{record.item.name}</h3>
                </div>
                <div className={styles.badges}>
                  <span>{record.item.hnk_value}</span>
                  <span data-state={record.human_gate.state}>{record.human_gate.state}</span>
                </div>
              </div>

              <p className={styles.description}>{record.item.description}</p>

              <div className={styles.reasonGrid}>
                <section>
                  <p className={styles.kicker}>POR QUE É CANDIDATO</p>
                  <p>{record.item.admission_reason}</p>
                </section>
                <section>
                  <p className={styles.kicker}>LIMITE / RISCO</p>
                  <p>{record.item.risk_or_limit}</p>
                </section>
              </div>

              <dl className={styles.metaGrid}>
                <div><dt>Classificação</dt><dd>{humanize(record.item.classification)}</dd></div>
                <div><dt>Camada</dt><dd>{humanize(record.item.historical_layer)}</dd></div>
                <div><dt>Fonte base</dt><dd>{humanize(record.item.source_basis)}</dd></div>
                <div><dt>Proveniência</dt><dd>{humanize(record.item.provenance_status)}</dd></div>
                <div><dt>Versão</dt><dd>{record.item.version}</dd></div>
                <div><dt>Runtime</dt><dd>{humanize(record.decision_layer.operational_policy)}</dd></div>
              </dl>

              <section className={styles.outcomes}>
                <p className={styles.kicker}>SAÍDAS PERMITIDAS PELO HUMAN GATE</p>
                <div>
                  {record.human_gate.allowed_outcomes.map((outcome) => <span key={outcome}>{humanize(outcome)}</span>)}
                </div>
              </section>

              {record.item.conflicts?.length || record.item.dependencies?.length ? (
                <div className={styles.traceRow}>
                  {record.item.conflicts?.length ? <span>Conflitos: {record.item.conflicts.join(", ")}</span> : null}
                  {record.item.dependencies?.length ? <span>Dependências: {record.item.dependencies.join(", ")}</span> : null}
                </div>
              ) : null}

              {record.human_gate.decision ? (
                <section className={styles.decisionRecord}>
                  <p className={styles.kicker}>DECISÃO HUMANA REGISTRADA</p>
                  <strong>{humanize(record.human_gate.decision.outcome)}</strong>
                  <p>{record.human_gate.decision.rationale}</p>
                  <small>{record.human_gate.decision.approved_by} · {record.human_gate.decision.approved_at}</small>
                </section>
              ) : (
                <p className={styles.pending}>AWAITING_HUMAN_GATE · nenhuma promoção canônica autorizada</p>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

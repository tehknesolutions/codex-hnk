"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import styles from "./canon.module.css";

type CanonKind =
  | "STRUCTURAL_PRINCIPLE"
  | "RUNTIME_PRIMITIVE"
  | "SEMANTIC_PRINCIPLE"
  | "RUNTIME_OPERATOR"
  | "EVIDENCE_PRIMITIVE"
  | "SYMBOLIC_PRIMITIVE"
  | "GLYPH_ARCHITECTURE"
  | "OPERATIONAL_LOOP"
  | "GLYPH_GRAMMAR"
  | "INFRASTRUCTURE"
  | "RUNTIME_ARCHITECTURE"
  | "GOVERNANCE_INFRASTRUCTURE"
  | "AUTHORING_PRINCIPLE";

const KINDS: CanonKind[] = [
  "STRUCTURAL_PRINCIPLE",
  "RUNTIME_PRIMITIVE",
  "SEMANTIC_PRINCIPLE",
  "RUNTIME_OPERATOR",
  "EVIDENCE_PRIMITIVE",
  "SYMBOLIC_PRIMITIVE",
  "GLYPH_ARCHITECTURE",
  "OPERATIONAL_LOOP",
  "GLYPH_GRAMMAR",
  "INFRASTRUCTURE",
  "RUNTIME_ARCHITECTURE",
  "GOVERNANCE_INFRASTRUCTURE",
  "AUTHORING_PRINCIPLE",
];

type CanonEntry = {
  canon: {
    canon_item_id: string;
    source_item_id: string;
    name: string;
    kind: CanonKind;
    definition: string;
    constraints: string[];
    version: string;
  };
  human_gate: {
    gate_id: string;
    outcome: string;
    approved_by: string;
    approved_at: string;
    rationale: string;
    resulting_status: string;
  };
};

type Payload = {
  layer: string;
  authority: "HNK_AUTHORED";
  access: "READ_ONLY";
  validation: { ok: boolean; issues: string[] };
  summary: {
    canon_id: string;
    status: string;
    authority: string;
    version: string;
    approved_by: string;
    approved_at: string;
    source_records_preserved: boolean;
    historical_authority_inherited: boolean;
    records: number;
    by_kind: Record<CanonKind, number>;
    human_gate: {
      registry_id: string;
      status: string;
      machine_autopromotion: false;
      approval_id: string;
      approval_status: string;
      approval_signal: string;
      human_decision: true;
      machine_can_decide: false;
    };
  };
  count: number;
  records: CanonEntry[];
};

function humanize(value: string) {
  return value.replaceAll("_", " ");
}

export default function CanonRegistryLab() {
  const [token, setToken] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [payload, setPayload] = useState<Payload | null>(null);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<CanonKind | "">("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function callApi(search = "") {
    const response = await fetch(`/api/research/canon${search}`, {
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
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (kind) params.set("kind", kind);
      const suffix = params.size ? `?${params.toString()}` : "";
      setPayload(await callApi(suffix));
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
        <h2>Desbloquear Canon Registry</h2>
        <p>Use o token privado do Research Lab. Esta superfície é somente leitura.</p>
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
            <p>{payload?.validation.ok ? "Registry validado" : "Validação com issues"}</p>
          </div>
        </article>

        <div className={styles.metricGrid}>
          <article><strong>{payload?.summary.records ?? 0}</strong><span>itens canônicos</span></article>
          <article><strong>{payload?.summary.approved_by ?? "—"}</strong><span>Human Gate</span></article>
          <article><strong>{payload?.summary.human_gate.machine_can_decide ? "ON" : "OFF"}</strong><span>machine decide</span></article>
          <article><strong>{payload?.summary.historical_authority_inherited ? "YES" : "NO"}</strong><span>herança histórica</span></article>
        </div>

        <p className={styles.boundary}>
          Este registry não promove nada. Ele apenas lê registros que já possuem decisão humana e manifesto HNK_AUTHORED correspondente.
        </p>
      </aside>

      <section className={styles.mainPanel}>
        <form onSubmit={search} className={styles.queryBar}>
          <label className={styles.searchField}>
            <span>Buscar no cânone</span>
            <input className={styles.input} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="runtime, glyph, feedback…" />
          </label>
          <label>
            <span>Tipo</span>
            <select className={styles.select} value={kind} onChange={(event) => setKind(event.target.value as CanonKind | "")}>
              <option value="">Todos</option>
              {KINDS.map((value) => <option key={value} value={value}>{humanize(value)}</option>)}
            </select>
          </label>
          <button className={styles.primaryButton} disabled={loading}>{loading ? "Consultando…" : "Aplicar"}</button>
        </form>

        {error ? <p className={styles.error}>{error}</p> : null}

        <div className={styles.resultHeader}>
          <div>
            <p className={styles.kicker}>RESEARCH → HUMAN GATE → CANON</p>
            <h2>{payload?.count ?? 0} registros</h2>
          </div>
          <div className={styles.lockRowCompact}>
            <span>HNK_AUTHORED</span>
            <span>READ ONLY</span>
            <span>PROVENANCE PRESERVED</span>
          </div>
        </div>

        <div className={styles.recordList}>
          {payload?.records.map((record) => (
            <article key={record.canon.canon_item_id} className={styles.recordCard}>
              <div className={styles.recordTop}>
                <div>
                  <p className={styles.recordId}>{record.canon.canon_item_id}</p>
                  <h3>{record.canon.name}</h3>
                </div>
                <div className={styles.badges}>
                  <span>{humanize(record.canon.kind)}</span>
                  <span>v{record.canon.version}</span>
                </div>
              </div>

              <p className={styles.description}>{record.canon.definition}</p>

              <section className={styles.trace}>
                <p className={styles.kicker}>TRACE</p>
                <code>{record.canon.source_item_id} → {record.human_gate.gate_id} → {record.canon.canon_item_id}</code>
              </section>

              <section className={styles.decisionRecord}>
                <p className={styles.kicker}>HUMAN GATE</p>
                <strong>{humanize(record.human_gate.outcome)}</strong>
                <p>{record.human_gate.rationale}</p>
                <small>{record.human_gate.approved_by} · {record.human_gate.approved_at}</small>
              </section>

              <section className={styles.constraints}>
                <p className={styles.kicker}>CONSTRAINTS</p>
                {record.canon.constraints.map((constraint) => <p key={constraint}>• {constraint}</p>)}
              </section>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

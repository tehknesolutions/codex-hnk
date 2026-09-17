"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import styles from "./decision.module.css";

type Decision = "CORE" | "REFERENCE" | "CANDIDATE" | "RESEARCH_ONLY" | "EXCLUDE_OPERATIONALLY";
type HnkValue = "LOW" | "MEDIUM" | "HIGH";

type DecisionLayer = {
  operational_policy: string;
  human_gate_required: boolean;
  archive_policy: "PRESERVE_RESEARCH_RECORD";
  canon_import: "NONE_AUTOMATIC";
  hnk_proposal?: {
    origin: string;
    proposal: string;
    rationale: string;
    status: string;
  };
};

type DecisionRecord = {
  id: string;
  name: string;
  description: string;
  source_basis: string;
  historical_layer: string;
  classification: string;
  primary_decision: Decision;
  hnk_value: HnkValue;
  admission_reason: string;
  risk_or_limit: string;
  provenance_status: string;
  version: string;
  tags?: string[];
  conflicts?: string[];
  dependencies?: string[];
  sources?: Array<{ title: string; author?: string; type?: string; url?: string }>;
  decision_layer: DecisionLayer;
};

type StatusPayload = {
  layer: string;
  protocol: string;
  canon_import: string;
  archive_policy: string;
  validation: { ok: boolean; issues: string[] };
  summary: {
    catalogs: number;
    items: number;
    by_decision: Record<Decision, number>;
    by_value: Record<HnkValue, number>;
    human_gate_pending: number;
    operationally_blocked: number;
  };
  filters: { decisions: Decision[]; hnk_values: HnkValue[] };
};

type QueryPayload = {
  layer: string;
  protocol: string;
  canon_import: string;
  archive_policy: string;
  count: number;
  records: DecisionRecord[];
};

function humanize(value: string) {
  return value.replaceAll("_", " ");
}

export default function DecisionLab() {
  const [token, setToken] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [status, setStatus] = useState<StatusPayload | null>(null);
  const [result, setResult] = useState<QueryPayload | null>(null);
  const [query, setQuery] = useState("");
  const [decision, setDecision] = useState<Decision | "">("CANDIDATE");
  const [hnkValue, setHnkValue] = useState<HnkValue | "">("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function callApi(search = "") {
    const response = await fetch(`/api/research/decisions${search}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload?.error ?? `HTTP_${response.status}`);
    return payload;
  }

  async function unlock(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const statusPayload = (await callApi()) as StatusPayload;
      const initialPayload = (await callApi("?decision=CANDIDATE")) as QueryPayload;
      setStatus(statusPayload);
      setResult(initialPayload);
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
      if (decision) params.set("decision", decision);
      if (hnkValue) params.set("hnk_value", hnkValue);
      const suffix = params.size ? `?${params.toString()}` : "?q=HNK-R001";
      setResult((await callApi(suffix)) as QueryPayload);
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
        <h2>Desbloquear Decision Layer</h2>
        <p>O token permanece apenas na memória desta sessão e nunca é colocado na URL ou em armazenamento persistente.</p>
        <form onSubmit={unlock} className={styles.unlockForm}>
          <input
            className={styles.input}
            type="password"
            autoComplete="off"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="HNK_RESEARCH_LAB_TOKEN"
            aria-label="Token privado do laboratório"
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
          <span className={status?.validation.ok ? styles.goodDot : styles.badDot} />
          <div>
            <strong>{status?.layer}</strong>
            <p>{status?.validation.ok ? "Decision Layer validado" : "Validação com issues"}</p>
          </div>
        </article>

        <div className={styles.metricGrid}>
          <article><strong>{status?.summary.items ?? 0}</strong><span>itens catalogados</span></article>
          <article><strong>{status?.summary.human_gate_pending ?? 0}</strong><span>Human Gates pendentes</span></article>
          <article><strong>{status?.summary.operationally_blocked ?? 0}</strong><span>bloqueados do runtime</span></article>
          <article><strong>{status?.summary.catalogs ?? 0}</strong><span>catálogos-fonte</span></article>
        </div>

        <div className={styles.decisionSummary}>
          {status?.filters.decisions.map((item) => (
            <button
              type="button"
              key={item}
              className={decision === item ? styles.summaryActive : styles.summaryButton}
              onClick={() => setDecision(item)}
            >
              <span>{humanize(item)}</span>
              <strong>{status.summary.by_decision[item]}</strong>
            </button>
          ))}
        </div>
      </aside>

      <section className={styles.mainPanel}>
        <form onSubmit={search} className={styles.queryBar}>
          <label className={styles.searchField}>
            <span>Buscar elemento / conceito / fonte</span>
            <input
              className={styles.input}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ex.: Multi-Layer Glyph, Tarot, provenance…"
            />
          </label>
          <label>
            <span>Decisão</span>
            <select className={styles.select} value={decision} onChange={(event) => setDecision(event.target.value as Decision | "")}>
              <option value="">Todas</option>
              {status?.filters.decisions.map((item) => <option key={item} value={item}>{humanize(item)}</option>)}
            </select>
          </label>
          <label>
            <span>Valor HNK</span>
            <select className={styles.select} value={hnkValue} onChange={(event) => setHnkValue(event.target.value as HnkValue | "")}>
              <option value="">Todos</option>
              {status?.filters.hnk_values.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <button className={styles.primaryButton} disabled={loading}>{loading ? "Consultando…" : "Aplicar"}</button>
        </form>

        {error ? <p className={styles.error}>{error}</p> : null}

        <div className={styles.resultHeader}>
          <div>
            <p className={styles.kicker}>CODEX ADMISSION</p>
            <h2>{result?.count ?? 0} elementos</h2>
          </div>
          <div className={styles.invariantPills}>
            <span>ARCHIVE ≠ RUNTIME</span>
            <span>CANON: HUMAN GATE ONLY</span>
          </div>
        </div>

        <div className={styles.recordList}>
          {result?.records.map((record) => (
            <article key={record.id} className={styles.recordCard}>
              <div className={styles.recordTop}>
                <div>
                  <p className={styles.recordId}>{record.id}</p>
                  <h3>{record.name}</h3>
                </div>
                <div className={styles.badges}>
                  <span data-decision={record.primary_decision}>{humanize(record.primary_decision)}</span>
                  <span>{record.hnk_value}</span>
                </div>
              </div>

              <p className={styles.description}>{record.description}</p>

              <div className={styles.reasonGrid}>
                <section>
                  <p className={styles.kicker}>POR QUE ENTRA / PERMANECE</p>
                  <p>{record.admission_reason}</p>
                </section>
                <section>
                  <p className={styles.kicker}>LIMITE / POR QUE NÃO OPERA AUTOMATICAMENTE</p>
                  <p>{record.risk_or_limit}</p>
                </section>
              </div>

              <dl className={styles.metaGrid}>
                <div><dt>Classificação</dt><dd>{humanize(record.classification)}</dd></div>
                <div><dt>Política</dt><dd>{humanize(record.decision_layer.operational_policy)}</dd></div>
                <div><dt>Camada</dt><dd>{humanize(record.historical_layer)}</dd></div>
                <div><dt>Fonte base</dt><dd>{humanize(record.source_basis)}</dd></div>
                <div><dt>Proveniência</dt><dd>{humanize(record.provenance_status)}</dd></div>
                <div><dt>Versão</dt><dd>{record.version}</dd></div>
              </dl>

              <div className={styles.gateRow}>
                <strong>{record.decision_layer.human_gate_required ? "HUMAN GATE OBRIGATÓRIO" : "SEM PROMOÇÃO PENDENTE"}</strong>
                <span>{record.decision_layer.archive_policy}</span>
                {record.primary_decision === "EXCLUDE_OPERATIONALLY" ? <span className={styles.blocked}>ARCHIVED · NOT DELETED · RUNTIME BLOCKED</span> : null}
              </div>

              {record.decision_layer.hnk_proposal ? (
                <section className={styles.proposal}>
                  <p className={styles.kicker}>HNK CANDIDATE · NÃO É FONTE HISTÓRICA</p>
                  <strong>{record.decision_layer.hnk_proposal.proposal}</strong>
                  <p>{record.decision_layer.hnk_proposal.rationale}</p>
                </section>
              ) : null}

              {record.sources?.length ? (
                <div className={styles.sources}>
                  {record.sources.map((source, index) => (
                    <span key={`${record.id}-source-${index}`}>{source.title}{source.author ? ` · ${source.author}` : ""}</span>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

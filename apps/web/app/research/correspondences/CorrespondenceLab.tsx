"use client";

import { FormEvent, useMemo, useState } from "react";
import styles from "./lab.module.css";

type RecordView = {
  id: string;
  subject_id: string;
  domain: string;
  value: string;
  tradition_id: string;
  historical_layer: string;
  decision: string;
  evidence_scope: string;
  notes?: string;
  sources?: Array<{ id: string; title: string; author_or_order?: string; edition_or_recension?: string }>;
};

type GapView = {
  id: string;
  subject_id: string;
  domain: string;
  tradition_id: string;
  reason: string;
};

type ComparisonPayload = {
  registry: string;
  scope: string;
  query: { subject_id?: string; domain?: string; tradition_id?: string };
  filtered_count: number;
  filtered_records: RecordView[];
  comparison: {
    subject_id: string;
    domain: string;
    by_tradition: Record<string, RecordView[]>;
    gaps: GapView[];
  };
  resolution: { status: "NONE" | "SINGLE" | "MULTIPLE" | "CONFLICT"; records: RecordView[] };
};

type StatusPayload = {
  registry: string;
  scope: string;
  canon_import: string;
  validation: { ok: boolean; issues: string[] };
  coverage: Array<{ tradition_id: string; record_count: number; subject_count: number; domains: string[]; gap_count: number }>;
  gaps: GapView[];
};

const LETTERS = [
  "ALEPH", "BETH", "GIMEL", "DALETH", "HEH", "VAV", "ZAIN", "CHETH", "TETH", "YOD", "KAPH",
  "LAMED", "MEM", "NUN", "SAMEKH", "AYIN", "PEH", "TZADDI", "QOPH", "RESH", "SHIN", "TAV",
];

const DOMAINS = ["LETTER_CLASS", "ELEMENT", "PLANET", "ZODIAC", "TAROT_TRUMP", "TREE_PATH"];

function humanize(value: string) {
  return value.replace(/^HEBREW_/, "").replaceAll("_", " ");
}

export default function CorrespondenceLab() {
  const [token, setToken] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [status, setStatus] = useState<StatusPayload | null>(null);
  const [subject, setSubject] = useState("HEBREW_ALEPH");
  const [domain, setDomain] = useState("TAROT_TRUMP");
  const [tradition, setTradition] = useState("");
  const [result, setResult] = useState<ComparisonPayload | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const traditions = useMemo(() => status?.coverage.map((item) => item.tradition_id) ?? [], [status]);

  async function callApi(query = "") {
    const response = await fetch(`/api/correspondences${query}`, {
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
      const payload = (await callApi()) as StatusPayload;
      setStatus(payload);
      setUnlocked(true);
    } catch (err) {
      setUnlocked(false);
      setError(err instanceof Error ? err.message : "UNLOCK_FAILED");
    } finally {
      setLoading(false);
    }
  }

  async function compare(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const params = new URLSearchParams({ subject_id: subject, domain });
      if (tradition) params.set("tradition_id", tradition);
      const payload = (await callApi(`?${params.toString()}`)) as ComparisonPayload;
      setResult(payload);
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
        <h2>Desbloquear laboratório</h2>
        <p>O token fica apenas no estado local desta sessão e é enviado como Bearer Token para a API privada.</p>
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
        <div className={styles.statusCard}>
          <span className={status?.validation.ok ? styles.goodDot : styles.badDot} />
          <div>
            <strong>{status?.registry}</strong>
            <p>{status?.validation.ok ? "Registry validado" : "Registry com issues"}</p>
          </div>
        </div>

        <div className={styles.coverageList}>
          {status?.coverage.map((item) => (
            <article key={item.tradition_id} className={styles.coverageCard}>
              <strong>{humanize(item.tradition_id)}</strong>
              <span>{item.record_count} registros · {item.subject_count} símbolos · {item.gap_count} gaps</span>
              <small>{item.domains.join(" · ")}</small>
            </article>
          ))}
        </div>
      </aside>

      <section className={styles.mainPanel}>
        <form onSubmit={compare} className={styles.queryBar}>
          <label>
            <span>Letra / símbolo</span>
            <select className={styles.select} value={subject} onChange={(event) => setSubject(event.target.value)}>
              {LETTERS.map((letter) => <option key={letter} value={`HEBREW_${letter}`}>{letter}</option>)}
            </select>
          </label>
          <label>
            <span>Domínio</span>
            <select className={styles.select} value={domain} onChange={(event) => setDomain(event.target.value)}>
              {DOMAINS.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span>Tradição</span>
            <select className={styles.select} value={tradition} onChange={(event) => setTradition(event.target.value)}>
              <option value="">Todas</option>
              {traditions.map((item) => <option key={item} value={item}>{humanize(item)}</option>)}
            </select>
          </label>
          <button className={styles.primaryButton} disabled={loading}>{loading ? "Consultando…" : "Comparar"}</button>
        </form>

        {error ? <p className={styles.error}>{error}</p> : null}

        {!result ? (
          <div className={styles.emptyState}>
            <strong>Escolha um símbolo e um domínio.</strong>
            <p>O laboratório mostrará cada tradição separadamente, incluindo lacunas e conflitos em vez de harmonizá-los.</p>
          </div>
        ) : (
          <div className={styles.results}>
            <div className={styles.resultHeader}>
              <div>
                <p className={styles.kicker}>{humanize(result.comparison.subject_id)}</p>
                <h2>{humanize(result.comparison.domain)}</h2>
              </div>
              <span className={`${styles.resolution} ${result.resolution.status === "CONFLICT" ? styles.conflict : ""}`}>
                {result.resolution.status}
              </span>
            </div>

            <div className={styles.traditionGrid}>
              {Object.entries(result.comparison.by_tradition).map(([traditionId, records]) => (
                <article key={traditionId} className={styles.traditionCard}>
                  <p className={styles.kicker}>{humanize(traditionId)}</p>
                  {records.map((record) => (
                    <div key={record.id} className={styles.recordBlock}>
                      <strong className={styles.value}>{humanize(record.value)}</strong>
                      <dl>
                        <div><dt>Camada</dt><dd>{humanize(record.historical_layer)}</dd></div>
                        <div><dt>Status</dt><dd>{record.decision}</dd></div>
                        <div><dt>Evidência</dt><dd>{record.evidence_scope}</dd></div>
                      </dl>
                      {record.sources?.map((source) => (
                        <p key={source.id} className={styles.sourceLine}>Fonte: {source.title}{source.author_or_order ? ` · ${source.author_or_order}` : ""}</p>
                      ))}
                      {record.notes ? <p className={styles.note}>{record.notes}</p> : null}
                    </div>
                  ))}
                </article>
              ))}
            </div>

            {result.comparison.gaps.length ? (
              <section className={styles.gapPanel}>
                <p className={styles.kicker}>SOURCE GAPS</p>
                {result.comparison.gaps.map((gap) => (
                  <article key={gap.id}>
                    <strong>{humanize(gap.tradition_id)}</strong>
                    <p>{gap.reason}</p>
                  </article>
                ))}
              </section>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}

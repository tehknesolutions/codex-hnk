'use client';

import { useMemo, useState } from 'react';
import type { ProvenanceAuthority, ProvenanceRecord } from '@hnk/provenance-contract';

const LABELS: Record<ProvenanceAuthority,string> = {
  CANON:'CÂNONE', HISTORICAL_REFERENCE:'REFERÊNCIA HISTÓRICA', SOURCE_DERIVED:'DERIVADO DA FONTE',
  HNK_AUTHORED:'AUTORIA HNK', RESEARCH_ONLY:'PESQUISA'
};

export function ProvenanceLens({records}:{records:readonly ProvenanceRecord[]}) {
  const [authority,setAuthority]=useState<ProvenanceAuthority|'ALL'>('ALL');
  const [query,setQuery]=useState('');
  const visible=useMemo(()=>records.filter(r=>{
    const authorityOk=authority==='ALL'||r.authority===authority;
    const hay=`${r.label} ${r.subject_id} ${r.source.id} ${r.source.title} ${r.claim ?? ''} ${r.target ?? ''}`.toLowerCase();
    return authorityOk && hay.includes(query.trim().toLowerCase());
  }),[records,authority,query]);
  return <section className="provenance-lens" aria-labelledby="provenance-title">
    <div className="provenance-lens__head"><div><span className="kicker">M7 · PROVENIÊNCIA</span><h2 id="provenance-title">Origem, autoridade e evidência</h2><p>Consulte a origem sem colapsar referência histórica, material de biblioteca, autoria HNK, pesquisa e cânone.</p></div><strong>{visible.length}/{records.length}</strong></div>
    <div className="provenance-lens__controls">
      <input aria-label="Buscar proveniência" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar conceito, fonte ou ID…" />
      <select aria-label="Filtrar autoridade" value={authority} onChange={e=>setAuthority(e.target.value as ProvenanceAuthority|'ALL')}><option value="ALL">Todas as autoridades</option>{Object.entries(LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>
    </div>
    <div className="provenance-lens__grid">{visible.map(record=><article className="provenance-card" key={record.id}>
      <div className="provenance-card__meta"><span className={`provenance-badge provenance-badge--${record.authority.toLowerCase()}`}>{LABELS[record.authority]}</span><code>{record.status}</code></div>
      <h3>{record.label}</h3><p>{record.claim ?? (record.relation && record.target ? `${record.relation}: ${record.target}` : record.notes)}</p>
      <dl><div><dt>Fonte</dt><dd>{record.source.title}</dd></div><div><dt>ID</dt><dd>{record.source.id}{record.source.locator? ` · ${record.source.locator}`:''}</dd></div><div><dt>Escopo</dt><dd>{record.evidence_scope}</dd></div></dl>
      {record.conflicts_with?.length?<p className="provenance-card__conflict">Conflito preservado: {record.conflicts_with.join(', ')}</p>:null}
    </article>)}</div>
  </section>;
}

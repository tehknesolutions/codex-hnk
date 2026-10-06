import { ProvenanceLens } from '../_components/ProvenanceLens';
import { m7ProvenanceRegistry } from '@hnk/provenance-registry';

export default function ProvenancePage(){
  return <main className="provenance-page"><header className="provenance-page__masthead"><span className="kicker">CODEX HNK · M7</span><h1>Library Provenance</h1><p>Uma lente consultiva sobre o Living Book: origem, autoridade, evidência, conflitos e lacunas permanecem explícitos.</p></header><ProvenanceLens records={m7ProvenanceRegistry.records}/></main>;
}

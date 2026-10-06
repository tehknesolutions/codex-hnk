import type { ProvenanceRecord } from "@hnk/provenance-contract";
import { ProvenanceRegistry } from "./registry.js";

export const M7_PROVENANCE_RECORDS: readonly ProvenanceRecord[] = [
  {
    id:"M7-CANON-RESEARCH-001", subject_id:"HNK_RESEARCH_001", label:"Research 001 — Symbolic Architecture", domain:"CANON",
    authority:"CANON", status:"CANON", origin:"CANON_CORE", evidence_scope:"CANON_APPROVED",
    source:{id:"CANON-RESEARCH-001",title:"canon/core/research-001-symbolic-architecture-v1.json"},
    claim:"Canonical Research 001 artifact; human gate remains authoritative."
  },
  {
    id:"M7-REF-SY-BETH-SATURN", subject_id:"HEBREW_BETH", label:"Beth → Saturn", domain:"PLANET",
    authority:"HISTORICAL_REFERENCE", status:"REFERENCE", origin:"HISTORICAL_SOURCE", evidence_scope:"SOURCE_SCOPED",
    source:{id:"SRC-SY-REFERENCE-A",title:"Sefer Yetzirah",url:"https://www.sefaria.org/Sefer_Yetzirah"},
    claim:"Consulted reference text maps Beth to Saturn; recension-sensitive."
  },
  {
    id:"M7-REF-GD-BETH-MERCURY", subject_id:"HEBREW_BETH", label:"Beth → Mercury", domain:"PLANET",
    authority:"HISTORICAL_REFERENCE", status:"REFERENCE", origin:"HISTORICAL_SOURCE", evidence_scope:"SOURCE_SCOPED",
    source:{id:"SRC-GD-STANDARD",title:"Golden Dawn correspondence system",author_or_order:"Hermetic Order of the Golden Dawn"},
    claim:"Golden Dawn lineage maps Beth to Mercury.", conflicts_with:["M7-REF-SY-BETH-SATURN"]
  },
  {
    id:"M7-LIB-CORR-001", subject_id:"MAJOR_ARCANA", label:"Major Arcana source structure", domain:"LIBRARY_CORRESPONDENCE",
    authority:"SOURCE_DERIVED", status:"CANDIDATE", origin:"LIBRARY_SOURCE", evidence_scope:"SOURCE_SCOPED",
    source:{id:"SRC-024",title:"Library source SRC-024",locator:"p.5"},
    relation:"STRUCTURED_BY", target:"22 paths · Hebrew letters · Golden Dawn path colors · Futhark rune equivalents · element/planet/sign · gematric value · Tree of Life path · two-dice equivalent",
    notes:"Source-derived candidate; not an automatic HNK ontological equivalence."
  },
  {
    id:"M7-LIB-CORR-004", subject_id:"PHILOSOPHERS_STONE_DIAGRAM", label:"Philosopher's Stone diagram", domain:"LIBRARY_CORRESPONDENCE",
    authority:"SOURCE_DERIVED", status:"CANDIDATE", origin:"LIBRARY_SOURCE", evidence_scope:"SOURCE_SCOPED",
    source:{id:"SRC-026",title:"Library source SRC-026",locator:"p.18"},
    relation:"MAPS", target:"Gold→outer circle · Silver→triangle · Lead/Copper/Iron/Tin→square · Mercury→inner circle"
  },
  {
    id:"M7-AUTHORED-HNK40-GATE", subject_id:"HNK40_AUTHORED_CANDIDATES", label:"HNK40 authored candidate gate", domain:"HNK40",
    authority:"HNK_AUTHORED", status:"CANDIDATE", origin:"HNK_AUTHORED", evidence_scope:"HNK_AUTHORED",
    source:{id:"HNK40-AUTHORED-GATE-V1",title:"data/library/hnk40.authored-candidate-promotion-gate.v1.json"},
    claim:"Authored candidates remain distinct from source-derived evidence until explicit promotion."
  },
  {
    id:"M7-RESEARCH-KG-V2", subject_id:"KNOWLEDGE_GRAPH_V2", label:"Integrated knowledge graph v2", domain:"KNOWLEDGE_GRAPH",
    authority:"RESEARCH_ONLY", status:"RESEARCH_ONLY", origin:"RESEARCH_PIPELINE", evidence_scope:"SOURCE_SCOPED",
    source:{id:"KG-INTEGRATED-V2",title:"data/library/knowledge-graph.integrated.v2.json"},
    claim:"Research materialization; does not override canon or source authority."
  }
];

export const m7ProvenanceRegistry = new ProvenanceRegistry(M7_PROVENANCE_RECORDS);

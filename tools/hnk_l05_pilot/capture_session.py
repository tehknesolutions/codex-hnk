from pathlib import Path
import json, sys
ALLOWED_ROLES={"learner","teacher","reviewer"}
WATCH={"GOING_TO_VS_PRESENT","GOING_TO_NEGATIVE","NARRATIVE_ORDER","TRAVEL_VS_SEE_ACTION","PARENTS_REFERENT","PARTY_EVENT","CALIFORNIA_TOPONYM","MULTILINGUAL_BRIDGE_ALIGNMENT","TRANSLITERATION","PROVENANCE","OTHER"}
CRITICAL={"FABRICATED_HNK_FORM","FABRICATED_HUMAN_EVIDENCE","BRIDGE_CELL_MISSING","TRANSLITERATION_MISSING","SCHOLARLY_ANCHOR_MISSING","CALIFORNIA_ANACHRONISTIC_EQUIVALENCE","GOING_TO_SEMANTIC_DRIFT","NEGATIVE_STRUCTURE_DRIFT","FROZEN_NARRATIVE_DRIFT","PROVENANCE_BREAK"}
REQUIRED={"lesson_id","instrument_version","session_id","role","completed_cards","completed_drills","responses","watch_confusions","critical_regressions","participant_note","facilitator_notes","synthetic_test_fixture"}
def fail(msg): raise ValueError(msg)
def load_json(path): return json.loads(Path(path).read_text(encoding="utf-8"))
def validate_session(s,allow_synthetic=False):
    missing=REQUIRED-set(s); extra=set(s)-REQUIRED
    if missing: fail("missing fields: "+", ".join(sorted(missing)))
    if extra: fail("unexpected fields: "+", ".join(sorted(extra)))
    if s["lesson_id"]!="HNK-L05": fail("lesson_id must be HNK-L05")
    if s["instrument_version"]!="K8-v1": fail("instrument_version must be K8-v1")
    if not isinstance(s["session_id"],str) or not s["session_id"].strip(): fail("session_id must be non-empty")
    if s["role"] not in ALLOWED_ROLES: fail("invalid role")
    if s["synthetic_test_fixture"] and not allow_synthetic: fail("synthetic_test_fixture cannot enter human evidence")
    return s
def main():
    if len(sys.argv)!=3: print("usage: capture_session.py INPUT.json EVIDENCE_RAW_DIR",file=sys.stderr); return 2
    src=Path(sys.argv[1]); outdir=Path(sys.argv[2]); s=validate_session(load_json(src),False); outdir.mkdir(parents=True,exist_ok=True); dest=outdir/(s["session_id"]+".json")
    if dest.exists(): print("duplicate session_id",file=sys.stderr); return 3
    dest.write_text(json.dumps(s,ensure_ascii=False,indent=2)+"\n",encoding="utf-8"); print(dest); return 0
if __name__=="__main__": raise SystemExit(main())

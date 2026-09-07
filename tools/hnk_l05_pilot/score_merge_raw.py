from pathlib import Path
import json,sys
from collections import Counter
THRESHOLDS={"M1":80,"M2":80,"M3":80,"M4":80,"M5":100,"M6":100,"M7":100,"M8":80}
def metric_value(a,v):
    if v is None:return None
    if a in {"A1","A2","A3","A4"}:return float(v)
    if a in {"A5","A6","A7"}:return 100.0 if v is True else 0.0
    if a=="A8":return float(v)/5.0*100.0
def aggregate(paths,allow_synthetic=False):
    seen=set(); sessions=[]; metric_values={f"M{i}":[] for i in range(1,9)}; watches=Counter(); critical=[]
    for p in sorted(paths):
        s=json.loads(Path(p).read_text(encoding="utf-8")); sid=s["session_id"]
        if sid in seen: raise ValueError("duplicate session_id: "+sid)
        if s.get("synthetic_test_fixture") and not allow_synthetic: raise ValueError("synthetic test fixture cannot enter evidence")
        seen.add(sid); sessions.append(s); watches.update(s.get("watch_confusions",[])); critical.extend({"session_id":sid,"code":c} for c in s.get("critical_regressions",[]))
        for i in range(1,9):
            a,m=f"A{i}",f"M{i}"; mv=metric_value(a,s["responses"][a]);
            if mv is not None: metric_values[m].append(mv)
    metrics={m:(round(sum(v)/len(v),4) if v else None) for m,v in metric_values.items()}; counts={"total_sessions":len(sessions),"learner_sessions":sum(1 for s in sessions if s["role"]=="learner"),"teacher_or_reviewer_sessions":sum(1 for s in sessions if s["role"] in {"teacher","reviewer"})}
    if counts["total_sessions"]<12 or counts["learner_sessions"]<8 or counts["teacher_or_reviewer_sessions"]<4:decision="HOLD_INSUFFICIENT_EVIDENCE"
    elif critical:decision="HOLD_CRITICAL_REGRESSION"
    elif any(metrics[m] is None or metrics[m]<THRESHOLDS[m] for m in THRESHOLDS):decision="HOLD_METRIC_FAILURE"
    else:decision="READY_FOR_HUMAN_REVIEW"
    return {"aggregate_id":"HNK-L05-K9-EVIDENCE-AGGREGATE-V1","lesson_id":"HNK-L05","phase":"M03-K.9","instrument_version":"K8-v1","human_evidence_claimed":bool(sessions) and not allow_synthetic,"sessions":sessions,"counts":counts,"metrics":metrics,"watch_confusions":dict(sorted(watches.items())),"critical_regressions":critical,"automated_decision":decision,"runtime_promotion_allowed":False}
def main():
    if len(sys.argv)!=3:return 2
    result=aggregate(list(Path(sys.argv[1]).glob("*.json")),False); out=Path(sys.argv[2]); out.parent.mkdir(parents=True,exist_ok=True); out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8"); print(result["automated_decision"]); return 0
if __name__=="__main__":raise SystemExit(main())

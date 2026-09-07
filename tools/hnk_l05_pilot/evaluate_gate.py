from pathlib import Path
import json,sys
THRESHOLDS={"M1":80,"M2":80,"M3":80,"M4":80,"M5":100,"M6":100,"M7":100,"M8":80}
def main():
    if len(sys.argv)!=2: print("usage: evaluate_gate.py AGGREGATE.json",file=sys.stderr); return 2
    a=json.loads(Path(sys.argv[1]).read_text(encoding="utf-8")); c=a["counts"]; m=a["metrics"]; critical=a["critical_regressions"]
    if c["total_sessions"]<12 or c["learner_sessions"]<8 or c["teacher_or_reviewer_sessions"]<4: expected="HOLD_INSUFFICIENT_EVIDENCE"
    elif critical: expected="HOLD_CRITICAL_REGRESSION"
    elif any(m[k] is None or m[k]<v for k,v in THRESHOLDS.items()): expected="HOLD_METRIC_FAILURE"
    else: expected="READY_FOR_HUMAN_REVIEW"
    if a.get("automated_decision")!=expected: return 3
    if a.get("runtime_promotion_allowed") is not False: return 4
    print(expected); return 0
if __name__=="__main__": raise SystemExit(main())

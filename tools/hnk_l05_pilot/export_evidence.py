from pathlib import Path
import json,hashlib,sys
def sha256(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def main():
    if len(sys.argv)!=3: print("usage: export_evidence.py AGGREGATE.json EXPORT_DIR",file=sys.stderr); return 2
    agg=Path(sys.argv[1]); outdir=Path(sys.argv[2]); outdir.mkdir(parents=True,exist_ok=True); data=json.loads(agg.read_text(encoding="utf-8"))
    if data.get("runtime_promotion_allowed") is not False: return 3
    export={"export_id":"HNK-L05-K9-EVIDENCE-EXPORT-V1","lesson_id":"HNK-L05","phase":"M03-K.9","aggregate_sha256":sha256(agg),"counts":data["counts"],"metrics":data["metrics"],"watch_confusions":data["watch_confusions"],"critical_regressions":data["critical_regressions"],"automated_decision":data["automated_decision"],"runtime_promotion_allowed":False,"human_review_required":True}
    out=outdir/"evidence.export.v1.json"; out.write_text(json.dumps(export,ensure_ascii=False,indent=2)+"\n",encoding="utf-8"); print(out); return 0
if __name__=="__main__": raise SystemExit(main())

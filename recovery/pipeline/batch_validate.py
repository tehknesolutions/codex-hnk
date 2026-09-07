from pathlib import Path
import json,re,sys

WORD_RE=re.compile(r"\b[\wÀ-ÿ’'’-]+(?:\b)?",re.UNICODE)
TARGETS={"doctrine":137,"kavanah":72,"ordeal":26}
PILLARS=["JACHIN","BOAZ","EQUILIBRIUM"]

def wc(s): return len(WORD_RE.findall(s or ""))

def validate_folio(path):
    x=json.loads(Path(path).read_text(encoding="utf-8"))
    errors=[]; total=0
    if x.get("classification")!="RECONSTRUCTED_FROM_RECOVERED_SOURCES":
        errors.append("classification")
    ps=x.get("pillars",[])
    if [p.get("id") for p in ps]!=PILLARS:
        errors.append("pillar-order")
    for p in ps:
        for key,target in TARGETS.items():
            actual=wc(p.get(key,{}).get("text",""))
            total+=actual
            if actual!=target:
                errors.append(f"{p.get('id')}:{key}:{actual}!={target}")
    if total!=705: errors.append(f"total:{total}!=705")
    return errors,total

def main():
    if len(sys.argv)<3:
        print("usage: batch_validate.py EXPECTED_START EXPECTED_END FILE...",file=sys.stderr)
        return 2
    start,end=int(sys.argv[1]),int(sys.argv[2])
    files=[Path(x) for x in sys.argv[3:]]
    if len(files)!=(end-start+1):
        print("FAIL file-count",file=sys.stderr); return 3
    days=[]; failed=False
    for p in files:
        x=json.loads(p.read_text(encoding="utf-8")); days.append(x["day"])
        errors,total=validate_folio(p)
        if errors:
            failed=True
            print("FAIL",p.name,"|",";".join(errors))
        else:
            print("PASS",p.name,"705")
    if sorted(days)!=list(range(start,end+1)):
        print("FAIL day-range",days,file=sys.stderr); return 4
    if failed:return 5
    print(f"BATCH_PASS {start:03d}-{end:03d} words={(end-start+1)*705}")
    return 0

if __name__=="__main__":
    raise SystemExit(main())

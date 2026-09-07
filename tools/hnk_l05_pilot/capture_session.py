from pathlib import Path
import json, sys

def main():
    if len(sys.argv) != 3:
        print('usage: capture_session.py INPUT.json EVIDENCE_RAW_DIR', file=sys.stderr); return 2
    src=Path(sys.argv[1]); outdir=Path(sys.argv[2]); s=json.loads(src.read_text(encoding='utf-8'))
    if s.get('synthetic_test_fixture'): raise ValueError('synthetic_test_fixture cannot enter human evidence')
    if s.get('lesson_id')!='HNK-L05': raise ValueError('lesson_id must be HNK-L05')
    outdir.mkdir(parents=True,exist_ok=True); dest=outdir/(s['session_id']+'.json')
    if dest.exists(): print('duplicate session_id',file=sys.stderr); return 3
    dest.write_text(json.dumps(s,ensure_ascii=False,indent=2)+'\n',encoding='utf-8'); print(dest); return 0
if __name__=='__main__': raise SystemExit(main())

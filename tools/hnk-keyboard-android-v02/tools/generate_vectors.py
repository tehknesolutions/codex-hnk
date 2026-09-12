#!/usr/bin/env python3
import base64, gzip, json, pathlib
root = pathlib.Path(__file__).resolve().parent
parts = []
for i in range(1, 6):
    parts.append((root / f"vectors.part{i}.b64").read_text(encoding="utf-8").strip())
data = "".join(parts)
files = json.loads(gzip.decompress(base64.b64decode(data)).decode("utf-8"))
out = root.parent / "app" / "src" / "main" / "res" / "drawable"
out.mkdir(parents=True, exist_ok=True)
for name, content in files.items():
    (out / name).write_text(content, encoding="utf-8")
assert len(files) == 40, len(files)
print(f"generated {len(files)} HNK vector drawables")

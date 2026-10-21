"""아카데미 데이터 정합 검사 (표준 라이브러리만, 저장소 루트에서): python academy/tests/check_data.py

- catalog.json 의 과목마다 course.json 이 있고, 공개 수업 파일이 실제로 있다(유료 과목은 맛보기만 공개)
- open/preview 로 적은 수업 id 가 과목에 있다
- data/intro.json 의 story 파일, data/quiz-*.json 의 수업 id·정답 번호·해설이 맞다
- 화면이 쓰는 스크립트·스타일 버전 꼬리표가 페이지마다 같다(캐시 꼬임 방지)
"""
import json
import re
import sys
from pathlib import Path

A = Path(__file__).resolve().parents[1]
errs = []
err = errs.append

cat = json.loads((A / "catalog.json").read_text(encoding="utf-8"))
units_of = {}
for c in cat["courses"]:
    cj = A / "courses" / c["id"] / "course.json"
    if not cj.exists():
        err(f"{c['id']}: course.json 없음")
        continue
    course = json.loads(cj.read_text(encoding="utf-8"))
    units = [u for s in course.get("sections", []) for u in s.get("units", [])]
    units_of[c["id"]] = {u["id"] for u in units}
    public = set(c.get("preview", [])) if c.get("tier") == "paid" else {u["id"] for u in units}
    for u in units:
        f = A / "courses" / c["id"] / u["file"]
        if u["id"] in public and not f.exists():
            err(f"{c['id']}/{u['id']}: 공개 수업 파일 없음 {u['file']}")
        if c.get("tier") == "paid" and u["id"] not in public and f.exists():
            err(f"{c['id']}/{u['id']}: 유료 수업 원고가 공개 저장소에 있음")
    for key in ("open", "preview"):
        for uid in c.get(key, []):
            if uid not in units_of[c["id"]]:
                err(f"{c['id']}: {key} 의 {uid} 가 과목에 없음")

intro = json.loads((A / "data" / "intro.json").read_text(encoding="utf-8"))
for cid, v in intro.items():
    if v.get("story") and not (A / v["story"]).exists():
        err(f"intro {cid}: story 파일 없음 {v['story']}")

for qf in (A / "data").glob("quiz-*.json"):
    cid = qf.stem[5:]
    q = json.loads(qf.read_text(encoding="utf-8"))
    for uid, qs in q.get("units", {}).items():
        if uid not in units_of.get(cid, set()):
            err(f"{qf.name}: {uid} 가 과목에 없음")
        for i, x in enumerate(qs):
            if not (isinstance(x.get("answer"), int) and 0 <= x["answer"] < len(x.get("choices", []))):
                err(f"{qf.name} {uid}#{i + 1}: 정답 번호가 보기 범위 밖")
            if not x.get("why") or len(x.get("choices", [])) < 2:
                err(f"{qf.name} {uid}#{i + 1}: 해설 또는 보기 부족")

for asset in ("app.js", "style.css"):
    tags = {}
    for page in A.glob("*.html"):
        for m in re.finditer(rf'{re.escape(asset)}\?v=(\w+)', page.read_text(encoding="utf-8")):
            tags.setdefault(m.group(1), []).append(page.name)
    if len(tags) > 1:
        err(f"{asset} 버전 꼬리표가 페이지마다 다름: {tags}")

if errs:
    print("[실패] 아카데미 데이터:\n" + "\n".join("  " + e for e in errs))
    sys.exit(1)
print(f"[통과] 아카데미 데이터: 과목 {len(units_of)}개, 퀴즈 {len(list((A / 'data').glob('quiz-*.json')))}개 파일")

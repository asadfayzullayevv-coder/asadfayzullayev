#!/bin/bash
# Rebuilds the whole kit from content.py.
# Needs: node (pptxgenjs, d3-geo, topojson-client, world-atlas, sharp in ./node_modules), python3 (python-docx, Pillow),
# LibreOffice, poppler-utils, Playwright + Chromium. Font: Inter.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"; OUT="$(dirname "$HERE")"
export NODE_PATH="$HERE/node_modules"
export PPTX_SKILL="${PPTX_SKILL:-/root/.claude/skills/synced/2b6d7e14-6df2-46bd-9548-5f29829599a7_4698a74f-ddff-42da-ba6e-c00bf86de747/pptx}"
cd "$HERE"
python3 content.py
[ -f assets/map_region.png ] || node build_map.js
node build_deck.js "$OUT/01_Scale_Capital_Day1.pptx"
python3 build_docs.py "$OUT"
python3 build_cheatsheet.py "$OUT"
for f in 01_Scale_Capital_Day1.pptx 03_Growth_Decision_Workbook.docx; do
  soffice --headless --convert-to pdf --outdir "$OUT" "$OUT/$f" >/dev/null 2>&1 || python3 "$PPTX_SKILL/scripts/office/soffice.py" --headless --convert-to pdf --outdir "$OUT" "$OUT/$f" >/dev/null 2>&1
done
python3 contact_sheet.py "$OUT/01_Scale_Capital_Day1.pdf" "$OUT/07_Presentation_Preview.png"
ls -la "$OUT"

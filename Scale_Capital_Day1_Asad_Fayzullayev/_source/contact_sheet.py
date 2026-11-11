# -*- coding: utf-8 -*-
"""Contact sheet of all slides from the deck PDF. python3 contact_sheet.py deck.pdf out.png"""
import subprocess, sys, tempfile, glob, os
from PIL import Image, ImageDraw, ImageFont
pdf, out = sys.argv[1], sys.argv[2]
tmp = tempfile.mkdtemp()
subprocess.run(["pdftoppm", "-png", "-r", "60", pdf, os.path.join(tmp, "s")], check=True, stderr=subprocess.DEVNULL)
files = sorted(glob.glob(os.path.join(tmp, "s-*.png")))
ims = [Image.open(f).convert("RGB") for f in files]
cols, pad, lab = 4, 28, 34
w, h = ims[0].size
rows = (len(ims) + cols - 1) // cols
W = cols * w + (cols + 1) * pad
Hh = 110 + rows * (h + lab + pad) + pad
sheet = Image.new("RGB", (W, Hh), (241, 245, 249))
d = ImageDraw.Draw(sheet)
try:
    fb = ImageFont.truetype("/usr/share/fonts/opentype/inter/Inter-Bold.otf", 34)
    fr = ImageFont.truetype("/usr/share/fonts/opentype/inter/Inter-Regular.otf", 20)
except OSError:
    fb = fr = ImageFont.load_default()
d.text((pad, 34), "Scale & Capital · День 1 — От первых клиентов до 7 рынков", font=fb, fill=(16, 24, 39))
labels = [str(i + 1) for i in range(18)] + ["B1", "B2"]
for i, im in enumerate(ims):
    x = pad + (i % cols) * (w + pad); y = 110 + (i // cols) * (h + lab + pad)
    d.text((x, y), f"Слайд {labels[i] if i < len(labels) else i + 1}", font=fr, fill=(100, 116, 139))
    sheet.paste(im, (x, y + lab))
sheet.save(out)
print("contact sheet", out, sheet.size)

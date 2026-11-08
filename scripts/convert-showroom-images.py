#!/usr/bin/env python3
from pathlib import Path
from PIL import Image
source=Path("/tmp/aether-renders")
target=Path("public/media")
target.mkdir(parents=True,exist_ok=True)
for name in ["headphone-product","headphone-side","headphone-canopy","headphone-macro","watch","earbuds","speaker"]:
    p=source/(name+".png")
    if not p.is_file():
        raise FileNotFoundError(str(p))
    im=Image.open(p).convert("RGBA")
    im.thumbnail((800 if name.startswith("headphone") else 700,)*2)
    output=target/(name+".webp")
    im.save(output,format="WEBP",quality=87,method=5)
    if not output.is_file() or output.stat().st_size<1000:
        raise ValueError("Empty web image "+str(output))
    print("WEBP",output,output.stat().st_size)

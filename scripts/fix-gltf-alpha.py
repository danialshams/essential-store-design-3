#!/usr/bin/env python3
"""Keep original AirPods Max 4K PBR maps, including the headband's true alpha cutouts."""
import json
import struct
import sys
from pathlib import Path

source, destination = map(Path, sys.argv[1:3])
raw = source.read_bytes()
if raw[:4] != b"glTF" or struct.unpack_from("<I", raw, 4)[0] != 2:
    raise ValueError("Expected a binary glTF 2.0 file")
length, kind = struct.unpack_from("<II", raw, 12)
if kind != 0x4E4F534A:
    raise ValueError("The first chunk must be JSON")
document = json.loads(raw[20:20+length])
materials = document.get("materials", [])
if not materials:
    raise ValueError("Source model has no materials")
for material in materials:
    # Original Sketchfab alpha contains transparent pixels in its
    # physically perforated textile canopy. The global BLEND setting
    # made solid earcups incorrectly see-through. Alpha MASK retains
    # genuine mesh holes while keeping cup/shell pixels fully opaque.
    material["alphaMode"] = "MASK"
    material["alphaCutoff"] = 0.42
    material["doubleSided"] = True
encoded = json.dumps(document, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
encoded += b" " * (-len(encoded) % 4)
tail = raw[20+length:]
output = (b"glTF" + struct.pack("<II", 2, 20+len(encoded)+len(tail))
          + struct.pack("<II", len(encoded), 0x4E4F534A)
          + encoded + tail)
destination.parent.mkdir(parents=True, exist_ok=True)
destination.write_bytes(output)
print("Preserved", len(document.get("meshes", [])), "meshes and",
      len(document.get("images", [])), "original images with alpha cutout")

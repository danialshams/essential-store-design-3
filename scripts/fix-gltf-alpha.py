#!/usr/bin/env python3
"""Preserve the user's exact glTF mesh and 4K texture data; only correct the erroneous alpha BLEND mode."""
import json,struct,sys
from pathlib import Path

src=Path(sys.argv[1])
dst=Path(sys.argv[2])
data=src.read_bytes()
if data[:4]!=b"glTF" or struct.unpack_from("<I",data,4)[0]!=2:
    raise ValueError("Expected binary glTF v2")
json_length,chunk_type=struct.unpack_from("<II",data,12)
if chunk_type!=0x4E4F534A:raise ValueError("No JSON chunk")
j=json.loads(data[20:20+json_length])
mats=j.get("materials",[])
if not mats:raise ValueError("No material")
for material in mats:
    if material.get("alphaMode","OPAQUE")=="BLEND":
        material["alphaMode"]="OPAQUE"
new_json=json.dumps(j,ensure_ascii=False,separators=(",",":")).encode("utf-8")
new_json+=b" " * (-len(new_json)%4)
rest=data[20+json_length:]
out=b"glTF"+struct.pack("<II",2,12+8+len(new_json)+len(rest))
out+=struct.pack("<II",len(new_json),0x4E4F534A)+new_json+rest
dst.parent.mkdir(parents=True,exist_ok=True)
dst.write_bytes(out)
print(f"Preserved {len(j.get('meshes',[]))} meshes and {len(j.get('images',[]))} embedded textures. Fixed alpha; wrote {dst}")

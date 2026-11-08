#!/usr/bin/env bash
set -euo pipefail
test -s airpods-max-4k.glb
mkdir -p public/models
python3 scripts/fix-gltf-alpha.py airpods-max-4k.glb /tmp/airpods-max-mask.glb
npx --yes @gltf-transform/cli@4.5.1 webp /tmp/airpods-max-mask.glb public/models/airpods-max-4k-opaque.glb --quality 96
node - <<'JS'
const fs=require("node:fs");
for(const f of ["public/models/airpods-max-4k-opaque.glb"]){
 const b=fs.readFileSync(f),n=b.readUInt32LE(12);
 const obj=JSON.parse(b.subarray(20,20+n).toString());
 if(obj.materials?.some(m=>m.alphaMode!=="MASK"))throw Error("Loss of textile alpha mask");
 if(obj.images?.length!==4)throw Error("Expected all four original 4K texture images");
 console.log("4K_MESH_MASK",b.length,"bytes");
}
JS

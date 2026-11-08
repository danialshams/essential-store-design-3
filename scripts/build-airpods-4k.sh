#!/usr/bin/env bash
set -euo pipefail
test -s airpods-max-4k.glb
mkdir -p public/models
python3 scripts/fix-gltf-alpha.py airpods-max-4k.glb /tmp/airpods-max-4k-opaque-original.glb
npx --yes @gltf-transform/cli@4.5.1 webp /tmp/airpods-max-4k-opaque-original.glb public/models/airpods-max-4k-opaque.glb --quality 96
node - <<'JS'
const fs=require("node:fs");
for (const f of ["airpods-max-4k.glb","public/models/airpods-max-4k-opaque.glb"]){
 const buf=fs.readFileSync(f); const len=buf.readUInt32LE(12);
 const j=JSON.parse(buf.subarray(20,20+len).toString());
 console.log(f,buf.length,"bytes",j.images?.length,"textures",j.materials?.map(x=>x.alphaMode));
 if(f.includes("opaque")&&j.materials?.some(x=>(x.alphaMode||"OPAQUE")!=="OPAQUE"))process.exit(1);
}
JS

#!/usr/bin/env bash
set -euo pipefail
test -s airpods-max-4k.glb
command -v ktx >/dev/null || { echo 'Install KTX-Software 4.4.2 first.' >&2; exit 1; }
mkdir -p public/models
python3 scripts/fix-gltf-alpha.py airpods-max-4k.glb /tmp/airpods-opaque-for-perf.glb
npx --yes @gltf-transform/cli@4.5.1 resize /tmp/airpods-opaque-for-perf.glb /tmp/airpods-preview-512.glb --width 512 --height 512
npx --yes @gltf-transform/cli@4.5.1 webp /tmp/airpods-preview-512.glb /tmp/airpods-preview-webp.glb --quality 80
npx --yes @gltf-transform/cli@4.5.1 meshopt /tmp/airpods-preview-webp.glb public/models/airpods-preview-v1.glb
npx --yes @gltf-transform/cli@4.5.1 etc1s /tmp/airpods-opaque-for-perf.glb public/models/airpods-max-4k-ktx2-v1.glb --quality 225 --compression 2
node --input-type=module - <<'NODE'
import {readFileSync} from 'node:fs';
for(const path of ['public/models/airpods-preview-v1.glb','public/models/airpods-max-4k-ktx2-v1.glb']){
 const raw=readFileSync(path);
 const len=raw.readUInt32LE(12);
 const asset=JSON.parse(raw.subarray(20,20+len).toString());
 console.log(path,Math.round(raw.length/1024)+'KiB',asset.extensionsRequired,asset.images?.length+' textures');
 if(!asset.meshes?.length||asset.images?.length!==4)process.exit(1);
 if(asset.materials?.some(x=>x.alphaMode==='BLEND'))process.exit(1);
}
NODE


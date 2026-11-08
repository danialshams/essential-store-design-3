# AETHER — AirPods Max 360° model viewer

The exact headphone mesh and PBR textures from the owner's Sketchfab download are used. No procedural replacement, split components, storefront or scroll choreography.

## Progressive start

1. An already-rendered JPG/WebP poster is in the initial HTML markup.
2. The **same headphone geometry** and reduced texture preview become interactive as soon as the small **~415KB** meshopt GLB is ready.
3. The preview is seamlessly replaced by the final 4K texture version encoded with KTX2 BasisU (ETC1S), keeping 4096×4096 texture dimensions. The final asset is **~4.9MB**, vs. the previous WebP-encoded 4K model **~7.0MB**.
4. The KTX2 format reduces GPU memory and transfer cost; compression is lossy, so individual texels are not bit-identical to the original download, though geometry and UVs are unchanged.
5. Rotation is fully unrestricted and runs on demand, with brief damping frames after interaction. No spinner or waiting label.

The smaller preview is temporary only; the 4K asset always replaces it, on mobile and desktop alike. Versioned GLB and transcoder endpoints use long-lived immutable caching. The poster remains visible until a rendered interactive scene is ready.

## Regenerate models

Install KTX-Software 4.4.2 (the \`ktx\` executable), then:

\`\`\`bash
bash scripts/build-airpods-progressive.sh
npm install
npm run typecheck
npm run build
\`\`\`

## Attribution

3D source: [AirPods Max by DJM on Sketchfab](https://sketchfab.com/3d-models/airpods-max-3400db28f6da41d08304ff20b29c3883), CC BY.

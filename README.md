# AETHER — model-only AirPods Max viewer

This experiment displays **the exact model uploaded by the owner** to \`airpods-max-4k.glb\`; no procedural geometry or part-separation is used.

- 360-degree one-page orbit with pointer/touch input, scroll/pinch zoom and damping.
- No store UI, scroll scene choreography, or automatic explosion.
- Mobile GLB uses the same mesh with WebP 1K textures (~2.5 MB), desktop 2K (~3.2 MB), keeping the full original 4K file unchanged.
- Static still-image placeholder is derived from an earlier Blender render of this uploaded asset.
- On-demand WebGL render loop; no perpetual scroll animation.
- Model: [AirPods Max — DJM (Sketchfab, CC BY)](https://sketchfab.com/3d-models/airpods-max-3400db28f6da41d08304ff20b29c3883). Attribution shown in the viewer. Verify asset's provenance before commercial distribution.

To regenerate web variants from the original download:
\`\`\`bash
bash scripts/optimize-airpods.sh
npm install
npm run typecheck
npm run build
\`\`\`

Note: this is a low-overhead 360-degree inspection experience, not a fully interactive component-explosion scene.

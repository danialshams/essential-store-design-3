# AETHER — professional 3D model approval

This branch adds the **real asset → PBR audit → three Blender renders** workflow. It does **not** replace the current live model or commit anyone's purchased model.

## Source

The exact reference the owner selected is [BugIRL3D Apple AirPods Max on CGTrader](https://www.cgtrader.com/3d-models/electronics/audio/apple-airpods-max-e3852125-a62c-41bd-83f6-47728324754b) (licensed purchase required). Its advertised assets include an FBX/OBJ mesh and 4K PBR textures.

## Usage

Keep the purchase files private, e.g. under \`private-assets/airpods-max/\`. Do not add them to public GitHub.

\`\`\`bash
blender -b --factory-startup --python-exit-code 1 --python scripts/render_licensed_asset.py -- \
  --asset "private-assets/airpods-max/<model>.fbx" \
  --textures "private-assets/airpods-max" \
  --output "build/model-approval" --samples 64 --resolution 1280
\`\`\`

Outputs: \`01-hero.png\`, \`02-cushion-macro.png\`, \`03-hinge-macro.png\`, \`audit.json\`. The audit checks mesh count, UVs, PBR image presence, and named elements. For speed, use \`--samples 16 --resolution 640\` during QA.

**Gate:** Approve the actual still renders before changing the live website. Afterwards rebuild an optimized render setup, first-frame poster, mobile-quality tier, and six individual camera shots.

**Licensing warning:** CGTrader's royalty-free license forbids making the standalone purchased mesh retrievable. Publishing a plain GLB on a public Vercel URL is not appropriate without explicit vendor permission for interactive web display. Rendered PNGs are a separate, permitted product use.

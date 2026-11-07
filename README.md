# AETHER / Object 001 — 3D Headphone Preview

A focused model approval page: one **custom Blender-designed** over-ear headphone, with a live 360-degree product inspector and six scroll-driven camera shots. No store navigation, checkout, cards, or videos are shown.

## Model

- Source: \`tools/build_studio_headphones.py\` (Blender 4.5/5.0; reproducible).
- Output: \`public/models/aether-studio.glb\`.
- Separate named animation groups: \`HEADBAND\`, \`HINGE_L/R\`, \`SHELL_L/R\`, \`DRIVER_L/R\`, \`CUSHION_L/R\`.
- Multi-material geometry for sculpted aluminum shells, stainless steel, suspended woven canopy, fabric foam cushions, mechanical hinge, driver and vents.
- Site runs with React Three Fiber + Drei and a compressed Draco GLB. Local Draco decoder assets are bundled during \`npm install\` by \`scripts/copy-draco.mjs\`; no foreign CDN required at runtime.

## UX

One page, six scroll stops. Each shot uses distinct camera position, aim and FOV. Final shot reassembles the cup; the inspect button allows unconstrained horizontal orbit and pinch-to-zoom. Vertical touch scrolling never competes with the orbit gesture because orbit mode is explicit. Reduced-motion mode provides the overview rather than pinning a long animation.

## Limits

This is an original **AirPods-Max-inspired studio concept**, not an official Apple model or exact CAD measurement. The materials and mesh are crafted for a browser-rendered portfolio; photo-accurate replica textures would require reference photos, professional UV/baking and visual review on a calibrated screen.

## Commands

\`\`\`sh
npm install
npm run typecheck
npm run build
npm run dev
# To regenerate geometry:
blender -b --factory-startup --python-exit-code 1 --python tools/build_studio_headphones.py
npx @gltf-transform/cli optimize public/models/aether-studio.glb public/models/temp.glb --compress draco --flatten false --join false --instance false --simplify false --palette false
mv public/models/temp.glb public/models/aether-studio.glb
\`\`\`

No paid third-party UI component, stock render or video generator is used.

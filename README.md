# AETHER — exact AirPods Max source with 360° inspection

The site uses the original free Sketchfab AirPods Max model uploaded by the owner to \`airpods-max-4k.glb\`.

## Rendering fixes

- **Same geometry, UVs, PBR materials and four 4096 × 4096 textures on desktop AND mobile.** There is no 1K mobile downgrade.
- The original source declares \`alphaMode: BLEND\` on its only solid material. The build converts that to the glTF default \`OPAQUE\` before WebP encoding to prevent the rear of the earcups showing through. No UVs, geometry, or PBR shader parameters are changed.
- Four full-resolution textures are lossily encoded to WebP at quality 96, reducing download size from ~14.6 MB to ~7 MB while keeping their original 4K resolution.
- Small desktop and mobile first-frame posters captured from the **same WebGL scene** is visible at initial HTML paint; no loading text is shown.
- On-demand rendering: the scene does not continuously render while idle. A gesture-controlled frame pump schedules frames while rotating/zooming and briefly during inertial damping.
- Trackball controls allow **unrestricted vertical rotation**, plus horizontal rotation and touch/pinch or wheel zoom.
- Neutral white softboxes and restrained tone mapping make lighting closer to the original PBR material. Lighting can alter perceived appearance without modifying the model.

## Commands

\`\`\`sh
bash scripts/build-airpods-4k.sh
npm install
npm run typecheck
npm run build
\`\`\`

## Credit

3D model [AirPods Max by DJM on Sketchfab](https://sketchfab.com/3d-models/airpods-max-3400db28f6da41d08304ff20b29c3883) — CC BY. The credit remains visible in the site.

## Scope

The app intentionally shows **only** a 360-degree model; there is no component separation, scroll-based feature presentation, login, or store UI.

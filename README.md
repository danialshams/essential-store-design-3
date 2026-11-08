# AETHER — Premium Digital Atelier

A responsive Next.js 16 + React 19 demonstration storefront with the approved cinematic Obsidian, Ivory and Silver design.

Includes a full-height 3D hero, 2 curated collections, 4 products, editorial details, mobile menu, live product search, catalog, product detail routes, wishlist buttons and a locally persisted demonstration cart. Payments, checkout, email subscription and authentication are deliberately disabled pending real infrastructure.

The original **user-uploaded** AirPods Max GLB remains the 3D product. 430 KB source-derived model first; the full 4K PBR textures load in the background, with no camera reset. Automatic rotation pauses during drag/touch and resumes after idle.

## Perforated textile canopy

The original source's base-color texture includes real transparent pixels defining the headband's woven cutouts. Earlier code set the *entire source material* to opaque, destroying those gaps. `scripts/fix-gltf-alpha.py` now selects glTF `MASK` (cutoff 0.42) rather than global `BLEND`: correct fabric holes, opaque aluminum body, and preserved source geometry/UVs/material textures. Rebuild with:

```sh
bash scripts/build-airpods-4k.sh
bash scripts/build-instant-model.sh
```

## Demo media

The storefront's watches, earbuds, speakers and featured-headphone photos are rendered from Blender source scripts shipped in this repository. They are illustrative, not claims of real products or inventory.

## Attribution

3D AirPods Max model: [DJM on Sketchfab, CC BY](https://sketchfab.com/3d-models/airpods-max-3400db28f6da41d08304ff20b29c3883). Credit is visible in the source and the site footer. Confirm licensing and provenance for commercial use.

Only release to `main` after successful GitHub Actions and production build.

## GSAP / glass showroom upgrade

- Drag and zoom are gated by raycasts against the actual 3D mesh, not the full canvas. Touching empty space preserves native page scroll; the wheel zooms only when the cursor is over the headphones.
- The model auto-rotates at about one revolution every 29 seconds. Manual gestures pause rotation; after two idle seconds, the pitch and zoom smoothly settle to neutral over about one second, while yaw continues from the last angle.
- Cinema-style GSAP + ScrollTrigger animations introduce hero text line by line and stage cards, collections, detail photographs and footer. Motion is reduced when the system requests it.
- The hero, product surfaces and panels use subtle semi-transparent glass. Hero type has a matte blur behind it for legibility.
- The previous repetitive full-headphone section is replaced by two source-rendered macro photos of the actual woven canopy and aluminum details, cropped with object-fit: contain.
- `npm run build` always installs local Draco decoder files before building through `prebuild`, avoiding missing 3D assets when lifecycle scripts are ignored.

# AETHER / Edition 03 — Scroll-Cinematic Prototype

Next.js 16 concept storefront for a premium spatial-commerce experience.

## Current prototype
- Entirely procedural, **real-time 3D** headphone with independently modelled ear cushions, drivers, grilles, metallic shell covers, visible fasteners, metal arms and headband.
- Studio-like physical environment reflections and materials (React Three Fiber, Drei Lightformers).
- Four scroll-scrubbed acts: intro, macro inspection, component explosion, and exact reverse assembly.
- Scroll progress is reversible in both directions; horizontal pointer-drag orbits the headset while vertical touch scroll remains native.
- Accessible progress navigation, minimal motion fallback, canvas pause when out of view, mobile responsive layout.
- Silver, graphite, and ice-blue finishes; original header, menus, and demo cart retained.

This **procedural prototype is not a CAD-certified product design or photogrammetric 3D scan**. Production-grade close-up fidelity would require a licensed, multi-part model with authored PBR textures and professional environment lighting.

## Run
npm install
npm run typecheck
npm run build
npm run dev

This is a public UX demo. **No real checkout, payments, or shipping**, and it does not depend on a third-party video generator. The next production stage is integrating the shared commerce admin and real product models.

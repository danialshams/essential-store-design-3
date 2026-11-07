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

## Edition 03: cinematic six-act experience
- New aluminum over-ear concept inspired by premium industrial design, with rectangular metal shells, independent ear cushions, pressure fabric, canopy mesh, driver geometry, telescopic struts, fasteners and rotating control. This is a stylized concept, not an official or dimensionally exact Apple CAD model.
- Scroll camera choreography with six chapters: reveal, component separation, textile macro, hinge macro, driver closeup, reassembly. Fully reversible by scrolling back.
- Separate 360° inspect modal with unrestricted horizontal orbit, touch rotation, pinch zoom and auto rotation; mobile scroll remains native outside the modal.
- Responsive mobile camera/framing with reduced texture/render cost, reversible animation, accessible scene navigation and reduced-motion behavior.
- No paid video-generation service, and no required paid UI packages.

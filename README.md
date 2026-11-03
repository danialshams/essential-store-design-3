# NOIR OPTICS — camera scroll hero (prototype)

The `/` homepage is now a four-act, reversible camera-scroll study:

1. Camera hero and cinematic dolly-in
2. Macro close-up and camera move
3. Independently layered, transparent mechanical component sprites scatter on scroll and reunite on reverse scroll
4. Sensor and optics close-ups with technical callouts

Built on **GSAP + ScrollTrigger**, without Three.js or browser-side WebGL. Local WebP imagery (about 0.5 MB total) was extracted and retouched from the **user-approved visual storyboard**. This is a **2.5D prototype**, not a true Blender/Cycles 3D render or physically accurate camera assembly. For final cinema-grade continuous motion, replace assets with Blender-rendered component sequences.

The previous Edition 03 flagship storefront remains at `/atelier`, and all commerce routes and shared-admin integration remain unchanged. `prefers-reduced-motion` shows a static first scene with direct navigation; mobile omits the expensive seven-layer desktop explosion and shows a lighter image-based version.

Run `npm test`, `npm run syntax`, `npm run typecheck`, `npm run build` before release. Do not commit `.env` files or storefront API keys.

---

# ATELIER — Digital Flagship / Edition 03

Independent, RTL, mobile-first Next.js 16 storefront. Unlike the economic and editorial editions, this design uses a dark immersive hero, selectable category gallery, desktop-pinned three-act narrative, oversized product study, contextual shopping hotspots, quick preview, a full-screen interactive navigation, and a true cart drawer. All photography is bundled in `public/images/` for the demo.

## Development

```bash
npm install
npm test
npm run typecheck
npm run build
npm run dev
```

## Shared commerce admin

Use the *same* existing `studio-commerce-admin` backend; do not create a new admin or move the original database. Set server-only environment variables:

```env
STOREFRONT_ADMIN_ORIGIN=https://studio-commerce-admin.vercel.app
STOREFRONT_API_SECRET=<a-separate-secret-matching-STORE_API_SECRET_V3-in-admin>
```

The public `/api/store/bootstrap` response delivers products, categories, images, prices, stock, pages, journal articles, banners, shipping and `homeSections`. The server-to-server order proxy forwards purchase data to `/api/store/order` with the separate V3 secret and uses the admin's pricing/inventory validation; **neither the secret nor database connection is included in client code**. Until payment integration is configured, orders are recorded as pending and no online payment is collected or claimed. Without an admin connection, the bundled eight-product demo works without deleting or overwriting data.

The admin's `homeSections` JSON lets Edition 03 choose editorial roles (hero, story, scene, campaign), desktop/mobile photography, narrative scenes and product-linked hotspot coordinates. This JSON is an optional extension and does not change existing editions' data model. Changes in the admin affect all template instances connected to the same demo database; deploy a separate database per actual customer.

## Animation and accessibility

GSAP & ScrollTrigger are loaded only after hydration. Motion is scoped, cleaned up on unmount, and skipped for `prefers-reduced-motion`. Desktop story is pinned; mobile story is stacked with visible photographs and is never scroll-hijacked. All menu/quick-view/hotspot controls are real buttons with accessible labels and Escape handling; interaction does not depend on hover.

## Deployment portability

`npm run build && npm run start` works on Node.js 22+; Vercel is just a demo host. A customer VPS can run the same Next.js source with server environment variables and its own Postgres-backed admin instance. No external paid animation or image API is required. Payments, SMS and account identity verification are intentionally not claimed as active.

import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,readFileSync,statSync} from "node:fs";
const read=(path)=>readFileSync(new URL(`../${path}`,import.meta.url),"utf8");
test("edition 03 has independent visual system and complete commerce routes",()=>{
 const layout=read("src/app/layout.tsx"),home=read("src/app/page.tsx");
 assert.match(layout,/flagship.css/);
 assert.doesNotMatch(layout,/premium.css|cinematic.css/);
 for(const text of ["FlagshipMotion","CollectionGallery","ShopTheScene","fg-chapters","fg-spotlight","fg-curated","fg-journal"])assert.ok(home.includes(text),`Missing flagship section ${text}`);
 for(const p of ["src/app/cart/page.tsx","src/app/checkout/page.tsx","src/app/product/[slug]/page.tsx","src/app/category/[slug]/page.tsx","src/app/blog/[slug]/page.tsx"])assert.ok(existsSync(new URL(`../${p}`,import.meta.url)));
});
test("all cinematic demo photographs are bundled and optimized",()=>{
 for(const name of ["hero","chapter-1","chapter-2","chapter-3","collection","scene","spotlight","outro"]){
  const file=new URL(`../public/images/flagship-${name}.webp`,import.meta.url);
  assert.ok(existsSync(file),`Missing ${name}`);
  assert.ok(statSync(file).size>12000,`Blank photo: ${name}`);
  assert.ok(statSync(file).size<350000,`Unoptimized image: ${name}`);
 }
});
test("navigation, interactive collection gallery and shop the scene are accessible",()=>{
 const header=read("src/components/Header.tsx"),experience=read("src/components/FlagshipExperiences.tsx");
 assert.match(header,/aria-expanded=\{menu\}/);
 assert.match(header,/aria-label="بستن منو"/);
 assert.match(header,/Escape/);
 assert.match(header,/inert=\{!menu\}/);
 assert.match(experience,/onFocus=\{\(\)=>setSelected\(i\)\}/);
 assert.match(experience,/aria-expanded=\{selected===i\}/);
 assert.match(experience,/href=\{`\/product\/\$\{product.slug\}`\}/);
});
test("GSAP is scoped, progressive, motion-safe and uses one desktop pinned story",()=>{
 const motion=read("src/components/FlagshipMotion.tsx"),css=read("src/app/flagship.css");
 assert.match(motion,/prefers-reduced-motion: reduce/);
 assert.match(motion,/gsap\.context/);
 assert.match(motion,/ScrollTrigger/);
 assert.match(motion,/pin:true/);
 assert.match(motion,/ctx\.revert\(\)/);
 assert.doesNotMatch(motion,/ScrollSmoother|requestAnimationFrame|setInterval/);
 assert.match(css,/@media\(max-width:960px\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
test("flagship uses shared admin products and server-protected order checkout",()=>{
 const store=read("src/lib/live-store.ts"),proxy=read("src/app/api/store/order/route.ts"),home=read("src/app/page.tsx");
 assert.match(store,/STOREFRONT_ADMIN_ORIGIN/);
 assert.match(store,/homeSections/);
 assert.match(home,/spotlight\.price/);
 assert.match(home,/scene\?\.hotspots/);
 assert.match(proxy,/STOREFRONT_API_SECRET/);
 assert.match(proxy,/x-storefront-key/);
 assert.doesNotMatch(read("src/components/ShopProvider.tsx"),/STOREFRONT_API_SECRET/);
});

import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,existsSync,statSync} from "node:fs";
const read=p=>readFileSync(new URL(`../${p}`,import.meta.url),"utf8");
const component=read("src/components/CameraScrollHero.tsx");
const css=read("src/app/camera-story.css");
const home=read("src/app/page.tsx");
test("camera prototype replaces homepage while prior flagship demo remains accessible",()=>{
 assert.match(home,/CameraScrollHero/);
 assert.ok(existsSync(new URL("../src/app/atelier/page.tsx",import.meta.url)));
 assert.match(component,/href="\/atelier"/);
 assert.match(component,/href="\/products"/);
});
test("each camera stage and independent physical component sprite exists",()=>{
 for(const name of ["intro","macro","exploded","details","part-lens","part-optics","part-body","part-sensor","part-board","part-rear","part-grip"]){
  const p=new URL(`../public/images/camera-story/${name}.webp`,import.meta.url);
  assert.ok(existsSync(p),name);
  assert.ok(statSync(p).size>4500,`asset missing image data: ${name}`);
  assert.ok(statSync(p).size<240000,`asset too large: ${name}`);
 }
 assert.match(component,/data-cs-part/);
 assert.match(component,/parts\.forEach/);
 assert.match(component,/rotation:turn/);
});
test("scrollscrubbing is bidirectional, scoped, progressive and cleaned up",()=>{
 assert.match(component,/ScrollTrigger/);
 assert.match(component,/import\("gsap"\)/);
 assert.match(component,/scrub:0\.55/);
 assert.match(component,/end:"bottom bottom"/);
 assert.match(component,/context\.revert\(\)/);
 assert.match(component,/prefers-reduced-motion: reduce/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.doesNotMatch(component,/setInterval\(|requestAnimationFrame\(|ScrollSmoother/);
});
test("camera experience is mobile-first and uses actual navigation/active steps",()=>{
 assert.match(component,/aria-label="تجربه سینمایی دوربین عکاسی"/);
 assert.match(component,/aria-current=\{current===i/);
 assert.match(component,/window\.scrollTo/);
 assert.match(css,/@media \(max-width:760px\)/);
 assert.match(css,/\.cs-explosion-parts\{display:none\}/);
});
test("camera animation runs without Three.js or custom WebGL",()=>{
 assert.doesNotMatch(component,/from ["'](?:three|@react-three)|WebGLRenderer|CanvasTexture/i);
 assert.match(component,/WebP layers|independent transparent WebP/);
 assert.match(read("src/app/layout.tsx"),/camera-story.css/);
});

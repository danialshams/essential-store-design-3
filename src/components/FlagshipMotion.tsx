"use client";
import {useEffect,useRef,type ReactNode} from "react";

/** Progressive enhancement: no JS and reduced-motion leave all content readable. */
export function FlagshipMotion({children}:{children:ReactNode}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  if(!ref.current||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  let alive=true;
  let revert=()=>{};
  void Promise.all([import("gsap"),import("gsap/ScrollTrigger")]).then(([m,t])=>{
   if(!alive||!ref.current)return;
   const gsap=m.gsap,ScrollTrigger=t.ScrollTrigger;
   gsap.registerPlugin(ScrollTrigger);
   const root=ref.current;
   const ctx=gsap.context(()=>{
    const q=gsap.utils.selector(root);
    // Deliberate choreography, with no perpetual rAF animation or scroll hijacking.
    const intro=gsap.timeline({defaults:{ease:"power3.out"}});
    intro.fromTo(q("[data-fg-hero-image]"),{scale:1.095,opacity:.72},{scale:1,opacity:1,duration:1.65,clearProps:"transform,opacity"})
      .fromTo(q("[data-fg-hero-label]"),{autoAlpha:0,y:13},{autoAlpha:1,y:0,duration:.6,clearProps:"all"},"-=1.22")
      .fromTo(q("[data-fg-hero-line]"),{yPercent:116,opacity:0},{yPercent:0,opacity:1,duration:1.05,stagger:.14,clearProps:"all"},"-=.95")
      .fromTo(q("[data-fg-hero-after]"),{opacity:0,y:19},{opacity:1,y:0,duration:.85,stagger:.12,clearProps:"all"},"-=.64");
    q("[data-fg-reveal]").forEach((node:Element)=>{
      gsap.fromTo(node,{opacity:0,y:30},{opacity:1,y:0,ease:"power3.out",duration:.9,clearProps:"all",scrollTrigger:{trigger:node,start:"top 89%",once:true}});
    });
    q("[data-fg-stagger]").forEach((node:Element)=>{
      gsap.fromTo([...node.children],{opacity:0,y:23},{opacity:1,y:0,stagger:.12,duration:.82,ease:"power3.out",clearProps:"all",scrollTrigger:{trigger:node,start:"top 88%",once:true}});
    });
    q("[data-fg-wipe]").forEach((node:Element)=>{
      if(node.closest("[data-fg-hero-image]"))return;
      gsap.fromTo(node,{clipPath:"inset(0 0 100% 0)"},{clipPath:"inset(0 0 0% 0)",duration:1.2,ease:"power3.inOut",clearProps:"all",scrollTrigger:{trigger:node,start:"top 92%",once:true}});
    });
    const mm=gsap.matchMedia();
    mm.add("(min-width: 960px)",()=>{
      const chapters=q("[data-fg-chapter]");
      chapters.forEach((section:Element)=>{
        const shots=Array.from(section.querySelectorAll<HTMLElement>("[data-fg-chapter-shot]"));
        const copies=Array.from(section.querySelectorAll<HTMLElement>("[data-fg-chapter-copy]"));
        const bar=section.querySelector<HTMLElement>("[data-fg-progress]");
        if(shots.length<2)return;
        gsap.set(shots.slice(1),{autoAlpha:0});
        gsap.set(copies.slice(1),{autoAlpha:0});
        const timeline=gsap.timeline({scrollTrigger:{trigger:section,start:"top top",end:()=>`+=${window.innerHeight*2.1}`,pin:true,scrub:1,anticipatePin:1,invalidateOnRefresh:true}});
        for(let i=1;i<shots.length;i++){
          timeline.to(shots[i-1],{autoAlpha:0,duration:.48,ease:"none"},`chapter${i}`)
            .fromTo(shots[i],{autoAlpha:0,scale:1.045},{autoAlpha:1,scale:1,duration:.48,ease:"none"},`chapter${i}`)
            .to(copies[i-1],{autoAlpha:0,y:-15,duration:.28},`chapter${i}`)
            .fromTo(copies[i],{autoAlpha:0,y:15},{autoAlpha:1,y:0,duration:.35},`chapter${i}+=.19`);
        }
        if(bar)timeline.fromTo(bar,{scaleX:0},{scaleX:1,duration:timeline.duration(),ease:"none"},0);
      });
      q("[data-fg-zoom]").forEach((node:Element)=>{
        const img=node.querySelector("img");if(img)gsap.fromTo(img,{scale:1.04},{scale:1.0,ease:"none",scrollTrigger:{trigger:node,start:"top bottom",end:"bottom top",scrub:.7}})
      });
    });
   },root);
   revert=()=>ctx.revert();
  }).catch(()=>{/* Static layout remains readable when motion is unavailable. */});
  return()=>{alive=false;revert()};
 },[]);
 return <div className="fg-site" ref={ref}>{children}</div>
}

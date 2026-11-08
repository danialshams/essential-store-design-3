"use client";

import {useLayoutEffect} from "react";
import {gsap} from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";

/** Scoped, accessible cinematic motion. ScrollTriggers fire before the
 * section reaches center, once per navigation, and clean up on route changes.
 */
export default function CinematicMotion({view}:{view:string}){
  useLayoutEffect(()=>{
    gsap.registerPlugin(ScrollTrigger);
    const root=document.querySelector(".aether-commerce");
    if(!root)return;
    const ctx=gsap.context(()=>{
      if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
      if(root.querySelector(".hero-message")){
        gsap.timeline({defaults:{ease:"power3.out"}})
        .fromTo(".hero-message",{autoAlpha:0,y:24},{autoAlpha:1,y:0,duration:.75},.08)
        .fromTo(".hero-eyebrow",{autoAlpha:0,y:12},{autoAlpha:1,y:0,duration:.65},.38)
        .fromTo(".hero-line",{autoAlpha:0,yPercent:115,rotateX:-9},{autoAlpha:1,yPercent:0,rotateX:0,duration:1.13,stagger:.16,ease:"power4.out"},.34)
        .fromTo(".hero-description",{autoAlpha:0,y:16},{autoAlpha:1,y:0,duration:.68},.82)
        .fromTo(".hero-buttons",{autoAlpha:0,y:17},{autoAlpha:1,y:0,duration:.74},1.02)
        .fromTo(".hero-visual",{autoAlpha:.6,scale:1.035},{autoAlpha:1,scale:1,duration:1.37,ease:"power2.out"},.12);
      }
      const selector=".collection-intro,.section-head,.craft-intro,.inner-title,.about-content,.footer-columns > *,.footer-bottom";
      gsap.utils.toArray<HTMLElement>(selector).forEach(node=>{
        gsap.fromTo(node,{autoAlpha:0,y:23},{
          autoAlpha:1,y:0,duration:.76,ease:"power3.out",immediateRender:false,
          scrollTrigger:{trigger:node,start:"top 93%",once:true}
        });
      });
      gsap.utils.toArray<HTMLElement>(".collection-cover").forEach((card,i)=>{
        const tl=gsap.timeline({scrollTrigger:{trigger:card,start:"top 94%",once:true}});
        tl.fromTo(card,{autoAlpha:0,y:28,clipPath:"inset(10% 0 10% 0 round 19px)"},{
          autoAlpha:1,y:0,clipPath:"inset(0% 0 0% 0 round 16px)",duration:.9,ease:"power3.out",delay:i*.08,immediateRender:false
        });
        const img=card.querySelector("img");
        if(img)tl.fromTo(img,{scale:1.12},{scale:1,duration:1.15,ease:"power2.out"},0);
      });
      gsap.utils.toArray<HTMLElement>(".item-grid").forEach(grid=>{
        const cards=Array.from(grid.querySelectorAll<HTMLElement>(".product-tile"));
        if(!cards.length)return;
        const tl=gsap.timeline({scrollTrigger:{trigger:grid,start:"top 94%",once:true}});
        tl.fromTo(cards,{autoAlpha:0,y:27,scale:.98},{
          autoAlpha:1,y:0,scale:1,duration:.72,stagger:.08,ease:"power3.out",immediateRender:false
        });
        cards.forEach((card,i)=>{
          const img=card.querySelector(".tile-image img"),text=card.querySelector(".tile-bottom");
          if(img)tl.fromTo(img,{autoAlpha:0,scale:1.07},{autoAlpha:1,scale:1,duration:.6,ease:"power2.out"},.13+i*.08);
          if(text)tl.fromTo(text,{autoAlpha:0,y:11},{autoAlpha:1,y:0,duration:.52},.23+i*.08);
        });
      });
      gsap.utils.toArray<HTMLElement>(".craft-card").forEach((card,i)=>{
        const tl=gsap.timeline({scrollTrigger:{trigger:card,start:"top 94%",once:true}});
        tl.fromTo(card,{autoAlpha:0,x:i===0?-20:20,y:24},{
          autoAlpha:1,x:0,y:0,duration:.84,ease:"power3.out",immediateRender:false
        });
        const img=card.querySelector("img"),caption=card.querySelector(".craft-caption");
        if(img)tl.fromTo(img,{scale:1.1,autoAlpha:.65},{scale:1,autoAlpha:1,duration:1.18,ease:"power2.out"},0);
        if(caption)tl.fromTo(caption,{y:13,autoAlpha:0},{y:0,autoAlpha:1,duration:.6},.3);
      });
      gsap.utils.toArray<HTMLElement>(".product-layout,.about-product,.filter-bar").forEach(node=>{
        gsap.fromTo(node,{autoAlpha:0,y:22},{autoAlpha:1,y:0,duration:.75,ease:"power3.out",immediateRender:false,
          scrollTrigger:{trigger:node,start:"top 94%",once:true}});
      });
    },root);
    document.fonts?.ready.then(()=>ScrollTrigger.refresh()).catch(()=>{});
    return()=>ctx.revert();
  },[view]);
  return null;
}

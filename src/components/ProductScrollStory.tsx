"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ReactNode } from "react";

const Viewer=dynamic(()=>import("./Headphone360"),{
  ssr:false,
  loading:()=> <div className="journey-load-poster" aria-hidden="true">
    <picture><source media="(max-width: 760px)" srcSet="/images/airpods-poster-mobile.webp"/>
      <img src="/images/airpods-poster-desktop.webp" alt=""/></picture>
  </div>
});

const CHAPTERS=[
  {eyebrow:"01 / COMFORT",title:"راحتی، در هر لحظه",description:"بالشتک‌های نرم و طراحی ارگونومیک؛ برای تجربه‌ای راحت حتی در گوش‌دادن‌های طولانی."},
  {eyebrow:"02 / MATERIAL",title:"ظرافت در پرداخت فلز",description:"بدنه‌ای با خطوط پیوسته، بافت دقیق و پرداختی که در نور خودش را نشان می‌دهد."},
  {eyebrow:"03 / STRUCTURE",title:"طراحی تا آخرین اتصال",description:"هدبند و بازوهای نگه‌دارنده برای تعادل، تنظیم‌پذیری و هماهنگی هر بخش طراحی شده‌اند."},
  {eyebrow:"04 / DETAILS",title:"کنترل، با یک لمس",description:"محل قرارگیری کلیدها و اتصالات، با تمرکز بر دسترسی ساده و استفاده روزمره."}
] as const;

function chapterAt(progress:number){
  // Camera transitions have no callout: only the headphones remain on screen.
  if(progress>=.235&&progress<.343)return 0;
  if(progress>=.435&&progress<.55)return 1;
  if(progress>=.625&&progress<.737)return 2;
  if(progress>=.825&&progress<.9)return 3;
  return -1;
}
const clamp=(t:number)=>Math.max(0,Math.min(1,t));
const smooth=(t:number)=>{const x=clamp(t);return x*x*(3-2*x)};

export default function ProductScrollStory({children}:{children:ReactNode}){
  const sectionRef=useRef<HTMLElement|null>(null);
  const stageRef=useRef<HTMLDivElement|null>(null);
  const heroOverlayRef=useRef<HTMLDivElement|null>(null);
  const cardRef=useRef<HTMLElement|null>(null);
  const dotRef=useRef<HTMLSpanElement|null>(null);
  const lineRef=useRef<SVGPathElement|null>(null);
  const progressRef=useRef(0);
  const chapterRef=useRef(-1);
  const [current,setCurrent]=useState(-1);

  useLayoutEffect(()=>{
    const section=sectionRef.current,overlay=heroOverlayRef.current;
    if(!section||!overlay)return;
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    gsap.registerPlugin(ScrollTrigger);
    let alive=true;
    const update=(p:number)=>{
      progressRef.current=p;
      const fade=1-smooth((p-.035)/.105);
      overlay.style.opacity=String(fade);
      overlay.style.visibility=fade<.001?"hidden":"visible";
      overlay.style.pointerEvents=fade>.15?"auto":"none";
      const next=chapterAt(p);
      if(next!==chapterRef.current){
        chapterRef.current=next;
        setCurrent(next);
      }
    };
    // No GSAP pin: native CSS sticky is bounded by the tall section itself.
    // When the last camera shot ends, the next page section flows normally.
    const scroll=ScrollTrigger.create({
      trigger:section,start:"top top",end:"bottom bottom",
      invalidateOnRefresh:true,onUpdate:self=>update(self.progress),
      onRefresh:self=>update(self.progress)
    });
    update(scroll.progress);
    const refresh=()=>{if(alive)ScrollTrigger.refresh()};
    document.fonts?.ready.then(refresh).catch(()=>{});
    return()=>{alive=false;scroll.kill();overlay.style.opacity="";overlay.style.visibility="";overlay.style.pointerEvents="";};
  },[]);

  useEffect(()=>{
    // Hash links target the detail stretch, without creating any second pinned layer.
    if(location.hash==="#details"){
      const node=document.getElementById("details");
      requestAnimationFrame(()=>node?.scrollIntoView({block:"start"}));
    }
  },[]);

  return <section className="aether-journey" ref={sectionRef} aria-label="معرفی سینمایی و جزئیات هدفون">
    <div className="aether-hero journey-sticky" ref={stageRef}>
      <div className="hero-visual">
        <Viewer progress={progressRef} chapter={chapterRef} stageRef={stageRef}
          cardRef={cardRef} dotRef={dotRef} lineRef={lineRef}/>
      </div>
      <div className="journey-hero-overlay" ref={heroOverlayRef}>{children}</div>
      <div className="journey-callout" data-active={current>=0} aria-hidden={current<0}>
        <svg className="journey-lines" aria-hidden="true"><path ref={lineRef}/></svg>
        <span className="journey-anchor" ref={dotRef}/>
        <aside className="journey-detail-card" ref={cardRef} aria-live="polite">
          {current>=0&&<>
            <small>{CHAPTERS[current].eyebrow}</small>
            <h2>{CHAPTERS[current].title}</h2>
            <p>{CHAPTERS[current].description}</p>
            <span className="journey-index">{String(current+1).padStart(2,"0")} <i/> 04</span>
          </>}
        </aside>
      </div>
      <div className="journey-chapter-rail" data-active={current>=0} aria-hidden="true">
        {CHAPTERS.map((item,i)=><span key={item.eyebrow} className={current===i?"active":""}/>)}
      </div>
    </div>
    <span className="journey-deep-link" id="details" aria-hidden="true"/>
  </section>;
}

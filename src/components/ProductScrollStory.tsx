"use client";

import {useEffect,useLayoutEffect,useRef,useState} from "react";
import dynamic from "next/dynamic";
import {gsap} from "gsap";
import type {ReactNode} from "react";

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

/* 0 and 5 show the same complete hero; 1–4 pause on the actual camera shots.
 * Wheel distance never drives the camera directly. A gesture advances ONE step.
 */
const STOPS=[0,.282,.492,.682,.854,1] as const;
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
  const stepRef=useRef(0);
  const movingRef=useRef(false);
  const [current,setCurrent]=useState(-1);

  useLayoutEffect(()=>{
    const section=sectionRef.current,overlay=heroOverlayRef.current;
    if(!section)return;
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    if(!overlay)return;

    let tween:gsap.core.Tween|null=null;
    let wheelRelease:number|undefined;
    let wheelGesture=false;
    let lastWheel=0;
    let coolDown=0;
    let touchStart:{x:number;y:number;blocked:boolean}|null=null;
    let touchUsed=false;
    const paint=(p:number)=>{
      progressRef.current=p;
      // The hero fully returns after chapter 4, as it also does in reverse at stage 0.
      const fade=p<.16?1-smooth((p-.02)/.12):p>.91?smooth((p-.91)/.09):0;
      overlay.style.opacity=String(fade);
      overlay.style.visibility=fade<.005?"hidden":"visible";
      overlay.style.pointerEvents="none";
    };
    const atTop=()=>{
      const rect=section.getBoundingClientRect();
      return rect.top>=-14&&rect.top<=14&&rect.bottom>=window.innerHeight-14;
    };
    const blocked=()=>Boolean(document.querySelector(".overlay-root"))||Boolean(document.querySelector("input:focus,textarea:focus,select:focus"));
    const reveal=(step:number)=>{
      const index=step>=1&&step<=4?step-1:-1;
      chapterRef.current=index;setCurrent(index);
    };
    const advance=(direction:1|-1)=>{
      if(movingRef.current)return;
      const next=Math.max(0,Math.min(5,stepRef.current+direction));
      if(next===stepRef.current)return;
      movingRef.current=true;
      // Callout disappears during the cinematic camera move, then attaches at the resting stop.
      reveal(-1);
      const from=progressRef.current,to=STOPS[next];
      tween?.kill();
      const duration=Math.max(.82,Math.min(1.34,.98+Math.abs(to-from)*.95));
      tween=gsap.to(progressRef,{
        current:to,
        duration,
        ease:"power2.inOut",
        onUpdate:()=>paint(progressRef.current),
        onComplete:()=>{
          progressRef.current=to;
          paint(to);
          stepRef.current=next;
          reveal(next);
          movingRef.current=false;
          coolDown=performance.now()+175;
        }
      });
    };
    const wheel=(event:WheelEvent)=>{
      if(!atTop()||blocked()||event.ctrlKey||event.metaKey||Math.abs(event.deltaY)<.1)return;
      const direction:1|-1=event.deltaY>0?1:-1;
      if((direction===1&&stepRef.current===5&&!movingRef.current)||
         (direction===-1&&stepRef.current===0&&!movingRef.current))return;
      // Native scroll is captured only while there is a chapter to navigate.
      if(event.cancelable)event.preventDefault();
      lastWheel=performance.now();
      if(wheelRelease)window.clearTimeout(wheelRelease);
      wheelRelease=window.setTimeout(()=>{wheelGesture=false;},265);
      if(wheelGesture||movingRef.current||lastWheel<coolDown)return;
      wheelGesture=true;
      advance(direction);
    };
    const touchStartHandler=(event:TouchEvent)=>{
      if(event.touches.length!==1||!atTop()||blocked()){touchStart=null;return;}
      const t=event.touches[0];
      const target=event.target instanceof Element?event.target:null;
      touchStart={x:t.clientX,y:t.clientY,blocked:event.defaultPrevented||Boolean(target?.closest("a,button,[role='button']"))};
      touchUsed=false;
    };
    const touchMoveHandler=(event:TouchEvent)=>{
      if(!touchStart||event.touches.length!==1||!atTop()||blocked())return;
      // The 3D mesh's own GestureGate prevents touchstart when the finger hits it.
      if(touchStart.blocked)return;
      const t=event.touches[0],dx=t.clientX-touchStart.x,dy=t.clientY-touchStart.y;
      if(Math.abs(dy)<28||Math.abs(dy)<Math.abs(dx)*1.1)return;
      const direction:1|-1=dy<0?1:-1;
      if((direction===1&&stepRef.current===5&&!movingRef.current)||
         (direction===-1&&stepRef.current===0&&!movingRef.current))return;
      if(event.cancelable)event.preventDefault();
      if(touchUsed)return;
      touchUsed=true;
      advance(direction);
    };
    const touchEndHandler=()=>{touchStart=null;touchUsed=false};
    const keys=(event:KeyboardEvent)=>{
      if(!atTop()||blocked()||event.altKey||event.ctrlKey||event.metaKey)return;
      const direction:1|-1|0=event.key==="ArrowDown"||event.key==="PageDown"||event.key===" "?1:
        event.key==="ArrowUp"||event.key==="PageUp"?-1:0;
      if(!direction||((direction===1&&stepRef.current===5)||(direction===-1&&stepRef.current===0)))return;
      event.preventDefault();advance(direction);
    };
    paint(0);
    const hash=()=>{if(window.location.hash==="#details"){window.scrollTo({top:0,behavior:"instant"});advance(1);}};
    if(window.location.hash==="#details")requestAnimationFrame(hash);
    window.addEventListener("wheel",wheel,{passive:false});
    window.addEventListener("touchstart",touchStartHandler,{passive:true});
    window.addEventListener("touchmove",touchMoveHandler,{passive:false});
    window.addEventListener("touchend",touchEndHandler);
    window.addEventListener("touchcancel",touchEndHandler);
    window.addEventListener("keydown",keys);
    window.addEventListener("hashchange",hash);
    return()=>{
      tween?.kill();
      if(wheelRelease)window.clearTimeout(wheelRelease);
      window.removeEventListener("wheel",wheel);
      window.removeEventListener("touchstart",touchStartHandler);
      window.removeEventListener("touchmove",touchMoveHandler);
      window.removeEventListener("touchend",touchEndHandler);
      window.removeEventListener("touchcancel",touchEndHandler);
      window.removeEventListener("keydown",keys);
      window.removeEventListener("hashchange",hash);
      overlay.style.opacity="";overlay.style.visibility="";overlay.style.pointerEvents="";
    };
  },[]);

  return <section className="aether-journey" id="details" ref={sectionRef} aria-label="معرفی سینمایی و جزئیات هدفون">
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
  </section>;
}

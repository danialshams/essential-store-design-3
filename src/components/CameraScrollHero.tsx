"use client";

import Image from "next/image";
import Link from "next/link";
import {ArrowDown, ArrowLeft, ArrowUpLeft, Aperture, MoveDownRight} from "lucide-react";
import {useEffect, useRef, useState} from "react";

const base = "/images/camera-story";
const steps = [
  {id:"01", label:"THE ESSENCE",title:"نگاهی تازه به\nدنیای تصویر",description:"یک دوربین. هزاران داستان. سفری سینمایی به آنچه پشت هر تصویر ماندگار پنهان شده است."},
  {id:"02", label:"CRAFTSMANSHIP",title:"دقت، در هر\nمیلی‌متر.",description:"از حلقه‌های تنظیم تا بافت بدنه؛ هر سطح و هر جزئیات با هدفی دقیق طراحی شده است."},
  {id:"03", label:"ENGINEERED TOGETHER",title:"وقتی همه‌چیز\nاز هم جدا می‌شود.",description:"با ادامه اسکرول، لنز، مجموعه عدسی‌ها، حسگر و مدارهای دوربین را جزءبه‌جزء کشف کن."},
  {id:"04", label:"THE INSIDE STORY",title:"درون هر تصویر،\nیک جهان است.",description:"قلب دوربین را از نزدیک ببین؛ جایی که نور وارد می‌شود و به تصویری ماندگار تبدیل می‌شود."},
];

const parts = [
  {id:"lens",label:"لنز",left:38.8,top:34.0,width:13.4,height:30.6,turn:-8},
  {id:"optics",label:"عدسی‌های اپتیکی",left:50.5,top:35.2,width:12.8,height:27.6,turn:12},
  {id:"body",label:"بدنه",left:60.0,top:26.3,width:19.8,height:40.0,turn:-4},
  {id:"sensor",label:"حسگر",left:78.3,top:35.0,width:9.3,height:29.5,turn:6},
  {id:"board",label:"برد الکترونیکی",left:85.6,top:33.3,width:13.7,height:32.8,turn:9},
  {id:"rear",label:"پنل پشتی",left:97.2,top:33.0,width:14.1,height:33.0,turn:-5},
  {id:"grip",label:"دسته",left:110.3,top:34.3,width:9.1,height:31.2,turn:7},
];

/**
 * An actual reversible, scroll-scrubbed hero prototype.  Its photographic keyframes
 * are sourced from the approved storyboard and the mechanical parts are cut into
 * independent transparent WebP layers.  No Blender render or real 3D geometry is
 * claimed; the assets can later be swapped for rendered camera sequences.
 */
export function CameraScrollHero(){
  const container=useRef<HTMLElement|null>(null);
  const [current,setCurrent]=useState(0);
  const [jsReady,setJsReady]=useState(false);

  // Keep the CTA and progress markers synchronized with the scrubbed timeline.
  // Reduced-motion visitors go directly to the static end section.
  const scrollToProgress=(progress:number)=>{
    const stage=container.current;
    if(!stage)return;
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){
      document.getElementById("camera-story-end")?.scrollIntoView({behavior:"auto"});
      return;
    }
    const available=Math.max(0,stage.offsetHeight-window.innerHeight);
    const top=stage.getBoundingClientRect().top+window.scrollY;
    window.scrollTo({top:top+available*Math.max(0,Math.min(1,progress)),behavior:"smooth"});
  };

  useEffect(()=>{
    if(!container.current)return;
    const media=window.matchMedia("(prefers-reduced-motion: reduce)");
    if(media.matches)return;
    let valid=true; let dispose=()=>{};
    void Promise.all([import("gsap"),import("gsap/ScrollTrigger")]).then(([gsapModule,scrollModule])=>{
      const stage=container.current;
      if(!valid||!stage)return;
      const gsap=gsapModule.gsap;
      const ScrollTrigger=scrollModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
      const context=gsap.context(()=>{
        const $=gsap.utils.selector(stage);
        const scene0=$("[data-cs-scene='intro']")[0] as HTMLElement;
        const scene1=$("[data-cs-scene='macro']")[0] as HTMLElement;
        const scene2=$("[data-cs-scene='explode']")[0] as HTMLElement;
        const scene3=$("[data-cs-scene='details']")[0] as HTMLElement;
        const photos=[scene0,scene1,scene2,scene3];
        const copy=Array.from(stage.querySelectorAll<HTMLElement>("[data-cs-copy]"));
        const parts=Array.from(stage.querySelectorAll<HTMLElement>("[data-cs-part]"));
        const callouts=Array.from(stage.querySelectorAll<HTMLElement>("[data-cs-callout]"));
        const progress=$("[data-cs-progress]")[0] as HTMLElement;
        const stageView=$("[data-cs-viewport]")[0] as HTMLElement;
        gsap.set(photos.slice(1),{autoAlpha:0});
        gsap.set(copy.slice(1),{autoAlpha:0,y:20});
        gsap.set(parts,{autoAlpha:0});
        gsap.set(callouts,{autoAlpha:0,y:15});
        gsap.set(progress,{scaleY:0,transformOrigin:"top center"});
        const timeline=gsap.timeline({
          defaults:{ease:"none"},
          scrollTrigger:{trigger:stage,start:"top top",end:"bottom bottom",scrub:0.55,
            invalidateOnRefresh:true,onUpdate:self=>{
              const p=self.progress;
              const next=p<.25?0:p<.49?1:p<.77?2:3;
              setCurrent(last=>last===next?last:next);
            }}
        });
        timeline.to(progress,{scaleY:1,duration:12},0)
          // Sequence 1 - soft camera dolly-in.
          .fromTo(scene0.querySelector("img"),{scale:1.035,xPercent:1},{scale:1.105,xPercent:-1.1,duration:2.7},0)
          .to(scene0,{autoAlpha:0,duration:.65},2.3)
          .fromTo(scene1,{autoAlpha:0},{autoAlpha:1,duration:.66},2.12)
          .to(copy[0],{autoAlpha:0,y:-22,duration:.5},2.25)
          .to(copy[1],{autoAlpha:1,y:0,duration:.56},2.53)
          // Sequence 2 - physical macro lens movement.
          .fromTo(scene1.querySelector("img"),{scale:1.03,xPercent:1},{scale:1.14,xPercent:-2.5,duration:2.6},2.35)
          .to(scene1,{autoAlpha:0,duration:.8},4.8)
          .to(scene2,{autoAlpha:1,duration:.45},4.9)
          .to(copy[1],{autoAlpha:0,y:-20,duration:.45},4.9)
          .to(copy[2],{autoAlpha:1,y:0,duration:.55},5.17);
        // Actual independent photographic parts scatter apart and can reassemble
        // by scrolling upward.  No WebGL/three.js processing is needed.
        parts.forEach((part,i)=>{
          const turn=Number(part.dataset.turn||0);
          timeline.fromTo(part,{
            x:()=>{
              const view=stageView.getBoundingClientRect();const item=part.getBoundingClientRect();
              return view.left+view.width*.69-(item.left+item.width*.5);
            },
            y:()=>{const view=stageView.getBoundingClientRect();const item=part.getBoundingClientRect();return view.top+view.height*.49-(item.top+item.height*.5)},
            rotation:turn,scale:.56,autoAlpha:0,filter:"blur(5px)"
          },{x:0,y:0,rotation:0,scale:1,autoAlpha:1,filter:"blur(0px)",duration:1.75,ease:"power2.out"},5.12+i*.075);
        });
        timeline.to(scene2,{autoAlpha:0,duration:.8},8.13)
          .to(scene3,{autoAlpha:1,duration:.75},8.05)
          .to(copy[2],{autoAlpha:0,y:-20,duration:.45},8.09)
          .to(copy[3],{autoAlpha:1,y:0,duration:.65},8.46)
          .fromTo(scene3.querySelector("img"),{scale:1.075},{scale:1,duration:2.85},8.08);
        callouts.forEach((node,i)=>timeline.to(node,{autoAlpha:1,y:0,duration:.5,ease:"power2.out"},8.9+i*.37));
        timeline.to({}, {duration:.7});
        ScrollTrigger.refresh();
      },stage);
      dispose=()=>context.revert();setJsReady(true);
    }).catch(()=>{/* progressive enhancement: first scene remains visible */});
    return()=>{valid=false;dispose()};
  },[]);

  return <div className="cs-root" dir="ltr">
    <section ref={container} className={`cs-scroll-story ${jsReady?"cs-is-animated":""}`} aria-label="تجربه سینمایی دوربین عکاسی">
      <div className="cs-viewport" data-cs-viewport>
        <div className="cs-grain" aria-hidden="true"/>
        <div className="cs-photo" data-cs-scene="intro" aria-hidden="true"><Image src={`${base}/intro.webp`} alt="" fill priority sizes="100vw" unoptimized/></div>
        <div className="cs-photo" data-cs-scene="macro" aria-hidden="true"><Image src={`${base}/macro.webp`} alt="" fill loading="eager" sizes="100vw" unoptimized/></div>
        <div className="cs-photo cs-explosion-photo" data-cs-scene="explode" aria-hidden="true">
          <div className="cs-explosion-shine"/>
          <div className="cs-explosion-parts">{parts.map(part=><img
            key={part.id} src={`${base}/part-${part.id}.webp`} alt="" data-cs-part data-turn={part.turn}
            style={{left:`${part.left}%`,top:`${part.top}%`,width:`${part.width}%`,height:`${part.height}%`}}
          />)}</div>
          <div className="cs-explosion-floor"/>
        </div>
        <div className="cs-photo" data-cs-scene="details" aria-hidden="true"><Image src={`${base}/details.webp`} alt="" fill loading="eager" sizes="100vw" unoptimized/></div>
        <div className="cs-vignette" aria-hidden="true"/>
        <header className="cs-header" aria-label="ناوبری نمونه دوربین">
          <Link className="cs-identity" href="/" aria-label="بازگشت به صفحه اول"><Aperture size={21} strokeWidth={1.4}/><span>NOIR <b>/</b> OPTICS</span></Link>
          <nav className="cs-nav" aria-label="پیوندهای فروشگاه"><Link href="/products">فروشگاه</Link><Link href="/atelier">کالکشن‌ها</Link><Link href="/info/about">درباره برند</Link></nav>
          <Link className="cs-header-cta" href="/products">مشاهده محصولات <ArrowUpLeft size={17}/></Link>
        </header>
        <div className="cs-serial" aria-hidden="true"><span>PROJECT / 001</span><span>IMMERSIVE PRODUCT STUDY</span></div>
        <div className="cs-content-stack" dir="rtl">
          {steps.map((step,i)=><div className="cs-copy" data-cs-copy key={step.id}>
            <div className="cs-eyebrow"><span>{step.id}</span><i/><b>{step.label}</b></div>
            <h1 className={i===0?"cs-main-title":"cs-title"}>{step.title.split("\n").map((line,j)=><span key={j}>{line}</span>)}</h1>
            <p>{step.description}</p>
            {i===0&&<div className="cs-intro-actions"><button type="button" onClick={()=>scrollToProgress(.64)} className="cs-gold-button">کشف اجزای دوربین <ArrowDown size={17}/></button><span>SCROLL TO EXPLORE</span></div>}
            {i===2&&<div className="cs-part-legend"><span>01 / لنز</span><span>02 / حسگر</span><span>03 / پردازشگر</span></div>}
            {i===3&&<Link className="cs-gold-button" href="/products">ورود به فروشگاه <ArrowLeft size={17}/></Link>}
          </div>)}
        </div>
        <div className="cs-callouts" aria-hidden="true">
          <div className="cs-callout cs-callout-sensor" data-cs-callout><i/><strong>01 / حسگر تصویر</strong><span>تبدیل دقیق نور به داده‌های تصویری</span></div>
          <div className="cs-callout cs-callout-lens" data-cs-callout><i/><strong>02 / سامانه اپتیکی</strong><span>کنترل وضوح، کنتراست و عمق میدان</span></div>
        </div>
        <div className="cs-side-steps" aria-label="مرحله نمایش">
          {steps.map((step,i)=><button key={step.id} type="button" className={current===i?"is-current":""} aria-label={`رفتن به مرحله ${step.id}`} aria-current={current===i?"step":undefined} onClick={()=>scrollToProgress([.025,.35,.64,.94][i])}><span/><em>{step.id}</em></button>)}
          <div className="cs-steps-track"><span data-cs-progress/></div>
        </div>
        <div className="cs-bottom" dir="ltr"><span>DESIGNED TO BE DISCOVERED</span><div><span className="cs-scroll-indicator"/> SCROLL TO EXPLORE</div><span>NOIR OPTICS © 2026</span></div>
      </div>
    </section>
    <section className="cs-end" id="camera-story-end" dir="rtl">
      <span>ANATOMY OF AN IMAGE / END OF STUDY</span>
      <h2>فقط یک دوربین نیست.<br/><em>دنیایی از جزئیات است.</em></h2>
      <p>این یک نمونه اجرایی از روایت محصول با اسکرول است. حرکت لایه‌های تصویری، تغییر نما و معرفی قطعات به موقعیت اسکرول وابسته‌اند؛ برای خروجی نهایی Blender باید فریم‌های رندرشده جایگزین شوند.</p>
      <div><Link href="/products">مشاهده محصولات <ArrowUpLeft size={18}/></Link><Link href="/atelier">نمایش نسخه قبلی فروشگاه <MoveDownRight size={18}/></Link></div>
    </section>
  </div>;
}

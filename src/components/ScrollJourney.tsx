"use client";
import {useEffect,useRef,useState} from "react";
import {flushSync,createPortal} from "react-dom";
import dynamic from "next/dynamic";
import {ArrowDownLeft,ArrowUpLeft,ChevronDown,Expand,RotateCcw,X,MousePointer2} from "lucide-react";
import type {Finish} from "./HeadphoneStage";

const Stage=dynamic(()=>import("./HeadphoneStage"),{ssr:false,loading:()=> <div className="journey-model-loading"><span className="journey-load-ring"/><span>در حال آماده‌سازی تجربه سه‌بعدی</span></div>});
const Inspector=dynamic(()=>import("./HeadphoneStage").then(m=>m.HeadphoneInspector),{ssr:false,loading:()=> <div className="journey-model-loading">در حال آماده‌سازی نمای ۳۶۰ درجه</div>});

const SCENES=[
 {code:"01",label:"REVEAL / THE OBJECT",eyebrow:"THE ART OF LISTENING",title:"زیبایی،",sub:"در خالص‌ترین شکل.",detail:"یک هدفون با طراحی مهندسی‌شده؛ ساخته‌شده برای دیده شدن از هر زاویه.",callout:"نمای کلی محصول"},
 {code:"02",label:"EXPLODED / DESIGN",eyebrow:"ENGINEERED TO OPEN",title:"وقتی جزئیات",sub:"آشکار می‌شوند.",detail:"بدنه، محفظه صوتی و بالشتک از هم فاصله می‌گیرند تا ساختار محصول را دقیق‌تر ببینی.",callout:"نمای انفجاری قطعات"},
 {code:"03",label:"TEXTILE / COMFORT",eyebrow:"FEEL THE MATERIAL",title:"نرمی‌ای که",sub:"قابل دیدن است.",detail:"دوربین از پشت و کنار به بالشتک نزدیک می‌شود؛ فرم فوم و بافت پارچه را کشف کن.",callout:"زوم روی بالشتک"},
 {code:"04",label:"PRECISION / HINGE",eyebrow:"MOVEMENT IN DETAIL",title:"دقت، در",sub:"کوچک‌ترین اتصال.",detail:"مسیر دوربین از بالشتک جدا می‌شود، بالا می‌رود و روی لولا و بازوی تلسکوپی تمرکز می‌کند.",callout:"کلوزآپ لولا"},
 {code:"05",label:"ACOUSTIC / ENGINEERING",eyebrow:"INSIDE THE SOUND",title:"آن سوی",sub:"سطح فلز.",detail:"دوربین به درایور و شبکه داخلی نزدیک می‌شود؛ ساختار آکوستیک به‌صورت باز نمایش داده می‌شود.",callout:"جزئیات داخلی"},
 {code:"06",label:"REASSEMBLE / FINISH",eyebrow:"MADE TO COME TOGETHER",title:"همه‌چیز",sub:"به جای خودش برمی‌گردد.",detail:"قطعات آرام مونتاژ می‌شوند و دوربین برای نمایش محصول کامل عقب می‌رود.",callout:"بازگشت به محصول"}
] as const;
const STARTS=[0,.16,.34,.53,.70,.85] as const;
function which(p:number){let n=0;for(let i=1;i<STARTS.length;i++)if(p>=STARTS[i])n=i;return n;}

export function ScrollJourney({finish}:{finish:Finish}){
 const section=useRef<HTMLElement>(null),progress=useRef(0),chapter=useRef(0);
 const [active,setActive]=useState(0),[visible,setVisible]=useState(true);
 const [mobile,setMobile]=useState(false),[reduced,setReduced]=useState(false),[inspect,setInspect]=useState(false);
 useEffect(()=>{
   const media=matchMedia("(max-width: 760px)");
   const motion=matchMedia("(prefers-reduced-motion: reduce)");
   const update=()=>{setMobile(media.matches);setReduced(motion.matches)};
   update();media.addEventListener("change",update);motion.addEventListener("change",update);
   return()=>{media.removeEventListener("change",update);motion.removeEventListener("change",update)};
 },[]);
 useEffect(()=>{
  const element=section.current;if(!element)return;
  const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{rootMargin:"200px"});
  observer.observe(element);return()=>observer.disconnect();
 },[]);
 useEffect(()=>{
   const element=section.current;if(!element)return;
   const update=()=>{
     const rect=element.getBoundingClientRect();
     const distance=Math.max(1,element.offsetHeight-document.documentElement.clientHeight);
     const p=reduced?0:Math.min(1,Math.max(0,-rect.top/distance));
     progress.current=p;
     element.style.setProperty("--journey-progress",String(p));
     const n=which(p);
     if(n!==chapter.current){chapter.current=n;flushSync(()=>setActive(n))}
   };
   update();
   window.addEventListener("scroll",update,{passive:true});
   window.addEventListener("resize",update,{passive:true});
   return()=>{window.removeEventListener("scroll",update);window.removeEventListener("resize",update)};
 },[reduced]);
 useEffect(()=>{
  if(!inspect)return;
  const previous=document.body.style.overflow;
  document.body.style.overflow="hidden";
  const escape=(e:KeyboardEvent)=>{if(e.key==="Escape")setInspect(false)};
  window.addEventListener("keydown",escape);
  return()=>{document.body.style.overflow=previous;window.removeEventListener("keydown",escape)};
 },[inspect]);
 const go=(p:number)=>{
  if(!section.current)return;
  const rect=section.current.getBoundingClientRect();
  const start=rect.top+window.scrollY;
  const travel=section.current.offsetHeight-document.documentElement.clientHeight;
  window.scrollTo({top:start+travel*p,behavior:reduced?"instant":"smooth"});
 };
 return <section ref={section} className="journey" id="product-journey" aria-label="تجربه سینمایی شش‌مرحله‌ای محصول">
  <div className="journey-sticky">
   <div className="journey-backdrop" aria-hidden="true"><div className="journey-grid"/><div className="journey-glow"/><div className="journey-orbit"/></div>
   <div className="journey-render"><Stage finish={finish} progress={progress} visible={visible&&!inspect} mobile={mobile}/></div>
   <div className="journey-topline" aria-hidden="true"><span><i/> AETHER ONE / SPATIAL EXPERIENCE</span><span>SCROLL-DRIVEN / SIX ACTS</span></div>
   <div className="journey-content">
    {SCENES.map((s,i)=><div key={s.code} className={"journey-scene"+(active===i?" is-active":"")} aria-hidden={active!==i}>
      <div className="journey-kicker"><span className="journey-kicker-line"/>{s.eyebrow}</div>
      <h1>{s.title}<span>{s.sub}</span></h1>
      <p>{s.detail}</p>
      <span className="journey-chapter-detail"><i/> {s.callout}</span>
      {i===0&&<button className="journey-cta" onClick={()=>go(.21)} tabIndex={active===i?0:-1}>کشف جزئیات <ArrowDownLeft size={19}/></button>}
      {i===5&&<div className="journey-buttons"><button className="journey-cta" onClick={()=>document.querySelector("#materials")?.scrollIntoView({behavior:"smooth"})} tabIndex={active===i?0:-1}>انتخاب متریال <ArrowUpLeft size={18}/></button></div>}
    </div>)}
   </div>
   <div className="journey-details" aria-hidden="true"><span className="journey-dot"><i/></span><div><strong>REAL-TIME 3D</strong><small>CAMERA / MATERIAL / FORM</small></div></div>
   <button className="orbit-launch" type="button" onClick={()=>setInspect(true)} aria-label="باز کردن چرخش آزاد هدفون با امکان زوم">
     <RotateCcw size={17}/><span>چرخش آزاد ۳۶۰°</span><Expand size={14}/>
   </button>
   <nav className="journey-rail" aria-label="مراحل تجربه">
     <span className="journey-rail-num">{SCENES[active].code} <em>/ 06</em></span>
     <div className="journey-rail-list">{SCENES.map((s,i)=><button key={s.code} className={active===i?"active":""} aria-label={"برو به صحنه "+s.code+" — "+s.callout} aria-current={active===i?"step":undefined} onClick={()=>go(STARTS[i]+.015)}><span/></button>)}</div>
     <span className="journey-rail-caption">{SCENES[active].label}</span>
   </nav>
   <div className="journey-footer">
    <span className="journey-footer-mark">AETHER / EDITION 03</span>
    <span className="journey-progress"><span style={{transform:"scaleX(var(--journey-progress))"}}/></span>
    <button onClick={()=>go(Math.min(.99,STARTS[Math.min(active+1,5)]+.02))} type="button">{active===5?"پایان تجربه":"اسکرول برای صحنه بعد"} <ChevronDown size={17}/></button>
   </div>
  </div>
  {inspect&&createPortal(<div className="inspector-overlay" role="dialog" aria-modal="true" aria-label="نمای چرخش ۳۶۰ درجه هدفون" onPointerDown={e=>{if(e.target===e.currentTarget)setInspect(false)}}>
    <div className="inspector-panel">
      <div className="inspector-topbar"><span>OBJECT VIEWER / 360°</span><button onClick={()=>setInspect(false)} aria-label="بستن نمایش سه‌بعدی"><X size={22}/></button></div>
      <div className="inspector-stage"><Inspector finish={finish}/></div>
      <div className="inspector-bottom"><span><MousePointer2 size={17}/> با انگشت یا ماوس بچرخانید؛ برای زوم دو انگشت یا اسکرول</span><button onClick={()=>setInspect(false)}>بازگشت به اسکرول <ArrowUpLeft size={16}/></button></div>
    </div>
  </div>,document.body)}
 </section>;
}

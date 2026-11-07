"use client";
import {useEffect,useRef,useState} from "react";
import dynamic from "next/dynamic";
import {ArrowDownLeft,ArrowUpLeft,ChevronDown,MoveDown} from "lucide-react";
import type {Finish} from "./HeadphoneStage";
const Stage=dynamic(()=>import("./HeadphoneStage"),{ssr:false,loading:()=> <div className="journey-model-loading"><span className="journey-load-ring"/><span>در حال آماده‌سازی مدل سه‌بعدی</span></div>});
const SCENES=[
 {index:"01",label:"INTRO / THE FORM",kicker:"INTRODUCING AETHER / ONE",title:"صدایی که",second:"می‌توان دید.",body:"حاصل برخورد مهندسی دقیق و متریال واقعی. یک تجربه سه‌بعدی زنده، نه ویدیوی از پیش ساخته‌شده."},
 {index:"02",label:"MACRO / THE MATERIAL",kicker:"MATERIALS MATTER",title:"جزئیات،",second:"از نزدیک.",body:"انحنای لبه‌ها، بالشتک نرم، اتصال فلزی و پرداخت سطح؛ دوربین هم‌زمان با اسکرول تو به محصول نزدیک می‌شود."},
 {index:"03",label:"EXPLORE / THE ENGINEERING",kicker:"INSIDE THE OBJECT",title:"آنچه زیر",second:"سطح پنهان است.",body:"قطعات واقعی صحنه از یکدیگر فاصله می‌گیرند. مسیر هر قطعه با اسکرول قابل برگشت است."},
 {index:"04",label:"REUNITE / THE OBJECT",kicker:"CRAFTED AS ONE",title:"تمام جزئیات،",second:"یک تجربه.",body:"بازگشت قطعات به جای خود. محصول را در سه پرداخت مختلف ببین و با متریال‌های آن آشنا شو."}
] as const;

export function ScrollJourney({finish}:{finish:Finish}){
 const root=useRef<HTMLElement>(null);
 const current=useRef(0);
 const progress=useRef(0);
 const queued=useRef(false);
 const [scene,setScene]=useState(0);
 const [visible,setVisible]=useState(true);
 const [reduce,setReduce]=useState(false);
 useEffect(()=>{
   const media=window.matchMedia("(prefers-reduced-motion: reduce)");
   const onChange=()=>setReduce(media.matches);onChange();
   media.addEventListener("change",onChange);
   return()=>media.removeEventListener("change",onChange);
 },[]);
 useEffect(()=>{
   const target=root.current;if(!target)return;
   const obs=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{rootMargin:"240px 0px"});
   obs.observe(target);
   return()=>obs.disconnect();
 },[]);
 useEffect(()=>{
   const update=()=>{
     queued.current=false;
     if(!root.current)return;
     const rect=root.current.getBoundingClientRect();
     const travel=Math.max(1,rect.height-window.innerHeight);
     const next=reduce?0:Math.max(0,Math.min(1,-rect.top/travel));
     progress.current=next;
     const n=next<.23?0:next<.44?1:next<.78?2:3;
     if(current.current!==n){current.current=n;setScene(n)}
     root.current.style.setProperty("--journey-progress",String(next));
   };
   const tick=()=>{if(queued.current)return;queued.current=true;requestAnimationFrame(update)};
   tick();window.addEventListener("scroll",tick,{passive:true});window.addEventListener("resize",tick,{passive:true});
   return()=>{window.removeEventListener("scroll",tick);window.removeEventListener("resize",tick)};
 },[reduce]);
 const travelTo=(n:number)=>{
   const r=root.current;if(!r)return;
   const top=window.scrollY+r.getBoundingClientRect().top;
   window.scrollTo({top:top+(r.offsetHeight-window.innerHeight)*n,behavior:"smooth"});
 };
 return <section ref={root} className="journey" id="top" aria-label="معرفی سینمایی محصول با اسکرول سه‌بعدی">
   <div className="journey-sticky">
     <div className="journey-backdrop" aria-hidden="true"><div className="journey-grid"/><div className="journey-glow"/><div className="journey-orbit"/></div>
     <div className="journey-render"><Stage finish={finish} progress={progress} visible={visible}/></div>
     <div className="journey-topline" aria-hidden="true"><span><i/> A NEW DIMENSION OF SOUND</span><span>PRECISION / SPATIAL / DESIGN</span></div>
     <div className="journey-content" aria-live="off">
      {SCENES.map((s,i)=><div key={s.index} className={"journey-scene"+(scene===i?" is-active":"")} aria-hidden={scene!==i}>
        <div className="journey-kicker"><span className="journey-kicker-line"/>{s.kicker}</div>
        <h1>{s.title}<span>{s.second}</span></h1>
        <p>{s.body}</p>
        {i===0&&<button className="journey-cta" onClick={()=>travelTo(.27)} tabIndex={scene===i?0:-1}>شروع تجربه <ArrowDownLeft size={18}/></button>}
        {i===3&&<div className="journey-buttons">
          <button className="journey-cta" onClick={()=>document.querySelector("#materials")?.scrollIntoView({behavior:"smooth"})} tabIndex={scene===i?0:-1}>انتخاب متریال <ArrowUpLeft size={18}/></button>
          <button className="journey-text-link" onClick={()=>document.querySelector("#experience")?.scrollIntoView({behavior:"smooth"})} tabIndex={scene===i?0:-1}>کشف بیشتر</button>
        </div>}
      </div>)}
     </div>
     <div className="journey-details" aria-hidden="true">
       <span className="journey-dot"><i/></span><div><strong>REAL-TIME 3D</strong><small>SCROLL TO EXPLORE</small></div>
     </div>
     <div className="journey-rail" aria-label="مراحل تجربه سه‌بعدی">
       <span className="journey-rail-num">{SCENES[scene].index} <em>/ 04</em></span>
       <div className="journey-rail-list">{SCENES.map((s,i)=><button key={s.index} className={scene===i?"active":""} aria-label={"نمایش صحنه "+s.index+" — "+s.label} aria-current={scene===i?"step":undefined} onClick={()=>travelTo([0,.32,.63,.91][i])}><span/></button>)}</div>
       <span className="journey-rail-caption">{SCENES[scene].label}</span>
     </div>
     <div className="journey-footer">
       <span className="journey-footer-mark">AETHER / ONE — EDITION 03</span>
       <span className="journey-progress"><span style={{transform:"scaleX(var(--journey-progress))"}}/></span>
       <button onClick={()=>travelTo(Math.min(1,[.27,.5,.81,1][scene]))} aria-label="رفتن به مرحله بعد">اسکرول برای کشف محصول <ChevronDown size={16}/></button>
     </div>
   </div>
 </section>;
}


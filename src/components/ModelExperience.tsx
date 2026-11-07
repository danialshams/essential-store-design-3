"use client";
import {useEffect,useRef,useState} from "react";
import dynamic from "next/dynamic";
import {RotateCcw,ArrowDown,ArrowUp,MousePointer2,X,Scan,MoveUpRight} from "lucide-react";
import {CHAPTERS} from "./ModelStage";

const ModelStage=dynamic(()=>import("./ModelStage"),{ssr:false,loading:()=> <div className="model-loading"><span className="model-loading-circle"/><span>در حال بارگذاری مدل سه‌بعدی...</span></div>});
const MARKS=[0,.175,.35,.53,.71,.865] as const;
export default function ModelExperience(){
 const section=useRef<HTMLElement>(null);
 const progress=useRef(0);
 const prevChapter=useRef(0);
 const [chapter,setChapter]=useState(0);
 const [free,setFree]=useState(false);
 const [mobile,setMobile]=useState(false);
 const [reduce,setReduce]=useState(false);
 const [ready,setReady]=useState(false);
 useEffect(()=>{
  const mm=matchMedia("(max-width: 760px)"),rm=matchMedia("(prefers-reduced-motion: reduce)");
  const update=()=>{setMobile(mm.matches);setReduce(rm.matches)};
  update();mm.addEventListener("change",update);rm.addEventListener("change",update);
  return()=>{mm.removeEventListener("change",update);rm.removeEventListener("change",update)};
 },[]);
 useEffect(()=>{
   const el=section.current;if(!el)return;
   const update=()=>{
    const rect=el.getBoundingClientRect();
    const length=Math.max(1,el.offsetHeight-document.documentElement.clientHeight);
    const next=reduce?0:Math.max(0,Math.min(1,-rect.top/length));
    progress.current=next;
    el.style.setProperty("--progress",next.toString());
    let num=0;for(let i=1;i<MARKS.length;i++)if(next>=MARKS[i])num=i;
    if(num!==prevChapter.current){prevChapter.current=num;setChapter(num)}
   };
   update();
   window.addEventListener("scroll",update,{passive:true});
   window.addEventListener("resize",update,{passive:true});
   return()=>{window.removeEventListener("scroll",update);window.removeEventListener("resize",update)};
 },[reduce]);
 useEffect(()=>{
  if(!free)return;
  const old=document.body.style.overflow;document.body.style.overflow="hidden";
  const key=(e:KeyboardEvent)=>{if(e.key==="Escape")setFree(false)};
  window.addEventListener("keydown",key);
  return()=>{document.body.style.overflow=old;window.removeEventListener("keydown",key)};
 },[free]);
 const go=(n:number)=>{
  const el=section.current;if(!el)return;
  const p=MARKS[Math.max(0,Math.min(MARKS.length-1,n))];
  const start=window.scrollY+el.getBoundingClientRect().top;
  window.scrollTo({top:start+(el.offsetHeight-document.documentElement.clientHeight)*(p+.015),behavior:reduce?"instant":"smooth"});
 };
 return <main className={"model-site"+(free?" model-site-free":"")}>
  <section ref={section} className="model-scroll" id="top" aria-label="نمایش اختصاصی مدل هدفون و معرفی قطعات">
   <div className="model-fixed">
     <div className="model-atmosphere" aria-hidden="true"><span className="model-arc"/></div>
     <div className="model-three" aria-label="مدل سه‌بعدی هدفون">
       <ModelStage progress={progress} free={free} mobile={mobile} reduce={reduce}/>
     </div>
     <div className="model-overline"><span>OBJECT / 001</span><span>STUDIO MODEL — CONCEPT</span></div>
     <div className="model-text" aria-live="polite">
       {CHAPTERS.map((s,i)=><div key={s.id} aria-hidden={chapter!==i} className={"model-copy"+(chapter===i?" selected":"")}>
        <small>{s.eyebrow} <span>— {s.id}/06</span></small>
        <h1>{s.title}</h1>
        <p>{s.description}</p>
       </div>)}
     </div>
     <button className={"model-orbit-toggle"+(free?" active":"")} onClick={()=>setFree(v=>!v)} aria-expanded={free} aria-label={free?"بستن حالت چرخش آزاد":"فعال کردن چرخش آزاد ۳۶۰ درجه"}>
       {free?<X size={18}/>:<RotateCcw size={18}/>} <span>{free?"بازگشت به اسکرول":"چرخش آزاد ۳۶۰°"}</span>
     </button>
     {free&&<div className="orbit-tips"><MousePointer2 size={16}/><span>با ماوس یا انگشت بچرخانید؛ برای زوم، اسکرول یا دو انگشت</span></div>}
     <div className="model-steps" aria-label="انتخاب بخش محصول">
       {CHAPTERS.map((s,i)=><button key={s.id} className={chapter===i?"active":""} disabled={free} onClick={()=>go(i)} aria-current={chapter===i?"step":undefined} aria-label={"برو به بخش "+s.title}><span className="model-step-track"/><small>{s.id}</small></button>)}
     </div>
     <div className="model-bottom">
       <span>MODEL VIEWER · REAL-TIME 3D</span>
       <div className="model-scroll-line"><span style={{transform:"scaleX(var(--progress))"}}/></div>
       <button onClick={()=>{if(!free)go(Math.min(chapter+1,5));else setFree(false)}}>{free?"بستن چرخش":chapter===5?"بازگشت به شروع":"اسکرول برای کشف جزئیات"} {chapter===5&&!free?<ArrowUp size={15}/>:<ArrowDown size={15}/>}</button>
     </div>
   </div>
  </section>
 </main>;
}


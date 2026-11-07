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
 {index:"04",label:"REUNITE / THE OBJECT",kicker:"CRAFTED AS ONE",title:"تمام جزئیات،",second:"یک تجربه."���q�^
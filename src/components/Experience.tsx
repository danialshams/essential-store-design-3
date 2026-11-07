"use client";
import {useEffect,useMemo,useState} from "react";
import {ScrollJourney} from "./ScrollJourney";
import {ArrowDownLeft,ArrowLeft,ArrowUpLeft,ArrowUpRight,Check,ChevronLeft,Headphones,Menu,Minus,Plus,Search,ShoppingBag,SlidersHorizontal,Volume2,X} from "lucide-react";
import type {Finish} from "./HeadphoneStage";
const finishes:{id:Finish,label:string,hex:string,description:string}[]=[
 {id:"titanium",label:"تیتانیوم",hex:"#b8c5d1",description:"نقره‌ای برس‌خورده"},
 {id:"onyx",label:"اونیکس",hex:"#343b4a",description:"گرافیت مات"},
 {id:"frost",label:"آبی یخی",hex:"#8baabd",description:"آبی متالیک"}
];
const money=(n:number)=>new Intl.NumberFormat("fa-IR").format(n)+" تومان";
const menuLinks=[{label:"خانه",href:"#top",num:"01"},{label:"تجربه محصول",href:"#experience",num:"02"},{label:"متریال‌ها",href:"#materials",num:"03"},{label:"فلسفه طراحی",href:"#studio",num:"04"}];
const formatIndex=(n:number)=>String(n).padStart(2,"0");
export function Experience(){
 const [finish,setFinish]=useState<Finish>("titanium");
 const [menuOpen,setMenuOpen]=useState(false);
 const [searchOpen,setSearchOpen]=useState(false);
 const [cartOpen,setCartOpen]=useState(false);
 const [quantity,setQuantity]=useState(0);
 const [scrolled,setScrolled]=useState(false);
 const [search,setSearch]=useState("");
 const [notice,setNotice]=useState("");
 const selected=finishes.find(v=>v.id===finish)!;
 ���q�^
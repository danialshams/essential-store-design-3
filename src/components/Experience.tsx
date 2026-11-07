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
 useEffect(()=>{
   const handler=()=>setScrolled(window.scrollY>32);
   handler();window.addEventListener("scroll",handler,{passive:true});
   return()=>window.removeEventListener("scroll",handler);
 },[]);
 useEffect(()=>{
   document.body.style.overflow=menuOpen||cartOpen||searchOpen?"hidden":"";
   const onEscape=(e:KeyboardEvent)=>{if(e.key==="Escape"){setMenuOpen(false);setCartOpen(false);setSearchOpen(false)}};
   window.addEventListener("keydown",onEscape);
   return()=>{document.body.style.overflow="";window.removeEventListener("keydown",onEscape)};
 },[menuOpen,cartOpen,searchOpen]);
 useEffect(()=>{if(!notice)return;const i=window.setTimeout(()=>setNotice(""),2500);return()=>window.clearTimeout(i)},[notice]);
 const searchMatches=useMemo(()=>["هدفون Aether One","تیتانیوم","گرافیت","متریال","تجربه سه‌بعدی"].filter(t=>!search.trim()||t.includes(search.trim())),[search]);
 const jump=(href:string)=>{setMenuOpen(false);setSearchOpen(false);setCartOpen(false);window.setTimeout(()=>document.querySelector(href)?.scrollIntoView({behavior:"smooth"}),50)};
 function addItem(){setQuantity(q=>q+1);setCartOpen(true);setNotice("به سبد نمایشی اضافه شد")}
 return <div className="site-shell" id="top">
   <a className="skip-link" href="#main">رفتن به محتوا</a>
   <div className="ambient-track" aria-hidden="true"/>
   <header className={"header-wrap"+(scrolled?" header-scrolled":"")}>
     <div className="header-content">
       <div className="header-group header-start">
         <button className="icon-button menu-button" type="button" aria-label="باز کردن منو" onClick={()=>setMenuOpen(true)}><Menu size={19} strokeWidth={1.6}/><span>منو</span></button>
         <span className="header-edition">EDITION / 03</span>
       </div>
       <a href="#top" onClick={e=>{e.preventDefault();jump("#top")}} className="brand" aria-label="Aether home">
         <span className="brand-symbol">A<span className="brand-dot">.</span></span>
         <span className="brand-title">AETHER<small>SPATIAL OBJECTS</small></span>
       </a>
       <div className="header-group header-end">
         <button className="icon-button" type="button" aria-label="جستجو" onClick={()=>setSearchOpen(true)}><Search size={18} strokeWidth={1.7}/></button>
         <button className="icon-button bag-button" type="button" aria-label="سبد خرید" onClick={()=>setCartOpen(true)}><ShoppingBag size={18} strokeWidth={1.7}/>{quantity>0&&<span className="bag-count">{quantity}</span>}</button>
         <button className="header-discover" onClick={()=>jump("#experience")}>کشف مجموعه <ArrowUpLeft size={16}/></button>
       </div>
     </div>
   </header>
   <main id="main">
     <ScrollJourney finish={finish}/>
     <section id="experience" className="experience-section" aria-labelledby="exp-title">
       <div className="section-container">
         <div className="section-eyebrow"><span>01 / THE EXPERIENCE</span><span>تجربه‌ای فراتر از محصول</span></div>
         <div className="experience-header"><h2 id="exp-title">هر منحنی،<br/><span>یک تصمیم دقیق.</span></h2><p>جزئیاتی که فقط دیده نمی‌شوند؛ احساس می‌شوند. یک زبان طراحی مبتنی بر سکوت، دقت و تعادل.</p></div>
         <div className="feature-grid">
           <article className="feature-large"><div className="feature-cross" aria-hidden="true">+ &nbsp; + &nbsp; + &nbsp; +</div><div className="feature-visual" aria-hidden="true"><div className="precision-ring"><div className="precision-inner"/><div className="precision-core"/></div></div><div className="feature-bottom"><div><span className="mini-label">01 — MATERIAL STUDY</span><h3>متریال، در دقیق‌ترین شکل</h3><p>سطوح فلزی برس‌خورده، بافت‌های نرم و بازتاب کنترل‌شده نور.</p></div><span className="feature-arrow"><ArrowUpLeft size={21}/></span></div></article>
           <article className="feature-small"><div className="feature-small-sheen" aria-hidden="true"/><span className="mini-label">02 — SPATIAL DESIGN</span><div className="feature-small-center"><span>360<sup>°</sup></span><span>FULLY INTERACTIVE</span></div><div className="feature-bottom"><div><h3>دیدن از هر زاویه</h3><p>مدل زنده سه‌بعدی، نه یک ویدیوی ازپیش‌رندرشده.</p></div><span className="feature-arrow"><ArrowUpLeft size={21}/></span></div></article>
           <article className="feature-slim"><span className="mini-label">03 — FUNCTION IN FORM</span><div className="slim-signal" aria-hidden="true"><i/><i/><i/><i/><i/><i/><i/><i/><i/></div><h3>تکنولوژی، بدون اغراق.</h3><p>حرکت‌های محدود، هدفمند و هماهنگ با عملکرد واقعی.</p></article>
         </div>
       </div>
     </section>
     <section className="materials-section" id="materials" aria-labelledby="materials-title">
       <div className="section-container materials-layout">
         <div className="materials-title">
           <div className="section-eyebrow dark"><span>02 / FINISHES</span><span>انتخاب با شماست</span></div>
           <h2 id="materials-title">شخصیت محصول،<br/><em>به انتخاب تو.</em></h2>
           <p>سه پرداخت متفاوت روی یک فرم یکپارچه. رنگ را انتخاب کن و تغییر متریال را روی مدل سه‌بعدی بالا ببین.</p>
           <div className="finish-picker" role="group" aria-label="انتخاب رنگ محصول">
             {finishes.map((v,i)=><button key={v.id} type="button" className={"finish-choice"+(finish===v.id?" selected":"")} onClick={()=>{setFinish(v.id);setNotice(v.label+" انتخاب شد")}} aria-pressed={finish===v.id}>
               <span className="finish-swatch" style={{background:v.hex}}/><span className="finish-details"><strong>{v.label}</strong><small>{v.description}</small></span>{finish===v.id?<Check size={18}/>:<span className="finish-num">{formatIndex(i+1)}</span>}
             </button>)}
           </div>
         </div>
         <div className="materials-product">
           <div className="materials-object" aria-hidden="true"><div className="object-halo"/><div className="metal-disc" style={{["--disc-color" as string]:selected.hex}}><div className="disc-inner"><span>A</span></div></div><span className="engraved">AETHER · SERIES 01</span></div>
           <div className="materials-product-footer"><div><span>SELECTED FINISH</span><strong>{selected.label}</strong></div><span>03 / 03</span></div>
         </div>
       </div>
     </section>
     <section className="product-section" id="studio">
       <div className="section-container product-layout">
         <div className="product-copy"><span className="eyebrow">03 / MADE TO FEEL DIFFERENT</span><h2>آینده،<br/>در جزئیات است.</h2><p>این مجموعه، یک نمونه نمایشی از فروشگاه پرمیوم شماره ۳ است؛ با نمایش واقعی سه‌بعدی و اجزای قابل تعامل، بدون ویدیوی آماده یا قالب پولی.</p><div className="product-specs"><div><span>01</span><strong>Real-time WebGL</strong></div><div><span>02</span><strong>Responsive by design</strong></div><div><span>03</span><strong>Motion with purpose</strong></div></div></div>
         <div className="buy-panel"><div className="buy-panel-top"><span>PRODUCT STUDY 001</span><span className="stock-marker"><i/> DEMO / INTERACTIVE</span></div><div className="buy-glyph" aria-hidden="true"><span>A</span></div><h3>AETHER ONE</h3><p>هدفون دورگوشی — نسخه مفهومی</p><div className="buy-separator"/><div className="buy-row"><span>پرداخت انتخاب‌شده</span><strong>{selected.label}</strong></div><div className="buy-row"><span>قیمت نمایشی</span><strong>{money(14900000)}</strong></div><button className="metal-button wide" onClick={addItem}>افزودن به سبد آزمایشی <Plus size={19}/></button><small className="demo-disclaimer">این یک دموی طراحی است؛ پرداخت و سفارش واقعی انجام نمی‌شود.</small></div>
       </div>
     </section>
   </main>
   <footer className="footer"><div className="section-container footer-top"><span className="footer-mark">A<span>.</span></span><div><strong>Designed to feel different.</strong><p>EDITION 03 / IMMERSIVE COMMERCE EXPERIENCE</p></div><button onClick={()=>jump("#top")} className="top-button">بازگشت به بالا <ArrowUpRight size={17}/></button></div><div className="section-container footer-bottom"><span>© 2026 AETHER. DESIGN CONCEPT.</span><span>ساخته‌شده با Next.js و سه‌بعدی زنده</span></div></footer>
   <div className={"nav-overlay"+(menuOpen?" open":"")} aria-hidden={!menuOpen}>
     <div className="nav-overlay-top"><span>EXPLORE / AETHER</span><button className="icon-button" type="button" onClick={()=>setMenuOpen(false)} aria-label="بستن منو"><X size={25}/></button></div>
     <div className="nav-overlay-center"><div className="nav-overlay-label">THE MENU / 2026</div>{menuLinks.map(item=><a href={item.href} key={item.href} onClick={e=>{e.preventDefault();jump(item.href)}} tabIndex={menuOpen?0:-1}><small>{item.num}</small>{item.label}<ArrowUpLeft size={23}/></a>)}</div>
     <div className="nav-overlay-bottom"><span>AETHER / EDITION 03</span><span>یک تجربه فراتر از فروشگاه</span></div>
   </div>
   <div className={"backdrop"+(cartOpen?" active":"")} onClick={()=>setCartOpen(false)} aria-hidden="true"/>
   <aside className={"cart-drawer"+(cartOpen?" open":"")} role="dialog" aria-modal={cartOpen} aria-label="سبد خرید نمایشی" aria-hidden={!cartOpen}>
     <div className="drawer-head"><div><span>YOUR SELECTION</span><h2>سبد آزمایشی</h2></div><button className="icon-button" onClick={()=>setCartOpen(false)} aria-label="بستن سبد"><X size={23}/></button></div>
     {quantity===0?<div className="empty-cart"><ShoppingBag size={33}/><h3>سبدت هنوز خالیه.</h3><p>از محصول نمایشی یک نمونه به سبد اضافه کن.</p><button className="metal-button" onClick={()=>{setCartOpen(false);jump("#studio")}}>مشاهده محصول <ArrowUpLeft size={16}/></button></div>:<div className="cart-content"><div className="cart-product"><div className="cart-product-image"><Headphones size={38}/></div><div><strong>AETHER ONE</strong><span>{selected.label} / نسخه مفهومی</span><small>{money(14900000)}</small></div></div><div className="quantity-row"><span>تعداد</span><div><button onClick={()=>setQuantity(q=>Math.max(0,q-1))} aria-label="کم کردن تعداد"><Minus size={15}/></button><span>{new Intl.NumberFormat("fa-IR").format(quantity)}</span><button onClick={()=>setQuantity(q=>q+1)} aria-label="افزایش تعداد"><Plus size={15}/></button></div></div><div className="subtotal"><span>جمع نمایشی</span><strong>{money(quantity*14900000)}</strong></div><button disabled className="demo-checkout">پرداخت در نسخه دمو غیرفعال است</button><p className="drawer-notice">برای آزمایش طراحی، ثبت سفارش و پرداخت به درگاه متصل نیست.</p></div>}
   </aside>
   <div className={"search-overlay"+(searchOpen?" open":"")} role="dialog" aria-modal={searchOpen} aria-label="جستجوی نمایشی" aria-hidden={!searchOpen}><div className="search-head"><span>SEARCH / EDITION 03</span><button onClick={()=>setSearchOpen(false)} className="icon-button" aria-label="بستن جستجو"><X size={25}/></button></div><div className="search-inner"><Search size={28}/><input value={search} onChange={e=>setSearch(e.target.value)} tabIndex={searchOpen?0:-1} autoComplete="off" placeholder="در تجربه جستجو کن..." aria-label="عبارت جستجو"/><span className="search-tip">ESC / CLOSE</span></div><div className="search-results">{searchMatches.length?searchMatches.map(t=><button key={t} onClick={()=>{setSearchOpen(false);jump(t.includes("متریال")||t.includes("تیتانیوم")||t.includes("گرافیت")?"#materials":"#experience")}}><span>{t}</span><ArrowUpLeft size={18}/></button>):<span>نتیجه‌ای در دموی فعلی پیدا نشد.</span>}</div></div>
   {notice&&<div className="toast" role="status"><Check size={16}/>{notice}</div>}
 </div>;
}

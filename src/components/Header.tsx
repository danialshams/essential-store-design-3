"use client";
import Image from "next/image";
import Link from "next/link";
import {usePathname,useRouter} from "next/navigation";
import {useEffect,useRef,useState,type FormEvent} from "react";
import {ArrowUpLeft,ArrowLeft,Menu,Search,ShoppingBag,X,UserRound,Heart,Minus,Plus} from "lucide-react";
import {useShop} from "@/components/ShopProvider";
import {toman} from "@/lib/catalog";

export function Header(){
 const pathname=usePathname(),router=useRouter();
 const {store,count,lines,remove,setQuantity}=useShop();
 const [menu,setMenu]=useState(false),[search,setSearch]=useState(false),[cart,setCart]=useState(false),[q,setQ]=useState(""),[focused,setFocused]=useState(0),[scrolled,setScrolled]=useState(false);
 const input=useRef<HTMLInputElement>(null);
 const categories=store.categories.slice(0,4);
 const imagePaths=["/images/flagship-chapter-1.webp","/images/flagship-spotlight.webp","/images/flagship-collection.webp","/images/flagship-chapter-2.webp"];
 useEffect(()=>{setMenu(false);setSearch(false);setCart(false)},[pathname]);
 useEffect(()=>{const onScroll=()=>setScrolled(window.scrollY>32);onScroll();window.addEventListener("scroll",onScroll,{passive:true});return()=>window.removeEventListener("scroll",onScroll)},[]);
 useEffect(()=>{const open=menu||cart;const old=document.body.style.overflow;if(open)document.body.style.overflow="hidden";return()=>{document.body.style.overflow=old}},[menu,cart]);
 useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape"){setMenu(false);setCart(false);setSearch(false)}};document.addEventListener("keydown",onKey);return()=>document.removeEventListener("keydown",onKey)},[]);
 useEffect(()=>{if(search)input.current?.focus()},[search]);
 function submit(e:FormEvent){e.preventDefault();router.push(`/products${q.trim()?`?q=${encodeURIComponent(q.trim())}`:""}`);setSearch(false)}
 const isHome=pathname==="/";
 const name=store.settings.storeName||"ATELIER";
 const cartLines=lines.map(line=>({line,product:store.products.find(p=>p.id===line.productId)})).filter(e=>e.product);
 const cartTotal=cartLines.reduce((s,{line,product})=>s+(product?.variants?.find(v=>v.id===line.variantId)?.price??product?.price??0)*line.quantity,0);
 return <>
  <header className={`fg-header ${isHome&&!scrolled?"fg-header-overlay":"fg-header-solid"}`}><div className="fg-header-inner fg-wrap">
    <div className="fg-header-primary"><button aria-label="باز کردن منوی اصلی" aria-expanded={menu} className="fg-nav-toggle" onClick={()=>{setMenu(true);setSearch(false)}}><Menu size={22} strokeWidth={1.45}/><span>فهرست</span></button><span className="fg-header-edition">EDITION 03 / DIGITAL FLAGSHIP</span></div>
    <Link href="/" className="fg-brand"><span className="fg-brand-symbol">A<span>✳</span></span><span className="fg-brand-name">{name}</span><small>ATELIER / 03</small></Link>
    <div className="fg-header-actions"><button onClick={()=>{setSearch(v=>!v);setMenu(false)}} aria-label="جستجوی محصولات" aria-expanded={search}><Search size={19}/></button><Link href="/account" aria-label="حساب کاربری"><UserRound size={19}/></Link><button onClick={()=>setCart(true)} className="fg-header-bag" aria-label={`سبد خرید: ${count} محصول`} aria-expanded={cart}><ShoppingBag size={19}/>{count>0&&<sup>{count.toLocaleString("fa-IR")}</sup>}</button></div>
  </div></header>
  <div className={`fg-search-panel ${search?"is-open":""}`} aria-hidden={!search}><form className="fg-wrap fg-search-form" onSubmit={submit}><Search size={21}/><input ref={input} value={q} onChange={e=>setQ(e.target.value)} placeholder="چه چیزی در ذهن دارید؟" aria-label="جستجوی محصولات" tabIndex={search?0:-1}/><button type="submit" tabIndex={search?0:-1}>جستجو <ArrowLeft size={19}/></button><button type="button" aria-label="بستن جستجو" onClick={()=>setSearch(false)} tabIndex={search?0:-1}><X size={21}/></button></form></div>
  <div className={`fg-nav-cover ${menu?"is-open":""}`} aria-hidden={!menu}><div className="fg-nav-panel" inert={!menu}><div className="fg-nav-top fg-wrap"><span>ATELIER / NAVIGATION</span><button onClick={()=>setMenu(false)} aria-label="بستن منو">بستن <X size={21}/></button></div><div className="fg-nav-body fg-wrap"><nav aria-label="ناوبری اصلی" className="fg-nav-links"><span className="fg-nav-heading">EXPLORE / 03</span><Link onMouseEnter={()=>setFocused(0)} onFocus={()=>setFocused(0)} href="/"><small>01</small>خانه <ArrowUpLeft size={19}/></Link><Link onMouseEnter={()=>setFocused(1)} onFocus={()=>setFocused(1)} href="/products"><small>02</small>فروشگاه <ArrowUpLeft size={19}/></Link><Link onMouseEnter={()=>setFocused(2)} onFocus={()=>setFocused(2)} href="/#collections"><small>03</small>کالکشن‌ها <ArrowUpLeft size={19}/></Link><Link onMouseEnter={()=>setFocused(3)} onFocus={()=>setFocused(3)} href="/blog"><small>04</small>ژورنال <ArrowUpLeft size={19}/></Link><div className="fg-nav-small"><Link href="/info/about">درباره برند</Link><Link href="/info/contact">ارتباط با ما</Link></div></nav><div className="fg-nav-showcase"><div className="fg-nav-photo">{imagePaths.map((img,i)=><Image key={img} src={img} alt="" fill sizes="(max-width:760px) 36vw, 28vw" className={focused===i?"is-active":""}/>)}</div><div className="fg-nav-photo-caption"><span>CURATED PERSPECTIVE</span><span>{String(focused+1).padStart(2,"0")} / 04</span></div></div></div><div className="fg-nav-bottom fg-wrap"><span>THE ART OF CHOOSING — {name}</span><div>{categories.map(c=><Link key={c.id} href={`/category/${c.id}`}>{c.name}</Link>)}</div></div></div></div>
  <div className={`fg-cart-overlay ${cart?"is-open":""}`} aria-hidden={!cart}><button aria-label="بستن سبد خرید" onClick={()=>setCart(false)} className="fg-cart-shade" tabIndex={cart?0:-1}/><aside className="fg-cart-drawer" inert={!cart} aria-label="سبد خرید"><div className="fg-cart-head"><div><span>YOUR SELECTION</span><h2>سبد انتخاب‌ها</h2></div><button onClick={()=>setCart(false)} aria-label="بستن سبد"><X size={23}/></button></div><div className="fg-cart-items">{cartLines.length?cartLines.map(({line,product})=><div key={line.id} className="fg-cart-item"><Link href={`/product/${product!.slug}`} onClick={()=>setCart(false)}><Image src={product!.image} alt={product!.name} width={86} height={112} unoptimized={product!.image.startsWith("http")}/></Link><div><Link href={`/product/${product!.slug}`} onClick={()=>setCart(false)}>{product!.name}</Link><span>{toman((product!.variants?.find(v=>v.id===line.variantId)?.price??product!.price)*line.quantity)}</span><div className="fg-cart-qty"><button aria-label="کاهش تعداد" onClick={()=>setQuantity(line.id,line.quantity-1)}><Minus size={14}/></button><span>{line.quantity.toLocaleString("fa-IR")}</span><button aria-label="افزایش تعداد" onClick={()=>setQuantity(line.id,line.quantity+1)}><Plus size={14}/></button><button onClick={()=>remove(line.id)}>حذف</button></div></div></div>):<div className="fg-empty-cart"><ShoppingBag size={43}/><p>هنوز محصولی انتخاب نشده است.</p><Link href="/products" onClick={()=>setCart(false)}>کشف کالکشن <ArrowUpLeft size={18}/></Link></div>}</div>{cartLines.length>0&&<div className="fg-cart-footer"><div><span>مجموع انتخاب‌ها</span><strong>{toman(cartTotal)}</strong></div><Link href="/cart" onClick={()=>setCart(false)}>مشاهده سبد خرید <ArrowUpLeft size={19}/></Link><Link href="/checkout" onClick={()=>setCart(false)}>ادامه برای ثبت سفارش <ArrowLeft size={19}/></Link></div>}</aside></div>
 </>
}

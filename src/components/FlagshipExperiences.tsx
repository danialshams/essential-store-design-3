"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import Image from "next/image";
import {ArrowUpLeft,ArrowLeft,Plus,X,ShoppingBag} from "lucide-react";
import {useShop} from "@/components/ShopProvider";
import {toman,type Product} from "@/lib/catalog";
import type {StoreCategory} from "@/lib/live-store";

const categoryFallbacks:Record<string,string>={clothing:"/images/flagship-collection.webp",bags:"/images/flagship-spotlight.webp",shoes:"/images/sneakers.webp",accessories:"/images/classic-watch.webp"};
function picture(c:StoreCategory){return c.image&&(!c.image.startsWith("/images/")||!c.image.includes("hero-"))&&!(c.image.includes("linen-shirt.webp")||c.image.includes("bag.webp"))?c.image:categoryFallbacks[c.id]||c.image||"/images/flagship-collection.webp"}
export function CollectionGallery({categories}:{categories:StoreCategory[]}){
 const [selected,setSelected]=useState(0);
 const choices=categories.slice(0,4);
 const active=choices[Math.min(selected,choices.length-1)];
 if(!active)return null;
 return <section className="fg-collection" id="collections" aria-labelledby="fg-collections-title">
   <div className="fg-wrap fg-collection-heading" data-fg-reveal><span className="fg-kicker">01 / THE COLLECTIONS</span><span>دریچه‌ای به جهان انتخاب‌ها</span></div>
   <div className="fg-collection-layout fg-wrap">
    <div className="fg-collection-copy"><span className="fg-overline">CURATED FOR YOU / 2026</span><h2 id="fg-collections-title" data-fg-reveal>هر کالکشن،<br/><em>یک جهان.</em></h2><div className="fg-collection-options" role="list" aria-label="دسته‌بندی محصولات">{choices.map((category,i)=><Link role="listitem" key={category.id} href={`/category/${category.id}`} onMouseEnter={()=>setSelected(i)} onFocus={()=>setSelected(i)} onTouchStart={()=>setSelected(i)} className={`fg-collection-option ${selected===i?"is-selected":""}`}><span className="fg-collection-index">0{i+1}</span><span>{category.name}</span><ArrowUpLeft aria-hidden="true" size={22}/></Link>)}</div><Link href="/products" className="fg-link">دیدن تمام محصولات <ArrowLeft size={18}/></Link></div>
    <div className="fg-collection-art" aria-live="off"><div className="fg-collection-image-frame" data-fg-wipe>{choices.map((category,i)=><Image key={category.id} src={picture(category)} alt={category.name} fill sizes="(max-width:760px) 92vw, 47vw" unoptimized={picture(category).startsWith("http")} priority={i===0} className={`fg-collection-photo ${i===selected?"is-active":""}`}/>)}</div><div className="fg-collection-image-bottom"><span>EDITION / 0{selected+1}</span><span>{active.description||"انتخاب‌هایی برای یک نگاه متفاوت"}</span></div><div className="fg-collection-caption" aria-hidden="true">CURATED OBJECTS</div></div>
   </div>
   <div className="fg-collection-mobile fg-wrap" aria-label="دسته‌بندی‌ها در موبایل">{choices.map((cat,i)=><Link href={`/category/${cat.id}`} key={cat.id}><Image src={picture(cat)} alt="" width={380} height={430} unoptimized={picture(cat).startsWith("http")}/><span>0{i+1} / {cat.name}</span></Link>)}</div>
  </section>;
}

export type Hotspot={id:string;x:number;y:number;productId:string;label?:string};
export function ShopTheScene({products,hotspots,imageUrl}:{products:Product[];hotspots?:Hotspot[];imageUrl?:string}){
 const [selected,setSelected]=useState<number|null>(null);
 const {add}=useShop();
 const featured=products.filter(p=>p.inventory>0).slice(0,3);
 const points=hotspots?.length?hotspots.filter(p=>products.some(product=>product.id===p.productId)).slice(0,8):featured.map((p,i)=>({id:p.id,productId:p.id,x:[25,56,79][i]||50,y:[32,62,43][i]||50}));
 const index=selected??0;
 const current=points[index];
 const product=current?products.find(p=>p.id===current.productId):undefined;
 useEffect(()=>{if(selected===null)return;const handler=(event:KeyboardEvent)=>{if(event.key==="Escape")setSelected(null)};document.addEventListener("keydown",handler);return()=>document.removeEventListener("keydown",handler)},[selected]);
 if(!points.length)return null;
 function buy(p:Product){if(p.variants?.length){window.location.href=`/product/${encodeURIComponent(p.slug)}`;return}add(p);setSelected(null)}
 return <section className="fg-scene" aria-labelledby="fg-scene-heading" id="shop-the-scene"><div className="fg-scene-image" data-fg-zoom><Image fill src={imageUrl||"/images/flagship-scene.webp"} alt="استایل منتخب و محصولات قابل خرید" sizes="100vw" unoptimized={Boolean(imageUrl?.startsWith("http"))}/></div><div className="fg-scene-wash"/><div className="fg-scene-top fg-wrap"><span className="fg-kicker">04 / INTERACTIVE EDIT</span><span>LOOK NO. 01 — ATELIER</span></div><div className="fg-scene-text fg-wrap" data-fg-reveal><h2 id="fg-scene-heading">جزئیات را<br/><i>کشف کنید.</i></h2><p>روی نشانه‌ها بزنید و محصولات این صحنه را از نزدیک ببینید.</p></div><div className="fg-scene-points">{points.map((point,i)=><button key={point.id} aria-label={`نمایش ${products.find(p=>p.id===point.productId)?.name||"محصول"}`} type="button" className={`fg-hotspot ${selected===i?"is-active":""}`} style={{left:`${Math.min(95,Math.max(5,point.x))}%`,top:`${Math.min(90,Math.max(10,point.y))}%`}} onClick={()=>setSelected(selected===i?null:i)} aria-expanded={selected===i}><span><Plus size={19}/></span></button>)}</div>{selected!==null&&product&&<><button className="fg-scene-card-backdrop" aria-label="بستن محصول" onClick={()=>setSelected(null)}/><div className="fg-scene-product" role="dialog" aria-modal="false" aria-label={`جزئیات ${product.name}`}><button onClick={()=>setSelected(null)} aria-label="بستن" className="fg-scene-close"><X size={19}/></button><Image src={product.image} alt={product.name} width={132} height={156} unoptimized={product.image.startsWith("http")}/><div><span>DISCOVER THE PIECE</span><h3>{product.name}</h3><strong>{toman(product.price)}</strong><div className="fg-scene-actions"><Link href={`/product/${product.slug}`}>جزئیات <ArrowUpLeft size={17}/></Link><button onClick={()=>buy(product)}>افزودن <ShoppingBag size={16}/></button></div></div></div></>}</section>;
}

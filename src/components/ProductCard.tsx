"use client";
import {useState} from "react";
import Link from "next/link";
import Image from "next/image";
import {useRouter} from "next/navigation";
import {ArrowUpLeft,Heart,ShoppingBag,X} from "lucide-react";
import {useShop} from "@/components/ShopProvider";
import {toman,type Product} from "@/lib/catalog";
export function ProductCard({product,compact=false}:{product:Product,compact?:boolean}){
 const router=useRouter();const {add,isFavorite,toggleFavorite}=useShop();
 const [hover,setHover]=useState(false),[preview,setPreview]=useState(false);
 const alternative=product.gallery?.find(x=>x!==product.image);
 const available=product.variants?.length?product.variants.some(v=>v.inventory>0):product.inventory>0;
 function addOne(){if(product.variants?.length){router.push(`/product/${product.slug}`);return}add(product);setPreview(false)}
 return <article className={`premium-product-card fg-product-card ${compact?"is-compact":""}`}>
  <div className="premium-product-media" onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}><Link href={`/product/${product.slug}`} aria-label={`مشاهده ${product.name}`}><Image src={product.image} alt={product.name} width={720} height={790} sizes="(max-width:640px) 46vw, (max-width:1000px) 31vw, 22vw" unoptimized={product.image.startsWith("http")} className="premium-product-photo"/>{alternative&&hover&&<Image className="premium-product-photo premium-product-second" src={alternative} alt="" width={720} height={790} unoptimized={alternative.startsWith("http")}/>}</Link><div className="fg-product-media-top"><span>{product.newArrival?"NEW / 03":product.featured?"CURATED":"OBJECT / EDITION"}</span><button type="button" aria-pressed={isFavorite(product.id)} onClick={()=>toggleFavorite(product.id)} aria-label={isFavorite(product.id)?"حذف از علاقه‌مندی‌ها":"افزودن به علاقه‌مندی‌ها"}><Heart size={19} fill={isFavorite(product.id)?"currentColor":"none"}/></button></div>{available?<div className="fg-product-actions"><button onClick={()=>setPreview(true)}>مشاهده سریع <ArrowUpLeft size={17}/></button><button onClick={addOne} aria-label="افزودن به سبد خرید"><ShoppingBag size={18}/></button></div>:<span className="fg-product-unavailable">ناموجود</span>}</div>
  <div className="premium-product-info"><span>{product.categoryLabel}</span><Link href={`/product/${product.slug}`}>{product.name}<ArrowUpLeft size={16}/></Link><div className="premium-product-price">{product.comparePrice&&product.comparePrice>product.price&&<del>{toman(product.comparePrice)}</del>}<strong>{toman(product.price)}</strong></div></div>
  {preview&&<div className="fg-quick-overlay" role="dialog" aria-modal="true" aria-label={`نمایش سریع ${product.name}`}><button aria-label="بستن نمایش سریع" className="fg-quick-backdrop" onClick={()=>setPreview(false)}/><div className="fg-quick-modal"><button className="fg-quick-close" onClick={()=>setPreview(false)} aria-label="بستن"><X size={23}/></button><div className="fg-quick-image"><Image src={product.image} alt={product.name} width={480} height={560} unoptimized={product.image.startsWith("http")}/></div><div className="fg-quick-copy"><span>THE OBJECT / QUICK VIEW</span><h2>{product.name}</h2><p>{product.description}</p><strong>{toman(product.price)}</strong><button disabled={!available} onClick={addOne}>{product.variants?.length?"انتخاب رنگ و سایز":"افزودن به سبد"} <ShoppingBag size={19}/></button><Link href={`/product/${product.slug}`}>مشاهده تمام جزئیات <ArrowUpLeft size={17}/></Link></div></div></div>}
 </article>;
}

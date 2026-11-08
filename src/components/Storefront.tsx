"use client";
import {useEffect,useRef,useState} from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {useParams} from "next/navigation";
import {ArrowLeft,ArrowRight,ArrowUpRight,ChevronDown,Heart,Menu,Minus,Plus,Search,ShoppingBag,UserRound,X,Rotate3D} from "lucide-react";
import {products,categoryNames,formatPrice,type Product} from "@/lib/catalog";

const Viewer=dynamic(()=>import("./Headphone360"),{ssr:false,loading:()=> <div className="hero-loader" aria-hidden="true"><img src="/images/airpods-poster-desktop.webp" alt=""/></div>});
type View="home"|"shop"|"product"|"about";
type Basket=Record<string,number>;
type Category="all"|Product["category"];
const STORE_KEY="aether-demo-basket-2026";
const categories:Category[]=["all","headphones","earbuds","watches","speakers"];
function Logo(){return <Link className="brand-logo" href="/" aria-label="AETHER صفحه اصلی">AETHER<span>.</span></Link>}
function ProductCard({item,add,liked,toggle}:{item:Product;add:(s:string)=>void;liked:boolean;toggle:(s:string)=>void}){
return <article className="product-tile">
<Link href={"/product/"+item.slug} className="tile-image" aria-label={"مشاهده "+item.name}><img src={item.image} alt={item.name} loading="lazy"/></Link>
<button className={"tile-like"+(liked?" liked":"")} aria-label="افزودن به علاقه‌مندی" aria-pressed={liked} onClick={()=>toggle(item.id)}><Heart size={17} fill={liked?"currentColor":"none"}/></button>
<div className="tile-bottom"><Link href={"/product/"+item.slug} className="tile-desc"><b>{item.english}</b><small>{item.name}</small><span>{formatPrice(item.price)}</span></Link><button className="tile-add" aria-label={"افزودن "+item.name+" به سبد"} onClick={()=>add(item.id)}><Plus size={19}/></button></div>
</article>}
export default function Storefront({view="home"}:{view?:View}){
const params=useParams<{slug:string}>();
const [menu,setMenu]=useState(false),[search,setSearch]=useState(false),[cartOpen,setCartOpen]=useState(false);
const [basket,setBasket]=useState<Basket>({}),[basketReady,setBasketReady]=useState(false);
const [liked,setLiked]=useState<string[]>([]),[category,setCategory]=useState<Category>("all"),[query,setQuery]=useState("");
const [message,setMessage]=useState(""),[email,setEmail]=useState(""),[submitted,setSubmitted]=useState(false);
const searchInput=useRef<HTMLInputElement>(null);
useEffect(()=>{try{setBasket(JSON.parse(localStorage.getItem(STORE_KEY)||"{}"))}catch{}setBasketReady(true)},[]);
useEffect(()=>{if(basketReady)localStorage.setItem(STORE_KEY,JSON.stringify(basket))},[basket,basketReady]);
useEffect(()=>{if(view==="shop"){const c=new URLSearchParams(location.search).get("category");if(categories.includes(c as Category))setCategory(c as Category)}},[view]);
useEffect(()=>{if(search){const id=setTimeout(()=>searchInput.current?.focus(),100);return()=>clearTimeout(id)}},[search]);
useEffect(()=>{const f=(e:KeyboardEvent)=>{if(e.key==="Escape"){setMenu(false);setSearch(false);setCartOpen(false)}};window.addEventListener("keydown",f);return()=>window.removeEventListener("keydown",f)},[]);
useEffect(()=>{const elements=document.querySelectorAll(".reveal");const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");obs.unobserve(e.target)}}),{rootMargin:"0px 0px 100px 0px",threshold:.08});elements.forEach(x=>obs.observe(x));return()=>obs.disconnect()},[view]);
const count=Object.values(basket).reduce((a,b)=>a+b,0),cartItems=products.filter(p=>basket[p.id]>0);
const price=products.reduce((sum,p)=>sum+p.price*(basket[p.id]||0),0);
const selected=products.find(p=>p.slug===params?.slug);
const visibleProducts=products.filter(p=>category==="all"||p.category===category);
const searchResults=products.filter(p=>(p.name+" "+p.english).toLowerCase().includes(query.trim().toLowerCase()));
function add(id:string){setBasket(old=>({...old,[id]:(old[id]||0)+1}));setCartOpen(true)}
function change(id:string,diff:number){setBasket(old=>{const n={...old,[id]:Math.max(0,(old[id]||0)+diff)};if(n[id]===0)delete n[id];return n})}
function toggle(id:string){setLiked(a=>a.includes(id)?a.filter(x=>x!==id):[...a,id])}
return <div className="aether-commerce" id="top">
<header className="main-header"><div className="nav-inner">
<div className="nav-brand"><Logo/></div>
<nav className="nav-menu"><Link href="/shop">فروشگاه</Link><Link href="/#collections">کالکشن‌ها</Link><Link href="/about">درباره ما</Link></nav>
<div className="nav-icons">
<button aria-label="جست‌وجو" onClick={()=>setSearch(true)}><Search size={20}/></button>
<button aria-label="حساب کاربری" className="hide-mobile" onClick={()=>setMessage("حساب کاربری در نسخه نمایشی فعلاً غیرفعال است.")}><UserRound size={20}/></button>
<button aria-label="سبد خرید" className="cart-button" onClick={()=>setCartOpen(true)}><ShoppingBag size={20}/>{count>0&&<span>{count}</span>}</button>
<button className="mobile-menu-button" aria-label="باز کردن منو" onClick={()=>setMenu(true)}><Menu size={22}/></button>
</div></div></header>

{view==="home"&&<main>
<section className="aether-hero" aria-label="معرفی AETHER">
<div className="hero-halo" aria-hidden="true"/>
<div className="hero-visual"><Viewer/></div>
<div className="hero-message reveal">
<span className="overline">P R E M I U M &nbsp; A U D I O</span>
<h1>Sound,<br/>reimagined<span>.</span></h1>
<p>طراحی دقیق، صدایی فراگیر و راحتی بی‌نظیر.</p>
<div className="hero-buttons"><Link href="/product/aether-one" className="pill-primary">کشف محصول <ArrowLeft size={17}/></Link><Link href="/shop" className="quiet-link">مشاهده کالکشن <ArrowLeft size={16}/></Link></div>
</div>
<div className="orbit-icon" aria-hidden="true"><Rotate3D size={18}/><span>360°</span></div>
<div className="hero-bottom"><span>برای کشف بیشتر اسکرول کنید ↓</span><span>01 / 04 ━━━━━</span></div>
</section>

<section className="collection-section" id="collections"><div className="collection-layout">
<div className="collection-intro reveal"><small className="overline">01 / THE COLLECTION</small><h2>کالکشنی از<br/>انتخاب‌های خاص<span>.</span></h2><p>محصولاتی برای سلیقه‌ای که به زیبایی، ظرافت و کیفیت اهمیت می‌دهد.</p><Link href="/shop" className="dark-link">مشاهده همه کالکشن‌ها <ArrowUpRight size={17}/></Link></div>
<div className="collection-cards">
<Link href="/shop?category=watches" className="collection-cover watch-cover"><img src="/media/watch.webp" alt="کالکشن ساعت هوشمند" loading="lazy"/><span>ساعت‌های هوشمند <ArrowUpRight size={19}/></span></Link>
<Link href="/shop?category=speakers" className="collection-cover speaker-cover"><img src="/media/speaker.webp" alt="کالکشن اسپیکر" loading="lazy"/><span>تجربه صدا <ArrowUpRight size={19}/></span></Link>
</div></div></section>

<section className="featured-section" id="featured"><div className="section-head reveal"><div><small className="overline">02 / FEATURED PRODUCTS</small><h2>محصولات منتخب<span>.</span></h2></div><Link href="/shop" className="quiet-link">مشاهده تمام محصولات <ArrowUpRight size={17}/></Link></div>
<div className="item-grid">{products.map(p=><ProductCard key={p.id} item={p} add={add} liked={liked.includes(p.id)} toggle={toggle}/>)}</div>
<div className="view-more-mobile"><Link href="/shop">مشاهده همه محصولات <ArrowUpRight size={17}/></Link></div>
</section>

<section className="editorial-section" id="details"><div className="editorial-product"><img src="/images/airpods-poster-desktop.webp" alt="" loading="lazy"/></div>
<div className="editorial-copy reveal"><small className="overline">03 / THE AETHER EXPERIENCE</small><h2>The Art<br/>of Detail<span>.</span></h2><p>زیبایی در هر جزئیات؛ از بافت پارچه تا خطوط فلز.</p><Link href="/product/aether-one" className="editorial-link"><span><ArrowUpRight size={17}/></span> کشف داستان طراحی</Link></div></section>
</main>}

{view==="shop"&&<main className="inner-page"><div className="inner-title"><small className="overline">THE AETHER COLLECTION</small><h1>کمتر، اما بهتر<span>.</span></h1><p>محصولات منتخب با طراحی دقیق و هویت ماندگار.</p></div><div className="filter-bar">{categories.map(c=><button key={c} className={category===c?"active":""} onClick={()=>setCategory(c)}>{c==="all"?"همه محصولات":categoryNames[c]}</button>)}</div><div className="item-grid">{visibleProducts.map(p=><ProductCard key={p.id} item={p} add={add} liked={liked.includes(p.id)} toggle={toggle}/>)}</div></main>}

{view==="product"&&<main className="inner-page product-detail">
{selected?<div className="product-layout"><div className="detail-image"><img src={selected.image} alt={selected.name}/></div><div className="detail-content"><Link className="back" href="/shop"><ArrowRight size={16}/> بازگشت به محصولات</Link><small className="overline">SIGNATURE PRODUCT</small><h1>{selected.english}</h1><h2>{selected.name}</h2><p>{selected.summary}</p><div className="product-price-row"><span>رنگ: گرافیتی</span><b>{formatPrice(selected.price)}</b></div><button className="pill-primary" onClick={()=>add(selected.id)}>افزودن به سبد خرید <Plus size={18}/></button>{selected.category==="headphones"&&<Link className="viewer-back" href="/#top">نمایش سه‌بعدی ۳۶۰ درجه <Rotate3D size={18}/></Link>}</div></div>:<div className="not-found"><h1>محصول پیدا نشد</h1><Link href="/shop">بازگشت به فروشگاه</Link></div>}
</main>}

{view==="about"&&<main className="inner-page about-content"><small className="overline">OUR PHILOSOPHY</small><h1>Less noise.<br/>More meaning.</h1><p>نگاهی ساده و دقیق به محصولاتی که هر روز همراه ما هستند. تجربه‌ای که کیفیت، سکوت و ظرافت را کنار هم قرار می‌دهد.</p><Link href="/shop" className="pill-primary">کشف مجموعه <ArrowLeft size={18}/></Link><div className="about-product"><img src="/images/airpods-poster-desktop.webp" alt="AETHER"/></div></main>}

<footer className="main-footer"><div className="footer-columns"><div className="footer-brand"><Logo/><p>طراحی برای تجربه‌ای آرام‌تر از تکنولوژی.</p></div><form className="footer-newsletter" onSubmit={e=>{e.preventDefault();setSubmitted(true)}}><label htmlFor="subscribe">از تازه‌ترین محصولات باخبر شوید</label><div><input id="subscribe" type="email" required placeholder="آدرس ایمیل" value={email} onChange={e=>{setEmail(e.target.value);setSubmitted(false)}}/><button aria-label="ثبت ایمیل" type="submit"><ArrowLeft size={18}/></button></div>{submitted&&<small>خبرنامه در نسخه نمایشی هنوز فعال نیست.</small>}</form><div className="footer-links"><b>فروشگاه</b><Link href="/shop">همه محصولات</Link><Link href="/shop?category=headphones">هدفون‌ها</Link><Link href="/shop?category=speakers">اسپیکرها</Link></div><div className="footer-links"><b>درباره ما</b><Link href="/about">داستان ما</Link><Link href="/#details">جزئیات طراحی</Link><a href="#contact" onClick={e=>{e.preventDefault();setMessage("اطلاعات ارتباطی در نسخه واقعی قابل تنظیم است.")}}>ارتباط با ما</a></div></div><div className="footer-bottom"><span>© 2026 AETHER · <a href="https://sketchfab.com/3d-models/airpods-max-3400db28f6da41d08304ff20b29c3883" target="_blank" rel="noopener noreferrer">3D: DJM / CC BY</a></span><span>این یک فروشگاه نمایشی است؛ خرید و قیمت‌ها واقعی نیستند.</span><a href="#top">بازگشت به بالا ↑</a></div></footer>

{message&&<div className="demo-notice" role="status">{message}<button aria-label="بستن پیام" onClick={()=>setMessage("")}><X size={16}/></button></div>}
{menu&&<div className="overlay-root"><button className="shade" aria-label="بستن منو" onClick={()=>setMenu(false)}/><aside className="drawer menu-drawer"><div className="drawer-top"><Logo/><button aria-label="بستن" onClick={()=>setMenu(false)}><X/></button></div><nav><Link href="/" onClick={()=>setMenu(false)}>خانه <ArrowUpRight/></Link><Link href="/shop" onClick={()=>setMenu(false)}>محصولات <ArrowUpRight/></Link><Link href="/#collections" onClick={()=>setMenu(false)}>کالکشن‌ها <ArrowUpRight/></Link><Link href="/about" onClick={()=>setMenu(false)}>درباره ما <ArrowUpRight/></Link></nav></aside></div>}
{search&&<div className="overlay-root"><button className="shade" aria-label="بستن جست‌وجو" onClick={()=>setSearch(false)}/><div className="search-dialog" role="dialog" aria-modal="true" aria-label="جست‌وجوی محصولات"><div className="drawer-top"><strong>جست‌وجو</strong><button aria-label="بستن" onClick={()=>setSearch(false)}><X/></button></div><div className="search-input"><Search size={21}/><input ref={searchInput} placeholder="دنبال چه چیزی هستید؟" value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="search-results">{searchResults.map(p=><Link href={"/product/"+p.slug} key={p.id} onClick={()=>setSearch(false)}><img src={p.image} alt=""/><span>{p.english}<small>{p.name}</small></span><ArrowUpRight size={17}/></Link>)}{searchResults.length===0&&<p>محصولی پیدا نشد.</p>}</div></div></div>}
{cartOpen&&<div className="overlay-root"><button className="shade" aria-label="بستن سبد" onClick={()=>setCartOpen(false)}/><aside className="drawer cart-drawer" role="dialog" aria-modal="true" aria-label="سبد خرید"><div className="drawer-top"><h2>سبد خرید <span>{count}</span></h2><button aria-label="بستن" onClick={()=>setCartOpen(false)}><X/></button></div><div className="cart-rows">{cartItems.length===0?<div className="empty-cart"><ShoppingBag size={36}/><h3>سبد خرید شما خالی است</h3><p>برای دیدن محصولات فروشگاه را مرور کنید.</p><button className="pill-primary" onClick={()=>setCartOpen(false)}>ادامه خرید</button></div>:cartItems.map(p=><div className="cart-row" key={p.id}><img src={p.image} alt=""/><div><Link href={"/product/"+p.slug} onClick={()=>setCartOpen(false)}>{p.name}</Link><small>{formatPrice(p.price)}</small><div className="quantity"><button aria-label="کاهش" onClick={()=>change(p.id,-1)}><Minus size={14}/></button>{basket[p.id]}<button aria-label="افزایش" onClick={()=>change(p.id,1)}><Plus size={14}/></button></div></div></div>)}</div>{count>0&&<div className="cart-total"><div><span>جمع کل</span><b>{formatPrice(price)}</b></div><button className="pill-primary" onClick={()=>{setCartOpen(false);setMessage("پرداخت در نسخه نمایشی فعال نیست.")}}>ادامه به پرداخت <ArrowLeft size={18}/></button><small>پرداخت واقعی در نسخه نمایشی انجام نمی‌شود.</small></div>}</aside></div>}
</div>;
}

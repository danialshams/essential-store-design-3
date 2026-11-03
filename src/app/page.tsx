import Image from "next/image";
import Link from "next/link";
import {ArrowDown,ArrowLeft,ArrowUpLeft,ShieldCheck,Truck,PackageCheck} from "lucide-react";
import {loadStore} from "@/lib/live-store";
import {toman} from "@/lib/catalog";
import {ProductCard} from "@/components/ProductCard";
import {FlagshipMotion} from "@/components/FlagshipMotion";
import {CollectionGallery,ShopTheScene,type Hotspot} from "@/components/FlagshipExperiences";

const shots=[
 {img:"/images/flagship-chapter-1.webp",tag:"THE BEGINNING",num:"01",heading:"از یک نگاه،\nتا یک امضا.",body:"هر انتخاب داستانی دارد؛ داستانی از توجه به فرم، بافت و جزئیاتی که ماندگار می‌شوند."},
 {img:"/images/flagship-chapter-2.webp",tag:"THE MATERIAL",num:"02",heading:"زیبایی در\nآنچه لمس می‌کنید.",body:"کیفیت فقط یک ویژگی نیست. در هر خط، هر دوخت و هر سطح، تجربه می‌شود."},
 {img:"/images/flagship-chapter-3.webp",tag:"THE EXPERIENCE",num:"03",heading:"برای فراتر از\nیک فصل.",body:"قطعاتی که با سلیقه شما زندگی می‌کنند، نه با سرعت تغییر ترندها."}
];
const images={hero:"/images/flagship-hero.webp",scene:"/images/flagship-scene.webp",spotlight:"/images/flagship-spotlight.webp",outro:"/images/flagship-outro.webp"};
function goodPath(x?:string|null,fallback="/products"){return typeof x==="string"&&x.startsWith("/")&&!x.startsWith("//")&&!x.includes("\\")?x:fallback}
function safeImg(x?:string|null,fallback="/images/flagship-hero.webp"){return typeof x==="string"&&(x.startsWith("https://")||x.startsWith("/images/"))?x:fallback}
export default async function Home(){
 const store=await loadStore();
 const sections=[...(store.settings.homeSections||[])].filter(s=>s.enabled).sort((a,b)=>a.position-b.position);
 const byRole=(role:string)=>sections.find(s=>s.role===role);
 const hero=byRole("hero")||sections[0];
 const story=byRole("story");
 const scene=byRole("scene");
 const outro=byRole("campaign");
 const heroImage=safeImg(byRole("hero")?.imageUrl,images.hero);
 const heroMobile=safeImg(byRole("hero")?.mobileImageUrl,heroImage);
 const visible=store.products.filter(p=>p.inventory>0 || p.variants?.some(v=>v.inventory>0));
 const spotlight=visible.find(x=>x.featured)||visible[0]||store.products[0];
 const selected=store.products.filter(p=>p.featured).slice(0,4);
 const grid=selected.length>=3?selected:store.products.slice(0,4);
 const newProducts=store.products.filter(p=>!grid.some(q=>q.id===p.id)).slice(0,3);
 const configuredScenes=story?.scenes?.filter(s=>s.imageUrl).slice(0,3);
 const chapterSlides=configuredScenes&&configuredScenes.length>=2?configuredScenes.map((s,i)=>({img:safeImg(s.imageUrl,shots[i%3].img),tag:s.tag||shots[i%3].tag,num:String(i+1).padStart(2,"0"),heading:s.title,body:s.description})):shots;
 const hotspotList:Hotspot[]|undefined=scene?.hotspots?.map((h,i)=>({id:String(i),x:h.x,y:h.y,productId:h.productId,label:h.label}));
 const brand=store.settings.storeName;
 return <FlagshipMotion>
  <div className="fg-home">
   <section className="fg-hero" aria-labelledby="fg-hero-title">
    <div className="fg-hero-image" data-fg-hero-image><picture>{heroMobile!==heroImage&&<source media="(max-width: 680px)" srcSet={heroMobile}/>}<Image src={heroImage} alt="کمپین منتخب فصل" fill priority sizes="100vw" unoptimized={heroImage.startsWith("http")}/></picture></div>
    <div className="fg-hero-darkness"/>
    <div className="fg-hero-top fg-wrap" data-fg-hero-label><span>ATELIER / FLAGSHIP EXPERIENCE</span><span>EST. MMXXVI — EDITION 03</span></div>
    <div className="fg-hero-composition fg-wrap">
      <div className="fg-hero-content"><span className="fg-eyebrow" data-fg-hero-label>THE ART OF CHOOSING / 03</span>
        <h1 id="fg-hero-title">{(byRole("hero")?.title||"فراتر از\nیک انتخاب.").split("\n").filter(Boolean).map((line,i)=><span className="fg-hero-line" key={i}><span data-fg-hero-line>{line}</span></span>)}</h1>
        <p data-fg-hero-after>{byRole("hero")?.description||"روایتی متفاوت از اشیایی که انتخاب نمی‌شوند؛ کشف می‌شوند. برای سلیقه‌هایی که تکرار نمی‌شوند."}</p>
        <Link href={goodPath(byRole("hero")?.ctaHref)} className="fg-hero-cta" data-fg-hero-after><span>{byRole("hero")?.ctaLabel||"ورود به کالکشن"}</span><span><ArrowUpLeft size={20}/></span></Link>
      </div>
      <div className="fg-hero-aside" data-fg-hero-after><span>THE OBJECTS OF DESIRE</span><span>01 / 05</span></div>
    </div>
    <div className="fg-hero-bottom fg-wrap" data-fg-hero-after><a href="#philosophy">اسکرول برای کشف <ArrowDown size={16}/></a><span>AN IMMERSIVE RETAIL EXPERIENCE</span><span>01 — 07</span></div>
   </section>

   <section className="fg-statement" id="philosophy" aria-labelledby="fg-statement-title"><div className="fg-wrap fg-statement-inner"><div><span className="fg-kicker">A NOTE ON WHAT MATTERS</span><span className="fg-statement-line"/></div><h2 id="fg-statement-title" data-fg-reveal>هر شیء، یک داستان.<br/><em>هر انتخاب، یک امضا.</em></h2><p data-fg-reveal>جایی که فرم، کیفیت و احساس در یک نقطه به هم می‌رسند. ما به چیزهایی باور داریم که ارزش ماندن دارند.</p><span className="fg-statement-asterisk" aria-hidden="true">✳</span></div></section>

   <CollectionGallery categories={store.categories}/>

   <section className="fg-chapters" data-fg-chapter aria-labelledby="fg-chapters-title" id="our-story"><div className="fg-chapter-media">{chapterSlides.map((slide,i)=><div className="fg-chapter-shot" data-fg-chapter-shot key={i}><Image src={slide.img} alt={slide.tag} fill sizes="(max-width:960px) 100vw, 54vw" unoptimized={slide.img.startsWith("http")}/></div>)}<span className="fg-chapter-media-label">ATELIER / THE STORY IN THREE ACTS</span></div><div className="fg-chapter-content"><span className="fg-kicker">02 / A SENSE OF CRAFT</span><h2 id="fg-chapters-title" className="fg-sr-only">داستان کالکشن</h2><div className="fg-chapter-copies">{chapterSlides.map((slide,i)=><article data-fg-chapter-copy className="fg-chapter-copy" key={i}><div className="fg-chapter-mobile-photo"><Image src={slide.img} alt={slide.tag} fill sizes="100vw" unoptimized={slide.img.startsWith("http")}/></div><span>{slide.num} / {slide.tag}</span><h3>{slide.heading}</h3><p>{slide.body}</p><Link href="/info/about" className="fg-link">درباره نگاه ما <ArrowLeft size={19}/></Link></article>)}</div><div className="fg-chapter-progress"><span>01</span><div className="fg-progress-track"><span data-fg-progress/></div><span>{String(chapterSlides.length).padStart(2,"0")}</span></div></div></section>

   {spotlight&&<section className="fg-spotlight" id="spotlight"><div className="fg-wrap fg-spotlight-inner"><div className="fg-spotlight-heading" data-fg-reveal><span className="fg-kicker">03 / THE OBJECT STUDY</span><h2>یک انتخاب.<br/><i>بی‌نهایت جزئیات.</i></h2><p>این بار یک محصول را از نزدیک ببینید؛ جایی که بافت، تناسب و دقت، شخصیت آن را می‌سازند.</p><span className="fg-spotlight-index">OBJECT NO. 001</span></div><div className="fg-spotlight-visual" data-fg-wipe><div className="fg-spotlight-ring"/><Image src={spotlight.image} alt={spotlight.name} fill unoptimized={spotlight.image.startsWith("http")} sizes="(max-width:760px) 90vw, 42vw"/><span>THE STUDY / 01</span></div><div className="fg-spotlight-details" data-fg-reveal><span className="fg-kicker">FEATURED OBJECT / 03</span><h3>{spotlight.name}</h3><span className="fg-spotlight-price">{toman(spotlight.price)}</span><div className="fg-feature-line"/><p>{spotlight.description||"منتخب این فصل، با نگاهی دقیق به جزئیات."}</p><Link href={`/product/${spotlight.slug}`} className="fg-round-link">کشف محصول <ArrowUpLeft size={21}/></Link></div></div></section>}

   <ShopTheScene products={store.products} imageUrl={safeImg(scene?.imageUrl,images.scene)} hotspots={hotspotList}/>

   <section className="fg-curated fg-wrap" aria-labelledby="fg-curated-title"><div className="fg-title-row" data-fg-reveal><div><span className="fg-kicker">05 / THE CURATED EDIT</span><h2 id="fg-curated-title">منتخب برای<br/><em>سلیقه‌های خاص.</em></h2></div><Link href="/products" className="fg-link">تمام مجموعه <ArrowUpLeft size={18}/></Link></div><div className="fg-products" data-fg-stagger>{grid.map((p,i)=><div key={p.id} className={i===0?"fg-featured-card":""}><ProductCard product={p}/></div>)}</div>{newProducts.length>0&&<div className="fg-curated-more"><span>ALSO DISCOVER / NEW ARRIVALS</span><div>{newProducts.map(p=><Link key={p.id} href={`/product/${p.slug}`}>{p.name}<ArrowUpLeft size={16}/></Link>)}</div></div>}</section>

   <section className="fg-outro" aria-labelledby="fg-outro-heading"><div className="fg-outro-media" data-fg-zoom><Image src={safeImg(outro?.imageUrl,images.outro)} alt="کمپین پایانی برند" fill unoptimized={Boolean(outro?.imageUrl?.startsWith("http"))} sizes="100vw"/></div><div className="fg-outro-overlay"/><div className="fg-outro-inner fg-wrap" data-fg-reveal><span className="fg-kicker">A MORE PERSONAL PERSPECTIVE</span><h2 id="fg-outro-heading">سبک، چیزی نیست که بپوشید.<br/><i>چیزی‌ست که هستید.</i></h2><Link href={goodPath(outro?.ctaHref,"/products")} className="fg-hero-cta"><span>{outro?.ctaLabel||"کشف دنیای ما"}</span><span><ArrowUpLeft size={21}/></span></Link></div><span className="fg-outro-serial">COLLECTION / MMXXVI</span></section>

   <section className="fg-journal fg-wrap" aria-labelledby="fg-journal-title"><div className="fg-title-row" data-fg-reveal><div><span className="fg-kicker">06 / THE JOURNAL</span><h2 id="fg-journal-title">فراتر از <em>خریدن.</em></h2></div><Link href="/blog" className="fg-link">مطالعه ژورنال <ArrowUpLeft size={18}/></Link></div><div className="fg-journal-grid" data-fg-stagger>{[0,1].map((i)=>{const article=store.articles[i];const photo=safeImg(article?.coverUrl,i===0?"/images/flagship-collection.webp":"/images/flagship-spotlight.webp");return <Link href={article?`/blog/${article.slug}`:i===0?"/info/about":"/blog"} className="fg-journal-item" key={i}><div className="fg-journal-img"><Image src={photo} alt={article?.title||"روایتی از جهان برند"} fill sizes="(max-width:760px) 100vw, 47vw" unoptimized={photo.startsWith("http")}/></div><div><span>THE JOURNAL — 0{i+1}</span><h3>{article?.title||(i===0?"هنر انتخاب‌های ماندگار":"جزئیات؛ امضای هر سبک")}</h3><ArrowUpLeft size={22}/></div></Link>})}</div></section>

   <section className="fg-values"><div className="fg-wrap fg-values-inner" data-fg-stagger><div><ShieldCheck size={23}/><strong>انتخاب آگاهانه</strong><span>مشخصات شفاف و دقیق محصولات</span></div><div><PackageCheck size={23}/><strong>توجه به جزئیات</strong><span>روایت و معرفی کامل هر محصول</span></div><div><Truck size={23}/><strong>ارسال متناسب با شما</strong><span>روش‌های ارسال تعریف‌شده در پنل</span></div></div></section>
   <div className="fg-home-end fg-wrap"><span>ATELIER / DIGITAL FLAGSHIP</span><span>{brand} — EDITION 03</span><span>DESIGNED WITH INTENTION</span></div>
  </div>
 </FlagshipMotion>;
}

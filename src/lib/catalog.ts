export type Product={id:string;slug:string;name:string;english:string;category:"headphones"|"earbuds"|"watches"|"speakers";price:number;image:string;summary:string};
export const products:Product[]=[
{id:"one",slug:"aether-one",name:"هدفون ایر مکس",english:"AETHER One",category:"headphones",price:24900000,image:"/images/airpods-poster-desktop.webp",summary:"صدای فراگیر، طراحی بی‌زمان"},
{id:"buds",slug:"aether-buds",name:"ایرباد بی‌سیم",english:"AETHER Buds",category:"earbuds",price:8950000,image:"/media/earbuds.webp",summary:"صدای دقیق در ابعادی کوچک"},
{id:"watch",slug:"aether-watch",name:"ساعت هوشمند",english:"AETHER Watch",category:"watches",price:15900000,image:"/media/watch.webp",summary:"زمان، با ظرافت بیشتر"},
{id:"sound",slug:"aether-sound",name:"اسپیکر هوشمند",english:"AETHER Sound",category:"speakers",price:12900000,image:"/media/speaker.webp",summary:"فرم ساده، صدایی قدرتمند"}
];
export const categoryNames:Record<Product["category"],string>={headphones:"هدفون‌ها",earbuds:"ایربادها",watches:"ساعت‌ها",speakers:"اسپیکرها"};
export const formatPrice=(price:number)=>new Intl.NumberFormat("fa-IR").format(price)+" تومان";

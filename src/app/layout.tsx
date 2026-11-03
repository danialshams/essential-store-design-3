import type {Metadata,Viewport} from "next";
import {ShopProvider} from "@/components/ShopProvider";
import {Header} from "@/components/Header";
import {BottomNav} from "@/components/BottomNav";
import {Footer} from "@/components/Footer";
import {loadStore} from "@/lib/live-store";
import "./globals.css";
import "./flagship.css";
export async function generateMetadata():Promise<Metadata>{const store=await loadStore();return {title:{default:store.settings.seoTitle||store.settings.storeName,template:`%s | ${store.settings.storeName}`},description:store.settings.seoDescription||store.settings.description,robots:{index:store.live,follow:store.live}};}
export const viewport:Viewport={width:"device-width",initialScale:1,themeColor:"#141414"};
export const dynamic="force-dynamic";
export default async function RootLayout({children}:{children:React.ReactNode}){const store=await loadStore();return <html lang="fa" dir="rtl"><body><ShopProvider store={store}><a className="fg-skip" href="#main-content">رفتن به محتوای اصلی</a><Header/><main id="main-content">{children}</main><Footer/><BottomNav/></ShopProvider></body></html>}

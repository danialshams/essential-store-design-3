import type {Metadata,Viewport} from "next";
import "./model.css";
import "./home.css";
import "./product-story.css";
export const metadata:Metadata={title:"AETHER — Premium Digital Atelier",description:"فروشگاه پرمیوم AETHER، محصولات منتخب و تجربه سه‌بعدی ۳۶۰ درجه.",robots:{index:false,follow:false}};
export const viewport:Viewport={width:"device-width",initialScale:1,themeColor:"#11151B"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="fa" dir="rtl"><body>{children}</body></html>}

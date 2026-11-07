import type {Metadata, Viewport} from "next";
import "./model.css";

export const metadata: Metadata = {
  title:"AETHER / 001 — Studio Headphone Model",
  description:"تجربه فروشگاه آینده؛ نمایش سه‌بعدی واقعی محصول، متریال‌های زنده و طراحی پرمیوم.",
  robots:{index:false,follow:false}
};
export const viewport:Viewport={width:"device-width",initialScale:1,themeColor:"#090c12"};
export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="fa" dir="rtl"><body>{children}</body></html>;
}

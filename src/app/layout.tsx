import type {Metadata, Viewport} from "next";
import "./model.css";

export const metadata: Metadata = {
  title:"AirPods Max — 360° Model Viewer",
  description:"نمایش سه‌بعدی هدفون AirPods Max با قابلیت چرخش آزاد ۳۶۰ درجه.",
  robots:{index:false,follow:false}
};
export const viewport:Viewport={width:"device-width",initialScale:1,themeColor:"#090c12"};
export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="fa" dir="rtl"><head><link rel="preload" href="/models/airpods-max-instant.glb" as="fetch" type="model/gltf-binary" crossOrigin="anonymous" fetchPriority="high"/></head><body>{children}</body></html>;
}

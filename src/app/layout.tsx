import type {Metadata, Viewport} from "next";
import "./model.css";

export const metadata: Metadata = {
  title:"AirPods Max — 360° Model Viewer",
  description:"نمایش سه‌بعدی هدفون AirPods Max با قابلیت چرخش آزاد ۳۶۰ درجه.",
  robots:{index:false,follow:false}
};
export const viewport:Viewport={width:"device-width",initialScale:1,themeColor:"#090c12"};
export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="fa" dir="rtl"><head><link rel="preload" href="/models/airpods-preview-v1.glb" as="fetch" crossOrigin="anonymous" type="model/gltf-binary"/></head><body>{children}</body></html>;
}

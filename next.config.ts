import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  reactStrictMode:true,
  async headers(){
    return [{source:"/models/airpods-max-4k-ktx2-v1.glb",headers:[{key:"Cache-Control",value:"public, max-age=31536000, immutable"}]},
      {source:"/models/airpods-preview-v1.glb",headers:[{key:"Cache-Control",value:"public, max-age=31536000, immutable"}]},
      {source:"/basis/:path*",headers:[{key:"Cache-Control",value:"public, max-age=31536000, immutable"}]},
      {source:"/images/airpods-poster-:name.webp",headers:[{key:"Cache-Control",value:"public, max-age=86400"}]}];
  }
};
export default nextConfig;

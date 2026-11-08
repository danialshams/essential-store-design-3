"use client";

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpLeft } from "lucide-react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Environment, Lightformer } from "@react-three/drei";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

type Point = [number,number,number];
type Shot = { at:number; camera:Point; look:Point; yaw:number; fov:number };
type Chapter = { eyebrow:string; title:string; description:string; anchor:Point };

const CHAPTERS:Chapter[] = [
  {eyebrow:"01 / COMFORT",title:"راحتی، در هر لحظه",description:"بالشتک‌های نرم و طراحی ارگونومیک؛ برای تجربه‌ای راحت حتی در گوش‌دادن‌های طولانی.",anchor:[.82,-.62,.28]},
  {eyebrow:"02 / MATERIAL",title:"ظرافت در پرداخت فلز",description:"بدنه‌ای با خطوط پیوسته، بافت دقیق و پرداختی که در نور خودش را نشان می‌دهد.",anchor:[-.83,-.23,.43]},
  {eyebrow:"03 / STRUCTURE",title:"طراحی تا آخرین اتصال",description:"هدبند و بازوهای نگه‌دارنده برای تعادل، تنظیم‌پذیری و هماهنگی هر بخش طراحی شده‌اند.",anchor:[.1,1.22,.04]},
  {eyebrow:"04 / DETAILS",title:"کنترل، با یک لمس",description:"محل قرارگیری کلیدها و اتصالات، با تمرکز بر دسترسی ساده و استفاده روزمره.",anchor:[.85,-.88,.3]}
];

const SHOTS:Shot[] = [
  {at:0,camera:[3.15,1.08,6.65],look:[0,.08,0],yaw:-.15,fov:39},
  {at:.08,camera:[3.05,.65,5.65],look:[.3,-.2,0],yaw:-.05,fov:37},
  {at:.145,camera:[2.1,-.37,2.9],look:[.83,-.59,.15],yaw:.12,fov:33},
  {at:.245,camera:[2.1,-.37,2.9],look:[.83,-.59,.15],yaw:.12,fov:33},
  {at:.315,camera:[-2.5,-.12,3.18],look:[-.83,-.21,.20],yaw:-.25,fov:33},
  {at:.43,camera:[-2.5,-.12,3.18],look:[-.83,-.21,.20],yaw:-.25,fov:33},
  {at:.505,camera:[1.58,2.9,3.05],look:[.04,1.20,.05],yaw:.10,fov:35},
  {at:.63,camera:[1.58,2.9,3.05],look:[.04,1.20,.05],yaw:.10,fov:35},
  {at:.70,camera:[2.30,-.76,2.80],look:[.86,-.86,.12],yaw:.23,fov:33},
  {at:.81,camera:[2.30,-.76,2.80],look:[.86,-.86,.12],yaw:.23,fov:33},
  {at:.93,camera:[3.15,1.08,6.65],look:[0,.08,0],yaw:-.15,fov:39},
  {at:1,camera:[3.15,1.08,6.65],look:[0,.08,0],yaw:-.15,fov:39}
];
const smooth=(t:number)=>{const x=Math.max(0,Math.min(1,t));return x*x*(3-2*x)};
const interpolate=(p:number)=>{
  const at=Math.max(0,Math.min(1,p));
  let i=0;while(i<SHOTS.length-2&&at>SHOTS[i+1].at)i++;
  const a=SHOTS[i],b=SHOTS[i+1],t=smooth((at-a.at)/(b.at-a.at));
  const vector=(key:"camera"|"look"):Point=>[
    THREE.MathUtils.lerp(a[key][0],b[key][0],t),
    THREE.MathUtils.lerp(a[key][1],b[key][1],t),
    THREE.MathUtils.lerp(a[key][2],b[key][2],t)
  ];
  return {camera:vector("camera"),look:vector("look"),yaw:THREE.MathUtils.lerp(a.yaw,b.yaw,t),fov:THREE.MathUtils.lerp(a.fov,b.fov,t)};
};
function chapterAt(p:number){
  if(p<.105||p>.875)return -1;
  if(p<.285)return 0;
  if(p<.47)return 1;
  if(p<.66)return 2;
  return 3;
}
function SceneLights(){
  return <>
    <ambientLight intensity={.9}/>
    <hemisphereLight args={["#f1f6ff","#485569",1.05]}/>
    <directionalLight color="#f5f9ff" position={[4,6,6]} intensity={2.6}/>
    <directionalLight color="#b8cde5" position={[-4,-2,4]} intensity={1.55}/>
    <Environment resolution={64} frames={1}>
      <Lightformer form="rect" intensity={3.3} position={[2,5,4]} scale={[4,2,1]}/>
      <Lightformer form="rect" intensity={2.5} position={[-5,1,0]} scale={[2,5,1]} rotation={[0,Math.PI/2,0]}/>
    </Environment>
  </>;
}

function CameraStory({progress,chapter,stageRef,cardRef,dotRef,lineRef,mobile}:{
  progress:React.RefObject<number>;
  chapter:React.RefObject<number>;
  stageRef:React.RefObject<HTMLDivElement|null>;
  cardRef:React.RefObject<HTMLElement|null>;
  dotRef:React.RefObject<HTMLSpanElement|null>;
  lineRef:React.RefObject<SVGPathElement|null>;
  mobile:boolean;
}){
  const {scene}=useGLTF("/models/airpods-max-4k-opaque.glb","/draco/");
  const {camera,gl}=useThree();
  const group=useRef<THREE.Group>(null);
  const prevPos=useRef(new THREE.Vector3(3.15,1.08,6.65));
  const prevLook=useRef(new THREE.Vector3(0,.08,0));
  const prevYaw=useRef(-.15);
  const ray=useMemo(()=>new THREE.Raycaster(),[]);
  const projected=useMemo(()=>new THREE.Vector3(),[]);
  const target=useMemo(()=>new THREE.Vector3(),[]);
  const frames=useRef(0);
  const {copy,center,scale}=useMemo(()=>{
    const copy=scene.clone(true);
    const aniso=Math.min(8,gl.capabilities.getMaxAnisotropy());
    copy.traverse((node)=>{
      if(!(node instanceof THREE.Mesh))return;
      const fix=(material:THREE.Material)=>{
        const cloned=material.clone();
        cloned.transparent=false;cloned.opacity=1;cloned.depthWrite=true;
        if(cloned instanceof THREE.MeshStandardMaterial){
          for(const tex of [cloned.map,cloned.normalMap,cloned.roughnessMap,cloned.metalnessMap]){
            if(tex){tex.anisotropy=aniso;tex.needsUpdate=true;}
          }
        }
        return cloned;
      };
      node.material=Array.isArray(node.material)?node.material.map(fix):fix(node.material);
    });
    const bounds=new THREE.Box3().setFromObject(copy);
    const size=bounds.getSize(new THREE.Vector3());
    return {copy,center:bounds.getCenter(new THREE.Vector3()),scale:3.15/Math.max(.001,size.x,size.y,size.z)};
  },[scene,gl]);
  useEffect(()=>()=>{copy.traverse(node=>{
    if(node instanceof THREE.Mesh){
      const materials=Array.isArray(node.material)?node.material:[node.material];
      materials.forEach(m=>m.dispose());
    }
  });},[copy]);
  useFrame((_,delta)=>{
    const root=group.current;if(!root)return;
    const shot=interpolate(progress.current);
    const nextPos=new THREE.Vector3(...shot.camera),nextLook=new THREE.Vector3(...shot.look);
    if(mobile){
      nextPos.multiplyScalar(1.17);
      nextLook.y-=.43;nextPos.y-=.35;
    }else{
      // Keep the active detail clear of the explanatory glass card.
      nextLook.x+=.47;
    }
    const smoothing=1-Math.exp(-Math.min(.06,delta)*9);
    prevPos.current.lerp(nextPos,smoothing);
    prevLook.current.lerp(nextLook,smoothing);
    camera.position.copy(prevPos.current);
    camera.lookAt(prevLook.current);
    const perspective=camera as THREE.PerspectiveCamera;
    const intended=shot.fov+(mobile?8:0);
    if(Math.abs(perspective.fov-intended)>.03){
      perspective.fov=THREE.MathUtils.lerp(perspective.fov,intended,smoothing);
      perspective.updateProjectionMatrix();
    }
    prevYaw.current=THREE.MathUtils.lerp(prevYaw.current,shot.yaw,smoothing);
    root.rotation.y=prevYaw.current;
    const active=chapter.current;
    const dot=dotRef.current,path=lineRef.current,card=cardRef.current,stage=stageRef.current;
    if(active<0||!dot||!path||!card||!stage)return;
    if((frames.current++%2)!==0)return; // screen-space connector at max ~30Hz
    const stageRect=stage.getBoundingClientRect(),cardRect=card.getBoundingClientRect();
    if(stageRect.width===0||stageRect.height===0)return;
    target.set(...CHAPTERS[active].anchor);
    root.localToWorld(target);
    // The marker terminates on the *visible mesh*, not at an arbitrary screen coordinate.
    ray.set(camera.position,target.clone().sub(camera.position).normalize());
    const hit=ray.intersectObject(root,true)[0];
    projected.copy(hit?.point??target).project(camera);
    if(projected.z>1||projected.z< -1)return;
    const x=(projected.x*.5+.5)*stageRect.width;
    const y=(-projected.y*.5+.5)*stageRect.height;
    const endX=mobile?(cardRect.left-stageRect.left+cardRect.width*.5):(cardRect.left-stageRect.left);
    const endY=mobile?(cardRect.top-stageRect.top+6):(cardRect.top-stageRect.top+cardRect.height*.48);
    const bendX=mobile?x:endX-26;
    const bendY=mobile?endY-24:y;
    dot.style.transform="translate3d("+x+"px,"+y+"px,0)";
    path.setAttribute("d","M "+x+" "+y+" L "+bendX+" "+bendY+" L "+endX+" "+endY);
  });
  return <group ref={group}>
    <group scale={scale}>
      <group position={[-center.x,-center.y,-center.z]}><primitive object={copy}/></group>
    </group>
  </group>;
}

export default function ProductScrollStory(){
  const stageRef=useRef<HTMLDivElement|null>(null);
  const sectionRef=useRef<HTMLElement|null>(null);
  const cardRef=useRef<HTMLElement|null>(null);
  const dotRef=useRef<HTMLSpanElement|null>(null);
  const lineRef=useRef<SVGPathElement|null>(null);
  const progress=useRef(0);
  const chapter=useRef(-1);
  const [current,setCurrent]=useState(-1);
  const [mobile,setMobile]=useState(false);
  const [reduced,setReduced]=useState(false);
  const [visible,setVisible]=useState(false);
  useEffect(()=>{
    const media=matchMedia("(max-width:760px)");
    const update=()=>setMobile(media.matches);
    update();media.addEventListener("change",update);
    return()=>media.removeEventListener("change",update);
  },[]);
  useEffect(()=>{
    const el=stageRef.current;
    if(!el)return;
    const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{rootMargin:"150px 0px"});
    observer.observe(el);return()=>observer.disconnect();
  },[reduced]);
  useLayoutEffect(()=>{
    const element=sectionRef.current,stage=stageRef.current;
    if(!element||!stage)return;
    const motion=matchMedia("(prefers-reduced-motion: reduce)");
    if(motion.matches){setReduced(true);return;}
    gsap.registerPlugin(ScrollTrigger);
    const trigger=ScrollTrigger.create({
      trigger:element,
      start:"top top",
      end:()=>"+="+Math.round(Math.max(window.innerHeight*4.2,2300)),
      pin:stage,
      pinSpacing:true,
      anticipatePin:1,
      invalidateOnRefresh:true,
      onUpdate(self){
        progress.current=self.progress;
        const next=chapterAt(self.progress);
        if(chapter.current!==next){chapter.current=next;setCurrent(next);}
      }
    });
    const refresh=()=>ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh).catch(()=>{});
    window.addEventListener("resize",refresh,{passive:true});
    return()=>{window.removeEventListener("resize",refresh);trigger.kill();};
  },[]);
  return <section className="product-story" ref={sectionRef} id="details" aria-label="معرفی سه‌بعدی جزئیات هدفون">
    <div className="product-story-stage" ref={stageRef}>
      <div className="product-story-atmosphere" aria-hidden="true"/>
      <div className="product-story-top">
        <span>03 / A CLOSER LOOK</span><span>طراحی در جزئیات</span>
      </div>
      <div className="product-story-render" aria-hidden="true">
        <img src="/images/airpods-poster-desktop.webp" className="product-story-placeholder" alt=""/>
        <Canvas dpr={mobile?[.8,1.25]:[1,1.6]} frameloop={visible?"always":"demand"}
          camera={{position:[3.15,1.08,6.65],near:.06,far:70,fov:39}}
          gl={{alpha:true,antialias:!mobile,powerPreference:"high-performance"}}
          onCreated={({gl})=>{gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.28;}}>
          <SceneLights/>
          <Suspense fallback={null}>
            <CameraStory progress={progress} chapter={chapter} stageRef={stageRef}
              cardRef={cardRef} dotRef={dotRef} lineRef={lineRef} mobile={mobile}/>
          </Suspense>
        </Canvas>
      </div>
      <div className="product-story-annotation" data-active={current>=0} aria-hidden="true">
        <svg className="product-story-lines"><path ref={lineRef} /></svg>
        <span className="product-story-anchor" ref={dotRef}/>
      </div>
      <aside className="product-story-card" ref={cardRef} data-active={current>=0} aria-live="polite">
        {current>=0 ? <>
          <small>{CHAPTERS[current].eyebrow}</small>
          <h2>{CHAPTERS[current].title}</h2>
          <p>{CHAPTERS[current].description}</p>
          <span className="product-story-index">{String(current+1).padStart(2,"0")} <i/> 04</span>
        </> : <>
          <small>DESIGNED IN EVERY DETAIL</small>
          <h2>زیبایی، از نزدیک.</h2>
          <p>اسکرول کنید تا تک‌تک اجزای این هدفون را از زاویه‌ای تازه ببینید.</p>
          <Link href="/product/aether-one" className="product-story-link">مشاهده محصول <ArrowUpLeft size={18}/></Link>
        </>}
      </aside>
      <div className="product-story-progress" aria-hidden="true">
        {CHAPTERS.map((item,i)=><span key={item.eyebrow} className={current===i?"active":""}/>)}
      </div>
      <span className="product-story-scroll" aria-hidden="true">برای بررسی جزئیات اسکرول کنید ↓</span>
    </div>
  </section>;
}

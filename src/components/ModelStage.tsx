"use client";
import {useEffect,useRef,useState,useMemo} from "react";
import {Canvas,useFrame,useThree} from "@react-three/fiber";
import {Environment,Lightformer,OrbitControls,useGLTF} from "@react-three/drei";
import * as THREE from "three";

export type Chapter={id:string;eyebrow:string;title:string;description:string};
export const CHAPTERS:Chapter[]=[
 {id:"01",eyebrow:"THE OBJECT",title:"فرم، قبل از هر چیز",description:"یک هدفون با بدنه آلومینیومی، خطوط نرم و جزئیاتی که از هر زاویه دیده می‌شوند."},
 {id:"02",eyebrow:"SUSPENSION CANOPY",title:"هدبند مشبک",description:"پارچه تنفس‌پذیر با رشته‌های درهم‌تنیده؛ معلق روی فریم فلزی انعطاف‌پذیر."},
 {id:"03",eyebrow:"PRECISION JOINT",title:"اتصالات دقیق",description:"بازوی تلسکوپی و لولای فلزی با چندین سطح پرداخت و حرکت مکانیکی ظریف."},
 {id:"04",eyebrow:"SOFT CONTACT",title:"بالشتک نرم",description:"حجم واقعی فوم، بافت پارچه و درزهای ظریف اطراف گوشی."},
 {id:"05",eyebrow:"ACOUSTIC ENGINEERING",title:"درون صدا",description:"اجزای داخلی مستقل می‌شوند تا محفظه صوتی، درایور و شبکه محافظ را ببینی."},
 {id:"06",eyebrow:"THE COMPLETE FORM",title:"یکپارچه و کامل",description:"تمام قطعات دوباره کنار هم قرار می‌گیرند؛ برای دیدن همه زوایا، چرخش آزاد را فعال کن."}
];
const MARKS=[0,.175,.35,.53,.71,.865];
const ease=(v:number)=>{const x=Math.max(0,Math.min(1,v));return x*x*(3-2*x)};
const track=(v:number,a:number,b:number)=>ease((v-a)/(b-a));
type Shot={t:number;p:[number,number,number];target:[number,number,number];fov:number};
const shots:Shot[]=[
 {t:0,p:[3.3,1.1,8.7],target:[.45,.28,0],fov:35},
 {t:.14,p:[2.3,.9,7.3],target:[.30,.3,.08],fov:35},
 {t:.235,p:[1.45,2.73,3.35],target:[0,1.80,.03],fov:31},
 {t:.32,p:[1.63,2.34,3.67],target:[.1,1.73,0],fov:31},
 {t:.395,p:[3.1,.66,3.75],target:[1.18,.05,.02],fov:30},
 {t:.48,p:[2.88,.30,3.65],target:[1.13,-.23,.03],fov:31},
 {t:.585,p:[-2.35,-.74,-3.55],target:[-1.1,-.70,-.17],fov:31},
 {t:.68,p:[-2.38,-.83,-3.38],target:[-1.16,-.70,-.20],fov:29},
 {t:.755,p:[2.75,-.73,3.88],target:[1.15,-.70,-.10],fov:30},
 {t:.82,p:[2.62,-.69,3.53],target:[1.16,-.65,-.14],fov:28},
 {t:.91,p:[3.2,.95,8],target:[.3,.2,0],fov:36},
 {t:1,p:[3.3,1.1,8.7],target:[.40,.3,0],fov:35}
];
function frameAt(p:number){
 let i=0;while(i<shots.length-2&&p>shots[i+1].t)i++;
 const a=shots[i],b=shots[i+1],t=ease((p-a.t)/(b.t-a.t));
 const lerp=(a:number,b:number)=>a+(b-a)*t;
 const point=(type:"p"|"target")=>new THREE.Vector3(...a[type]).lerp(new THREE.Vector3(...b[type]),t);
 return {p:point("p"),target:point("target"),fov:lerp(a.fov,b.fov)};
}
function PhysicalHeadphone({progress,free,reduce}:{progress:React.RefObject<number>;free:boolean;reduce:boolean}){
 const data=useGLTF("/models/aether-studio.glb","/draco/");
 const gltf=useMemo(()=>data.scene.clone(true),[data.scene]);
 const nodes=useRef<Record<string,THREE.Object3D|null>>({});
 const parent=useRef<THREE.Group>(null);
 const manualOrbit=useRef(0);
 useEffect(()=>{
  for(const name of ["SHELL_L","SHELL_R","DRIVER_L","DRIVER_R","CUSHION_L","CUSHION_R","HEADBAND","HINGE_L","HINGE_R"]){
   nodes.current[name]=gltf.getObjectByName(name)??null;
  }
 },[gltf]);
 useFrame(({clock},delta)=>{
  const p=reduce?0:progress.current??0;
  const explode=track(p,.72,.81)*(1-track(p,.855,.98));
  const tween=Math.min(1,Math.max(0,delta)*11);
  const move=(n:string,z:number,x=0)=>{
    const ob=nodes.current[n];
    if(ob){ob.position.z=THREE.MathUtils.lerp(ob.position.z,z,tween);ob.position.x=THREE.MathUtils.lerp(ob.position.x,x,tween);}
  };
  move("SHELL_L",explode*.66,-explode*.14);
  move("SHELL_R",explode*.66,explode*.14);
  move("DRIVER_L",explode*.18);
  move("DRIVER_R",explode*.18);
  move("CUSHION_L",-explode*.45);
  move("CUSHION_R",-explode*.45);
  if(!free&&!reduce&&parent.current){
   const reveal=(1-track(p,.10,.18)) + track(p,.88,.98);
   manualOrbit.current+=Math.min(delta,.04)*.16*reveal;
   parent.current.rotation.y=manualOrbit.current;
   parent.current.position.y=Math.sin(clock.elapsedTime*.48)*.025*reveal;
  }
  if(free&&parent.current){parent.current.rotation.y=THREE.MathUtils.damp(parent.current.rotation.y,0,5,delta);parent.current.position.y=0}
 });
 return <group ref={parent}><primitive object={gltf}/></group>;
}
function CinematicCamera({progress,free,mobile,reduce}:{progress:React.RefObject<number>;free:boolean;mobile:boolean;reduce:boolean}){
 const {camera}=useThree();
 const look=useRef(new THREE.Vector3(.4,.3,0));
 const position=useRef(new THREE.Vector3(3.3,1.1,8.7));
 const wasFree=useRef(false);
 useEffect(()=>{
  if(free){camera.position.set(3,1.05,8.5);camera.lookAt(0,.2,0);}
  wasFree.current=free;
 },[free,camera]);
 useFrame((_,delta)=>{
  if(free)return;
  const p=reduce?0:progress.current??0;
  const key=frameAt(p);
  if(mobile){
   const macro=track(p,.17,.27)*(1-track(p,.85,.95));
   key.p.multiplyScalar(1.1+.14*macro);
   key.target.y+=.08;
  }else{
   key.target.x+=.48; // put the model to the left of the text on desktop
  }
  if(wasFree.current){position.current.copy(camera.position);wasFree.current=false}
  const f=1-Math.exp(-4.3*Math.min(delta,.06));
  position.current.lerp(key.p,f);look.current.lerp(key.target,f);
  camera.position.copy(position.current);camera.lookAt(look.current);
  const cam=camera as THREE.PerspectiveCamera;
  cam.fov=THREE.MathUtils.lerp(cam.fov,key.fov+(mobile?8:0),f);cam.updateProjectionMatrix();
 });
 return null;
}
function Lighting({mobile}:{mobile:boolean}){
 return <>
 <ambientLight intensity={1.15}/>
 <hemisphereLight args={["#f3f6fb","#17202b",1.9]}/>
 <directionalLight position={[5,5,5]} intensity={3.2} color="#f5f7fc"/>
 <directionalLight position={[-5,1,-4]} intensity={2.9} color="#d9e8fb"/>
 <directionalLight position={[1,-3,4]} intensity={1.7} color="#91b4e1"/>
 {!mobile&&<Environment resolution={96} frames={1}>
  <Lightformer form="rect" intensity={4} position={[1,4,5]} rotation={[-.4,0,0]} scale={[5,2,1]}/>
  <Lightformer form="rect" intensity={5} position={[-5,0,1]} rotation={[0,Math.PI/2,0]} scale={[2,6,1]}/>
  <Lightformer form="rect" intensity={3} position={[4,-1,-2]} rotation={[0,-Math.PI/2,0]} scale={[3,5,1]}/>
 </Environment>}
 </>;
}
export default function ModelStage({progress,free,mobile,reduce}:{progress:React.RefObject<number>;free:boolean;mobile:boolean;reduce:boolean}){
 return <Canvas dpr={mobile?[.85,1.2]:[1,1.65]} camera={{position:[3.3,1.1,8.7],fov:35,near:.06,far:80}} gl={{antialias:!mobile,powerPreference:"high-performance",alpha:true}} onCreated={({gl})=>{gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.65}}>
 <Lighting mobile={mobile}/>
 <PhysicalHeadphone progress={progress} free={free} reduce={reduce}/>
 <CinematicCamera progress={progress} free={free} mobile={mobile} reduce={reduce}/>
 {free&&<OrbitControls makeDefault target={[0,.2,0]} enablePan={false} enableRotate enableZoom autoRotate autoRotateSpeed={.55} enableDamping dampingFactor={.075} minDistance={3} maxDistance={13} minPolarAngle={.12} maxPolarAngle={Math.PI-.12}/>}
 </Canvas>;
}
useGLTF.preload("/models/aether-studio.glb","/draco/");


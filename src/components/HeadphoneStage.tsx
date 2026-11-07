"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {Canvas, useFrame, useThree} from "@react-three/fiber";
import {Environment, Lightformer, OrbitControls} from "@react-three/drei";
import * as THREE from "three";

export type Finish = "titanium" | "onyx" | "frost";
type StageProps = { finish:Finish; progress:React.RefObject<number>; visible:boolean; mobile:boolean };
type Palette = {aluminum:string;edge:string;soft:string;knuckle:string;grille:string};
const PAL:Record<Finish,Palette> = {
  titanium:{aluminum:"#b8c4ce",edge:"#f0f4f9",soft:"#586270",knuckle:"#939fad",grille:"#364451"},
  onyx:{aluminum:"#353f4b",edge:"#8495a7",soft:"#252e39",knuckle:"#657688",grille:"#1a2631"},
  frost:{aluminum:"#8da8bc",edge:"#dbeefb",soft:"#526d82",knuckle:"#a8c3d7",grille:"#304c60"}
};
const clamp=(v:number)=>THREE.MathUtils.clamp(v,0,1);
const ease=(v:number)=>{const x=clamp(v);return x*x*(3-2*x)};
const rise=(v:number,a:number,b:number)=>ease((v-a)/(b-a));
const lerp=THREE.MathUtils.lerp;

function RoundedRect({width,height,radius}:{width:number;height:number;radius:number}){
 const s=useMemo(()=>{
  const x=-width/2,y=-height/2,r=radius;
  const shape=new THREE.Shape();
  shape.moveTo(x+r,y);shape.lineTo(x+width-r,y);
  shape.quadraticCurveTo(x+width,y,x+width,y+r);
  shape.lineTo(x+width,y+height-r);
  shape.quadraticCurveTo(x+width,y+height,x+width-r,y+height);
  shape.lineTo(x+r,y+height);
  shape.quadraticCurveTo(x,y+height,x,y+height-r);
  shape.lineTo(x,y+r);shape.quadraticCurveTo(x,y,x+r,y);
  return shape;
 },[width,height,radius]);
 return s;
}
function CaseGeometry({width=.99,height=1.22,depth=.16,bevel=.052,radius=.23}:{width?:number;height?:number;depth?:number;bevel?:number;radius?:number}){
 const shape=RoundedRect({width,height,radius});
 const geo=useMemo(()=>new THREE.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:true,bevelThickness:bevel,bevelSize:bevel*.65,bevelSegments:4,curveSegments:16}),[shape,depth,bevel]);
 useEffect(()=>()=>geo.dispose(),[geo]);return <primitive object={geo} attach="geometry"/>;
}
function Metal({color,roughness=.27,metalness=.91}:{color:string;roughness?:number;metalness?:number}){
 return <meshPhysicalMaterial color={color} metalness={metalness} roughness={roughness} clearcoat={.32} clearcoatRoughness={.2}/>;
}
function Rail({points,radius,color,roughness=.29}:{points:number[][];radius:number;color:string;roughness?:number}){
 const g=useMemo(()=>new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(p[0],p[1],p[2]))),96,radius,10,false),[points,radius]);
 useEffect(()=>()=>g.dispose(),[g]);
 return <mesh geometry={g} castShadow><Metal color={color} roughness={roughness}/></mesh>;
}
function Connector({from,to,radius=.055,color}:{from:[number,number,number];to:[number,number,number];radius?:number;color:string}){
 const center=useMemo(()=>new THREE.Vector3().addVectors(new THREE.Vector3(...from),new THREE.Vector3(...to)).multiplyScalar(.5),[from,to]);
 const len=useMemo(()=>new THREE.Vector3(...from).distanceTo(new THREE.Vector3(...to)),[from,to]);
 const rot=useMemo(()=>new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(...to).sub(new THREE.Vector3(...from)).normalize()),[from,to]);
 return <mesh position={center} quaternion={rot} castShadow><cylinderGeometry args={[radius,radius,len,24]}/><Metal color={color}/></mesh>;
}
function Screw({x,y,z,shine}:{x:number;y:number;z:number;shine:string}){
 return <group position={[x,y,z]}>
  <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.019,.019,.012,16]}/><Metal color={shine} roughness={.22}/></mesh>
  <mesh position={[0,0,.009]} rotation={[0,0,Math.PI/4]}><boxGeometry args={[.021,.003,.002]}/><meshBasicMaterial color="#1c2934"/></mesh>
 </group>;
}
function MeshCanopy(){
 const geometry=useMemo(()=>{
  const g=new THREE.BufferGeometry(),pos:number[]=[],uv:number[]=[],idx:number[]=[];
  const N=42,M=18;
  for(let i=0;i<=N;i++){
   const u=i/N,x=(u-.5)*1.78,arc=Math.sqrt(Math.max(0,1-(x/.94)**2));
   const y=1.52+.36*arc;
   for(let j=0;j<=M;j++){
    const v=j/M,z=(v-.5)*.57*(.95+.05*arc),sag=Math.sin(Math.PI*v)*.075;
    pos.push(x,y-sag,z);uv.push(u,v);
    if(i<N&&j<M){const a=i*(M+1)+j,b=a+M+1;idx.push(a,b,a+1,b,b+1,a+1)}
   }
  }
  g.setAttribute("position",new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute("uv",new THREE.Float32BufferAttribute(uv,2));
  g.setIndex(idx);g.computeVertexNormals();return g;
 },[]);
 const weave=useMemo(()=>{
  const cnv=document.createElement("canvas");cnv.width=512;cnv.height=256;
  const ctx=cnv.getContext("2d");
  if(ctx){
   ctx.clearRect(0,0,512,256);
   ctx.fillStyle="#70879b";ctx.fillRect(0,0,512,256);
   for(let x=0;x<512;x+=10){
     for(let y=0;y<256;y+=10){
      ctx.fillStyle="#33465d";ctx.fillRect(x+2,y+2,5,6);
      ctx.fillStyle="rgba(177,194,213,.45)";ctx.fillRect(x+1,y+1,1,7);
      ctx.fillStyle="rgba(183,197,213,.16)";ctx.fillRect(x+2,y+8,7,1);
     }
   }
  }
  const t=new THREE.CanvasTexture(cnv);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t;
 },[]);
 useEffect(()=>()=>{geometry.dispose();weave.dispose()},[geometry,weave]);
 return <group>
   <mesh geometry={geometry} receiveShadow><meshPhysicalMaterial map={weave} color="#dae7f2" side={THREE.DoubleSide} metalness={.08} roughness={.89} sheen={.48} sheenRoughness={.82}/></mesh>
   <Rail points={[[-.90,1.51,-.29],[-.70,1.72,-.28],[0,1.86,-.28],[.70,1.72,-.28],[.90,1.51,-.29]]} radius={.023} color="#6c7f90"/>
   <Rail points={[[-.90,1.51,.29],[-.70,1.72,.28],[0,1.86,.28],[.70,1.72,.28],[.90,1.51,.29]]} radius={.023} color="#6c7f90"/>
 </group>;
}
function EarCushion({color}:{color:string}){
 const shape=RoundedRect({width:.91,height:1.11,radius:.23});
 const geo=useMemo(()=>{
  const pts=shape.getSpacedPoints(92);
  const curve=new THREE.CatmullRomCurve3(pts.map(q=>new THREE.Vector3(q.x,q.y,0)),true,"centripetal");
  return new THREE.TubeGeometry(curve,120,.113,16,true);
 },[shape]);
 const fabric=useMemo(()=>{
  const c=document.createElement("canvas");c.width=256;c.height=256;const q=c.getContext("2d");
  if(q){
   q.fillStyle="#c2c7c9";q.fillRect(0,0,256,256);
   for(let x=0;x<256;x+=5)for(let y=0;y<256;y+=5){
    q.fillStyle=(x+y)%3===0?"#8c979e":"#9ca7ae";q.fillRect(x,y,2,1);
   }
  }
  const texture=new THREE.CanvasTexture(c);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
  texture.repeat.set(14,10);texture.colorSpace=THREE.SRGBColorSpace;return texture;
 },[]);
 useEffect(()=>()=>{geo.dispose();fabric.dispose()},[geo,fabric]);
 return <group>
  <mesh geometry={geo} castShadow><meshPhysicalMaterial color={color} bumpMap={fabric} bumpScale={.022} roughness={.96} metalness={0} sheen={.55} sheenRoughness={.8}/></mesh>
  <mesh position={[0,0,-.09]} scale={[.68,.82,.11]}>
    <sphereGeometry args={[1,32,24]}/><meshStandardMaterial color="#101820" roughness={.94}/>
  </mesh>
  {Array.from({length:36},(_,i)=>{
    const t=i/36*Math.PI*2;const x=Math.cos(t)*.42,y=Math.sin(t)*.53;
    return <mesh key={i} position={[x,y,-.035]} rotation={[0,0,t]}><boxGeometry args={[.018,.005,.005]}/><meshStandardMaterial color="#8b9baa" roughness={.85}/></mesh>;
  })}
 </group>;
}
function Driver({palette}:{palette:Palette}){
 return <group>
  <mesh><CaseGeometry width={.9} height={1.12} depth={.05} bevel={.022}/><meshStandardMaterial color="#151f2a" metalness={.41} roughness={.63}/></mesh>
  <mesh position={[0,0,.085]} scale={[.42,.50,.075]}>
    <sphereGeometry args={[1,40,32]}/><meshStandardMaterial color="#182431" metalness={.38} roughness={.65}/>
  </mesh>
  {Array.from({length:10},(_,i)=><mesh key={i} position={[0,0,.17]} rotation={[0,0,i*Math.PI/10]}>
    <torusGeometry args={[.06+i*.034,.004,5,68]}/><Metal color={i%2?palette.grille:"#7c90a4"} roughness={.35}/></mesh>)}
  {Array.from({length:27},(_,i)=>{const a=i/27*Math.PI*2;return <mesh key={i} position={[Math.sin(a)*.4,Math.cos(a)*.47,.18]}><sphereGeometry args={[.010,6,6]}/><meshStandardMaterial color={palette.edge} metalness={.72} roughness={.5}/></mesh>})}
  <mesh position={[0,0,.19]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.08,.08,.022,32]}/><Metal color={palette.knuckle}/></mesh>
 </group>;
}
function EarCup({side,palette,progress}:{side:-1|1;palette:Palette;progress?:React.RefObject<number>}){
 const shell=useRef<THREE.Group>(null),padding=useRef<THREE.Group>(null),speaker=useRef<THREE.Group>(null);
 useFrame(()=>{
   const p=progress?.current??0;
   const split=rise(p,.12,.27)*(1-rise(p,.84,.97));
   if(shell.current)shell.current.position.set(side*.13*split,0,.26+1.25*split);
   if(speaker.current)speaker.current.position.set(0,0,.10+.50*split);
   if(padding.current)padding.current.position.set(0,0,-.22-.58*split);
 });
 return <group position={[side*1.15,-.45,0]} rotation={[0,side*.075,side*.025]}>
  <mesh position={[0,0,.07]} castShadow><CaseGeometry width={1.04} height={1.31} depth={.22} bevel={.067}/><Metal color="#1c2834" roughness={.49}/></mesh>
  <group ref={shell} position={[0,0,.26]}>
    <mesh castShadow><CaseGeometry width={1.03} height={1.28} depth={.15} bevel={.072}/><Metal color={palette.aluminum} roughness={.33}/></mesh>
    <mesh position={[0,0,.17]} castShadow><CaseGeometry width={.985} height={1.225} depth={.045} bevel={.038}/><Metal color={palette.aluminum} roughness={.26}/></mesh>
    <mesh position={[0,0,.251]}><CaseGeometry width={.88} height={1.1} depth={.008} bevel={.018}/><meshPhysicalMaterial color={palette.aluminum} metalness={.96} roughness={.35}/></mesh>
    {[-1,1].flatMap(x=>[-1,1].map(y=><Screw key={x+":"+y} x={x*.37} y={y*.49} z={.29} shine={palette.knuckle}/>))}
    <mesh position={[-.30,-.56,.18]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.074,.074,.11,42]}/><Metal color="#73869a" roughness={.21}/></mesh>
    {Array.from({length:18},(_,i)=><mesh key={i} position={[-.30+Math.sin(i*Math.PI/9)*.065,-.625,.18+Math.cos(i*Math.PI/9)*.065]}>
      <boxGeometry args={[.012,.014,.009]}/><meshStandardMaterial color="#23303e" roughness={.44}/></mesh>)}
    <mesh position={[.24,-.58,.16]}><boxGeometry args={[.12,.025,.018]}/><meshStandardMaterial color="#192532" roughness={.6}/></mesh>
  </group>
  <group ref={speaker} position={[0,0,.10]}><Driver palette={palette}/></group>
  <group ref={padding} position={[0,0,-.22]}><EarCushion color={palette.soft}/></group>
  <group position={[0,.78,-.07]}>
   <Connector from={[0,-.01,0]} to={[0,.37,0]} radius={.072} color={palette.knuckle}/>
   <mesh position={[0,.36,0]} rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[.15,.15,.16,32]}/><Metal color={palette.edge}/></mesh>
   <mesh position={[0,.36,.09]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.058,.058,.02,20]}/><Metal color="#36485a"/></mesh>
  </group>
 </group>;
}
export function HeadphoneModel({finish,progress}:{finish:Finish;progress?:React.RefObject<number>}){
 const palette=PAL[finish];
 return <group>
   <MeshCanopy/>
   <Rail points={[[-1.21,.10,-.09],[-1.30,.52,-.12],[-1.16,1.17,-.07],[-.79,1.55,.04]]} radius={.085} color="#182430"/>
   <Rail points={[[1.21,.10,-.09],[1.30,.52,-.12],[1.16,1.17,-.07],[.79,1.55,.04]]} radius={.085} color="#182430"/>
   {([-1,1] as const).map(side=><group key={side}>
    <Connector from={[side*1.21,.1,-.09]} to={[side*1.18,-.35,-.07]} radius={.052} color={palette.edge}/>
    <Connector from={[side*1.21,.1,-.09]} to={[side*1.22,.36,-.10]} radius={.047} color={palette.knuckle}/>
    <mesh position={[side*1.22,.1,-.09]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.113,.113,.12,24]}/><Metal color={palette.knuckle}/></mesh>
    <EarCup side={side} palette={palette} progress={progress}/>
   </group>)}
 </group>;
}
type Keyframe={p:number;pos:[number,number,number];look:[number,number,number];fov:number;heading:number};
const SHOTS:Keyframe[]=[
 {p:0,   pos:[0,.32,7.7],look:[0,.33,0],fov:35,heading:-.20},
 {p:.13, pos:[1.8,.45,6.7],look:[0,.08,0],fov:35,heading:.12},
 {p:.25, pos:[1.85,-.15,5.3],look:[.48,-.42,.40],fov:35,heading:.09},
 {p:.33, pos:[2.95,-.42,3.55],look:[1.12,-.52,0],fov:33,heading:-.05},
 {p:.43, pos:[3.5,-.43,-2.85],look:[1.15,-.48,-.15],fov:34,heading:-.07},
 {p:.52, pos:[3.55,.65,-2.45],look:[1.25,.35,-.05],fov:34,heading:-.03},
 {p:.61, pos:[2.83,1.68,2.7],look:[1.18,.90,-.08],fov:33,heading:.12},
 {p:.68, pos:[3.10,.95,3.3],look:[1.10,.88,-.03],fov:33,heading:.12},
 {p:.77, pos:[-2.15,-.40,3.85],look:[-1.16,-.46,.13],fov:32,heading:.10},
 {p:.84, pos:[-2.10,-.37,4.3],look:[-1.15,-.44,.15],fov:33,heading:.08},
 {p:.97, pos:[0,.32,7.8],look:[0,.24,0],fov:35,heading:-.14},
 {p:1,   pos:[0,.32,7.8],look:[0,.24,0],fov:35,heading:-.14}
];
function sampleShot(p:number){
 const t=clamp(p);
 let i=0;while(i<SHOTS.length-2&&t>SHOTS[i+1].p)i++;
 const a=SHOTS[i],b=SHOTS[i+1],u=ease((t-a.p)/(b.p-a.p));
 const v=(s:"pos"|"look"): [number,number,number]=>[
  lerp(a[s][0],b[s][0],u),lerp(a[s][1],b[s][1],u),lerp(a[s][2],b[s][2],u)
 ];
 return {pos:v("pos"),look:v("look"),fov:lerp(a.fov,b.fov,u),heading:lerp(a.heading,b.heading,u)};
}
function CinemaRig({finish,progress,mobile,reduced}:{finish:Finish;progress:React.RefObject<number>;mobile:boolean;reduced:boolean}){
 const {camera}=useThree();
 const model=useRef<THREE.Group>(null),lastPos=useRef(new THREE.Vector3(0,.32,7.7)),lastLook=useRef(new THREE.Vector3(0,.33,0)),auto=useRef(0);
 useFrame(({clock},delta)=>{
  const p=clamp(progress.current??0);
  const shot=sampleShot(reduced?0:p);
  const p0=new THREE.Vector3(...shot.pos),at=new THREE.Vector3(...shot.look);
  if(!mobile)at.x+=1.25+.36*rise(p,.25,.38)*(1-rise(p,.86,.98));
  if(mobile){
   // Camera composition is tuned independently of desktop.
   const macro=rise(p,.18,.37)*(1-rise(p,.85,.97));
   p0.z+=.85;
   p0.multiplyScalar(1.09+.26*macro);
   at.y+=.15;
  }
  const blend=1-Math.exp(-Math.min(delta,.06)*5.8);
  lastPos.current.lerp(p0,blend);lastLook.current.lerp(at,blend);
  camera.position.copy(lastPos.current);camera.lookAt(lastLook.current);
  const pc=camera as THREE.PerspectiveCamera;
  const intended=shot.fov+(mobile?6+6*rise(p,.18,.37)*(1-rise(p,.85,.97)):0);
  pc.fov=lerp(pc.fov,intended,blend);pc.updateProjectionMatrix();
  if(model.current){
   // Gentle idle turn only for reveal and finale, not during macro inspection.
   const idle=(1-rise(p,.13,.24))+rise(p,.91,1);
   if(!reduced)auto.current+=Math.min(delta,.05)*.37*idle;
   model.current.rotation.y=shot.heading+auto.current;
   model.current.position.y=!reduced?Math.sin(clock.elapsedTime*.78)*.026*(1-rise(p,.13,.25)):0;
  }
 });
 return <group ref={model}><HeadphoneModel finish={finish} progress={progress}/></group>;
}
function StudioLights({economy=false}:{economy?:boolean}){
 return <>
  <ambientLight intensity={1.42}/>
  <hemisphereLight args={["#e3eefb","#182431",2]}/>
  <directionalLight intensity={3.2} position={[5,6,6]} color="#f4f8ff"/>
  <directionalLight intensity={2.2} position={[-4,-1,3]} color="#b4cde9"/>
  <directionalLight intensity={3.8} position={[3,1,-5]} color="#d9e9f7"/>
  <directionalLight intensity={1.3} position={[-3,-2,-5]} color="#bbd6f2"/>
  {!economy&&<Environment resolution={64} frames={1}>
   <Lightformer form="rect" intensity={4} position={[0,4,4]} scale={[5,2,1]} rotation={[-.35,0,0]}/>
   <Lightformer form="rect" intensity={4} position={[-5,0,2]} scale={[2,6,1]} rotation={[0,Math.PI/2,0]}/>
   <Lightformer form="rect" intensity={2.5} position={[5,1,0]} scale={[2,4,1]} rotation={[0,-Math.PI/2,0]} color="#9abde5"/>
  </Environment>}
 </>;
}
export default function HeadphoneStage({finish,progress,visible,mobile}:StageProps){
 const [reduced,setReduced]=useState(false);
 useEffect(()=>{
  const m=matchMedia("(prefers-reduced-motion: reduce)");const check=()=>setReduced(m.matches);
  check();m.addEventListener("change",check);return()=>m.removeEventListener("change",check);
 },[]);
 return <div className="cinema-three" aria-hidden="true">
  <Canvas dpr={mobile?[.8,1.2]:[1,1.6]} frameloop={visible?"always":"demand"} camera={{position:[0,.32,7.7],fov:35,near:.06,far:100}} gl={{antialias:!mobile,powerPreference:"high-performance"}} onCreated={({gl})=>{gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.33}}>
    <StudioLights economy={mobile}/>
    <CinemaRig finish={finish} progress={progress} mobile={mobile} reduced={reduced}/>
  </Canvas>
 </div>;
}
export function HeadphoneInspector({finish}:{finish:Finish}){
 return <Canvas dpr={[.9,1.5]} camera={{position:[0,.26,6.5],fov:37,near:.05,far:100}} gl={{powerPreference:"high-performance",antialias:true}} onCreated={({gl})=>{gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.4}}>
    <StudioLights/>
    <HeadphoneModel finish={finish}/>
    <OrbitControls enableDamping dampingFactor={.08} enableZoom enablePan={false} autoRotate autoRotateSpeed={.8} minDistance={3.2} maxDistance={10} minPolarAngle={.15} maxPolarAngle={Math.PI-.15}/>
 </Canvas>;
}

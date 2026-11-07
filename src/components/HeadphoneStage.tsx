"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import {Canvas,useFrame} from "@react-three/fiber";
import {Float} from "@react-three/drei";
import * as THREE from "three";

export type Finish = "titanium" | "onyx" | "frost";

const values:Record<Finish,{metal:string,edge:string,glow:string}> = {
 titanium:{metal:"#b8c5d1",edge:"#e8f3ff",glow:"#89a9d0"},
 onyx:{metal:"#303844",edge:"#9daabb",glow:"#a2b2da"},
 frost:{metal:"#8aa0b5",edge:"#dfedff",glow:"#a2dbf4"}
};
function CurvedBand({points,radius,color,metalness=0.55,roughness=0.26}:{points:number[][],radius:number,color:string,metalness?:number,roughness?:number}){
 const path=useMemo(()=>new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(p[0],p[1],p[2]))),[points]);
 const geo=useMemo(()=>new THREE.TubeGeometry(path,96,radius,10,false),[path,radius]);
 useEffect(()=>()=>geo.dispose(),[geo]);
 return <mesh geometry={geo} castShadow><meshPhysicalMaterial color={color} metalness={metalness} roughness={roughness} clearcoat={0.8}/></mesh>;
}
const arch=[[-1.18,-.02,-.09],[-1.33,.62,-.09],[-1.12,1.27,-.05],[-.65,1.76,0],[0,1.91,0],[.65,1.76,0],[1.12,1.27,-.05],[1.33,.62,-.09],[1.18,-.02,-.09]];
const archInset=[[-1.13,.05,-.02],[-1.26,.62,-.02],[-1.05,1.25,.06],[-.62,1.68,.09],[0,1.83,.09],[.62,1.68,.09],[1.05,1.25,.06],[1.26,.62,-.02],[1.13,.05,-.02]];

function EarCup({side,color,edge}:{side:-1|1,color:string,edge:string}){
 return <group position={[side*1.17,-.49,.10]} rotation={[0,side*.16,side*.025]}>
   <mesh scale={[.61,.75,.35]} castShadow><sphereGeometry args={[1,48,32]}/><meshPhysicalMaterial color="#12171d" roughness={.39} metalness={.24} clearcoat={.65}/></mesh>
   <mesh position={[0,0,.19]} rotation={[Math.PI/2,0,0]} scale={[1,1,1.21]} castShadow>
     <cylinderGeometry args={[.52,.54,.29,64,1,false]}/>
     <meshPhysicalMaterial color={color} metalness={.84} roughness={.22} clearcoat={.95} clearcoatRoughness={.08}/>
   </mesh>
   <mesh position={[0,0,.395]} scale={[.48,.60,.085]}>
     <sphereGeometry args={[1,64,36]}/>
     <meshPhysicalMaterial color={color} metalness={.88} roughness={.32} clearcoat={1}/>
   </mesh>
   <mesh position={[0,0,.407]} scale={[1,1.19,1]}>
     <torusGeometry args={[.49,.038,12,72]}/>
     <meshPhysicalMaterial color={edge} metalness={.88} roughness={.18}/>
   </mesh>
   <mesh position={[0,0,.448]} scale={[1,1.21,1]}>
     <torusGeometry args={[.36,.009,8,68]}/>
     <meshStandardMaterial color="#495463" metalness={.8} roughness={.3}/>
   </mesh>
   <mesh position={[0,0,-.29]} scale={[1,1.18,1]}>
     <torusGeometry args={[.50,.12,16,70]}/>
     <meshStandardMaterial color="#0b0d12" roughness={.91}/>
   </mesh>
   {[-1,1].map((d)=><mesh key={d} position={[d*.32,-.26,.49]}>
      <sphereGeometry args={[.024,12,12]}/><meshStandardMaterial color="#222a34" metalness={.8} roughness={.24}/>
    </mesh>)}
   <mesh position={[0,-.64,.03]} rotation={[Math.PI/2,0,0]}>
    <cylinderGeometry args={[.048,.048,.18,16]}/><meshStandardMaterial color={edge} metalness={.85} roughness={.27}/>
   </mesh>
 </group>;
}
function Headset({finish,dragValue}:{finish:Finish,dragValue:React.MutableRefObject<number>}){
 const group=useRef<THREE.Group>(null);
 const v=values[finish];
 useFrame(({clock,pointer},delta)=>{
   const g=group.current;if(!g)return;
   const target=dragValue.current+Math.sin(clock.elapsedTime*.36)*.12;
   g.rotation.y=THREE.MathUtils.damp(g.rotation.y,target+pointer.x*.13,1.75,delta);
   g.rotation.x=THREE.MathUtils.damp(g.rotation.x,-.10+pointer.y*.055,2,delta);
 });
 return <group ref={group} rotation={[0,-.16,0]} scale={1.09} position={[0,-.05,0]}>
  <CurvedBand points={arch} radius={.115} color="#111a23" roughness={.27}/>
  <CurvedBand points={archInset} radius={.050} color={v.edge} metalness={.92} roughness={.14}/>
  <CurvedBand points={[[-.89,1.54,.17],[-.48,1.75,.19],[0,1.82,.19],[.48,1.75,.19],[.89,1.54,.17]]} radius={.085} color="#080d14" metalness={.10} roughness={.85}/>
  {([-1,1] as const).map(side=><group key={side}>
   <CurvedBand points={[[side*1.21,-.05,-.08],[side*1.24,-.22,-.08],[side*1.22,-.43,-.11]]} radius={.077} color={v.edge} metalness={.9}/>
   <EarCup side={side} color={v.metal} edge={v.edge}/>
  </group>)}
 </group>
}
export default function HeadphoneStage({finish}:{finish:Finish}){
 const [visible,setVisible]=useState(true);
 const [active,setActive]=useState(false);
 const [reduced,setReduced]=useState(false);
 const [drag,setDrag]=useState(0);
 const dragging=useRef(false);
 const initialX=useRef(0);
 const dragValue=useRef(0);
 const container=useRef<HTMLDivElement>(null);
 useEffect(()=>{
   const m=window.matchMedia("(prefers-reduced-motion: reduce)");
   setReduced(m.matches);
   const change=()=>setReduced(m.matches);m.addEventListener("change",change);
   const observer=new IntersectionObserver(([entry])=>setVisible(entry.isIntersecting),{threshold:0});
   if(container.current)observer.observe(container.current);
   return()=>{observer.disconnect();m.removeEventListener("change",change)};
 },[]);
 return <div className="hero-canvas" ref={container}
   onPointerDown={e=>{dragging.current=true;initialX.current=e.clientX;setActive(true);e.currentTarget.setPointerCapture(e.pointerId)}}
   onPointerMove={e=>{if(!dragging.current)return;dragValue.current=drag+(e.clientX-initialX.current)*.004}}
   onPointerUp={e=>{if(dragging.current){setDrag(dragValue.current);dragging.current=false;setActive(false);try{e.currentTarget.releasePointerCapture(e.pointerId)}catch{}}}}
   onPointerCancel={()=>{dragging.current=false;setActive(false)}}
   style={{cursor:active?"grabbing":"grab"}} aria-label="مدل سه‌بعدی هدفون؛ برای چرخاندن بکشید">
   <Canvas dpr={[1,1.65]} frameloop={visible&&!reduced?"always":"demand"} camera={{position:[0,.07,7.1],fov:36}} gl={{antialias:true,alpha:true,powerPreference:"high-performance"}} onCreated={({gl})=>{gl.setClearColor("#000000",0);gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.55;}}>
    <ambientLight intensity={2.8}/>
    <hemisphereLight args={["#cbdcf2","#1b2437",3.1]}/>
    <directionalLight position={[3,5,5]} intensity={5.5} color="#f6f8ff"/>
    <directionalLight position={[-4,1,3]} intensity={3.3} color="#7895cc"/>
    <pointLight position={[0,-2,3]} intensity={21} color="#95bbff" distance={10}/>
    <pointLight position={[2,1,-2]} intensity={15} color="#e6f2ff" distance={12}/>
    <Float speed={reduced?0:1.25} rotationIntensity={.04} floatIntensity={.12}>
       <Headset finish={finish} dragValue={dragValue}/>
    </Float>
   </Canvas>
 </div>;
}

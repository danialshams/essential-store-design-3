"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import {Canvas,useFrame,useThree} from "@react-three/fiber";
import {Environment,Lightformer} from "@react-three/drei";
import * as THREE from "three";

export type Finish="titanium"|"onyx"|"frost";
type Props={finish:Finish;progress:React.MutableRefObject<number>;visible:boolean};
const PALETTE:Record<Finish,{shell:string,trim:string,cloth:string}>={
  titanium:{shell:"#b2c1d0",trim:"#edf6ff",cloth:"#495664"},
  onyx:{shell:"#343d4c",trim:"#a8b6c9",cloth:"#303a48"},
  frost:{shell:"#88aabd",trim:"#e0f0fd",cloth:"#587389"}
};
const clamp=(x:number)=>THREE.MathUtils.clamp(x,0,1);
const ease=(x:number)=>{const v=clamp(x);return v*v*(3-2*v)};
const phase=(v:number,a:number,b:number)=>ease((v-a)/(b-a));
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
const arch=[[-1.18,.08,-.08],[-1.29,.58,-.08],[-1.09,1.22,-.04],[-.66,1.7,0],[0,1.89,.025],[.66,1.7,0],[1.09,1.22,-.04],[1.29,.58,-.08],[1.18,.08,-.08]];
const shine=arch.map(p=>[p[0]*.988,p[1]-.032,p[2]+.083]);
const pad=[[-.8,1.59,.12],[-.42,1.78,.14],[0,1.84,.14],[.42,1.78,.14],[.8,1.59,.12]];

function Metal({color,roughness=.29,metalness=.82}:{color:string,roughness?:number,metalness?:number}){
  return <meshPhysicalMaterial color={color} metalness={metalness} roughness={roughness} clearcoat={.78} clearcoatRoughness={.13}/>;
}
function Tube({points,radius,color,metalness=.8,roughness=.3}:{points:number[][];radius:number;color:string;metalness?:number;roughness?:number}){
  const geometry=useMemo(()=>new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(p[0],p[1],p[2]))),72,radius,10,false),[points,radius]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  return <mesh geometry={geometry} castShadow receiveShadow><Metal color={color} metalness={metalness} roughness={roughness}/></mesh>;
}
function OvalRing({size=.48,z=0,tube=.012,color="#cbd8e5"}:{size?:number;z?:number;tube?:number;color?:string}){
  return <mesh position={[0,0,z]} scale={[1,1.22,1]}><torusGeometry args={[size,tube,9,80]}/><Metal color={color}/></mesh>;
}
function Cup({side,palette,progress}:{side:-1|1;palette:{shell:string;trim:string;cloth:string};progress:React.MutableRefObject<number>}){
  const cover=useRef<THREE.Group>(null),driver=useRef<THREE.Group>(null),cushion=useRef<THREE.Group>(null),yoke=useRef<THREE.Group>(null);
  useFrame((_,dt)=>{
    const p=progress.current;const split=phase(p,.46,.69)*(1-phase(p,.78,.97));
    const damp=(v:number,t:number)=>THREE.MathUtils.damp(v,t,6.2,dt);
    if(cover.current)cover.current.position.z=damp(cover.current.position.z,.28+1.56*split);
    if(driver.current)driver.current.position.z=damp(driver.current.position.z,-.04+.77*split);
    if(cushion.current)cushion.current.position.z=damp(cushion.current.position.z,-.29-.6*split);
    if(yoke.current)yoke.current.rotation.y=damp(yoke.current.rotation.y,side*split*.15);
  });
  return <group position={[side*1.18,-.47,.05]} rotation={[0,side*.18,side*.024]}>
    <mesh scale={[.54,.69,.30]} castShadow><sphereGeometry args={[1,48,32]}/><Metal color="#1c2632" metalness={.46} roughness={.37}/></mesh>
    <group ref={cushion} position={[0,0,-.29]}>
      <mesh scale={[1,1.2,1]} castShadow><torusGeometry args={[.48,.127,24,96]}/><meshPhysicalMaterial color={palette.cloth} roughness={.91} metalness={.03} sheen={.62} sheenRoughness={.85} sheenColor="#9cabb7"/></mesh>
      <OvalRing size={.51} z={-.01} tube={.012} color="#111821"/>
      <OvalRing size={.398} z={-.062} tube={.008} color="#98a8b7"/>
      <mesh position={[0,0,-.065]} scale={[.31,.39,.022]}><sphereGeometry args={[1,32,20]}/><meshStandardMaterial color="#171e28" roughness={.95}/></mesh>
      {Array.from({length:24},(_,i)=>{
        const a=i/24*Math.PI*2;return <mesh key={i} position={[Math.sin(a)*.472,Math.cos(a)*.472*1.2,-.052]}><sphereGeometry args={[.008,5,5]}/><meshStandardMaterial color="#96a2af" roughness={.9}/></mesh>;
      })}
    </group>
    <group ref={driver} position={[0,0,-.04]}>
      <mesh scale={[.455,.565,.09]}><sphereGeometry args={[1,32,20]}/><meshStandardMaterial color="#111b28" metalness={.4} roughness={.57}/></mesh>
      {Array.from({length:5},(_,i)=><OvalRing key={i} size={.1+i*.066} z={.115} tube={.006} color={i%2?"#435770":"#899eb3"}/>)}
      {Array.from({length:18},(_,i)=>{
        const a=i/18*Math.PI*2;return <mesh key={i} position={[Math.cos(a)*.315,Math.sin(a)*.315*1.22,.135]}><sphereGeometry args={[.012,7,7]}/><Metal color="#6b8199"/></mesh>
      })}
      <mesh position={[0,0,.15]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.065,.065,.024,28]}/><Metal color={palette.trim}/></mesh>
    </group>
    <group ref={cover} position={[0,0,.28]}>
      <mesh castShadow scale={[.52,.67,.16]}><sphereGeometry args={[1,64,40]}/><Metal color={palette.shell} roughness={.35}/></mesh>
      <mesh castShadow position={[0,0,.08]} scale={[.498,.645,.118]}><sphereGeometry args={[1,64,40]}/><Metal color={palette.shell} roughness={.24}/></mesh>
      <OvalRing size={.505} z={.105} tube={.027} color={palette.trim}/>
      <OvalRing size={.428} z={.173} tube={.007} color="#60768e"/>
      <OvalRing size={.333} z={.184} tube={.005} color="#dae8f6"/>
      <OvalRing size={.253} z={.188} tube={.003} color="#7892aa"/>
      <mesh position={[0,0,.193]} scale={[.1,.1,.026]}><sphereGeometry args={[1,20,12]}/><Metal color="#22364d" roughness={.16}/></mesh>
      {Array.from({length:4},(_,i)=>{const a=i*Math.PI/2+Math.PI/4;return <group key={i} position={[Math.sin(a)*.464,Math.cos(a)*.464*1.22,.153]}><mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.022,.022,.01,14]}/><Metal color="#bdcedd"/></mesh></group>})}
      <mesh position={[.13,-.59,.08]}><boxGeometry args={[.105,.027,.03]}/><meshStandardMaterial color="#101925" roughness={.4}/></mesh>
      <mesh position={[-.15,-.59,.08]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.023,.023,.08,12]}/><Metal color="#3e5973"/></mesh>
    </group>
    <group ref={yoke} position={[0,.68,-.06]}>
      <mesh position={[0,.03,-.01]} castShadow><capsuleGeometry args={[.07,.47,7,14]}/><Metal color={palette.trim} roughness={.24}/></mesh>
      <mesh position={[0,.39,0]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.13,.13,.15,30]}/><Metal color={palette.shell}/></mesh>
      <mesh position={[0,.39,.09]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.047,.047,.015,20]}/><Metal color="#354a5f"/></mesh>
    </group>
    <mesh position={[side*.3,-.69,.16]} rotation={[0,Math.PI/2,0]}><cylinderGeometry args={[.034,.034,.13,16]}/><Metal color="#6e889f"/></mesh>
  </group>;
}
type OrbitState={yaw:number;pitch:number;dragging:boolean};
function Rig({finish,progress,orbit,reduced}:{finish:Finish;progress:React.MutableRefObject<number>;orbit:React.MutableRefObject<OrbitState>;reduced:boolean}){
  const ref=useRef<THREE.Group>(null),look=useRef(new THREE.Vector3(0,.2,0)),cameraPos=useRef(new THREE.Vector3(0,0,6.75));
  const {camera}=useThree();const palette=PALETTE[finish];
  const autoAngle=useRef(0);
  useFrame(({clock},delta)=>{
    const p=progress.current;const turn=phase(p,.04,.22);
    const macro=phase(p,.21,.37)*(1-phase(p,.40,.52));
    const split=phase(p,.46,.69)*(1-phase(p,.78,.97));
    const final=phase(p,.82,1);
    // Independent idle orbit: manual gestures never fight the camera's chapter motion.
    if(!reduced&&!orbit.current.dragging){
      const speed=.27*(1-.50*phase(p,.24,.43)*(1-phase(p,.81,.94)));
      autoAngle.current+=Math.min(delta,.05)*speed;
    }
    if(ref.current){
      ref.current.rotation.y=THREE.MathUtils.damp(ref.current.rotation.y,-.22+turn*.62-macro*.28+split*.24-final*.48+orbit.current.yaw+autoAngle.current,5.0,delta);
      ref.current.rotation.x=THREE.MathUtils.damp(ref.current.rotation.x,-.07-macro*.12+split*.065+orbit.current.pitch,5.0,delta);
      ref.current.position.y=THREE.MathUtils.damp(ref.current.position.y,Math.sin(clock.elapsedTime*.48)*.024*(1-phase(p,.13,.28)),3.2,delta);
      const s=THREE.MathUtils.damp(ref.current.scale.x,1-macro*.02-split*.05,3.2,delta);ref.current.scale.setScalar(s);
    }
    const f=1-Math.exp(-3.2*delta);
    cameraPos.current.lerp(new THREE.Vector3(mix(0,1.3,macro),mix(.08,-.43,macro),mix(6.75,3.35,macro)+split*.85),f);
    look.current.lerp(new THREE.Vector3(macro*1.05,.20-macro*.49,0),f);
    camera.position.copy(cameraPos.current);camera.lookAt(look.current);
  });
  return <group ref={ref}>
    <Tube points={arch} radius={.112} color="#17212d" metalness={.4} roughness={.38}/>
    <Tube points={shine} radius={.033} color={palette.trim} metalness={.9} roughness={.20}/>
    <Tube points={pad} radius={.082} color="#111b28" metalness={.02} roughness={.95}/>
    {([-1,1] as const).map(side=><group key={side}>
      <Tube points={[[side*1.18,.08,-.08],[side*1.24,-.13,-.09],[side*1.18,-.43,-.1]]} radius={.062} color={palette.trim} roughness={.23}/>
      <Cup side={side} palette={palette} progress={progress}/>
    </group>)}
  </group>;
}
export default function HeadphoneStage({finish,progress,visible}:Props){
  const [reduced,setReduced]=useState(false);
  const orbit=useRef<OrbitState>({yaw:0,pitch:0,dragging:false});
  const gesture=useRef({x:0,y:0,initialYaw:0,initialPitch:0,active:false});
  useEffect(()=>{
    const m=window.matchMedia("(prefers-reduced-motion: reduce)");
    const change=()=>setReduced(m.matches);change();m.addEventListener("change",change);
    return()=>m.removeEventListener("change",change);
  },[]);
  return <div className="journey-canvas" role="group" tabIndex={0} aria-label="مدل سه‌بعدی هدفون؛ برای چرخش ۳۶۰ درجه درگ کنید. کلیدهای جهت‌دار هم کار می‌کنند."
    onPointerDown={(e)=>{if(e.pointerType==="mouse"&&e.button!==0)return;gesture.current={x:e.clientX,y:e.clientY,initialYaw:orbit.current.yaw,initialPitch:orbit.current.pitch,active:true};orbit.current.dragging=true;e.currentTarget.setPointerCapture(e.pointerId)}}
    onPointerMove={(e)=>{if(!gesture.current.active)return;orbit.current.yaw=gesture.current.initialYaw+(e.clientX-gesture.current.x)*.012;orbit.current.pitch=THREE.MathUtils.clamp(gesture.current.initialPitch+(e.clientY-gesture.current.y)*.008,-1.20,1.20)}}
    onPointerUp={(e)=>{gesture.current.active=false;orbit.current.dragging=false;try{e.currentTarget.releasePointerCapture(e.pointerId)}catch{}}}
    onPointerCancel={()=>{gesture.current.active=false;orbit.current.dragging=false}}
    onKeyDown={(e)=>{const key=e.key;if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(key))return;e.preventDefault();if(key==="ArrowLeft")orbit.current.yaw-=.25;if(key==="ArrowRight")orbit.current.yaw+=.25;if(key==="ArrowUp")orbit.current.pitch=Math.max(-1.2,orbit.current.pitch-.16);if(key==="ArrowDown")orbit.current.pitch=Math.min(1.2,orbit.current.pitch+.16)}}>
    <Canvas dpr={[1,1.5]} frameloop={visible?"always":"demand"} camera={{position:[0,.1,6.75],fov:38}} gl={{alpha:true,antialias:true,powerPreference:"high-performance"}} onCreated={({gl})=>{gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.45;}}>
      <color attach="background" args={["#090e17"]}/>
      <ambientLight intensity={1.2}/>
      <hemisphereLight args={["#eaf4ff","#24384d",2.1]}/>
      <directionalLight intensity={3.6} position={[4,6,6]} color="#e9f5ff"/>
      <directionalLight intensity={3.2} position={[-4,0,4]} color="#9ab8e2"/>
      <pointLight intensity={10} position={[1,-3,3]} color="#9cbdf8" distance={11}/>
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={4} position={[0,4,5]} rotation={[-.4,0,0]} scale={[7,2,1]}/>
        <Lightformer form="rect" intensity={5} position={[-5,0,2]} rotation={[0,Math.PI/3,0]} scale={[2,7,1]}/>
        <Lightformer form="rect" intensity={2} color="#abc7e8" position={[5,1,0]} rotation={[0,-Math.PI/2,0]} scale={[2,6,1]}/>
      </Environment>
      <Rig finish={finish} progress={progress} orbit={orbit} reduced={reduced}/>
    </Canvas>
  </div>;
}

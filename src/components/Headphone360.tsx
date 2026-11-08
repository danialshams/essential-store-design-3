"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import HeadphoneJourneyRig, {sampleJourneyShot,type JourneyRefs} from "./HeadphoneJourneyRig";

const PREVIEW="/models/airpods-max-instant.glb";
const ORIGINAL="/models/airpods-max-4k-opaque.glb";
const MOBILE="(max-width: 760px)";
const AUTO_SPEED=.22; // ~29 seconds per revolution, up from ~52 seconds
const IDLE_DELAY=2000;
const RETURN_DURATION=1050;

type Interaction={
  dragging:boolean;pointerId:number|null;lastX:number;lastY:number;pinch:number;
  yaw:number;pitch:number;zoom:number;zoomShown:number;
  used:boolean;lastEnd:number;returnStart:number;fromPitch:number;fromZoom:number;
};
const newInteraction=():Interaction=>({dragging:false,pointerId:null,lastX:0,lastY:0,pinch:0,yaw:-.23,pitch:0,zoom:1,zoomShown:1,used:false,lastEnd:0,returnStart:0,fromPitch:0,fromZoom:1});

function materialCopy(source:THREE.Material,anisotropy:number){
  const m=source.clone();
  m.transparent=false;m.opacity=1;m.alphaTest=.42;
  m.depthWrite=true;m.depthTest=true;m.side=THREE.DoubleSide;
  if(m instanceof THREE.MeshStandardMaterial){
    for(const map of [m.map,m.normalMap,m.roughnessMap,m.metalnessMap]){
      if(map){map.anisotropy=anisotropy;map.needsUpdate=true;}
    }
    m.envMapIntensity=1.12;
  }
  m.needsUpdate=true;
  return m;
}
function FirstFrame({onReady}:{onReady:()=>void}){
  const fired=useRef(false);
  useFrame(()=>{
    if(fired.current)return;
    fired.current=true;
    requestAnimationFrame(()=>requestAnimationFrame(onReady));
  });
  return null;
}
function Headphones({modelRef,modelGroupRef,interaction,onReady,progress}:{
  modelRef:React.RefObject<THREE.Object3D|null>;
  modelGroupRef:React.RefObject<THREE.Group|null>;
  interaction:React.RefObject<Interaction>;
  progress:React.RefObject<number>;
  onReady:()=>void;
}){
  const {scene}=useGLTF(PREVIEW,"/draco/");
  const {gl}=useThree();
  const groupRef=useRef<THREE.Group>(null);
  const model=useMemo(()=>{
    const copy=scene.clone(true),a=Math.min(8,gl.capabilities.getMaxAnisotropy());
    copy.traverse(x=>{
      if(!(x instanceof THREE.Mesh))return;
      const mat=x.material;
      x.material=Array.isArray(mat)?mat.map(m=>materialCopy(m,a)):materialCopy(mat,a);
    });
    const box=new THREE.Box3().setFromObject(copy);
    const center=box.getCenter(new THREE.Vector3());
    const size=box.getSize(new THREE.Vector3());
    return {copy,center,scale:3.15/Math.max(size.x,size.y,size.z,.001)};
  },[scene,gl]);
  useEffect(()=>{modelRef.current=model.copy;modelGroupRef.current=groupRef.current;return()=>{modelRef.current=null;modelGroupRef.current=null};},[model.copy,modelRef,modelGroupRef]);
  useFrame((_,delta)=>{
    const group=groupRef.current;
    if(!group)return;
    const g=interaction.current,now=performance.now(),dt=Math.min(.06,delta);
    const p=progress.current;
    const focused=THREE.MathUtils.smoothstep(p,.115,.225)*(1-THREE.MathUtils.smoothstep(p,.91,.985));
    const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(!g.dragging&&g.used&&now-g.lastEnd>=IDLE_DELAY){
      if(!g.returnStart){
        g.returnStart=now;
        g.fromPitch=Math.atan2(Math.sin(g.pitch),Math.cos(g.pitch));
        g.fromZoom=g.zoom;
      }
      const t=Math.min(1,(now-g.returnStart)/RETURN_DURATION),ease=t*t*(3-2*t);
      g.pitch=g.fromPitch*(1-ease);
      g.zoom=g.fromZoom+(1-g.fromZoom)*ease;
      if(t>=1){g.pitch=0;g.zoom=1;g.used=false;g.returnStart=0;}
    }
    if(!reduced&&!g.dragging&&!g.used&&(p<.115||p>.985))g.yaw+=AUTO_SPEED*dt;
    group.rotation.order="YXZ";
    const cinematicHeading=sampleJourneyShot(p).heading;
    const goalYaw=THREE.MathUtils.lerp(g.yaw,cinematicHeading,focused);
    group.rotation.y=THREE.MathUtils.damp(group.rotation.y,goalYaw,g.dragging?18:10,dt);
    group.rotation.x=THREE.MathUtils.damp(group.rotation.x,g.pitch*(1-focused)+.055*(1-focused),g.dragging?18:10,dt);
    group.rotation.z=THREE.MathUtils.damp(group.rotation.z,-.105*(1-focused),9,dt);
    g.zoomShown=THREE.MathUtils.damp(g.zoomShown,THREE.MathUtils.lerp(g.zoom,1,focused),g.dragging?18:9,dt);
    group.scale.setScalar(model.scale*g.zoomShown);
  });
  return <>
    <group ref={groupRef} scale={model.scale}>
      <group position={[-model.center.x,-model.center.y,-model.center.z]}>
        <primitive object={model.copy}/>
      </group>
    </group>
    <FirstFrame onReady={onReady}/>
  </>;
}
function FullQuality({modelRef,onReady}:{
  modelRef:React.RefObject<THREE.Object3D|null>;
  onReady:()=>void;
}){
  const {scene}=useGLTF(ORIGINAL,"/draco/");
  const {gl,invalidate}=useThree();
  useEffect(()=>{
    const node=modelRef.current;
    if(!node)return;
    const old:THREE.Mesh[]=[],next:THREE.Mesh[]=[];
    node.traverse(x=>{if(x instanceof THREE.Mesh)old.push(x);});
    scene.traverse(x=>{if(x instanceof THREE.Mesh)next.push(x);});
    if(!old.length||old.length!==next.length)return;
    const a=Math.min(8,gl.capabilities.getMaxAnisotropy());
    for(let i=0;i<old.length;i++){
      old[i].geometry=next[i].geometry;
      const mat=next[i].material;
      old[i].material=Array.isArray(mat)?mat.map(x=>materialCopy(x,a)):materialCopy(mat,a);
    }
    invalidate();onReady();
  },[scene,gl,modelRef,onReady,invalidate]);
  return null;
}

/* The canvas may extend beyond the product, but transparent canvas pixels
 * never intercept page scrolling. Raycast against the actual headphone mesh
 * before consuming a pointer, touch or wheel gesture.
 */
function GestureGate({modelRef,interaction,progress}:{
  modelRef:React.RefObject<THREE.Object3D|null>;
  interaction:React.RefObject<Interaction>;
  progress:React.RefObject<number>;
}){
  const {gl,camera}=useThree();
  useEffect(()=>{
    const canvas=gl.domElement;
    const ray=new THREE.Raycaster(),mouse=new THREE.Vector2();
    const state=interaction.current;
    let touchOnModel=false,hover=false,lastRaycast=0;
    const hit=(x:number,y:number)=>{
      const root=modelRef.current;
      if(!root)return false;
      const r=canvas.getBoundingClientRect();
      if(x<r.left||x>r.right||y<r.top||y>r.bottom)return false;
      mouse.set((x-r.left)/r.width*2-1,-(y-r.top)/r.height*2+1);
      root.updateWorldMatrix(true,true);
      ray.setFromCamera(mouse,camera);
      return ray.intersectObject(root,true).length>0;
    };
    const begin=(x:number,y:number,id:number)=>{
      if(progress.current>.075||!hit(x,y))return false;
      state.dragging=true;state.pointerId=id;
      state.lastX=x;state.lastY=y;state.pinch=0;
      state.used=true;state.lastEnd=performance.now();state.returnStart=0;
      canvas.style.cursor="grabbing";
      return true;
    };
    const down=(e:PointerEvent)=>{
      if(state.dragging||touchOnModel)return;
      if(!begin(e.clientX,e.clientY,e.pointerId))return;
      if(e.cancelable)e.preventDefault();
      try{canvas.setPointerCapture(e.pointerId)}catch{}
    };
    const move=(e:PointerEvent)=>{
      // Mobile touchmove is handled separately with a non-passive listener.
      if(e.pointerType==="touch")return;
      if(state.dragging&&state.pointerId===e.pointerId){
        state.yaw+=(e.clientX-state.lastX)*.0085;
        state.pitch+=(e.clientY-state.lastY)*.0077;
        state.lastX=e.clientX;state.lastY=e.clientY;
        if(e.cancelable)e.preventDefault();
        return;
      }
      if(e.pointerType==="mouse"&&performance.now()-lastRaycast>=65){
        lastRaycast=performance.now();
        hover=hit(e.clientX,e.clientY);
        canvas.style.cursor=hover?"grab":"default";
      }
    };
    const up=(e:PointerEvent)=>{
      if(!state.dragging||state.pointerId!==e.pointerId)return;
      state.dragging=false;state.pointerId=null;state.pinch=0;
      state.lastEnd=performance.now();state.returnStart=0;
      canvas.style.cursor=hover?"grab":"default";
      try{canvas.releasePointerCapture(e.pointerId)}catch{}
    };
    const wheel=(e:WheelEvent)=>{
      // Wheel scroll is reserved for the camera story; Ctrl/Meta+wheel zooms the model in the idle hero.
      if(progress.current>.075||!(e.ctrlKey||e.metaKey)||!hit(e.clientX,e.clientY))return;
      if(e.cancelable)e.preventDefault();
      state.used=true;state.lastEnd=performance.now();state.returnStart=0;
      const unit=e.deltaMode===1?16:e.deltaMode===2?160:1;
      state.zoom=THREE.MathUtils.clamp(state.zoom*(1-e.deltaY*unit*.001),.84,1.72);
    };
    const startTouch=(e:TouchEvent)=>{
      const p=e.changedTouches[0];
      if(!p)return;
      if(!state.dragging&&!begin(p.clientX,p.clientY,p.identifier))return;
      touchOnModel=true;
      if(e.cancelable)e.preventDefault();
      if(e.touches.length===2){
        state.pinch=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
      }
    };
    const moveTouch=(e:TouchEvent)=>{
      if(!touchOnModel)return;
      if(e.cancelable)e.preventDefault();
      if(e.touches.length>=2){
        const length=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
        if(state.pinch)state.zoom=THREE.MathUtils.clamp(state.zoom*length/state.pinch,.84,1.72);
        state.pinch=length;
      }else if(e.touches.length===1){
        const p=e.touches[0];
        state.yaw+=(p.clientX-state.lastX)*.0085;
        state.pitch+=(p.clientY-state.lastY)*.0077;
        state.lastX=p.clientX;state.lastY=p.clientY;
      }
      state.lastEnd=performance.now();
    };
    const endTouch=(e:TouchEvent)=>{
      if(!touchOnModel)return;
      if(e.cancelable)e.preventDefault();
      if(!e.touches.length){
        touchOnModel=false;state.dragging=false;state.pointerId=null;state.pinch=0;
        state.lastEnd=performance.now();state.returnStart=0;
      }else if(e.touches.length===1){
        state.lastX=e.touches[0].clientX;state.lastY=e.touches[0].clientY;state.pinch=0;
      }
    };
    const leave=()=>{if(!state.dragging)canvas.style.cursor="default";};
    canvas.addEventListener("pointerdown",down,{capture:true,passive:false});
    canvas.addEventListener("pointermove",move,{passive:false});
    canvas.addEventListener("pointerup",up);
    canvas.addEventListener("pointercancel",up);
    canvas.addEventListener("pointerleave",leave);
    canvas.addEventListener("wheel",wheel,{capture:true,passive:false});
    canvas.addEventListener("touchstart",startTouch,{capture:true,passive:false});
    canvas.addEventListener("touchmove",moveTouch,{capture:true,passive:false});
    canvas.addEventListener("touchend",endTouch,{capture:true,passive:false});
    canvas.addEventListener("touchcancel",endTouch,{capture:true,passive:false});
    return()=>{
      canvas.removeEventListener("pointerdown",down,true);
      canvas.removeEventListener("pointermove",move);
      canvas.removeEventListener("pointerup",up);
      canvas.removeEventListener("pointercancel",up);
      canvas.removeEventListener("pointerleave",leave);
      canvas.removeEventListener("wheel",wheel,true);
      canvas.removeEventListener("touchstart",startTouch,true);
      canvas.removeEventListener("touchmove",moveTouch,true);
      canvas.removeEventListener("touchend",endTouch,true);
      canvas.removeEventListener("touchcancel",endTouch,true);
    };
  },[gl,camera,modelRef,interaction,progress]);
  return null;
}
function VisibleFramePump(){
  const {gl,invalidate}=useThree();
  useEffect(()=>{
    const canvas=gl.domElement,mobile=window.matchMedia(MOBILE);
    let visible=false,frame=0,last=0;
    const tick=(now:number)=>{
      if(now-last>=(mobile.matches?32:17)){invalidate();last=now;}
      if(visible&&!document.hidden)frame=requestAnimationFrame(tick);
      else frame=0;
    };
    const start=()=>{if(visible&&!document.hidden&&!frame)frame=requestAnimationFrame(tick);};
    const observer=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??false;start();},{threshold:0});
    observer.observe(canvas);
    document.addEventListener("visibilitychange",start);
    return()=>{cancelAnimationFrame(frame);observer.disconnect();document.removeEventListener("visibilitychange",start);};
  },[gl,invalidate]);
  return null;
}
function Studio(){
  return <>
    <ambientLight intensity={.95} color="#ffffff"/>
    <hemisphereLight args={["#ffffff","#a1aab5",.95]}/>
    <directionalLight position={[4.5,7,5]} intensity={2.0} color="#ffffff"/>
    <directionalLight position={[-4,1,-4]} intensity={1.05} color="#ffffff"/>
    <Environment resolution={64} frames={1}>
      <Lightformer form="rect" intensity={3.6} position={[3,5,5]} rotation={[-.3,0,0]} scale={[3.8,2.4,1]}/>
      <Lightformer form="rect" intensity={2.5} position={[-5,1,1]} rotation={[0,Math.PI/2,0]} scale={[2.5,5,1]}/>
      <Lightformer form="rect" intensity={1.5} position={[0,1,-5]} rotation={[0,Math.PI,0]} scale={[4,3,1]}/>
    </Environment>
  </>;
}
export default function Headphone360(props:JourneyRefs){
  const [mobile,setMobile]=useState(typeof window!=="undefined"&&window.matchMedia(MOBILE).matches);
  const [ready,setReady]=useState(false);
  const [queued,setQueued]=useState(false);
  const [full,setFull]=useState(false);
  const [failed,setFailed]=useState(false);
  const modelRef=useRef<THREE.Object3D|null>(null);
  const modelGroupRef=useRef<THREE.Group|null>(null);
  const interaction=useRef<Interaction>(newInteraction());
  const onReady=useCallback(()=>setReady(true),[]);
  const onFull=useCallback(()=>setFull(true),[]);
  useEffect(()=>{
    const m=window.matchMedia(MOBILE);
    const update=()=>setMobile(m.matches);
    update();m.addEventListener("change",update);
    return()=>m.removeEventListener("change",update);
  },[]);
  useEffect(()=>{
    if(!ready)return;
    const w=window as Window&{requestIdleCallback?:(f:()=>void,o?:{timeout:number})=>number;cancelIdleCallback?:(id:number)=>void;};
    if(w.requestIdleCallback&&w.cancelIdleCallback){
      const id=w.requestIdleCallback(()=>setQueued(true),{timeout:1300});
      return()=>w.cancelIdleCallback?.(id);
    }
    const id=window.setTimeout(()=>setQueued(true),300);
    return()=>clearTimeout(id);
  },[ready]);
  return <div className="viewer-shell" data-quality={full?"4k":ready?"instant":"poster"} aria-label="مدل تعاملی سه‌بعدی هدفون، فقط روی خود هدفون لمس یا زوم کنید">
    <div className={"viewer-poster"+(ready?" hidden":"")} aria-hidden="true"><picture>
      <source media="(max-width: 760px)" srcSet="/images/airpods-poster-mobile.webp"/>
      <img src="/images/airpods-poster-desktop.webp" alt="" fetchPriority="high" decoding="async"/>
    </picture></div>
    <div className="viewer-canvas">
      <Canvas
        dpr={mobile?[.85,1.35]:[1,1.65]}
        frameloop="demand"
        camera={{position:mobile?[3.9,1.32,9.25]:[3.0,1.09,5.1],fov:38,near:.05,far:100}}
        gl={{alpha:true,antialias:true,powerPreference:"high-performance"}}
        onCreated={({gl})=>{gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.25;}}
        onError={()=>setFailed(true)}>
        <Studio/>
        <Suspense fallback={null}><Headphones modelRef={modelRef} modelGroupRef={modelGroupRef} interaction={interaction} progress={props.progress} onReady={onReady}/></Suspense>
        {queued&&<Suspense fallback={null}><FullQuality modelRef={modelRef} onReady={onFull}/></Suspense>}
        <GestureGate modelRef={modelRef} interaction={interaction} progress={props.progress}/>
        <HeadphoneJourneyRig refs={props} groupRef={modelGroupRef} mobile={mobile}/>
        <VisibleFramePump/>
      </Canvas>
    </div>
    {failed&&<div className="viewer-hint" role="alert">نمایش سه‌بعدی روی این دستگاه در دسترس نیست</div>}
  </div>;
}
useGLTF.preload(PREVIEW,"/draco/");

"use client";

import {Suspense,useEffect,useMemo,useRef,useState} from "react";
import {Canvas,useFrame,useThree} from "@react-three/fiber";
import {KTX2Loader} from "three-stdlib";
import {Environment,Lightformer,TrackballControls,useGLTF} from "@react-three/drei";
import * as THREE from "three";

const ASSET="/models/airpods-max-4k-ktx2-v1.glb";
const PREVIEW="/models/airpods-preview-v1.glb";
const MOBILE="(max-width: 760px)";

function isMobile(){
  return typeof window!=="undefined" && window.matchMedia(MOBILE).matches;
}

function FirstRenderedFrame({onReady}:{onReady:()=>void}){
  const signaled=useRef(false);
  useFrame(()=>{
    if(signaled.current)return;
    signaled.current=true;
    // Keep the Blender poster visible until the 3D scene has had a painted frame.
    requestAnimationFrame(()=>requestAnimationFrame(onReady));
  });
  return null;
}

function HeadphoneMesh({quality,onReady,visible=true}:{quality:"preview"|"full";onReady?:()=>void;visible?:boolean}){
  const {gl}=useThree();
  const ktx2=useMemo(()=>new KTX2Loader().setTranscoderPath("/basis/").detectSupport(gl),[gl]);
  const {scene}=useGLTF(
    quality==="full"?ASSET:PREVIEW,
    false,
    true, // meshopt enables 415KB preview with the original geometry
    quality==="full"?(loader=>loader.setKTX2Loader(ktx2)):undefined
  );
  const model=useMemo(()=>{
    const copy=scene.clone(true);
    copy.traverse(obj=>{
      if(!(obj instanceof THREE.Mesh))return;
      const opaque=(source:THREE.Material)=>{
        // The uploaded GLB declares alphaMode: BLEND for its entire mesh.
        // Its geometry is solid. An opaque draw prevents rear parts showing
        // through the earcups without changing any original PBR texture values.
        const m=source.clone();
        m.transparent=false;
        m.opacity=1;
        m.alphaTest=0;
        m.depthWrite=true;
        m.depthTest=true;
        // The original material is double-sided: preserve its inner earcups.
        m.side=THREE.DoubleSide;
        m.needsUpdate=true;
        return m;
      };
      obj.material=Array.isArray(obj.material)?obj.material.map(opaque):opaque(obj.material);
    });
    const bbox=new THREE.Box3().setFromObject(copy);
    const center=bbox.getCenter(new THREE.Vector3());
    const size=bbox.getSize(new THREE.Vector3());
    const scale=3.15/Math.max(size.x,size.y,size.z,0.001);
    return {copy,center,scale};
  },[scene]);
  return <>
    <group scale={model.scale}>
      <group position={[-model.center.x,-model.center.y,-model.center.z]}>
        <primitive object={model.copy}/>
      </group>
    </group>
    {onReady && <FirstRenderedFrame onReady={onReady}/>}
  </>;
}

// The fast preview is interactive first. The exact same geometry, with final
// full-resolution 4K KTX2 textures, is swapped in as soon as it is decoded.
function ProgressiveHeadphones({onReady,onFullReady}:{onReady:()=>void;onFullReady:()=>void}){
  const [fullReady,setFullReady]=useState(false);
  return <>
    {!fullReady && <Suspense fallback={null}>
      <HeadphoneMesh quality="preview" onReady={onReady}/>
    </Suspense>}
    <Suspense fallback={null}>
      <HeadphoneMesh quality="full" visible={fullReady} onReady={()=>{
        setFullReady(true);
        onFullReady();
        onReady();
      }}/>
    </Suspense>
  </>;
}

// TrackballControls calculates motion in useFrame. With demand rendering,
// pointer events alone do not schedule that frame. Request frames ONLY while
// dragging, scrolling to zoom, and for a brief damping tail after release.
function InteractionFramePump(){
  const {gl,invalidate}=useThree();
  useEffect(()=>{
    const canvas=gl.domElement;
    let active=false, endAt=0, frame=0;
    const tick=()=>{
      frame=0;
      invalidate();
      if(active||performance.now()<endAt)frame=requestAnimationFrame(tick);
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(tick)};
    const start=()=>{active=true;schedule()};
    const finish=()=>{active=false;endAt=performance.now()+850;schedule()};
    const zoom=()=>{endAt=performance.now()+850;schedule()};
    canvas.addEventListener("pointerdown",start,{passive:true});
    canvas.addEventListener("touchstart",start,{passive:true});
    window.addEventListener("pointerup",finish,{passive:true});
    window.addEventListener("touchend",finish,{passive:true});
    window.addEventListener("touchcancel",finish,{passive:true});
    canvas.addEventListener("wheel",zoom,{passive:true});
    return ()=>{
      cancelAnimationFrame(frame);
      canvas.removeEventListener("pointerdown",start);
      canvas.removeEventListener("touchstart",start);
      window.removeEventListener("pointerup",finish);
      window.removeEventListener("touchend",finish);
      window.removeEventListener("touchcancel",finish);
      canvas.removeEventListener("wheel",zoom);
    };
  },[gl,invalidate]);
  return null;
}

function NeutralStudio(){
  return <>
    <ambientLight intensity={1.25} color="#ffffff"/>
    <hemisphereLight args={["#ffffff","#a7adb4",1.2]}/>
    <directionalLight position={[4,6,7]} intensity={2.55} color="#ffffff"/>
    <directionalLight position={[-5,0,-4]} intensity={1.75} color="#ffffff"/>
    <Environment resolution={48} frames={1}>
      <Lightformer form="rect" intensity={4.5} position={[2,4,5]} rotation={[-0.3,0,0]} scale={[4,2.2,1]}/>
      <Lightformer form="rect" intensity={2.3} position={[-4,1,-2]} rotation={[0,Math.PI/2,0]} scale={[2.5,5,1]}/>
    </Environment>
  </>;
}

export default function Headphone360(){
  const [mobile,setMobile]=useState(isMobile);
  const [ready,setReady]=useState(false);
  const [fullReady,setFullReady]=useState(false);
  const [failed,setFailed]=useState(false);
  useEffect(()=>{
    const media=window.matchMedia(MOBILE);
    const refresh=()=>setMobile(media.matches);
    refresh();
    media.addEventListener("change",refresh);
    return()=>media.removeEventListener("change",refresh);
  },[]);

  return <main className="viewer-shell" data-model-quality={fullReady?"4k":"preview"} aria-label="نمایشگر سه‌بعدی هدفون AirPods Max">
    <div className={"viewer-poster"+(ready?" hidden":"")} aria-hidden="true">
      {/* SSR-rendered image: visible before JS, model download and shader compilation. */}
      <picture>
        <source media="(max-width: 760px)" srcSet="/images/airpods-poster-mobile.webp"/>
        <img src="/images/airpods-poster-desktop.webp" alt="" fetchPriority="high" decoding="async"/>
      </picture>
    </div>
    <div className="viewer-canvas" aria-label="مدل سه‌بعدی؛ لمس یا درگ به همه جهت‌ها، برای بزرگنمایی دو انگشت یا چرخ ماوس">
      <Canvas
        dpr={mobile?[1,1.45]:[1,1.8]}
        frameloop="demand"
        camera={{position:mobile?[4.0,1.35,9.0]:[3.6,1.3,5.8],fov:38,near:0.05,far:100}}
        gl={{alpha:true,antialias:true,powerPreference:"high-performance"}}
        onCreated={({gl})=>{
          gl.toneMapping=THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure=1.42;
        }}
        onError={()=>setFailed(true)}
      >
        <NeutralStudio/>
        <ProgressiveHeadphones onReady={()=>setReady(true)} onFullReady={()=>setFullReady(true)}/>
        <InteractionFramePump/>
        <TrackballControls
          makeDefault
          target={[0,0,0]}
          noPan
          rotateSpeed={mobile?3.2:2.5}
          zoomSpeed={mobile?1.3:1.0}
          dynamicDampingFactor={0.13}
          staticMoving={false}
          minDistance={2.4}
          maxDistance={12}
        />
      </Canvas>
    </div>
    {ready && !failed && <div className="viewer-hint">
      با ماوس یا انگشت به همه جهت‌ها بچرخانید · زوم با دو انگشت
    </div>}
    {failed && <div className="viewer-hint" role="alert">نمایش سه‌بعدی روی این دستگاه در دسترس نیست</div>}
    <a className="viewer-credit" target="_blank" rel="noopener noreferrer"
      href="https://sketchfab.com/3d-models/airpods-max-3400db28f6da41d08304ff20b29c3883">
      3D model by DJM · CC BY
    </a>
  </main>;
}

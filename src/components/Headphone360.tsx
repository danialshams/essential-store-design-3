"use client";

import {Suspense,useEffect,useMemo,useState} from "react";
import {Canvas} from "@react-three/fiber";
import {Environment,Lightformer,OrbitControls,useGLTF} from "@react-three/drei";
import * as THREE from "three";

const MOBILE_QUERY="(max-width: 760px)";

function getMobile(){
  return typeof window!=="undefined" && window.matchMedia(MOBILE_QUERY).matches;
}

function Headphones({mobile,onReady}:{mobile:boolean;onReady:()=>void}){
  // Both assets are derived from the SAME user-uploaded GLB, not procedural geometry.
  const path=mobile?"/models/airpods-max-mobile.glb":"/models/airpods-max-web.glb";
  const {scene}=useGLTF(path);
  const fitted=useMemo(()=>{
    const copy=scene.clone(true);
    const bbox=new THREE.Box3().setFromObject(copy);
    const center=bbox.getCenter(new THREE.Vector3());
    const extent=bbox.getSize(new THREE.Vector3());
    const scale=3.15/Math.max(extent.x,extent.y,extent.z,0.001);
    // Translate the original geometry around the viewer's origin without altering
    // UVs, normals, textures, or geometry topology.
    return {copy,center,scale};
  },[scene]);
  useEffect(()=>{onReady()},[onReady,scene]);
  return <group scale={fitted.scale}>
    <group position={[-fitted.center.x,-fitted.center.y,-fitted.center.z]}>
      <primitive object={fitted.copy}/>
    </group>
  </group>;
}

function StudioLighting(){
  return <>
    <ambientLight intensity={1.1}/>
    <hemisphereLight args={["#dfe9f6","#182434",1.25]}/>
    <directionalLight position={[5,7,8]} intensity={2.15} color="#f7fbff"/>
    <directionalLight position={[-5,1,-5]} intensity={1.5} color="#afc9e7"/>
    <Environment resolution={64} frames={1}>
      <Lightformer form="rect" position={[2,4,4]} scale={[5,2.2,1]} intensity={3} rotation={[-.3,0,0]}/>
      <Lightformer form="rect" position={[-4,1,-2]} scale={[2,5,1]} intensity={3} rotation={[0,Math.PI/2,0]}/>
    </Environment>
  </>;
}

export default function Headphone360(){
  const [mobile,setMobile]=useState(getMobile);
  const [loaded,setLoaded]=useState(false);
  const [failed,setFailed]=useState(false);
  useEffect(()=>{
    const m=window.matchMedia(MOBILE_QUERY);
    const handle=()=>{setMobile(m.matches);setLoaded(false)};
    m.addEventListener("change",handle);
    return ()=>m.removeEventListener("change",handle);
  },[]);

  return <main className="viewer-shell" aria-label="نمایشگر سه‌بعدی هدفون">
    <div className="viewer-glow" aria-hidden="true"/>
    <div className={"viewer-poster"+(loaded?" hidden":"")} role="presentation" aria-hidden="true"/>
    <div className="viewer-canvas" aria-label="هدفون سه‌بعدی؛ برای چرخش، بکشید و برای زوم از دو انگشت یا چرخ ماوس استفاده کنید">
      <Canvas
        dpr={mobile?[1,1.35]:[1,1.7]}
        frameloop="demand"
        camera={{position:mobile?[4,1.4,9.2]:[3.6,1.3,5.6],fov:38,near:0.05,far:100}}
        gl={{alpha:true,antialias:!mobile,powerPreference:"high-performance"}}
        onCreated={({gl})=>{gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.6;}}
        onError={()=>setFailed(true)}
      >
        <StudioLighting/>
        <Suspense fallback={null}>
          <Headphones mobile={mobile} onReady={()=>setLoaded(true)}/>
        </Suspense>
        <OrbitControls
          makeDefault
          target={[0,0,0]}
          enableRotate
          enableZoom
          enablePan={false}
          enableDamping
          dampingFactor={0.09}
          minDistance={2.4}
          maxDistance={10}
          minPolarAngle={0.02}
          maxPolarAngle={Math.PI-0.02}
          rotateSpeed={0.7}
          zoomSpeed={0.9}
          autoRotate={false}
        />
      </Canvas>
    </div>
    <div className="viewer-hint" aria-live="polite">
      {failed?"نمایش سه‌بعدی در این مرورگر در دسترس نیست":loaded?"با انگشت یا ماوس بچرخانید · برای زوم دو انگشت":"در حال آماده‌سازی مدل سه‌بعدی..."}
    </div>
    <a className="viewer-credit" target="_blank" rel="noopener noreferrer"
       href="https://sketchfab.com/3d-models/airpods-max-3400db28f6da41d08304ff20b29c3883">
       3D model: DJM · CC BY
    </a>
  </main>;
}


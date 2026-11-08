"use client";

import { useMemo, useRef } from "react";
import type { RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

type V3=[number,number,number];
type Shot={at:number;position:V3;look:V3;heading:number;fov:number};
export type JourneyRefs={
  progress:RefObject<number>;
  chapter:RefObject<number>;
  stageRef:RefObject<HTMLDivElement|null>;
  cardRef:RefObject<HTMLElement|null>;
  dotRef:RefObject<HTMLSpanElement|null>;
  lineRef:RefObject<SVGPathElement|null>;
};
const SHOTS:Shot[]=[
  {at:0,position:[3,1.09,5.1],look:[-.8,0,0],heading:0,fov:38},
  {at:.115,position:[3,1.09,5.1],look:[-.8,0,0],heading:0,fov:38},
  {at:.225,position:[2.1,-.37,3],look:[.78,-.53,.14],heading:.11,fov:32},
  {at:.345,position:[2.1,-.37,3],look:[.78,-.53,.14],heading:.11,fov:32},
  {at:.424,position:[-2.47,-.12,3.15],look:[-.78,-.22,.19],heading:-.25,fov:33},
  {at:.555,position:[-2.47,-.12,3.15],look:[-.78,-.22,.19],heading:-.25,fov:33},
  {at:.615,position:[1.55,2.82,3.05],look:[.02,1.1,.04],heading:.09,fov:34},
  {at:.742,position:[1.55,2.82,3.05],look:[.02,1.1,.04],heading:.09,fov:34},
  {at:.816,position:[2.26,-.76,2.86],look:[.76,-.91,.16],heading:.19,fov:32},
  {at:.9,position:[2.26,-.76,2.86],look:[.76,-.91,.16],heading:.19,fov:32},
  {at:.979,position:[3,1.09,5.1],look:[-.8,0,0],heading:0,fov:38},
  {at:1,position:[3,1.09,5.1],look:[-.8,0,0],heading:0,fov:38}
];
const ease=(input:number)=>{
  const t=Math.max(0,Math.min(1,input));return t*t*(3-2*t);
};
export function sampleJourneyShot(progress:number){
  const t=Math.max(0,Math.min(1,progress));
  let i=0;while(i<SHOTS.length-2&&t>SHOTS[i+1].at)i++;
  const a=SHOTS[i],b=SHOTS[i+1],f=ease((t-a.at)/(b.at-a.at));
  const interpolate=(key:"position"|"look"):V3=>[
    THREE.MathUtils.lerp(a[key][0],b[key][0],f),
    THREE.MathUtils.lerp(a[key][1],b[key][1],f),
    THREE.MathUtils.lerp(a[key][2],b[key][2],f)
  ];
  return {position:interpolate("position"),look:interpolate("look"),
    heading:THREE.MathUtils.lerp(a.heading,b.heading,f),
    fov:THREE.MathUtils.lerp(a.fov,b.fov,f)};
}

export default function HeadphoneJourneyRig({refs,groupRef,mobile}:{
  refs:JourneyRefs;groupRef:RefObject<THREE.Group|null>;mobile:boolean;
}){
  const {camera,gl}=useThree();
  const lastPos=useRef(new THREE.Vector3(3,1.09,5.1));
  const lastLook=useRef(new THREE.Vector3(-.8,0,0));
  const hitCache=useRef<{index:number;point:THREE.Vector3}|null>(null);
  const counter=useRef(0);
  const ray=useMemo(()=>new THREE.Raycaster(),[]);
  const scratch=useMemo(()=>new THREE.Vector3(),[]);
  useFrame((_,delta)=>{
    const progress=refs.progress.current;
    const shot=sampleJourneyShot(progress);
    const nextPos=new THREE.Vector3(...shot.position);
    const nextLook=new THREE.Vector3(...shot.look);
    const focus=ease((progress-.12)/.10)*(1-ease((progress-.91)/.085));
    // A 25% wider orbit leaves breathing room for the model and the external annotation.
    const distance=nextPos.clone().sub(nextLook);
    nextPos.addScaledVector(distance,.24*focus);
    nextLook.x+=.68*focus; // product stays left of the right-side copy
    if(mobile){
      if(focus<.001){
        nextPos.set(3.9,1.32,9.25); // a visibly smaller hero headphone, above mobile headline
        nextLook.set(0,-.52,0);
      }else{
        nextPos.multiplyScalar(1.16);
        nextLook.set(nextLook.x*.40,nextLook.y-.49,0);
      }
    }
    const k=1-Math.exp(-Math.min(.06,delta)*10);
    lastPos.current.lerp(nextPos,k);lastLook.current.lerp(nextLook,k);
    camera.position.copy(lastPos.current);camera.lookAt(lastLook.current);
    const pc=camera as THREE.PerspectiveCamera;
    const desired=shot.fov+4*focus+(mobile?8:0);
    if(Math.abs(pc.fov-desired)>.025){pc.fov=THREE.MathUtils.lerp(pc.fov,desired,k);pc.updateProjectionMatrix();}
    const index=refs.chapter.current;
    const root=groupRef.current;
    const path=refs.lineRef.current,dot=refs.dotRef.current;
    const stage=refs.stageRef.current,card=refs.cardRef.current;
    if(index<0||!root||!path||!dot||!stage||!card)return;
    if(++counter.current%2)return;
    const box=stage.getBoundingClientRect(),cardBox=card.getBoundingClientRect();
    const canvasBox=gl.domElement.getBoundingClientRect();
    if(!box.width||!box.height||!canvasBox.width||!canvasBox.height)return;
    root.updateWorldMatrix(true,true);
    if(hitCache.current?.index!==index){
      // Shoot FROM THE ACTUAL CAMERA through the visible headphone silhouette.
      // Never use authored approximate coordinates or fall back to a floating point.
      let result:THREE.Intersection|undefined;
      for(const [x,y] of [[0,0],[-.13,.02],[.13,.02],[-.25,.13],[.25,.13],[0,.23],[-.25,-.13],[.25,-.13],[0,-.22]]){
        ray.setFromCamera(new THREE.Vector2(x,y),camera);
        const meshHit=ray.intersectObject(root,true)[0];
        if(meshHit){result=meshHit;break;}
      }
      if(!result){
        path.style.opacity="0";
        dot.style.opacity="0";
        return;
      }
      hitCache.current={index,point:root.worldToLocal(result.point.clone())};
      path.style.opacity="1";
      dot.style.opacity="1";
    }
    scratch.copy(hitCache.current.point);
    root.localToWorld(scratch);
    scratch.project(camera);
    if(scratch.z< -1||scratch.z>1)return;
    const x=canvasBox.left-box.left+(scratch.x*.5+.5)*canvasBox.width;
    const y=canvasBox.top-box.top+(-scratch.y*.5+.5)*canvasBox.height;
    const endX=mobile?cardBox.left-box.left+cardBox.width*.5:cardBox.left-box.left;
    const endY=mobile?cardBox.top-box.top+7:cardBox.top-box.top+cardBox.height*.48;
    const turnX=mobile?x+(endX-x)*.23:endX-27,turnY=mobile?endY-32:y;
    dot.style.transform="translate3d("+x+"px,"+y+"px,0)";
    path.setAttribute("d","M "+x+" "+y+" L "+turnX+" "+turnY+" L "+endX+" "+endY);
  });
  return null;
}

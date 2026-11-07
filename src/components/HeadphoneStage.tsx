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
function Tube({points,radius,color,metalness=.8,roughness=.3}:{points:number[][];radius:number;color:string;metalness?:number;rough¶»§q«^
import {copyFileSync,mkdirSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {dirname,resolve} from "node:path";
const base=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const src=resolve(base,"node_modules/three/examples/jsm/libs/draco/gltf");
const dst=resolve(base,"public/draco");
mkdirSync(dst,{recursive:true});
for(const name of ["draco_decoder.wasm","draco_wasm_wrapper.js","draco_decoder.js"]){
 copyFileSync(resolve(src,name),resolve(dst,name));
}
console.log("Bundled local Draco decoders.");

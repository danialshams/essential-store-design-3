"""Render three studio approvals from a legitimately acquired AirPods Max asset.
The purchased source FBX/OBJ and PBR maps must remain PRIVATE; never commit
or publish the asset to public GitHub or as a standalone downloadable GLB.

blender -b --python-exit-code 1 --python scripts/render_licensed_asset.py -- \
  --asset private-assets/airpods-max/model.fbx --textures private-assets/airpods-max \
  --output build/model-approval --samples 64
"""
import argparse
import json
import math
import re
import sys
from pathlib import Path
import bpy
from mathutils import Vector

def options():
    a=argparse.ArgumentParser()
    a.add_argument("--asset", required=True)
    a.add_argument("--textures", default="")
    a.add_argument("--output", default="build/model-approval")
    a.add_argument("--samples", type=int, default=64)
    a.add_argument("--resolution", type=int, default=1280)
    a.add_argument("--audit-only", action="store_true")
    return a.parse_args(sys.argv[sys.argv.index("--")+1:])

def import_asset(file):
    ext=file.suffix.lower()
    if not file.is_file():
        raise RuntimeError("Purchased asset file not found: "+str(file))
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    if ext==".fbx":
        try: bpy.ops.wm.fbx_import(filepath=str(file))
        except (AttributeError, TypeError): bpy.ops.import_scene.fbx(filepath=str(file),use_image_search=True)
    elif ext==".obj":
        try: bpy.ops.wm.obj_import(filepath=str(file))
        except (AttributeError, TypeError): bpy.ops.import_scene.obj(filepath=str(file),use_image_search=True)
    elif ext in (".glb",".gltf"):
        bpy.ops.import_scene.gltf(filepath=str(file))
    else:
        raise RuntimeError("Only FBX, OBJ, or GLB accepted; use the licensed model's supplied files.")
    meshes=[o for o in bpy.data.objects if o.type=="MESH"]
    if not meshes:
        raise RuntimeError("Imported file contains no mesh.")
    return meshes

def image_files(path):
    allowed={".png",".jpg",".jpeg",".tif",".tiff",".webp",".exr"}
    return sorted((f for f in path.rglob("*") if f.suffix.lower() in allowed),key=lambda p:str(p)) if path.is_dir() else []

def attach_maps(meshes, images):
    mapped={}
    semantic={
      "base_color":re.compile(r"(albedo|base.?color|diffuse|_col(?:or)?|_diff)",re.I),
      "normal":re.compile(r"(normal|_nrm|_nor)(?![a-z])",re.I),
      "roughness":re.compile(r"(rough|roughness)",re.I),
      "metallic":re.compile(r"(metalness|metallic)",re.I),
      "ao":re.compile(r"(ambient.?occlusion|_ao(?:$|_))",re.I),
    }
    mats={mat for obj in meshes for mat in obj.data.materials if mat}
    for mat in mats:
        candidates={}
        key=re.sub(r"[^a-z0-9]+"," ",mat.name.lower())
        tokens={t for t in key.split() if len(t)>2}
        for file in images:
            name=file.stem.lower()
            common=len(tokens & set(re.split(r"[^a-z0-9]+",name)))
            for k,matcher in semantic.items():
                if matcher.search(name) and (common>0 or len(mats)==1):
                    if k not in candidates or candidates[k][0]<common: candidates[k]=(common,file)
        if not candidates:
            # The original imported shader graph may already have embedded maps.
            continue
        mat.use_nodes=True
        nodes=mat.node_tree.nodes; links=mat.node_tree.links
        shader=next((n for n in nodes if n.type=="BSDF_PRINCIPLED"),None)
        if not shader: continue
        kinds=[]
        for kind,(_,path) in candidates.items():
            image=bpy.data.images.load(str(path),check_existing=True)
            if kind!="base_color":image.colorspace_settings.name="Non-Color"
            n=nodes.new("ShaderNodeTexImage");n.image=image;n.label=kind
            n.location=(-650,-160*len(kinds))
            port={"base_color":"Base Color","roughness":"Roughness","metallic":"Metallic"}.get(kind)
            if port and shader.inputs.get(port):
                # The exact supplied texture takes precedence over a flat value.
                sock=shader.inputs[port]
                for old in list(sock.links):links.remove(old)
                links.new(n.outputs["Color"],sock)
            elif kind=="normal":
                normal=nodes.new("ShaderNodeNormalMap");normal.inputs["Strength"].default_value=.5
                normal.location=(-390,-150*len(kinds))
                links.new(n.outputs["Color"],normal.inputs["Color"])
                links.new(normal.outputs["Normal"],shader.inputs["Normal"])
            kinds.append(kind)
        mapped[mat.name]=kinds
    return mapped

def audit(meshes,images,mapped,asset):
    tri_count=0
    missing_uv=[]
    obj_names=[]
    for obj in meshes:
        obj_names.append(obj.name)
        tri_count+=sum(len(poly.vertices)-2 for poly in obj.data.polygons)
        if not obj.data.uv_layers:missing_uv.append(obj.name)
    embedded=sum(1 for i in bpy.data.images if i.size[0]>0 and i.size[1]>0)
    names=" ".join(obj_names).lower()
    return {
      "source_filename":asset.name,"mesh_objects":len(meshes),
      "triangles_estimate":tri_count,"external_texture_files":len(images),
      "blender_images_total":embedded,"materials_with_new_pbr_images":mapped,
      "uv_missing":missing_uv,
      "separate_cushion_detected":bool(re.search("pad|cushion|foam",names)),
      "separate_hinge_detected":bool(re.search("hinge|joint|arm|swivel",names)),
      "warning":"No purchased original is redistributed or uploaded by this script."
    }

def bbox(meshes):
    verts=[obj.matrix_world@Vector(c) for obj in meshes for c in obj.bound_box]
    lo=Vector([min(v[i] for v in verts) for i in range(3)])
    hi=Vector([max(v[i] for v in verts) for i in range(3)])
    return lo,hi,(lo+hi)/2,max((hi-lo).length,0.01)

def area(name,loc,target,power,size):
    datablock=bpy.data.lights.new(name,"AREA");datablock.energy=power
    datablock.shape="RECTANGLE";datablock.size=size;datablock.size_y=size*.55
    obj=bpy.data.objects.new(name,datablock);bpy.context.collection.objects.link(obj)
    obj.location=loc;aim(obj,target)

def aim(obj,target):
    obj.rotation_euler=(Vector(target)-obj.location).to_track_quat("-Z","Y").to_euler()

def camera(name,location,target,lens):
    c=bpy.data.cameras.new(name);c.lens=lens
    obj=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(obj)
    obj.location=location;aim(obj,target);return obj

def set_render(samples,res):
    s=bpy.context.scene
    s.render.engine="CYCLES"
    s.cycles.device="CPU";s.cycles.samples=samples
    if hasattr(bpy.context.view_layer,"cycles"):
        bpy.context.view_layer.cycles.use_denoising=True
    s.render.resolution_x=res;s.render.resolution_y=res
    s.render.resolution_percentage=100
    s.render.image_settings.file_format="PNG"
    try:s.view_settings.view_transform="AgX"
    except TypeError:s.view_settings.view_transform="Filmic"
    world=bpy.data.worlds.new("Studio / controlled neutral fill")
    s.world=world;world.use_nodes=True
    back=world.node_tree.nodes.get("Background")
    back.inputs["Color"].default_value=(.28,.32,.4,1)
    back.inputs["Strength"].default_value=.65

def select_part(meshes,words):
    matching=[o for o in meshes if any(w in o.name.lower() for w in words)]
    return max(matching,key=lambda x:x.dimensions.length) if matching else None

def main():
    a=options()
    asset=Path(a.asset).expanduser().resolve()
    root=Path(a.textures).expanduser().resolve() if a.textures else asset.parent
    out=Path(a.output).expanduser().resolve();out.mkdir(parents=True,exist_ok=True)
    meshes=import_asset(asset)
    images=image_files(root)
    mapped=attach_maps(meshes,images)
    bpy.context.view_layer.update()
    report=audit(meshes,images,mapped,asset)
    (out/"audit.json").write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding="utf-8")
    print("ASSET_AUDIT",json.dumps(report,ensure_ascii=False))
    if a.audit_only:return
    lo,hi,center,r=bbox(meshes)
    set_render(a.samples,a.resolution)
    area("Key softbox",center+Vector((r*.8,-r*1.2,r*1.5)),center,400*r*r,r)
    area("Metallic rim strip",center+Vector((-r*.9,r*.85,r*.95)),center,520*r*r,r*.85)
    area("Large frontal soft fill",center+Vector((-r*.7,-r*1.45,r*.3)),center,220*r*r,r)
    cushion=select_part(meshes,("cushion","pad","foam"))
    hinge=select_part(meshes,("hinge","joint","arm","swivel"))
    spots=[
      ("01-hero.png",center,center+Vector((r*.8,-r*1.75,r*.55)),58),
      ("02-cushion-macro.png",cushion.matrix_world.translation if cushion else center+Vector((r*.17,0,-r*.14)),(cushion.matrix_world.translation if cushion else center+Vector((r*.17,0,-r*.14)))+Vector((r*.28,-r*.58,r*.07)),90),
      ("03-hinge-macro.png",hinge.matrix_world.translation if hinge else center+Vector((r*.19,0,r*.17)),(hinge.matrix_world.translation if hinge else center+Vector((r*.19,0,r*.17)))+Vector((r*.3,-r*.58,r*.17)),90)
    ]
    for filename,target,position,lens in spots:
        bpy.context.scene.camera=camera(filename,position,target,lens)
        bpy.context.scene.render.filepath=str(out/filename)
        bpy.ops.render.render(write_still=True)
        print("RENDER_OK",filename)
    print("Three studio renders generated from actual imported model",out)

if __name__=="__main__":
    main()

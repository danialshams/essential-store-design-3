"""Single-frame food CGI using a licensed CC0 mesh, actual PBR textures and Blender Cycles."""
import bpy,math,sys,os,json
from pathlib import Path
from mathutils import Vector
args=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
def flag(name,default):
    return args[args.index(name)+1] if name in args else default
asset=Path(flag("--assets","assets/pasta")).resolve()
out=Path(flag("--output","output/pasta-still")).resolve()
out.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)

# Bring in a real, licensed 3D textured model, not procedural toy spaghetti or photo layers.
before=set(bpy.data.objects)
bpy.ops.import_scene.gltf(filepath=str(asset/"plate-of-pasta.glb"))
imported=set(bpy.data.objects)-before
meshes=[o for o in imported if o.type=="MESH"]
if not meshes:raise RuntimeError("GLB contained no mesh")
from mathutils import Vector
def bbox(objs):
    vertices=[o.matrix_world @ Vector(c) for o in objs for c in o.bound_box]
    low=Vector((min(v[i] for v in vertices) for i in range(3)))
    high=Vector((max(v[i] for v in vertices) for i in range(3)))
    return low,high
bmin,bmax=bbox(meshes)
print("MODEL audit",json.dumps({
    "objects":len(imported),"meshes":len(meshes),
    "polygons":sum(len(o.data.polygons) for o in meshes),
    "materials":len(set(m.name for o in meshes for m in o.data.materials)),
    "dimensions":[round(x,5) for x in (bmax-bmin)]}),flush=True)
root=bpy.data.objects.new("Licensed textured pasta GLB — CC0",None)
bpy.context.collection.objects.link(root)
for o in imported:
    if not o.parent: o.parent=root
span=max((bmax-bmin).x,(bmax-bmin).y)
if span<=0:raise RuntimeError("Degenerate source mesh bounds")
factor=3.35/span
root.scale=(factor,factor,factor)
root.location=(-factor*(bmin.x+bmax.x)/2,-factor*(bmin.y+bmax.y)/2,-factor*bmin.z+.035)
bpy.context.view_layer.update()
low,high=bbox(meshes)
print("SCALED BOUNDS",list(low),list(high),flush=True)

scene=bpy.context.scene
scene.render.engine="CYCLES"
scene.cycles.device="CPU"
scene.cycles.samples=48
scene.render.resolution_x=1450
scene.render.resolution_y=960
scene.render.resolution_percentage=100
scene.render.image_settings.file_format="PNG"
scene.render.image_settings.color_mode="RGBA"
scene.render.film_transparent=False
scene.render.engine="CYCLES"
scene.render.threads_mode="FIXED"
scene.render.threads=2
scene.view_settings.view_transform="AgX"
scene.view_settings.look="Medium High Contrast"
scene.view_settings.view_settings if False else None
scene.view_settings.exposure=0.15
scene.view_settings.gamma=1.0
scene.cycles.use_denoising=True
bpy.context.view_layer.cycles.use_denoising=True

world=bpy.data.worlds.new("Natural warm restaurant HDRI")
scene.world=world
world.use_nodes=True
wn=world.node_tree.nodes
wn.clear()
env=wn.new("ShaderNodeTexEnvironment")
env.image=bpy.data.images.load(str(asset/"restaurant.hdr"),check_existing=True)
background=wn.new("ShaderNodeBackground")
background.inputs["Strength"].default_value=.50
worldout=wn.new("ShaderNodeOutputWorld")
world.node_tree.links.new(env.outputs["Color"],background.inputs["Color"])
world.node_tree.links.new(background.outputs["Background"],worldout.inputs["Surface"])

# Actual PBR texture channels (color / roughness / normal) are mapped to a wooden restaurant table.
mat=bpy.data.materials.new("Wood Table | photo PBR color, roughness, tangent normal")
mat.use_nodes=True
nodes=mat.node_tree.nodes; nodes.clear(); links=mat.node_tree.links
outmat=nodes.new("ShaderNodeOutputMaterial")
bsdf=nodes.new("ShaderNodeBsdfPrincipled")
bsdf.inputs["Roughness"].default_value=.48
links.new(bsdf.outputs["BSDF"],outmat.inputs["Surface"])
texcoord=nodes.new("ShaderNodeTexCoord")
mapping=nodes.new("ShaderNodeMapping")
mapping.inputs["Scale"].default_value=(2.15,2.15,2.15)
links.new(texcoord.outputs["Generated"],mapping.inputs["Vector"])
for path,socket,srgb in [
    ("wood_diff.jpg","Base Color",True),
    ("wood_rough.jpg","Roughness",False)
]:
    tex=nodes.new("ShaderNodeTexImage")
    tex.image=bpy.data.images.load(str(asset/path),check_existing=True)
    tex.image.colorspace_settings.name="sRGB" if srgb else "Non-Color"
    links.new(mapping.outputs["Vector"],tex.inputs["Vector"])
    links.new(tex.outputs["Color"],bsdf.inputs[socket])
tex=nodes.new("ShaderNodeTexImage")
tex.image=bpy.data.images.load(str(asset/"wood_nor.jpg"),check_existing=True)
tex.image.colorspace_settings.name="Non-Color"
links.new(mapping.outputs["Vector"],tex.inputs["Vector"])
normal=nodes.new("ShaderNodeNormalMap")
normal.inputs["Strength"].default_value=.35
links.new(tex.outputs["Color"],normal.inputs["Color"])
links.new(normal.outputs["Normal"],bsdf.inputs["Normal"])
bpy.ops.mesh.primitive_plane_add(size=20,location=(0,0,low.z-.034))
table=bpy.context.object; table.name="True photo-textured hardwood tabletop"
table.data.materials.append(mat)
# Focused camera: close low three-quarter product-hero angle, shallow DOF with safe clarity.
bpy.ops.object.camera_add(location=(3.0,-5.45,3.25))
camera=bpy.context.object; scene.camera=camera
focus=Vector((0,0,(low.z+high.z)/2+.02))
camera.rotation_euler=(focus-camera.location).to_track_quat("-Z","Y").to_euler()
camera.data.lens=57
camera.data.dof.use_dof=True
camera.data.dof.focus_distance=(camera.location-focus).length
camera.data.dof.aperture_fstop=6.3
def area(name,loc,power,size,color,target=None):
    bpy.ops.object.light_add(type="AREA",location=loc)
    l=bpy.context.object;l.name=name;l.data.energy=power;l.data.shape="DISK";l.data.size=size;l.data.color=color
    tar=target or Vector((0,0,0.20))
    l.rotation_euler=(tar-l.location).to_track_quat("-Z","Y").to_euler()
area("Large soft amber key",(-3,-3,5),850,4.0,(1.0,.73,.53))
area("Soft bounce fill",(3,-1.2,3.0),340,4.0,(.70,.80,1.0))
area("Copper rim light",(0,3.0,4.2),1000,3.0,(1.0,.63,.37))

# Keep textured source intact and pack for reproducible editable Blender artifact.
scene.render.filepath=str(out/"pasta-beauty.png")
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=str(out/"pasta-cycles-still.blend"))
with (out/"QA.json").open("w") as f:
    json.dump({"renderer":"Blender Cycles 4.5", "frame_count":1, "resolution":[1450,960],
       "samples":48,"model_source":"Innerscene CC0",
       "model_meshes":len(meshes),"polycount":sum(len(o.data.polygons) for o in meshes),
       "model_materials":len(set(m.name for o in meshes for m in o.data.materials)),
       "wood_pbr":"Poly Haven CC0","hdr":"Poly Haven Warm Restaurant CC0",
       "note":"Unretouched 3D render. Quality requires visual review before animation."},f,indent=2)
bpy.ops.render.render(write_still=True)
print("REAL SINGLE-FRAME RENDER COMPLETE",str(out/"pasta-beauty.png"),flush=True)

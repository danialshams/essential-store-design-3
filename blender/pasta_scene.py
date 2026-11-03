"""Procedural 3D animation of a pasta dish separating into ingredient layers.

Proof of real Blender geometry, lighting, animation and CPU rendering.
Not a production-quality food model and not AI image/DOM compositing.
Compatible with Blender 3.6/4.x using the Cycles CPU renderer.
"""
import bpy
import json
import math
import os
import random
import sys
from mathutils import Vector

random.seed(29)
args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
out_dir = args[args.index("--output") + 1] if "--output" in args else os.path.abspath("output/pasta")
os.makedirs(out_dir, exist_ok=True)

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)

scene = bpy.context.scene
scene.render.engine = "CYCLES"
scene.cycles.device = "CPU"
scene.cycles.samples = 12
scene.cycles.use_denoising = True
scene.render.resolution_x = 720
scene.render.resolution_y = 432
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"
scene.render.film_transparent = False
scene.view_settings.view_transform = "AgX" if "AgX" in bpy.types.ColorManagedViewSettings.bl_rna.properties["view_transform"].enum_items.keys() else "Filmic"
scene.frame_start = 1
scene.frame_end = 24
scene.render.fps = 12

world = bpy.data.worlds.new("Warm restaurant atmosphere")
scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (.11,.078,.055,1)
world.node_tree.nodes["Background"].inputs["Strength"].default_value = .42

def material(name, color, roughness=.55, metallic=0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    b = m.node_tree.nodes.get("Principled BSDF")
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = roughness
    b.inputs["Metallic"].default_value = metallic
    return m

ceramic = material("Ivory glazed ceramic", (.78,.705,.61), .25)
table_mat = material("Warm dark wooden table", (.075,.042,.025), .7)
pasta_mat = material("Pasta durum wheat", (.79,.47,.12), .48)
pasta_2 = material("Pasta highlight wheat", (.97,.7,.25), .38)
sauce_mat = material("Cooked tomato sauce", (.45,.035,.017), .33)
sauce_2 = material("Roasted tomato pulp", (.25,.022,.011), .53)
cheese_mat = material("Parmigiano flakes", (.91,.75,.42), .51)
tomato_mat = material("Cherry tomato skin", (.72,.05,.019), .21)
basil_mat = material("Fresh basil green", (.035,.28,.065), .29)
basil_2 = material("Basil glossy green", (.08,.4,.07), .31)

# Subtle surface variation uses procedural noise; still all real 3D materials.
for mat, scale, strength in ((pasta_mat,35,.12),(sauce_mat,20,.22),(ceramic,5,.05)):
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    noise = nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = scale
    bump = nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = strength
    bump.inputs["Distance"].default_value = .03
    links.new(noise.outputs["Fac"], bump.inputs["Height"])
    links.new(bump.outputs["Normal"], nodes["Principled BSDF"].inputs["Normal"])

def mesh_object(name, verts, faces, mat):
    me = bpy.data.meshes.new(name + " mesh")
    me.from_pydata(verts, [], faces)
    me.update()
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    ob.data.materials.append(mat)
    for p in ob.data.polygons:
        p.use_smooth = True
    return ob

def revolution(name, profile, mat, segments=96):
    verts=[]
    for radius, z in profile:
        for i in range(segments):
            a=i*2*math.pi/segments
            verts.append((radius*math.cos(a),radius*math.sin(a),z))
    faces=[]
    for j in range(len(profile)-1):
        for i in range(segments):
            ni=(i+1)%segments
            faces.append((j*segments+i,j*segments+ni,(j+1)*segments+ni,(j+1)*segments+i))
    o=mesh_object(name,verts,faces,mat)
    solid=o.modifiers.new("Small thickness","SOLIDIFY")
    solid.thickness=.035
    bevel=o.modifiers.new("Soft ceramic lip","BEVEL")
    bevel.width=.018
    bevel.segments=2
    return o

plate = revolution("Actual 3D serving bowl",[(0,.135),(.55,.13),(1.12,.15),(1.49,.18),(1.69,.28),(1.81,.33),(1.88,.31)],ceramic)
plate.location=(0,0,.0)

def plane(name,scale,mat,z):
    bpy.ops.mesh.primitive_plane_add(size=2,location=(0,0,z))
    ob=bpy.context.object
    ob.name=name
    ob.scale=scale
    ob.data.materials.append(mat)
    return ob
plane("Restaurant table", (15,15,1), table_mat, -.04)

# Group ingredient geometry into physically independent animated 3D parents.
groups={}
for name in ["spaghetti","sauce","cheese","tomatoes","basil"]:
    g=bpy.data.objects.new("Ingredient group | "+name,None)
    bpy.context.collection.objects.link(g)
    groups[name]=g

def tube(name, coords, radius, mat, parent):
    cr=bpy.data.curves.new(name+" geometry","CURVE")
    cr.dimensions="3D"
    cr.resolution_u=8
    cr.bevel_resolution=3
    cr.bevel_depth=radius
    sp=cr.splines.new("POLY")
    sp.points.add(len(coords)-1)
    for i,p in enumerate(coords):
        sp.points[i].co=(*p,1)
    ob=bpy.data.objects.new(name,cr)
    bpy.context.collection.objects.link(ob)
    cr.materials.append(mat)
    ob.parent=parent
    return ob

# Curving, interwoven spaghetti strands: actual tubular curves, not flat sprites.
for i in range(46):
    phase=i*2.39996
    base_r=.18+random.random()*.75
    center_x=random.uniform(-.19,.19)
    center_y=random.uniform(-.19,.19)
    height=.29+(i%6)*.034
    coords=[]
    for j in range(72):
        t=j/71
        ang=phase + (t-.5)*(3.2+random.uniform(-.005,.005))*math.pi
        rad=base_r + .16*math.sin(2.6*t*math.pi+i)
        x=center_x + rad*math.cos(ang)
        y=center_y + rad*math.sin(ang)
        z=height+.025*math.sin(5*t*math.pi+i)
        coords.append((x,y,z))
    tube("Spaghetti strand %02d"%i,coords,.023,pasta_mat if i%3 else pasta_2,groups["spaghetti"])

def sphere(name, xyz, radius, mat, group, scale=None, ico=False):
    if ico:
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2,radius=radius, location=xyz)
    else:
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=8,radius=radius,location=xyz)
    ob=bpy.context.object
    ob.name=name
    ob.parent=group
    ob.data.materials.append(mat)
    if scale: ob.scale=scale
    for p in ob.data.polygons:p.use_smooth=True
    return ob

for i in range(38):
    angle=random.uniform(0,2*math.pi)
    rad=random.uniform(.22,1.22)
    xyz=(rad*math.cos(angle),rad*math.sin(angle),random.uniform(.39,.52))
    sphere("Sauce and minced tomato %02d"%i,xyz,random.uniform(.075,.16),
           sauce_mat if i%3 else sauce_2,groups["sauce"],
           (random.uniform(.8,1.5),random.uniform(.8,1.4),random.uniform(.25,.55)),ico=i%3==0)

for i in range(22):
    a=random.uniform(0,math.tau)
    rad=random.uniform(.35,1.12)
    sphere("Tomato %02d"%i,(rad*math.cos(a),rad*math.sin(a),random.uniform(.38,.53)),
           random.uniform(.06,.12),tomato_mat,groups["tomatoes"],(1,1,.73))

for i in range(62):
    a=random.uniform(0,math.tau)
    rad=random.uniform(.1,1.31)
    pos=(rad*math.cos(a),rad*math.sin(a),random.uniform(.48,.57))
    bpy.ops.mesh.primitive_cube_add(size=1,location=pos)
    o=bpy.context.object
    o.name="Cheese shaving %02d"%i
    o.parent=groups["cheese"]
    o.scale=(random.uniform(.045,.14),random.uniform(.012,.028),random.uniform(.006,.012))
    o.rotation_euler=(random.uniform(-.2,.2),random.uniform(-.3,.3),a)
    o.data.materials.append(cheese_mat)
    bev=o.modifiers.new("Cheese soft corners","BEVEL")
    bev.width=.12
    bev.segments=2

# Creased basil leaf meshes rather than floating image planes.
for i in range(21):
    a=random.uniform(0,math.tau)
    rad=random.uniform(.15,1.23)
    cx,cy=rad*math.cos(a),rad*math.sin(a)
    size=random.uniform(.13,.22)
    verts=[]
    for k in range(9):
        t=k/8
        y=(t-.5)*size*2
        half=math.sin(t*math.pi)*size*.34
        z=.57+.035*math.sin(2*math.pi*t)
        verts.extend([(cx-half,cy+y,z),(cx+half,cy+y,z+.012)])
    faces=[]
    for k in range(8): faces.append((2*k,2*k+1,2*k+3,2*k+2))
    ob=mesh_object("Basil leaf %02d"%i,verts,faces,basil_mat if i%3 else basil_2)
    ob.parent=groups["basil"]
    ob.rotation_euler[2]=a
    solid=ob.modifiers.new("Leaf thickness","SOLIDIFY")
    solid.thickness=.005

# Steam is a light stylized procedural curve for this mechanical rendering proof.
steamMat=material("Steam light",(.56,.55,.51),.98)
for i in range(5):
    x=(i-2)*.34
    pts=[]
    for j in range(35):
        t=j/34
        pts.append((x + .09*math.sin(6*t+i),
                    -.05 + .09*math.cos(5*t+i),
                    .56 + t*.85))
    ob=tube("Steam trail %d"%i,pts,.004,steamMat,groups["spaghetti"])

def key(g,frame,xyz,rotation=(0,0,0)):
    g.location=xyz
    g.rotation_euler=rotation
    g.keyframe_insert(data_path="location",frame=frame)
    g.keyframe_insert(data_path="rotation_euler",frame=frame)

offsets={
    "spaghetti":(-.12,-.17,.94),
    "sauce":(.33,.2,1.6),
    "cheese":(-.24,.1,2.34),
    "tomatoes":(.43,-.18,2.96),
    "basil":(-.25,.15,3.52),
}
for name,g in groups.items():
    dest=offsets[name]
    key(g,1,(0,0,0))
    key(g,6,(0,0,0))
    key(g,20,dest,(.08,-.08,.07))
    key(g,24,dest,(.08,-.08,.07))
    if g.animation_data:
        for fcurve in g.animation_data.action.fcurves:
            for k in fcurve.keyframe_points: k.interpolation="BEZIER"

def aim(ob,target):
    direction=Vector(target)-ob.location
    ob.rotation_euler=direction.to_track_quat("-Z","Y").to_euler()

bpy.ops.object.camera_add(location=(3.4,-6.4,3.35))
cam=bpy.context.object
cam.name="Cinematic dolly camera"
scene.camera=cam
cam.data.lens=48
for frame,loc,target in [
    (1,(3.4,-6.4,3.35),(0,0,.40)),
    (6,(3.3,-6.0,3.20),(0,0,.54)),
    (20,(3.95,-7.1,4.4),(0,0,1.70)),
    (24,(3.95,-7.1,4.4),(0,0,1.70)),
]:
    cam.location=loc
    aim(cam,target)
    cam.keyframe_insert(data_path="location",frame=frame)
    cam.keyframe_insert(data_path="rotation_euler",frame=frame)

def area(name,position,power,size,color,target=(0,0,.7)):
    bpy.ops.object.light_add(type="AREA",location=position)
    l=bpy.context.object
    l.name=name
    l.data.energy=power
    l.data.shape="DISK"
    l.data.size=size
    l.data.color=color
    aim(l,target)

area("Warm softbox key",(-3,-2,6),1100,5,(1.0,.77,.52))
area("Cool editorial fill",(4,-1,3),450,4,(.65,.78,1.0))
area("Warm rim",(0,4,5),1600,3,(1.0,.64,.36))

scene.camera.data.dof.use_dof=True
scene.camera.data.dof.focus_distance=7.5
scene.camera.data.dof.aperture_fstop=5.6
scene.render.filepath=os.path.join(out_dir,"frame-")
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(out_dir,"pasta-proof.blend"))

with open(os.path.join(out_dir,"manifest.json"),"w",encoding="utf-8") as f:
    json.dump({"renderer":"Blender Cycles CPU","frames":24,"fps":12,
               "resolution":"720x432",
               "purpose":"Proof of actual 3D geometry and animated separated ingredients",
               "quality":"procedural prototype, NOT final photorealistic food CG",
               "layers":list(groups)},f,ensure_ascii=False,indent=2)
print("RENDER START: 24 frames of actual Blender geometry")
bpy.ops.render.render(animation=True)
print("RENDER COMPLETE")

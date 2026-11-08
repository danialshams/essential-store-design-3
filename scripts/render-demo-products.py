import bpy, math
from mathutils import Vector
from pathlib import Path

out=Path("/tmp/aether-renders")
out.mkdir(exist_ok=True)
def clear():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
def material(name,color,rough=.5,metal=.0):
    obj=bpy.data.materials.new(name)
    obj.diffuse_color=(*color,1)
    obj.use_nodes=True
    bs=obj.node_tree.nodes.get("Principled BSDF")
    bs.inputs["Base Color"].default_value=(*color,1)
    bs.inputs["Roughness"].default_value=rough
    bs.inputs["Metallic"].default_value=metal
    return obj
alloy=material("Brushed Metal",(.34,.38,.42),.28,.83)
edge=material("Polished Silver",(.61,.66,.69),.23,.94)
glass=material("Deep Obsidian",(.015,.021,.028),.15,.26)
rubber=material("Matte graphite",(.045,.051,.057),.81,.02)
weave=material("Woven charcoal",(.058,.065,.073),.86,.1)

def box(name,pos,size,mat,bevel=.1):
    bpy.ops.mesh.primitive_cube_add(size=1,location=pos)
    obj=bpy.context.object
    obj.name=name
    obj.dimensions=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        modifier=obj.modifiers.new("Soft sculpted corners","BEVEL")
        modifier.width=bevel
        modifier.segments=7
        obj.modifiers.new("Weighted Normals","WEIGHTED_NORMAL")
    obj.data.materials.append(mat)
    return obj
def sphere(name,pos,scale,mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=40,ring_count=24,location=pos)
    obj=bpy.context.object
    obj.name=name
    obj.scale=scale
    obj.data.materials.append(mat)
    for face in obj.data.polygons:face.use_smooth=True
    return obj
def cylinder(name,pos,radius,depth,mat):
    bpy.ops.mesh.primitive_cylinder_add(vertices=72,radius=radius,depth=depth,location=pos)
    obj=bpy.context.object
    obj.name=name
    obj.data.materials.append(mat)
    for face in obj.data.polygons:face.use_smooth=True
    b=obj.modifiers.new("Rounded edges","BEVEL")
    b.width=.025;b.segments=3
    obj.modifiers.new("Weighted normals","WEIGHTED_NORMAL")
    return obj
def wire(name,start,end,mat,width=.018):
    a,b=Vector(start),Vector(end)
    delta=b-a
    bpy.ops.mesh.primitive_cylinder_add(vertices=16,radius=width,depth=delta.length,location=(a+b)/2)
    obj=bpy.context.object
    obj.rotation_euler=delta.to_track_quat("Z","Y").to_euler()
    obj.data.materials.append(mat)

def studio(cam=(2.5,-6.2,3.2)):
    scene=bpy.context.scene
    scene.render.engine="CYCLES"
    scene.cycles.samples=32
    scene.cycles.device="CPU"
    scene.render.resolution_x=700
    scene.render.resolution_y=700
    scene.render.resolution_percentage=100
    scene.render.film_transparent=True
    scene.render.image_settings.file_format="PNG"
    scene.render.image_settings.color_mode="RGBA"
    scene.view_settings.view_transform="AgX"
    world=bpy.data.worlds.new("Product studio")
    world.use_nodes=True
    world.node_tree.nodes["Background"].inputs["Color"].default_value=(.65,.7,.75,1)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value=.75
    scene.world=world
    def light(name,pos,power,size):
        data=bpy.data.lights.new(name,"AREA")
        data.energy=power
        data.shape="RECTANGLE"
        data.size=size;data.size_y=size*.65
        obj=bpy.data.objects.new(name,data)
        bpy.context.collection.objects.link(obj)
        obj.location=pos
        obj.rotation_euler=(Vector((0,0,.5))-obj.location).to_track_quat("-Z","Y").to_euler()
    light("Key",(1,-3,5),850,4)
    light("Fill",(-3,-2,2),460,3)
    light("Rim",(0,3,4),800,3)
    bpy.ops.object.camera_add(location=cam)
    obj=bpy.context.object
    obj.rotation_euler=(Vector((0,0,.5))-obj.location).to_track_quat("-Z","Y").to_euler()
    obj.data.type="ORTHO"
    obj.data.ortho_scale=3.6
    scene.camera=obj
def save(name):
    bpy.context.scene.render.filepath=str(out/(name+".png"))
    bpy.ops.render.render(write_still=True)
    print("RENDERED",name,flush=True)

clear()
box("Precision watch chassis",(0,0,.75),(1.22,.35,1.45),alloy,.20)
box("OLED glass",(0,-.20,.78),(1.07,.065,1.27),glass,.18)
box("Upper strap",(0,.13,1.82),(.89,.20,.97),rubber,.20)
box("Lower strap",(0,.15,-.38),(.89,.20,.98),rubber,.20)
cylinder("Crown",(.69,0,.93),.11,.19,edge).rotation_euler=(0,math.pi/2,0)
wire("Hour hand",(0,-.242,.73),(.04,-.242,1.05),edge,.016)
wire("Minute hand",(0,-.245,.73),(-.24,-.245,.56),edge,.012)
sphere("Watch pivot",(0,-.25,.73),(.04,.02,.04),edge)
studio()
save("watch")

clear()
box("Charging cradle",(0,-.04,.13),(1.75,.93,.77),glass,.29)
box("Charging border",(0,-.02,.47),(1.66,.88,.13),alloy,.09)
box("Raised lid",(0,.26,1.04),(1.78,.34,.72),glass,.2)
box("Lid lining",(0,.045,1.1),(1.5,.10,.5),rubber,.16)
for x in (-.42,.42):
    sphere("Earbud shell",(x,-.23,.76),(.24,.18,.26),rubber)
    sphere("Aluminum face",(x,-.42,.76),(.13,.02,.15),alloy)
    box("Earbud stem",(x,-.3,.48),(.1,.12,.37),alloy,.04)
studio()
save("earbuds")

clear()
cylinder("Textured body",(0,0,.57),.74,1.2,weave)
bs=weave.node_tree.nodes.get("Principled BSDF")
noise=weave.node_tree.nodes.new("ShaderNodeTexNoise")
noise.inputs["Scale"].default_value=190
bump=weave.node_tree.nodes.new("ShaderNodeBump")
bump.inputs["Strength"].default_value=.25
bump.inputs["Distance"].default_value=.05
weave.node_tree.links.new(noise.outputs["Fac"],bump.inputs["Height"])
weave.node_tree.links.new(bump.outputs["Normal"],bs.inputs["Normal"])
cylinder("Speaker metal bezel",(0,0,1.19),.73,.11,alloy)
cylinder("Touch top",(0,0,1.25),.68,.045,glass)
studio()
save("speaker")

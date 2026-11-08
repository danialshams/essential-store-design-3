import bpy
from mathutils import Vector
from pathlib import Path
import math

source = "/tmp/airpods-max-mask.glb"
Path("/tmp/aether-renders").mkdir(exist_ok=True)
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=source)
meshes = [o for o in bpy.data.objects if o.type == "MESH"]
if not meshes: raise ValueError("Headphone source has no geometry")
points = [o.matrix_world @ Vector(c) for o in meshes for c in o.bound_box]
minimum = Vector([min(p[i] for p in points) for i in range(3)])
maximum = Vector([max(p[i] for p in points) for i in range(3)])
center = (minimum+maximum)/2
radius = (maximum-minimum).length

scene=bpy.context.scene
scene.render.engine="CYCLES"
scene.cycles.samples=32
scene.cycles.device="CPU"
scene.render.resolution_x=800
scene.render.resolution_y=800
scene.render.resolution_percentage=100
scene.render.film_transparent=True
scene.render.image_settings.file_format="PNG"
scene.render.image_settings.color_mode="RGBA"
scene.view_settings.view_transform="AgX"
world=bpy.data.worlds.new("Cool Neutral Studio")
world.use_nodes=True
world.node_tree.nodes["Background"].inputs["Color"].default_value=(.68,.70,.74,1)
world.node_tree.nodes["Background"].inputs["Strength"].default_value=.75
scene.world=world

def aim(obj, pt):
    obj.rotation_euler=(Vector(pt)-obj.location).to_track_quat("-Z","Y").to_euler()

def light(name, pos, power, size):
    data=bpy.data.lights.new(name,"AREA")
    data.energy=power
    data.shape="RECTANGLE"
    data.size=size
    data.size_y=.7*size
    obj=bpy.data.objects.new(name,data)
    bpy.context.collection.objects.link(obj)
    obj.location=pos
    aim(obj,center)

light("Key",center+Vector((radius*.9,-radius*1.1,radius*.95)),radius*radius*500,radius*1.1)
light("Fill",center+Vector((-radius*.85,-radius*.55,radius*.6)),radius*radius*380,radius*.8)
light("Metal rim",center+Vector((radius*.45,radius*1.12,radius*1.0)),radius*radius*600,radius*.7)
camera=bpy.data.cameras.new("Aether camera")
camera.lens=50
obj=bpy.data.objects.new("Aether camera",camera)
bpy.context.collection.objects.link(obj)
scene.camera=obj

shots=[
("headphone-product",(.78,-1.8,.44),(.0,.0,0.),50),
("headphone-side",(-1.13,-1.60,.28),(.0,0.,0.),54),
("headphone-canopy",(.4,-.88,1.10),(0.,0.,.27),75),
("headphone-macro",(.92,-.75,.30),(.0,0.,-.18),81),
]
for name,offset,target,lens in shots:
    obj.location=center+Vector(x*radius for x in offset)
    aim(obj,center+Vector(x*radius for x in target))
    camera.lens=lens
    scene.render.filepath="/tmp/aether-renders/"+name+".png"
    bpy.ops.render.render(write_still=True)
    print("RENDERED",name,flush=True)

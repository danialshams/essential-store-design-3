# Blender 5 / no paid assets: bespoke over-ear studio headphone GLB
# Run: blender -b --factory-startup --python tools/build_studio_headphones.py
import bpy, math, random, os
from mathutils import Vector
from math import sin,cos,pi
random.seed(7)
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
for m in list(bpy.data.materials): bpy.data.materials.remove(m)
scene=bpy.context.scene
try:scene.render.engine="BLENDER_EEVEE"
except TypeError:scene.render.engine="BLENDER_EEVEE_NEXT"
scene.render.resolution_x=1120
scene.render.resolution_y=920
scene.render.resolution_percentage=100
scene.world.color=(.13,.15,.19)

# Blender Y-up glTF exporter converts Blender Z to glTF Y.
# Model local coordinates use X-horizontal, Y-vertical, Z-camera depth.
root=bpy.data.objects.new("AETHER_Studio_Headphones",None)
bpy.context.collection.objects.link(root)
root.rotation_euler[0]=pi/2
grp={}
def group(name,parent=None):
 ob=bpy.data.objects.new(name,None); bpy.context.collection.objects.link(ob)
 ob.parent=parent if parent else root
 grp[name]=ob
 return ob
headband=group("HEADBAND")
for side in (-1,1):
 group("HINGE_"+("L" if side<0 else "R"))
 group("SHELL_"+("L" if side<0 else "R"))
 group("DRIVER_"+("L" if side<0 else "R"))
 group("CUSHION_"+("L" if side<0 else "R"))

def material(name,color,metal=.0,rough=.45,coat=0):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 p=m.node_tree.nodes.get("Principled BSDF")
 p.inputs["Base Color"].default_value=(*color,1)
 p.inputs["Metallic"].default_value=metal
 p.inputs["Roughness"].default_value=rough
 p.inputs["Coat Weight"].default_value=coat
 p.inputs["Coat Roughness"].default_value=.22
 return m
def hexrgb(h):
 h=h.lstrip("#");a=[int(h[i:i+2],16)/255 for i in [0,2,4]]
 return tuple(((u+.055)/1.055)**2.4 if u>.04045 else u/12.92 for u in a)
silver=material("01 | bead-blasted titanium anodized aluminum",hexrgb("B5C2CD"),.88,.31,.13)
edge=material("02 | satin polished stainless steel",hexrgb("CFDFE9"),.96,.20,.15)
dark=material("03 | dark graphite anodized frame",hexrgb("252E39"),.65,.37,.14)
rubber=material("04 | molded black elastomer",hexrgb("1F2630"),.03,.74)
meshmat=material("05 | breathable blue-grey woven canopy",hexrgb("7E8E9D"),.03,.91)
cushion=material("06 | soft charcoal knitted ear cushion",hexrgb("596775"),.0,.94)
stitched=material("07 | silver textile seam",hexrgb("9AAAB9"),.0,.87)
speaker=material("08 | acoustic driver mesh",hexrgb("293949"),.58,.56)
copper=material("09 | copper coil",hexrgb("996B4B"),.81,.33)
glass=material("10 | dark membrane",hexrgb("111923"),.22,.49)
highlight=material("11 | polished edge detail",hexrgb("E4EDF4"),.94,.17)
indicator=material("12 | ivory print",hexrgb("DBE5EF"),.08,.45)
def apply(obj,mat,parent=None):
 if mat:obj.data.materials.append(mat)
 if parent:obj.parent=parent
 for f in obj.data.polygons:f.use_smooth=True
 return obj
def bevel_cube(name,loc,dims,mat,bevel=0.10,segments=10,parent=None):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc)
 obj=bpy.context.object;obj.name=name
 obj.dimensions=dims
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 if bevel>0:
  bevelmod=obj.modifiers.new("Industrial radius / machined transition","BEVEL")
  bevelmod.width=min(bevel,min(dims)*.48)
  bevelmod.segments=segments
  bevelmod.affect="EDGES"
  bpy.context.view_layer.objects.active=obj
  bpy.ops.object.modifier_apply(modifier=bevelmod.name)
 weighted=obj.modifiers.new("Weighted surface normals","WEIGHTED_NORMAL")
 weighted.keep_sharp=True
 bpy.ops.object.modifier_apply(modifier=weighted.name)
 return apply(obj,mat,parent)
def sphere(name,loc,scale,mat,parent=None,segments=32,rings=18):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,location=loc)
 obj=bpy.context.object;obj.name=name
 obj.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 return apply(obj,mat,parent)
def cylinder(name,loc,r,depth,mat,parent=None,vertices=48,rotation=None):
 bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=r,depth=depth,location=loc)
 obj=bpy.context.object;obj.name=name
 if rotation:obj.rotation_euler=rotation
 return apply(obj,mat,parent)
def tube(name,points,radius,mat,parent=None,bevel_resolution=5):
 curve=bpy.data.curves.new(name+"_path","CURVE")
 curve.dimensions="3D";curve.resolution_u=24
 poly=curve.splines.new("BEZIER");poly.bezier_points.add(len(points)-1)
 for b,p in zip(poly.bezier_points,points):
  b.co=p;b.handle_left_type="AUTO";b.handle_right_type="AUTO"
 curve.bevel_depth=radius;curve.bevel_resolution=bevel_resolution;curve.materials.append(mat)
 o=bpy.data.objects.new(name,curve);bpy.context.collection.objects.link(o)
 o.parent=parent
 return o
def ring_mesh(name,center,rx,ry,radius,mat,parent=None,seg=96,cross=16,exponent=.77,swelling=1):
 def sq(v):return math.copysign(abs(v)**exponent,v)
 verts=[];polys=[]
 for i in range(seg):
  t=2*pi*i/seg;ct,st=cos(t),sin(t)
  cx=rx*sq(ct);cy=ry*sq(st)
  nx=sq(ct);ny=sq(st)
  mag=math.hypot(nx,ny)
  nx/=mag;ny/=mag
  for j in range(cross):
   p=2*pi*j/cross
   variation=1+.015*sin(5*t+.3)*sin(3*p)
   verts.append((center[0]+cx+nx*radius*cos(p)*variation,center[1]+cy+ny*radius*cos(p)*variation,center[2]+radius*swelling*sin(p)))
 for i in range(seg):
  for j in range(cross):
   a=i*cross+j;b=((i+1)%seg)*cross+j
   polys.append((a,b,((i+1)%seg)*cross+(j+1)%cross,i*cross+(j+1)%cross))
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],polys);mesh.update()
 o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o);return apply(o,mat,parent)
def ring_flat(name,center,rx,ry,tube_r,mat,parent=None):
 return ring_mesh(name,center,rx,ry,tube_r,mat,parent,seg=96,cross=10)
def sculpted_earcup(name,center,mat,parent=None,rx=.535,ry=.668,depth=.32,exponent=.82):
    """True continuous convex product surface, NOT beveled cube primitives.
    The front subtly domes; the machined outer wall wraps around into the rear.
    """
    contours=[
       (.025,.220),(.33,.219),(.61,.214),(.78,.207),
       (.89,.190),(.954,.165),(.995,.116),(1.012,.055),
       (1.012,-.079),(.979,-.121),(.91,-.146),
       (.73,-.158),(.40,-.162),(.025,-.163)
    ]
    N=120
    verts=[];faces=[]
    def squircle(v):return math.copysign(abs(v)**exponent,v)
    for radial,z in contours:
      for j in range(N):
       a=2*math.pi*j/N
       x=center[0]+radial*rx*squircle(math.cos(a))
       y=center[1]+radial*ry*squircle(math.sin(a))
       verts.append((x,y,center[2]+z))
    for i in range(len(contours)-1):
      for j in range(N):
       a=i*N+j;b=i*N+(j+1)%N;c=(i+1)*N+(j+1)%N;d=(i+1)*N+j
       faces.append((a,d,c,b))
    faces.append(tuple(reversed(tuple(range(N)))))
    last=(len(contours)-1)*N
    faces.append(tuple(last+j for j in range(N)))
    mesh=bpy.data.meshes.new(name+"_tessellated")
    mesh.from_pydata(verts,[],faces);mesh.update()
    obj=bpy.data.objects.new(name,mesh)
    bpy.context.collection.objects.link(obj)
    return apply(obj,mat,parent)
def decal(name,loc,text,size,mat,parent=None):
 curve=bpy.data.curves.new(name,"FONT");curve.body=text;curve.size=size;curve.align_x="CENTER";curve.align_y="CENTER";curve.extrude=.0003
 obj=bpy.data.objects.new(name,curve);bpy.context.collection.objects.link(obj)
 obj.location=loc;obj.parent=parent;curve.materials.append(mat);return obj

# HEADBAND: stainless telescopic bands plus physically woven hammock
# Thin arch forms are smooth Bezier splines with real 3D curvature.
for side in [-1,1]:
 tube("Flexible outer carbon suspension spine "+str(side),[(side*.99,.15,-.04),(side*1.23,.72,-.06),(side*1.09,1.40,-.025),(side*.67,1.88,.03),(0,2.025,.035)],.079,dark,headband,7)
 tube("Polished spine inset "+str(side),[(side*1.035,.33,.035),(side*1.13,1.04,.03),(side*.81,1.67,.08),(side*.43,1.89,.075)],.021,edge,headband,6)
 tube("Elastic fabric edge piping front "+str(side),[(side*.95,1.47,.235),(side*.62,1.80,.245),(0,1.93,.245)],.022,meshmat,headband)
 tube("Elastic fabric edge piping rear "+str(side),[(side*.95,1.47,-.235),(side*.62,1.80,-.245),(0,1.93,-.245)],.022,meshmat,headband)

# Crossed yarn — not a translucent solid plastic surface. ~1800 fine crossings.
N=58;W=17; canopy=[]
def canopy_point(x,z):
 t=max(0,1-(x/1.03)**2)
 return (x,1.57+.37*math.sqrt(t)-.025*(z/.27)**2,z)
for i in range(N):
 x=-.98+1.96*i/(N-1)
 pts=[canopy_point(x,(-.235+(.47*j/10))) for j in range(11)]
 tube("Woven canopy warp %02d"%i,pts,.0068,meshmat,headband,2)
for j in range(W):
 z=-.235+.47*j/(W-1)
 pts=[canopy_point(-.99+1.98*i/24,z) for i in range(25)]
 tube("Woven canopy weft %02d"%j,pts,.0072,stitched if j%4==0 else meshmat,headband,2)
# fabric belly lining, narrow open texture backing 
tube("suspension center line",[(x,1.57+.37*math.sqrt(max(0,1-(x/1.03)**2)),-.004) for x in [-.99,-.7,-.35,0,.35,.7,.99]],.009,meshmat,headband)

# TELESCOPING ARM & precise fork hinge
for side in [-1,1]:
 S="L" if side<0 else "R";g=grp["HINGE_"+S]
 tube("Titanium telescoping arm |"+S,[(side*1.16,.44,-.045),(side*1.18,.12,-.045),(side*1.16,-.20,-.045)],.050,edge,g,7)
 tube("Arm inner extension |"+S,[(side*1.19,.42,-.046),(side*1.19,.22,-.046),(side*1.19,.03,-.046)],.030,silver,g,6)
 bevel_cube("machined guide sleeve |"+S,(side*1.18,.17,-.045),(.151,.23,.16),silver,.052,8,g)
 cylinder("earcup pivot axle |"+S,(side*1.16,-.24,-.04),.13,.17,edge,g,64,rotation=(pi/2,0,0))
 cylinder("pivot axis inset |"+S,(side*1.16,-.24,.062),.047,.017,dark,g,32,rotation=(pi/2,0,0))
 sphere("outer spherical joint |"+S,(side*1.16,-.29,-.06),(.12,.12,.13),silver,g)
 # Mechanical arm into body
 tube("swivel yoke |"+S,[(side*1.16,-.25,-.06),(side*1.16,-.36,-.08),(side*1.16,-.42,-.13)],.06,edge,g,8)

for side in [-1,1]:
 S="L" if side<0 else "R"
 shell=grp["SHELL_"+S]
 driver=grp["DRIVER_"+S]
 pad=grp["CUSHION_"+S]
 x=side*1.16;y=-.70
 # machined outer shell with 12-segment bevel, actual smooth normals
 sculpted_earcup("Continuous sculpted aluminum shell |"+S,(x,y,.225),silver,shell,rx=.535,ry=.665,exponent=.83)
 # lip and seam of the shell - subtle and precisely aligned
 ring_mesh("hidden soft perimeter gasket |"+S,(x,y,.064),.492,.610,.020,rubber,shell,seg=120,cross=12,exponent=.83)
 ring_mesh("satin metallic outer seam |"+S,(x,y,.086),.497,.624,.009,edge,shell,seg=120,cross=10,exponent=.83)
 # laser mic holes near bottom rear side
 for n in range(8):
  cx=x-.34+n*.027
  sphere("microphone perforation "+S+"-"+str(n),(cx,y-.580,.445),(.007,.009,.003),glass,shell,12,8)
 # crown control on upper edge; rotated toward viewer 
 cylinder("Digital crown knurled top control |"+S,(x+side*.30,y+.680,.22),.087,.105,edge,shell,48,rotation=(pi/2,0,0))
 for n in range(36):
  a=n*2*pi/36
  sphere("crown fine knurl %d"%n,(x+side*.30+.083*cos(a),y+.737,.22+.083*sin(a)),(.007,.020,.007),dark,shell,8,6)
 cylinder("Crown pressed hub |"+S,(x+side*.30,y+.749,.22),.056,.012,silver,shell,40,rotation=(pi/2,0,0))
 # small port at bottom, hidden unless inspecting
 bevel_cube("charging slot |"+S,(x-side*.27,y-.649,.11),(.125,.009,.018),glass,.008,6,shell)
 # acoustic driver / speaker stack (visible on exploded scroll)
 sculpted_earcup("acoustic chassis |"+S,(x,y,-.045),dark,driver,rx=.492,ry=.61,exponent=.82)
 ring_flat("torque bonded driver perimeter |"+S,(x,y,-.13),.39,.52,.025,edge,driver)
 cylinder("dynamic diaphragm |"+S,(x,y,-.195),.37,.023,glass,driver,70,rotation=(pi/2,0,0))
 cylinder("speaker annular magnet |"+S,(x,y,-.226),.31,.065,speaker,driver,72,rotation=(pi/2,0,0))
 for j in range(4):
  cylinder("concentric acoustic resonance ring "+str(j)+" |"+S,(x,y,-.259+j*.011),.31-j*.048,.012,copper if j%2==0 else edge,driver,64,rotation=(pi/2,0,0))
 # visible diffraction/mesh & detailed perforations
 for i in range(18):
  for j in range(12):
   dx=(i-8.5)*.040;dy=(j-5.5)*.066
   if (dx/.41)**2+(dy/.52)**2<.94:
    sphere("sound vent %02d-%02d |%s"%(i,j,S),(x+dx,y+dy,-.285),(.010,.010,.005),speaker,driver,8,6)
 # Replace primitive torus pad with physically tubular rounded-rectangle upholstery mesh
 ring_mesh("Memory foam ear cushion stitched textile |"+S,(x,y,-.27),.398,.508,.109,cushion,pad,seg=160,cross=18,exponent=.68,swelling=.88)
 ring_flat("fabric cushion inner seam |"+S,(x,y,-.35),.342,.449,.009,stitched,pad)
 ring_flat("cushion bonded adhesive rim |"+S,(x,y,-.205),.456,.562,.023,rubber,pad)
 # 68 stitches follows continuous curved boundary
 for i in range(68):
  a=i*2*pi/68
  ex=lambda v: math.copysign(abs(v)**.68,v)
  px=x+.402*ex(cos(a));py=y+.509*ex(sin(a))
  sphere("cushion stitch %03d |%s"%(i,S),(px,py,-.331),(.008,.007,.004),stitched,pad,8,6)
 # subtle cloth inner ring and diaphragm visibility inside ear
 bevel_cube("breathable inner pad backing |"+S,(x,y,-.398),(.65,.86,.013),dark,.09,10,pad)

# Join individual detail objects into a single multi-material mesh per
# animation part. This cuts draw calls massively without erasing the separate
# hinge, shell, diaphragm, cushion or headband animation groups.
for name, component in grp.items():
    objects=[o for o in component.children if o.type in {"MESH","CURVE","FONT"}]
    if not objects: continue
    bpy.ops.object.select_all(action="DESELECT")
    for o in objects:o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.object.convert(target="MESH")
    objects=[o for o in component.children if o.type=="MESH"]
    bpy.ops.object.select_all(action="DESELECT")
    for o in objects:o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.object.join()
    merged=bpy.context.object
    merged.name=name+"_SURFACE"
    print("MERGED PART",name,"from",len(objects),"meshes","to one mesh","materials",len(merged.data.materials))

# Compact hierarchy—main parts preserved for animation
# NOTE: Cup meshes use absolute coordinates under group at origin so can
# translate the group away from headset along local Z in Three.js.
for g in grp.values():g.empty_display_type="SPHERE";g.empty_display_size=.10

# export GLB, not a series of geometric constructions in React.
out=os.path.join(os.getcwd(),"public","models","aether-studio.glb")
os.makedirs(os.path.dirname(out),exist_ok=True)
bpy.ops.object.select_all(action="DESELECT")
for ob in bpy.data.objects:ob.select_set(True)
bpy.context.view_layer.objects.active=root
bpy.ops.export_scene.gltf(filepath=out,export_format="GLB",export_yup=True,export_apply=False,export_cameras=False,export_lights=False,
 export_normals=True,export_texcoords=True,export_materials="EXPORT",export_animations=False)
print("GLB GENERATED",out,os.path.getsize(out),"bytes","objects",len(bpy.data.objects))
# Source Blender asset is retained, but not included in production app.
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(os.getcwd(),"tools","aether-source.blend"))


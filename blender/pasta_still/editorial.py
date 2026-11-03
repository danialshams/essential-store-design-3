"""Baked rigatoni editorial food-CGI still. All visible food is custom 3D meshes.

This is a visual-quality experiment, not a claim of photogrammetry or final photo-real CGI.
Environment only is photo PBR from Poly Haven CC0. Render via Cycles.
"""
import bpy,math,random,sys,json
from pathlib import Path
from mathutils import Vector
random.seed(20261103)
args=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
def get(name,default):
    return args[args.index(name)+1] if name in args else default
assets=Path(get("--assets","assets/pasta")).resolve()
out=Path(get("--output","output/pasta-premium")).resolve()
out.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
scene.render.engine="CYCLES"
scene.cycles.device="CPU"
scene.cycles.samples=80
scene.cycles.use_denoising=True
bpy.context.view_layer.cycles.use_denoising=True
scene.render.resolution_x=1600
scene.render.resolution_y=1000
scene.render.resolution_percentage=100
scene.render.image_settings.file_format="PNG"
scene.render.image_settings.color_mode="RGBA"
scene.render.threads_mode="FIXED"
scene.render.threads=2
scene.view_settings.view_transform="AgX"
scene.view_settings.look="AgX - Medium High Contrast"
scene.view_settings.exposure=.12

# A physically lit, photographic environment. No composited food pictures.
world=bpy.data.worlds.new("CC0 warm restaurant full-dynamic-range light")
scene.world=world;world.use_nodes=True
nodes=world.node_tree.nodes;nodes.clear()
env=nodes.new("ShaderNodeTexEnvironment")
env.image=bpy.data.images.load(str(assets/"restaurant.hdr"))
bg=nodes.new("ShaderNodeBackground")
bg.inputs["Strength"].default_value=.38
out_world=nodes.new("ShaderNodeOutputWorld")
world.node_tree.links.new(env.outputs["Color"],bg.inputs["Color"])
world.node_tree.links.new(bg.outputs[0],out_world.inputs["Surface"])

def make_mat(name,color,rough=.36,subsurf=.0,metal=0):
    m=bpy.data.materials.new(name);m.use_nodes=True
    p=m.node_tree.nodes.get("Principled BSDF")
    p.inputs["Base Color"].default_value=(*color,1)
    p.inputs["Roughness"].default_value=rough
    p.inputs["Metallic"].default_value=metal
    p.inputs["Subsurface Weight"].default_value=subsurf
    return m,p
def noise_color(mat,p,colors,scale=10,rough=.3,bump=.08):
    n=mat.node_tree.nodes.new("ShaderNodeTexNoise")
    n.inputs["Scale"].default_value=scale
    n.inputs["Detail"].default_value=4
    n.inputs["Roughness"].default_value=.65
    ramp=mat.node_tree.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements.remove(ramp.color_ramp.elements[1])
    for i,(at,col) in enumerate(colors):
        e=ramp.color_ramp.elements[0] if i==0 else ramp.color_ramp.elements.new(at)
        e.position=at;e.color=(*col,1)
    mat.node_tree.links.new(n.outputs["Fac"],ramp.inputs[0])
    mat.node_tree.links.new(ramp.outputs["Color"],p.inputs["Base Color"])
    if bump:
        b=mat.node_tree.nodes.new("ShaderNodeBump")
        b.inputs["Strength"].default_value=bump
        b.inputs["Distance"].default_value=.018
        mat.node_tree.links.new(n.outputs["Fac"],b.inputs["Height"])
        mat.node_tree.links.new(b.outputs["Normal"],p.inputs["Normal"])
def objmesh(name,verts,faces,mat,smooth=True):
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata(verts,[],faces);mesh.update()
    obj=bpy.data.objects.new(name,mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    if smooth:
        for face in obj.data.polygons:face.use_smooth=True
    return obj
ceramic,p=make_mat("Graphite-black speckled ceramic",(0.065,.055,.048),.25,.01)
noise_color(ceramic,p,[(.15,(.018,.019,.020)),(.8,(.14,.116,.093))],120,.26,.18)
gold_rim,_=make_mat("Oxidized bronze ceramic rim",(.36,.23,.13),.32,0,.28)
pasta_mats=[]
for name,c in [
    ("Roasted tomato rigatoni",(.73,.19,.055)),
    ("Golden baked pasta",(.86,.41,.105)),
    ("Sauce-saturated tube",(.48,.085,.028)),
    ("Toasted pasta highlights",(.84,.55,.18))
]:
    m,p=make_mat(name,c,.38,.08)
    noise_color(m,p,[(.25,tuple(x*.56 for x in c)),(.55,c),(.84,tuple(min(.99,x*1.18) for x in c))],43,.35,.18)
    pasta_mats.append(m)
tomato,p=make_mat("Slow-cooked tomato sauce",(.47,.053,.017),.26,.08)
noise_color(tomato,p,[(.25,(.24,.025,.008)),(.53,(.54,.075,.017)),(.76,(.76,.19,.045))],32,.25,.22)
tomato_skin,p=make_mat("Glossy blistered cherry tomatoes",(.76,.07,.018),.21,.1)
noise_color(tomato_skin,p,[(.25,(.29,.014,.006)),(.56,(.76,.055,.016)),(.79,(.93,.19,.03))],20,.3,.12)
cheese,p=make_mat("Bubbling baked mozzarella and parmesan",(.89,.69,.35),.26,.14)
noise_color(cheese,p,[(.25,(.37,.13,.039)),(.44,(.78,.38,.10)),(.56,(.96,.73,.35)),(.73,(.99,.88,.57))],17,.26,.12)
melt,p=make_mat("Translucent glossy melted cheese",(.95,.79,.43),.20,.16)
noise_color(melt,p,[(.2,(.56,.22,.055)),(.55,(.96,.72,.33)),(.8,(.99,.88,.56))],26,.17,.08)
burnt,p=make_mat("Baked cheese golden spots",(.34,.095,.02),.42,.0)
basil,p=make_mat("Deep fresh basil",(.044,.20,.04),.30,.10)
noise_color(basil,p,[(.23,(.013,.077,.014)),(.55,(.07,.26,.04)),(.77,(.15,.37,.078))],65,.3,.09)
parmesan,_=make_mat("Shaved parmesan ivory",(.95,.84,.60),.52,.04)
pepper,_=make_mat("Black pepper and dried oregano",(.052,.047,.025),.9)
seeds,_=make_mat("Tomato flesh seeds",(.94,.70,.30),.5)

# 2K CC0 hardwood PBR surface (diffuse, roughness and normal).
wood,p=make_mat("Poly Haven wood table, scanned PBR",(.16,.095,.055),.55)
nt=wood.node_tree.nodes;links=wood.node_tree.links
coord=nt.new("ShaderNodeTexCoord");mapping=nt.new("ShaderNodeMapping")
mapping.inputs["Scale"].default_value=(1.3,1.3,1.3)
links.new(coord.outputs["UV"],mapping.inputs["Vector"])
for fn,socket,col in [("wood_diff.jpg","Base Color",True),("wood_rough.jpg","Roughness",False)]:
    t=nt.new("ShaderNodeTexImage")
    t.image=bpy.data.images.load(str(assets/fn));t.image.colorspace_settings.name="sRGB" if col else "Non-Color"
    links.new(mapping.outputs["Vector"],t.inputs["Vector"])
    links.new(t.outputs["Color"],p.inputs[socket])
t=nt.new("ShaderNodeTexImage");t.image=bpy.data.images.load(str(assets/"wood_nor.jpg"))
t.image.colorspace_settings.name="Non-Color";links.new(mapping.outputs["Vector"],t.inputs["Vector"])
normal=nt.new("ShaderNodeNormalMap");normal.inputs["Strength"].default_value=.42
links.new(t.outputs["Color"],normal.inputs["Color"]);links.new(normal.outputs["Normal"],p.inputs["Normal"])
bpy.ops.mesh.primitive_plane_add(size=25,location=(0,0,-.025))
table=bpy.context.object;table.name="Dark hardwood tabletop"
table.data.materials.append(wood)
# Table coordinate UVs span 0..1; scaled plane texture to hero composition.

# Trapezoidal rounded-rect ceramic roasting dish.
def ring(w,h,r,z,n=12):
    pts=[]
    for cx,cy,start in [(w/2-r,h/2-r,0),(-w/2+r,h/2-r,90),(-w/2+r,-h/2+r,180),(w/2-r,-h/2+r,270)]:
        for j in range(n+1):
            a=math.radians(start+j*90/n)
            pts.append((cx+r*math.cos(a),cy+r*math.sin(a),z))
    return pts
# Consistent path follows arc around clockwise/ccw perimeter, rounded corners.
profiles=[
    (3.42,1.97,.28,.14),
    (3.60,2.17,.28,.23),
    (3.84,2.40,.30,.50),
    (4.09,2.61,.31,.52),
    (4.16,2.66,.34,.45),
    (4.02,2.52,.32,.09),
    (3.67,2.24,.28,.055),
]
segments=len(ring(*profiles[0]))
verts=[]
for pr in profiles:verts+=ring(*pr)
faces=[]
for k in range(len(profiles)-1):
    for j in range(segments):
        a=k*segments+j;b=k*segments+(j+1)%segments
        faces.append((a,b,b+segments,a+segments))
pan=objmesh("Deep hand-thrown charcoal ceramic baking dish",verts,faces,ceramic)
bev=pan.modifiers.new("Soft glaze highlights","BEVEL");bev.width=.022;bev.segments=3
pan.modifiers.new("Weighted surface normals","WEIGHTED_NORMAL")
# Floor inside the baking dish.
bpy.ops.mesh.primitive_cube_add(size=1,location=(0,0,.12))
foodfloor=bpy.context.object;foodfloor.name="Food beneath top ingredients"
foodfloor.scale=(3.48,2.03,.045);foodfloor.data.materials.append(tomato)
# Brass rim line (thin curve)
rim=ring(4.115,2.635,.32,.515,16)
curve=bpy.data.curves.new("Rim piping","CURVE");curve.dimensions="3D";curve.bevel_depth=.007;curve.bevel_resolution=3
sp=curve.splines.new("POLY");sp.points.add(len(rim))
for i,c in enumerate(rim):sp.points[i].co=(*c,1)
sp.points[-1].co=(*rim[0],1)
line=bpy.data.objects.new("Hand-finished warm ceramic edge",curve)
bpy.context.collection.objects.link(line);line.data.materials.append(gold_rim)

# Noodle geometry: true hollow, ridged tubes with diagonal penne cuts.
# ~230 separate physically meaningful pasta objects for future exploded-animation parenting.
ingredients=bpy.data.collections.new("INDIVIDUALLY SEPARABLE 3D FOOD PARTS")
scene.collection.children.link(ingredients)
pasta_objects=[]
def penne(i,pos,mat):
    rng=random.Random(1020+i)
    nrad=20; axial=11
    length=rng.uniform(.22,.40);radius=rng.uniform(.055,.089)
    radius_in=radius*.68
    verts=[];faces=[]
    for inner in (False,True):
        for j in range(axial):
            t=j/(axial-1);x=(t-.5)*length
            for k in range(nrad):
                a=k*math.tau/nrad
                ridge=1+.040*math.cos(k*math.tau*12/nrad+t*math.pi*.25)
                r=(radius_in if inner else radius)*ridge
                # shallow diagonal cutting of penne rim at both ends
                xx=x + (.021*math.sin(a) if j==0 or j==axial-1 else 0)
                verts.append((xx,r*math.cos(a),r*math.sin(a)))
    N=nrad*axial
    for inner in range(2):
        base=inner*N
        for j in range(axial-1):
            for k in range(nrad):
                a=base+j*nrad+k;b=base+j*nrad+(k+1)%nrad
                faces.append((a,b,b+nrad,a+nrad) if not inner else (a+nrad,b+nrad,b,a))
    for k in range(nrad):
        nk=(k+1)%nrad
        faces.append((k,N+k,N+nk,nk))
        a=(axial-1)*nrad
        faces.append((a+k,a+nk,N+a+nk,N+a+k))
    ob=objmesh("Rigatoni %03d"%i,verts,faces,mat)
    ob.location=pos
    ob.rotation_euler=(rng.uniform(-1.2,1.2),rng.uniform(-.7,.7),rng.uniform(-math.pi,math.pi))
    ingredients.objects.link(ob)
    for c in list(ob.users_collection):
        if c!=ingredients:c.objects.unlink(ob)
    return ob
# Elevated food volume with nonlinear fill: avoid obviously aligned rows or equally-spaced patterns.
for i in range(265):
    x=random.uniform(-1.73,1.73);y=random.uniform(-.92,.92)
    # Heavier mound near center, toasted noodles show through uneven cheese.
    r2=(x/1.84)**2+(y/1.10)**2
    if r2>1:continue
    z=.22+random.random()*.25+(1-r2)*.16
    mat=random.choices(pasta_mats,[.49,.26,.19,.06])[0]
    pasta_objects.append(penne(i,(x,y,z),mat))
print("ACTUAL PASTA PARTS:",len(pasta_objects),flush=True)

# High-frequency irregular sauce puddles with specular ripples.
def puddle(i,x,y,z,sx,sy,mat):
    n=28;verts=[];faces=[];offs=random.uniform(0,math.tau)
    verts.append((0,0,.029))
    for j in range(n):
        a=math.tau*j/n
        irregular=1+.13*math.sin(5*a+offs)+.07*math.sin(9*a+offs*2)
        verts.append((sx*math.cos(a)*irregular,sy*math.sin(a)*irregular,random.uniform(.002,.024)))
    for j in range(n):faces.append((0,1+j,1+(j+1)%n))
    o=objmesh("Slow-simmered sauce bead %02d"%i,verts,faces,mat)
    o.location=(x,y,z)
    o.rotation_euler[2]=random.uniform(0,math.tau)
    return o
for i in range(30):
    x=random.uniform(-1.54,1.54);y=random.uniform(-.86,.86)
    if (x/1.67)**2+(y/.93)**2>1:continue
    puddle(i,x,y,random.uniform(.42,.64),random.uniform(.13,.25),random.uniform(.08,.15),tomato)

# 3D blistered cheese: irregular broad pools with high-frequency geometry, speckled golden shaders.
for i in range(19):
    x=random.uniform(-1.4,1.4);y=random.uniform(-.83,.83)
    if (x/1.53)**2+(y/.88)**2>1:continue
    rad=random.uniform(.23,.49);n=52
    verts=[(0,0,random.uniform(.03,.055))]
    oset=random.random()*10
    for j in range(n):
        a=math.tau*j/n
        radius=rad*(1+.13*math.sin(5*a+oset)+.10*math.cos(11*a+oset))
        verts.append((radius*math.cos(a),radius*.65*math.sin(a),random.uniform(-.012,.008)))
    faces=[(0,1+j,1+(j+1)%n) for j in range(n)]
    o=objmesh("Uneven real melted cheese patch %02d"%i,verts,faces,cheese if i%3 else melt)
    o.location=(x,y,random.uniform(.63,.75))
    o.rotation_euler[2]=random.uniform(0,math.tau)
    if i%4==0:
        for k in range(7):
            a=random.random()*math.tau
            puddle(100+i*10+k,x+math.cos(a)*rad*.7,y+math.sin(a)*rad*.36,
                   o.location.z+.016,.035,.025,burnt)

# Tomato halves and visible seeded flesh instead of perfect plastic spheres.
for i in range(9):
    x=random.uniform(-1.38,1.38);y=random.uniform(-.74,.74)
    z=random.uniform(.68,.84)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=16,radius=random.uniform(.105,.16),location=(x,y,z))
    ob=bpy.context.object;ob.name="Blistered cherry tomato %02d"%i
    ob.scale=(1.0,.80,.65);ob.data.materials.append(tomato_skin)
    for face in ob.data.polygons:face.use_smooth=True
    # Olive-golden seed droplets scattered on the tomato cut surface
    for k in range(4):
        a=math.tau*k/4
        bpy.ops.mesh.primitive_uv_sphere_add(segments=10,ring_count=6,radius=.010,
            location=(x+.045*math.cos(a),y-.015+.045*math.sin(a),z+.083))
        seed=bpy.context.object;seed.data.materials.append(seeds)

# Crinkled, curved basil leaves: ribbed geometry, thick stems and irregular silhouettes.
for i in range(7):
    x=random.uniform(-1.17,1.17);y=random.uniform(-.63,.63);z=random.uniform(.79,.92)
    n=20;verts=[];faces=[]
    a=random.uniform(0,math.tau)
    L=random.uniform(.20,.37);W=L*random.uniform(.34,.49)
    for j in range(n+1):
        t=j/n
        side=W*math.sin(math.pi*t)**.9
        cx=(t-.5)*L
        ridge=.027*math.sin(math.pi*t)
        for sign in (-1,0,1):
            dx=cx*math.cos(a)-sign*side*math.sin(a)
            dy=cx*math.sin(a)+sign*side*math.cos(a)
            verts.append((dx,dy,ridge + random.uniform(-.006,.006)+(0.015 if sign==0 else 0)))
    for j in range(n):
        for k in range(2):
            q=3*j+k
            faces.append((q,q+1,q+4,q+3))
    leaf=objmesh("Detailed glossy basil leaf %02d"%i,verts,faces,basil)
    leaf.location=(x,y,z)
    sol=leaf.modifiers.new("Leaf skin","SOLIDIFY");sol.thickness=.005
    stem=[(x,y,z),(x+.04*math.cos(a),y+.04*math.sin(a),z+.05)]
    # vein is subtle curve, no bright lines
    cv=bpy.data.curves.new("Basil midrib","CURVE");cv.dimensions="3D"
    cv.bevel_depth=.003;cv.bevel_resolution=2
    spl=cv.splines.new("POLY");spl.points.add(len(stem)-1)
    for ii,p0 in enumerate(stem):spl.points[ii].co=(*p0,1)
    ob=bpy.data.objects.new("Natural basil stem",cv);bpy.context.collection.objects.link(ob)
    cv.materials.append(basil)

# Parmegiano fragments, pepper and herb specks to create food microdetail.
for i in range(105):
    x=random.uniform(-1.63,1.63);y=random.uniform(-.85,.85)
    if (x/1.72)**2+(y/.92)**2>1:continue
    z=random.uniform(.71,.84)
    bpy.ops.mesh.primitive_cube_add(size=1,location=(x,y,z))
    o=bpy.context.object
    o.name="Parmigiano micro-shaving %03d"%i
    o.scale=(random.uniform(.01,.055),random.uniform(.003,.013),.003)
    o.rotation_euler=(random.uniform(-.4,.4),random.uniform(-.4,.4),random.uniform(0,math.tau))
    o.data.materials.append(parmesan if i%4 else burnt)
for i in range(190):
    x=random.uniform(-1.62,1.62);y=random.uniform(-.83,.83)
    if (x/1.75)**2+(y/.93)**2>1:continue
    z=random.uniform(.71,.82)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=random.uniform(.002,.006),location=(x,y,z))
    bpy.context.object.data.materials.append(pepper)

# Soft cinematic photography setup: warm large key, cool soft fill, rim highlights.
def aim(obj,target):
    obj.rotation_euler=(Vector(target)-obj.location).to_track_quat("-Z","Y").to_euler()
def light(name,loc,power,size,rgb):
    bpy.ops.object.light_add(type="AREA",location=loc)
    o=bpy.context.object;o.name=name;o.data.energy=power;o.data.shape="DISK";o.data.size=size
    o.data.color=rgb;aim(o,(0,0,.5))
light("Large warm softbox",(-3.5,-2.6,4.8),900,4.5,(1.0,.81,.62))
light("Low contrast photographic fill",(3.7,-1.5,2.8),390,3.7,(.70,.82,1))
light("Copper kitchen rim",(1.2,2.6,4.3),1400,3.2,(1.0,.60,.30))
bpy.ops.object.camera_add(location=(3.45,-5.65,3.15))
camera=bpy.context.object;scene.camera=camera;camera.name="Macro food hero - 65mm"
aim(camera,(0,0,.53));camera.data.lens=65
camera.data.dof.use_dof=True
camera.data.dof.focus_distance=(camera.location-Vector((0,0,.55))).length
camera.data.dof.aperture_fstop=7.2

scene.render.filepath=str(out/"baked-pasta-cycles.png")
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=str(out/"baked-pasta-editorial.blend"))
(out/"render-info.json").write_text(json.dumps({
 "method":"Actual geometry, Cycles 4.5 CPU","single_frame":True,"samples":80,
 "resolution":[1600,1000],"modeled_pasta_pieces":len(pasta_objects),
 "wood_pbr":"Poly Haven CC0 Wood Table","lighting":"Poly Haven warm restaurant HDRI",
 "status":"Experimental quality test, not certified photo-real"},indent=2))
bpy.ops.render.render(write_still=True)
print("EDITORIAL FOOD CGI STILL FINISHED",flush=True)

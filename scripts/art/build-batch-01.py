"""Blender 4.3: editable first-pass character maquettes from user concept sheet.
Run blender -b -t 8 --python scripts/art/build-batch-01.py -- OUTPUT [pyroo|croobit]
Front is -Y; Z up. No rig or game integration in this art approval pass.
"""
import bpy, math, sys, json
from pathlib import Path
from mathutils import Vector
args=sys.argv[sys.argv.index('--')+1:]
out=Path(args[0]).resolve();out.mkdir(parents=True,exist_ok=True)
species=args[1] if len(args)>1 else 'pyroo'
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
collection=bpy.data.collections.new(species.title()+' | editable parts');scene.collection.children.link(collection)
def mat(name,h,rough=.45,sss=.025):
    rgb=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    rgb=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in rgb]
    m=bpy.data.materials.new(name);m.diffuse_color=(*rgb,1);m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*rgb,1);p.inputs['Roughness'].default_value=rough;p.inputs['Subsurface Weight'].default_value=sss
    return m
cream=mat('Cream • FFF0E0','FFF0E0');coral=mat('Coral • FF8B6B','FF8B6B');peach=mat('Peach • FFBF7A','FFBF7A');red=mat('Ember coral','F64E3D');gold=mat('Warm flame','FFD36D');light=mat('Flame core','FFF0B1');dark=mat('Mouth velvet','551F34');tongue=mat('Tongue rose','F98593');black=mat('Pupil ink','211525',.22,0);white=mat('Eye porcelain','FFFAF5',.27);amber=mat('Amber iris','BA4A16',.25);mint=mat('Mint • B7F0D6','B7F0D6');teal=mat('Teal • 3EB6D4','3EB6D4');ice=mat('Ivory belly','EAF8FF');blue=mat('Ocean iris','284687',.24);blush=mat('Peach cheek','FFC9BD')
def finish(o,name,m):
    o.name=name
    for c in list(o.users_collection):c.objects.unlink(o)
    collection.objects.link(o);o.data.materials.append(m)
    if o.type=='MESH':
        for p in o.data.polygons:p.use_smooth=True
    return o
def ell(name,loc,scale,m,rot=None):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=40,ring_count=28,location=loc)
    o=bpy.context.object;o.scale=scale
    if rot:o.rotation_euler=rot
    return finish(o,name,m)
def petal(name,points,radii,m,depth=.55):
    # Soft tapered sculpted lobe, cross-sections around a curved centerline.
    vs=[];fs=[];n=20
    for k,((x,y,z),r) in enumerate(zip(points,radii)):
        tangent=(Vector(points[min(k+1,len(points)-1)])-Vector(points[max(k-1,0)])).normalized()
        axis=Vector((1,0,0))
        if abs(tangent.dot(axis))>.95: axis=Vector((0,1,0))
        u=(axis-tangent*axis.dot(tangent)).normalized();v=tangent.cross(u).normalized()
        for j in range(n):
            a=j*math.tau/n
            if 'tail' in name.lower() and name in ('Curled tail','Long curved swimming tail'):
                vs.append(Vector((x,y,z))+u*(r*math.cos(a))+v*(r*depth*math.sin(a)))
            else:vs.append((x+r*math.cos(a),y+r*depth*math.sin(a),z))
    for k in range(len(points)-1):
        for j in range(n):
            a=k*n+j;b=k*n+(j+1)%n;fs.append((a,b,b+n,a+n))
    fs += [tuple(range(n-1,-1,-1)),tuple((len(points)-1)*n+j for j in range(n))]
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(vs,[],fs);mesh.update();o=bpy.data.objects.new(name,mesh);collection.objects.link(o);o.data.materials.append(m)
    for p in mesh.polygons:p.use_smooth=True
    mod=o.modifiers.new('Silky rounded surface','SUBSURF');mod.levels=2;mod.render_levels=2
    return o
def flame(name,base,size,m,lean=0,depth=.55):
    x,y,z=base;s=size
    return petal(name,[(x,y,z),(x,y,z+s*.18),(x+lean*.2,y,z+s*.48),(x+lean*.5,y,z+s*.76),(x+lean,y,z+s)], [.015,s*.29,s*.25,s*.12,.008],m,depth)
def eyes(z,y,x,iris):
    for s in (-1,1):
        ell('Eye socket', (s*x,y+.03,z),(.285,.115,.36),cream if species=='pyroo' else mint)
        ell('Eye white',(s*x,y-.025,z),(.243,.10,.307),white)
        ell('Iris',(s*x,y-.11,z-.008),(.185,.055,.245),iris)
        ell('Pupil',(s*x,y-.156,z+.015),(.115,.026,.179),black)
        ell('Large eye glint',(s*x-.047,y-.183,z+.115),(.058,.018,.077),white)
        ell('Small eye glint',(s*x+.065,y-.18,z-.08),(.025,.012,.032),white)
def toes(x,y,z,m):
    for d in (-.11,0,.11):ell('Rounded toes',(x+d,y,z),(.085,.12,.085),m)
if species=='pyroo':
    ell('Pear torso',(0,.28,.72),(.57,.74,.58),coral)
    ell('Cream chest',(0,-.32,.69),(.39,.14,.41),cream)
    for s in (-1,1):
        ell('Hind haunch',(s*.46,.55,.40),(.28,.34,.33),coral)
        ell('Hind paw',(s*.48,.42,.18),(.24,.30,.16),peach);toes(s*.48,.17,.16,peach)
        ell('Foreleg',(s*.33,-.36,.42),(.19,.21,.36),coral, (0,s*.08,0))
        ell('Front paw',(s*.34,-.48,.17),(.20,.26,.15),peach);toes(s*.34,-.68,.15,peach)
    ell('Oversized mochi head',(0,-.38,1.48),(.83,.64,.72),coral)
    # Cream lower face is composed of overlapping soft cheeks, keeping the fox muzzle broad.
    ell('Cream jaw',(0,-.75,1.19),(.62,.29,.32),cream)
    for s in (-1,1):
        ell('Muzzle cheek',(s*.25,-.90,1.34),(.34,.20,.24),cream)
        ell('Cheek blush',(s*.54,-.89,1.34),(.13,.035,.073),blush)
        for i in range(3):
            flame('Cheek ember tuft',(s*(.62+i*.015),-.28,1.16+i*.17),.35,red,lean=s*.28)
        # Large flame-shaped ears with inset warm lobes.
        flame('Outer ear',(s*.60,-.29,1.72),1.12,red,lean=s*.35,depth=.56)
        flame('Inner peach ear',(s*.63,-.48,1.86),.81,peach,lean=s*.28,depth=.28)
        flame('Golden ear core',(s*.64,-.54,1.88),.65,gold,lean=s*.21,depth=.18)
        flame('Cream ear spark',(s*.64,-.575,1.90),.42,light,lean=s*.10,depth=.14)
        flame('Ear side lick',(s*.86,-.30,1.78),.54,red,lean=s*.25)
    eyes(1.57,-.94,.38,amber)
    ell('Happy open mouth',(0,-1.015,1.13),(.21,.055,.18),dark)
    ell('Tongue',(0,-1.066,1.065),(.13,.018,.065),tongue)
    ell('Nose',(0,-1.117,1.38),(.105,.055,.055),dark)
    flame('Forehead tuft',(0,-.36,2.03),.46,red,lean=.055)
    flame('Forehead small tuft',(-.17,-.29,2.02),.28,red,lean=-.04)
    # Tail curls up behind the body, with layered flame lobes visible from every angle.
    petal('Curled tail',[(0,.76,.58),(-.18,1.00,.60),(-.40,1.23,.73),(-.55,1.39,.94),(-.56,1.47,1.20),(-.42,1.50,1.41)],[.18,.27,.34,.34,.23,.025],red,.95)
    for i,(x,y,z,sz,lean) in enumerate([(-.53,1.39,.98,.95,.13),(-.85,1.33,.83,.72,-.18),(-.15,1.34,.84,.74,.20)]):
        flame('Tail gold lobe '+str(i),(x,y,z),sz,gold,lean,depth=.75)
        flame('Tail light heart '+str(i),(x,y-.13,z+.04),sz*.64,light,lean*.6,depth=.42)
    target=(0,.15,1.35);ortho=3.65
else:
    ell('Rounded crocodile body',(0,.36,.66),(.64,.84,.53),mint)
    ell('Pale belly',(0,-.29,.56),(.43,.22,.43),ice)
    for i in range(3):ell('Belly plate',(0,-.48,.40+i*.17),(.34-i*.012,.035,.09),cream)
    for s in (-1,1):
        for y in (-.43,.69):
            ell('Short sturdy leg',(s*.51,y,.34),(.24,.28,.29),mint)
            ell('Webbed foot',(s*.55,y-.13,.14),(.28,.29,.13),teal)
            toes(s*.55,y-.36,.13,teal)
    ell('Baby crocodile head',(0,-.44,1.28),(.81,.61,.68),mint)
    ell('Lower ivory jaw',(0,-.91,.95),(.64,.39,.23),ice)
    ell('Open happy mouth',(0,-1.112,1.10),(.48,.12,.24),dark)
    ell('Tongue',(0,-1.226,1.00),(.23,.025,.09),tongue)
    ell('Broad short snout',(0,-.97,1.34),(.64,.37,.24),mint)
    for s in (-1,1):
        ell('Cheek',(s*.55,-.77,1.02),(.24,.20,.22),ice)
        ell('Rosy cheek',(s*.60,-.94,1.06),(.14,.028,.075),blush)
        ell('Nostril',(s*.26,-1.293,1.45),(.045,.022,.033),teal)
        petal('Milk fang',[(s*.30,-1.20,1.25),(s*.30,-1.205,1.20),(s*.29,-1.21,1.10)],[.058,.052,.004],cream,.65)
    eyes(1.56,-.93,.45,blue)
    petal('Long curved swimming tail',[(0,.93,.59),(.14,1.24,.56),(.42,1.54,.57),(.72,1.77,.71),(.96,1.88,.98),(1.04,1.87,1.20)],[.37,.33,.26,.20,.12,.005],mint,.9)
    for i,(y,z,sz) in enumerate([(-.38,1.89,.30),(.05,1.69,.31),(.42,1.17,.31),(.78,1.07,.29),(1.10,.93,.25)]):
        flame('Soft dorsal fin '+str(i),(0,y,z),sz,teal,depth=.95)
    for x,y,z,sz in [(.35,1.48,.78,.22),(.66,1.74,.90,.18),(.91,1.87,1.10,.14)]:flame('Tail fin',(x,y,z),sz,teal,depth=.85)
    for s in (-1,1):
        for x,y,z,r in [(.58,.50,.94,.10),(.61,.78,.77,.09),(.54,.20,1.02,.08),(.76,-.25,1.43,.075),(.68,-.06,1.23,.08)]:
            ell('Teal freckles',(s*x,y,z),(r*.35,r,r*.9),teal)
    target=(0,.25,1.05);ortho=3.5
# Export only character geometry, with applied transforms and no stage.
bpy.ops.object.select_all(action='DESELECT')
for o in collection.objects:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(out/(species+'.glb')),export_format='GLB',use_selection=True,export_animations=False)
# Studio stage kept in separate collection for easy editing.
stage=bpy.data.collections.new('STUDIO • hide for game export');scene.collection.children.link(stage)
def stage_obj(o):
    for c in list(o.users_collection):c.objects.unlink(o)
    stage.objects.link(o)
bpy.ops.mesh.primitive_plane_add(size=200);o=bpy.context.object;o.name='Warm seamless floor';o.data.materials.append(mat('Studio cream','FFF3E5',.8,0));stage_obj(o)
world=bpy.data.worlds.new('Soft cream studio');world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.65,.72,.85,1);world.node_tree.nodes['Background'].inputs[1].default_value=.45;scene.world=world
for name,loc,power,size in [('Key softbox',(-3,-4,6),480,4),('Fill softbox',(4,-2,3.5),300,3),('Warm rim',(1,4,5),550,3)]:
    bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.name=name;o.data.energy=power;o.data.shape='DISK';o.data.size=size;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();stage_obj(o)
bpy.ops.object.camera_add();cam=bpy.context.object;cam.name='Character review camera';cam.data.type='ORTHO';cam.data.ortho_scale=ortho;scene.camera=cam;stage_obj(cam)
scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=48;scene.cycles.use_denoising=False
scene.render.resolution_x=760;scene.render.resolution_y=760;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.view_settings.view_transform='Standard';scene.view_settings.look='None';scene.view_settings.exposure=-.6
scene.render.film_transparent=False
views={'three-quarter':(4,-7,3.4),'front':(0,-8,2.6),'side':(8,0,2.6),'back':(0,8,2.8)}
for view,pos in views.items():
    cam.location=Vector(pos)+Vector((0,0,.1));cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler()
    scene.render.filepath=str(out/(species+'-'+view+'.png'))
    if view=='three-quarter':bpy.ops.wm.save_as_mainfile(filepath=str(out/(species+'.blend')))
    bpy.ops.render.render(write_still=True)
print('COMPLETE',species)

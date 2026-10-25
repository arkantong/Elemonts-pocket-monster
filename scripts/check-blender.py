"""Run: blender --background --factory-startup --python scripts/check-blender.py -- /tmp/elemonts-blender-check
Creates test assets only, not production game content.
"""
from pathlib import Path
import math
import sys
import bpy

out = Path(sys.argv[sys.argv.index('--') + 1])
out.mkdir(parents=True, exist_ok=True)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = 8
scene.cycles.use_denoising = False
scene.render.resolution_x = 256
scene.render.resolution_y = 256
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.filepath = str(out / 'render.png')
scene.frame_start = 1
scene.frame_end = 24
obj = bpy.data.objects['Cube']
obj.name = 'ElemontsToolCheck'
material = bpy.data.materials.new('Forest')
material.diffuse_color = (0.12, 0.3, 0.16, 1)
obj.data.materials.append(material)
obj.rotation_euler.z = 0
obj.keyframe_insert(data_path='rotation_euler', frame=1)
obj.rotation_euler.z = math.radians(60)
obj.keyframe_insert(data_path='rotation_euler', frame=24)
scene.frame_set(1)
bpy.ops.wm.save_as_mainfile(filepath=str(out / 'tool-check.blend'))
bpy.ops.export_scene.gltf(filepath=str(out / 'tool-check.glb'), export_format='GLB', export_animations=True)
bpy.ops.render.render(write_still=True)
assert all((out / name).stat().st_size > 0 for name in ['tool-check.blend', 'tool-check.glb', 'render.png'])
print('PASS: .blend save, animated GLB export, CPU render')

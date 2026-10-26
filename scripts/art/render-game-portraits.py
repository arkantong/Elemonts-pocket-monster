"""Render approved Blender character portraits for the game UI."""
import bpy,sys
from pathlib import Path
repo=Path(__file__).resolve().parents[2]
for name in ['pyroo','croobit']:
 bpy.ops.wm.open_mainfile(filepath=str(repo/f'design/characters/batch-01-v1/{name}.blend'))
 s=bpy.context.scene;s.render.film_transparent=True
 bpy.data.objects['Warm seamless floor'].hide_render=True
 s.render.resolution_x=384;s.render.resolution_y=384;s.cycles.samples=24
 s.render.image_settings.color_mode='RGBA';s.render.filepath=str(repo/f'public/art/monsters/{name}.png')
 bpy.ops.render.render(write_still=True)

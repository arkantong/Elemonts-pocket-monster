# Elemonts • character study 01

First Blender model review based on the user-provided Pyroo / Croobit concept sheet. These are real editable 3D meshes rendered in Blender Cycles, not generated images presented as models.

## Deliverables

- `pyroo.blend`, `croobit.blend`: separate editable parts, named materials, studio camera and lights.
- `pyroo.glb`, `croobit.glb`: character-only exports for 3D preview.
- Four PNG views per character: front, side, back, three-quarter.
- Review sheets combine those actual renders for comparison.

Open a `.blend` file in Blender 4.3 or newer. Numpad 0 shows the saved three-quarter camera. The character and studio occupy separate collections. Model front faces -Y, Z is up.

## Review scope

Approve silhouette, head/body proportions, facial expression, color, ears/tail (Pyroo), and snout/feet/dorsal fins (Croobit). This is an initial rounded, toy-like maquette. It does not yet match every sculpted transition and facial expression in the concept sheet. Individual overlapping parts remain editable for iteration.

No rig, skin weights, facial shape keys, UV texture painting, LODs, or battle animation in this version. These are visual review assets, not a production-ready character replacement. No game files or APK were changed.

Rebuild from repository root:

```sh
blender -b -t 8 --python scripts/art/build-batch-01.py -- design/characters/batch-01-v1 pyroo
blender -b -t 8 --python scripts/art/build-batch-01.py -- design/characters/batch-01-v1 croobit
```

## Catatan revisi yang bisa diisi

- Pyroo: sudah cocok / perlu revisi.
- Proporsi kepala dan badan Pyroo:
- Wajah dan mata Pyroo:
- Bentuk telinga, bara, dan ekor Pyroo:
- Croobit: sudah cocok / perlu revisi.
- Proporsi kepala dan badan Croobit:
- Moncong, senyum, dan gigi Croobit:
- Bentuk kaki, sirip, dan ekor Croobit:
- Warna yang perlu diubah:
- Bagian yang paling penting untuk diperbaiki dulu:

Contoh: "Pyroo: kepala lebih bulat, telinga lebih pendek, mata jangan terlalu menonjol; warna sudah cocok."

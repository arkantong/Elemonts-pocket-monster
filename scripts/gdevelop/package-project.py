"""Package the portable editor scene and its referenced images, not the full game."""
from pathlib import Path, PurePosixPath
from zipfile import ZipFile, ZIP_DEFLATED
import json, posixpath
root = Path(__file__).resolve().parents[2]
version = json.loads((root/'package.json').read_text())['version']
project = root/'design/gdevelop/elemonts-battle.json'
data = json.loads(project.read_text())
files = {project, project.parent/'README.md', project.parent/'characters-atlas.png', root/'src/game/conceptFrames.json', root/'src/game/visuals.ts', root/'scripts/gdevelop/battle-events.js',root/'scripts/gdevelop/extract-sprites.sh',root/'scripts/gdevelop/measure-frames.py'}
files.update(project.parent.glob('characters-atlas-batch-*.png'))
for resource in data['resources']['resources']:
    files.add((project.parent/resource['file']).resolve())
files.update((root/'public/licenses').glob('*.txt'))
out = root/f'downloads/Elemonts-GDevelop-2D-v{version}.zip'
with ZipFile(out,'w',ZIP_DEFLATED,compresslevel=9) as archive:
    for path in sorted(files):
        archive.write(path,path.relative_to(root).as_posix())
    archive.writestr('START-HERE.txt',f'Elemonts 2D battle scene v{version}\nExtract all folders. In GDevelop 5.6.285 or later, open design/gdevelop/elemonts-battle.json.\nThis is the visual editor scene, not a standalone copy of the full Elemonts game.\nFull source: https://github.com/arkantong/Elemonts-pocket-monster\nSee design/gdevelop/README.md for integration and limitations.\n')
with ZipFile(out) as archive:
    names=set(archive.namelist())
    for resource in data['resources']['resources']:
        name=posixpath.normpath('design/gdevelop/'+resource['file'])
        assert name in names, name
    assert archive.testzip() is None
print(f'{out.name}: {out.stat().st_size:,} bytes; {len(names)} files; all {len(data["resources"]["resources"])} resources resolve')

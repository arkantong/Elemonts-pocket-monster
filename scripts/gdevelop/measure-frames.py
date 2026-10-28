"""Measure opaque character bounds for foot anchoring; never modify image pixels."""
from pathlib import Path
from collections import deque
from PIL import Image
import json
root = Path(__file__).resolve().parents[2]
frames = {}
destination = root/'src/game/conceptFrames.json'
previous = json.loads(destination.read_text()) if destination.exists() else {}
for file in sorted((root/'public/art/monsters-2d').glob('*.png')):
    with Image.open(file) as image:
        width, height = image.size
        alpha = image.getchannel('A').tobytes()
    visited = bytearray(width*height)
    largest = []
    for index, value in enumerate(alpha):
        if value < 100 or visited[index]:
            continue
        visited[index] = 1
        queue = deque([index])
        component = []
        while queue:
            position = queue.popleft()
            component.append(position)
            x, y = position % width, position // width
            for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
                xx, yy = x+dx, y+dy
                other = yy*width+xx
                if 0 <= xx < width and 0 <= yy < height and not visited[other] and alpha[other] >= 100:
                    visited[other] = 1
                    queue.append(other)
        if len(component) > len(largest):
            largest = component
    if not largest:
        raise ValueError(f'No character found in {file.name}')
    xs, ys = [p % width for p in largest], [p // width for p in largest]
    left, top = max(0,min(xs)-1), max(0,min(ys)-1)
    right, bottom = min(width,max(xs)+2), min(height,max(ys)+2)
    frames[file.stem] = [width,height,left,top,right-left,bottom-top]
ordered = {key: frames[key] for key in previous if key in frames}
ordered.update({key: value for key,value in frames.items() if key not in ordered})
destination.write_text(json.dumps(ordered,indent=2)+'\n')
print(f'Measured {len(frames)} poses; image pixels unchanged')

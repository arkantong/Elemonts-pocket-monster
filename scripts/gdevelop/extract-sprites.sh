#!/usr/bin/env bash
# Mechanical atlas slicing; the source artwork is preserved without repainting.
set -euo pipefail
atlas=design/gdevelop/characters-atlas.png
names=(home back front hit)
left=(0 460 915 1350)
width=(460 455 435 424)
for i in 0 1 2 3; do
  convert "$atlas" -crop "${width[$i]}x470+${left[$i]}+0" +repage "public/art/monsters-2d/pyroo-${names[$i]}.png"
  convert "$atlas" -crop "${width[$i]}x417+${left[$i]}+470" +repage "public/art/monsters-2d/croobit-${names[$i]}.png"
done

# Batch 02 uses its own transparent gutters; batch 01 stays unchanged.
atlas=design/gdevelop/characters-atlas-batch-02.png
left=(0 490 880 1330)
width=(490 390 450 444)
for i in 0 1 2 3; do
  convert "$atlas" -crop "${width[$i]}x470+${left[$i]}+0" +repage "public/art/monsters-2d/voltavi-${names[$i]}.png"
  convert "$atlas" -crop "${width[$i]}x417+${left[$i]}+470" +repage "public/art/monsters-2d/mippo-${names[$i]}.png"
done

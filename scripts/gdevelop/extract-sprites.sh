#!/usr/bin/env bash
# Mechanical atlas slicing; the source artwork is preserved without repainting.
set -euo pipefail
batch="${1:-all}"
case "$batch" in all|01|02|03|04|05) ;; *) echo "Usage: $0 [all|01|02|03|04|05]" >&2; exit 2;; esac
names=(home back front hit)
if [[ "$batch" == all || "$batch" == 01 ]]; then
atlas=design/gdevelop/characters-atlas.png
left=(0 460 915 1350)
width=(460 455 435 424)
for i in 0 1 2 3; do
  convert "$atlas" -crop "${width[$i]}x470+${left[$i]}+0" +repage "public/art/monsters-2d/pyroo-${names[$i]}.png"
  convert "$atlas" -crop "${width[$i]}x417+${left[$i]}+470" +repage "public/art/monsters-2d/croobit-${names[$i]}.png"
done
fi

# Batch 02 uses its own transparent gutters; batch 01 stays unchanged.
if [[ "$batch" == all || "$batch" == 02 ]]; then
atlas=design/gdevelop/characters-atlas-batch-02.png
left=(0 490 880 1330)
width=(490 390 450 444)
for i in 0 1 2 3; do
  convert "$atlas" -crop "${width[$i]}x470+${left[$i]}+0" +repage "public/art/monsters-2d/voltavi-${names[$i]}.png"
  convert "$atlas" -crop "${width[$i]}x417+${left[$i]}+470" +repage "public/art/monsters-2d/mippo-${names[$i]}.png"
done
fi

if [[ "$batch" == all || "$batch" == 03 ]]; then
atlas=design/gdevelop/characters-atlas-batch-03.png
left=(0 490 990 1490)
width=(490 500 500 493)
for i in 0 1 2 3; do
  convert "$atlas" -crop "${width[$i]}x392+${left[$i]}+0" +repage "public/art/monsters-2d/mallow-${names[$i]}.png"
  convert "$atlas" -crop "${width[$i]}x401+${left[$i]}+392" +repage "public/art/monsters-2d/swifttail-${names[$i]}.png"
done
fi

if [[ "$batch" == all || "$batch" == 04 ]]; then
atlas=design/gdevelop/characters-atlas-batch-04.png
left=(0 445 880 1330)
width=(445 435 450 444)
for i in 0 1 2 3; do
  convert "$atlas" -crop "${width[$i]}x445+${left[$i]}+0" +repage "public/art/monsters-2d/aurapaw-${names[$i]}.png"
  convert "$atlas" -crop "${width[$i]}x442+${left[$i]}+445" +repage "public/art/monsters-2d/noxarion-${names[$i]}.png"
done
fi

if [[ "$batch" == all || "$batch" == 05 ]]; then
atlas=design/gdevelop/characters-atlas-batch-05.png
left=(0 445 880 1325)
width=(445 435 445 449)
for i in 0 1 2 3; do
  convert "$atlas" -crop "${width[$i]}x435+${left[$i]}+0" +repage "public/art/monsters-2d/georoll-${names[$i]}.png"
  convert "$atlas" -crop "${width[$i]}x452+${left[$i]}+435" +repage "public/art/monsters-2d/burrowox-${names[$i]}.png"
done
fi

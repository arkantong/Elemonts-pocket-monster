#!/usr/bin/env bash
# Mechanical atlas slicing; the source artwork is preserved without repainting.
set -euo pipefail
batch="${1:-all}"
case "$batch" in all|01|02|03) ;; *) echo "Usage: $0 [all|01|02|03]" >&2; exit 2;; esac
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

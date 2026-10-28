# Illustrated Home QA — 0.1.15

final result: passed

Scope: selected Home recreation with a functional 2D partner and native HUD. Reference: public/art/pet-home-reference.png (853×1844), the image explicitly selected by the user. Inspected original and rendered screenshots using view_image. Browser plugin is unavailable in this session; Playwright Chromium was used instead.

Checked at 390×844 and the reference's native 853×1844; overflow checked at 320, 390 and 1280 px by the Home interaction test.

| Comparison | Result / repair |
|---|---|
| Composition | Full-height room, compact header, paired status meters, centered room/name/level, dominant partner, horizontal activities, bottom navigation |
| Palette | Warm cream, pale lavender and plum labels; original action/nav artwork reused |
| Typography | Loaded Fredoka 500/600; replaced fallback serif labels |
| Asset treatment | New clean room illustration and transparent Pyroo; no Home WebGL canvas; corrected oversized partner placement |
| Header | Corrected logo crop, scaling of gold and settings on native-size viewport |
| Controls | Corrected icon sprite specificity, restored food/team art and heart crop; native click targets remain |
| Navigation | Original reference nav artwork, vertical icon/label arrangement at all sizes |
| Copy | Home, Pyroo, Lv., Energy, Bond, Food, Play, Rest, Team and main navigation retained; live values replace mock numbers; Indonesian labels follow the saved language |

Functional checks: five Playwright checks passed covering food stock consumption, room navigation, ball score, rest, no Home canvas, responsive width, BGM transitions, stored music toggle and background pause/resume. No physical-device visual/performance validation claimed.

Deliberate differences: room and Pyroo are independently regenerated assets, so the illustration is not pixel-identical to the reference; gold/energy/bond/level are real save values. Other partner species use their existing 2D portraits. Pet greeting is a brief 2D transform, not facial/skeletal animation. Gift is available through the Team dialog to avoid adding a button absent from the selected Home. The battle scene is outside this Home-only change.

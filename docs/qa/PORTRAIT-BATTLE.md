# Portrait battle UI — 0.1.6

Direction: user-supplied violet battle HUD/button references adapted to Android
portrait. Image Gen concept: /workspace/generated_images/exec-22e93be9-d3dd-41c7-832c-90019ad52ba7.png.

Implementation uses the existing Nusaraya background and procedural monster assets.
It intentionally does not replace the monsters with the generated concept art.

Visual review: full-bleed arena instead of a rounded card; enemy HP upper right
and player HP below foreground; navy/violet surfaces with white borders; stacked
skill buttons with colored element icons, shield for Guard, and PP; secondary
Switch/Bag/Run controls below. Text retains existing translations and real battle
state. The old descriptive heading is hidden during combat to prioritize arena
space. Controls and HUD are HTML, not baked into an image.

Browser plugin unavailable; Playwright Chromium used. Screenshot inspected at
390x844, with additional 320x740, 430x932, and 1280x900 checks. Desktop intentionally
keeps a centered portrait stage. Existing assets differ from the generated
concept; button shapes use rounded asymmetric corners to preserve touch targets.
Fixed outer margins, icon stroke contrast, and short-screen arena spacing after
visual review. On short screens/tutorials scrolling remains available.

Validation: production build and 32 unit tests pass; battle HP timing/input lock
and mandatory capture in both languages pass. Responsive checks wait for canvas
ResizeObserver before measuring horizontal overflow. APK 0.1.6, versionCode 7,
minimum API 24. Android hardware performance and native system bars not tested.

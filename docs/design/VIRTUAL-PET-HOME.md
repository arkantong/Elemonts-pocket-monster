# Virtual pet home direction

User chose existing monster species, not a separate mascot. Target: a compact horizontal care interface, large expressive partner and room changes inspired by virtual-pet games. Preserve species identity, evolution and battle stats.

Uploaded pou.apk identifies as `com.aptoide.android.aptoidegames` version 1.22.0, not Pou. No direct Pou gameplay observation can be claimed from this file.

First implementation scope: Home, Kitchen, Playroom and Bedroom rooms, horizontal room navigation, existing persisted food/energy/intimacy systems, real short ball-catching activity with session score, quiet bedroom presentation, team selection and daily gift in dialogs. Existing 3D species remain in use; this is not a completed redesign of all species meshes or rigs.

Do not invent hunger/cleanliness bars or grant free energy from repeated sleep clicks. Energy continues regenerating under existing game rules. A future pet-needs model, washing and per-species facial rigs need separate design/implementation.

UI tokens: warm cream surface #fff7ed, soft lavender #e9def7, plum text #49345f, round Fredoka labels and Nunito body, compact circular action rail, one central pet stage, horizontal room arrows. Existing bottom navigation retained. English/Indonesian labels required.

Concept: `/workspace/generated_images/exec-281f6b02-a076-44d3-bb99-33fdba2adf09.png`. Browser reference: `/tmp/elemonts-pet-home.png` (390×844). Playwright used because no Browser plugin is available. Checked room hierarchy, cream/lavender palette, compact status meters, horizontal action rail, bottom navigation and no horizontal overflow at 320/390/1280 px. Food inventory consumption, room changes, ball score and bedroom navigation passed browser testing.

Intentional differences from concept: existing animated 3D model replaces the illustrated character; existing Nusaraya room art and header/coin/capsule shell retained. This does not claim character-art parity with the concept. Bedroom currently changes lighting only; it does not yet pose the monster asleep or add sleep bonuses. Ball activity is a session interaction without stat rewards. Washing/hunger simulation is not implemented in this first pass.

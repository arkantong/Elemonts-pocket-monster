# Asset and dependency provenance

- Home environment, Nusaraya environment and starter portrait strip: generated for this project using Image Gen; no assets extracted from Pokémon ROMs or the uploaded APK.
- Creature meshes: original procedural Three.js geometry in `src/components/CreatureScene.tsx`; first-pass forms, not production sculpted models.
- UI icons: Lucide (ISC), chosen for the actions/element concepts described in DESIGN.md. App icon is original leaf vector.
- Fonts: Fredoka and Nunito Sans via Fontsource, SIL Open Font License; included locally for offline use.
- Sounds: original synthesized short WAV cues generated for this game, played through Howler.
- React, Vite, Three.js, Motion, Howler, Capacitor, Zod, Express and ws use their respective upstream licenses available in installed packages. Dependency versions are pinned by package-lock.json.
- Design guidance was consulted from https://github.com/nextlevelbuilder/ui-ux-pro-max-skill and https://github.com/miqdadbadjuber/anti-slop. Their installers were not allowed to rewrite global agent settings. No third-party skill source was copied into app runtime.
- Rive, dotLottie and Kenney assets were supplied as optional tools by the user; they are not included in this build because no corresponding authored animation/UI asset is needed yet.
- Since 0.1.19, battles use the GDevelop 5.6.285 JavaScript runtime (MIT), copied from the installed official Linux distribution. Its 2D renderer bundles PixiJS Legacy 7.4.2 (MIT), RBush (MIT), Howler 2.2.3 (MIT), and Font Face Observer (BSD-3-Clause); full notices are in `public/licenses/`. Runtime file digests are in `public/gdevelop/runtime-info.json`. The GDevelop name/logo remain upstream trademarks; no upstream logo is presented as Elemonts branding.
- The new Pyroo/Croobit atlas and painted 2D battle garden were generated with Image Gen from the user's character concept direction. Atlas cells are mechanically extracted without repainting. No Pokémon/Pou artwork is extracted. Contact-shadow SVG and procedural skill particles are rendering effects authored for this project.
- Previous Three.js/Blender work is retained as source study material, but the current game does not load a Three.js renderer or GLB models.
- Version 0.1.20 adds a second Image Gen atlas for Voltavi/Mippo, following the user's Batch 02 concept sheet. These eight additional sprites are artwork redraws; existing Pyroo/Croobit image bytes remain unchanged.

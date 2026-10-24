# Asset and dependency provenance

- Home environment, Nusaraya environment and starter portrait strip: generated for this project using Image Gen; no assets extracted from Pokémon ROMs or the uploaded APK.
- Creature meshes: original procedural Three.js geometry in `src/components/CreatureScene.tsx`; first-pass forms, not production sculpted models.
- UI icons: Lucide (ISC), chosen for the actions/element concepts described in DESIGN.md. App icon is original leaf vector.
- Fonts: Fredoka and Nunito Sans via Fontsource, SIL Open Font License; included locally for offline use.
- Sounds: original synthesized short WAV cues generated for this game, played through Howler.
- React, Vite, Three.js, Motion, Howler, Capacitor, Zod, Express and ws use their respective upstream licenses available in installed packages. Dependency versions are pinned by package-lock.json.
- Design guidance was consulted from https://github.com/nextlevelbuilder/ui-ux-pro-max-skill and https://github.com/miqdadbadjuber/anti-slop. Their installers were not allowed to rewrite global agent settings. No third-party skill source was copied into app runtime.
- Rive, dotLottie and Kenney assets were supplied as optional tools by the user; they are not included in this build because no corresponding authored animation/UI asset is needed yet.

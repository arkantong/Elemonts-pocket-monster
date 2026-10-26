# BGM-01 — Welcome Home, Little One

Released in Android debug 0.1.9 (versionCode 10).

User supplied Welcome Home, Little One.m4a, approximately 2 minutes 20 seconds. The upload contained Opus audio; converted to AAC 128 kbps in M4A for Android compatibility. No composition changes. The full track repeats; seamless-loop mastering has not been performed.

Music plays on opening and nonbattle menus, at 30% volume. The top-right music button and Settings control share a persistent preference (default on). Sound effects remain separately controlled. Browser autoplay restrictions may require the first user touch. Battle, hidden document, and native application background state pause playback. Returning resumes from the current playback position when enabled.

The audio is bundled in the APK and included in the web service worker precache for offline use.

## Validation

- Production web build and Android assembleDebug passed.
- Playwright verified actual audio playback after interaction, persisted on/off preference, hidden-document pause/resume, and battle silence.
- Layout test and screenshot inspection passed at 320 × 740 with no horizontal overflow.
- APK signature, alignment, version, and bundled audio bytes verified.
- Native background lifecycle handling is implemented; physical Android device playback has not been tested.

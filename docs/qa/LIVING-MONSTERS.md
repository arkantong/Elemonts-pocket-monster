# Living monster models — Android 0.1.7

User direction: retain the old species identities and improve their 3D quality,
with increasingly mature evolution forms. The generated orange furry fox is a
quality reference, not permission to overwrite the supplied palette or roster.

This pass upgrades Pyroo, Pyroar, Infernox, and Mippo. It retains the existing art
brief: cream/coral mochi fox, orange/gold maned fox, red/gold guardian fox with
three lantern tails, and lavender miniature hippo. Fox forms now have four legs,
shaped muzzles, cheek tufts, inner ears, glossy eyes, and tail plumes. Evolution
forms have smaller relative heads and fuller torsos. Mippo has a hippo muzzle,
nostrils, small ears, cheeks, and rounded feet.

Cached joints animate breathing, head movement, eye blinks, ears, and tails without
React re-renders. Reduced motion disables these motions; fainted creatures stop
idle motions and close their eyes. Root placement remains owned by battle playback.
Updated portraits are shared by collection and selection screens.

Validation: production build and Android assembleDebug passed. Unit checks cover
all 37 model bounds, art identities, idle/faint/reduced-motion behavior, blink,
and three Infernox tails. Battle browser test passed, including HP timing, input
lock, and responsive layouts. Rendered portraits and battle screenshot reviewed.
APK certificate and alignment checked; renderer and portrait bytes verified
against the production output. Android physical-device performance unverified.

Scope/limits: these are refined procedural models, not textured sculpted assets
with realistic fur. Attack motion still uses the existing battle choreography;
individual limb attack clips and high-end cinematics are not included. Other
33 species retain their prior geometry. APK versionCode 8, versionName 0.1.7.

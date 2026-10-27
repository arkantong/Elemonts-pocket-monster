# Elemonts 0.1.12 battle playback QA

Reference scope and measured-versus-adapted timings: [LeafGreen study](../design/LEAFGREEN-BATTLE.md).

- Unit suite: 37 tests passed across 7 files, including timing, misses, and reduced-motion timing.
- Battle playback browser test passed: commands lock, HP remains unchanged during hit response, then drains; layout checked at 320, 430 and 1280 px.
- Blender model / arena browser checks passed (battle-animation + blender-models: 5 tests).
- Capture tutorial production-web checks: 3 passed, covering Indonesian offline reload, English flow, navigation restrictions, collection and preserving existing saves. Initial development-server offline test timed out waiting for a service worker; rerunning against the PWA production build passed. No tutorial logic workaround was added.
- Android upgrade regression: 1 passed, using actual 0.1.9 web assets and the native cleanup script; stale worker removed and player storage retained.
- Native build and Gradle assembleDebug passed. APK package `com.elemonts.game`, versionName `0.1.12`, versionCode `13`.
- APK signature and zip alignment verified; signing certificate matches previous release. Packaged GLBs and native upgrade script match source; native bundle has no PWA worker registration.

Browser checks use Chromium/SwiftShader. No physical Android device was available, so device-specific performance and Android package-install behavior have not been directly tested. The upgrade regression models stale web content in Chromium; it is not a physical-device installation test.

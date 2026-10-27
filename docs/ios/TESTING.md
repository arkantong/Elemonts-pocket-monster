# iPhone testing — native project prepared, unsigned

The iOS Capacitor target is in `ios/App/App.xcodeproj`. It bundles the same game and six BGM tracks as Android 0.1.13. Portrait orientation, iOS 15 minimum, app identifier `com.elemonts.game`, version 0.1.13 (14). The existing game icon is used; native splash presentation is still the Capacitor template.

This target has been generated and web assets synced on Linux. It has NOT been compiled by Xcode, signed, run in Simulator, or tested on a physical iPhone. There is no installable IPA or TestFlight link yet.

## Mac / Xcode

Install Node 22+ and Xcode compatible with Capacitor 8 (Xcode 26+), select its command-line tools, then:

```bash
npm ci
npm run ios:sync
npm run ios:open
```

`ios:sync` reuses the native web build (`build:android` is its historical name): service workers are disabled for both native platforms.

In Xcode select the App target, Signing & Capabilities, select your own Team and enable automatic signing. No signing team or certificates are committed. Connect an iPhone or select an available Simulator and build/run. Personal Team provisioning may require a unique bundle ID, device trust/Developer Mode, and periodic reinstall; it is not a shareable IPA distribution route.

## Friend testing with TestFlight

Requires Apple Developer Program membership and an App Store Connect app record. The account holder must register the bundle ID, configure signing, archive a Release build for a generic iOS device, then use Organizer → Distribute App → App Store Connect. Complete App Store Connect test information and invite testers through TestFlight. External testers may require Apple's beta review. Do not share Apple passwords or private signing keys in chat.

## Device acceptance checks

- First language choice → starter → mandatory Wild capture tutorial.
- Safe-area spacing on notched phones; portrait controls and 3D models.
- BGM 01–06 switching, Settings toggle persistence, background/foreground pause.
- Capture, save/relaunch, JSON export/import/share.
- Duel connectivity needs its separately configured reachable server; native target preparation does not provide hosting.

A hosted HTTPS web/PWA version is an alternative for trying the game through Safari without native signing. No public hosting URL has been provisioned in this change.

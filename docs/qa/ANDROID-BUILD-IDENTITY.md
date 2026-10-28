# Android build identity and stale UI investigation

User reported the app still showed an older version after installing 0.1.16. Root cause on that physical device remains unconfirmed; no device log or exact installed version was available during this investigation.

## Artifact evidence

Downloaded the published 0.1.16 APK from GitHub again. Its SHA-256 exactly matched the local release and downloads/SHA256SUMS: 3af937bf2983c7df1eb2dbccc0f6a325a1bb9ecd2dd3c0a33e9930958eea8ec3. The 0.1.15 and 0.1.16 CSS and JavaScript bundles differ; this was not a version-only APK. The Home art is intentionally the same because the intervening QA changes primarily affect touch areas/accessibility.

## 0.1.17 changes

- Native recovery accepts the parsed localhost HTTP/HTTPS origin, including a root URL without a trailing slash.
- Recovery also runs on page commit; service workers are retired immediately when available.
- Native identity is compared with a meta tag embedded in the generated HTML. Stale HTML without a service worker is now detected too.
- At most one automatic reload per session/build; stale UI that remains after reload gets an explicit installed/UI version notice instead of an endless reload.
- LocalStorage, IndexedDB, cookies, player-owned caches and save files remain untouched. Only Workbox caches/worker registrations are removed.
- Settings displays App.getInfo() native version/build separately from compiled UI version. A native toast announces the installed version once after each update, independently of the web UI.

## Validation

Eight Playwright checks passed: actual 0.1.9 service-worker assets → current 2D Home with save/team/inventory/language/music retained; stale HTML with no worker; persistent mismatch without reload loop; music and Home care flows. These browser regressions execute the script shipped in the APK, but do not reproduce a physical Android package installation or prove that the user's phone installed the correct file. Native Java is compiled by Gradle separately.

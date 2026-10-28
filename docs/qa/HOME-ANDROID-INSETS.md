# Home Android insets and partner placement — 0.1.18

User screenshot showed system status icons over the logo/header, vertically collapsed navigation icons and Flicklet floating above the rug.

## Findings and fixes

1. Capacitor 8 SystemBars passes through edge-to-edge insets for modern Android WebViews (140+) with viewport-fit=cover. Home previously reserved none at the top; older WebViews were natively padded. Explicit CSS inset handling is now configured and the root reserves the maximum of native CSS variables and browser env insets. On older WebViews the plugin supplies zero after native padding, avoiding double reservation.
2. Bottom navigation padding plus shrinking flex pseudo-elements compressed the icon sprite area. System-bar padding is now outside the app, the nav has a minimum usable height, button padding is bounded, and icon flex shrinking is disabled with a square aspect ratio.
3. Existing species portraits have different transparent margins. Home now uses each image's alpha bounds as an SVG viewport, preserving aspect ratio and bottom alignment. It still displays raster illustrations, not 3D models. Flicklet retains its existing 256×256 artwork; this patch does not claim an HD character redraw.

## Tools and evidence

UI/UX Pro Max search was run for mobile safe areas, sticky navigation and touch spacing. Browser plugin is not available, so Playwright Chromium was used. Inspected the uploaded screenshot and fresh `/tmp/elemonts-safe-flicklet.png` / `/tmp/elemonts-safe-pyroo.png` renders with view_image.

Six new regression cases passed for Flicklet/Pyroo at 384×854 with top/bottom 24/32, 320×640 with 28/24, and 390×844 with zero insets. They assert header/nav bounds, square non-shrinking icons, portrait bounds/asset identity, no horizontal overflow or page errors, and room navigation. Existing Home care and four music checks also passed. Initial Flicklet test setup incorrectly used a wild species as a starter; corrected it to a captured team partner before rerunning all six cases.

These are browser simulations of the native inset values, not physical-device validation. Modern WebView status-bar/cutout values, three-button navigation and gestures should still be checked on the user's phone. No unrelated art redesign or game stat changes were made.

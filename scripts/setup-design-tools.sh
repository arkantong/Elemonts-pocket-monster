#!/usr/bin/env bash
# Optional design tools, isolated from the game dependencies.
set -euo pipefail
DESIGN_TOOLS_ROOT="${DESIGN_TOOLS_ROOT:-/workspace/shared}"
mkdir -p "$DESIGN_TOOLS_ROOT/gdevelop" "$DESIGN_TOOLS_ROOT/pascal-cli"
if [[ ! -x "$DESIGN_TOOLS_ROOT/gdevelop/squashfs-root/gdevelop" ]]; then
  curl -fL https://github.com/4ian/GDevelop/releases/download/v5.6.285/GDevelop-5-5.6.285.AppImage -o "$DESIGN_TOOLS_ROOT/gdevelop/GDevelop.AppImage"
  chmod +x "$DESIGN_TOOLS_ROOT/gdevelop/GDevelop.AppImage"
  (cd "$DESIGN_TOOLS_ROOT/gdevelop" && ./GDevelop.AppImage --appimage-extract >/dev/null)
fi
npm install --cache "$DESIGN_TOOLS_ROOT/npm-cache" --prefix "$DESIGN_TOOLS_ROOT/pascal-cli" @pascal-app/cli@1.0.6
if [[ ! -d "$DESIGN_TOOLS_ROOT/pascal-editor/.git" ]]; then
  git clone --depth 1 https://github.com/pascalorg/editor.git "$DESIGN_TOOLS_ROOT/pascal-editor"
fi
if [[ ! -d "$DESIGN_TOOLS_ROOT/3d-game-shaders-for-beginners/.git" ]]; then
  git clone --depth 1 https://github.com/lettier/3d-game-shaders-for-beginners.git "$DESIGN_TOOLS_ROOT/3d-game-shaders-for-beginners"
fi
if command -v blender >/dev/null 2>&1; then
  blender --version
else
  printf 'Blender is not provided by this base image; install an official Linux build before running scripts/check-blender.py.\n'
fi
printf 'Tools installed under %s. See docs/DESIGN-TOOLS.md for launch commands and limitations.\n' "$DESIGN_TOOLS_ROOT"

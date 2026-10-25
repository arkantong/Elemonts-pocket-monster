# Optional design tools

Installed in the shared cloud workspace, separately from Elemonts. Game engine,
APK dependencies, and gameplay are unchanged. Reinstall with
`bash scripts/setup-design-tools.sh` (Linux x86_64).

| Tool | Location and observed version | Validation |
| --- | --- | --- |
| GDevelop | `/workspace/shared/gdevelop/squashfs-root`, 5.6.285 Linux AppImage | Downloaded official release, extracted without FUSE; bundled Electron 32.3.3 runtime starts. Desktop GUI not tested: no graphical display in this session. |
| Pascal | `/workspace/shared/pascal-cli`, CLI/runtime 1.0.6; source `/workspace/shared/pascal-editor` at `6275b2c` | Runtime installed and verified by CLI; editor HTTP 200; CLI status reports editor running and MCP ready. Browser/WebGPU rendering not yet verified. |
| 3D Game Shaders for Beginners | `/workspace/shared/3d-game-shaders-for-beginners`, source `2970085` | Tutorial and 39 C++/vertex/fragment source files available. Original Panda3D C++ demo has not been compiled or run. |

## Launch

GDevelop requires a graphical Linux session:

```bash
/workspace/shared/bin/gdevelop
```

Pascal uses an isolated persistent data directory and selects available local ports:

```bash
/workspace/shared/bin/pascal editor --no-open
/workspace/shared/bin/pascal status
/workspace/shared/bin/pascal stop
```

Equivalent portable invocation after reinstalling (without local wrapper):

```bash
PASCAL_HOME=/workspace/shared/pascal-data /workspace/shared/pascal-cli/node_modules/.bin/pascal editor --no-open
```

At verification, editor URL was `http://pascal.localhost:41347`, MCP port 42567.
These are cloud-local addresses, not public URLs. Run `pascal status` for current
ports. The MCP service is installed and ready locally but not automatically
registered as a connector in this chat. Use `pascal mcp connect` when configuring
a compatible client; do not commit authentication configuration or local data.

## Intended use for Elemonts

- GDevelop: experiments with scenes and game interactions. It is a separate game
  engine; installing it does not convert the existing Three.js/Capacitor project.
- Pascal: buildings, rooms, and spatial/environment layout, not creature sculpting.
- Shader reference: learn/adapt rim lighting, bloom, shadows, and material effects
  to Three.js after profiling on Android. Panda3D GLSL is not a drop-in WebGL plugin.

The shader repository licenses its `.cxx`, `.vert`, and `.frag` software only;
its other content is not licensed for reuse by that license. Keep demo assets out
of shipped game assets unless separately authorized. Refer to each repository's
LICENSE before distributing adapted code or assets.

No APK update is needed for this tool installation. Detailed textured characters
and rigged attack animations still require dedicated asset production.

# LeafGreen battle study and Elemonts adaptation

## Evidence and limits

User-supplied ROM: `Pokemon - Leaf Green Version (U) (V1.1).gba`, 16,777,216 bytes; header `POKEMON LEAF`, code `BPGE`, revision 1. SHA-256: `2f978f635b9593f6ca26ec42481c53a6b39f6cddd894ad5c062c1419fac58825`.

REA 6.7.0 was actually invoked with `inspect-artifact`. It returned `unsupported binary format`; REA did **not** decompile this ROM. A locally installed mGBA 0.10.5 libretro core then ran the supplied ROM using a headless frontend. The opening, starter selection, rival battle entry, send-out, Fight/move menus, and the first Scratch → Tackle exchange were directly observed and recorded. Recording samples every two emulated frames (~33.5 ms), not host-clock elapsed time. Tutorial dialogue and manual button waits are not intrinsic animation durations.

Technical reference: [pret/pokefirered](https://github.com/pret/pokefirered/tree/ce6406d8c2eaf46d543c8a2606de0c3cb1951982), which supports LeafGreen. Source was read at that revision, but not rebuilt and byte-matched against the uploaded ROM. Treat its exact constants as **source evidence**, separate from runtime observations.

This is a study of the battle presentation slice, not a claim to have played every route, Gym, move, status, evolution, or ending. Wild encounter variants, all multi-hit moves, capture shake timing, status animations and later-game double battles have not all been measured. No ROM, Nintendo sprite, music, or extracted game asset is added to Elemonts.

## What actually makes the battle feel different

1. Entry is staged: transition, opponents introduced, opponent send-out, player send-out, then commands become available. Trainer and wild entrances have different content.
2. The selected move does not resolve immediately. The faster actor can execute first; the other actor waits for the entire presentation sequence.
3. A move announcement precedes the move effect. Text speed and input waits affect perceived pacing.
4. The move effect and the separate target damage response are different steps.
5. Target blinking happens before the HP bar drains. HP visibly interpolates instead of jumping directly to its final number.
6. Critical/effectiveness/status messages have their own reading time when present.
7. Fainting and the next command follow the result; controls are not prematurely unlocked.
8. The battle camera is stable. A basic tackle is a short lunge with a hit graphic, not a long cinematic rush across the arena.

## Source timing evidence

At approximately 59.7275 frames per second:

| Evidence | Source fact | Interpretation |
|---|---|---|
| `data/battle_anim_scripts.s`, `Move_TACKLE` | lunge; `delay 6`; hit splat, shake and sound | Hit effect begins ~100 ms after the move script starts, not after the player's button press. |
| `src/battle_anim_mon_movement.c`, `DoHorizontalLunge` | 4-frame movement argument, then reversed | Short forward/back movement; do not move the monster all the way into the opponent. |
| `src/battle_controller_player.c`, `DoHitAnimBlinkSpriteEffect` | 32 updates; visibility toggles every 4 | ~536 ms hit response; ~67 ms visibility intervals. Reduced-motion playback should not flash. |
| `include/constants/battle.h` | short 32, medium 48, long 64 | ~536 / 804 / 1,072 ms. These are contextual waits, not one universal skill duration. |
| `data/battle_scripts_1.s`, `BattleScript_HitFromAtkAnimation` | animation → wait → hit response → wait → HP → messages → faint | Separates presentation phases and explains why instant HP changes feel wrong. |
| `src/battle_script_commands.c`, `Cmd_waitmessage` | waits only if a message is displayed | Do not insert a 64-frame pause for an absent result message. |
| `Move_EMBER` | projectiles separated by 4-frame delays; later fire-hit pulses | Elemental skills need a different sequence from tackle. |
| `Move_GROWL` | cry, noise effect, target shake, wait for cry | Status moves have meaningful presentation without fake damage/HP drain. |
| `src/battle_interface.c`, `MoveBattleBar` | incremental bar updates via `CalcNewBarValue` | HP animation is dependent on values; there is no evidence for one fixed 400 ms ROM duration. |

## Changes implemented in Elemonts 0.1.12

- Staged entry and send-out with disabled commands until ready.
- Explicit announcement, motion, hit, HP-drain, result and idle phases.
- Physical contact offset based on the 6-frame Tackle script; short lunge and stable camera.
- 32-frame hit-blink phase, followed by progressive HP numbers and bar updates.
- Distinct basic/advanced elemental effect lengths; misses and guard do not invent damage.
- Reduced-motion alternative suppresses blinking and movement.
- Existing Elemonts stats, roster, elemental rules and battle outcomes remain authoritative.

**Deliberate 3D adaptations:** the 1.85-second entry, 900 ms automatic announcement, 400 ms HP drain, default reading hold and synthesized elemental durations are Elemonts tuning choices. They are not claimed to be frame-identical LeafGreen values. Entry currently shares one template across battle modes; a trainer avatar/throwing animation and per-species cries are not implemented. Existing 3D models are still unrigged.

Further fidelity work should separately measure wild entry, switching/forced replacement, capture attempts, faint/EXP/level-up, multi-hit moves, misses/immunity, and status effects before claiming full battle parity.

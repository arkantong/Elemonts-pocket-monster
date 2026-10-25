# Battle depth pass

Reference reviewed: user-provided Lumi Master video, sampled every three seconds.
The reference places the player in the near foreground, looking toward enemies
farther into the arena, and uses action cut-ins. This pass implements the camera
axis and near/far staging for the existing one-on-one battle.

- Player faces away from the camera toward the opponent.
- Physical attacks travel in X/Z toward contact and return; recoil travels back.
- Camera pushes in smoothly during playback and returns to its resting pose.
- Existing elemental overlays follow a diagonal foreground/background path.
- Reduced-motion keeps the depth staging without camera movement or lunges.
- HP, capture rules, roster, and combat mechanics are unchanged.

Evidence: battle-depth.png (390 × 844 browser viewport).
Build and 32 unit tests pass. Browser integration checks cover HP timing, input
locking, and the mandatory capture tutorial. No physical Android verification.

This is not a visual match to the full reference: current procedural models lack
production skeletal animation, authored special-skill cinematics, and the
reference's multi-character formations. The screenshot records the actual
implemented result, not a promise of final asset quality. Existing APK 0.1.4 does
not contain this change; a new Android build is needed to test it on device.

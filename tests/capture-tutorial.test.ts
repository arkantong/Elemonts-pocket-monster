import { describe, expect, it } from "vitest";
import { emptySave, transition, parseSave } from "../src/game/state";
import { STARTERS } from "../src/game/data";
import { createBattle, resolveTurn } from "../src/game/battle";
import { makeMonster } from "../src/game/state";

const start = (species = "pyroo") =>
  transition(emptySave(), { type: "starter", species });
function encounter(species = "pyroo") {
  return transition(transition(start(species), { type: "tutorial" }), {
    type: "battle",
    mode: "wild",
  });
}
describe("mandatory first capture", () => {
  it("cannot skip, shop, start Trainer, capture early, run, or use an unprompted skill", () => {
    const s = start();
    expect(() =>
      transition(s, { type: "capture-guide", step: "done" }),
    ).toThrow();
    expect(() => transition(s, { type: "buy", item: "exp" })).toThrow();
    expect(() => transition(s, { type: "battle", mode: "wild" })).toThrow();
    const ready = transition(s, { type: "tutorial" });
    expect(() =>
      transition(ready, { type: "battle", mode: "trainer" }),
    ).toThrow();
    for (const action of [
      { type: "run" },
      { type: "capture", capsule: "moco" },
      { type: "skill", index: 1 },
    ] as const)
      expect(() => transition(encounter(), { type: "turn", action })).toThrow();
  });
  for (const starter of STARTERS)
    it(`safely completes and persists a real catch for ${starter.name}`, () => {
      let s = encounter(starter.id);
      const originalHp = s.battle!.teams[0][0].hp;
      const targetHp = s.battle!.teams[1][0].hp;
      const capsules = s.inventory.moco;
      s = transition(s, { type: "turn", action: { type: "skill", index: 0 } });
      expect(s.captureTutorial).toBe("bag");
      expect(s.battle!.teams[1][0].hp).toBeLessThan(targetHp);
      expect(s.battle!.teams[1][0].hp).toBeGreaterThan(0);
      expect(s.battle!.teams[0][0].hp).toBe(originalHp);
      expect(s.battle!.result).toBeUndefined();
      expect(() =>
        transition(s, { type: "turn", action: { type: "skill", index: 0 } }),
      ).toThrow();
      s = parseSave(JSON.parse(JSON.stringify(s)));
      s = transition(s, { type: "capture-guide", step: "capsule" });
      s = transition(s, { type: "capture-guide", step: "bag" });
      s = transition(s, { type: "capture-guide", step: "capsule" });
      s = parseSave(JSON.parse(JSON.stringify(s)));
      s = transition(s, {
        type: "turn",
        action: { type: "capture", capsule: "moco" },
      });
      expect(s.battle!.result).toBe("captured");
      expect(s.inventory.moco).toBe(capsules - 1);
      s = parseSave(JSON.parse(JSON.stringify(s)));
      s = transition(s, { type: "settle" });
      expect(s.captureTutorial).toBe("caught");
      expect(s.monsters).toHaveLength(2);
      expect(s.team).toHaveLength(2);
      expect(s.monsters[1].species).toBe("flicklet");
      expect(s.monsters[1].energy).toBe(5);
      expect(s.monsters[0].energy).toBe(20);
      s = transition(s, { type: "capture-guide", step: "done" });
      expect(parseSave(s).captureTutorial).toBe("done");
      expect(() => transition(s, { type: "settle" })).toThrow();
      expect(
        transition(s, { type: "battle", mode: "trainer" }).battle!.mode,
      ).toBe("trainer");
    });
  it("keeps legacy saves usable and normal battles subject to KO and capture failure", () => {
    const s = start();
    delete s.captureTutorial;
    const legacy = parseSave(s);
    expect(
      transition(legacy, { type: "battle", mode: "trainer" }).battle!.mode,
    ).toBe("trainer");
    const b = createBattle(
      "wild",
      [makeMonster("pyroo", 50)],
      [makeMonster("flicklet", 2)],
    );
    b.teams[1][0].hp = 1;
    expect(
      resolveTurn(
        b,
        { type: "skill", index: 0 },
        { type: "skill", index: 2 },
        () => 0.5,
      ).result,
    ).toBe("win");
    expect(
      resolveTurn(
        b,
        { type: "capture", capsule: "moco" },
        { type: "skill", index: 2 },
        () => 0.999,
      ).result,
    ).not.toBe("captured");
    expect(
      resolveTurn(
        b,
        { type: "skill", index: 0 },
        { type: "skill", index: 2 },
        () => 0.5,
        true,
      ).teams[1][0].hp,
    ).toBe(1);
  });
});

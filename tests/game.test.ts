import { describe, it, expect } from "vitest";
import {
  emptySave,
  transition,
  makeMonster,
  dayKey,
  refresh,
  grantExp,
  parseSave,
  spent,
} from "../src/game/state";
import {
  createBattle,
  resolveTurn,
  effectiveness,
  validAction,
} from "../src/game/battle";
import { ROSTER, SPECIES } from "../src/game/data";
function state() {
  let s = transition(emptySave(), { type: "starter", species: "pyroo" });
  s.tutorial = true;
  s.captureTutorial = "done";
  return s;
}
describe("roster and progression", () => {
  it("contains the supplied 37 forms and valid evolution references", () => {
    expect(ROSTER).toHaveLength(37);
    for (const m of ROSTER)
      if (m.next) expect(SPECIES[m.next].family).toBe(m.family);
    expect(ROSTER.filter((m) => m.category === "Mythical")).toHaveLength(2);
  });
  it("evolves a starter at 16 and 32 without replacing its identity", () => {
    const m = makeMonster("pyroo", 15),
      id = m.uid;
    grantExp(m, 600);
    expect(m.species).toBe("pyroar");
    m.level = 31;
    m.exp = 0;
    grantExp(m, 1240);
    expect(m.species).toBe("infernox");
    expect(m.uid).toBe(id);
  });
  it("caps bonus points across sacrifice and blocks team donors", () => {
    const s = state(),
      donor = makeMonster("pyroo");
    s.monsters.push(donor);
    s.monsters[0].points = 19;
    const next = transition(s, {
      type: "sacrifice",
      target: s.team[0],
      donor: donor.uid,
    });
    expect(next.monsters[0].points).toBe(20);
    expect(next.monsters).toHaveLength(1);
    s.team.push(donor.uid);
    expect(() =>
      transition(s, { type: "sacrifice", target: s.team[0], donor: donor.uid }),
    ).toThrow();
  });
  it("does not allocate points above budget or reset without an item", () => {
    let s = state();
    for (let i = 0; i < 5; i++)
      s = transition(s, { type: "stat", uid: s.team[0], stat: "attack" });
    expect(spent(s.monsters[0])).toBe(5);
    expect(() =>
      transition(s, { type: "stat", uid: s.team[0], stat: "attack" }),
    ).toThrow();
    expect(() => transition(s, { type: "reset", uid: s.team[0] })).toThrow();
  });
  it("rejects malformed imports and invalid skill sets", () => {
    const s = state();
    s.team = ["unknown"];
    expect(() => parseSave(s)).toThrow();
    const good = state();
    good.monsters[0].skills = ["tackle", "tackle", "guard"];
    expect(() => parseSave(good)).toThrow();
  });
});
describe("energy and rewards from v4", () => {
  it("splits EXP between participants including KO; untouched members pay nothing", () => {
    const s = state();
    s.monsters.push(makeMonster("croobit"), makeMonster("voltavi"));
    s.team = s.monsters.map((m) => m.uid);
    s.battle = createBattle("wild", s.monsters, [makeMonster("jellun", 4)]);
    s.battle.participants = [0, 1];
    s.battle.teams[0][0].hp = 0;
    s.battle.result = "win";
    const n = transition(s, { type: "settle" });
    expect(n.monsters.map((m) => m.exp)).toEqual([70, 70, 0]);
    expect(n.monsters.map((m) => m.energy)).toEqual([19, 19, 20]);
    expect(n.gold).toBe(1235);
    expect(() => transition(n, { type: "settle" })).toThrow();
  });
  it("captures with 5 energy and does not charge participants", () => {
    const s = state();
    s.battle = createBattle("wild", s.monsters, [makeMonster("jellun", 3, 5)]);
    s.battle.result = "captured";
    s.battle.captured = makeMonster("jellun", 3, 5);
    const n = transition(s, { type: "settle" });
    expect(n.monsters[0].energy).toBe(20);
    expect(n.monsters[1].energy).toBe(5);
    expect(n.monsters[0].exp).toBe(0);
    expect(n.team).toHaveLength(2);
  });
  it("blocks zero-energy Wild but allows Trainer without EXP/energy cost", () => {
    const s = state();
    s.monsters[0].energy = 0;
    expect(() => transition(s, { type: "battle", mode: "wild" })).toThrow();
    const n = transition(s, { type: "battle", mode: "trainer" });
    n.battle!.result = "win";
    const done = transition(n, { type: "settle" });
    expect(done.monsters[0].energy).toBe(0);
    expect(done.monsters[0].exp).toBe(0);
    expect(done.monsters[0].intimacy).toBe(2);
    expect(done.gold).toBe(1300);
  });
  it("refreshes all collection members and preserves fractional timer", () => {
    const s = state();
    s.monsters.push(makeMonster("jellun"));
    const now = Date.now();
    s.monsters.forEach((m) => {
      m.energy = 10;
      m.energyAt = now - 5400000;
    });
    const n = refresh(s, now);
    expect(n.monsters.map((m) => m.energy)).toEqual([11, 11]);
    expect(n.monsters[0].energyAt).toBe(now - 1800000);
  });
  it("full energy does not bank time for immediate refill after battle", () => {
    const s = state(),
      now = Date.now();
    s.monsters[0].energyAt = now - 86400000;
    s.battle = createBattle("wild", s.monsters, [makeMonster("jellun")]);
    s.battle.result = "win";
    const n = transition(s, { type: "settle" });
    expect(refresh(n, now + 1000).monsters[0].energy).toBe(19);
  });
  it("claim and Trainer reset occur at 05:00 WIB exactly", () => {
    expect(dayKey(Date.parse("2026-10-24T21:59:59Z"))).toBe("2026-10-24");
    expect(dayKey(Date.parse("2026-10-24T22:00:00Z"))).toBe("2026-10-25");
    const s = transition(state(), { type: "claim" });
    expect(s.inventory.moco).toBe(11);
    expect(() => transition(s, { type: "claim" })).toThrow();
  });
});
describe("battle rules", () => {
  it("implements the elemental cycle and mutual Dark/Holy advantage", () => {
    expect(effectiveness("Api", "Tanah")).toBe(1.5);
    expect(effectiveness("Tanah", "Api")).toBe(0.75);
    expect(effectiveness("Dark", "Holy")).toBe(1.5);
    expect(effectiveness("Holy", "Dark")).toBe(1.5);
    expect(effectiveness("Netral", "Holy")).toBe(1);
  });
  it("does not let a knocked-out opponent execute its queued attack", () => {
    const ours = makeMonster("pyroo", 50),
      enemy = makeMonster("jellun", 2),
      b = createBattle("wild", [ours], [enemy]);
    b.teams[1][0].hp = 1;
    const n = resolveTurn(
      b,
      { type: "skill", index: 0 },
      { type: "skill", index: 0 },
      () => 0.5,
    );
    expect(n.result).toBe("win");
    expect(n.teams[0][0].hp).toBe(b.teams[0][0].hp);
    expect(n.teams[0][0].pp[0]).toBe(19);
  });
  it("uses a switch turn and tracks unique participants", () => {
    const b = createBattle(
      "wild",
      [makeMonster("pyroo"), makeMonster("croobit")],
      [makeMonster("jellun")],
    );
    const n = resolveTurn(
      b,
      { type: "switch", index: 1 },
      { type: "skill", index: 0 },
      () => 0.5,
    );
    expect(n.active[0]).toBe(1);
    expect(n.participants).toEqual([0, 1]);
    expect(n.teams[0][1].hp).toBeLessThan(n.teams[0][1].maxHp);
  });
  it("provides fallback move only when all skill uses are exhausted", () => {
    const b = createBattle(
      "wild",
      [makeMonster("pyroo")],
      [makeMonster("jellun")],
    );
    expect(validAction(b, 0, { type: "skill", index: -1 })).toBe(false);
    b.teams[0][0].pp = [0, 0, 0];
    expect(validAction(b, 0, { type: "skill", index: -1 })).toBe(true);
    expect(validAction(b, 0, { type: "skill", index: 0 })).toBe(false);
  });
  it("Gym final advances only after wins and grants medal after third match", () => {
    const s = state();
    s.monsters = ["pyroo", "croobit", "voltavi", "pebblit"].map((id) => {
      const m = makeMonster(id, 50);
      m.intimacy = 50;
      return m;
    });
    s.team = s.monsters.map((m) => m.uid);
    s.medals = [0, 1, 2, 3, 4];
    let n = transition(s, { type: "battle", mode: "gym", gym: 5 });
    for (let round = 0; round < 3; round++) {
      expect(n.battle?.round).toBe(round);
      n.battle!.result = "win";
      n = transition(n, { type: "settle" });
    }
    expect(n.medals).toContain(5);
    expect(n.gold).toBe(1500);
    expect(n.battle).toBeUndefined();
  });
});

describe("save recovery boundaries", () => {
  it("rejects an active index outside the restored battle team", () => {
    const s = state();
    s.battle = createBattle("wild", s.monsters, [makeMonster("jellun")]);
    s.battle.active[0] = 3;
    expect(() => parseSave(s)).toThrow();
  });
  it("neutral monsters cannot equip fallback as a permanent move", () => {
    const s = state();
    s.monsters[0] = makeMonster("mippo");
    s.team = [s.monsters[0].uid];
    expect(() =>
      transition(s, {
        type: "skill",
        uid: s.team[0],
        slot: 1,
        skill: "struggle",
      }),
    ).toThrow();
  });
});

it("simultaneous burn KO is a draw, not an advantage to the room creator", () => {
  const b = createBattle(
    "duel",
    [makeMonster("pyroo")],
    [makeMonster("croobit")],
  );
  for (const team of b.teams) {
    team[0].hp = 1;
    team[0].status = "burn";
  }
  const n = resolveTurn(
    b,
    { type: "skill", index: 2 },
    { type: "skill", index: 2 },
    () => 0.5,
  );
  expect(n.result).toBe("draw");
});

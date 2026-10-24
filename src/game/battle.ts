import {
  SPECIES,
  SKILLS,
  NATURES,
  BALANCE,
  type Element,
  type Stats,
} from "./data";
import type { Monster, Fighter, Battle, BattleAction } from "./types";
export function stats(m: Monster, level = m.level): Stats {
  const s = SPECIES[m.species],
    n = NATURES[m.nature];
  return Object.fromEntries(
    Object.entries(s.base).map(([k, b]) => {
      const key = k as keyof Stats;
      let v = b + level * (key === "hp" ? 4 : 2) + m.allocated[key];
      if (n.up === key) v *= 1.1;
      if (n.down === key) v *= 0.9;
      return [key, Math.floor(v)];
    }),
  ) as Stats;
}
export function effectiveness(attack: Element, defense: Element) {
  if (attack === "Netral" || defense === "Netral") return 1;
  const edges: Partial<Record<Element, Element>> = {
    Api: "Tanah",
    Tanah: "Listrik",
    Listrik: "Air",
    Air: "Api",
    Dark: "Holy",
    Holy: "Dark",
  };
  if (edges[attack] === defense) return 1.5;
  if (edges[defense] === attack) return 0.75;
  return 1;
}
export const fighter = (m: Monster): Fighter => ({
  monster: structuredClone(m),
  hp: stats(m).hp,
  maxHp: stats(m).hp,
  pp: m.skills.map((s) => SKILLS[s].pp),
  guard: false,
});
export function createBattle(
  mode: Battle["mode"],
  ours: Monster[],
  theirs: Monster[],
  extra: Partial<Battle> = {},
): Battle {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? String(Date.now() + Math.random()),
    mode,
    teams: [ours.map(fighter), theirs.map(fighter)],
    active: [0, 0],
    participants: [0],
    turn: 1,
    log: [`${SPECIES[theirs[0].species].name} siap bertarung.`],
    ...extra,
  };
}
export function validAction(b: Battle, side: number, a: BattleAction) {
  const f = b.teams[side][b.active[side]];
  if (b.result) return false;
  if (a.type === "switch")
    return (
      a.index !== b.active[side] &&
      !!b.teams[side][a.index] &&
      b.teams[side][a.index].hp > 0
    );
  if (f.hp <= 0) return false;
  if (a.type === "skill")
    return a.index === -1
      ? f.pp.every((p) => p <= 0)
      : Number.isInteger(a.index) &&
          a.index >= 0 &&
          a.index < 3 &&
          f.pp[a.index] > 0;
  if (a.type === "capture" || a.type === "run") return b.mode === "wild";
  return a.type === "potion" && b.mode !== "duel" && f.hp < f.maxHp;
}
export function resolveTurn(
  input: Battle,
  a: BattleAction,
  c: BattleAction,
  rng: () => number = Math.random,
): Battle {
  const b = structuredClone(input);
  if (!validAction(b, 0, a) || !validAction(b, 1, c)) return b;
  const actions = [a, c],
    logs: string[] = [];
  const add = (s: string) => logs.push(s);
  const speed = (i: number) =>
    stats(b.teams[i][b.active[i]].monster).speed *
    (b.teams[i][b.active[i]].status === "slow" ? 0.5 : 1);
  const priority = (x: BattleAction) => (x.type === "skill" ? 0 : 1);
  const order = [0, 1].sort(
    (i, j) =>
      priority(actions[j]) - priority(actions[i]) ||
      speed(j) - speed(i) ||
      i - j,
  );
  const originallyActive = [...b.active];
  for (const side of order) {
    if (b.result) break;
    let f = b.teams[side][b.active[side]],
      target = b.teams[1 - side][b.active[1 - side]],
      act = actions[side];
    if (act.type === "switch") {
      b.active[side] = act.index;
      if (side === 0 && !b.participants.includes(act.index))
        b.participants.push(act.index);
      add(
        `${SPECIES[b.teams[side][act.index].monster.species].name} masuk arena.`,
      );
      continue;
    }
    if (f.hp <= 0 || b.active[side] !== originallyActive[side]) continue;
    const name = SPECIES[f.monster.species].name;
    if (act.type === "run") {
      if (
        rng() <
        Math.min(0.95, 0.6 + 0.03 * (f.monster.level - target.monster.level))
      ) {
        b.result = "escaped";
        add("Berhasil kembali ke rumah. Energi tetap.");
      } else add("Belum berhasil kabur!");
      continue;
    }
    if (act.type === "capture") {
      const rarity = SPECIES[target.monster.species].rarity;
      const mult =
        act.capsule === "genesis"
          ? 3
          : act.capsule === "prime"
            ? 1.5
            : act.capsule === "element"
              ? SPECIES[f.monster.species].element ===
                SPECIES[target.monster.species].element
                ? 2
                : 1
              : 1;
      const chance = Math.min(
        0.95,
        (BALANCE.captureBase + (1 - target.hp / target.maxHp) * 0.55) *
          (rarity === "Langka" ? 0.65 : rarity === "Tidak umum" ? 0.85 : 1) *
          mult,
      );
      if (rng() < chance) {
        b.result = "captured";
        b.captured = { ...target.monster, energy: 5, energyAt: Date.now() };
        add(`${SPECIES[target.monster.species].name} menjadi teman barumu!`);
      } else add("Kapsul terbuka. Coba lemahkan target lagi.");
      continue;
    }
    if (act.type === "potion") {
      f.hp = Math.min(f.maxHp, f.hp + 35);
      add(`${name} memulihkan 35 HP.`);
      continue;
    }
    const move =
      act.index === -1 ? SKILLS.struggle : SKILLS[f.monster.skills[act.index]];
    if (act.index >= 0) f.pp[act.index]--;
    if (move.effect === "guard") {
      f.guard = true;
      add(`${name} bersiap menahan serangan.`);
      continue;
    }
    if (rng() * 100 >= move.accuracy) {
      add(`${name}: ${move.name} meleset.`);
      continue;
    }
    const af = stats(f.monster),
      df = stats(target.monster),
      eff = effectiveness(
        move.element,
        SPECIES[target.monster.species].element,
      ),
      crit = rng() < 0.07;
    const damage = Math.max(
      1,
      Math.floor(
        ((((2 * f.monster.level) / 5 + 2) * move.power * af.attack) /
          df.defense /
          30 +
          2) *
          eff *
          (crit ? 1.5 : 1) *
          (f.status === "burn" ? 0.8 : 1) *
          (target.guard ? 0.5 : 1) *
          (0.9 + rng() * 0.1),
      ),
    );
    target.guard = false;
    target.hp = Math.max(0, target.hp - damage);
    add(
      `${name} memakai ${move.name}: ${damage} damage.${eff > 1 ? " Sangat efektif!" : ""}${crit ? " Critical!" : ""}`,
    );
    if (move.effect && target.hp > 0 && rng() < 0.25) {
      target.status = move.effect;
      add(
        `${SPECIES[target.monster.species].name} ${move.effect === "burn" ? "terbakar" : "melambat"}.`,
      );
    }
    if (target.hp === 0) {
      add(`${SPECIES[target.monster.species].name} KO.`);
      if (b.teams[1 - side].every((m) => m.hp <= 0))
        b.result = side === 0 ? "win" : "loss";
    }
  }
  if (!b.result) {
    for (const side of [0, 1]) {
      const f = b.teams[side][b.active[side]];
      if (f.hp > 0 && f.status === "burn") {
        f.hp = Math.max(0, f.hp - Math.max(1, Math.floor(f.maxHp * 0.04)));
        if (f.hp === 0) {
          add(`${SPECIES[f.monster.species].name} KO karena terbakar.`);
        }
      }
    }
    const defeated = b.teams.map((team) => team.every((f) => f.hp <= 0));
    if (defeated[0] && defeated[1]) b.result = "draw";
    else if (defeated[0]) b.result = "loss";
    else if (defeated[1]) b.result = "win";
  }
  b.turn++;
  b.log = [...b.log, ...logs].slice(-9);
  return b;
}
export function aiAction(b: Battle): BattleAction {
  const f = b.teams[1][b.active[1]];
  if (f.hp <= 0)
    return { type: "switch", index: b.teams[1].findIndex((x) => x.hp > 0) };
  const available = f.pp.map((p, i) => (p > 0 ? i : -1)).filter((i) => i >= 0);
  return {
    type: "skill",
    index: available.length
      ? available.sort(
          (a, c) =>
            SKILLS[f.monster.skills[c]].power -
            SKILLS[f.monster.skills[a]].power,
        )[0]
      : -1,
  };
}

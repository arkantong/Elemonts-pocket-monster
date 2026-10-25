import { z } from "zod";
import {
  BALANCE,
  ITEMS,
  ROSTER,
  SPECIES,
  SKILLS,
  learnset,
  NATURES,
  type ItemId,
  type Stat,
} from "./data";
import {
  aiAction,
  createBattle,
  effectiveness,
  resolveTurn,
  validAction,
} from "./battle";
import type { Save, Monster, BattleAction } from "./types";
const uid = () =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;
export function makeMonster(species: string, level = 5, energy = 20): Monster {
  return {
    uid: uid(),
    species,
    level,
    exp: 0,
    energy,
    energyAt: Date.now(),
    intimacy: 0,
    nature: Math.floor(Math.random() * NATURES.length),
    points: 5,
    allocated: { hp: 0, attack: 0, defense: 0, speed: 0 },
    skills: ["tackle", `${SPECIES[species].element}-0`, "guard"],
  };
}
export const dayKey = (now = Date.now()) =>
  new Date(now + 2 * 3600000).toISOString().slice(0, 10);
export const neededExp = (level: number) => level * 40;
export const energyCap = (s: Save, m: Monster) =>
  BALANCE.baseEnergy + (s.decor && s.team.includes(m.uid) ? 5 : 0);
export function emptySave(): Save {
  return {
    version: 1,
    monsters: [],
    team: [],
    gold: 1200,
    inventory: Object.fromEntries(
      Object.keys(ITEMS).map((k) => [
        k,
        k === "moco"
          ? 8
          : k === "exp"
            ? 3
            : k === "intimacy"
              ? 2
              : k === "energy"
                ? 2
                : k === "potion"
                  ? 3
                  : 0,
      ]),
    ) as Record<ItemId, number>,
    claimedDay: "",
    trainerDay: dayKey(),
    trainerUsed: 0,
    trainerBonus: 0,
    medals: [],
    decor: false,
    sound: false,
    seen: [],
    tutorial: false,
    captureTutorial: "intro",
    duelServer: "",
  };
}
export function refresh(s: Save, now = Date.now()): Save {
  const n = structuredClone(s);
  const day = dayKey(now);
  if (n.trainerDay !== day) {
    n.trainerDay = day;
    n.trainerUsed = 0;
    n.trainerBonus = 0;
  }
  for (const m of n.monsters) {
    const cap = energyCap(n, m),
      ms = n.decor && n.team.includes(m.uid) ? 2700000 : BALANCE.recoveryMs;
    const ticks = Math.max(0, Math.floor((now - m.energyAt) / ms));
    if (m.energy >= cap) {
      m.energy = cap;
      m.energyAt = now;
    } else if (ticks) {
      m.energy = Math.min(cap, m.energy + ticks);
      m.energyAt = m.energy === cap ? now : m.energyAt + ticks * ms;
    }
    if (m.energyAt > now) m.energyAt = now;
  }
  if (n.buff && n.buff.until <= now) delete n.buff;
  return n;
}
export function grantExp(m: Monster, amount: number) {
  m.exp += amount;
  while (m.level < BALANCE.maxLevel && m.exp >= neededExp(m.level)) {
    m.exp -= neededExp(m.level);
    m.level++;
  }
  if (m.level === BALANCE.maxLevel) m.exp = 0;
  while (
    SPECIES[m.species].next &&
    m.level >= (SPECIES[m.species].evolveAt ?? 999)
  )
    m.species = SPECIES[m.species].next!;
}
export function intimacy(m: Monster, amount: number) {
  const old = Math.floor(m.intimacy / 10);
  m.intimacy = Math.min(100, m.intimacy + amount);
  m.points = Math.min(20, m.points + Math.floor(m.intimacy / 10) - old);
}
export const spent = (m: Monster) =>
  Object.values(m.allocated).reduce((a, b) => a + b, 0);
export function encounter(s: Save): Monster {
  const avg =
    s.monsters
      .filter((m) => s.team.includes(m.uid))
      .reduce((v, m) => v + m.level, 0) / Math.max(1, s.team.length);
  const lead = s.monsters.find((m) => m.uid === s.team[0]);
  const pool = ROSTER.filter((m) => m.stage === 1 && m.category !== "Mythical");
  const weights = pool.map((m) => {
    let w = m.rarity === "Langka" ? 1 : m.rarity === "Tidak umum" ? 4 : 10;
    if (s.buff?.type === "rare" && m.rarity !== "Umum") w *= 2;
    if (
      s.buff?.type === "counter" &&
      lead &&
      effectiveness(m.element, SPECIES[lead.species].element) > 1
    )
      w *= 2;
    return w;
  });
  let r = Math.random() * weights.reduce((a, b) => a + b, 0);
  let choice = pool[0];
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) {
      choice = pool[i];
      break;
    }
  }
  return makeMonster(
    choice.id,
    Math.max(
      2,
      Math.min(50, Math.round(avg) - 2 + Math.floor(Math.random() * 4)),
    ),
    5,
  );
}
export type Action =
  | { type: "starter"; species: string }
  | { type: "refresh" }
  | { type: "team"; uid: string }
  | { type: "lead"; uid: string }
  | { type: "claim" }
  | { type: "buy"; item: ItemId }
  | { type: "feed"; uid: string; item: ItemId }
  | { type: "stat"; uid: string; stat: Stat }
  | { type: "reset"; uid: string }
  | { type: "sacrifice"; target: string; donor: string }
  | { type: "sell"; uid: string }
  | { type: "skill"; uid: string; slot: number; skill: string }
  | { type: "battle"; mode: "wild" | "trainer" | "gym"; gym?: number }
  | { type: "turn"; action: BattleAction }
  | { type: "settle" }
  | { type: "sound" }
  | { type: "tutorial" }
  | { type: "capture-guide"; step: "bag" | "capsule" | "done" }
  | { type: "decor" }
  | { type: "server"; url: string };
export function transition(input: Save, a: Action): Save {
  const s = refresh(input);
  const lesson = !!s.captureTutorial && s.captureTutorial !== "done";
  if (
    lesson &&
    s.monsters.length &&
    ![
      "tutorial",
      "capture-guide",
      "battle",
      "turn",
      "settle",
      "sound",
      "refresh",
    ].includes(a.type)
  )
    throw Error("Selesaikan latihan menangkap terlebih dahulu.");
  if (
    s.battle &&
    !["turn", "settle", "sound", "refresh", "capture-guide"].includes(a.type)
  )
    throw Error("Selesaikan pertarungan terlebih dahulu.");
  const mon = (id: string) => {
    const m = s.monsters.find((x) => x.uid === id);
    if (!m) throw Error("Monster tidak ditemukan.");
    return m;
  };
  const consume = (id: ItemId) => {
    if (s.inventory[id] < 1)
      throw Error(`${ITEMS[id].name} habis. Tersedia di toko.`);
    s.inventory[id]--;
  };
  switch (a.type) {
    case "starter": {
      if (s.monsters.length) throw Error("Starter sudah dipilih.");
      if (
        !ROSTER.some(
          (m) =>
            m.id === a.species && m.category === "Starter" && m.stage === 1,
        )
      )
        throw Error("Starter tidak valid.");
      const m = makeMonster(a.species);
      s.monsters = [m];
      s.team = [m.uid];
      s.seen = [a.species];
      s.captureTutorial = "intro";
      break;
    }
    case "team": {
      mon(a.uid);
      if (s.team.includes(a.uid)) {
        if (s.team.length === 1) throw Error("Sisakan satu monster dalam tim.");
        s.team = s.team.filter((id) => id !== a.uid);
      } else {
        if (s.team.length >= 4) throw Error("Tim sudah berisi empat monster.");
        s.team.push(a.uid);
      }
      break;
    }
    case "lead": {
      mon(a.uid);
      if (!s.team.includes(a.uid))
        throw Error("Masukkan monster ke tim terlebih dahulu.");
      s.team = [a.uid, ...s.team.filter((id) => id !== a.uid)];
      break;
    }
    case "claim":
      if (s.claimedDay === dayKey())
        throw Error("Hadiah hari ini sudah diambil.");
      s.inventory.moco += 3;
      s.claimedDay = dayKey();
      break;
    case "buy": {
      const item = ITEMS[a.item];
      if (s.gold < item.price) throw Error("Gold belum cukup.");
      if (a.item === "decor" && s.inventory.decor)
        throw Error("Kebun embun sudah dimiliki.");
      s.gold -= item.price;
      s.inventory[a.item]++;
      if (a.item === "ticket") {
        s.trainerBonus++;
        s.inventory.ticket--;
      }
      break;
    }
    case "feed": {
      const m = mon(a.uid);
      if (ITEMS[a.item].type !== "food") throw Error("Pilih makanan.");
      if (a.item === "energy" && m.energy >= energyCap(s, m))
        throw Error("Energi sudah penuh.");
      consume(a.item);
      if (a.item === "exp") grantExp(m, 120);
      if (a.item === "intimacy") intimacy(m, 5);
      if (a.item === "energy") {
        m.energy = Math.min(energyCap(s, m), m.energy + 5);
        if (m.energy === energyCap(s, m)) m.energyAt = Date.now();
      }
      if (a.item === "rare" || a.item === "counter")
        s.buff = { type: a.item, until: Date.now() + 600000 };
      break;
    }
    case "stat": {
      const m = mon(a.uid);
      if (spent(m) >= m.points) throw Error("Semua poin sudah digunakan.");
      m.allocated[a.stat]++;
      break;
    }
    case "reset": {
      const m = mon(a.uid);
      if (spent(m) === 0) throw Error("Belum ada poin yang dibagikan.");
      consume("reset");
      m.allocated = { hp: 0, attack: 0, defense: 0, speed: 0 };
      break;
    }
    case "sacrifice": {
      const m = mon(a.target),
        d = mon(a.donor);
      if (
        m.uid === d.uid ||
        s.team.includes(d.uid) ||
        d.species !== SPECIES[m.species].family
      )
        throw Error(
          "Bahan harus bentuk dasar keluarga yang sama dan berada di luar tim.",
        );
      if (m.points >= 20) throw Error("Poin stat sudah maksimal.");
      m.points = Math.min(20, m.points + BALANCE.duplicatePoints);
      s.monsters = s.monsters.filter((x) => x.uid !== d.uid);
      break;
    }
    case "sell": {
      mon(a.uid);
      if (s.team.includes(a.uid))
        throw Error("Keluarkan monster dari tim dahulu.");
      s.monsters = s.monsters.filter((m) => m.uid !== a.uid);
      s.gold += 75;
      break;
    }
    case "skill": {
      const m = mon(a.uid);
      if (
        !learnset(m.species, m.level).includes(a.skill) ||
        a.slot < 0 ||
        a.slot > 2 ||
        m.skills.includes(a.skill)
      )
        throw Error("Pilih skill baru yang sudah dipelajari.");
      m.skills[a.slot] = a.skill;
      break;
    }
    case "battle": {
      if (lesson && (s.captureTutorial !== "explore" || a.mode !== "wild"))
        throw Error("Ikuti panduan menangkap monster Wild terlebih dahulu.");
      const team = s.team.map(mon);
      if (!team.length) throw Error("Pilih tim dahulu.");
      if (a.mode === "wild" && team.some((m) => m.energy < 1))
        throw Error(
          "Ada monster dengan energi nol. Ganti tim atau pulihkan energinya.",
        );
      let enemies: Monster[];
      if (a.mode === "wild")
        enemies = [lesson ? makeMonster("flicklet", 2, 5) : encounter(s)];
      else if (a.mode === "trainer") {
        if (s.trainerUsed >= BALANCE.trainerLimit + s.trainerBonus)
          throw Error("Kesempatan Trainer habis. Reset pukul 05.00 WIB.");
        s.trainerUsed++;
        enemies = [
          makeMonster(
            ROSTER.filter((m) => m.category === "Wild" && m.stage === 1)[
              Math.floor(Math.random() * 10)
            ].id,
            Math.max(3, team[0].level),
          ),
        ];
      } else {
        const g = a.gym ?? 0;
        if (g < 0 || g > 5 || g > s.medals.length)
          throw Error("Selesaikan Gym sebelumnya.");
        if (
          team.length !== 4 ||
          team.some(
            (m) =>
              m.level < BALANCE.gymLevels[g] ||
              m.intimacy < BALANCE.gymIntimacy[g],
          )
        )
          throw Error(
            `Perlu empat monster level ${BALANCE.gymLevels[g]} dan intimasi ${BALANCE.gymIntimacy[g]}.`,
          );
        enemies = gymTeam(g, 0);
      }
      s.battle = createBattle(
        a.mode,
        team,
        enemies,
        a.mode === "gym" ? { gym: a.gym ?? 0, round: 0 } : {},
      );
      s.seen = [...new Set([...s.seen, ...enemies.map((m) => m.species)])];
      if (lesson) {
        s.captureTutorial = "weaken";
        s.inventory.moco = Math.max(1, s.inventory.moco);
      }
      break;
    }
    case "turn": {
      if (
        lesson &&
        !(
          (s.captureTutorial === "weaken" &&
            a.action.type === "skill" &&
            a.action.index === 0) ||
          (s.captureTutorial === "capsule" &&
            a.action.type === "capture" &&
            a.action.capsule === "moco")
        )
      )
        throw Error("Gunakan aksi yang ditandai pada panduan.");
      if (!s.battle || !validAction(s.battle, 0, a.action))
        throw Error("Aksi ini belum bisa dilakukan.");
      if (a.action.type === "capture") {
        if (s.monsters.length >= BALANCE.capacity)
          throw Error("Koleksi penuh.");
        if (ITEMS[a.action.capsule]?.type !== "capsule")
          throw Error("Kapsul tidak valid.");
        consume(a.action.capsule);
      }
      if (a.action.type === "potion") consume("potion");
      s.battle = lesson
        ? resolveTurn(
            s.battle,
            a.action,
            { type: "skill", index: 2 },
            () => 0.5,
            true,
          )
        : resolveTurn(s.battle, a.action, aiAction(s.battle));
      if (lesson && s.captureTutorial === "weaken") s.captureTutorial = "bag";
      break;
    }
    case "settle": {
      const b = s.battle;
      if (!b?.result) throw Error("Pertarungan belum selesai.");
      if (
        b.mode === "gym" &&
        b.result === "win" &&
        b.gym === 5 &&
        (b.round ?? 0) < 2
      ) {
        s.battle = createBattle(
          "gym",
          s.team.map(mon),
          gymTeam(5, (b.round ?? 0) + 1),
          { gym: 5, round: (b.round ?? 0) + 1 },
        );
        break;
      }
      if (b.mode === "wild" && ["win", "loss", "draw"].includes(b.result)) {
        const reward =
          b.result === "win"
            ? b.teams[1].reduce((v, f) => v + f.monster.level * 35, 0)
            : 0;
        const each = Math.floor(reward / b.participants.length);
        for (const i of b.participants) {
          const m = mon(b.teams[0][i].monster.uid);
          if (m.energy >= energyCap(s, m)) m.energyAt = Date.now();
          m.energy = Math.max(0, m.energy - 1);
          if (each) {
            grantExp(m, each);
            intimacy(m, 1);
          }
        }
      }
      if (b.result === "captured" && b.captured) {
        b.captured.uid = uid();
        s.monsters.push(b.captured);
        if (s.team.length < 4) s.team.push(b.captured.uid);
        if (lesson) s.captureTutorial = "caught";
      }
      if (b.result === "win") {
        s.gold += b.mode === "trainer" ? 100 : b.mode === "gym" ? 300 : 35;
        if (b.mode !== "wild")
          b.participants.forEach((i) =>
            intimacy(mon(b.teams[0][i].monster.uid), 2),
          );
        if (b.mode === "gym" && !s.medals.includes(b.gym!))
          s.medals.push(b.gym!);
      }
      s.seen = [...new Set([...s.seen, ...s.monsters.map((m) => m.species)])];
      delete s.battle;
      break;
    }
    case "sound":
      s.sound = !s.sound;
      break;
    case "tutorial":
      s.tutorial = true;
      if (s.captureTutorial === "intro") s.captureTutorial = "explore";
      break;
    case "capture-guide":
      if (
        a.step === "capsule" &&
        s.captureTutorial === "bag" &&
        s.battle &&
        !s.battle.result
      )
        s.captureTutorial = "capsule";
      else if (a.step === "bag" && s.captureTutorial === "capsule")
        s.captureTutorial = "bag";
      else if (
        a.step === "done" &&
        s.captureTutorial === "caught" &&
        !s.battle &&
        s.monsters.length >= 2
      )
        s.captureTutorial = "done";
      else throw Error("Langkah tutorial belum selesai.");
      break;
    case "decor":
      if (!s.inventory.decor) throw Error("Kebun embun tersedia di toko.");
      s.decor = !s.decor;
      break;
    case "server":
      s.duelServer = a.url;
      break;
    case "refresh":
      break;
  }
  return s;
}
function gymTeam(g: number, round: number) {
  const ids =
    g < 5
      ? [
          ["pyroar", "infernox"],
          ["rivaclaw", "hydragon"],
          ["voltusk", "voltitan"],
          ["rockhorn", "terragorn"],
          ["pluffluff", "pufflare"],
        ][g]
      : [
          ["infernox", "hydragon"],
          ["voltitan", "terragorn"],
          ["pufflare", "infernox", "hydragon", "voltitan"],
        ][round];
  return ids.map((id) => makeMonster(id, BALANCE.gymLevels[g]));
}
const num = z.number().finite().nonnegative();
export const monsterSchema = z
  .object({
    uid: z.string().min(1).max(100),
    species: z.string().refine((s) => !!SPECIES[s]),
    level: num.int().min(1).max(60),
    exp: num,
    energy: num.max(25),
    energyAt: num,
    intimacy: num.max(100),
    nature: num.int().max(3),
    points: num.int().min(5).max(20),
    allocated: z.object({
      hp: num.int().max(20),
      attack: num.int().max(20),
      defense: num.int().max(20),
      speed: num.int().max(20),
    }),
    skills: z
      .array(z.string().refine((s) => !!SKILLS[s] && s !== "struggle"))
      .length(3),
  })
  .refine(
    (m) =>
      !!SPECIES[m.species] &&
      spent(m) <= m.points &&
      new Set(m.skills).size === 3 &&
      m.skills.every((s) => learnset(m.species, m.level).includes(s)),
  );
const fighterSchema = z
  .object({
    monster: monsterSchema,
    hp: num,
    maxHp: num.positive(),
    pp: z.array(num.int().max(99)).length(3),
    status: z.enum(["burn", "slow"]).optional(),
    guard: z.boolean(),
  })
  .refine(
    (f) =>
      f.hp <= f.maxHp &&
      f.pp.every((p, i) => p <= SKILLS[f.monster.skills[i]].pp),
  );
const battleSchema = z
  .object({
    id: z.string(),
    mode: z.enum(["wild", "trainer", "gym"]),
    teams: z.tuple([
      z.array(fighterSchema).min(1).max(4),
      z.array(fighterSchema).min(1).max(4),
    ]),
    active: z.tuple([num.int().max(3), num.int().max(3)]),
    participants: z.array(num.int().max(3)).min(1).max(4),
    turn: num.int().min(1),
    log: z.array(z.string().max(500)).max(20),
    result: z.enum(["win", "loss", "draw", "captured", "escaped"]).optional(),
    captured: monsterSchema.optional(),
    gym: num.int().max(5).optional(),
    round: num.int().max(2).optional(),
  })
  .refine(
    (b) =>
      b.active.every((index, side) => index < b.teams[side].length) &&
      new Set(b.participants).size === b.participants.length &&
      b.participants.every((i) => i < b.teams[0].length) &&
      (b.mode !== "gym" || (b.gym !== undefined && b.round !== undefined)) &&
      (b.result !== "captured" || (b.mode === "wild" && !!b.captured)),
  );
const saveSchema = z.object({
  version: z.literal(1),
  monsters: z.array(monsterSchema).max(120),
  team: z.array(z.string()).max(4),
  gold: num,
  inventory: z.object(
    Object.fromEntries(Object.keys(ITEMS).map((k) => [k, num.int()])) as Record<
      ItemId,
      typeof num
    >,
  ),
  claimedDay: z.string(),
  trainerDay: z.string(),
  trainerUsed: num.int(),
  trainerBonus: num.int(),
  medals: z.array(num.int().max(5)),
  decor: z.boolean(),
  sound: z.boolean(),
  seen: z.array(z.string()),
  tutorial: z.boolean(),
  captureTutorial: z
    .enum(["intro", "explore", "weaken", "bag", "capsule", "caught", "done"])
    .optional(),
  duelServer: z.string(),
  buff: z.object({ type: z.enum(["rare", "counter"]), until: num }).optional(),
  battle: battleSchema.optional(),
});
export function parseSave(value: unknown): Save {
  const s = saveSchema.parse(value) as Save;
  if (
    new Set(s.monsters.map((m) => m.uid)).size !== s.monsters.length ||
    new Set(s.team).size !== s.team.length ||
    s.team.some((id) => !s.monsters.some((m) => m.uid === id)) ||
    (s.monsters.length > 0 && s.team.length === 0) ||
    new Set(s.medals).size !== s.medals.length ||
    (s.battle &&
      !s.battle.teams[0].every((f) => s.team.includes(f.monster.uid)))
  )
    throw Error("Susunan koleksi tidak valid.");
  return s;
}
export const SAVE_KEY = "elemonts-save-v1";
export function loadSave(): { save: Save; error?: string } {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { save: emptySave() };
    const s = parseSave(JSON.parse(raw));
    if (s.battle) {
      // Battles are verified separately; never trust a stored reward payload.
      const b = s.battle;
      if (
        !["wild", "trainer", "gym"].includes(b.mode) ||
        !Array.isArray(b.teams) ||
        b.teams.length !== 2 ||
        !b.teams.every(
          (t) =>
            Array.isArray(t) &&
            t.length >= 1 &&
            t.length <= 4 &&
            t.every(
              (f) =>
                monsterSchema.safeParse(f.monster).success &&
                Number.isFinite(f.hp) &&
                f.hp >= 0 &&
                f.hp <= f.maxHp &&
                Array.isArray(f.pp) &&
                f.pp.length === 3,
            ),
        ) ||
        !Array.isArray(b.participants) ||
        b.participants.some(
          (i) => !Number.isInteger(i) || i < 0 || i >= b.teams[0].length,
        ) ||
        !b.teams[0].every((f) => s.team.includes(f.monster.uid))
      )
        throw Error("Data battle tidak valid.");
    }
    return { save: refresh(s) };
  } catch {
    return {
      save: emptySave(),
      error:
        "Simpanan tidak bisa dibaca. Data lama tetap disimpan; unduh cadangan di Pengaturan sebelum memulai ulang.",
    };
  }
}

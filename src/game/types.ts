import type { Stats, ItemId } from "./data";
export type Monster = {
  uid: string;
  species: string;
  level: number;
  exp: number;
  energy: number;
  energyAt: number;
  intimacy: number;
  nature: number;
  points: number;
  allocated: Stats;
  skills: string[];
};
export type Fighter = {
  monster: Monster;
  hp: number;
  maxHp: number;
  pp: number[];
  status?: "burn" | "slow";
  guard: boolean;
};
export type BattleAction =
  | { type: "skill"; index: number }
  | { type: "switch"; index: number }
  | { type: "capture"; capsule: ItemId }
  | { type: "run" }
  | { type: "potion" };
export type Battle = {
  id: string;
  mode: "wild" | "trainer" | "gym" | "duel";
  teams: [Fighter[], Fighter[]];
  active: [number, number];
  participants: number[];
  turn: number;
  log: string[];
  result?: "win" | "loss" | "draw" | "captured" | "escaped";
  captured?: Monster;
  gym?: number;
  round?: number;
};
export type Save = {
  version: 1;
  monsters: Monster[];
  team: string[];
  gold: number;
  inventory: Record<ItemId, number>;
  claimedDay: string;
  trainerDay: string;
  trainerUsed: number;
  trainerBonus: number;
  medals: number[];
  decor: boolean;
  buff?: { type: "rare" | "counter"; until: number };
  battle?: Battle;
  sound: boolean;
  seen: string[];
  tutorial: boolean;
  duelServer: string;
};

import express from "express";
import { createServer } from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { randomInt } from "node:crypto";
import { networkInterfaces } from "node:os";
import path from "node:path";
import { z } from "zod";
import { monsterSchema } from "../src/game/state";
import { createBattle, resolveTurn, validAction } from "../src/game/battle";
import { BALANCE, SPECIES } from "../src/game/data";
import type { Battle, Monster, BattleAction } from "../src/game/types";
const app = express();
app.use(express.static(path.resolve("dist")));
app.get("/api/health", (_req, res) =>
  res.json({ ok: true, service: "elemonts-lan-duel" }),
);
app.get("/{*path}", (_req, res) =>
  res.sendFile(path.resolve("dist/index.html")),
);
const http = createServer(app),
  wss = new WebSocketServer({ server: http, path: "/duel", maxPayload: 16384 });
type Room = {
  code: string;
  clients: WebSocket[];
  teams: Monster[][];
  normalize: boolean;
  battle?: Battle;
  actions: Map<number, BattleAction>;
  updated: number;
};
const rooms = new Map<string, Room>(),
  membership = new Map<WebSocket, Room>();
const teamSchema = z
  .array(monsterSchema)
  .min(1)
  .max(4)
  .refine(
    (t) =>
      new Set(t.map((m) => m.uid)).size === t.length &&
      t.every((m) => SPECIES[m.species].category !== "Mythical"),
  );
const actionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("skill"),
    index: z.number().int().min(-1).max(2),
  }),
  z.object({
    type: z.literal("switch"),
    index: z.number().int().min(0).max(3),
  }),
]);
const messageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("create"),
    team: teamSchema,
    normalize: z.boolean(),
  }),
  z.object({
    type: z.literal("join"),
    code: z.string().regex(/^\d{6}$/),
    team: teamSchema,
  }),
  z.object({
    type: z.literal("action"),
    turn: z.number().int(),
    action: actionSchema,
  }),
  z.object({ type: z.literal("leave") }),
]);
const send = (ws: WebSocket, v: unknown) => {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(v));
};
function view(b: Battle, i: number): Battle {
  const v = structuredClone(b);
  if (i === 1) {
    v.teams = [v.teams[1], v.teams[0]];
    v.active = [v.active[1], v.active[0]];
    if (v.result === "win") v.result = "loss";
    else if (v.result === "loss") v.result = "win";
  }
  return v;
}
function broadcast(room: Room) {
  room.clients.forEach((ws, i) =>
    send(ws, {
      type: "state",
      code: room.code,
      normalize: room.normalize,
      battle: room.battle ? view(room.battle, i) : undefined,
      waiting: room.actions.has(i),
      players: room.clients.length,
    }),
  );
}
function leave(ws: WebSocket) {
  const room = membership.get(ws);
  if (!room) return;
  room.clients.forEach((client) => {
    membership.delete(client);
    if (client !== ws)
      send(client, {
        type: "closed",
        message:
          "Lawan meninggalkan room. Duel berakhir tanpa hadiah atau pengurangan energi.",
      });
  });
  rooms.delete(room.code);
  membership.delete(ws);
}
wss.on("connection", (ws) => {
  let messages = 0;
  const timer = setInterval(() => {
    messages = 0;
  }, 1000);
  ws.on("message", (raw) => {
    if (++messages > 20) {
      ws.close(1008, "Too many messages");
      return;
    }
    try {
      const m = messageSchema.parse(JSON.parse(raw.toString()));
      if (m.type === "leave") {
        leave(ws);
        send(ws, { type: "closed", message: "Kamu keluar dari room." });
        return;
      }
      if (m.type === "create") {
        if (membership.has(ws)) throw Error("Kamu sudah berada di room.");
        if (rooms.size >= 100) throw Error("Server penuh. Coba lagi nanti.");
        let code: string;
        do {
          code = String(randomInt(100000, 1000000));
        } while (rooms.has(code));
        const room: Room = {
          code,
          clients: [ws],
          teams: [m.team],
          normalize: m.normalize,
          actions: new Map(),
          updated: Date.now(),
        };
        rooms.set(code, room);
        membership.set(ws, room);
        broadcast(room);
        return;
      }
      if (m.type === "join") {
        if (membership.has(ws))
          throw Error("Keluar dari room sebelumnya dahulu.");
        const room = rooms.get(m.code);
        if (!room || room.clients.length !== 1)
          throw Error("Room tidak ditemukan atau sudah penuh.");
        room.clients.push(ws);
        room.teams.push(m.team);
        membership.set(ws, room);
        const teams = room.teams.map((t) =>
          t.map((mon) => ({
            ...mon,
            level: room.normalize ? BALANCE.duelLevel : mon.level,
          })),
        );
        room.battle = createBattle("duel", teams[0], teams[1]);
        room.updated = Date.now();
        broadcast(room);
        return;
      }
      const room = membership.get(ws);
      if (!room?.battle) throw Error("Battle belum dimulai.");
      const side = room.clients.indexOf(ws);
      if (
        m.turn !== room.battle.turn ||
        room.actions.has(side) ||
        !validAction(room.battle, side, m.action)
      )
        throw Error("Aksi tidak valid untuk giliran ini.");
      room.actions.set(side, m.action);
      room.updated = Date.now();
      if (room.actions.size === 2) {
        room.battle = resolveTurn(
          room.battle,
          room.actions.get(0)!,
          room.actions.get(1)!,
        );
        room.actions.clear();
      }
      broadcast(room);
    } catch (e) {
      send(ws, {
        type: "error",
        message:
          e instanceof z.ZodError
            ? "Data room atau tim tidak valid."
            : e instanceof Error
              ? e.message
              : "Permintaan tidak valid.",
      });
    }
  });
  ws.on("close", () => {
    clearInterval(timer);
    leave(ws);
  });
  ws.on("error", () => leave(ws));
});
setInterval(() => {
  for (const r of rooms.values())
    if (Date.now() - r.updated > 30 * 60 * 1000) {
      r.clients.forEach((ws) =>
        send(ws, {
          type: "closed",
          message: "Room kedaluwarsa setelah 30 menit tanpa aktivitas.",
        }),
      );
      r.clients.forEach((ws) => membership.delete(ws));
      rooms.delete(r.code);
    }
}, 60000).unref();
const port = Number(process.env.PORT ?? 3001);
http.listen(port, "0.0.0.0", () => {
  console.log(`Elemonts server: http://localhost:${port}`);
  for (const list of Object.values(networkInterfaces()))
    for (const net of list ?? [])
      if (net.family === "IPv4" && !net.internal)
        console.log(`LAN: http://${net.address}:${port}`);
});

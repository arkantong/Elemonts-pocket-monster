import { t } from "../i18n";
import { useEffect, useRef, useState } from "react";
import { Wifi, Copy, Users } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { useGame } from "../game/context";
import { SPECIES } from "../game/data";
import type { Battle, BattleAction } from "../game/types";
import { BattleScreen } from "./Battle";
import { Portrait } from "../components/ui";
export function Duel() {
  const { save, act, notify } = useGame();
  const [url, setUrl] = useState(save.duelServer),
    [code, setCode] = useState(""),
    [room, setRoom] = useState(""),
    [normalize, setNormalize] = useState(true),
    [status, setStatus] = useState(""),
    [battle, setBattle] = useState<Battle>(),
    [waiting, setWaiting] = useState(false),
    [busy, setBusy] = useState(false),
    [picked, setPicked] = useState(save.team);
  const socket = useRef<WebSocket | undefined>(undefined);
  useEffect(
    () => () => {
      socket.current?.close();
    },
    [],
  );
  const leave = () => {
    socket.current?.close();
    socket.current = undefined;
    setRoom("");
    setBattle(undefined);
    setBusy(false);
    setWaiting(false);
  };
  function connect(kind: "create" | "join") {
    if (!picked.length) {
      notify("Pilih minimal satu monster.");
      return;
    }
    if (kind === "join" && !/^\d{6}$/.test(code)) {
      notify("Masukkan kode room enam angka.");
      return;
    }
    let endpoint: string;
    try {
      if (url.trim()) {
        const u = new URL(url.includes("://") ? url : `http://${url}`);
        if (!["http:", "https:", "ws:", "wss:"].includes(u.protocol))
          throw Error();
        u.protocol = ["https:", "wss:"].includes(u.protocol) ? "wss:" : "ws:";
        u.pathname = "/duel";
        u.search = "";
        u.hash = "";
        endpoint = u.href;
      } else {
        if (Capacitor.isNativePlatform()) {
          notify("Isi alamat server LAN dari komputer di Wi-Fi yang sama.");
          return;
        }
        endpoint = `${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}/duel`;
      }
    } catch {
      notify("Alamat server tidak valid. Contoh: http://192.168.1.10:3001");
      return;
    }
    act({ type: "server", url });
    setBusy(true);
    setStatus("Menghubungkan ke server…");
    socket.current?.close();
    const ws = new WebSocket(endpoint);
    socket.current = ws;
    const timeout = setTimeout(() => {
      if (ws.readyState !== WebSocket.OPEN) {
        ws.close();
        setStatus("Server tidak merespons. Periksa alamat dan Wi-Fi.");
        setBusy(false);
      }
    }, 8000);
    ws.onopen = () => {
      clearTimeout(timeout);
      ws.send(
        JSON.stringify({
          type: kind,
          code,
          normalize,
          team: picked.map((id) => save.monsters.find((m) => m.uid === id)),
        }),
      );
    };
    ws.onmessage = (e) => {
      try {
        const m = JSON.parse(e.data);
        if (m.type === "state") {
          setRoom(m.code);
          setBattle(m.battle);
          setWaiting(m.waiting);
          setBusy(false);
          setStatus(
            m.players === 1 ? "Menunggu teman masuk…" : "Duel terhubung.",
          );
        } else if (m.type === "error") {
          setStatus(m.message);
          setBusy(false);
          setWaiting(false);
          notify(m.message);
        } else if (m.type === "closed") {
          setStatus(m.message);
          setBattle(undefined);
          setRoom("");
          setBusy(false);
          ws.close();
        }
      } catch {
        setStatus("Balasan server tidak valid.");
        ws.close();
      }
    };
    ws.onerror = () => {
      clearTimeout(timeout);
      setBusy(false);
      setStatus(
        "Tidak bisa terhubung. Pastikan server berjalan dan kedua HP berada di Wi-Fi yang sama.",
      );
    };
    ws.onclose = () => {
      clearTimeout(timeout);
      if (socket.current !== ws) return;
      setBusy(false);
      setRoom("");
      setBattle(undefined);
      setWaiting(false);
    };
  }
  function action(a: BattleAction) {
    if (battle && socket.current?.readyState === WebSocket.OPEN) {
      socket.current.send(
        JSON.stringify({ type: "action", turn: battle.turn, action: a }),
      );
      setWaiting(true);
    }
  }
  if (battle)
    return (
      <BattleScreen
        battle={battle}
        onAction={action}
        onFinish={leave}
        waiting={waiting}
        onForfeit={leave}
      />
    );
  return (
    <section className="duel-panel">
      <div className="duel-symbol">
        <Wifi size={45} />
      </div>
      <h2>{t("Teman dekat. Duel seru.")}</h2>
      <p>
        {t(
          "Dua perangkat, satu jaringan Wi-Fi. Gunakan koleksi masing-masing tanpa menghabiskan energi.",
        )}
      </p>
      {t(
        room ? (
          <div className="room-wait">
            <small>{t("Kode room")}</small>
            <strong>{t(room)}</strong>
            <button
              className="button soft"
              onClick={() => {
                if (!navigator.clipboard) {
                  notify(`Kode room: ${room}`);
                  return;
                }
                navigator.clipboard
                  ?.writeText(room)
                  .then(() => notify("Kode room disalin."))
                  .catch(() => notify(`Kode room: ${room}`));
              }}
            >
              <Copy size={17} />
              {t(" Salin kode")}
            </button>
            <p role="status">{t(status)}</p>
            <button className="button soft" onClick={leave}>
              {t("Keluar dari room")}
            </button>
          </div>
        ) : (
          <>
            <label className="field">
              {t("Alamat server LAN")}
              <input
                placeholder={t(
                  Capacitor.isNativePlatform()
                    ? "http://192.168.1.10:3001"
                    : "Kosongkan untuk server game ini",
                )}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </label>
            <p className="small-help">
              {t(
                "Di Android, isi alamat komputer yang menjalankan server Elemonts. Kedua perangkat memakai alamat yang sama.",
              )}
            </p>
            <h3>
              {t("Tim Duel · ")}
              {t(picked.length)}
              {t("/4")}
            </h3>
            <div className="duel-team">
              {t(
                save.monsters.map((m) => (
                  <button
                    key={m.uid}
                    className={picked.includes(m.uid) ? "selected" : ""}
                    aria-pressed={picked.includes(m.uid)}
                    onClick={() =>
                      setPicked((p) =>
                        p.includes(m.uid)
                          ? p.filter((id) => id !== m.uid)
                          : p.length < 4
                            ? [...p, m.uid]
                            : p,
                      )
                    }
                  >
                    <Portrait species={m.species} />
                    <span>{t(SPECIES[m.species].name)}</span>
                    <small>
                      {t("Lv. ")}
                      {t(m.level)}
                    </small>
                  </button>
                )),
              )}
            </div>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={normalize}
                onChange={(e) => setNormalize(e.target.checked)}
              />
              {t(" ")}
              {t("Setarakan level ke 25 di room yang dibuat")}
            </label>
            <p className="small-help">
              {t(
                "Poin stat dan personality tetap. Bonus makanan dan dekorasi tidak berlaku. Room teman mengikuti pengaturan pembuatnya.",
              )}
            </p>
            <button
              className="button primary full"
              disabled={busy}
              onClick={() => connect("create")}
            >
              <Users size={19} />
              {t(" Buat room")}
            </button>
            <div className="join-row">
              <label className="field">
                {t("Kode room teman")}
                <input
                  inputMode="numeric"
                  maxLength={6}
                  placeholder={t("6 angka")}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                />
              </label>
              <button
                className="button soft"
                disabled={busy}
                onClick={() => connect("join")}
              >
                {t("Gabung")}
              </button>
            </div>
            {t(
              status && (
                <p className="notice" role="status">
                  {t(status)}
                </p>
              ),
            )}
          </>
        ),
      )}
    </section>
  );
}

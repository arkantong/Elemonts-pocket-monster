import { useState } from "react";
import {
  Search,
  Lock,
  Plus,
  Heart,
  Zap,
  ArrowRight,
  Check,
} from "lucide-react";
import { useGame } from "../game/context";
import {
  ROSTER,
  SPECIES,
  ELEMENTS,
  NATURES,
  SKILLS,
  learnset,
  BALANCE,
  type Stat,
} from "../game/data";
import { stats } from "../game/battle";
import { spent, energyCap } from "../game/state";
import { Portrait, ElementIcon, Modal, Empty } from "../components/ui";
export function Collection() {
  const { save, act, notify } = useGame();
  const [query, setQuery] = useState(""),
    [filter, setFilter] = useState("Semua"),
    [dex, setDex] = useState(false),
    [selected, setSelected] = useState<string>(),
    [confirm, setConfirm] = useState<{
      type: "sell" | "sacrifice";
      uid: string;
    }>();
  const m = save.monsters.find((m) => m.uid === selected),
    s = m ? SPECIES[m.species] : undefined;
  const entries = dex
    ? ROSTER.map((s) => ({
        key: s.id,
        species: s.id,
        monster: save.monsters.find((m) => m.species === s.id),
      }))
    : save.monsters.map((m) => ({
        key: m.uid,
        species: m.species,
        monster: m,
      }));
  const filtered = entries.filter(
    (x) =>
      SPECIES[x.species].name.toLowerCase().includes(query.toLowerCase()) &&
      (filter === "Semua" || SPECIES[x.species].element === filter),
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Teman-temanmu.</h1>
          <p>
            {save.monsters.length} / {BALANCE.capacity} monster di rumah. Setiap
            teman punya ceritanya.
          </p>
        </div>
        <div className="segmented">
          <button
            className={!dex ? "active" : ""}
            onClick={() => setDex(false)}
          >
            Koleksi
          </button>
          <button className={dex ? "active" : ""} onClick={() => setDex(true)}>
            Ensiklopedia · 37
          </button>
        </div>
      </div>
      <div className="collection-tools">
        <label className="search">
          <Search size={19} />
          <input
            aria-label="Cari monster"
            placeholder="Cari nama monster…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <select
          aria-label="Filter elemen"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option>Semua</option>
          {ELEMENTS.map((e) => (
            <option key={e}>{e}</option>
          ))}
        </select>
      </div>
      <div className="monster-grid">
        {filtered.map(({ key, species, monster }) => {
          const sp = SPECIES[species],
            owned = !!monster;
          return (
            <button
              key={key}
              className={`monster-card ${!owned ? "unowned" : ""}`}
              disabled={!owned}
              onClick={() => setSelected(monster!.uid)}
            >
              <div className="card-top">
                <span>
                  <ElementIcon element={sp.element} />
                  {sp.element}
                </span>
                {sp.category === "Mythical" ? (
                  <Lock size={16} />
                ) : monster && save.team.includes(monster.uid) ? (
                  <span className="in-team">
                    <Check size={13} /> Tim
                  </span>
                ) : (
                  <small>{sp.rarity}</small>
                )}
              </div>
              <Portrait species={species} />
              <h3>{sp.name}</h3>
              <p>
                {monster
                  ? `Level ${monster.level} · ${NATURES[monster.nature].name}`
                  : sp.category === "Mythical"
                    ? "Menanti event mendatang"
                    : "Belum dikoleksi"}
              </p>
              {monster && (
                <div className="card-bottom">
                  <span>
                    <Zap size={14} />
                    {monster.energy}/{energyCap(save, monster)}
                  </span>
                  <span>
                    <Heart size={14} />
                    {monster.intimacy}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
      {!filtered.length && (
        <Empty title="Belum ada teman di sini">
          Coba nama atau elemen lain, atau tangkap monster di Nusaraya.
        </Empty>
      )}
      {m && s && (
        <Modal
          title={s.name}
          onClose={() => {
            setSelected(undefined);
            setConfirm(undefined);
          }}
          wide
        >
          <div className="monster-detail">
            <Portrait species={m.species} />
            <div>
              <span className="element-label">
                <ElementIcon element={s.element} />
                {s.element} · Lv. {m.level} · {s.rarity}
              </span>
              <p>{s.description}</p>
              <p className="muted">
                Personality {NATURES[m.nature].name}: {NATURES[m.nature].up}{" "}
                +10%, {NATURES[m.nature].down} −10%.
              </p>
              <div className="button-row">
                <button
                  className="button primary"
                  onClick={() => act({ type: "team", uid: m.uid })}
                >
                  {save.team.includes(m.uid)
                    ? "Keluarkan dari tim"
                    : "Masukkan ke tim"}
                </button>
                {save.team.includes(m.uid) && (
                  <button
                    className="button soft"
                    onClick={() => {
                      act({ type: "lead", uid: m.uid });
                      notify(`${s.name} menjadi partner.`);
                    }}
                  >
                    Jadikan partner
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="section-heading">
            <h3>Stat pertarungan</h3>
            <span>
              {m.points - spent(m)} poin tersedia / {m.points}
            </span>
          </div>
          <div className="stats-grid">
            {Object.entries(stats(m)).map(([stat, val]) => (
              <div className="stat-tile" key={stat}>
                <small>{stat.toUpperCase()}</small>
                <strong>{val}</strong>
                <span>+{m.allocated[stat as Stat]} poin</span>
                <button
                  aria-label={`Tambah ${stat}`}
                  disabled={spent(m) >= m.points}
                  onClick={() =>
                    act({ type: "stat", uid: m.uid, stat: stat as Stat })
                  }
                >
                  <Plus size={17} />
                </button>
              </div>
            ))}
          </div>
          <button
            className="text-button"
            onClick={() => {
              if (act({ type: "reset", uid: m.uid }))
                notify("Poin stat siap dibagikan ulang.");
            }}
          >
            Gunakan Batu keseimbangan ({save.inventory.reset})
          </button>
          <h3 className="section-space">Tiga skill aktif</h3>
          <div className="skills-editor">
            {m.skills.map((id, slot) => (
              <label key={slot}>
                <small>Slot {slot + 1}</small>
                <select
                  aria-label={`Skill slot ${slot + 1}`}
                  value={id}
                  onChange={(e) =>
                    act({
                      type: "skill",
                      uid: m.uid,
                      slot,
                      skill: e.target.value,
                    })
                  }
                >
                  {learnset(m.species, m.level)
                    .filter((x) => x === id || !m.skills.includes(x))
                    .map((x) => (
                      <option key={x} value={x}>
                        {SKILLS[x].name} · {SKILLS[x].power} power
                      </option>
                    ))}
                </select>
              </label>
            ))}
          </div>
          <p className="muted">
            Skill elemen berikutnya tersedia pada level 10 dan 20.
          </p>
          <div className="evolution-line">
            <span>{s.name}</span>
            <ArrowRight size={17} />
            <strong>
              {s.next
                ? `${SPECIES[s.next].name} · Lv. ${s.evolveAt}`
                : "Bentuk akhir"}
            </strong>
          </div>
          <h3 className="section-space">Perkuat dengan duplikat</h3>
          <p className="muted">
            Korbankan bentuk dasar {SPECIES[s.family].name} di luar tim untuk +2
            poin. Batas total tetap 20.
          </p>
          <div className="donor-list">
            {save.monsters
              .filter(
                (d) =>
                  d.uid !== m.uid &&
                  d.species === s.family &&
                  !save.team.includes(d.uid),
              )
              .map((d) => (
                <button
                  className="button soft"
                  key={d.uid}
                  disabled={m.points >= 20}
                  onClick={() => setConfirm({ type: "sacrifice", uid: d.uid })}
                >
                  {SPECIES[d.species].name} · Lv. {d.level}
                </button>
              ))}
            {!save.monsters.some(
              (d) =>
                d.uid !== m.uid &&
                d.species === s.family &&
                !save.team.includes(d.uid),
            ) && <small>Belum ada duplikat yang tersedia.</small>}
          </div>
          {!save.team.includes(m.uid) && (
            <button
              className="text-button danger"
              onClick={() => setConfirm({ type: "sell", uid: m.uid })}
            >
              Tukar monster ini dengan 75 gold
            </button>
          )}
          {confirm && (
            <div className="confirm-box" role="alert">
              <strong>Monster yang digunakan akan hilang dari koleksi.</strong>
              <div className="button-row">
                <button
                  className="button danger"
                  onClick={() => {
                    const ok =
                      confirm.type === "sell"
                        ? act({ type: "sell", uid: confirm.uid })
                        : act({
                            type: "sacrifice",
                            target: m.uid,
                            donor: confirm.uid,
                          });
                    if (ok) {
                      notify(
                        confirm.type === "sell"
                          ? "Monster ditukar dengan 75 gold."
                          : "Poin stat bertambah.",
                      );
                      if (confirm.type === "sell") setSelected(undefined);
                      setConfirm(undefined);
                    }
                  }}
                >
                  Ya, lanjutkan
                </button>
                <button
                  className="button soft"
                  onClick={() => setConfirm(undefined)}
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}

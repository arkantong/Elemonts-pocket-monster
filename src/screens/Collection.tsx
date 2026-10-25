import { t } from "../i18n";
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
          <h1>{t("Teman-temanmu.")}</h1>
          <p>
            {t(save.monsters.length)}
            {t(" / ")}
            {t(BALANCE.capacity)}
            {t(" monster di rumah. Setiap teman punya ceritanya.")}
          </p>
        </div>
        <div className="segmented">
          <button
            className={!dex ? "active" : ""}
            onClick={() => setDex(false)}
          >
            {t("Koleksi")}
          </button>
          <button className={dex ? "active" : ""} onClick={() => setDex(true)}>
            {t("Ensiklopedia · 37")}
          </button>
        </div>
      </div>
      <div className="collection-tools">
        <label className="search">
          <Search size={19} />
          <input
            aria-label={t("Cari monster")}
            placeholder={t("Cari nama monster…")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <select
          aria-label={t("Filter elemen")}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="Semua">{t("Semua")}</option>
          {t(
            ELEMENTS.map((e) => (
              <option key={e} value={e}>
                {t(e)}
              </option>
            )),
          )}
        </select>
      </div>
      <div className="monster-grid">
        {t(
          filtered.map(({ key, species, monster }) => {
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
                    {t(sp.element)}
                  </span>
                  {t(
                    sp.category === "Mythical" ? (
                      <Lock size={16} />
                    ) : monster && save.team.includes(monster.uid) ? (
                      <span className="in-team">
                        <Check size={13} />
                        {t(" Tim")}
                      </span>
                    ) : (
                      <small>{t(sp.rarity)}</small>
                    ),
                  )}
                </div>
                <Portrait species={species} />
                <h3>{t(sp.name)}</h3>
                <p>
                  {t(
                    monster
                      ? `Level ${monster.level} · ${NATURES[monster.nature].name}`
                      : sp.category === "Mythical"
                        ? "Menanti event mendatang"
                        : "Belum dikoleksi",
                  )}
                </p>
                {t(
                  monster && (
                    <div className="card-bottom">
                      <span>
                        <Zap size={14} />
                        {t(monster.energy)}
                        {t("/")}
                        {t(energyCap(save, monster))}
                      </span>
                      <span>
                        <Heart size={14} />
                        {t(monster.intimacy)}
                      </span>
                    </div>
                  ),
                )}
              </button>
            );
          }),
        )}
      </div>
      {t(
        !filtered.length && (
          <Empty title={t("Belum ada teman di sini")}>
            {t("Coba nama atau elemen lain, atau tangkap monster di Nusaraya.")}
          </Empty>
        ),
      )}
      {t(
        m && s && (
          <Modal
            title={t(s.name)}
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
                  {t(s.element)}
                  {t(" · Lv. ")}
                  {t(m.level)}
                  {t(" · ")}
                  {t(s.rarity)}
                </span>
                <p>{t(s.description)}</p>
                <p className="muted">
                  {t("Personality ")}
                  {t(NATURES[m.nature].name)}
                  {t(": ")}
                  {t(NATURES[m.nature].up)}
                  {t(" ")}
                  {t("+10%, ")}
                  {t(NATURES[m.nature].down)}
                  {t(" −10%.")}
                </p>
                <div className="button-row">
                  <button
                    className="button primary"
                    onClick={() => act({ type: "team", uid: m.uid })}
                  >
                    {t(
                      save.team.includes(m.uid)
                        ? "Keluarkan dari tim"
                        : "Masukkan ke tim",
                    )}
                  </button>
                  {t(
                    save.team.includes(m.uid) && (
                      <button
                        className="button soft"
                        onClick={() => {
                          act({ type: "lead", uid: m.uid });
                          notify(`${s.name} menjadi partner.`);
                        }}
                      >
                        {t("Jadikan partner")}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>
            <div className="section-heading">
              <h3>{t("Stat pertarungan")}</h3>
              <span>
                {t(m.points - spent(m))}
                {t(" poin tersedia / ")}
                {t(m.points)}
              </span>
            </div>
            <div className="stats-grid">
              {t(
                Object.entries(stats(m)).map(([stat, val]) => (
                  <div className="stat-tile" key={stat}>
                    <small>{t(stat.toUpperCase())}</small>
                    <strong>{t(val)}</strong>
                    <span>
                      {t("+")}
                      {t(m.allocated[stat as Stat])}
                      {t(" poin")}
                    </span>
                    <button
                      aria-label={t(`Tambah ${stat}`)}
                      disabled={spent(m) >= m.points}
                      onClick={() =>
                        act({ type: "stat", uid: m.uid, stat: stat as Stat })
                      }
                    >
                      <Plus size={17} />
                    </button>
                  </div>
                )),
              )}
            </div>
            <button
              className="text-button"
              onClick={() => {
                if (act({ type: "reset", uid: m.uid }))
                  notify("Poin stat siap dibagikan ulang.");
              }}
            >
              {t("Gunakan Batu keseimbangan (")}
              {t(save.inventory.reset)}
              {t(")")}
            </button>
            <h3 className="section-space">{t("Tiga skill aktif")}</h3>
            <div className="skills-editor">
              {t(
                m.skills.map((id, slot) => (
                  <label key={slot}>
                    <small>
                      {t("Slot ")}
                      {t(slot + 1)}
                    </small>
                    <select
                      aria-label={t(`Skill slot ${slot + 1}`)}
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
                      {t(
                        learnset(m.species, m.level)
                          .filter((x) => x === id || !m.skills.includes(x))
                          .map((x) => (
                            <option key={x} value={x}>
                              {t(SKILLS[x].name)}
                              {t(" · ")}
                              {t(SKILLS[x].power)}
                              {t(" power")}
                            </option>
                          )),
                      )}
                    </select>
                  </label>
                )),
              )}
            </div>
            <p className="muted">
              {t("Skill elemen berikutnya tersedia pada level 10 dan 20.")}
            </p>
            <div className="evolution-line">
              <span>{t(s.name)}</span>
              <ArrowRight size={17} />
              <strong>
                {t(
                  s.next
                    ? `${SPECIES[s.next].name} · Lv. ${s.evolveAt}`
                    : "Bentuk akhir",
                )}
              </strong>
            </div>
            <h3 className="section-space">{t("Perkuat dengan duplikat")}</h3>
            <p className="muted">
              {t("Korbankan bentuk dasar ")}
              {t(SPECIES[s.family].name)}
              {t(" di luar tim untuk +2 poin. Batas total tetap 20.")}
            </p>
            <div className="donor-list">
              {t(
                save.monsters
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
                      onClick={() =>
                        setConfirm({ type: "sacrifice", uid: d.uid })
                      }
                    >
                      {t(SPECIES[d.species].name)}
                      {t(" · Lv. ")}
                      {t(d.level)}
                    </button>
                  )),
              )}
              {t(
                !save.monsters.some(
                  (d) =>
                    d.uid !== m.uid &&
                    d.species === s.family &&
                    !save.team.includes(d.uid),
                ) && <small>{t("Belum ada duplikat yang tersedia.")}</small>,
              )}
            </div>
            {t(
              !save.team.includes(m.uid) && (
                <button
                  className="text-button danger"
                  onClick={() => setConfirm({ type: "sell", uid: m.uid })}
                >
                  {t("Tukar monster ini dengan 75 gold")}
                </button>
              ),
            )}
            {t(
              confirm && (
                <div className="confirm-box" role="alert">
                  <strong>
                    {t("Monster yang digunakan akan hilang dari koleksi.")}
                  </strong>
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
                      {t("Ya, lanjutkan")}
                    </button>
                    <button
                      className="button soft"
                      onClick={() => setConfirm(undefined)}
                    >
                      {t("Batal")}
                    </button>
                  </div>
                </div>
              ),
            )}
          </Modal>
        ),
      )}
    </>
  );
}

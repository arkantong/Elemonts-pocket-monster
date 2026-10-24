import { useState } from "react";
import {
  Package,
  Utensils,
  Leaf,
  Coins,
  Ticket,
  Heart,
  RotateCcw,
} from "lucide-react";
import { ITEMS, type ItemId } from "../game/data";
import { useGame } from "../game/context";
export function Shop() {
  const { save, act, notify } = useGame(),
    [filter, setFilter] = useState("Semua");
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Bekal untuk cerita berikutnya.</h1>
          <p>Makanan, kapsul, dan sedikit kenyamanan untuk rumah.</p>
        </div>
        <span className="wallet">
          <Coins size={21} />
          {save.gold.toLocaleString("id-ID")}
        </span>
      </div>
      <div className="filter-tabs">
        {["Semua", "Kapsul", "Makanan", "Lainnya"].map((f) => (
          <button
            className={f === filter ? "active" : ""}
            key={f}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="shop-grid">
        {Object.entries(ITEMS)
          .filter(
            ([, i]) =>
              filter === "Semua" ||
              (filter === "Kapsul" && i.type === "capsule") ||
              (filter === "Makanan" && i.type === "food") ||
              (filter === "Lainnya" && !["food", "capsule"].includes(i.type)),
          )
          .map(([id, item]) => {
            const key = id as ItemId,
              Icon =
                item.type === "capsule"
                  ? Package
                  : item.type === "food"
                    ? Utensils
                    : key === "decor"
                      ? Leaf
                      : key === "ticket"
                        ? Ticket
                        : key === "potion"
                          ? Heart
                          : RotateCcw;
            return (
              <article className="shop-item" key={id}>
                <div className={`shop-art ${item.type}`}>
                  <Icon size={40} strokeWidth={1.4} />
                </div>
                <div className="shop-copy">
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <small>
                    {key === "decor" && save.inventory.decor
                      ? "Sudah dimiliki"
                      : `Di tas: ${save.inventory[key]}`}
                  </small>
                </div>
                <button
                  className="button soft"
                  disabled={
                    save.gold < item.price ||
                    (key === "decor" && !!save.inventory.decor)
                  }
                  onClick={() => {
                    if (act({ type: "buy", item: key }))
                      notify(
                        `${item.name} ${key === "ticket" ? "aktif untuk hari ini" : "masuk ke tasmu"}.`,
                      );
                  }}
                >
                  <Coins size={17} />
                  {item.price}
                </button>
              </article>
            );
          })}
      </div>
      {!!save.inventory.decor && (
        <div className="mail-strip">
          <Leaf size={28} />
          <div>
            <h3>Kebun embun</h3>
            <p>Berlaku untuk tim empat monster. Bonus tidak aktif saat Duel.</p>
          </div>
          <button
            className="button primary"
            onClick={() => act({ type: "decor" })}
          >
            {save.decor ? "Simpan dekorasi" : "Pasang di rumah"}
          </button>
        </div>
      )}
      <p className="quiet-note">
        Pembelian dengan uang sungguhan belum tersedia. Semua harga di sini
        memakai gold permainan.
      </p>
    </>
  );
}

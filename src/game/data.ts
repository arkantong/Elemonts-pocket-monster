export const ELEMENTS = [
  "Api",
  "Air",
  "Listrik",
  "Tanah",
  "Netral",
  "Holy",
  "Dark",
] as const;
export type Element = (typeof ELEMENTS)[number];
export type Stat = "hp" | "attack" | "defense" | "speed";
export type Stats = Record<Stat, number>;
export type Species = {
  id: string;
  name: string;
  element: Element;
  family: string;
  stage: number;
  category: "Starter" | "Wild" | "Mythical";
  rarity: "Umum" | "Tidak umum" | "Langka" | "Sangat langka";
  next?: string;
  evolveAt?: number;
  shape: string;
  description: string;
  base: Stats;
};
export const COLORS: Record<Element, string> = {
  Api: "#d95c29",
  Air: "#238ba6",
  Listrik: "#b58516",
  Tanah: "#877052",
  Netral: "#8c6fa0",
  Holy: "#bf9f47",
  Dark: "#535178",
};
const families: [
  string[],
  Element,
  Species["category"],
  Species["rarity"],
  string,
  string,
][] = [
  [
    ["Pyroo", "Pyroar", "Infernox"],
    "Api",
    "Starter",
    "Langka",
    "cub",
    "Api kecil dengan semangat besar. Selalu penasaran pada hal baru.",
  ],
  [
    ["Croobit", "Rivaclaw", "Hydragon"],
    "Air",
    "Starter",
    "Langka",
    "croc",
    "Teman tenang yang paling bahagia di tepi sungai.",
  ],
  [
    ["Voltavi", "Voltusk", "Voltitan"],
    "Listrik",
    "Starter",
    "Langka",
    "elephant",
    "Langkah kecilnya menyimpan percikan energi.",
  ],
  [
    ["Pebblit", "Rockhorn", "Terragorn"],
    "Tanah",
    "Starter",
    "Langka",
    "rhino",
    "Sahabat pemberani dengan hati selembut lumut.",
  ],
  [
    ["Mippo", "Pluffluff", "Pufflare"],
    "Netral",
    "Starter",
    "Langka",
    "rabbit",
    "Bulu lembut, telinga panjang, dan rasa ingin tahu yang besar.",
  ],
  [
    ["Boarlit", "Magboar"],
    "Api",
    "Wild",
    "Tidak umum",
    "boar",
    "Mencari buah hangat di bawah tanah Nusaraya.",
  ],
  [
    ["Flicklet", "Dawnphoenix"],
    "Api",
    "Wild",
    "Umum",
    "bird",
    "Menyambut pagi dengan sayap sehangat matahari.",
  ],
  [
    ["Seabbi", "Marilune"],
    "Air",
    "Wild",
    "Tidak umum",
    "rabbit",
    "Mengumpulkan kerang di sepanjang sungai.",
  ],
  [
    ["Jellun", "Pelaglow"],
    "Air",
    "Wild",
    "Umum",
    "jelly",
    "Cahaya lembut yang menari mengikuti arus.",
  ],
  [
    ["Sparko", "Luxerion"],
    "Listrik",
    "Wild",
    "Tidak umum",
    "cub",
    "Lincah berlari di antara padang dan pepohonan.",
  ],
  [
    ["Buzzbit", "Thundrax"],
    "Listrik",
    "Wild",
    "Umum",
    "bug",
    "Dengung kecilnya membawa kabar dari hutan.",
  ],
  [
    ["Pebblisk", "Georoll"],
    "Tanah",
    "Wild",
    "Tidak umum",
    "rhino",
    "Beristirahat di batu yang hangat sepanjang siang.",
  ],
  [
    ["Dribble", "Burrowox"],
    "Tanah",
    "Wild",
    "Umum",
    "boar",
    "Ahli membuat terowongan dengan kaki mungilnya.",
  ],
  [
    ["Aurapaw", "Swifttail"],
    "Netral",
    "Wild",
    "Umum",
    "cub",
    "Menjelajah dengan langkah ringan dan ekor ceria.",
  ],
  [
    ["Mallow", "Hoplet"],
    "Netral",
    "Wild",
    "Umum",
    "rabbit",
    "Melompat di rerumputan saat embun mulai turun.",
  ],
  [
    ["Aurelyth"],
    "Holy",
    "Mythical",
    "Sangat langka",
    "bird",
    "Penjaga cahaya yang menanti sebuah perayaan.",
  ],
  [
    ["Noxarion"],
    "Dark",
    "Mythical",
    "Sangat langka",
    "cub",
    "Penjaga malam yang hadir pada waktu istimewa.",
  ],
];
export const ROSTER: Species[] = families.flatMap(
  ([names, element, category, rarity, shape, description], i) =>
    names.map((name, j) => ({
      id: name.toLowerCase(),
      name,
      element,
      category,
      rarity,
      family: names[0].toLowerCase(),
      stage: j + 1,
      next: names[j + 1]?.toLowerCase(),
      evolveAt: names[j + 1]
        ? category === "Starter"
          ? j === 0
            ? 16
            : 32
          : 22
        : undefined,
      shape,
      description,
      base: {
        hp: 35 + j * 14 + (i % 4) * 3,
        attack: 14 + j * 9 + (i % 3) * 2,
        defense: 12 + j * 8 + ((i + 1) % 4) * 2,
        speed: 12 + j * 6 + ((i + 2) % 5) * 2,
      },
    })),
);
export const SPECIES = Object.fromEntries(
  ROSTER.map((s) => [s.id, s]),
) as Record<string, Species>;
export const STARTERS = ROSTER.filter(
  (s) => s.category === "Starter" && s.stage === 1,
);
export type Skill = {
  id: string;
  name: string;
  element: Element;
  power: number;
  accuracy: number;
  pp: number;
  learn: number;
  effect?: "burn" | "slow" | "guard";
};
export const SKILLS: Record<string, Skill> = {
  tackle: {
    id: "tackle",
    name: "Terjang",
    element: "Netral",
    power: 32,
    accuracy: 100,
    pp: 20,
    learn: 1,
  },
  guard: {
    id: "guard",
    name: "Bertahan",
    element: "Netral",
    power: 0,
    accuracy: 100,
    pp: 8,
    learn: 1,
    effect: "guard",
  },
  struggle: {
    id: "struggle",
    name: "Usaha terakhir",
    element: "Netral",
    power: 20,
    accuracy: 100,
    pp: 99,
    learn: 1,
  },
};
const moveNames: Record<Element, string[]> = {
  Api: ["Percik bara", "Lidah api", "Badai bara"],
  Air: ["Gelembung", "Arus deras", "Gelombang"],
  Listrik: ["Percikan", "Sengatan", "Halilintar"],
  Tanah: ["Lempar batu", "Guncangan", "Retak bumi"],
  Netral: ["Sentakan", "Hantam", "Tabrak kuat"],
  Holy: ["Sinar pagi", "Cahaya suci", "Fajar agung"],
  Dark: ["Bayangan", "Kabut malam", "Gerhana"],
};
for (const element of ELEMENTS)
  moveNames[element].forEach((name, i) => {
    const id = `${element}-${i}`;
    SKILLS[id] = {
      id,
      name,
      element,
      power: [40, 55, 75][i],
      accuracy: [100, 95, 85][i],
      pp: [12, 8, 5][i],
      learn: [1, 10, 20][i],
      effect:
        i > 0
          ? element === "Api"
            ? "burn"
            : element === "Listrik"
              ? "slow"
              : undefined
          : undefined,
    };
  });
export const learnset = (species: string, level: number) => [
  "tackle",
  "guard",
  ...Object.values(SKILLS)
    .filter(
      (s) =>
        s.element === SPECIES[species].element &&
        s.id !== "tackle" &&
        s.id !== "guard" &&
        s.id !== "struggle" &&
        s.learn <= level,
    )
    .map((s) => s.id),
];
export const NATURES = [
  { name: "Berani", up: "attack", down: "speed" },
  { name: "Lincah", up: "speed", down: "defense" },
  { name: "Tangguh", up: "defense", down: "attack" },
  { name: "Hangat", up: "hp", down: "speed" },
] as const;
export const BALANCE = {
  maxLevel: 60,
  capacity: 120,
  baseEnergy: 20,
  recoveryMs: 3600000,
  duelLevel: 25,
  duplicatePoints: 2,
  trainerLimit: 5,
  gymLevels: [10, 18, 26, 34, 42, 50],
  gymIntimacy: [5, 10, 15, 20, 25, 30],
  captureBase: 0.32,
  winGold: 35,
  trainerGold: 100,
};
export const ITEMS = {
  moco: {
    name: "Mococapsule",
    price: 45,
    description: "Kapsul dasar untuk teman baru.",
    type: "capsule",
  },
  prime: {
    name: "Primecapsule",
    price: 110,
    description: "Peluang tangkap 1,5× kapsul dasar.",
    type: "capsule",
  },
  element: {
    name: "Elemencapsule",
    price: 180,
    description: "Bonus 2× jika elemen partner sama dengan target.",
    type: "capsule",
  },
  genesis: {
    name: "Genesiscapsule",
    price: 650,
    description: "Peluang tangkap 3× kapsul dasar.",
    type: "capsule",
  },
  exp: {
    name: "Beri matahari",
    price: 70,
    description: "Memberikan 120 EXP kepada satu monster.",
    type: "food",
  },
  intimacy: {
    name: "Biskuit sayang",
    price: 55,
    description: "Menambah 5 intimasi.",
    type: "food",
  },
  energy: {
    name: "Sari embun",
    price: 90,
    description: "Memulihkan 5 energi.",
    type: "food",
  },
  rare: {
    name: "Buah pelangi",
    price: 160,
    description: "Peluang encounter langka 2× selama 10 menit.",
    type: "food",
  },
  counter: {
    name: "Daun penuntun",
    price: 100,
    description:
      "Selama 10 menit, peluang bertemu elemen yang unggul atas partner 2×.",
    type: "food",
  },
  potion: {
    name: "Ramuan pulih",
    price: 60,
    description: "Pulihkan 35 HP saat battle. Menggunakan satu giliran.",
    type: "battle",
  },
  reset: {
    name: "Batu keseimbangan",
    price: 200,
    description: "Bagikan ulang poin stat yang sudah dimiliki.",
    type: "utility",
  },
  ticket: {
    name: "Tiket latihan",
    price: 150,
    description: "Tambahkan satu kesempatan Trainer hari ini.",
    type: "utility",
  },
  decor: {
    name: "Kebun embun",
    price: 400,
    description:
      "Tim mendapat +5 kapasitas energi dan pemulihan tiap 45 menit.",
    type: "decor",
  },
} as const;
export type ItemId = keyof typeof ITEMS;

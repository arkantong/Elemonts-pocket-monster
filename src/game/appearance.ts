import designs from "./appearance.json" with { type: "json" };
export const APPEARANCE = Object.fromEntries(designs.map((a) => [a.id, a]));

/** The concept-sheet art is shared by Home, the catalogue and GDevelop. */
export const CONCEPT_MONSTERS = new Set(["pyroo", "croobit", "voltavi", "mippo"]);
export function monsterPortrait(species: string) {
  return CONCEPT_MONSTERS.has(species)
    ? `/art/monsters-2d/${species}-home.png`
    : `/art/monsters/${species}.png`;
}

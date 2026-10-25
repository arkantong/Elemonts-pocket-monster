import { afterEach, describe, expect, it } from "vitest";
import { t, setTranslationLanguage } from "../src/i18n";
import { ROSTER, ITEMS, SKILLS, ELEMENTS, NATURES } from "../src/game/data";

afterEach(() => setTranslationLanguage("en"));
describe("language display boundary", () => {
  it("translates all monster descriptions, elemental labels, natures, items and skills", () => {
    setTranslationLanguage("en");
    for (const value of [
      ...ROSTER.map((x) => x.description),
      ...Object.values(ITEMS).flatMap((x) => [x.description]),
      ...Object.values(SKILLS).map((x) => x.name),
      ...ELEMENTS.filter((x) => !["Holy", "Dark"].includes(x)),
      ...NATURES.map((x) => x.name),
    ])
      expect(t(value), value).not.toBe(value);
  });
  it("translates composed battle logs and leaves names and data intact", () => {
    expect(t("Pyroo memakai Percik bara: 24 damage. Sangat efektif!")).toBe(
      "Pyroo used Ember spark: 24 damage. Super effective!",
    );
    expect(t("Croobit siap bertarung.")).toBe("Croobit is ready to battle.");
    expect(t("Pyroo KO karena terbakar.")).toBe("Pyroo fainted from a burn.");
    const data = { species: "pyroo", element: "Api" };
    expect(t(data)).toBe(data);
    expect(t("Pyroo")).toBe("Pyroo");
    setTranslationLanguage("id");
    expect(t("Api")).toBe("Api");
    expect(t("Croobit siap bertarung.")).toBe("Croobit siap bertarung.");
  });
});

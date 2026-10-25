import { describe, it, expect } from "vitest";
import { ROSTER } from "../src/game/data";
import { creature, APPEARANCE } from "../src/components/creatures";
import { Box3, Mesh } from "three";
import { readFileSync } from "node:fs";

describe("visual roster supplied in Daftar Monster", () => {
  it("covers every playable and mythical form with a distinct renderable model and portrait", () => {
    expect(Object.keys(APPEARANCE).sort()).toEqual(
      ROSTER.map((s) => s.id).sort(),
    );
    const meshes = new Set<string>();
    for (const species of ROSTER) {
      const model = creature(species.id);
      const bounds = new Box3().setFromObject(model);
      expect(bounds.max.y - bounds.min.y).toBeCloseTo(2.3);
      expect(bounds.min.y).toBeCloseTo(0);
      expect(bounds.max.x - bounds.min.x).toBeLessThan(3.5);
      model.traverse((o) => {
        if (o instanceof Mesh)
          expect(o.geometry.attributes.position.count).toBeGreaterThan(0);
      });
      const signature = model.children.map((o) => o.toJSON().object);
      meshes.add(
        JSON.stringify([
          APPEARANCE[species.id].palette,
          signature.map((o) => [o.matrix, o.type]),
        ]),
      );
      expect(
        readFileSync(`public/art/monsters/${species.id}.png`)
          .subarray(1, 4)
          .toString(),
      ).toBe("PNG");
      model.traverse((o) => {
        if (o instanceof Mesh) {
          o.geometry.dispose();
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) =>
            m.dispose(),
          );
        }
      });
    }
    expect(meshes.size).toBe(37);
  });
  it("uses visual types from the sheet without changing battle elements", () => {
    expect(APPEARANCE.voltavi.shape).toBe("bird");
    expect(APPEARANCE.mippo.shape).toBe("hippo");
    expect(APPEARANCE.pelaglow.shape).toBe("fish");
    expect(ROSTER.find((s) => s.id === "pluffluff")!.element).toBe("Netral");
    expect(ROSTER.find((s) => s.id === "flicklet")!.element).toBe("Api");
    expect(ROSTER.find((s) => s.id === "dribble")!.element).toBe("Tanah");
  });
});

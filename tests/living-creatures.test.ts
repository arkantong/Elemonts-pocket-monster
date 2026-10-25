import { expect, it } from 'vitest';
import { creature, APPEARANCE } from '../src/components/creatures';
import { animateLivingCreature } from '../src/components/livingCreatures';

it('keeps art identities and animates joints without displacing battle actors', () => {
  for (const id of ['pyroo', 'pyroar', 'infernox', 'mippo']) {
    const model = creature(id), position = model.position.clone(), rig = model.userData.living;
    expect(model.userData.appearance).toEqual(APPEARANCE[id]);
    animateLivingCreature(model, 800, false);
    expect(rig.body.scale.y).not.toBe(1);
    expect(model.position.equals(position)).toBe(true);
    animateLivingCreature(model, 1800, true);
    expect(rig.body.scale.y).toBe(1);
    expect(rig.head.rotation.x).toBe(0);
    expect(rig.eyes[0].scale.y).toBe(1);
    animateLivingCreature(model, 2400, false, true);
    expect(rig.body.scale.y).toBe(1);
    expect(rig.eyes[0].scale.y).toBe(.12);
    expect(rig.tails.every((tail: {rotation:{z:number}}) => tail.rotation.z === 0)).toBe(true);
  }
});
it('keeps Infernox three lantern tails and a visible blink cycle', () => {
  const model = creature('infernox');
  expect(model.userData.living.tails).toHaveLength(3);
  animateLivingCreature(model, 80, false);
  expect(model.userData.living.eyes[0].scale.y).toBeLessThan(.1);
  animateLivingCreature(model, 300, false);
  expect(model.userData.living.eyes[0].scale.y).toBe(1);
});

import { animateLivingCreature } from "./livingCreatures";
import type { PlayingEvent } from "../game/useBattlePlayback";
import { creature, APPEARANCE } from "./creatures";
import { t } from "../i18n";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SPECIES } from "../game/data";
import { Portrait } from "./ui";
export default function CreatureScene({
  species,
  enemy,
  react = 0,
  room = true,
  event,
  fainted,
}: {
  species: string;
  enemy?: string;
  react?: number;
  room?: boolean;
  event?: PlayingEvent;
  fainted?: [boolean, boolean];
}) {
  const host = useRef<HTMLDivElement>(null),
    reaction = useRef(react),
    [failed, setFailed] = useState(false);
  const animation = useRef<{ event?: PlayingEvent; start: number }>({
    start: 0,
  });
  const faint = useRef(fainted);
  faint.current = fainted;
  useEffect(() => {
    animation.current = { event, start: performance.now() };
  }, [event?.key]);
  useEffect(() => {
    reaction.current = react;
  }, [react]);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
    } catch {
      setFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene(),
      camera = new THREE.PerspectiveCamera(33, 1, 0.1, 60);
    camera.position.set(0, 2.1, enemy ? 9.5 : 7);
    camera.lookAt(0, 1, 0);
    scene.add(new THREE.HemisphereLight("#ffefd5", "#52654d", 3));
    const key = new THREE.DirectionalLight("#fff0ce", 3.5);
    key.position.set(-3, 6, 4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);
    const fill = new THREE.DirectionalLight("#b8e7f5", 1.5);
    fill.position.set(4, 2, -2);
    scene.add(fill);
    const ours = creature(species);
    const baseY = ours.position.y;
    const calm = ["Tenang", "Santai", "Pemalu", "Bijak"].includes(
      APPEARANCE[species].character,
    );
    ours.position.set(enemy ? -1.15 : 0, baseY, enemy ? 1.7 : 0);
    ours.rotation.y = enemy ? 2.65 : -0.13;
    scene.add(ours);
    let theirs: THREE.Group | undefined;
    if (enemy) {
      theirs = creature(enemy);
      theirs.position.set(1.1, theirs.position.y, -1.7);
      theirs.rotation.y = -0.58;
      scene.add(theirs);
    }
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(15, 15),
      new THREE.ShadowMaterial({ opacity: 0.2 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.02;
    floor.receiveShadow = true;
    scene.add(floor);
    const resize = () => {
      const w = el.clientWidth,
        h = el.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / Math.max(1, h);
      camera.position.z = enemy ? (w / h < 1 ? 12 : 9.5) : 7;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    resize();
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const enemyY = theirs?.position.y ?? 0;
    let frame = 0,
      last = 0,
      oldReaction = reaction.current,
      reactAt = -10000;
    const tick = (t: number) => {
      frame = requestAnimationFrame(tick);
      if (document.hidden || t - last < 32) return;
      last = t;
      if (oldReaction !== reaction.current) {
        reactAt = t;
        oldReaction = reaction.current;
      }
      const bounce = Math.max(0, 1 - (t - reactAt) / 700);
      ours.position.y =
        baseY +
        (reduced
          ? 0
          : Math.sin(t * (calm ? 0.001 : 0.002)) * 0.035 +
            Math.sin(bounce * Math.PI) * 0.25);
      ours.rotation.y =
        (enemy ? 2.65 : -0.13) + (reduced ? 0 : Math.sin(t * 0.001) * 0.08);
      if (theirs && !reduced)
        theirs.position.y = enemyY + Math.sin(t * 0.002 + 1) * 0.035;
      if (theirs) {
        const units = [ours, theirs],
          bases = [baseY, enemyY];
        units.forEach((unit, i) => {
          unit.position.x = i === 0 ? -1.15 : 1.1;
          unit.position.z = i === 0 ? 1.7 : -1.7;
          unit.rotation.z = faint.current?.[i] ? (i === 0 ? -0.75 : 0.75) : 0;
          unit.position.y = bases[i] + (faint.current?.[i] ? -0.18 : 0);
        });
        const { event: action, start } = animation.current;
        camera.position.set(0, 4.2, camera.aspect < 1 ? 12 : 10);
        const focus = new THREE.Vector3(0, 0.8, 0);
        if (action && !reduced) {
          const elapsed = t - start,
            p = Math.max(0, Math.min(1, elapsed / action.duration)),
            hit = action.impact / action.duration;
          const caster = units[action.side],
            target = units[1 - action.side],
            direction = action.side === 0 ? 1 : -1;
          const physical =
            action.skill === "tackle" ||
            action.skill === "struggle" ||
            action.skill?.startsWith("Netral-");
          // Smooth push-in and return, preserving the near/far battle axis.
          const emphasis = Math.sin(p * Math.PI);
          camera.position.z -= emphasis * 0.75;
          camera.position.y -= emphasis * 0.3;
          focus.x = caster.position.x * emphasis * 0.18;
          const wind = Math.sin(Math.min(1, p / 0.3) * Math.PI);
          caster.position.x -= direction * wind * 0.16;
          caster.position.z += direction * wind * 0.24;
          caster.rotation.z = -direction * wind * 0.12;
          if (physical && p > 0.25 && p < 0.8) {
            const dash =
              p < hit
                ? THREE.MathUtils.smoothstep(p, 0.25, hit)
                : 1 - THREE.MathUtils.smoothstep(p, hit, 0.8);
            caster.position.x += direction * dash * 1.7;
            caster.position.z -= direction * dash * 2.6;
            caster.position.y += dash * 0.15;
          }
          if (!physical && p < 0.5)
            caster.position.y += Math.sin((p / 0.5) * Math.PI) * 0.16;
          if (p >= hit && !action.missed && action.damage) {
            const recoil = Math.max(0, 1 - (p - hit) / (1 - hit));
            target.position.x += direction * Math.sin(recoil * Math.PI) * 0.25;
            target.position.z -= direction * Math.sin(recoil * Math.PI) * 0.4;
            target.rotation.z = direction * Math.sin(recoil * Math.PI) * 0.22;
            if (action.ko) {
              target.rotation.z = direction * (1 - recoil) * 0.75;
              target.position.y -= 0.18 * (1 - recoil);
            }
            camera.position.x =
              Math.sin(elapsed * 0.06) *
              recoil *
              (action.critical ? 0.08 : 0.025);
          }
        }
        camera.lookAt(focus);
      }
      animateLivingCreature(ours, t, reduced, !!faint.current?.[0]);
      if (theirs)
        animateLivingCreature(theirs, t, reduced, !!faint.current?.[1]);
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) =>
            m.dispose(),
          );
        }
      });
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [species, enemy]);
  return (
    <div
      className={`creature-canvas ${room ? "at-home" : ""}`}
      ref={host}
      role="img"
      aria-label={t(
        `${SPECIES[species].name}${enemy ? ` melawan ${SPECIES[enemy].name}` : ""}, karakter 3D`,
      )}
    >
      {t(
        failed && (
          <div className="fallback-creatures">
            <Portrait species={species} />
            {t(enemy && <Portrait species={enemy} />)}
          </div>
        ),
      )}
    </div>
  );
}

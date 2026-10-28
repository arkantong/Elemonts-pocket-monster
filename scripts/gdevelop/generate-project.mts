import { readFileSync, writeFileSync } from "node:fs";
import { SPECIES } from "../../src/game/data.ts";
import frames from "../../src/game/portraitFrames.json" with { type: "json" };
import conceptFrames from "../../src/game/conceptFrames.json" with { type: "json" };
const concept = ["pyroo", "croobit"];
const resources: any[] = [];
const animationFrames: Record<string, number[]> = {};
const animations: any[] = [];
for (const species of Object.keys(SPECIES)) {
  for (const pose of concept.includes(species)
    ? ["home", "back", "front", "hit"]
    : ["front"]) {
    const name = `${species}:${pose}`;
    const file = concept.includes(species)
      ? `/art/monsters-2d/${species}-${pose}.png`
      : `/art/monsters/${species}.png`;
    const bounds = concept.includes(species)
      ? (conceptFrames as Record<string, number[]>)[`${species}-${pose}`]
      : (frames as any)[species];
    animationFrames[name] = bounds;
    resources.push({
      kind: "image",
      name,
      file,
      smoothed: true,
      userAdded: true,
      metadata: "",
    });
    animations.push({
      name,
      useMultipleDirections: false,
      directions: [
        {
          timeBetweenFrames: 0.12,
          looping: true,
          sprites: [
            {
              image: name,
              points: [],
              originPoint: {
                name: "",
                x: bounds[2] + bounds[4] / 2,
                y: bounds[3] + bounds[5],
              },
              centerPoint: {
                name: "",
                automatic: false,
                x: bounds[2] + bounds[4] / 2,
                y: bounds[3] + bounds[5],
              },
              hasCustomCollisionMask: false,
              customCollisionMask: [],
            },
          ],
        },
      ],
    });
  }
}
resources.push({
  kind: "image",
  name: "Garden",
  file: "/art/battle-garden-2d.png",
  smoothed: true,
  userAdded: true,
  metadata: "",
});
resources.push({
  kind: "image",
  name: "ContactShadow",
  file: "/art/monster-shadow.svg",
  smoothed: true,
  userAdded: true,
  metadata: "",
});
const sprite = (name: string, anims: any[]) => ({
  name,
  type: "Sprite",
  variables: [],
  behaviors: [],
  effects: [],
  animations: anims,
});
const background = sprite("Garden", [
  {
    name: "Garden",
    useMultipleDirections: false,
    directions: [
      {
        timeBetweenFrames: 1,
        looping: true,
        sprites: [
          {
            image: "Garden",
            points: [],
            originPoint: { name: "", x: 0, y: 0 },
            centerPoint: { name: "", automatic: true, x: 0, y: 0 },
            hasCustomCollisionMask: false,
            customCollisionMask: [],
          },
        ],
      },
    ],
  },
]);
const shadow = sprite("PartnerShadow", [
  {
    ...background.animations[0],
    name: "ContactShadow",
    directions: [
      {
        ...background.animations[0].directions[0],
        sprites: [
          {
            ...background.animations[0].directions[0].sprites[0],
            image: "ContactShadow",
          },
        ],
      },
    ],
  },
]);
const instance = (
  name: string,
  x: number,
  y: number,
  width: number,
  height: number,
  zOrder: number,
  animationName: string,
) => ({
  name,
  x,
  y,
  zOrder,
  angle: 0,
  layer: "",
  customSize: true,
  width,
  height,
  numberProperties: [
    {
      name: "animation",
      value: ["Garden", "ContactShadow"].includes(animationName)
        ? 0
        : animations.findIndex((a) => a.name === animationName),
    },
  ],
  stringProperties: [],
  initialVariables: [],
  persistentUuid: `elemonts-${name}`,
});
const eventSource = readFileSync("scripts/gdevelop/battle-events.js", "utf8");
const project: any = {
  gdVersion: { build: 0, major: 5, minor: 6, revision: 0 },
  firstLayout: "BattleGarden",
  properties: {
    name: "Elemonts · 2D Battle Garden",
    description:
      "2D visual scene; live battle rules and saves are owned by the Elemonts app.",
    author: "Elemonts",
    authorUsernames: [],
    projectUuid: "343f9b9b-7840-4bd6-95c4-d19d3d25e960",
    platforms: [{ name: "GDevelop JS platform" }],
    currentPlatform: "GDevelop JS platform",
    platformSpecificAssets: {},
    version: "0.1.19",
    windowWidth: 960,
    windowHeight: 1200,
    maxFPS: 60,
    minFPS: 15,
    verticalSync: true,
    sizeOnStartupMode: "adaptWidth",
    adaptGameResolutionAtRuntime: false,
    orientation: "portrait",
    scaleMode: "linear",
    pixelsRounding: false,
    antialiasingMode: "MSAA",
    antialisingEnabledOnMobile: false,
    sceneResourcesPreloading: "at-startup",
    sceneResourcesUnloading: "never",
    watermark: { showWatermark: false, placement: "bottom-left" },
    loadingScreen: {
      showGDevelopSplash: false,
      showProgressBar: false,
      backgroundImageResourceName: "Garden",
      backgroundColor: 6976614,
      backgroundFadeInDuration: 0,
      logoAndProgressFadeInDuration: 0,
      logoAndProgressLogoFadeInDelay: 0,
      minDuration: 0,
      progressBarColor: 11967449,
      progressBarHeight: 10,
      progressBarMaxWidth: 200,
      progressBarMinWidth: 40,
      progressBarWidthPercent: 40,
    },
  },
  resources: { resources, resourceFolders: [] },
  objects: [],
  objectsGroups: [],
  variables: [],
  layouts: [
    {
      name: "BattleGarden",
      mangledName: "BattleGarden",
      title: "Elemonts · 2D",
      r: 106,
      v: 148,
      b: 102,
      standardSortMethod: true,
      stopSoundsOnStartup: false,
      disableInputWhenNotFocused: false,
      renderer3DWorldScale: 100,
      objectsGroups: [],
      variables: [],
      behaviorsSharedData: [],
      layers: [
        {
          name: "",
          visibility: true,
          effects: [],
          renderingType: "2d",
          cameraType: "orthographic",
          ambientLightColorR: 200,
          ambientLightColorG: 200,
          ambientLightColorB: 200,
          cameras: [
            {
              defaultSize: true,
              defaultViewport: true,
              width: 0,
              height: 0,
              viewportLeft: 0,
              viewportRight: 1,
              viewportTop: 0,
              viewportBottom: 1,
            },
          ],
        },
      ],
      objects: [
        background,
        shadow,
        { ...shadow, name: "OpponentShadow" },
        sprite("Partner", animations),
        sprite("Opponent", animations),
      ],
      instances: [
        instance("Garden", 0, -70, 960, 1440, 0, "Garden"),
        instance("PartnerShadow", 105, 980, 220, 40, 3, "ContactShadow"),
        instance("OpponentShadow", 680, 635, 150, 30, 1, "ContactShadow"),
        instance("Partner", 215, 1000, 365, 365, 4, "pyroo:back"),
        instance("Opponent", 755, 700, 245, 245, 2, "croobit:front"),
      ],
      events: [
        {
          type: "BuiltinCommonInstructions::JsCode",
          inlineCode: [
            ...eventSource.split("\n"),
            `window.ElemontsSpriteFrames = ${JSON.stringify(animationFrames)};`,
            "window.ElemontsBattle.update(runtimeScene);",
          ],
          parameterObjects: "",
          useStrict: true,
        },
      ],
      usedResources: resources.map((r) => ({ name: r.name })),
    },
  ],
  externalEvents: [],
  externalLayouts: [],
  eventsFunctionsExtensions: [],
  externalSourceFiles: [],
  usedResources: [],
};
writeFileSync(
  "public/gdevelop/project-data.js",
  `gdjs.projectData = ${JSON.stringify(project)};\nwindow.ElemontsSpriteFrames = ${JSON.stringify(animationFrames)};\n`,
);
writeFileSync(
  "public/gdevelop/battle-events.js",
  eventSource +
    "\ngdjs.BattleGardenCode = {func: scene => window.ElemontsBattle.update(scene)};\n",
);
// Relative paths keep the editor project portable; runtime uses same-origin asset URLs.
const editable = structuredClone(project);
for (const r of editable.resources.resources) r.file = "../../public" + r.file;
writeFileSync(
  "design/gdevelop/elemonts-battle.json",
  JSON.stringify(editable, null, 2) + "\n",
);
console.log(
  `Generated GDevelop scene: ${resources.length} resources, ${animations.length} character poses`,
);

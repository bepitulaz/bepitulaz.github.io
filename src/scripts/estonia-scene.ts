// estonia-scene.ts — Cinematic Three.js Estonia nature scene.
// Composition mirrors the real Tallinn coastline where aurora is watched
// (Russalka / Pirita): dark pine headlands framing a calm Baltic sea,
// layered forest silhouettes, a distant island (Naissaar), and aurora
// curtains in the sky. Four seasons crossfade smoothly; particle motion
// is fully GPU-driven.

import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export type SeasonKey = "winter" | "spring" | "summer" | "autumn";

export interface SeasonParams {
  // Sky
  zenith: string;
  horizon: string;
  auroraA: string;
  auroraB: string;
  auroraIntensity: number;
  auroraSpeed: number;
  auroraCoverage: number;
  starIntensity: number;
  discColor: string; // moon (winter/spring/autumn) or midnight sun (summer)
  discElev: number; // radians above horizon
  discAzim: number; // radians, 0 = straight ahead (-z)
  discSize: number; // angular radius
  discGlow: number; // glow exponent
  // Water
  waterDeep: string;
  waterShallow: string;
  // Atmosphere
  fogColor: string;
  fogDensity: number;
  // Land silhouettes
  forestNear: string;
  forestMid: string;
  forestFar: string;
  groundNear: string;
  groundFar: string;
  // Particles (snow / petals / fireflies / leaves)
  particleA: string;
  particleB: string;
  particleOpacity: number;
  particleFall: number;
  particleSway: number;
  particleSize: number;
  particleYMin: number;
  particleYRange: number;
  particleTwinkle: number;
}

// ─── Season palettes ─────────────────────────────────────────────────────────
// Grounded in the real thing: green/teal/violet aurora over dark water
// (winter), violet-teal dusk with drifting petals (spring), the never-setting
// midnight sun low over a golden sea (summer), wind, rust and falling leaves
// (autumn).

const SEASONS: Record<SeasonKey, SeasonParams> = {
  winter: {
    zenith: "#040a18",
    horizon: "#10263e",
    auroraA: "#2effa0",
    auroraB: "#37d9e8",
    auroraIntensity: 1.35,
    auroraSpeed: 0.5,
    auroraCoverage: 0.9,
    starIntensity: 1.0,
    discColor: "#eef6ff",
    discElev: 0.72,
    discAzim: -0.42,
    discSize: 0.03,
    discGlow: 220,
    waterDeep: "#050d1a",
    waterShallow: "#0e2440",
    fogColor: "#0a1a2c",
    fogDensity: 0.0102,
    forestNear: "#060d18",
    forestMid: "#0a1826",
    forestFar: "#0f2334",
    groundNear: "#d8e6f2",
    groundFar: "#9fc0dc",
    particleA: "#ffffff",
    particleB: "#cfe2ff",
    particleOpacity: 0.95,
    particleFall: 3.4,
    particleSway: 0.55,
    particleSize: 2.3,
    particleYMin: 0,
    particleYRange: 26,
    particleTwinkle: 0,
  },
  spring: {
    zenith: "#081020",
    horizon: "#33405f",
    auroraA: "#52ffa8",
    auroraB: "#b48aff",
    auroraIntensity: 0.85,
    auroraSpeed: 0.42,
    auroraCoverage: 0.65,
    starIntensity: 0.75,
    discColor: "#f4edff",
    discElev: 0.55,
    discAzim: 0.34,
    discSize: 0.024,
    discGlow: 190,
    waterDeep: "#081628",
    waterShallow: "#16344e",
    fogColor: "#16233a",
    fogDensity: 0.0088,
    forestNear: "#0d2420",
    forestMid: "#123529",
    forestFar: "#1a4a36",
    groundNear: "#1c3a30",
    groundFar: "#16302a",
    particleA: "#ffd9ea",
    particleB: "#fff4e0",
    particleOpacity: 0.8,
    particleFall: 1.0,
    particleSway: 1.05,
    particleSize: 2.0,
    particleYMin: 0,
    particleYRange: 22,
    particleTwinkle: 0.25,
  },
  summer: {
    zenith: "#1a4a63",
    horizon: "#f09a52",
    auroraA: "#63ffb4",
    auroraB: "#ffd27a",
    auroraIntensity: 0.22,
    auroraSpeed: 0.3,
    auroraCoverage: 0.4,
    starIntensity: 0.12,
    discColor: "#ffc26e",
    discElev: 0.085,
    discAzim: 0.22,
    discSize: 0.045,
    discGlow: 80,
    waterDeep: "#0f2a33",
    waterShallow: "#33454b",
    fogColor: "#454a52",
    fogDensity: 0.0075,
    forestNear: "#0b2a1a",
    forestMid: "#103922",
    forestFar: "#175030",
    groundNear: "#1b3d2a",
    groundFar: "#14311f",
    particleA: "#ffe98c",
    particleB: "#c8ff9e",
    particleOpacity: 0.95,
    particleFall: 0.05,
    particleSway: 0.85,
    particleSize: 2.7,
    particleYMin: 0.3,
    particleYRange: 6.5,
    particleTwinkle: 2.6,
  },
  autumn: {
    zenith: "#0c111e",
    horizon: "#6e452c",
    auroraA: "#7dffc8",
    auroraB: "#c084fc",
    auroraIntensity: 0.75,
    auroraSpeed: 0.48,
    auroraCoverage: 0.55,
    starIntensity: 0.65,
    discColor: "#ffc890",
    discElev: 0.4,
    discAzim: -0.5,
    discSize: 0.032,
    discGlow: 150,
    waterDeep: "#0a121d",
    waterShallow: "#241c26",
    fogColor: "#221a1c",
    fogDensity: 0.0092,
    forestNear: "#201209",
    forestMid: "#341c0e",
    forestFar: "#472a16",
    groundNear: "#2a1810",
    groundFar: "#201209",
    particleA: "#ff9c3f",
    particleB: "#d64c1e",
    particleOpacity: 0.9,
    particleFall: 1.7,
    particleSway: 1.6,
    particleSize: 3.1,
    particleYMin: 0,
    particleYRange: 24,
    particleTwinkle: 0,
  },
};

const COLOR_KEYS = [
  "zenith",
  "horizon",
  "auroraA",
  "auroraB",
  "discColor",
  "waterDeep",
  "waterShallow",
  "fogColor",
  "forestNear",
  "forestMid",
  "forestFar",
  "groundNear",
  "groundFar",
  "particleA",
  "particleB",
] as const;

const NUM_KEYS = [
  "auroraIntensity",
  "auroraSpeed",
  "auroraCoverage",
  "starIntensity",
  "discElev",
  "discAzim",
  "discSize",
  "discGlow",
  "fogDensity",
  "particleOpacity",
  "particleFall",
  "particleSway",
  "particleSize",
  "particleYMin",
  "particleYRange",
  "particleTwinkle",
] as const;

type ColorParams = Record<(typeof COLOR_KEYS)[number], THREE.Color>;
type NumParams = Record<(typeof NUM_KEYS)[number], number>;

const TRANSITION_MS = 2400;

// ─── Deterministic RNG (stable forest layout across seasons/visits) ─────────
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Shared GLSL: sky gradient + aurora curtains + stars + moon/sun disc ────
// Used by the sky dome and (mirrored, ripple-distorted) by the water shader,
const SKY_GLSL = /* glsl */ `
uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform vec3 uAuroraA;
uniform vec3 uAuroraB;
uniform float uAuroraIntensity;
uniform float uAuroraSpeed;
uniform float uAuroraCoverage;
uniform float uStarIntensity;
uniform vec3 uDiscColor;
uniform vec3 uDiscDir;
uniform float uDiscSize;
uniform float uDiscGlow;
uniform float uTime;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p = p * 2.03 + vec2(19.7, 7.3);
    a *= 0.55;
  }
  return v;
}

vec3 skyColor(vec3 dir, float withStars) {
  float h = clamp(dir.y, 0.0, 1.0);
  vec3 sky = mix(uHorizon, uZenith, pow(h, 0.62));

  // Stars — twinkling hash-grid points, fading toward the horizon
  if (withStars > 0.5 && uStarIntensity > 0.01 && dir.y > 0.02) {
    vec2 sp = dir.xz / (dir.y + 0.35) * 28.0;
    vec2 cell = floor(sp);
    vec2 f = fract(sp);
    float hsh = hash21(cell);
    if (hsh > 0.92) {
      vec2 starPos = vec2(hash21(cell + 7.1), hash21(cell + 3.7));
      float d = length(f - starPos);
      float tw = 0.6 + 0.4 * sin(uTime * (1.5 + hsh * 4.0) + hsh * 40.0);
      float m = smoothstep(0.10, 0.0, d) * tw;
      float horizonFade = smoothstep(0.02, 0.25, dir.y);
      sky += vec3(0.9, 0.95, 1.0) * m * uStarIntensity * horizonFade * 1.3;
    }
  }

  // Aurora curtains — noise-driven bands with vertical ray structure
  if (uAuroraIntensity > 0.005) {
    float u = atan(dir.x, dir.z);
    float v = dir.y;
    vec3 aur = vec3(0.0);
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      float drift = uTime * uAuroraSpeed * (0.35 + fi * 0.14);
      float base = 0.28 + fi * 0.16;
      float wob = fbm(vec2(u * (1.6 + fi * 0.7) + drift * 0.32, fi * 13.7)) - 0.5;
      float bandY = base + wob * (0.16 + fi * 0.05) + uAuroraCoverage * 0.18;
      float d = v - bandY;
      float band = exp(-d * d * 46.0) * smoothstep(-0.55, -0.05, d);
      float rays = fbm(vec2(u * (9.0 + fi * 4.0) + drift, v * 1.4 - drift * 0.6));
      rays = 0.35 + rays * 0.9;
      float topFade = smoothstep(0.95, 0.35, v);
      float horizFade = smoothstep(0.0, 0.10, v);
      aur += mix(uAuroraA, uAuroraB, clamp(rays - 0.35, 0.0, 1.0))
        * band * rays * topFade * horizFade * (0.5 - fi * 0.12);
    }
    sky += aur * uAuroraIntensity;
  }

  // Moon / midnight-sun disc with soft glow
  float cdl = max(dot(dir, normalize(uDiscDir)), 0.0);
  float ang = acos(clamp(cdl, -1.0, 1.0));
  float disc = smoothstep(uDiscSize, uDiscSize * 0.72, ang);
  float glow = pow(cdl, uDiscGlow) * 0.5;
  sky += uDiscColor * (disc * 1.15 + glow);
  return sky;
}
`;

const DITHER_GLSL = /* glsl */ `
  col += (hash21(gl_FragCoord.xy) - 0.5) / 128.0;
`;

// ─── Scene ───────────────────────────────────────────────────────────────────

interface Tier {
  particles: number;
  dprCap: number;
  waterSeg: number;
  fps: number;
}

function getTier(width: number): Tier {
  if (width >= 1024) return { particles: 900, dprCap: 2, waterSeg: 160, fps: 45 };
  if (width >= 640) return { particles: 520, dprCap: 1.75, waterSeg: 120, fps: 40 };
  return { particles: 300, dprCap: 1.3, waterSeg: 88, fps: 36 };
}

export class EstoniaScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private tier: Tier;
  private clock = new THREE.Clock();

  private skyUniforms: Record<string, THREE.IUniform>;
  private waterUniforms: Record<string, THREE.IUniform>;
  private particleUniforms: Record<string, THREE.IUniform>;
  private forestMats: THREE.MeshBasicMaterial[] = []; // [near, mid, far]
  private groundMats: THREE.MeshBasicMaterial[] = []; // [near, far]
  private islandMat: THREE.MeshBasicMaterial;

  private current: { colors: ColorParams; nums: NumParams };
  private from: { colors: ColorParams; nums: NumParams } | null = null;
  private to: SeasonKey;
  private lookAtY = 5.2;
  private toColors: ColorParams | null = null;
  private transitionStart = 0;
  private transitioning = false;

  private pointer = { x: 0, y: 0 };
  private pointerActive = false;

  private running = false;
  private animId: number | null = null;
  private lastFrame = 0;
  private reducedMotion: boolean;

  private heroMarker: HTMLElement | null = null;
  private wrapper: HTMLElement;

  private onFrameCallback: ((t: number) => void) | null = null;

  private constructor(
    canvas: HTMLCanvasElement,
    wrapper: HTMLElement,
    reducedMotion: boolean,
  ) {
    this.wrapper = wrapper;
    this.reducedMotion = reducedMotion;
    this.tier = getTier(window.innerWidth);

    // Raw color pipeline: every hex below is authored as final screen color,
    // for custom shaders and silhouette materials alike.
    THREE.ColorManagement.enabled = false;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.tier.dprCap));

    this.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1400);
    this.camera.position.set(0, 4.4, 34);

    const w = SEASONS.winter;
    this.current = {
      colors: paramsToColors(w),
      nums: paramsToNums(w),
    };
    this.to = "winter";

    const baseSky = this.makeSkyUniforms();
    this.skyUniforms = baseSky;
    this.waterUniforms = { ...this.makeSkyUniforms(), ...this.makeWaterUniforms() };
    this.particleUniforms = this.makeParticleUniforms();

    this.scene.fog = new THREE.FogExp2(
      this.current.colors.fogColor.getHex(),
      this.current.nums.fogDensity,
    );

    this.buildScene();
    this.applyParams();
    this.attachPointer();
    this.resize();
  }

  static create(
    canvas: HTMLCanvasElement,
    wrapper: HTMLElement,
    reducedMotion: boolean,
  ): EstoniaScene | null {
    try {
      return new EstoniaScene(canvas, wrapper, reducedMotion);
    } catch (e) {
      console.warn("[estonia-scene] WebGL unavailable, falling back to gradient.", e);
      return null;
    }
  }

  // ── Uniform builders ──────────────────────────────────────────────────────

  private makeSkyUniforms(): Record<string, THREE.IUniform> {
    const c = this.current.colors;
    const n = this.current.nums;
    return {
      uZenith: { value: c.zenith.clone() },
      uHorizon: { value: c.horizon.clone() },
      uAuroraA: { value: c.auroraA.clone() },
      uAuroraB: { value: c.auroraB.clone() },
      uAuroraIntensity: { value: n.auroraIntensity },
      uAuroraSpeed: { value: n.auroraSpeed },
      uAuroraCoverage: { value: n.auroraCoverage },
      uStarIntensity: { value: n.starIntensity },
      uDiscColor: { value: c.discColor.clone() },
      uDiscDir: { value: discDirection(n.discElev, n.discAzim) },
      uDiscSize: { value: n.discSize },
      uDiscGlow: { value: n.discGlow },
      uTime: { value: 0 },
    };
  }

  private makeWaterUniforms(): Record<string, THREE.IUniform> {
    const c = this.current.colors;
    const n = this.current.nums;
    return {
      uDeep: { value: c.waterDeep.clone() },
      uShallow: { value: c.waterShallow.clone() },
      uFogColor: { value: c.fogColor.clone() },
      uFogDensity: { value: n.fogDensity },
    };
  }

  private makeParticleUniforms(): Record<string, THREE.IUniform> {
    const c = this.current.colors;
    const n = this.current.nums;
    return {
      uTime: { value: 0 },
      uFall: { value: n.particleFall },
      uSway: { value: n.particleSway },
      uSize: { value: n.particleSize },
      uOpacity: { value: n.particleOpacity },
      uColorA: { value: c.particleA.clone() },
      uColorB: { value: c.particleB.clone() },
      uYMin: { value: n.particleYMin },
      uYRange: { value: n.particleYRange },
      uTwinkle: { value: n.particleTwinkle },
    };
  }

  // ── Scene construction ────────────────────────────────────────────────────

  private buildScene() {
    // Sky dome
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(620, 48, 28),
      new THREE.ShaderMaterial({
        uniforms: this.skyUniforms,
        side: THREE.BackSide,
        depthWrite: false,
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader:
          SKY_GLSL +
          /* glsl */ `
          varying vec3 vDir;
          void main() {
            vec3 col = skyColor(normalize(vDir), 1.0);
            ${DITHER_GLSL}
            gl_FragColor = vec4(col, 1.0);
          }
        `,
      }),
    );
    sky.frustumCulled = false;
    this.scene.add(sky);

    // Sea — vertex-displaced plane; fragment mirrors the sky function
    const waterGeo = new THREE.PlaneGeometry(760, 520, this.tier.waterSeg, Math.round(this.tier.waterSeg * 0.7));
    waterGeo.rotateX(-Math.PI / 2);
    const water = new THREE.Mesh(
      waterGeo,
      new THREE.ShaderMaterial({
        uniforms: this.waterUniforms,
        vertexShader: /* glsl */ `
          uniform float uTime;
          varying vec3 vWorldPos;
          varying vec3 vNormal;

          float wh(vec2 p, float t) {
            float h = 0.0;
            h += sin(dot(p, vec2(0.11, 0.052)) + t * 0.9) * 0.10;
            h += sin(dot(p, vec2(-0.06, 0.14)) + t * 1.25) * 0.06;
            h += sin(dot(p, vec2(0.21, -0.18)) + t * 1.7) * 0.035;
            return h;
          }

          void main() {
            vec3 p = position;
            float e = 0.6;
            float h0 = wh(p.xz, uTime);
            float hx = wh(p.xz + vec2(e, 0.0), uTime);
            float hz = wh(p.xz + vec2(0.0, e), uTime);
            p.y += h0;
            vNormal = normalize(vec3(-(hx - h0) / e, 1.0, -(hz - h0) / e));
            vec4 wp = modelMatrix * vec4(p, 1.0);
            vWorldPos = wp.xyz;
            gl_Position = projectionMatrix * viewMatrix * wp;
          }
        `,
        fragmentShader:
          SKY_GLSL +
          /* glsl */ `
          uniform vec3 uDeep;
          uniform vec3 uShallow;
          uniform vec3 uFogColor;
          uniform float uFogDensity;
          varying vec3 vWorldPos;
          varying vec3 vNormal;

          void main() {
            vec3 viewDir = normalize(cameraPosition - vWorldPos);
            float n1 = vnoise(vWorldPos.xz * 1.4 + vec2(uTime * 0.5, 0.0));
            float n2 = vnoise(vWorldPos.xz * 1.7 - vec2(0.0, uTime * 0.4));
            vec3 rippleN = normalize(vNormal + vec3(n1 - 0.5, 0.0, n2 - 0.5) * 0.22);

            vec3 refl = reflect(-viewDir, rippleN);
            refl.y = abs(refl.y) + 0.02;
            vec3 sky = skyColor(normalize(refl), 0.0);

            float fres = pow(1.0 - max(dot(viewDir, rippleN), 0.0), 3.2);
            vec3 base = mix(uDeep, uShallow, fres * 0.5);
            vec3 col = mix(base, sky, clamp(fres * 1.15, 0.0, 0.9));

            // Glitter path toward the moon / sun
            vec3 g = normalize(reflect(-viewDir, normalize(vNormal + vec3(n1 - 0.5, 0.0, n2 - 0.5) * 0.55)));
            float spec = pow(max(dot(g, normalize(uDiscDir)), 0.0), 340.0);
            col += uDiscColor * spec * 1.6;

            float dist = distance(cameraPosition, vWorldPos);
            float fogF = 1.0 - exp(-pow(uFogDensity * dist, 2.0));
            col = mix(col, uFogColor, clamp(fogF, 0.0, 1.0));
            ${DITHER_GLSL}
            gl_FragColor = vec4(col, 1.0);
          }
        `,
      }),
    );
    water.position.set(0, 0, -170);
    this.scene.add(water);

    // Land silhouettes — headlands, far shore, islands (Naissaar)
    const bankGeo = new THREE.SphereGeometry(1, 24, 16);
    this.groundMats = [
      new THREE.MeshBasicMaterial({ color: this.current.colors.groundNear.clone() }),
      new THREE.MeshBasicMaterial({ color: this.current.colors.groundFar.clone() }),
    ];
    this.islandMat = new THREE.MeshBasicMaterial({ color: this.current.colors.forestFar.clone() });

    const banks: Array<[number, number, number, number, number, number, number]> = [
      // [x, y, z, sx, sy, sz, matIndex]
      [-31, -3.4, 14, 34, 6.5, 30, 0], // near left headland
      [31, -3.2, 16, 32, 6.0, 28, 0], // near right headland
      [-54, -3.8, -72, 30, 5.5, 44, 0], // mid left grove bank
      [52, -4.0, -86, 28, 5.0, 40, 0], // mid right grove bank
      [2, -5.6, 25, 48, 6.4, 18, 0], // foreground shoreline — the visitor's feet
    ];
    for (const [x, y, z, sx, sy, sz, mi] of banks) {
      const m = new THREE.Mesh(bankGeo, this.groundMats[mi]);
      m.position.set(x, y, z);
      m.scale.set(sx, sy, sz);
      this.scene.add(m);
    }

    const islands: Array<[number, number, number, number, number, number]> = [
      [-72, 0.4, -175, 17, 4.2, 6],
      [58, -0.3, -196, 11, 2.6, 4.5],
    ];
    for (const [x, y, z, sx, sy, sz] of islands) {
      const m = new THREE.Mesh(bankGeo, this.islandMat);
      m.position.set(x, y, z);
      m.scale.set(sx, sy, sz);
      this.scene.add(m);
    }

    // Pine forest — three instanced depth layers
    this.forestMats = [
      new THREE.MeshBasicMaterial({ color: this.current.colors.forestNear.clone() }),
      new THREE.MeshBasicMaterial({ color: this.current.colors.forestMid.clone() }),
      new THREE.MeshBasicMaterial({ color: this.current.colors.forestFar.clone() }),
    ];
    const pineGeo = makePineGeometry();
    const rng = mulberry32(20231027); // Asep's arrival-in-Estonia date, as a seed
    type Patch = { layer: number; x0: number; x1: number; z0: number; z1: number; y: number; s0: number; s1: number; count: number };
    const patches: Patch[] = [
      // Foreground pine fringe along the shoreline (main land mass on phones)
      { layer: 0, x0: -40, x1: 44, z0: 21, z1: 33, y: 0.2, s0: 1.8, s1: 3.8, count: 46 },
      // Near framing groves (flank the hero text corridor)
      { layer: 0, x0: -46, x1: -14, z0: 2, z1: 28, y: 1.4, s0: 2.6, s1: 5.0, count: 34 },
      { layer: 0, x0: 14, x1: 46, z0: 2, z1: 28, y: 1.4, s0: 2.6, s1: 5.0, count: 34 },
      // Mid groves
      { layer: 1, x0: -74, x1: -30, z0: -58, z1: -128, y: 0.8, s0: 3.6, s1: 6.6, count: 42 },
      { layer: 1, x0: 30, x1: 74, z0: -58, z1: -128, y: 0.8, s0: 3.6, s1: 6.6, count: 42 },
      // Far shoreline forest
      { layer: 2, x0: -230, x1: 230, z0: -198, z1: -222, y: 3.2, s0: 5.0, s1: 9.0, count: 120 },
    ];
    const dummy = new THREE.Object3D();
    for (const p of patches) {
      const mesh = new THREE.InstancedMesh(pineGeo, this.forestMats[p.layer], p.count);
      for (let i = 0; i < p.count; i++) {
        const x = p.x0 + rng() * (p.x1 - p.x0);
        const z = p.z0 + rng() * (p.z1 - p.z0);
        const s = p.s0 + rng() * (p.s1 - p.s0);
        dummy.position.set(x, p.y + rng() * 0.6, z);
        dummy.scale.set(s * (0.8 + rng() * 0.4), s, s * (0.8 + rng() * 0.4));
        dummy.rotation.y = rng() * Math.PI * 2;
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
      this.scene.add(mesh);
    }

    // Seasonal particles (snow / petals / fireflies / leaves) — GPU-animated
    const count = this.tier.particles;
    const pos = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const sizes = new Float32Array(count);
    const mixes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rng() * 2 - 1) * 80;
      pos[i * 3 + 1] = rng() * 26;
      pos[i * 3 + 2] = 25 - rng() * 145;
      seeds[i] = rng();
      sizes[i] = 0.6 + rng() * 0.9;
      mixes[i] = rng();
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    pGeo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    pGeo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    pGeo.setAttribute("aMix", new THREE.BufferAttribute(mixes, 1));
    const points = new THREE.Points(
      pGeo,
      new THREE.ShaderMaterial({
        uniforms: this.particleUniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: /* glsl */ `
          uniform float uTime;
          uniform float uFall;
          uniform float uSway;
          uniform float uSize;
          uniform float uOpacity;
          uniform vec3 uColorA;
          uniform vec3 uColorB;
          uniform float uYMin;
          uniform float uYRange;
          uniform float uTwinkle;
          attribute float aSeed;
          attribute float aSize;
          attribute float aMix;
          varying vec3 vColor;
          varying float vAlpha;

          void main() {
            float seed = aSeed;
            vec3 pos = position;
            float speedVar = 0.6 + fract(seed * 7.31) * 0.9;
            pos.y = uYMin + mod(position.y - uTime * uFall * speedVar, uYRange);
            float sway = uSway * (1.0 + fract(seed * 3.7));
            pos.x += sin(uTime * (0.4 + fract(seed * 5.3)) + seed * 6.2831) * sway;
            pos.z += cos(uTime * (0.3 + fract(seed * 9.1)) + seed * 3.14) * sway * 0.6;

            vec4 mv = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = clamp(uSize * aSize * (160.0 / max(-mv.z, 1.0)), 1.0, 24.0);
            vAlpha = uOpacity;
            if (uTwinkle > 0.01) {
              float tw = sin(uTime * uTwinkle * (0.6 + fract(seed * 4.4)) + seed * 40.0);
              vAlpha *= 0.2 + 0.8 * pow(0.5 + 0.5 * tw, 2.0);
            }
            vColor = mix(uColorA, uColorB, aMix);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vColor;
          varying float vAlpha;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.12, d) * vAlpha;
            if (a < 0.01) discard;
            gl_FragColor = vec4(vColor, a);
          }
        `,
      }),
    );
    points.frustumCulled = false;
    this.scene.add(points);
  }

  // ── Season handling ───────────────────────────────────────────────────────

  setSeason(key: SeasonKey, immediate = false) {
    const target = SEASONS[key];
    if (immediate || this.reducedMotion) {
      this.current = { colors: paramsToColors(target), nums: paramsToNums(target) };
      this.transitioning = false;
      this.from = null;
      this.to = key;
      this.applyParams();
      if (this.reducedMotion) this.renderStatic();
      return;
    }
    this.from = {
      colors: cloneColors(this.current.colors),
      nums: { ...this.current.nums },
    };
    this.to = key;
    this.toColors = null;
    this.transitioning = true;
    this.transitionStart = performance.now();
  }

  getSeason(): SeasonKey {
    return this.to;
  }

  private updateTransition(now: number) {
    if (!this.transitioning || !this.from) return;
    const t = Math.min((now - this.transitionStart) / TRANSITION_MS, 1);
    const e = t * t * (3 - 2 * t); // smoothstep
    const to = this.toColors ?? paramsToColors(SEASONS[this.to]);
    this.toColors = to;
    for (const k of COLOR_KEYS) {
      this.current.colors[k].lerpColors(this.from.colors[k], to[k], e);
    }
    for (const k of NUM_KEYS) {
      this.current.nums[k] = this.from.nums[k] + (SEASONS[this.to][k] - this.from.nums[k]) * e;
    }
    this.applyParams();
    if (t >= 1) {
      this.transitioning = false;
      this.from = null;
    }
  }

  private applyParams() {
    const c = this.current.colors;
    const n = this.current.nums;
    const discDir = discDirection(n.discElev, n.discAzim);

    for (const u of [this.skyUniforms, this.waterUniforms]) {
      (u.uZenith.value as THREE.Color).copy(c.zenith);
      (u.uHorizon.value as THREE.Color).copy(c.horizon);
      (u.uAuroraA.value as THREE.Color).copy(c.auroraA);
      (u.uAuroraB.value as THREE.Color).copy(c.auroraB);
      u.uAuroraIntensity.value = n.auroraIntensity;
      u.uAuroraSpeed.value = n.auroraSpeed;
      u.uAuroraCoverage.value = n.auroraCoverage;
      u.uStarIntensity.value = n.starIntensity;
      (u.uDiscColor.value as THREE.Color).copy(c.discColor);
      (u.uDiscDir.value as THREE.Vector3).copy(discDir);
      u.uDiscSize.value = n.discSize;
      u.uDiscGlow.value = n.discGlow;
    }
    (this.waterUniforms.uDeep.value as THREE.Color).copy(c.waterDeep);
    (this.waterUniforms.uShallow.value as THREE.Color).copy(c.waterShallow);
    (this.waterUniforms.uFogColor.value as THREE.Color).copy(c.fogColor);
    this.waterUniforms.uFogDensity.value = n.fogDensity;

    (this.scene.fog as THREE.FogExp2).color.copy(c.fogColor);
    (this.scene.fog as THREE.FogExp2).density = n.fogDensity;

    this.forestMats[0].color.copy(c.forestNear);
    this.forestMats[1].color.copy(c.forestMid);
    this.forestMats[2].color.copy(c.forestFar);
    this.groundMats[0].color.copy(c.groundNear);
    this.groundMats[1].color.copy(c.groundFar);
    this.islandMat.color.copy(c.forestFar);

    const pu = this.particleUniforms;
    pu.uFall.value = n.particleFall;
    pu.uSway.value = n.particleSway;
    pu.uSize.value = n.particleSize;
    pu.uOpacity.value = n.particleOpacity;
    pu.uYMin.value = n.particleYMin;
    pu.uYRange.value = n.particleYRange;
    pu.uTwinkle.value = n.particleTwinkle;
    (pu.uColorA.value as THREE.Color).copy(c.particleA);
    (pu.uColorB.value as THREE.Color).copy(c.particleB);
  }

  // ── Interaction / loop ────────────────────────────────────────────────────

  private attachPointer() {
    window.addEventListener("pointermove", (e) => {
      this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
      this.pointerActive = true;
    });
  }

  private updateCamera(t: number) {
    const driftX = Math.sin(t * 0.07) * 1.1;
    const driftY = Math.sin(t * 0.05 + 1.3) * 0.35;
    const px = this.pointerActive ? this.pointer.x * 2.4 : 0;
    const py = this.pointerActive ? this.pointer.y * 0.9 : 0;
    const targetX = driftX + px;
    const targetY = 4.4 + driftY - py;
    this.camera.position.x += (targetX - this.camera.position.x) * 0.035;
    this.camera.position.y += (targetY - this.camera.position.y) * 0.035;
    this.camera.lookAt(0, this.lookAtY, -100);
  }

  private updateScrollFade() {
    if (!this.heroMarker) {
      this.heroMarker = document.getElementById("estonia-bg-hero-marker");
    }
    if (!this.heroMarker) return;
    const rect = this.heroMarker.getBoundingClientRect();
    const vh = window.innerHeight;
    const fadeStart = vh * 0.3;
    const fadeEnd = -rect.height * 0.5;
    let opacity = 1;
    if (rect.bottom <= fadeEnd) opacity = 0;
    else if (rect.bottom < fadeStart) {
      opacity = (rect.bottom - fadeEnd) / (fadeStart - fadeEnd);
    }
    this.wrapper.style.opacity = String(opacity);
  }

  private renderFrame(now: number) {
    const t = this.clock.getElapsedTime();
    this.updateTransition(now);
    this.updateCamera(t);
    this.skyUniforms.uTime.value = t;
    this.waterUniforms.uTime.value = t;
    this.particleUniforms.uTime.value = t;
    if (this.onFrameCallback) this.onFrameCallback(t);
    this.updateScrollFade();
    this.renderer.render(this.scene, this.camera);
  }

  private animate = (timestamp: number) => {
    if (!this.running) return;
    const interval = 1000 / this.tier.fps;
    const delta = timestamp - this.lastFrame;
    if (delta >= interval) {
      this.lastFrame = timestamp - (delta % interval);
      this.renderFrame(timestamp);
    }
    this.animId = requestAnimationFrame(this.animate);
  };

  start() {
    if (this.reducedMotion) return;
    this.running = true;
    this.lastFrame = 0;
    this.clock.getDelta();
    this.animId = requestAnimationFrame(this.animate);
  }

  stop() {
    this.running = false;
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  renderStatic() {
    this.renderFrame(performance.now());
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.tier.dprCap));
    this.renderer.setSize(w, h);
    const aspect = w / h;
    // Narrow viewports lose the side headlands to the cropped horizontal FOV;
    // widen the lens and dip the gaze so the foreground shoreline fills the base.
    this.camera.aspect = aspect;
    this.camera.fov = aspect < 0.9 ? Math.min(72, 55 + (0.9 - aspect) * 38) : 55;
    this.lookAtY = aspect < 0.9 ? 4.4 : 5.2;
    this.camera.updateProjectionMatrix();
    if (!this.running) this.renderStatic();
  }

  dispose() {
    this.stop();
    this.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = (mesh as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else if (mat) mat.dispose();
    });
    this.renderer.dispose();
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function discDirection(elev: number, azim: number): THREE.Vector3 {
  return new THREE.Vector3(
    Math.sin(azim) * Math.cos(elev),
    Math.sin(elev),
    -Math.cos(azim) * Math.cos(elev),
  ).normalize();
}

function paramsToColors(p: SeasonParams): ColorParams {
  const out = {} as ColorParams;
  for (const k of COLOR_KEYS) out[k] = new THREE.Color(p[k]);
  return out;
}

function paramsToNums(p: SeasonParams): NumParams {
  const out = {} as NumParams;
  for (const k of NUM_KEYS) out[k] = p[k];
  return out;
}

function cloneColors(c: ColorParams): ColorParams {
  const out = {} as ColorParams;
  for (const k of COLOR_KEYS) out[k] = c[k].clone();
  return out;
}

// Pine silhouette: trunk + four stacked cones, merged into one geometry.
function makePineGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const trunk = new THREE.CylinderGeometry(0.05, 0.07, 0.18, 5);
  trunk.translate(0, 0.09, 0);
  parts.push(trunk);
  const tiers: Array<[number, number, number]> = [
    [0.34, 0.34, 0.3],
    [0.28, 0.32, 0.52],
    [0.21, 0.3, 0.72],
    [0.13, 0.28, 0.9],
  ];
  for (const [r, h, y] of tiers) {
    const cone = new THREE.ConeGeometry(r, h, 6);
    cone.translate(0, y, 0);
    parts.push(cone);
  }
  const merged = mergeGeometries(parts);
  for (const g of parts) g.dispose();
  return merged ?? new THREE.ConeGeometry(0.25, 1, 6);
}

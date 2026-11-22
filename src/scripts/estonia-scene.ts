// estonia-scene.ts — Cinematic Three.js Estonia nature scene.
// Composition mirrors the real Tallinn coastline where aurora is watched
// (Russalka / Pirita): pine and birch headlands framing a calm Baltic sea,
// glacial erratic boulders on the shore, a distant island (Naissaar), and
// aurora curtains in the sky. Four seasons crossfade smoothly.
//
// Rendering: lit procedural models (Norway spruce, Scots pine, birch with
// seasonal foliage), heightfield terrain with snow/sand/rock, planar water
// reflections with shore foam and winter ice, volumetric-looking clouds,
// then an HDR post chain — bloom, god rays, lens ghosts, chromatic fringe,
// filmic shoulder, vignette and grain. Dynamic resolution keeps phones at
// frame rate.

import * as THREE from "three";
import { mergeGeometries, mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";

export type SeasonKey = "winter" | "spring" | "summer" | "autumn";

const COLOR_KEYS = [
  "zenith",
  "horizon",
  "auroraA",
  "auroraB",
  "discColor", // moon (winter/spring/autumn) or midnight sun (summer)
  "cloudColor",
  "waterDeep",
  "waterShallow",
  "fogColor",
  "keyColor", // moonlight / sunlight tint
  "ambient",
  "pine",
  "leafColor", // birch foliage
  "ground",
  "grass",
  "particleA",
  "particleB",
] as const;

const NUM_KEYS = [
  "auroraIntensity",
  "auroraSpeed",
  "auroraCoverage",
  "starIntensity",
  "discElev", // radians above horizon
  "discAzim", // radians, 0 = straight ahead (-z)
  "discSize", // angular radius
  "discGlow", // glow exponent
  "cloudCover",
  "fogDensity",
  "mist", // low height fog over the water
  "keyIntensity",
  "leaf", // birch foliage amount (0 = bare)
  "grassHeight",
  "snow",
  "wind",
  "bloom",
  "godRays",
  "particleOpacity",
  "particleFall",
  "particleSway",
  "particleSize",
  "particleYMin",
  "particleYRange",
  "particleTwinkle",
  "particleShape", // 0 round (snow/fireflies) → 1 tumbling leaf
  "particleGlow", // HDR multiplier (fireflies bloom)
  "particleAdditive", // 1 additive glow → 0 opaque leaves
] as const;

type ColorKey = (typeof COLOR_KEYS)[number];
type NumKey = (typeof NUM_KEYS)[number];
export type SeasonParams = Record<ColorKey, string> & Record<NumKey, number>;
type ColorParams = Record<ColorKey, THREE.Color>;
type NumParams = Record<NumKey, number>;

// ─── Season palettes ─────────────────────────────────────────────────────────
// Grounded in the real thing: green/teal aurora over snow and dark water
// (winter), violet-teal dusk with budding birches and drifting petals
// (spring), the never-setting midnight sun low over a golden sea with
// fireflies (summer), wind, golden birches and falling leaves (autumn).

const SEASONS: Record<SeasonKey, SeasonParams> = {
  winter: {
    zenith: "#040a18",
    horizon: "#10263e",
    auroraA: "#2effa0",
    auroraB: "#37d9e8",
    discColor: "#eef6ff",
    cloudColor: "#1c2a40",
    waterDeep: "#050d1a",
    waterShallow: "#0e2440",
    fogColor: "#0a1a2c",
    keyColor: "#a9c2f0",
    ambient: "#1b2c48",
    pine: "#16261f",
    leafColor: "#6b5a3a",
    ground: "#3b3a36",
    grass: "#b3a27c",
    particleA: "#ffffff",
    particleB: "#cfe2ff",
    auroraIntensity: 1.35,
    auroraSpeed: 0.5,
    auroraCoverage: 0.9,
    starIntensity: 1.0,
    discElev: 0.72,
    discAzim: -0.42,
    discSize: 0.03,
    discGlow: 220,
    cloudCover: 0.18,
    fogDensity: 0.0102,
    mist: 0.3,
    keyIntensity: 0.6,
    leaf: 0,
    grassHeight: 0.45,
    snow: 1,
    wind: 0.45,
    bloom: 0.9,
    godRays: 0.2,
    particleOpacity: 0.95,
    particleFall: 3.4,
    particleSway: 0.55,
    particleSize: 2.3,
    particleYMin: 0,
    particleYRange: 26,
    particleTwinkle: 0,
    particleShape: 0,
    particleGlow: 1,
    particleAdditive: 0.7,
  },
  spring: {
    zenith: "#081020",
    horizon: "#33405f",
    auroraA: "#52ffa8",
    auroraB: "#b48aff",
    discColor: "#f4edff",
    cloudColor: "#3a3f5c",
    waterDeep: "#081628",
    waterShallow: "#16344e",
    fogColor: "#16233a",
    keyColor: "#c8bcff",
    ambient: "#24304a",
    pine: "#1b3628",
    leafColor: "#9ad46a",
    ground: "#2d4630",
    grass: "#5a8f45",
    particleA: "#ffd9ea",
    particleB: "#fff4e0",
    auroraIntensity: 0.85,
    auroraSpeed: 0.42,
    auroraCoverage: 0.65,
    starIntensity: 0.75,
    discElev: 0.55,
    discAzim: 0.34,
    discSize: 0.024,
    discGlow: 190,
    cloudCover: 0.4,
    fogDensity: 0.0088,
    mist: 0.55,
    keyIntensity: 0.5,
    leaf: 0.6,
    grassHeight: 0.7,
    snow: 0,
    wind: 0.6,
    bloom: 0.85,
    godRays: 0.2,
    particleOpacity: 0.8,
    particleFall: 1.0,
    particleSway: 1.05,
    particleSize: 2.0,
    particleYMin: 0,
    particleYRange: 22,
    particleTwinkle: 0.25,
    particleShape: 0.7,
    particleGlow: 1,
    particleAdditive: 0.35,
  },
  summer: {
    zenith: "#1a4a63",
    horizon: "#f09a52",
    auroraA: "#63ffb4",
    auroraB: "#ffd27a",
    discColor: "#ffc26e",
    cloudColor: "#e3946a",
    waterDeep: "#0f2a33",
    waterShallow: "#33454b",
    fogColor: "#454a52",
    keyColor: "#ffb070",
    ambient: "#3d4a55",
    pine: "#1c4029",
    leafColor: "#4d963a",
    ground: "#2c5229",
    grass: "#6b9a3e",
    particleA: "#ffe98c",
    particleB: "#c8ff9e",
    auroraIntensity: 0.22,
    auroraSpeed: 0.3,
    auroraCoverage: 0.4,
    starIntensity: 0.12,
    discElev: 0.085,
    discAzim: 0.22,
    discSize: 0.045,
    discGlow: 80,
    cloudCover: 0.32,
    fogDensity: 0.0075,
    mist: 0.35,
    keyIntensity: 1.15,
    leaf: 1,
    grassHeight: 1.0,
    snow: 0,
    wind: 0.35,
    bloom: 1.0,
    godRays: 1.0,
    particleOpacity: 0.95,
    particleFall: 0.05,
    particleSway: 0.85,
    particleSize: 2.7,
    particleYMin: 0.3,
    particleYRange: 6.5,
    particleTwinkle: 2.6,
    particleShape: 0,
    particleGlow: 2.2,
    particleAdditive: 1,
  },
  autumn: {
    zenith: "#0c111e",
    horizon: "#6e452c",
    auroraA: "#7dffc8",
    auroraB: "#c084fc",
    discColor: "#ffc890",
    cloudColor: "#4a3634",
    waterDeep: "#0a121d",
    waterShallow: "#241c26",
    fogColor: "#221a1c",
    keyColor: "#ffb27a",
    ambient: "#2a2230",
    pine: "#1a2c22",
    leafColor: "#e8902a",
    ground: "#4a3420",
    grass: "#8f6c3c",
    particleA: "#ff9c3f",
    particleB: "#d64c1e",
    auroraIntensity: 0.75,
    auroraSpeed: 0.48,
    auroraCoverage: 0.55,
    starIntensity: 0.65,
    discElev: 0.4,
    discAzim: -0.5,
    discSize: 0.032,
    discGlow: 150,
    cloudCover: 0.55,
    fogDensity: 0.0092,
    mist: 0.6,
    keyIntensity: 0.6,
    leaf: 0.85,
    grassHeight: 0.8,
    snow: 0,
    wind: 1.35,
    bloom: 0.9,
    godRays: 0.45,
    particleOpacity: 0.9,
    particleFall: 1.7,
    particleSway: 1.6,
    particleSize: 3.1,
    particleYMin: 0,
    particleYRange: 24,
    particleTwinkle: 0,
    particleShape: 1,
    particleGlow: 1,
    particleAdditive: 0,
  },
};

const TRANSITION_MS = 2400;
const INTRO_S = 4.5;

// ─── Deterministic RNG + CPU noise (stable layout across seasons/visits) ────
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

function hash2(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function noise2(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi);
  const b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1);
  const d = hash2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm2(x: number, y: number, oct: number): number {
  let v = 0;
  let a = 0.5;
  for (let i = 0; i < oct; i++) {
    v += a * noise2(x, y);
    x = x * 2.03 + 19.7;
    y = y * 2.03 + 7.3;
    a *= 0.5;
  }
  return v;
}

function smoothstep(e0: number, e1: number, x: number): number {
  const t = Math.min(Math.max((x - e0) / (e1 - e0), 0), 1);
  return t * t * (3 - 2 * t);
}

// ─── Terrain ─────────────────────────────────────────────────────────────────
// Ellipsoid landforms [x, y, z, sx, sy, sz] unioned over a noisy sea floor.
const LANDFORMS: Array<[number, number, number, number, number, number]> = [
  [-31, -3.4, 14, 34, 6.5, 30], // near left headland
  [31, -3.2, 16, 32, 6.0, 28], // near right headland
  [-54, -3.8, -72, 30, 5.5, 44], // mid left grove bank
  [52, -4.0, -86, 28, 5.0, 40], // mid right grove bank
  [2, -6.0, 25, 48, 6.4, 18], // foreground shoreline — the visitor's feet
  [-72, -1.5, -175, 17, 6.1, 7], // Naissaar
  [58, -1.8, -196, 11, 4.1, 5], // small islet
  [0, -4.0, -224, 330, 7.5, 22], // far shore ridge
];

const SEA_FLOOR = -3.2;

function terrainHeight(x: number, z: number): number {
  let h = SEA_FLOOR + (fbm2(x * 0.02, z * 0.02, 3) - 0.5) * 1.4;
  for (const [bx, by, bz, sx, sy, sz] of LANDFORMS) {
    const dx = (x - bx) / sx;
    const dz = (z - bz) / sz;
    const r = dx * dx + dz * dz;
    if (r < 1) h = Math.max(h, by + sy * Math.sqrt(1 - r));
  }
  const land = smoothstep(-1.6, 1.0, h);
  // Gentler relief near the camera keeps the sea visible over the beach
  const relief = 3.0 - 1.9 * smoothstep(-5, 22, z);
  return h + land * (fbm2(x * 0.045 + 11, z * 0.045 - 7, 4) - 0.5) * relief;
}

// ─── GLSL chunks ─────────────────────────────────────────────────────────────

const COMMON_GLSL = /* glsl */ `
uniform float uTime;
uniform vec3 uDiscDir;
uniform vec3 uDiscColor;

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
  for (int i = 0; i < FBM_OCT; i++) {
    v += a * vnoise(p);
    p = p * 2.03 + vec2(19.7, 7.3);
    a *= 0.55;
  }
  return v;
}
`;

// Sky gradient + stars + milky way + aurora curtains + moon/sun disc + clouds.
const SKY_GLSL = /* glsl */ `
uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform vec3 uAuroraA;
uniform vec3 uAuroraB;
uniform vec3 uCloudColor;
uniform float uAuroraIntensity;
uniform float uAuroraSpeed;
uniform float uAuroraCoverage;
uniform float uStarIntensity;
uniform float uDiscSize;
uniform float uDiscGlow;
uniform float uCloudCover;

vec3 skyColor(vec3 dir, float detail) {
  float h = clamp(dir.y, 0.0, 1.0);
  vec3 sky = mix(uHorizon, uZenith, pow(h, 0.62));
  vec3 L = normalize(uDiscDir);
  float cdl = max(dot(dir, L), 0.0);
  // Broad atmospheric scattering around the disc
  sky += uDiscColor * pow(cdl, 5.0) * 0.16 * (1.0 - h * 0.5);

  if (detail > 0.5 && uStarIntensity > 0.01 && dir.y > 0.02) {
    vec2 sp = dir.xz / (dir.y + 0.35) * 28.0;
    vec2 cell = floor(sp);
    vec2 f = fract(sp);
    float hsh = hash21(cell);
    float horizonFade = smoothstep(0.02, 0.25, dir.y);
    if (hsh > 0.92) {
      vec2 starPos = vec2(hash21(cell + 7.1), hash21(cell + 3.7));
      float d = length(f - starPos);
      float tw = 0.6 + 0.4 * sin(uTime * (1.5 + hsh * 4.0) + hsh * 40.0);
      float m = smoothstep(0.10, 0.0, d) * tw;
      sky += vec3(0.9, 0.95, 1.0) * m * uStarIntensity * horizonFade * (hsh > 0.985 ? 2.6 : 1.3);
    }
    // Milky way — a faint dusty band on the darkest nights
    if (uStarIntensity > 0.3) {
      float b = dot(dir, normalize(vec3(0.55, 0.35, 0.76)));
      float band = exp(-b * b * 26.0);
      float mw = fbm(dir.xz / (dir.y + 0.4) * 5.0 + 3.0);
      sky += vec3(0.55, 0.62, 0.85) * band * smoothstep(0.35, 0.85, mw)
        * 0.1 * (uStarIntensity - 0.3) * horizonFade;
    }
  }

  // Aurora curtains — noise-driven bands with vertical ray structure
  if (uAuroraIntensity > 0.005 && dir.y > 0.0) {
    float u = atan(dir.x, -dir.z); // seam behind the camera
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
    sky += aur * uAuroraIntensity * 1.3;
  }

  // Moon / midnight-sun disc (HDR so it blooms) with soft glow
  float ang = acos(clamp(cdl, -1.0, 1.0));
  float disc = smoothstep(uDiscSize, uDiscSize * 0.72, ang);
  float glow = pow(cdl, uDiscGlow) * 0.55;
  sky += uDiscColor * (disc * 3.2 + glow);

  // Clouds — two-layer fbm, silver-lined toward the disc
  if (uCloudCover > 0.01 && dir.y > 0.0) {
    vec2 cp = dir.xz / (dir.y + 0.12) * 1.4 + vec2(uTime * 0.012, uTime * 0.004);
    float n = fbm(cp);
    float n2 = fbm(cp * 2.3 + 5.0);
    float dens = smoothstep(1.0 - uCloudCover, 1.25 - uCloudCover, n * 0.8 + n2 * 0.35);
    dens *= smoothstep(0.0, 0.14, dir.y);
    float lining = pow(cdl, 7.0) * (1.0 - dens) * 2.2;
    vec3 cc = uCloudColor * (0.75 + 0.5 * (1.0 - n2)) + uDiscColor * (lining + pow(cdl, 30.0) * 0.6);
    sky = mix(sky, cc, dens * 0.88);
  }
  return sky;
}
`;

// Lighting + atmospheric fog shared by every lit surface and the water.
const LIGHT_GLSL = /* glsl */ `
uniform vec3 uKeyColor;
uniform float uKeyIntensity;
uniform vec3 uAmbient;
uniform vec3 uFogColor;
uniform float uFogDensity;
uniform float uMist;
uniform float uSnow;
uniform float uClipY;

vec3 shade(vec3 albedo, vec3 N, vec3 wp, float ao, float trans, float spec) {
  vec3 V = normalize(cameraPosition - wp);
  vec3 L = normalize(uDiscDir);
  float diff = clamp(dot(N, L) * 0.75 + 0.25, 0.0, 1.0);
  vec3 key = uKeyColor * uKeyIntensity;
  // Soft sky fill from behind the camera so camera-facing sides still read
  float fill = clamp(dot(N, normalize(vec3(0.25, 0.55, 1.0))) * 0.5 + 0.5, 0.0, 1.0);
  vec3 col = albedo * (uAmbient * (0.45 + 0.35 * N.y + 0.6 * fill) * ao + key * diff * mix(0.45, 1.0, ao));
  // Light scattering through needles, leaves and snow toward the viewer
  float back = pow(clamp(dot(-V, L), 0.0, 1.0), 6.0);
  col += albedo * key * back * trans * 0.8 * ao;
  // Backlit rim — the cinematic silhouette edge
  float rim = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 4.0);
  col += key * rim * (0.08 + back * 0.45) * ao;
  vec3 H = normalize(L + V);
  col += key * pow(max(dot(N, H), 0.0), 40.0) * spec;
  return col;
}

vec3 applyFog(vec3 col, vec3 wp) {
  vec3 toP = wp - cameraPosition;
  float dist = length(toP);
  vec3 v = toP / dist;
  float f = 1.0 - exp(-pow(uFogDensity * dist, 2.0));
  float mist = uMist * exp(-max(wp.y, 0.0) * 0.4) * (1.0 - exp(-dist * 0.018));
  // In-scattering: fog glows toward the moon / sun
  vec3 fogCol = uFogColor + uDiscColor * pow(max(dot(v, normalize(uDiscDir)), 0.0), 8.0) * 0.45;
  return mix(col, fogCol, clamp(max(f, mist * 0.85), 0.0, 1.0));
}
`;

const DITHER_GLSL = /* glsl */ `
  col += (hash21(gl_FragCoord.xy) - 0.5) / 255.0;
`;

const LIT_VERTEX = /* glsl */ `
uniform float uTime;
uniform float uWind;
uniform float uLeaf;
uniform float uGrassHeight;
#if defined(KIND_TREE) || defined(KIND_ROCK) || defined(KIND_GRASS)
attribute float aAO;
attribute float aTint;
#endif
#ifdef KIND_TREE
attribute float aPart;
attribute vec3 aCenter;
#endif
varying vec3 vWP;
varying vec3 vN;
varying vec3 vLocal;
varying float vPart;
varying float vAO;
varying float vTint;

void main() {
  vec3 p = position;
  vPart = 0.0;
  vAO = 1.0;
  vTint = 0.5;
#ifdef KIND_TREE
  vPart = aPart;
  // Seasonal foliage: leaf blobs grow from their centre (bare in winter)
  if (aPart > 1.5 && aPart < 2.5) p = aCenter + (p - aCenter) * uLeaf;
#endif
#if defined(KIND_TREE) || defined(KIND_ROCK) || defined(KIND_GRASS)
  vAO = aAO;
  vTint = aTint;
#endif
#ifdef KIND_GRASS
  p.y *= uGrassHeight;
#endif
  vLocal = p;
#ifdef USE_INSTANCING
  mat4 m = modelMatrix * instanceMatrix;
#else
  mat4 m = modelMatrix;
#endif
  vec4 wp = m * vec4(p, 1.0);
#if defined(KIND_TREE) || defined(KIND_GRASS)
  vec3 base = (m * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  float scaleY = length(m[1].xyz);
  float ph = base.x * 0.13 + base.z * 0.07;
  float gust = 0.6 + 0.4 * sin(uTime * 0.35 + base.x * 0.02);
  float sw = (sin(uTime * 1.2 + ph) + 0.45 * sin(uTime * 2.7 + ph * 1.7)) * gust;
  #ifdef KIND_TREE
  float ly = max(position.y, 0.0);
  wp.xz += vec2(0.94, 0.34) * sw * uWind * 0.045 * ly * ly * scaleY;
  if (aPart > 1.5 && aPart < 2.5) {
    wp.xyz += sin(uTime * 7.0 + position.x * 40.0 + position.y * 31.0) * 0.01 * scaleY * uWind;
  }
  #else
  wp.xz += vec2(0.94, 0.34) * (sw + 0.8) * uWind * 0.12 * aAO * aAO * scaleY;
  #endif
#endif
  vWP = wp.xyz;
  vN = normalize(mat3(m) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const LIT_FRAGMENT =
  COMMON_GLSL +
  LIGHT_GLSL +
  /* glsl */ `
uniform vec3 uPine;
uniform vec3 uLeafColor;
uniform vec3 uGround;
uniform vec3 uGrass;
varying vec3 vWP;
varying vec3 vN;
varying vec3 vLocal;
varying float vPart;
varying float vAO;
varying float vTint;

const vec3 SNOW = vec3(0.86, 0.9, 0.97);

void main() {
  if (vWP.y < uClipY) discard;
  vec3 N = normalize(vN);
  if (!gl_FrontFacing) N = -N;
  vec3 col;

#ifdef KIND_TERRAIN
  float n = vnoise(vWP.xz * 0.35);
  float n2 = vnoise(vWP.xz * 2.2);
  float slope = 1.0 - N.y;
  float n3 = vnoise(vWP.xz * 7.0);
  float patchy = smoothstep(0.35, 0.7, fbm(vWP.xz * 0.12));
  // Heath / moss patches over the base ground, fine grain on top
  vec3 soil = mix(uGround, uGround * vec3(1.35, 1.15, 0.7), patchy) * (0.7 + 0.6 * n) * (0.8 + 0.4 * n3);
  soil = mix(soil, uGrass * 0.8, smoothstep(0.6, 0.9, vnoise(vWP.xz * 0.6 + 9.0)) * 0.5);
  vec3 rock = vec3(0.24, 0.23, 0.22) * (0.75 + 0.5 * n2);
  vec3 alb = mix(soil, rock, smoothstep(0.3, 0.55, slope + (n2 - 0.5) * 0.25));
  vec3 sand = vec3(0.46, 0.41, 0.33) * (0.85 + 0.3 * n2);
  alb = mix(sand, alb, smoothstep(0.2, 0.75, vWP.y + (n - 0.5) * 0.5));
  alb *= mix(0.5, 1.0, smoothstep(-0.15, 0.3, vWP.y)); // wet shoreline
  float s = uSnow * smoothstep(0.4, 0.68, N.y + (n - 0.5) * 0.4) * smoothstep(-0.1, 0.2, vWP.y);
  alb = mix(alb, SNOW, s);
  col = shade(alb, N, vWP, 1.0, s * 0.25, s * 0.35);
  float d = distance(cameraPosition, vWP);
  if (s > 0.5 && d < 30.0) {
    float glint = step(0.996, hash21(floor(vWP.xz * 26.0)));
    col += uKeyColor * uKeyIntensity * glint * 2.5 * (1.0 - d / 30.0) * s;
  }
#endif

#ifdef KIND_ROCK
  float n = vnoise(vLocal.xz * 3.0 + vLocal.y * 2.0);
  float n2 = vnoise(vLocal.xy * 9.0 + 4.0);
  // Procedural bump: granite pitting and fracture planes
  N = normalize(N + (vec3(vnoise(vLocal.yz * 11.0), vnoise(vLocal.zx * 11.0 + 3.0), vnoise(vLocal.xy * 11.0 + 7.0)) - 0.5) * 0.7);
  vec3 alb = mix(vec3(0.3, 0.29, 0.28), vec3(0.42, 0.38, 0.33), n) * (0.8 + 0.35 * n2) * (0.85 + 0.3 * vTint);
  alb *= 0.85 + 0.3 * step(0.55, vnoise(vLocal.xz * 22.0 + vLocal.y * 17.0)); // feldspar speckle
  alb = mix(alb, uGround * 1.2, smoothstep(0.55, 0.9, N.y) * 0.45 * (1.0 - uSnow)); // moss / lichen
  alb *= mix(0.55, 1.0, smoothstep(-0.1, 0.4, vWP.y));
  float s = uSnow * smoothstep(0.35, 0.7, N.y + (n2 - 0.5) * 0.3);
  alb = mix(alb, SNOW, s);
  col = shade(alb, N, vWP, vAO, s * 0.2, 0.08 + s * 0.3);
#endif

#ifdef KIND_GRASS
  vec3 alb = uGrass * mix(0.4, 1.2, vAO) * (0.8 + 0.4 * vTint);
  col = shade(alb, normalize(mix(N, vec3(0.0, 1.0, 0.0), 0.55)), vWP, mix(0.5, 1.0, vAO), 0.8, 0.0);
#endif

#ifdef KIND_TREE
  float nz = vnoise(vLocal.xz * 24.0 + vLocal.y * 9.0);
  vec3 alb;
  float trans = 0.0;
  if (vPart < 0.5) {
    alb = vec3(0.17, 0.12, 0.09); // spruce bark
  } else if (vPart < 1.5) {
    alb = uPine * (0.8 + 0.4 * vTint) * (0.85 + 0.3 * nz); // needles
    trans = 0.35;
  } else if (vPart < 2.5) {
    alb = mix(uLeafColor, uLeafColor * vec3(1.25, 0.75, 0.45), vTint * 0.7) * (0.8 + 0.4 * nz);
    trans = 0.9;
  } else if (vPart < 3.5) {
    float mk = step(0.7, vnoise(vec2(atan(vLocal.z, vLocal.x) * 1.6, vLocal.y * 42.0)));
    alb = mix(vec3(0.74, 0.72, 0.68), vec3(0.08, 0.07, 0.06), mk); // birch bark
  } else {
    alb = mix(vec3(0.2, 0.13, 0.09), vec3(0.5, 0.28, 0.15), smoothstep(0.25, 0.7, vLocal.y)); // Scots pine
  }
  float s = (vPart > 1.5 && vPart < 2.5) ? 0.0 : uSnow * smoothstep(0.3, 0.7, N.y + (nz - 0.5) * 0.5);
  alb = mix(alb, SNOW, s);
  col = shade(alb, N, vWP, vAO, trans + s * 0.2, s * 0.3);
#endif

  col = applyFog(col, vWP);
  gl_FragColor = vec4(col, 1.0);
}
`;

const FULLSCREEN_VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// ─── Quality tiers ───────────────────────────────────────────────────────────

interface Tier {
  particles: number;
  dprCap: number;
  waterSeg: number;
  terrainSeg: [number, number];
  grass: number;
  fps: number;
  msaa: number;
  reflections: boolean;
  reflScale: number;
  raySamples: number; // 0 disables god rays
  bloomLevels: number;
  fbmOct: number;
  pixelBudget: number; // max internal render pixels before dynamic resolution
  depthTex: number;
}

function getTier(width: number): Tier {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const lowEnd = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 3;
  let t: Tier;
  if (width >= 1024) {
    t = {
      particles: 900, dprCap: 2, waterSeg: 160, terrainSeg: [180, 150], grass: 1500, fps: 60,
      msaa: 4, reflections: true, reflScale: 0.5, raySamples: 28, bloomLevels: 5, fbmOct: 4,
      pixelBudget: 2.6e6, depthTex: 192,
    };
  } else if (width >= 640) {
    t = {
      particles: 520, dprCap: 1.75, waterSeg: 120, terrainSeg: [140, 120], grass: 1100, fps: 30,
      msaa: 4, reflections: true, reflScale: 0.5, raySamples: 20, bloomLevels: 4, fbmOct: 4,
      pixelBudget: 1.6e6, depthTex: 160,
    };
  } else {
    t = {
      particles: 320, dprCap: 1.5, waterSeg: 72, terrainSeg: [100, 90], grass: 650, fps: 30,
      msaa: 4, reflections: true, reflScale: 0.4, raySamples: 14, bloomLevels: 4, fbmOct: 3,
      pixelBudget: 0.85e6, depthTex: 128,
    };
  }
  if (lowEnd) {
    t.reflections = false;
    t.raySamples = 0;
    t.msaa = 0;
    t.grass = Math.round(t.grass * 0.5);
    t.particles = Math.round(t.particles * 0.7);
    t.fbmOct = 3;
    t.pixelBudget *= 0.65;
  }
  return t;
}

// ─── HDR post-processing chain ───────────────────────────────────────────────
// scene (MSAA, half-float) → half-res copy → threshold → dual-filter bloom
// pyramid; god rays from the half-res copy at quarter res; composite with
// lens ghosts, chromatic fringe, filmic shoulder, vignette and grain.

interface PostParams {
  time: number;
  bloom: number;
  rays: number;
  flare: number;
  discUV: THREE.Vector2;
  discColor: THREE.Color;
}

class PostFX {
  readonly sceneRT: THREE.WebGLRenderTarget;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly quadScene = new THREE.Scene();
  private readonly quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly quad: THREE.Mesh;
  private readonly halfRT: THREE.WebGLRenderTarget;
  private readonly raysRT: THREE.WebGLRenderTarget;
  private readonly down: THREE.WebGLRenderTarget[] = [];
  private readonly up: THREE.WebGLRenderTarget[] = [];
  private readonly downMat: THREE.ShaderMaterial;
  private readonly upMat: THREE.ShaderMaterial;
  private readonly raysMat: THREE.ShaderMaterial | null;
  private readonly compMat: THREE.ShaderMaterial;
  private width = 1;
  private height = 1;

  constructor(renderer: THREE.WebGLRenderer, tier: Tier, type: THREE.TextureDataType) {
    this.renderer = renderer;
    const rtOpts = {
      type,
      depthBuffer: false,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      generateMipmaps: false,
    };
    this.sceneRT = new THREE.WebGLRenderTarget(1, 1, { ...rtOpts, depthBuffer: true, samples: tier.msaa });
    this.halfRT = new THREE.WebGLRenderTarget(1, 1, rtOpts);
    this.raysRT = new THREE.WebGLRenderTarget(1, 1, rtOpts);
    for (let i = 0; i < tier.bloomLevels; i++) {
      this.down.push(new THREE.WebGLRenderTarget(1, 1, rtOpts));
      if (i < tier.bloomLevels - 1) this.up.push(new THREE.WebGLRenderTarget(1, 1, rtOpts));
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2));
    this.quad = new THREE.Mesh(geo);
    this.quad.frustumCulled = false;
    this.quadScene.add(this.quad);

    this.downMat = new THREE.ShaderMaterial({
      uniforms: {
        tSrc: { value: null },
        uTexel: { value: new THREE.Vector2() },
        uThreshold: { value: 0 },
      },
      vertexShader: FULLSCREEN_VERTEX,
      fragmentShader: /* glsl */ `
        uniform sampler2D tSrc;
        uniform vec2 uTexel;
        uniform float uThreshold;
        varying vec2 vUv;
        void main() {
          vec3 s = texture2D(tSrc, vUv).rgb * 4.0;
          s += texture2D(tSrc, vUv + uTexel * vec2(-1.0, -1.0)).rgb;
          s += texture2D(tSrc, vUv + uTexel * vec2(1.0, -1.0)).rgb;
          s += texture2D(tSrc, vUv + uTexel * vec2(-1.0, 1.0)).rgb;
          s += texture2D(tSrc, vUv + uTexel * vec2(1.0, 1.0)).rgb;
          s *= 0.125;
          if (uThreshold > 0.0) {
            // Soft-knee threshold: only highlights feed the bloom
            float br = max(s.r, max(s.g, s.b));
            float knee = uThreshold * 0.5;
            float soft = clamp(br - uThreshold + knee, 0.0, 2.0 * knee);
            soft = soft * soft / (4.0 * knee + 1e-4);
            s *= max(soft, br - uThreshold) / max(br, 1e-4);
          }
          gl_FragColor = vec4(s, 1.0);
        }
      `,
      depthTest: false,
      depthWrite: false,
    });

    this.upMat = new THREE.ShaderMaterial({
      uniforms: {
        tSrc: { value: null },
        tAdd: { value: null },
        uTexel: { value: new THREE.Vector2() },
      },
      vertexShader: FULLSCREEN_VERTEX,
      fragmentShader: /* glsl */ `
        uniform sampler2D tSrc;
        uniform sampler2D tAdd;
        uniform vec2 uTexel;
        varying vec2 vUv;
        void main() {
          vec3 s = texture2D(tSrc, vUv + uTexel * vec2(-2.0, 0.0)).rgb;
          s += texture2D(tSrc, vUv + uTexel * vec2(2.0, 0.0)).rgb;
          s += texture2D(tSrc, vUv + uTexel * vec2(0.0, -2.0)).rgb;
          s += texture2D(tSrc, vUv + uTexel * vec2(0.0, 2.0)).rgb;
          s += texture2D(tSrc, vUv + uTexel * vec2(-1.0, 1.0)).rgb * 2.0;
          s += texture2D(tSrc, vUv + uTexel * vec2(1.0, 1.0)).rgb * 2.0;
          s += texture2D(tSrc, vUv + uTexel * vec2(-1.0, -1.0)).rgb * 2.0;
          s += texture2D(tSrc, vUv + uTexel * vec2(1.0, -1.0)).rgb * 2.0;
          gl_FragColor = vec4(s / 12.0 + texture2D(tAdd, vUv).rgb, 1.0);
        }
      `,
      depthTest: false,
      depthWrite: false,
    });

    this.raysMat =
      tier.raySamples > 0
        ? new THREE.ShaderMaterial({
            defines: { SAMPLES: tier.raySamples },
            uniforms: {
              tSrc: { value: this.halfRT.texture },
              uDiscUV: { value: new THREE.Vector2() },
              uAspect: { value: 1 },
            },
            vertexShader: FULLSCREEN_VERTEX,
            fragmentShader: /* glsl */ `
              uniform sampler2D tSrc;
              uniform vec2 uDiscUV;
              uniform float uAspect;
              varying vec2 vUv;
              float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
              void main() {
                vec2 stepv = (uDiscUV - vUv) / float(SAMPLES) * 0.85;
                vec2 p = vUv + stepv * hash(gl_FragCoord.xy);
                float decay = 1.0;
                vec3 acc = vec3(0.0);
                for (int i = 0; i < SAMPLES; i++) {
                  vec3 s = texture2D(tSrc, clamp(p, 0.0, 1.0)).rgb;
                  float l = max(dot(s, vec3(0.3, 0.59, 0.11)) - 0.6, 0.0);
                  vec2 dd = (p - uDiscUV) * vec2(uAspect, 1.0);
                  acc += s * l * exp(-dot(dd, dd) * 3.0) * decay;
                  decay *= 0.95;
                  p += stepv;
                }
                gl_FragColor = vec4(acc * (0.8 / float(SAMPLES)), 1.0);
              }
            `,
            depthTest: false,
            depthWrite: false,
          })
        : null;

    const lowest = this.up[this.up.length - 1] ?? this.down[0];
    this.compMat = new THREE.ShaderMaterial({
      uniforms: {
        tScene: { value: this.sceneRT.texture },
        tBloom: { value: (this.up[0] ?? this.down[0]).texture },
        tGhost: { value: lowest.texture },
        tRays: { value: this.raysRT.texture },
        uBloom: { value: 1 },
        uRays: { value: 0 },
        uFlare: { value: 0 },
        uRaysColor: { value: new THREE.Color() },
        uTime: { value: 0 },
        uRes: { value: new THREE.Vector2(1, 1) },
      },
      vertexShader: FULLSCREEN_VERTEX,
      fragmentShader: /* glsl */ `
        uniform sampler2D tScene;
        uniform sampler2D tBloom;
        uniform sampler2D tGhost;
        uniform sampler2D tRays;
        uniform float uBloom;
        uniform float uRays;
        uniform float uFlare;
        uniform vec3 uRaysColor;
        uniform float uTime;
        uniform vec2 uRes;
        varying vec2 vUv;

        float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

        // Authored palette stays untouched below the knee; highlights roll off.
        vec3 shoulder(vec3 c) {
          const float k = 0.78;
          vec3 over = max(c - k, 0.0);
          return min(c, vec3(k)) + (1.0 - k) * (1.0 - exp(-over / (1.0 - k)));
        }

        void main() {
          vec2 uv = vUv;
          vec2 d = uv - 0.5;
          float r2 = dot(d, d);
          vec2 off = d * r2 * 0.012;
          vec3 col = vec3(
            texture2D(tScene, uv + off).r,
            texture2D(tScene, uv).g,
            texture2D(tScene, uv - off).b
          );
          col += texture2D(tBloom, uv).rgb * uBloom;
          // God rays are quarter-res and jittered: tent-filter while upsampling
          vec2 rt = 4.0 / uRes;
          vec3 rays = texture2D(tRays, uv).rgb * 0.36
            + (texture2D(tRays, uv + vec2(rt.x, rt.y)).rgb + texture2D(tRays, uv + vec2(-rt.x, rt.y)).rgb
             + texture2D(tRays, uv + vec2(rt.x, -rt.y)).rgb + texture2D(tRays, uv - rt).rgb) * 0.16;
          col += rays * uRaysColor * uRays;

          // Lens ghosts mirrored through the optical centre
          vec2 gv = (vec2(0.5) - uv) * 0.45;
          vec3 fl = vec3(0.0);
          for (int i = 1; i <= 3; i++) {
            vec2 q = uv + gv * float(i);
            float w = pow(max(1.0 - length(vec2(0.5) - q) * 1.4142, 0.0), 5.0);
            vec3 tint = i == 1 ? vec3(1.0, 0.8, 0.6) : (i == 2 ? vec3(0.6, 0.9, 1.0) : vec3(0.8, 0.7, 1.0));
            fl += texture2D(tGhost, q).rgb * w * tint;
          }
          col += fl * uFlare;

          col = shoulder(col);
          col *= 1.0 - 0.32 * smoothstep(0.12, 0.5, r2);
          float g = hash(uv * uRes + fract(uTime * 7.13) * 91.7) - 0.5;
          col += g * 0.035 * (1.0 - min(dot(col, vec3(0.33)), 1.0) * 0.6);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
      depthTest: false,
      depthWrite: false,
    });
  }

  setSize(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.sceneRT.setSize(w, h);
    this.halfRT.setSize(Math.max(1, Math.round(w / 2)), Math.max(1, Math.round(h / 2)));
    this.raysRT.setSize(Math.max(1, Math.round(w / 4)), Math.max(1, Math.round(h / 4)));
    this.down.forEach((rt, i) => {
      const s = 2 ** (i + 2);
      rt.setSize(Math.max(1, Math.round(w / s)), Math.max(1, Math.round(h / s)));
    });
    this.up.forEach((rt, i) => rt.setSize(this.down[i].width, this.down[i].height));
    (this.compMat.uniforms.uRes.value as THREE.Vector2).set(w, h);
  }

  private pass(mat: THREE.ShaderMaterial, target: THREE.WebGLRenderTarget | null) {
    this.quad.material = mat;
    this.renderer.setRenderTarget(target);
    this.renderer.render(this.quadScene, this.quadCam);
  }

  private downsample(src: THREE.WebGLRenderTarget, dst: THREE.WebGLRenderTarget, threshold: number) {
    const u = this.downMat.uniforms;
    u.tSrc.value = src.texture;
    (u.uTexel.value as THREE.Vector2).set(1 / src.width, 1 / src.height);
    u.uThreshold.value = threshold;
    this.pass(this.downMat, dst);
  }

  render(p: PostParams) {
    this.downsample(this.sceneRT, this.halfRT, 0);
    this.downsample(this.halfRT, this.down[0], 1.1);
    for (let i = 1; i < this.down.length; i++) this.downsample(this.down[i - 1], this.down[i], 0);
    for (let i = this.up.length - 1; i >= 0; i--) {
      const src = i === this.up.length - 1 ? this.down[i + 1] : this.up[i + 1];
      const u = this.upMat.uniforms;
      u.tSrc.value = src.texture;
      u.tAdd.value = this.down[i].texture;
      (u.uTexel.value as THREE.Vector2).set(1 / src.width, 1 / src.height);
      this.pass(this.upMat, this.up[i]);
    }

    const rays = this.raysMat ? p.rays : 0;
    if (this.raysMat && rays > 0.01) {
      (this.raysMat.uniforms.uDiscUV.value as THREE.Vector2).copy(p.discUV);
      this.raysMat.uniforms.uAspect.value = this.width / this.height;
      this.pass(this.raysMat, this.raysRT);
    }

    const c = this.compMat.uniforms;
    c.uBloom.value = p.bloom / this.down.length;
    c.uRays.value = rays;
    c.uFlare.value = p.flare;
    (c.uRaysColor.value as THREE.Color).copy(p.discColor);
    c.uTime.value = p.time;
    this.pass(this.compMat, null);
  }

  dispose() {
    for (const rt of [this.sceneRT, this.halfRT, this.raysRT, ...this.down, ...this.up]) rt.dispose();
    for (const m of [this.downMat, this.upMat, this.raysMat, this.compMat]) m?.dispose();
    this.quad.geometry.dispose();
  }
}

// ─── Scene ───────────────────────────────────────────────────────────────────

const MIN_RENDER_SCALE = 0.5;

export class EstoniaScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private reflCamera: THREE.PerspectiveCamera;
  private reflRT: THREE.WebGLRenderTarget | null = null;
  private post: PostFX;
  private tier: Tier;
  private t0 = performance.now();

  // One uniform bag shared by every material; programs pick what they use.
  private u: Record<string, THREE.IUniform>;
  private water!: THREE.Mesh;
  private grass: THREE.Object3D | null = null;

  private current: { colors: ColorParams; nums: NumParams };
  private from: { colors: ColorParams; nums: NumParams } | null = null;
  private to: SeasonKey;
  private toColors: ColorParams | null = null;
  private transitionStart = 0;
  private transitioning = false;

  private lookAtY = 5.2;
  private pointer = { x: 0, y: 0 };
  private pointerActive = false;
  private discUV = new THREE.Vector2();
  private tmpV = new THREE.Vector3();
  private tmpF = new THREE.Vector3();

  private running = false;
  private animId: number | null = null;
  private lastFrame = 0;
  private reducedMotion: boolean;

  // Dynamic resolution (steps down only, so it never oscillates)
  private renderScale = 1;
  private maxScale = 1;
  private degraded = false;
  private perfSamples: number[] = [];
  private slowWindows = 0;
  private lastRenderTs = 0;
  private lastRafTs = 0;
  private vsync = 1000 / 60;

  private heroMarker: HTMLElement | null = null;
  private switcherEl: HTMLElement | null = null;
  private footerIcons: HTMLAnchorElement[] | null = null;
  private wrapper: HTMLElement;
  private bgOpacity = 1;

  private constructor(
    canvas: HTMLCanvasElement,
    wrapper: HTMLElement,
    reducedMotion: boolean,
  ) {
    this.wrapper = wrapper;
    this.reducedMotion = reducedMotion;
    this.tier = getTier(window.innerWidth);

    // Raw color pipeline: every hex below is authored as final screen color;
    // the post chain only rolls off HDR highlights above that range.
    THREE.ColorManagement.enabled = false;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      powerPreference: "high-performance",
    });
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.tier.dprCap));

    const ext = this.renderer.extensions;
    const hdr = ext.has("EXT_color_buffer_half_float") || ext.has("EXT_color_buffer_float");
    if (!hdr) this.tier.msaa = 0;
    this.post = new PostFX(this.renderer, this.tier, hdr ? THREE.HalfFloatType : THREE.UnsignedByteType);
    if (this.tier.reflections) {
      this.reflRT = new THREE.WebGLRenderTarget(1, 1, {
        type: hdr ? THREE.HalfFloatType : THREE.UnsignedByteType,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        generateMipmaps: false,
      });
    }

    this.camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1400);
    this.camera.position.set(0, 4.4, 34);
    this.reflCamera = new THREE.PerspectiveCamera(55, 1, 0.1, 1400);

    const w = SEASONS.winter;
    this.current = { colors: paramsToColors(w), nums: paramsToNums(w) };
    this.to = "winter";
    this.u = this.makeUniforms();

    canvas.addEventListener("webglcontextlost", (e) => {
      // Mobile browsers reclaim GPU contexts; fall back to the CSS gradient.
      e.preventDefault();
      this.stop();
      canvas.style.display = "none";
    });

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

  // ── Uniforms ──────────────────────────────────────────────────────────────

  private makeUniforms(): Record<string, THREE.IUniform> {
    const u: Record<string, THREE.IUniform> = {
      uTime: { value: 0 },
      uDiscDir: { value: new THREE.Vector3(0, 0.5, -1).normalize() },
      uClipY: { value: -1e4 },
      uPxScale: { value: 1 },
      uReflVP: { value: new THREE.Matrix4() },
      uRefl: { value: this.reflRT?.texture ?? null },
      uDepthTex: { value: null },
      uDepthRect: { value: new THREE.Vector4() },
    };
    const colorUniform: Record<ColorKey, string> = {
      zenith: "uZenith",
      horizon: "uHorizon",
      auroraA: "uAuroraA",
      auroraB: "uAuroraB",
      discColor: "uDiscColor",
      cloudColor: "uCloudColor",
      waterDeep: "uDeep",
      waterShallow: "uShallow",
      fogColor: "uFogColor",
      keyColor: "uKeyColor",
      ambient: "uAmbient",
      pine: "uPine",
      leafColor: "uLeafColor",
      ground: "uGround",
      grass: "uGrass",
      particleA: "uColorA",
      particleB: "uColorB",
    };
    for (const k of COLOR_KEYS) u[colorUniform[k]] = { value: new THREE.Color() };
    for (const k of NUM_KEYS) u[numUniform(k)] = { value: 0 };
    this.colorUniform = colorUniform;
    return u;
  }

  private colorUniform!: Record<ColorKey, string>;

  private litMaterial(kind: "TREE" | "ROCK" | "GRASS" | "TERRAIN"): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      defines: { [`KIND_${kind}`]: 1, FBM_OCT: this.tier.fbmOct },
      uniforms: this.u,
      vertexShader: LIT_VERTEX,
      fragmentShader: LIT_FRAGMENT,
      side: kind === "GRASS" ? THREE.DoubleSide : THREE.FrontSide,
    });
  }

  // ── Scene construction ────────────────────────────────────────────────────

  private buildScene() {
    const tier = this.tier;
    const rng = mulberry32(20231027); // Asep's arrival-in-Estonia date, as a seed

    // Sky dome — drawn after opaque geometry so early-z skips covered pixels
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(620, 48, 28),
      new THREE.ShaderMaterial({
        defines: { FBM_OCT: tier.fbmOct },
        uniforms: this.u,
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
          COMMON_GLSL +
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
    sky.renderOrder = 1;
    sky.frustumCulled = false;
    this.scene.add(sky);

    // Terrain — one heightfield, vertex density concentrated near the camera
    const [segX, segZ] = tier.terrainSeg;
    const nx = segX + 1;
    const nz = segZ + 1;
    const tPos = new Float32Array(nx * nz * 3);
    for (let j = 0; j < nz; j++) {
      const z = 46 - 290 * Math.pow(j / segZ, 1.55);
      for (let i = 0; i < nx; i++) {
        const uu = (i / segX) * 2 - 1;
        const x = 270 * Math.sign(uu) * Math.pow(Math.abs(uu), 1.7);
        const k = (j * nx + i) * 3;
        tPos[k] = x;
        tPos[k + 1] = terrainHeight(x, z);
        tPos[k + 2] = z;
      }
    }
    const tIdx: number[] = [];
    for (let j = 0; j < segZ; j++) {
      for (let i = 0; i < segX; i++) {
        const a = j * nx + i;
        const b = a + 1;
        const c = a + nx;
        const d = c + 1;
        tIdx.push(a, b, c, b, d, c);
      }
    }
    const terrainGeo = new THREE.BufferGeometry();
    terrainGeo.setAttribute("position", new THREE.BufferAttribute(tPos, 3));
    terrainGeo.setIndex(tIdx);
    terrainGeo.computeVertexNormals();
    this.scene.add(new THREE.Mesh(terrainGeo, this.litMaterial("TERRAIN")));

    // Terrain height map for the water shader (shore foam, shallows, ice)
    const dRes = tier.depthTex;
    const rect = { x0: -110, z0: -170, w: 220, h: 216 };
    const dData = new Uint8Array(dRes * dRes);
    for (let j = 0; j < dRes; j++) {
      for (let i = 0; i < dRes; i++) {
        const h = terrainHeight(rect.x0 + ((i + 0.5) / dRes) * rect.w, rect.z0 + ((j + 0.5) / dRes) * rect.h);
        dData[j * dRes + i] = Math.round(Math.min(Math.max((h + 6) / 8, 0), 1) * 255);
      }
    }
    const depthTex = new THREE.DataTexture(dData, dRes, dRes, THREE.RedFormat, THREE.UnsignedByteType);
    depthTex.minFilter = THREE.LinearFilter;
    depthTex.magFilter = THREE.LinearFilter;
    depthTex.needsUpdate = true;
    this.u.uDepthTex.value = depthTex;
    (this.u.uDepthRect.value as THREE.Vector4).set(rect.x0, rect.z0, 1 / rect.w, 1 / rect.h);

    // Sea — vertex swell, analytic ripples, planar reflection, foam, ice
    const waterGeo = new THREE.PlaneGeometry(760, 520, tier.waterSeg, Math.round(tier.waterSeg * 0.7));
    waterGeo.rotateX(-Math.PI / 2);
    const waterDefines: Record<string, number> = { FBM_OCT: tier.fbmOct };
    if (this.reflRT) waterDefines.USE_REFL = 1;
    this.water = new THREE.Mesh(
      waterGeo,
      new THREE.ShaderMaterial({
        defines: waterDefines,
        uniforms: this.u,
        vertexShader: /* glsl */ `
          uniform float uTime;
          varying vec3 vWP;
          varying vec3 vN;

          float wh(vec2 p, float t) {
            float h = 0.0;
            h += sin(dot(p, vec2(0.11, 0.052)) + t * 0.9) * 0.10;
            h += sin(dot(p, vec2(-0.06, 0.14)) + t * 1.25) * 0.06;
            h += sin(dot(p, vec2(0.21, -0.18)) + t * 1.7) * 0.035;
            return h;
          }

          void main() {
            vec4 wp0 = modelMatrix * vec4(position, 1.0);
            float e = 0.6;
            float h0 = wh(wp0.xz, uTime);
            float hx = wh(wp0.xz + vec2(e, 0.0), uTime);
            float hz = wh(wp0.xz + vec2(0.0, e), uTime);
            vN = normalize(vec3(-(hx - h0) / e, 1.0, -(hz - h0) / e));
            vWP = wp0.xyz + vec3(0.0, h0, 0.0);
            gl_Position = projectionMatrix * viewMatrix * vec4(vWP, 1.0);
          }
        `,
        fragmentShader:
          COMMON_GLSL +
          SKY_GLSL +
          LIGHT_GLSL +
          /* glsl */ `
          uniform vec3 uDeep;
          uniform vec3 uShallow;
          uniform sampler2D uRefl;
          uniform mat4 uReflVP;
          uniform sampler2D uDepthTex;
          uniform vec4 uDepthRect;
          varying vec3 vWP;
          varying vec3 vN;

          vec2 wv(vec2 p, vec2 d, float f, float a, float s) {
            return d * (f * a * cos(dot(p, d) * f + uTime * s));
          }

          void main() {
            vec3 toCam = cameraPosition - vWP;
            float dist = length(toCam);
            vec3 V = toCam / dist;

            vec2 g = wv(vWP.xz, vec2(0.8, 0.6), 0.9, 0.05, 1.3)
              + wv(vWP.xz, vec2(-0.5, 0.866), 1.6, 0.025, 1.9)
              + wv(vWP.xz, vec2(0.96, -0.28), 2.7, 0.012, 2.6)
              + wv(vWP.xz, vec2(-0.2, -0.98), 4.3, 0.006, 3.4);
            float n1 = vnoise(vWP.xz * 1.6 + vec2(uTime * 0.5, 0.0));
            float n2 = vnoise(vWP.xz * 2.3 - vec2(0.0, uTime * 0.42));
            vec3 N = normalize(vN + vec3(-g.x + (n1 - 0.5) * 0.18, 0.0, -g.y + (n2 - 0.5) * 0.18));
            N = normalize(mix(N, vec3(0.0, 1.0, 0.0), smoothstep(60.0, 260.0, dist) * 0.8));

            vec2 duv = (vWP.xz - uDepthRect.xy) * uDepthRect.zw;
            float th = -3.2;
            if (duv.x > 0.0 && duv.x < 1.0 && duv.y > 0.0 && duv.y < 1.0) {
              th = texture2D(uDepthTex, duv).r * 8.0 - 6.0;
            }
            float depth = max(-th, 0.0);

            float F = 0.03 + 0.97 * pow(1.0 - max(dot(V, N), 0.0), 4.0);
          #ifdef USE_REFL
            vec4 rc = uReflVP * vec4(vWP.x, 0.0, vWP.z, 1.0);
            vec2 ruv = rc.xy / rc.w * 0.5 + 0.5 + N.xz * (0.06 / (1.0 + dist * 0.02));
            vec3 refl = texture2D(uRefl, clamp(ruv, 0.002, 0.998)).rgb;
          #else
            vec3 rdir = reflect(-V, N);
            rdir.y = abs(rdir.y) + 0.02;
            vec3 refl = skyColor(normalize(rdir), 0.0);
          #endif
            vec3 body = mix(uShallow * 1.25, uDeep, smoothstep(0.0, 3.0, depth));
            vec3 col = mix(body, refl, clamp(F * 1.1, 0.0, 0.95));

            // Glitter path toward the moon / sun (HDR sparkles bloom)
            vec3 gN = normalize(vN + vec3(-g.x * 2.2 + (n1 - 0.5) * 0.55, 0.0, -g.y * 2.2 + (n2 - 0.5) * 0.55));
            float spec = pow(max(dot(reflect(-V, gN), normalize(uDiscDir)), 0.0), 380.0);
            col += uDiscColor * spec * 3.0;

            // Shore foam lapping in bands
            vec3 lightCol = uAmbient + uKeyColor * uKeyIntensity * 0.5;
            float fn = vnoise(vWP.xz * 3.0 + vec2(uTime * 0.3, -uTime * 0.2));
            float foam = smoothstep(0.45, 0.0, depth)
              * smoothstep(0.35, 0.75, fn + 0.35 * sin(depth * 22.0 - uTime * 1.8));
            col = mix(col, vec3(0.9) * lightCol * 1.4, foam * 0.75);

            // Winter: shore ice sheets with cracks
            if (uSnow > 0.01) {
              float edge = 1.1 + (vnoise(vWP.xz * 0.35) - 0.5) * 1.2;
              float ice = uSnow * smoothstep(edge, edge - 0.35, depth);
              float crack = smoothstep(0.03, 0.0, abs(vnoise(vWP.xz * 1.7) - 0.5));
              vec3 iceAlb = mix(vec3(0.62, 0.74, 0.86), vec3(0.88, 0.92, 0.97), vnoise(vWP.xz * 0.9));
              iceAlb *= 1.0 - crack * 0.4;
              vec3 iceCol = shade(iceAlb, vec3(0.0, 1.0, 0.0), vWP, 1.0, 0.2, 0.6) + refl * 0.15;
              col = mix(col, iceCol, ice);
            }

            col = applyFog(col, vWP);
            ${DITHER_GLSL}
            gl_FragColor = vec4(col, 1.0);
          }
        `,
      }),
    );
    this.water.position.set(0, 0, -170);
    this.scene.add(this.water);

    // Forest — Norway spruce, Scots pine and birch, instanced per species
    type Patch = {
      x0: number; x1: number; z0: number; z1: number; s0: number; s1: number; count: number;
      mix: [number, number, number]; // spruce / Scots pine / birch weights
    };
    const patches: Patch[] = [
      // Foreground fringe along the shoreline (main land mass on phones)
      { x0: -40, x1: 44, z0: 18, z1: 29, s0: 1.8, s1: 3.6, count: 46, mix: [0.45, 0.25, 0.3] },
      // Near framing groves (flank the hero text corridor)
      { x0: -46, x1: -14, z0: 2, z1: 28, s0: 2.8, s1: 5.4, count: 36, mix: [0.4, 0.3, 0.3] },
      { x0: 14, x1: 46, z0: 2, z1: 28, s0: 2.8, s1: 5.4, count: 36, mix: [0.4, 0.3, 0.3] },
      // Mid groves
      { x0: -74, x1: -30, z0: -58, z1: -128, s0: 3.8, s1: 7.0, count: 44, mix: [0.5, 0.3, 0.2] },
      { x0: 30, x1: 74, z0: -58, z1: -128, s0: 3.8, s1: 7.0, count: 44, mix: [0.5, 0.3, 0.2] },
      // Islands and far shoreline forest
      { x0: -88, x1: -56, z0: -170, z1: -180, s0: 4.5, s1: 7.0, count: 18, mix: [0.6, 0.4, 0] },
      { x0: -250, x1: 250, z0: -206, z1: -230, s0: 5.0, s1: 9.0, count: 130, mix: [0.65, 0.35, 0] },
    ];
    // Near groves get detailed foliage; mid/far groves a low-poly LOD
    // (separate geometries: each InstancedMesh owns its aTint attribute)
    const spruce = makeSpruce(rng);
    const lods = [
      [spruce, makeScotsPine(rng, 1), makeBirch(rng, 1)],
      [spruce.clone(), makeScotsPine(rng, 0), makeBirch(rng, 0)],
    ];
    const placed: Array<Array<{ m: THREE.Matrix4; tint: number }>> = [[], [], [], [], [], []];
    const dummy = new THREE.Object3D();
    for (const p of patches) {
      for (let i = 0, tries = 0; i < p.count && tries < p.count * 8; tries++) {
        const x = p.x0 + rng() * (p.x1 - p.x0);
        const z = p.z0 + rng() * (p.z1 - p.z0);
        const h = terrainHeight(x, z);
        // Keep the centre sightline over the sea open
        if (h < 0.35 || (z > 15 && Math.abs(x) < 4)) continue;
        const r = rng() * (p.mix[0] + p.mix[1] + p.mix[2]);
        const sp = r < p.mix[0] ? 0 : r < p.mix[0] + p.mix[1] ? 1 : 2;
        const s = (p.s0 + rng() * (p.s1 - p.s0)) * (sp === 1 ? 1.15 : 1);
        dummy.position.set(x, h - 0.15, z);
        dummy.scale.set(s * (0.8 + rng() * 0.4), s, s * (0.8 + rng() * 0.4));
        dummy.rotation.set((rng() - 0.5) * 0.06, rng() * Math.PI * 2, (rng() - 0.5) * 0.06);
        dummy.updateMatrix();
        placed[sp + (p.z0 < -50 ? 3 : 0)].push({ m: dummy.matrix.clone(), tint: rng() });
        i++;
      }
    }
    const treeMat = this.litMaterial("TREE");
    lods.flat().forEach((geo, k) => {
      if (placed[k].length > 0) this.scene.add(instanced(geo, treeMat, placed[k]));
      else geo.dispose();
    });

    // Glacial erratic boulders (rändrahnud) along the waterline
    const rocks: Array<{ m: THREE.Matrix4; tint: number }> = [];
    for (let tries = 0; rocks.length < 26 && tries < 2000; tries++) {
      const x = (rng() * 2 - 1) * 60;
      const z = 34 - rng() * 70;
      const h = terrainHeight(x, z);
      if (h < -0.4 || h > 0.9) continue;
      const s = 0.35 + Math.pow(rng(), 2.2) * 1.4;
      dummy.position.set(x, h - s * 0.25, z);
      dummy.scale.set(s * (0.9 + rng() * 0.5), s * (0.6 + rng() * 0.3), s * (0.9 + rng() * 0.5));
      dummy.rotation.set(0, rng() * Math.PI * 2, 0);
      dummy.updateMatrix();
      rocks.push({ m: dummy.matrix.clone(), tint: rng() });
    }
    this.scene.add(instanced(makeBoulder(), this.litMaterial("ROCK"), rocks));

    // Reed and shore-grass tufts, clumped into meadows and (mostly) reed beds
    // along the waterline
    const tufts: Array<{ m: THREE.Matrix4; tint: number }> = [];
    let cx = 0;
    let cz = 0;
    let inCluster = 0;
    for (let tries = 0; tufts.length < tier.grass && tries < tier.grass * 12; tries++) {
      if (inCluster === 0) {
        const shore = rng() < 0.6;
        for (let k = 0; k < 60; k++) {
          cx = (rng() * 2 - 1) * 48;
          cz = 36 - rng() * 40;
          const ch = terrainHeight(cx, cz);
          if (shore ? ch > 0.05 && ch < 0.9 : ch > 0.1 && ch < 3.5) break;
        }
      }
      const x = cx + (rng() + rng() - 1) * 7;
      const z = cz + (rng() + rng() - 1) * 5;
      const h = terrainHeight(x, z);
      if (h < 0.08 || h > 3.6) continue;
      inCluster = (inCluster + 1) % 24;
      const s = 0.45 + rng() * 0.6;
      dummy.position.set(x, h - 0.05, z);
      dummy.scale.set(s, s * (0.8 + rng() * 0.7), s);
      dummy.rotation.set(0, rng() * Math.PI * 2, 0);
      dummy.updateMatrix();
      tufts.push({ m: dummy.matrix.clone(), tint: rng() });
    }
    if (tufts.length > 0) {
      this.grass = instanced(makeTuft(rng), this.litMaterial("GRASS"), tufts);
      this.scene.add(this.grass);
    }

    // Seasonal particles (snow / petals / fireflies / leaves) — GPU-animated
    const count = tier.particles;
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
        uniforms: this.u,
        transparent: true,
        depthWrite: false,
        // Premultiplied: uParticleAdditive blends additive glow ↔ opaque leaves
        blending: THREE.CustomBlending,
        blendEquation: THREE.AddEquation,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneMinusSrcAlphaFactor,
        vertexShader: /* glsl */ `
          uniform float uTime;
          uniform float uParticleFall;
          uniform float uParticleSway;
          uniform float uParticleSize;
          uniform float uParticleOpacity;
          uniform vec3 uColorA;
          uniform vec3 uColorB;
          uniform float uParticleYMin;
          uniform float uParticleYRange;
          uniform float uParticleTwinkle;
          uniform float uParticleGlow;
          uniform float uPxScale;
          attribute float aSeed;
          attribute float aSize;
          attribute float aMix;
          varying vec3 vColor;
          varying float vAlpha;
          varying float vSpin;
          varying float vFlip;
          varying float vBokeh;

          void main() {
            float seed = aSeed;
            vec3 pos = position;
            float speedVar = 0.6 + fract(seed * 7.31) * 0.9;
            pos.y = uParticleYMin + mod(position.y - uTime * uParticleFall * speedVar, uParticleYRange);
            float sway = uParticleSway * (1.0 + fract(seed * 3.7));
            pos.x += sin(uTime * (0.4 + fract(seed * 5.3)) + seed * 6.2831) * sway;
            pos.z += cos(uTime * (0.3 + fract(seed * 9.1)) + seed * 3.14) * sway * 0.6;

            vec4 mv = modelViewMatrix * vec4(pos, 1.0);
            float depth = max(-mv.z, 1.0);
            // Near particles fall out of focus: bigger, softer, dimmer
            vBokeh = smoothstep(10.0, 3.0, depth);
            gl_PointSize = clamp(uParticleSize * aSize * (160.0 / depth) * (1.0 + vBokeh * 2.0) * uPxScale, 1.0, 64.0);
            vAlpha = uParticleOpacity * (1.0 - vBokeh * 0.6);
            if (uParticleTwinkle > 0.01) {
              float tw = sin(uTime * uParticleTwinkle * (0.6 + fract(seed * 4.4)) + seed * 40.0);
              vAlpha *= 0.2 + 0.8 * pow(0.5 + 0.5 * tw, 2.0);
            }
            vSpin = uTime * (0.6 + fract(seed * 2.9) * 1.6) + seed * 6.2831;
            vFlip = uTime * (1.1 + fract(seed * 6.1) * 1.8) + seed * 3.0;
            vColor = mix(uColorA, uColorB, aMix) * uParticleGlow;
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uParticleShape;
          uniform float uParticleAdditive;
          varying vec3 vColor;
          varying float vAlpha;
          varying float vSpin;
          varying float vFlip;
          varying float vBokeh;
          void main() {
            vec2 pc = gl_PointCoord - 0.5;
            float round = smoothstep(0.5, mix(0.12, 0.38, vBokeh), length(pc));
            // Tumbling leaf / petal: rotated, pinched ellipse with a midrib
            float cs = cos(vSpin);
            float sn = sin(vSpin);
            vec2 q = vec2(cs * pc.x - sn * pc.y, sn * pc.x + cs * pc.y);
            q.x /= max(abs(cos(vFlip)), 0.2);
            float leafD = length(vec2(q.x * 2.3, q.y)) + abs(q.y) * abs(q.x) * 3.0;
            float leaf = smoothstep(0.5, 0.42, leafD);
            float a = mix(round, leaf, uParticleShape) * vAlpha;
            if (a < 0.01) discard;
            vec3 c = vColor * mix(1.0, 0.75 + 0.25 * smoothstep(0.0, 0.05, abs(q.x)), uParticleShape);
            gl_FragColor = vec4(c * a, a * (1.0 - uParticleAdditive));
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
    for (const k of COLOR_KEYS) (this.u[this.colorUniform[k]].value as THREE.Color).copy(c[k]);
    for (const k of NUM_KEYS) this.u[numUniform(k)].value = n[k];
    (this.u.uDiscDir.value as THREE.Vector3).copy(discDirection(n.discElev, n.discAzim));
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
    // Establishing shot: ease in from high and wide, then idle drift + handheld
    const k = this.reducedMotion ? 1 : Math.min(t / INTRO_S, 1);
    const intro = 1 - (1 - k) * (1 - k) * (1 - k);
    const driftX = Math.sin(t * 0.07) * 1.1 + Math.sin(t * 0.83) * 0.03;
    const driftY = Math.sin(t * 0.05 + 1.3) * 0.35 + Math.sin(t * 1.13) * 0.02;
    const px = this.pointerActive ? this.pointer.x * 2.4 : 0;
    const py = this.pointerActive ? this.pointer.y * 0.9 : 0;
    const targetX = driftX + px;
    const targetY = 4.4 + driftY - py + (1 - intro) * 5;
    const targetZ = 34 + (1 - intro) * 14;
    if (t < 0.05 || this.reducedMotion) {
      this.camera.position.set(targetX, targetY, targetZ);
    } else {
      this.camera.position.x += (targetX - this.camera.position.x) * 0.035;
      this.camera.position.y += (targetY - this.camera.position.y) * 0.035;
      this.camera.position.z += (targetZ - this.camera.position.z) * 0.08;
    }
    this.camera.lookAt(0, this.lookAtY - (1 - intro) * 2, -100);
  }

  // Mirror camera for the planar water reflection: same frustum, mirrored
  // through y = 0; the water shader projects its surface points with it.
  private updateReflectionCamera() {
    const cam = this.camera;
    const rc = this.reflCamera;
    rc.fov = cam.fov;
    rc.aspect = cam.aspect;
    rc.position.set(cam.position.x, -cam.position.y, cam.position.z);
    cam.getWorldDirection(this.tmpF);
    this.tmpV.copy(rc.position).add(this.tmpF.set(this.tmpF.x, -this.tmpF.y, this.tmpF.z));
    rc.lookAt(this.tmpV);
    rc.updateProjectionMatrix();
    rc.updateMatrixWorld();
    (this.u.uReflVP.value as THREE.Matrix4).multiplyMatrices(rc.projectionMatrix, rc.matrixWorldInverse);
  }

  // Screen position of the moon/sun for god rays and lens ghosts; 0 when
  // it is far off screen or behind the camera.
  private discVisibility(): number {
    const dir = this.u.uDiscDir.value as THREE.Vector3;
    this.camera.getWorldDirection(this.tmpF);
    if (dir.dot(this.tmpF) <= 0) return 0;
    this.tmpV.copy(dir).multiplyScalar(500).add(this.camera.position).project(this.camera);
    this.discUV.set(this.tmpV.x * 0.5 + 0.5, this.tmpV.y * 0.5 + 0.5);
    const edge = Math.max(Math.abs(this.tmpV.x), Math.abs(this.tmpV.y));
    return 1 - smoothstep(1.0, 1.9, edge);
  }

  // Public: also called by the component on scroll when reduced motion
  // freezes the render loop.
  syncScrollFade() {
    if (!this.heroMarker) {
      this.heroMarker = document.getElementById("estonia-bg-hero-marker");
    }
    if (!this.switcherEl) {
      this.switcherEl = document.getElementById("estonia-season-switcher");
    }
    if (!this.heroMarker) return;
    const rect = this.heroMarker.getBoundingClientRect();
    const vh = window.innerHeight;
    const fadeStart = vh * 0.3;
    const fadeEnd = vh * 0.15; // fully gone while the hero tail is 15% vh above the fold
    let opacity = 1;
    if (rect.bottom <= fadeEnd) opacity = 0;
    else if (rect.bottom < fadeStart) {
      opacity = (rect.bottom - fadeEnd) / (fadeStart - fadeEnd);
    }
    this.bgOpacity = opacity;
    this.wrapper.style.opacity = String(opacity);
    // The switcher controls the background — hide it once the background
    // is gone, or the moment it would sit on the footer's social icons.
    if (this.switcherEl) {
      if (opacity > 0.05 && this.overlapsFooterIcons(this.switcherEl)) opacity = 0;
      this.switcherEl.style.opacity = String(opacity);
      this.switcherEl.style.visibility = opacity < 0.05 ? "hidden" : "visible";
    }
  }

  private overlapsFooterIcons(switcherEl: HTMLElement): boolean {
    if (!this.footerIcons) {
      this.footerIcons = Array.from(
        document.querySelectorAll<HTMLAnchorElement>("footer a svg"),
      )
        .map((svg) => svg.parentElement)
        .filter((el): el is HTMLAnchorElement => el !== null);
    }
    const sw = switcherEl.getBoundingClientRect();
    for (const icon of this.footerIcons) {
      const r = icon.getBoundingClientRect();
      if (r.bottom < sw.top || r.top > sw.bottom || r.right < sw.left || r.left > sw.right) {
        continue; // no intersection
      }
      return true;
    }
    return false;
  }

  private renderFrame(now: number) {
    this.syncScrollFade();
    // Scrolled past the hero: the canvas is invisible, save the battery.
    if (this.bgOpacity <= 0 && this.running) return;

    const t = (now - this.t0) / 1000;
    this.updateTransition(now);
    this.updateCamera(t);
    this.u.uTime.value = t;

    if (this.reflRT) {
      this.updateReflectionCamera();
      this.water.visible = false;
      if (this.grass) this.grass.visible = false;
      this.u.uClipY.value = -0.05;
      this.renderer.setRenderTarget(this.reflRT);
      this.renderer.render(this.scene, this.reflCamera);
      this.u.uClipY.value = -1e4;
      this.water.visible = true;
      if (this.grass) this.grass.visible = true;
    }

    this.renderer.setRenderTarget(this.post.sceneRT);
    this.renderer.render(this.scene, this.camera);

    const vis = this.discVisibility();
    const n = this.current.nums;
    this.post.render({
      time: t,
      bloom: n.bloom,
      rays: n.godRays * vis,
      flare: n.bloom * vis * 0.25,
      discUV: this.discUV,
      discColor: this.current.colors.discColor,
    });
  }

  // Dynamic resolution: drop internal resolution when renders arrive
  // noticeably later than the fps cap allows on this display's refresh.
  // Median over a window, two slow windows in a row: one-off hitches
  // (screenshots, GC, tab switches) never trigger it.
  private trackPerformance(timestamp: number) {
    const dt = timestamp - this.lastRenderTs;
    this.lastRenderTs = timestamp;
    if (dt <= 0 || dt > 250) return;
    this.perfSamples.push(dt);
    if (this.perfSamples.length < 45) return;
    this.perfSamples.sort((a, b) => a - b);
    const median = this.perfSamples[this.perfSamples.length >> 1];
    this.perfSamples.length = 0;
    const expected = Math.ceil((1000 / this.tier.fps - 2) / this.vsync) * this.vsync;
    this.slowWindows = median > expected * 1.25 ? this.slowWindows + 1 : 0;
    if (this.slowWindows >= 2 && this.renderScale > MIN_RENDER_SCALE) {
      this.slowWindows = 0;
      this.renderScale = Math.max(MIN_RENDER_SCALE, this.renderScale - 0.1);
      this.degraded = true;
      this.resizeTargets();
    }
  }

  private animate = (timestamp: number) => {
    if (!this.running) return;
    const rafDt = timestamp - this.lastRafTs;
    this.lastRafTs = timestamp;
    // Display refresh (≤ 144 Hz); shorter gaps are back-to-back catch-up frames
    if (rafDt > 6.5 && rafDt < this.vsync) this.vsync = rafDt;
    const delta = timestamp - this.lastFrame;
    // 2 ms tolerance locks the cap onto whole vsyncs (30 fps = every 2nd at 60 Hz)
    if (delta >= 1000 / this.tier.fps - 2) {
      this.lastFrame = timestamp;
      this.renderFrame(timestamp);
      if (this.bgOpacity > 0) this.trackPerformance(timestamp);
      else this.lastRenderTs = 0;
    }
    this.animId = requestAnimationFrame(this.animate);
  };

  start() {
    if (this.reducedMotion) return;
    if (this.running) return;
    this.running = true;
    this.lastFrame = 0;
    this.lastRenderTs = 0;
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

  private resizeTargets() {
    const size = this.renderer.getDrawingBufferSize(this.tmpV2);
    const w = Math.max(1, Math.round(size.x * this.renderScale));
    const h = Math.max(1, Math.round(size.y * this.renderScale));
    this.post.setSize(w, h);
    this.reflRT?.setSize(
      Math.max(1, Math.round(w * this.tier.reflScale)),
      Math.max(1, Math.round(h * this.tier.reflScale)),
    );
    // Point sprites keep their CSS-pixel size across DPR and render scale
    this.u.uPxScale.value = (0.5 * h) / window.innerHeight;
  }

  private tmpV2 = new THREE.Vector2();

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.tier.dprCap));
    this.renderer.setSize(w, h);
    const size = this.renderer.getDrawingBufferSize(this.tmpV2);
    // Start inside the tier's pixel budget; dynamic resolution adapts from there.
    this.maxScale = Math.min(1, Math.sqrt(this.tier.pixelBudget / (size.x * size.y)));
    this.renderScale = this.degraded
      ? Math.min(Math.max(this.renderScale, MIN_RENDER_SCALE), this.maxScale)
      : this.maxScale;
    this.resizeTargets();

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
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else if (mat) mat.dispose();
    });
    (this.u.uDepthTex.value as THREE.Texture | null)?.dispose();
    this.reflRT?.dispose();
    this.post.dispose();
    this.renderer.dispose();
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function numUniform(k: NumKey): string {
  return "u" + k[0].toUpperCase() + k.slice(1);
}

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

function instanced(
  geo: THREE.BufferGeometry,
  mat: THREE.Material,
  list: Array<{ m: THREE.Matrix4; tint: number }>,
): THREE.InstancedMesh {
  const mesh = new THREE.InstancedMesh(geo, mat, list.length);
  const tints = new Float32Array(list.length);
  list.forEach((it, i) => {
    mesh.setMatrixAt(i, it.m);
    tints[i] = it.tint;
  });
  geo.setAttribute("aTint", new THREE.InstancedBufferAttribute(tints, 1));
  mesh.instanceMatrix.needsUpdate = true;
  mesh.computeBoundingSphere();
  return mesh;
}

// ── Procedural models ───────────────────────────────────────────────────────
// Each part carries aPart (0 spruce bark, 1 needles, 2 birch leaves, 3 birch
// bark, 4 Scots pine bark), aAO (baked occlusion) and aCenter (leaf-blob
// centre, for seasonal growth). Models are ~1 unit tall, base at y = 0.

function tagPart(
  g: THREE.BufferGeometry,
  part: number,
  ao: (x: number, y: number, z: number) => number,
  center = new THREE.Vector3(),
): THREE.BufferGeometry {
  const ng = g.index ? g.toNonIndexed() : g;
  ng.deleteAttribute("uv");
  const pos = ng.attributes.position;
  const n = pos.count;
  const aPart = new Float32Array(n).fill(part);
  const aAO = new Float32Array(n);
  const aCenter = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    aAO[i] = ao(pos.getX(i), pos.getY(i), pos.getZ(i));
    aCenter[i * 3] = center.x;
    aCenter[i * 3 + 1] = center.y;
    aCenter[i * 3 + 2] = center.z;
  }
  ng.setAttribute("aPart", new THREE.BufferAttribute(aPart, 1));
  ng.setAttribute("aAO", new THREE.BufferAttribute(aAO, 1));
  ng.setAttribute("aCenter", new THREE.BufferAttribute(aCenter, 3));
  return ng;
}

function mergeParts(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const merged = mergeGeometries(parts);
  for (const g of parts) g.dispose();
  if (!merged) throw new Error("[estonia-scene] model merge failed");
  return merged;
}

// Branch (limb) cylinder from a to b.
function limb(a: THREE.Vector3, b: THREE.Vector3, r0: number, r1: number): THREE.BufferGeometry {
  const len = a.distanceTo(b);
  const g = new THREE.CylinderGeometry(r1, r0, len, 5, 1, true);
  g.translate(0, len / 2, 0);
  const q = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    b.clone().sub(a).normalize(),
  );
  g.applyQuaternion(q);
  g.translate(a.x, a.y, a.z);
  return g;
}

// Lumpy foliage blob. Normals blend the blob's own sphere with a sphere
// around the whole crown, so clusters shade as one canopy (lit crown top,
// shaded underside) instead of a bunch of separate balls.
function blob(
  rng: () => number,
  c: THREE.Vector3,
  r: number,
  sy: number,
  crown: THREE.Vector3,
  crownBlend: number,
  detail: number,
): THREE.BufferGeometry {
  const g = new THREE.IcosahedronGeometry(1, detail);
  const pos = g.attributes.position;
  const nrm = g.attributes.normal;
  const seed = rng() * 100;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const k = 1 + (noise2(x * 2.1 + seed, z * 2.1 + y * 1.7) - 0.5) * 0.55;
    const px = c.x + x * r * k;
    const py = c.y + y * r * sy * k;
    const pz = c.z + z * r * k;
    pos.setXYZ(i, px, py, pz);
    const cx = px - crown.x;
    const cy = (py - crown.y) * 1.4;
    const cz = pz - crown.z;
    const cl = Math.hypot(cx, cy, cz) || 1;
    const by = y / sy;
    const bl = Math.hypot(x, by, z);
    const w = crownBlend;
    const jx = (x / bl) * (1 - w) + (cx / cl) * w + (noise2(x * 4 + seed, y * 4) - 0.5) * 0.5;
    const jy = (by / bl) * (1 - w) + (cy / cl) * w + (noise2(y * 4 + seed, z * 4) - 0.5) * 0.35 + 0.1;
    const jz = (z / bl) * (1 - w) + (cz / cl) * w + (noise2(z * 4 + seed, x * 4) - 0.5) * 0.5;
    const nl = Math.hypot(jx, jy, jz);
    nrm.setXYZ(i, jx / nl, jy / nl, jz / nl);
  }
  return g;
}

function makeSpruce(rng: () => number): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const trunk = new THREE.CylinderGeometry(0.028, 0.055, 1.0, 6, 1, true);
  trunk.translate(0, 0.5, 0);
  parts.push(tagPart(trunk, 0, () => 0.5));
  const tiers = 7;
  for (let i = 0; i < tiers; i++) {
    const t = i / (tiers - 1);
    const r = 0.38 * Math.pow(1 - t, 0.95) + 0.05;
    const h = 0.3 - t * 0.08;
    const y = 0.16 + t * 0.8;
    const cone = new THREE.ConeGeometry(r, h, 11, 1, false);
    const pos = cone.attributes.position;
    // Ragged, drooping branch tips around the skirt of each tier
    for (let v = 0; v < pos.count; v++) {
      const vy = pos.getY(v);
      if (vy > -h / 2 + 1e-4) continue;
      const x = pos.getX(v);
      const z = pos.getZ(v);
      const a = Math.atan2(z, x);
      const k = 1 + 0.22 * Math.sin(a * 5 + i * 1.7) + (rng() - 0.5) * 0.14;
      pos.setXYZ(v, x * k, vy - 0.05 * k, z * k);
    }
    cone.computeVertexNormals();
    cone.rotateY(i * 0.9);
    const g = tagPart(cone, 1, (x, vy, z) => {
      const radial = Math.min(Math.hypot(x, z) / r, 1);
      return (0.35 + 0.65 * radial) * (0.7 + 0.3 * t) * (vy < -h / 2 + 0.01 && radial < 0.2 ? 0.4 : 1);
    });
    g.translate(0, y, 0);
    parts.push(g);
  }
  return mergeParts(parts);
}

function makeScotsPine(rng: () => number, detail: number): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  // Tall, slightly bent bare trunk — the classic Pirita coastal pine
  const bend = (y: number) => Math.sin(y * 3.2) * 0.05 * y;
  const trunk = new THREE.CylinderGeometry(0.02, 0.045, 0.86, 6, 5, true);
  trunk.translate(0, 0.43, 0);
  const tp = trunk.attributes.position;
  for (let i = 0; i < tp.count; i++) tp.setX(i, tp.getX(i) + bend(tp.getY(i)));
  trunk.computeVertexNormals();
  parts.push(tagPart(trunk, 4, (_x, y) => 0.45 + 0.4 * y));
  // Flat, layered needle clumps on short limbs: an irregular umbrella crown
  const clumps = detail > 0 ? 11 : 7;
  const crownC = new THREE.Vector3(bend(0.75), 0.75, 0);
  for (let i = 0; i < clumps; i++) {
    const y0 = 0.6 + (i / clumps) * 0.3;
    const a = i * 2.39996 + rng() * 0.5;
    const reach = (i === clumps - 1 ? 0.02 : 0.08 + rng() * 0.13) * (1.15 - (i / clumps) * 0.5);
    const p0 = new THREE.Vector3(bend(y0), y0, 0);
    const c = new THREE.Vector3(p0.x + Math.cos(a) * reach, y0 + 0.04 + rng() * 0.05, Math.sin(a) * reach);
    if (reach > 0.05) parts.push(tagPart(limb(p0, c, 0.01, 0.005), 4, () => 0.5));
    const r = (0.06 + rng() * 0.045) * (detail > 0 ? 1 : 1.25);
    parts.push(
      tagPart(blob(rng, c, r, 0.5, crownC, 0.55, detail), 1, (x, y, z) => {
        const up = Math.min(Math.max((y - c.y) / (r * 0.5) * 0.5 + 0.5, 0), 1);
        const out = Math.min(Math.hypot(x - p0.x, z) / (reach + r), 1);
        return 0.3 + 0.4 * up + 0.3 * out;
      }),
    );
  }
  return mergeParts(parts);
}

function makeBirch(rng: () => number, detail: number): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const lean = (rng() - 0.5) * 0.08;
  const trunk = new THREE.CylinderGeometry(0.014, 0.03, 0.97, 6, 4, true);
  trunk.translate(0, 0.485, 0);
  const tp = trunk.attributes.position;
  for (let i = 0; i < tp.count; i++) tp.setX(i, tp.getX(i) + lean * tp.getY(i));
  trunk.computeVertexNormals();
  parts.push(tagPart(trunk, 3, () => 0.75));
  // Bare-winter structure: upswept limbs; leaf clusters hang along them in
  // a tall ovoid crown
  const limbs = 7;
  const crownC = new THREE.Vector3(lean * 0.72, 0.72, 0);
  for (let i = 0; i < limbs; i++) {
    const y0 = 0.36 + (i / limbs) * 0.5;
    const a = i * 2.39996 + rng() * 0.6;
    const len = (0.13 + rng() * 0.12) * (1.1 - (i / limbs) * 0.45);
    const p0 = new THREE.Vector3(lean * y0, y0, 0);
    const dir = new THREE.Vector3(Math.cos(a), 1.1, Math.sin(a)).normalize();
    const p1 = p0.clone().addScaledVector(dir, len);
    parts.push(tagPart(limb(p0, p1, 0.008, 0.0035), 3, () => 0.65));
    const clusters = detail > 0 ? 4 : 2;
    for (let k = 0; k < clusters; k++) {
      const f = 0.3 + ((k + 0.5) / clusters) * 0.85;
      const c = p0.clone().lerp(p1, f);
      c.x += (rng() - 0.5) * 0.07;
      c.z += (rng() - 0.5) * 0.07;
      c.y -= 0.02 + rng() * 0.03; // weeping
      const r = (0.05 + rng() * 0.04) * (detail > 0 ? 1 : 1.35);
      parts.push(
        tagPart(
          blob(rng, c, r, 1.25, crownC, 0.65, detail),
          2,
          (_x, y) => 0.45 + 0.55 * Math.min(Math.max((y - 0.4) / 0.6, 0), 1),
          c,
        ),
      );
    }
  }
  const top = new THREE.Vector3(lean * 0.98, 0.98, 0);
  parts.push(tagPart(blob(rng, top, 0.07, 1.5, crownC, 0.65, detail), 2, () => 1, top));
  return mergeParts(parts);
}

function makeBoulder(): THREE.BufferGeometry {
  let g: THREE.BufferGeometry = new THREE.IcosahedronGeometry(1, 2);
  g.deleteAttribute("normal");
  g.deleteAttribute("uv");
  g = mergeVertices(g);
  const pos = g.attributes.position;
  const ao = new Float32Array(pos.count);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const k = 1 + (noise2(x * 1.7 + 3, z * 1.7 + y * 1.3) - 0.5) * 0.45 + (noise2(x * 5 + y * 3, z * 5) - 0.5) * 0.12;
    pos.setXYZ(i, x * k, y * k, z * k);
    ao[i] = 0.45 + 0.55 * Math.min(Math.max(y * 0.5 + 0.5, 0), 1);
  }
  g.computeVertexNormals();
  g.setAttribute("aAO", new THREE.BufferAttribute(ao, 1));
  return g;
}

// Reed / grass tuft: seven tapered blades fanning out from one root, facing
// assorted directions (rendered double-sided).
function makeTuft(rng: () => number): THREE.BufferGeometry {
  const pos: number[] = [];
  const nrm: number[] = [];
  const ao: number[] = [];
  const idx: number[] = [];
  const ts = [0, 0.4, 0.75];
  for (let b = 0; b < 7; b++) {
    const yaw = rng() * Math.PI * 2;
    const lean = 0.15 + rng() * 0.35;
    const height = 0.6 + rng() * 0.5;
    const cs = Math.cos(yaw);
    const sn = Math.sin(yaw);
    const base = pos.length / 3;
    const push = (lx: number, t: number) => {
      const lz = t * t * lean; // curve away from the root
      pos.push(lx * cs + lz * sn, t * height, -lx * sn + lz * cs);
      nrm.push(sn, 0, cs);
      ao.push(t);
    };
    for (const t of ts) {
      const w = 0.06 * (1 - t * 0.85);
      push(-w, t);
      push(w, t);
    }
    push(0, 1);
    for (const [a, b2, c] of [[0, 1, 2], [1, 3, 2], [2, 3, 4], [3, 5, 4], [4, 5, 6]]) {
      idx.push(base + a, base + b2, base + c);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nrm, 3));
  g.setAttribute("aAO", new THREE.Float32BufferAttribute(ao, 1));
  g.setIndex(idx);
  return g;
}

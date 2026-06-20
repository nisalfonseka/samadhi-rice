/**
 * skyCycle — maps a moment in Sri Lankan time (Asia/Colombo) to a full set of
 * sky-render values for the homepage hero: gradient stops, sun & moon position
 * along an arc, glow colour, horizon wash and star opacity.
 *
 * Astronomy (simplified for a hero, not an ephemeris):
 *   • Sunrise ≈ 06:00, sunset ≈ 18:00 (typical year-round in Sri Lanka).
 *   • The sun rises on the RIGHT, climbs to the top at noon, sets on the LEFT.
 *   • At dusk the moon rises on the right and tracks left through the night,
 *     setting near dawn — then the cycle repeats the next morning.
 *
 * Everything here is pure: same input → same output, safe to call on the server
 * for a sensible first paint and re-call on the client every minute.
 */

export interface SkyState {
  skyTop: string;
  skyMid: string;
  skyBottom: string;
  /** % from left / top of the hero box (CSS positions, translate -50/-50). */
  sunX: number;
  sunY: number;
  sunOpacity: number;
  moonX: number;
  moonY: number;
  moonOpacity: number;
  /** warm/cool disc-glow colour for whichever body is up. */
  glow: string;
  /** rgba wash painted along the horizon (strong at sunrise/sunset). */
  horizonGlow: string;
  starOpacity: number;

  /* ---- photo colour-grading (used when a real photo is the backdrop) ---- */
  /** CSS `filter` applied to the background photo for the current hour. */
  photoFilter: string;
  /** opacity of the warm golden soft-light wash (peaks at sunrise/sunset). */
  warmOpacity: number;
  /** opacity of the deep-navy multiply wash that brings on night. */
  nightOpacity: number;
  /** opacity of the warm light the sun casts into the scene (screen blend). */
  sunBloom: number;
  /** opacity of the cool moonlight cast into the scene (screen blend). */
  moonBloom: number;
}

/* ---- colour keyframes across 24h (hour → sky gradient stops) ---- */
interface SkyKey {
  h: number;
  top: string;
  mid: string;
  bottom: string;
}

const SKY: SkyKey[] = [
  { h: 0, top: "#0b1224", mid: "#121b30", bottom: "#1b2238" }, // deep night
  { h: 5, top: "#141d33", mid: "#2a2c46", bottom: "#4a3f55" }, // first light
  { h: 6, top: "#3f5179", mid: "#9d7a6f", bottom: "#e6a866" }, // sunrise glow
  { h: 8, top: "#5b80aa", mid: "#b7b6a8", bottom: "#ecd6a6" }, // early morning
  { h: 12, top: "#4d7ab0", mid: "#9cc0d6", bottom: "#dfe6d2" }, // bright midday
  { h: 15.5, top: "#5b82ab", mid: "#bcb893", bottom: "#ecd29a" }, // warm afternoon
  { h: 17.3, top: "#5a6a8c", mid: "#cf9152", bottom: "#f7b65e" }, // golden hour
  { h: 18.3, top: "#46406f", mid: "#cf6f37", bottom: "#fb9a44" }, // deep orange sunset
  { h: 19, top: "#26284d", mid: "#7a4450", bottom: "#b85a44" }, // afterglow
  { h: 20.2, top: "#141d36", mid: "#1d2742", bottom: "#2a3048" }, // nightfall
  { h: 24, top: "#0b1224", mid: "#121b30", bottom: "#1b2238" }, // wrap → 0
];

/* ------------------------------------------------------------ helpers ---- */

function clamp(x: number, lo = 0, hi = 1) {
  return Math.min(hi, Math.max(lo, x));
}

function smoothstep(a: number, b: number, x: number) {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return `rgb(${Math.round(lerp(r1, r2, t))}, ${Math.round(
    lerp(g1, g2, t),
  )}, ${Math.round(lerp(b1, b2, t))})`;
}

function mixRgba(a: string, b: string, t: number, alpha: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return `rgba(${Math.round(lerp(r1, r2, t))}, ${Math.round(
    lerp(g1, g2, t),
  )}, ${Math.round(lerp(b1, b2, t))}, ${alpha.toFixed(3)})`;
}

/** Decimal hour (0–24) in Sri Lanka, regardless of the viewer's own zone. */
export function colomboHours(now: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Colombo",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? "12");
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return h + m / 60;
}

/* ------------------------------------------------------------- engine ---- */

const ARC_EDGE = 25; // % from top at the rise/set corners (upper edges)
const ARC_PEAK = 8; // % from top at the top-middle apex
const X_RIGHT = 92; // % from left at rise (near the right corner/edge)
const X_LEFT = 8; // % from left at set (near the left corner/edge)

// Realistic Sri Lanka (Asia/Colombo) sun times, year-round average.
export const SUNRISE = 5.9; // ~05:55
export const SUNSET = 18.3; // ~18:20
const DAY_LEN = SUNSET - SUNRISE; // hours the sun is above the horizon
const NIGHT_LEN = 24 - DAY_LEN; // hours the moon owns the sky

export function getSkyState(now: Date = new Date()): SkyState {
  const h = colomboHours(now);

  // sky gradient — find the two surrounding keyframes and blend
  let lo = SKY[0];
  let hi = SKY[SKY.length - 1];
  for (let i = 0; i < SKY.length - 1; i++) {
    if (h >= SKY[i].h && h <= SKY[i + 1].h) {
      lo = SKY[i];
      hi = SKY[i + 1];
      break;
    }
  }
  const span = hi.h - lo.h || 1;
  const t = clamp((h - lo.h) / span);
  const skyTop = mix(lo.top, hi.top, t);
  const skyMid = mix(lo.mid, hi.mid, t);
  const skyBottom = mix(lo.bottom, hi.bottom, t);

  // how "day" it is — light lingers after sunset: orange dusk through ~6:40pm,
  // fully dark only after ~7:10pm (matches real Sri Lankan twilight).
  const dayness =
    smoothstep(SUNRISE - 0.45, SUNRISE + 0.4, h) *
    (1 - smoothstep(SUNSET - 0.2, SUNSET + 0.9, h));

  // sun: rises right → climbs to the top at noon → sets left
  const sp = clamp((h - SUNRISE) / DAY_LEN);
  const sunAlt = Math.sin(sp * Math.PI);
  const sunX = lerp(X_RIGHT, X_LEFT, sp);
  const sunY = ARC_EDGE - (ARC_EDGE - ARC_PEAK) * sunAlt;
  // Disc visibility is decoupled from the colour grade so the sun and moon
  // hand over tightly: the sun is fully gone by ~6:55pm and the moon only
  // begins to appear ~6:50pm — never two clear bodies at once.
  const sunOpacity = clamp(
    smoothstep(SUNRISE - 0.2, SUNRISE + 0.5, h) * (1 - smoothstep(18.35, 18.92, h)),
  );

  // moon: rises right at dusk → peaks at midnight → sets left near dawn
  const mp = clamp((h >= SUNSET ? h - SUNSET : h + 24 - SUNSET) / NIGHT_LEN);
  const moonAlt = Math.sin(mp * Math.PI);
  const moonX = lerp(X_RIGHT, X_LEFT, mp);
  const moonY = ARC_EDGE - (ARC_EDGE - ARC_PEAK) * moonAlt;
  const moonOpacity =
    h >= 12
      ? smoothstep(18.78, 19.15, h) // evening rise (~6:50pm)
      : 1 - smoothstep(SUNRISE - 0.05, SUNRISE + 0.45, h); // dawn set

  // disc glow — warm at the horizon, bright-white near the apex
  const glow = mix("#ffb45a", "#fff1cf", sunAlt);

  // baseWarm: 0 at noon → 1 at the horizon. warmth folds in daylight.
  const baseWarm = 1 - sunAlt;
  const warmth = baseWarm * dayness; // strong at sunrise/sunset, 0 at noon/night

  // horizon wash — broad warm band at sunrise/sunset only. No band at night
  // (a cool one read as a dark full-width stripe under the hero content).
  const horizonGlow =
    dayness > 0.04
      ? mixRgba("#f59a4a", "#ffe7b0", sunAlt, 0.12 + 0.45 * warmth)
      : "rgba(0,0,0,0)";

  const starOpacity = clamp(Math.pow(1 - dayness, 1.4)) * 0.9;

  // ---- photo colour grading ----
  const nightness = 1 - dayness;
  // base photo filter: dim + desaturate + slightly punchier toward night,
  // warm sepia at golden hours.
  // photos already bake their own light/time-of-day, so the grade stays gentle.
  const brightness = (0.74 + 0.26 * dayness).toFixed(3);
  const contrast = (1.02 + 0.08 * nightness).toFixed(3);
  const saturate = (0.86 + 0.24 * dayness).toFixed(3);
  const sepiaAmt = (0.28 * warmth).toFixed(3);
  const photoFilter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturate}) sepia(${sepiaAmt})`;

  // light orange wash at golden hour; faint navy only deep into night
  const warmOpacity = Number((warmth * 0.6).toFixed(3));
  const nightOpacity = Number((Math.pow(nightness, 1.5) * 0.4).toFixed(3));
  const sunBloom = Number(((0.26 + 0.4 * baseWarm) * dayness).toFixed(3));
  const moonBloom = Number((0.3 * moonAlt * moonOpacity).toFixed(3));

  return {
    skyTop,
    skyMid,
    skyBottom,
    sunX,
    sunY,
    sunOpacity,
    moonX,
    moonY,
    moonOpacity,
    glow,
    horizonGlow,
    starOpacity,
    photoFilter,
    warmOpacity,
    nightOpacity,
    sunBloom,
    moonBloom,
  };
}

/* ------------------------------------------------ four-photo crossfade ---- */

export interface PhotoMix {
  morning: number; // 6–11am, lit from the right
  noon: number; // 11am–2pm, lit from the top
  evening: number; // 2–6:40pm, lit from the left
  night: number; // dusk → dawn, moonlit
}

/**
 * Opacity for each of the four backdrop photos at the current hour. Adjacent
 * photos cross-dissolve over ~50-minute windows; the night photo fades in with
 * the real dusk so the orange evening shot carries the sunset first.
 */
export function getPhotoMix(now: Date = new Date()): PhotoMix {
  const h = colomboHours(now);
  const morning =
    smoothstep(SUNRISE - 0.3, SUNRISE + 0.5, h) * (1 - smoothstep(10.6, 11.4, h));
  const noon = smoothstep(10.6, 11.4, h) * (1 - smoothstep(13.6, 14.4, h));
  const evening = smoothstep(13.6, 14.4, h) * (1 - smoothstep(18.2, 19.2, h));
  const night = clamp(1 - morning - noon - evening);
  return { morning, noon, evening, night };
}

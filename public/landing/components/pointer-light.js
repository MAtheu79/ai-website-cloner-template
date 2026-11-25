// One warm light that follows the mouse across the landing page, shared by
// the lit fabrics (the hero linen and the band). It fades in when the mouse
// moves and out when it leaves the window, so touch devices never see it.
const FADE_MS = 280;
const state = { x: 0, y: 0, target: 0, strength: 0, at: 0 };
let listening = false;

function listen() {
  if (listening) return;
  listening = true;
  window.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    state.x = event.clientX;
    state.y = event.clientY;
    state.target = 1;
  }, { passive: true });
  const off = () => { state.target = 0; };
  document.documentElement.addEventListener("mouseleave", off);
  window.addEventListener("blur", off);
}

/** The light in viewport px, with its 0–1 strength eased toward on or off. */
export function pointerLight(now = performance.now()) {
  listen();
  const dt = state.at ? Math.min(100, now - state.at) : 0;
  state.at = now;
  const step = 1 - Math.exp(-dt / (FADE_MS / 3));
  state.strength += (state.target - state.strength) * step;
  if (Math.abs(state.target - state.strength) < 0.002) state.strength = state.target;
  return { x: state.x, y: state.y, strength: state.strength };
}

/** The shared shading for the light: added to a lit fabric's color. `offset`
 *  runs from the pixel to the light, in widths of the surface, y up. */
export const POINTER_LIGHT_GLSL = `
vec3 pointerLight(vec2 offset, float strength, vec3 base, vec3 n, float height, float roughness) {
  if (strength <= 0.) return vec3(0.);
  // Held a little above the cloth: a broad pool that rakes across the folds.
  vec3 light = normalize(vec3(offset, .14 - height * .03));
  float falloff = exp(-length(offset) * 4.5);
  float diffuse = .2 + .8 * max(dot(n, light), 0.);
  vec3 halfway = normalize(light + vec3(0., 0., 1.));
  float sheen = pow(max(dot(n, halfway), 0.), mix(48., 8., roughness));
  vec3 warm = vec3(1., .86, .64);
  return strength * warm * falloff * (base * diffuse * .55 + sheen * (1. - roughness * .85) * .11);
}
`;

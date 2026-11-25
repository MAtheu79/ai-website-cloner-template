/** Cap for cubic noodle handles (screen px). Long connections keep this look. */
export const NOODLE_HANDLE_MAX_PX = 80;
/** Filled cap at each noodle endpoint (screen px). Drawn under the IO handles. */
const NOODLE_END_RADIUS_PX = 2;
/** Handle length as a fraction of endpoint distance, so close nodes do not bulge. */
const NOODLE_HANDLE_DIST_FACTOR = 0.45;

export function noodleControlOffset(a, b, max = NOODLE_HANDLE_MAX_PX) {
  const dist = Math.hypot(b.x - a.x, b.y - a.y);
  return Math.min(max, dist * NOODLE_HANDLE_DIST_FACTOR);
}

export function strokeNoodle(ctx, a, b) {
  const h = noodleControlOffset(a, b);
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.bezierCurveTo(a.x + h, a.y, b.x - h, b.y, b.x, b.y);
  ctx.stroke();
  ctx.fillStyle = ctx.strokeStyle;
  ctx.beginPath();
  ctx.arc(a.x, a.y, NOODLE_END_RADIUS_PX, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(b.x, b.y, NOODLE_END_RADIUS_PX, 0, Math.PI * 2);
  ctx.fill();
}


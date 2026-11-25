// The river runs straight across the band, left to right, and screens grow as
// they go: RIVER_GROWTH times larger at the right edge than at the left, as if
// the band came toward the viewer. Speed grows with size, so gaps grow with
// the screens. Positions advance in q = ln(1 + k x), which moves at a constant
// rate, where k = (growth - 1) / width. q depends on x / width only, so a
// resize leaves every screen where it was.

export function flowK(width, growth) {
  return (growth - 1) / width;
}

/** Size at x, relative to the left edge. */
export function flowScale(x, width, growth) {
  return 1 + flowK(width, growth) * x;
}

export function flowQ(x, width, growth) {
  return Math.log(1 + flowK(width, growth) * x);
}

export function flowX(q, width, growth) {
  return (Math.exp(q) - 1) / flowK(width, growth);
}

/** The rate of q that carries a screen from x = 0 to x = target in seconds. */
export function flowRate(target, width, growth, seconds) {
  return flowQ(target, width, growth) / seconds;
}

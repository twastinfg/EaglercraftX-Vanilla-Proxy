/**
 * Rotates `x` `n` bits to the left.
 *
 * @param x - value
 * @param n - rotation step
 */
export const rotateLeft = (x, n) => ((x << n) | (x >>> (32 - n))) >>> 0;
/**
 * Rotates `x` `n` bits to the right.
 *
 * @param x - value
 * @param n - rotation step
 */
export const rotateRight = (x, n) => ((x >>> n) | (x << (32 - n))) >>> 0;
/**
 * Shifts `x` by `n` bits left or right. If `n` >= 0, the value will be `>>>`
 * shifted to right, if `n` < 0 the value will be shifted left.
 *
 * @param x -
 * @param n -
 */
export const shiftRL = (x, n) => (n < 0 ? x << -n : x >>> n);

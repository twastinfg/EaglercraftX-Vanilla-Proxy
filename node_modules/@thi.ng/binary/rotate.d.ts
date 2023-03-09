import type { Bit } from "./api.js";
/**
 * Rotates `x` `n` bits to the left.
 *
 * @param x - value
 * @param n - rotation step
 */
export declare const rotateLeft: (x: number, n: Bit) => number;
/**
 * Rotates `x` `n` bits to the right.
 *
 * @param x - value
 * @param n - rotation step
 */
export declare const rotateRight: (x: number, n: Bit) => number;
/**
 * Shifts `x` by `n` bits left or right. If `n` >= 0, the value will be `>>>`
 * shifted to right, if `n` < 0 the value will be shifted left.
 *
 * @param x -
 * @param n -
 */
export declare const shiftRL: (x: number, n: number) => number;
//# sourceMappingURL=rotate.d.ts.map
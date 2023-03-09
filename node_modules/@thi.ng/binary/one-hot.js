import { clz32 } from "./count.js";
/**
 * Converts binary `x` to one-hot format.
 *
 * @remarks
 * Reference: https://en.wikipedia.org/wiki/One-hot
 *
 * @param x -
 */
export const binaryOneHot = (x) => (1 << x) >>> 0;
/**
 * Converts one-hot `x` into binary, i.e. the position of the hot bit.
 *
 * @remarks
 * Reference: https://en.wikipedia.org/wiki/One-hot
 *
 * @param x -
 */
export const oneHotBinary = (x) => 31 - clz32(x);

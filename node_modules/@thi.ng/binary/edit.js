import { defMask } from "./mask.js";
/**
 * Clears bit in given uint `x`.
 *
 * @param x - value
 * @param bit - bit number (0..31)
 */
export const bitClear = (x, bit) => (x & ~(1 << bit)) >>> 0;
/**
 * Toggles bit in given uint `x`.
 *
 * @param x - value
 * @param bit - bit ID
 */
export const bitFlip = (x, bit) => (x ^ (1 << bit)) >>> 0;
/**
 * Sets bit in given uint `x`.
 *
 * @param x - value
 * @param bit - bit number (0..31)
 */
export const bitSet = (x, bit) => (x | (1 << bit)) >>> 0;
export const bitSetWindow = (x, y, from, to) => {
    const m = defMask(from, to);
    return (x & ~m) | ((y << (1 << from)) & m);
};
export const bitClearWindow = (x, from, to) => x & ~defMask(from, to);

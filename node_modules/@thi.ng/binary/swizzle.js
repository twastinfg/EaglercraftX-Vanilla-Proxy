/**
 * Extracts 16-bit lane from given 32bit uint and returns as unsigned
 * half word [0x0000 .. 0xffff].
 *
 * - Lane #0: bits 16-31
 * - Lane #1: bits 0-15
 *
 * @param x -
 * @param lane - lane ID enum
 */
export const lane16 = (x, lane) => (x >>> ((1 - lane) << 4)) & 0xffff;
/**
 * Extracts 8-bit lane from given 32bit uint and returns as unsigned
 * byte [0x00 .. 0xff].
 *
 * - Lane #0: bits 24-31
 * - Lane #1: bits 16-23
 * - Lane #2: bits 8-15
 * - Lane #3: bits 0-7
 *
 * @param x -
 * @param lane - lane ID enum
 */
export const lane8 = (x, lane) => (x >>> ((3 - lane) << 3)) & 0xff;
/**
 * Extracts 4-bit lane from given 32bit uint and returns as unsigned
 * nibble [0x00 .. 0x0f].
 *
 * - Lane #0: bits 28-31
 * - Lane #1: bits 24-27
 * - Lane #2: bits 20-23
 * - Lane #3: bits 16-19
 * - Lane #4: bits 12-15
 * - Lane #5: bits 8-11
 * - Lane #6: bits 4-7
 * - Lane #7: bits 0-3
 *
 * @param x -
 * @param lane - lane ID enum
 */
export const lane4 = (x, lane) => (x >>> ((7 - lane) << 2)) & 0xf;
export const lane2 = (x, lane) => (x >>> ((15 - lane) << 1)) & 0x3;
export const setLane16 = (x, y, lane) => lane ? mux(x, y, 0xffff) : mux(x, y << 16, 0xffff0000);
/**
 * Sets 8-bit `lane` with value`y` in `x`.
 *
 * {@link lane8}
 *
 * @param x -
 * @param y -
 * @param lane - lane ID enum
 */
export const setLane8 = (x, y, lane) => {
    const l = (3 - lane) << 3;
    return ((~(0xff << l) & x) | ((y & 0xff) << l)) >>> 0;
};
/**
 * Sets 4-bit `lane` with value `y` in `x`.
 *
 * {@link lane4}
 *
 * @param x -
 * @param y -
 * @param lane - lane ID enum
 */
export const setLane4 = (x, y, lane) => {
    const l = (7 - lane) << 2;
    return ((~(0xf << l) & x) | ((y & 0xf) << l)) >>> 0;
};
/**
 * Sets 2-bit `lane` with value `y` in `x`.
 *
 * {@link lane2}
 *
 * @param x -
 * @param y -
 * @param lane - lane ID enum
 */
export const setLane2 = (x, y, lane) => {
    const l = (15 - lane) << 1;
    return ((~(0x3 << l) & x) | ((y & 0x3) << l)) >>> 0;
};
/**
 * Re-orders byte lanes in given order (MSB).
 *
 * @example
 * ```ts
 * swizzle(0x12345678, 3, 2, 1, 0) // 0x78563412
 * swizzle(0x12345678, 1, 0, 3, 2) // 0x34127856
 * swizzle(0x12345678, 2, 2, 0, 0) // 0x56561212
 * ```
 *
 * @param x - value
 * @param a - lane ID enum
 * @param b - lane ID enum
 * @param c - lane ID enum
 * @param d - lane ID enum
 */
export const swizzle8 = (x, a, b, c, d) => ((lane8(x, a) << 24) |
    (lane8(x, b) << 16) |
    (lane8(x, c) << 8) |
    lane8(x, d)) >>>
    0;
/**
 *
 * @param x - value
 * @param a - lane ID enum
 * @param b - lane ID enum
 * @param c - lane ID enum
 * @param d - lane ID enum
 * @param e - lane ID enum
 * @param f - lane ID enum
 * @param g - lane ID enum
 * @param h - lane ID enum
 */
export const swizzle4 = (x, a, b, c, d, e, f, g, h) => ((lane4(x, a) << 28) |
    (lane4(x, b) << 24) |
    (lane4(x, c) << 20) |
    (lane4(x, d) << 16) |
    (lane4(x, e) << 12) |
    (lane4(x, f) << 8) |
    (lane4(x, g) << 4) |
    lane4(x, h)) >>>
    0;
/**
 * Merges bits of `a` and `b`, selecting bits from `b` where `mask` bits
 * are set.
 *
 * @example
 * ```ts
 * mux(0x12345678, 0xaaaa5555, 0xffff0000)
 * // 0xaaaa5678
 *
 * mux(0x12345678, 0xaaaa5555, 0x0000ffff)
 * // 0x12345555
 * ```
 *
 * @param a -
 * @param b -
 * @param mask -
 */
export const mux = (a, b, mask) => (~mask & a) | (mask & b);
/**
 * Same as `swizzle8(x, 3, 2, 1, 0)`, but faster.
 *
 * @param x -
 */
export const flip8 = (x) => ((x >>> 24) | ((x >> 8) & 0xff00) | ((x & 0xff00) << 8) | (x << 24)) >>> 0;
/**
 * Swaps the highest & lowest 16 bits in `x`.
 *
 * @example
 * ```ts
 * flip16(0x12345678)
 * // 0x56781234
 * ```
 *
 * @param x -
 */
export const flip16 = (x) => mux(x << 16, x >>> 16, 0xffff);
/**
 * @deprecated renamed to {@link flip8}
 */
export const flipBytes = flip8;
/**
 * Swaps bytes lanes 0 & 2 (i.e. bits 24-31 with bits 8-15)
 *
 * @param x -
 */
export const swapLane02 = (x) => ((x & 0xff00) << 16) | ((x >>> 16) & 0xff00) | (x & 0x00ff00ff);
/**
 * Swaps bytes lanes 1 & 3 (i.e. bits 16-23 with bits 0-7)
 *
 * @param x -
 */
export const swapLane13 = (x) => ((x & 0xff) << 16) | ((x >> 16) & 0xff) | (x & 0xff00ff00);

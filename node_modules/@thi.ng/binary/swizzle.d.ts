import type { FnN, FnN3 } from "@thi.ng/api";
import type { Lane16, Lane2, Lane4, Lane8 } from "./api.js";
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
export declare const lane16: (x: number, lane: Lane16) => number;
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
export declare const lane8: (x: number, lane: Lane8) => number;
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
export declare const lane4: (x: number, lane: Lane4) => number;
export declare const lane2: (x: number, lane: Lane2) => number;
export declare const setLane16: (x: number, y: number, lane: Lane16) => number;
/**
 * Sets 8-bit `lane` with value`y` in `x`.
 *
 * {@link lane8}
 *
 * @param x -
 * @param y -
 * @param lane - lane ID enum
 */
export declare const setLane8: (x: number, y: number, lane: Lane8) => number;
/**
 * Sets 4-bit `lane` with value `y` in `x`.
 *
 * {@link lane4}
 *
 * @param x -
 * @param y -
 * @param lane - lane ID enum
 */
export declare const setLane4: (x: number, y: number, lane: Lane4) => number;
/**
 * Sets 2-bit `lane` with value `y` in `x`.
 *
 * {@link lane2}
 *
 * @param x -
 * @param y -
 * @param lane - lane ID enum
 */
export declare const setLane2: (x: number, y: number, lane: Lane2) => number;
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
export declare const swizzle8: (x: number, a: Lane8, b: Lane8, c: Lane8, d: Lane8) => number;
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
export declare const swizzle4: (x: number, a: Lane4, b: Lane4, c: Lane4, d: Lane4, e: Lane4, f: Lane4, g: Lane4, h: Lane4) => number;
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
export declare const mux: FnN3;
/**
 * Same as `swizzle8(x, 3, 2, 1, 0)`, but faster.
 *
 * @param x -
 */
export declare const flip8: FnN;
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
export declare const flip16: FnN;
/**
 * @deprecated renamed to {@link flip8}
 */
export declare const flipBytes: FnN;
/**
 * Swaps bytes lanes 0 & 2 (i.e. bits 24-31 with bits 8-15)
 *
 * @param x -
 */
export declare const swapLane02: FnN;
/**
 * Swaps bytes lanes 1 & 3 (i.e. bits 16-23 with bits 0-7)
 *
 * @param x -
 */
export declare const swapLane13: FnN;
//# sourceMappingURL=swizzle.d.ts.map
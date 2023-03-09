import type { FnN } from "@thi.ng/api";
/**
 * Repeats lowest nibble of `x` as 24 bit uint.
 *
 * @param x -
 */
export declare const splat4_24: FnN;
/**
 * Repeats lowest nibble of `x` as 32 bit uint.
 *
 * @param x -
 */
export declare const splat4_32: FnN;
/**
 * Repeats lowest byte of `x` as 24 bit uint.
 *
 * @param x -
 */
export declare const splat8_24: FnN;
/**
 * Repeats lowest byte of `x` as 32 bit uint.
 *
 * @param x -
 */
export declare const splat8_32: FnN;
/**
 * Repeats lowest 16bit of `x` as 32 bit uint.
 *
 * @param x -
 */
export declare const splat16_32: FnN;
/**
 * Returns true if bits 0-3 are same as bits 4-7.
 *
 * @param x -
 */
export declare const same4: (x: number) => boolean;
/**
 * Returns true if bits 0-7 are same as bits 8-15.
 *
 * @param x -
 */
export declare const same8: (x: number) => boolean;
/**
 * Expands 3x4bit value like `0xabc` to 24bits: `0xaabbcc`
 *
 * @param x -
 */
export declare const interleave4_12_24: (x: number) => number;
/**
 * Expands 4x4bit value like `0xabcd` to 32bits: `0xaabbccdd`
 *
 * @param x -
 */
export declare const interleave4_16_32: (x: number) => number;
//# sourceMappingURL=splat.d.ts.map
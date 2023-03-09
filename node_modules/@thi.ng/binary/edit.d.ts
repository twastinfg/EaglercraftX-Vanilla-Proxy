import type { FnU3 } from "@thi.ng/api";
import type { Bit } from "./api.js";
/**
 * Clears bit in given uint `x`.
 *
 * @param x - value
 * @param bit - bit number (0..31)
 */
export declare const bitClear: (x: number, bit: Bit) => number;
/**
 * Toggles bit in given uint `x`.
 *
 * @param x - value
 * @param bit - bit ID
 */
export declare const bitFlip: (x: number, bit: Bit) => number;
/**
 * Sets bit in given uint `x`.
 *
 * @param x - value
 * @param bit - bit number (0..31)
 */
export declare const bitSet: (x: number, bit: Bit) => number;
export declare const bitSetWindow: (x: number, y: number, from: number, to: number) => number;
export declare const bitClearWindow: FnU3<number>;
//# sourceMappingURL=edit.d.ts.map
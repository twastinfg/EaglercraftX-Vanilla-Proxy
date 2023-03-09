import type { Range0_31 } from "@thi.ng/api";
/**
 * Converts binary `x` to one-hot format.
 *
 * @remarks
 * Reference: https://en.wikipedia.org/wiki/One-hot
 *
 * @param x -
 */
export declare const binaryOneHot: (x: Range0_31) => number;
/**
 * Converts one-hot `x` into binary, i.e. the position of the hot bit.
 *
 * @remarks
 * Reference: https://en.wikipedia.org/wiki/One-hot
 *
 * @param x -
 */
export declare const oneHotBinary: (x: number) => number;
//# sourceMappingURL=one-hot.d.ts.map
import type { FnN, FnN2 } from "@thi.ng/api";
/**
 * Similar to {@link fmod}, {@link remainder}. Returns `a - b * floor(a / b)`
 * (same as GLSL `mod(a, b)`)
 *
 * @remarks
 * **Caution:** Due to the introduction of libc math functions in v4.0.0 and the
 * resulting name/behavior clashes between the modulo logic in JS, C & GLSL,
 * this function previously _was_ called `fmod`, but going forward has been
 * renamed to align w/ its GLSL version and exhibits a different behavior to the
 * current {@link fmod} function.
 *
 * https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/mod.xhtml
 *
 * @param a -
 * @param b -
 */
export declare const mod: FnN2;
export declare const fract: FnN;
export declare const trunc: FnN;
export declare const roundTo: (x: number, prec?: number) => number;
export declare const floorTo: (x: number, prec?: number) => number;
export declare const ceilTo: (x: number, prec?: number) => number;
/**
 * Only rounds `x` to nearest int if `fract(x)` <= `eps` or >= `1-eps`.
 *
 * @param x -
 * @param eps -
 */
export declare const roundEps: (x: number, eps?: number) => number;
//# sourceMappingURL=prec.d.ts.map
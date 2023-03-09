/**
 * Similar to {@link eqDeltaScaled}, but uses given `eps` as is.
 *
 * @param a - left value
 * @param b - right value
 * @param eps - epsilon / tolerance, default `1e-6`
 */
export declare const eqDelta: (a: number, b: number, eps?: number) => boolean;
/**
 * Checks if `|a - b| <= ε` and adapts given epsilon value to the given
 * arguments:
 *
 * ε is factored with the largest absolute value of `a` or `b` (but
 * never lesser than the given `eps` value):
 *
 * `ε = ε * max(1, |a|, |b|)`
 *
 * @param a - left value
 * @param b - right value
 * @param eps - epsilon / tolerance, default `1e-6`
 */
export declare const eqDeltaScaled: (a: number, b: number, eps?: number) => boolean;
//# sourceMappingURL=eqdelta.d.ts.map
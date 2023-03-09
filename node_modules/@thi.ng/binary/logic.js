import { maskL } from "./mask.js";
export const bitNot = (x) => ~x;
export const bitAnd = (a, b) => a & b;
export const bitNand = (a, b) => ~(a & b);
export const bitOr = (a, b) => a | b;
export const bitNor = (a, b) => ~(a | b);
export const bitXor = (a, b) => a ^ b;
export const bitXnor = (a, b) => ~(a ^ b);
export const bitImply = (a, b) => ~a | b;
export const bitAoi21 = (a, b, c) => ~(a | (b & c));
export const bitOai21 = (a, b, c) => ~(a & (b | c));
export const bitAoi22 = (a, b, c, d) => ~((a & b) | (c & d));
export const bitOai22 = (a, b, c, d) => ~((a | b) & (c | d));
export const bitMux = (a, b, s) => ((a & ~s) | (b & s)) >>> 0;
export const bitDemux = (a, b, s) => [
    (a & ~s) >>> 0,
    (b & s) >>> 0,
];
export const bitNotM = (n, x) => maskL(n, ~x);
export const bitAndM = (n, a, b) => maskL(n, a & b);
export const bitNandM = (n, a, b) => maskL(n, ~(a & b));
export const bitOrM = (n, a, b) => maskL(n, a | b);
export const bitNorM = (n, a, b) => maskL(n, ~(a | b));
export const bitXorM = (n, a, b) => maskL(n, a ^ b);
export const bitXnorM = (n, a, b) => maskL(n, ~(a ^ b));
export const bitImplyM = (n, a, b) => maskL(n, ~a | b);
export const bitAoi21M = (n, a, b, c) => maskL(n, ~(a | (b & c)));
export const bitOai21M = (n, a, b, c) => maskL(n, ~(a & (b | c)));
export const bitAoi22M = (n, a, b, c, d) => maskL(n, ~((a & b) | (c & d)));
export const bitOai22M = (n, a, b, c, d) => maskL(n, ~((a | b) & (c | d)));
export const bitMuxM = (n, a, b, s) => maskL(n, (a & ~s) | (b & s));
export const bitDemuxM = (n, a, b, s) => [
    maskL(n, a & ~s),
    maskL(n, b & s),
];

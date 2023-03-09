import { implementsFunction } from "./implements-function.js";
export const isPromiseLike = (x) => x instanceof Promise ||
    (implementsFunction(x, "then") && implementsFunction(x, "catch"));

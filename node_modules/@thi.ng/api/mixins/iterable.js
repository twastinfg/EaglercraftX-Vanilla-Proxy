import { mixin } from "../mixin.js";
export const iterable = (prop) => mixin({
    *[Symbol.iterator]() {
        yield* this[prop];
    },
});

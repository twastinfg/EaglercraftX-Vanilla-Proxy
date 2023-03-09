// http://graphics.stanford.edu/~seander/bithacks.html
export const isPow2 = (x) => !!x && !(x & (x - 1));
export const ceilPow2 = (x) => {
    x += (x === 0);
    --x;
    x |= x >>> 1;
    x |= x >>> 2;
    x |= x >>> 4;
    x |= x >>> 8;
    x |= x >>> 16;
    return x + 1;
};
export const floorPow2 = (x) => {
    x |= x >>> 1;
    x |= x >>> 2;
    x |= x >>> 4;
    x |= x >>> 8;
    x |= x >>> 16;
    return x - (x >>> 1);
};

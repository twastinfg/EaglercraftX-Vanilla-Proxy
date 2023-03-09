import { mixin } from "../mixin.js";
/**
 * Default implementation for {@link IGrid1D} methods.
 */
export const IGrid1DMixin = mixin({
    order() {
        return [0];
    },
    includes(x) {
        return x >= 0 && x < this.size[0];
    },
    indexAt(x) {
        return this.includes(x) ? this.indexAtUnsafe(x) : -1;
    },
    indexAtUnsafe(x) {
        return this.offset + (x | 0) * this.stride[0];
    },
    getAt(x) {
        return this.includes(x) ? this.data[this.indexAtUnsafe(x)] : 0;
    },
    getAtUnsafe(x) {
        return this.data[this.indexAtUnsafe(x)];
    },
    setAt(x, val) {
        return this.includes(x)
            ? ((this.data[this.indexAtUnsafe(x)] = val), true)
            : false;
    },
    setAtUnsafe(x, val) {
        this.data[this.indexAtUnsafe(x)] = val;
        return true;
    },
});
/**
 * Default implementation for {@link IGrid2D} methods.
 */
export const IGrid2DMixin = mixin({
    order() {
        return Math.abs(this.stride[1]) > Math.abs(this.stride[0])
            ? [1, 0]
            : [0, 1];
    },
    includes(x, y) {
        const size = this.size;
        return x >= 0 && x < size[0] && y >= 0 && y < size[1];
    },
    indexAt(x, y) {
        return this.includes(x, y) ? this.indexAtUnsafe(x, y) : -1;
    },
    indexAtUnsafe(x, y) {
        return (this.offset + (x | 0) * this.stride[0] + (y | 0) * this.stride[1]);
    },
    getAt(x, y) {
        return this.includes(x, y) ? this.data[this.indexAtUnsafe(x, y)] : 0;
    },
    getAtUnsafe(x, y) {
        return this.data[this.indexAtUnsafe(x, y)];
    },
    setAt(x, y, val) {
        return this.includes(x, y)
            ? ((this.data[this.indexAtUnsafe(x, y)] = val), true)
            : false;
    },
    setAtUnsafe(x, y, val) {
        this.data[this.indexAtUnsafe(x, y)] = val;
        return true;
    },
});
/**
 * Default implementation for {@link IGrid3D} methods.
 */
export const IGrid3DMixin = mixin({
    order() {
        return strideOrder(this.stride);
    },
    includes(x, y, z) {
        const size = this.size;
        return (x >= 0 &&
            x < size[0] &&
            y >= 0 &&
            y < size[1] &&
            z >= 0 &&
            z < size[2]);
    },
    indexAt(x, y, z) {
        return this.includes(x, y, z) ? this.indexAtUnsafe(x, y, z) : -1;
    },
    indexAtUnsafe(x, y, z) {
        const stride = this.stride;
        return (this.offset +
            (x | 0) * stride[0] +
            (y | 0) * stride[1] +
            (z | 0) * stride[2]);
    },
    getAt(x, y, z) {
        return this.includes(x, y, z)
            ? this.data[this.indexAtUnsafe(x, y, z)]
            : 0;
    },
    getAtUnsafe(x, y, z) {
        return this.data[this.indexAtUnsafe(x, y, z)];
    },
    setAt(x, y, z, val) {
        return this.includes(x, y, z)
            ? ((this.data[this.indexAtUnsafe(x, y, z)] = val), true)
            : false;
    },
    setAtUnsafe(x, y, z, val) {
        this.data[this.indexAtUnsafe(x, y, z)] = val;
        return true;
    },
});
/**
 * Default implementation for {@link IGrid4D} methods.
 */
export const IGrid4DMixin = mixin({
    order() {
        return strideOrder(this.stride);
    },
    includes(x, y, z, w) {
        const size = this.size;
        return (x >= 0 &&
            x < size[0] &&
            y >= 0 &&
            y < size[1] &&
            z >= 0 &&
            z < size[2] &&
            w >= 0 &&
            w < size[3]);
    },
    indexAt(x, y, z, w) {
        return this.includes(x, y, z, w) ? this.indexAtUnsafe(x, y, z, w) : -1;
    },
    indexAtUnsafe(x, y, z, w) {
        const stride = this.stride;
        return (this.offset +
            (x | 0) * stride[0] +
            (y | 0) * stride[1] +
            (z | 0) * stride[2] +
            (w | 0) * stride[3]);
    },
    getAt(x, y, z, w) {
        return this.includes(x, y, z, w)
            ? this.data[this.indexAtUnsafe(x, y, z, w)]
            : 0;
    },
    getAtUnsafe(x, y, z, w) {
        return this.data[this.indexAtUnsafe(x, y, z, w)];
    },
    setAt(x, y, z, w, val) {
        return this.includes(x, y, z, w)
            ? ((this.data[this.indexAtUnsafe(x, y, z, w)] = val), true)
            : false;
    },
    setAtUnsafe(x, y, z, w, val) {
        this.data[this.indexAtUnsafe(x, y, z, w)] = val;
        return true;
    },
});
const strideOrder = (strides) => [...strides]
    .map((x, i) => [x, i])
    .sort((a, b) => Math.abs(b[0]) - Math.abs(a[0]))
    .map((x) => x[1]);

/**
 * Aligns `addr` to next multiple of `size`. The latter must be a power
 * of 2.
 *
 * @param addr - value to align
 * @param size - alignment value
 */
export const align = (addr, size) => (size--, (addr + size) & ~size);
/**
 * Returns true if `addr` is aligned to wordsize `size`.
 */
export const isAligned = (addr, size) => !(addr & (size - 1));

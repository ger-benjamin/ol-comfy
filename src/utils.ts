/**
 * Determines whether the given value is either `null` or `undefined`.
 *
 * @param {unknown|null|undefined} value - The value to check.
 * @returns {boolean} Returns `true` if the value is `null` or `undefined`, otherwise `false`.
 */
export const isNil = (value: unknown | null | undefined): boolean => {
  return value === null || value === undefined;
};

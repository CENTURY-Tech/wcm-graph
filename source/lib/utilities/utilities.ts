import * as R from "ramda";

/**
 * Find and return the first defined property from within the list of provided properties from the object later
 * provided.
 *
 * @param {String[]} props - The properties to check if they are defined
 *
 * @return {Function} A method that will return the first defined property from the object provided
 */
export function firstDefinedProperty(props: string[]): (obj: Object) => any {
  return (obj: Object): any => {
    return R.prop(R.compose(R.head, R.curry(R.intersection)(props), R.keys)(obj), obj);
  };
}

/**
 * Push a single element to the array provided and ensure that scope of the 'push' is correct.
 *
 * @param {Any[]} arr - The array to push to
 *
 * @returns {Function} A method that will push the provided value to the array
 */
export function pushToArray(arr: any[]): (value: any) => number {
  return (value: any): number  => {
    return arr.push(value);
  };
}

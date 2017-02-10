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
  return (value: any): number => {
    return arr.push(value);
  };
}

/**
 * Ensure that the getters and setters over the target object are case insensitive.
 *
 * @param {Object} target - The target object
 *
 * @return {Proxy} A proxy over the target object ensuring that the getters and setters are case insensitive
 */
export function makeCaseInsensitive<T>(target: T): T {
  return new Proxy<T>(target, {
    get: caseInsensitivePropGet,
    set: caseInsensitivePropSet,
    getOwnPropertyDescriptor: caseInsensitivePropDescriptor
  });
}

/**
 * Perform a case insensitive lookup on the target object.
 *
 * @private
 *
 * @param {Object} target - The target object
 * @param {String} prop   - The target property
 *
 * @returns {Any} Any value found at the lower cased property lookup
 */
function caseInsensitivePropGet(target: { [x: string]: any }, prop: string): any {
  return target[prop.toLowerCase()];
}

/**
 * Perform a case insensitive property set on the target object.
 *
 * @private
 *
 * @param {Object} target - The target object
 * @param {String} prop   - The target property
 * @param {Any}    value  - The value to set
 *
 * @returns {Boolean} A success value after setting the property
 */
function caseInsensitivePropSet(target: { [x: string]: any }, prop: string, value: any): boolean {
  target[prop.toLowerCase()] = value;

  return true;
}

/**
 * Perform a case insensitive property descriptor lookup on the target object.
 *
 * @private
 *
 * @param {Object} target - The target object
 * @param {String} prop   - The target property
 *
 * @returns {Object} A property descriptor
 */
function caseInsensitivePropDescriptor<T>(target: T, prop: string): Object | undefined {
  const value = target.hasOwnProperty(prop.toLowerCase());

  return value ? {
    value,
    writable: true,
    enumerable: true,
    configurable: true
  } : undefined;
}


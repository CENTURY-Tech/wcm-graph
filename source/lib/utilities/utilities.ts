import { compose, converge, curry, head, identity, intersection, keys, map, prop, zipObj } from "ramda";

/**
 * An interface representing a generic key value store
 */
export interface IKeyValue<T> {
  [x: string]: T;
};

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
    return prop(compose(head, curry(intersection)(props), keys)(obj), obj);
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
 * A curried method to generate an indexed object from an array of strings. This method will execute the function passed
 * with the string found at each position in the array provided upon final execution, and map the returned value to the
 * key in the final object with the relevant string.
 *
 * @param {Function} method - The function with which to create the objects values
 *
 * @returns {Function} A method that will return a new object whos values are equated from the method provided
 */
export function toObjectBy<U>(method: (x: string) => U): (arr: string[]) => IKeyValue<U> {
  return converge(zipObj, [map(identity), map(method)]) as (arr: string[]) => IKeyValue<U>;
}

/**
 * Ensure that the getters and setters over the target object are case insensitive.
 *
 * @param {Object} target - The target object
 *
 * @return {Proxy} A proxy over the target object ensuring that the getters and setters are case insensitive
 */
export function makeCaseInsensitive<T>(target: T): T {
  return new Proxy<T>(target, { // tslint:disable
    get: caseInsensitivePropGet,
    set: caseInsensitivePropSet,
    getOwnPropertyDescriptor: caseInsensitivePropDescriptor,
  }); // tslint:enable
}

/**
 * Prune any preceeding text from a version identifier, commonly found in Bower declaration files, and return the true
 * version.
 *
 * @param {String} version - The version string to parse
 *
 * @returns {String} The true version from the string provided
 */
export function pruneVersionString(version: string): string {
  return /(\*)|(\^|~|<|>|(<|>)=)?((\d.)?(\d.)?)?\d$/.exec(version)[0];
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
  return target[typeof prop === "string" ? prop.toLowerCase() : prop];
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
  target[typeof prop === "string" ? prop.toLowerCase() : prop] = value;

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
  prop = typeof prop === "string" ? prop.toLowerCase() : prop;

  return target.hasOwnProperty(prop) ? { // tslint:disable
    value: (<any>target)[prop],
    writable: true,
    enumerable: true,
    configurable: true,
  } : undefined;
}

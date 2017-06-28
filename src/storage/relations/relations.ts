import { contains, flip, keys, prop } from "ramda";
import { IKeyValue, makeCaseInsensitive } from "../../utilities/utilities";

/**
 * An type representing the structure of a node.
 */
export type IGraphRelationship = IKeyValue<string>;

/**
 * A weakmap of the depedency graph relations.
 *
 * @private
 */
export const relationsMap = new WeakMap<object, IKeyValue<IGraphRelationship>>();

/**
 * A curried method to retrieve the list of relations stored against a specific depedency name.
 *
 * @param {Object} key - The key against which the relations are mapped
 *
 * @returns {Function} A method that will retrieve the list of relations for a specific depedency name
 */
export function getRelation(key: object): (name: string) => IGraphRelationship {
  return flip(prop)(getRelations(key));
}

/**
 * Retrieve all of the relations mapped to the key provided.
 *
 * @param {Object} key - The key against which the relations are mapped
 *
 * @returns {IKeyValue<IGraphRelationship>} A case insensitive map of relations related to the provied key
 */
export function getRelations(key: object): IKeyValue<IGraphRelationship> {
  if (!relationsMap.has(key)) {
    throw Error("No relation map found for the provided key");
  }

  return makeCaseInsensitive(relationsMap.get(key));
}

/**
 * A curried method to check the existance of a relationship between the two nodes.
 *
 * @param {Object} key - The key against which the nodes are mapped
 *
 * @returns {Function} A method that will determine whether or not a relation between to nodes exists
 */
export function relationExists(key: object): (from: string, to: string) => boolean {
  return (a: string, b: string) => {
    return contains(b, keys(getRelation(key)(a)) || []);
  };
}

/**
 * A curried method to set the list of relations stored against a specific depedency name.
 *
 * @param {Object} key - The key against which the nodes are mapped
 *
 * @returns {Function} A method that will set the list of relations for a specific depedency name
 */
export function setRelation(key: object): (name: string, data: IGraphRelationship) => void {
  const relationMap = getRelations(key);

  return (name: string, data: IGraphRelationship) => {
    void (relationMap[name] = data);
  };
}

/**
 * Initialise the relation map for the key provided with the value provided.
 *
 * @param {Object}                        key   - The key against which the relations are mapped
 * @param {IKeyValue<IGraphRelationship>} value - The value to initialise the relation map with
 *
 * @returns {Void}
 */
export function setRelations(key: object, value: IKeyValue<IGraphRelationship>): void {
  relationsMap.set(key, value);
}

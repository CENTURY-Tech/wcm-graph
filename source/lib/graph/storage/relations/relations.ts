import { contains, flip, keys, prop } from "ramda";
import { IKeyValue, makeCaseInsensitive } from "../../../utilities/utilities";

/**
 * An interface representing the structure of a node.
 */
export interface IGraphRelationship extends IKeyValue<string> { };

/**
 * A weakmap of the depedency graph relations.
 *
 * @private
 */
export const relationsMap = new WeakMap<Object, IKeyValue<IGraphRelationship>>();

/**
 * A curried method to retrieve the list of relations stored against a specific depedency name.
 *
 * @param {Any} key - The key against which the relations are mapped
 *
 * @returns {Function} A method that will retrieve the list of relations for a specific depedency name
 */
export function getRelation(key: Object): (name: string) => IGraphRelationship {
  return flip(prop)(getRelations(key));
}

export function getRelations(key: Object): IKeyValue<IGraphRelationship> {
  if (!relationsMap.has(key)) {
    throw Error("No relation map found for the provided key");
  }

  return makeCaseInsensitive(relationsMap.get(key));
}

/**
 * A curried method to check the existance of a relationship between the two nodes.
 *
 * @param {Any} key - The key against which the nodes are mapped
 *
 * @returns {Function} A method that will determine whether or not a relation between to nodes exists
 */
export function relationExists(key: Object): (from: string, to: string) => boolean {
  return (a: string, b: string) => {
    return contains(b, keys(getRelation(key)(a)) || []);
  };
}

/**
 * A curried method to set the list of relations stored against a specific depedency name.
 *
 * @param {Any} key - The key against which the nodes are mapped
 *
 * @returns {Function} A method that will set the list of relations for a specific depedency name
 */
export function setRelation(key: Object): (name: string, data: IGraphRelationship) => void {
  const relationMap = getRelations(key);

  return (name: string, data: IGraphRelationship) => {
    void (relationMap[name] = data);
  };
}

export function setRelations(key: Object, value: IKeyValue<IGraphRelationship>): void {
  relationsMap.set(key, value);
}

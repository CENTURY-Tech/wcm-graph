import { flip, has, prop } from "ramda";
import { IKeyValue, makeCaseInsensitive } from "../../utilities/utilities";

/**
 * An interface representing the structure of a node.
 */
export interface IGraphNode {
  name: string;
  data?: object;
  version?: string;
  aliases?: string[];
}

/**
 * A weakmap of the depedency graph nodes.
 *
 * @private
 */
export const nodesMap = new WeakMap<object, IKeyValue<IGraphNode>>();

/**
 * A curried method to retrieve the data stored against a node with a specific dependency name.
 *
 * @param {Object} key - The key against which the nodes are mapped
 *
 * @returns {Function} A method that will retrieve the data stored against a node with a specific depedency name
 */
export function getNode(key: object): (name: string) => IGraphNode {
  return flip(prop)(getNodes(key));
}

/**
 * Retrieve all of the nodes mapped to the key provided.
 *
 * @param {Object} key - The key against which the nodes are mapped
 *
 * @returns {IKeyValue<IGraphNode>} A case insensitive map of nodes related to the provied key
 */
export function getNodes(key: object): IKeyValue<IGraphNode> {
  if (!nodesMap.has(key)) {
    throw Error("No node map found for the provided key");
  }

  return makeCaseInsensitive(nodesMap.get(key));
}

/**
 * A curried method to check the existances of a node with a specific depedency name.
 *
 * @param {Object} key - The key against which the nodes are mapped
 *
 * @returns {Function} A method that will determine whether or not a node with the depedency name provided exists
 */
export function nodeExists(key: object): (name: string) => boolean {
  return flip(has)(getNodes(key));
}

/**
 * A curried method to set the data stored against a node with a specific dependency name.
 *
 * @param {Object} key - The key against which the nodes are mapped
 *
 * @returns {Function} A method that will retrieve the data stored against a node with a specific depedency name
 */
export function setNode(key: object): (name: string, data: IGraphNode) => void {
  const nodeMap = getNodes(key);

  return (name: string, data: IGraphNode) => void (nodeMap[name] = data);
}

/**
 * Initialise the node map for the key provided with the value provided.
 *
 * @param {Object}                key   - The key against which the nodes are mapped
 * @param {IKeyValue<IGraphNode>} value - The value to initialise the node map with
 *
 * @returns {Void}
 */
export function setNodes(key: object, value: IKeyValue<IGraphNode>): void {
  nodesMap.set(key, value);
}

import { IKeyValue, makeCaseInsensitive } from "../../utilities/utilities";

/**
 * An interface representing the structure of a node.
 */
export interface IGraphNode {
  data?: Object;
  version?: string;
  aliases?: string[];
};

/**
 * A weakmap of the depedency graph nodes.
 *
 * @private
 */
export const __nodes = new WeakMap(); // tslint:disable-line

export function getNodes(key: any): IKeyValue<IGraphNode> {
  return makeCaseInsensitive(__nodes.get(key));
}

export function setNodes(key: any, value: any): void {
  __nodes.set(key, value);
}

/**
 * A weakmap of the depedency graph relations.
 *
 * @private
 */
export const __relations = new WeakMap(); // tslint:disable-line

export function getRelations(key: any): IKeyValue<IKeyValue<string>> {
  return makeCaseInsensitive(__relations.get(key));
}

export function setRelations(key: any, value: any): void {
  __relations.set(key, value);
}

import { IKeyValue, makeCaseInsensitive } from "../../../utilities/utilities";

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
export const nodesMap = new WeakMap<Object, IKeyValue<IGraphNode>>();

export function getNodes(key: Object): IKeyValue<IGraphNode> {
  return makeCaseInsensitive(nodesMap.get(key));
}

export function setNodes(key: Object, value: IKeyValue<IGraphNode>): void {
  nodesMap.set(key, value);
}

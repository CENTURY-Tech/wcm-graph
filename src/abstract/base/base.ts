import { compose, curry, fromPairs, join, split, transpose, values, zipObj } from "ramda";
import { IGraphNode, setNodes } from "../../storage/nodes/nodes";
import { setRelations } from "../../storage/relations/relations";
import { IKeyValue } from "../../utilities/utilities";

/**
 * An interface representing optional depedency metadata.
 */
export interface IBaseDependencyMetadata {
  name: string;
  version: string;
}

/**
 * An alias type representing a graph node.
 */
export type IBaseGraphNodeObject = IGraphNode;

/**
 * An type representing a relation node.
 */
export type IBaseGraphRelationObject = IKeyValue<string>;

/**
 * An type representing a map of graph nodes.
 */
export type IBaseGraphNodeMap = IKeyValue<IBaseGraphNodeObject>;

/**
 * An type representing a map of relation nodes.
 */
export type IBaseGraphRelationMap = IKeyValue<IBaseGraphRelationObject>;

/**
 * A base class responsible for weakmap initialisation. This ensures that upstream classes are able to use preprepared
 * methods defined as properties that interface with the weakmaps.
 *
 * @class
 */
export class AbstractBaseGraph {

  /**
   * A static method that will stringify key depedency metadata into a valid node name.
   *
   * @param {Object} opts      - The function options
   * @param {String} opts.name - The depedency name
   * @param {String} opts.name - the depedency version
   *
   * @returns {String} A stringified depedency name
   */
  public static stringifyDependencyMetadata(opts: IBaseDependencyMetadata): string {
    return compose(join("@"), values)(opts);
  }

  /**
   * A static method that will parse a depedency name into a valid dependency metadata object.
   *
   * @param {String} value - The stringified depedency metadata
   *
   * @returns {IBaseDependencyMetadata} The parsed dependency metadata
   */
  public static parseDependencyMetadata(value: string): IBaseDependencyMetadata {
    return compose(zipObj(["name", "version"]) as (x: string[]) => IBaseDependencyMetadata, split(/@/))(value);
  }

  constructor() {
    setNodes(this, {});
    setRelations(this, {});
  }

}

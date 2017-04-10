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
};

/**
 * An interface representing a graph node.
 */
export interface IBaseGraphNodeObject extends IGraphNode { };

/**
 * An interface representing a relation node.
 */
export interface IBaseGraphRelationObject extends IKeyValue<string> { };

/**
 * An interface representing a map of graph nodes.
 */
export interface IBaseGraphNodeMap extends IKeyValue<IBaseGraphNodeObject> { };

/**
 * An interface representing a map of relation nodes.
 */
export interface IBaseGraphRelationMap extends IKeyValue<IBaseGraphRelationObject> { };

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

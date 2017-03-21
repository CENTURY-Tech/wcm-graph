import {
  compose, contains, curry, flip, fromPairs, has, ifElse, join, keys, map, mapObjIndexed, pair, path, pick, pickBy,
  prop, split, transpose, unless, values, when
} from "ramda";
import { makeCaseInsensitive, pushToArray } from "../utilities/utilities";

/**
 * An interface representing optional depedency metadata.
 */
export interface DependencyMetadata {
  name: string;
  version: string;
};

/**
 * An interface representing the structure of a node.
 */
export interface GraphNode {
  data?: Object;
  version?: string;
  aliases?: string[];
};

/**
 * An interface representing a generic key value store
 */
export interface KeyValue<T> {
  [x: string]: T;
};

/**
 * A weakmap of the depedency graph nodes.
 *
 * @private
 */
export const __nodes = new WeakMap();
const getNodes = (key: any): KeyValue<GraphNode> => makeCaseInsensitive(__nodes.get(key));
const setNodes = (key: any, value: any): void => void __nodes.set(key, value);

/**
 * A weakmap of the depedency graph relations.
 *
 * @private
 */
export const __relations = new WeakMap();
const getRelations = (key: any): KeyValue<KeyValue<string>> => makeCaseInsensitive(__relations.get(key));
const setRelations = (key: any, value: any): void => void __relations.set(key, value);

/**
 * A base class responsible for weakmap initialisation. This ensures that upstream classes are able to use curried
 * methods defined as properties that interface with the weakmaps.
 *
 * @class
 */
export class BaseGraph {

  constructor() {
    setNodes(this, {});
    setRelations(this, {});
  }

  /**
   * A static method that will stringify key depedency metadata into a valid node name.
   *
   * @function
   *
   * @param {Object} opts      - The function options
   * @param {String} opts.name - The depedency name
   * @param {String} opts.name - the depedency version
   *
   * @returns {String} A stringified depedency name
   */
  public static stringifyDependencyMetadata: (opts: DependencyMetadata) => string = (
    compose(join("@"), values)
  );

  /**
   * A static method that will stringify a depedency name into a valid node name.
   *
   * @function
   *
   * @param {String} value - The stringified depedency metadata
   *
   * @returns {Object} A parsed depedency name
   */
  public static parseDependencyMetadata: (value: string) => DependencyMetadata = (
    compose(fromPairs as (x: string[][]) => DependencyMetadata, transpose, curry(pair)(["name", "version"]), split(/@/))
  );

}

/**
 * An internal set of semi-private or hidden methods to simplify the construction of the depedency graph.
 *
 * @class
 * @extends BaseGraph
 */
export class InternalGraph extends BaseGraph {

  /**
   * Add a node with the name provided to the graph, with the data provided. If a node with the name provided already
   * exists on the dependency an error will be thrown.
   *
   * @param {String} name - The name of the node
   * @param {Any}    data - The data to map to the node
   *
   * @returns {Void}
   */
  public __addNode(name: string, data: any): void {
    when(nodeExists(this), nodeAlreadyExistsErr)(name);

    getNodes(this)[name] = data;
    getRelations(this)[name] = {};
  }

  /**
   * Retrieve the data relating to the node with the name provided. If no node exists with the name provided an error
   * will be thrown.
   *
   * @function
   *
   * @param {String} name - The name of the node
   *
   * @returns {Any} Any data stored against the graph at the node with the name provided
   */
  public __getNode: (name: string) => GraphNode = (
    ifElse(nodeExists(this), getNode(this), noNodeFoundErr)
  );

  /**
   * Check to see whether or not the graph contains a node with the name provided.
   *
   * @function
   *
   * @param {String} name - The name of the node
   *
   * @returns {Boolean} Whether or not the graph has a node with the name provided
   */
  public __hasNode(name: string): boolean {
    return nodeExists(this)(name);
  }

  /**
   * Retrieve a list of the names for each node that has been previously added to the graph.
   *
   * @function
   *
   * @returns {String[]} An array of node names that have been previously added to the graph
   */
  public __listNodes: () => string[] = (
    ((ref) => () => keys(ref))(getNodes(this))
  );

  /**
   * Create a relationship from the node with the name provided as the first argument, to the node with the name
   * provided as the second argument. If either of the names cannot be found in the nodes list an error will be thrown.
   *
   * @param {String} from - The name of the dependant
   * @param {String} to   - The name of the dependency
   * @param {Any}    data - The data to map to the relationship
   *
   * @returns {Void}
   */
  public __markDependency(from: string, to: string, data: any): void {
    map(unless(nodeExists(this), noNodeFoundErr))([from, to]);

    getRelation(this)(from)[to] = data;
  }

  /**
   * Check to see whether or not a relationship exists from the 'from' node to the 'to' node.
   *
   * @function
   *
   * @param {String} from - The name of the dependant
   * @param {String} to   - The name of the dependency
   *
   * @returns {Boolean} Whether or not a relationship exists from the 'from' node to the 'to' node
   */
  public __hasDependency: (from: string, to: string) => boolean = (
    relationExists(this)
  );

  /**
   * Retrieve the list of nodes that the node with the provided name depends upon.
   *
   * @function
   *
   * @param {String} of - The name of the node
   *
   * @returns {Object} A map of node names and their relationship data that the node with the provided name relies on
   */
  public __listDependencies: (of: string) => KeyValue<string> = (
    getRelation(this)
  );

  /**
   * Retrieve the list of nodes that rely upon the node with the provided name.
   *
   * @function
   *
   * @param {String} of - The name of the node
   *
   * @returns {Object} A map of node names and their relationship data that rely on the node with the provided name
   */
  public __listDependants: (of: string) => KeyValue<string> = (
    (x: string) => mapObjIndexed<any, any>(prop(x), pickBy((y) => contains(x, keys(y)), getRelations(this)))
  );

}

/**
 * A class built to manage the data relating to inter-dependencies in a project.
 *
 * @class
 * @extends InternalGraph
 */
export class DependencyGraph extends InternalGraph {

  /**
   * Add a real dependency to the depedency graph with the dependency name provided and mark the version provided as the
   * root version. Any extra data provided will be stored against the depedency node.
   *
   * @param {Object} opts         - The metadata relating to the depedency node
   * @param {String} opts.name    - The name of the depedency node
   * @param {String} opts.version - The version of the found depedency
   * @param {Any}    data         - The data to store against the depedency node
   *
   * @returns {Void}
   */
  public addRealDependency({ name, version }: DependencyMetadata, data: any): void {
    super.__addNode(name, { data, version, aliases: [version] });
  }

  /**
   * Add an implied depedency to the depedency graph. Note that a real depedency with the same dependency name must have
   * been added prior to adding an implied depedency.
   *
   * @param {Object} opts         - The metadata relating to the depedency node
   * @param {String} opts.name    - The name of the depedency node
   * @param {String} opts.version - The version of the found depedency
   *
   * @returns {Void}
   */
  public addImpliedDependency({ name, version }: DependencyMetadata): void {
    ifElse(versionExists(this, name), versionAlreadyExistsErr(name), pushToArray(this.__getNode(name).aliases))(version);
  }

  /**
   * Get a list of all of the real dependencies currently registered with the depedency graph.
   *
   * @function
   *
   * @returns {String[]} - A list of names of the real dependencies currently registered with the depedency graph
   */
  public listAllRealDependencies: () => string[] = (
    this.__listNodes
  );

  /**
   * Retrieve the data stored against the real depedency node with the name provided.
   *
   * @function
   *
   * @param {String} name - The name of the depedency node
   *
   * @returns {Any} Any data stored against the depedency node with the name provided
   */
  public getDependencyData: (name: string) => any = (
    (x: string) => prop("data", this.__getNode(x))
  );

  /**
   * Retrieve the metadata for the real depedency node with the name provided.
   *
   * @function
   *
   * @param {String} name - The name of the depedency node
   *
   * @returns {DependencyMetadata} An object containing the metadata for the depedency node with the name provided
   */
  public getDependencyMetadata: (name: string) => DependencyMetadata = (
    (x: string) => ({ name: x, version: prop<string>("version", this.__getNode(x)) })
  );

  /**
   * Retrieve the declared version for the real depedency node with the name provided.
   *
   * @function
   *
   * @param {String} name - The name of the depedency node
   *
   * @returns {String} A version string for the real depedency node with the name provided
   */
  public getDependencyVersion: (name: string) => any = (
    (x: string) => prop("version", this.__getNode(x))
  );

  /**
   * Retrieve the list of the registered aliases for the real depedency node with the name provided.
   *
   * @function
   *
   * @param {String} name - The name of the depedency node
   *
   * @returns {String[]} A list of registered aliases for the real depedency node with the name provided
   */
  public getDependencyAliases: (name: string) => string[] = (
    ((ref) => (x: string) => path<string[]>([x, "aliases"], ref))(getNodes(this))
  );

  /**
   * Create a relationship from a real dependency node to a specific depedency alias. This alias may or may not point to
   * a real depedency.
   *
   * @param {String} from       - The name of the dependant node`
   * @param {Object} to         - The metadata relating to the depedency node
   * @param {String} to.name    - The name of the depedency node
   * @param {String} to.version - The version alias of the depedency node
   *
   * @returns {Void}
   */
  public createInterDependency(from: string, to: DependencyMetadata): void {
    this.__markDependency(from, to.name, to.version);
  }

  /**
   * Retrieve a list of depedencies for the real dependency node with the name provided.
   *
   * @function
   *
   * @param {String} name - The name of the depedency node
   *
   * @returns {Object} - A key value store of real depedencies node names and their targeted aliases
   */
  public listDependenciesOfDependency: (name: string) => KeyValue<string> = (
    this.__listDependencies
  );

  /**
   * Retrieve a list of dependants for the real dependency node with the name provided.
   *
   * @function
   *
   * @param {String} name - The name of the depedency node
   *
   * @returns {Object} - A key value store of real depedencies node names and their declared versions
   */
  public listDependantsOfDependency: (name: string) => KeyValue<string> = (
    compose<any, any, any, any>(map(curry(pick)(["name", "version"])), map(this.getDependencyData), this.__listDependants)
  );

}

/**
 * A curried method to retrieve the data stored against a node with a specific depedency name.
 *
 * @private
 *
 * @param {Any} scope - The scope against which the nodes are mapped
 *
 * @returns {Function} A method that will retrieve the data stored against a node with a specific depedency name
 */
function getNode(scope: any): (name: string) => GraphNode {
  return flip(prop)(getNodes(scope));
}

/**
 * A curried method to check the existances of a node with a specific depedency name.
 *
 * @private
 *
 * @param {Any} scope - The scope against which the nodes are mapped
 *
 * @returns {Function} A method that will determine whether or not a node with the depedency name provided exists
 */
function nodeExists(scope: any): (name: string) => boolean {
  return flip(has)(getNodes(scope));
}

/**
 * A curried method to retrieve the list of relations stored against a specific depedency name.
 *
 * @private
 *
 * @param {Any} scope - The scope against which the relations are mapped
 *
 * @returns {Function} A method that will retrieve the list of relations for a specific depedency name
 */
function getRelation(scope: any): (name: string) => KeyValue<string> {
  return flip(prop)(getRelations(scope));
}

/**
 * A curried method to check the existances of a relation between two nodes.
 *
 * @private
 *
 * @param {Any} scope - The scope against which the nodes are mapped
 *
 * @returns {Function} A method that will determine whether or not a relation between to nodes exists
 */
function relationExists(scope: any): (from: string, to: string) => boolean {
  return (a: string, b: string) => {
    return contains(b, keys(getRelation(scope)(a)) || []);
  };
}

/**
 * An error that will alert upstream consumers that a node with the depedency name provided has already been added to
 * the graph.
 *
 * @private
 *
 * @param {String} name - The name of the node
 *
 * @returns {Never}
 */
function nodeAlreadyExistsErr(name: string): never {
  throw Error(`A node with the name '${name}' already exists`);
}

/**
 * An error that will alert upstream consumers that no node with the depedency name provided has been added to the
 * graph.
 *
 * @private
 *
 * @param {String} name - The name of the node
 *
 * @returns {Never}
 */
function noNodeFoundErr(name: string): never {
  throw Error(`No node with the name '${name}' has been added`);
}

/**
 * A curried method to check the existances of a node with a specific depedency name.
 *
 * @private
 *
 * @param {Any} scope - The scope against which the nodes are mapped
 *
 * @returns {Function} A method that will determine whether or not a node with the depedency name provided exists
 */
function versionExists(scope: any, name: string): (version: string) => boolean {
  return curry((aliases: string[], version: string): boolean => contains(version, aliases))(getNode(scope)(name).aliases);
}

/**
 * A curried method that will eventually throw an error that will alert upstream consumers that the version provided
 * already exists on the node with the provided name.
 *
 * @private
 *
 * @param {String} name - The name of the node
 *
 * @returns {Function} A method that when supplied with a version string will throw an error
 */
function versionAlreadyExistsErr(name: string): (version: string) => never {
  return (version: string): never => {
    throw Error(`Version '${version}' has already been registed on node '${name}'`);
  };
}

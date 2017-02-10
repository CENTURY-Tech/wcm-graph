import * as R from "ramda";
import { pushToArray, makeCaseInsensitive } from "../utilities/utilities";

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
}

/**
 * A weakmap of the depedency graph nodes.
 *
 * @private
 */
export const __nodes = new WeakMap();
const getNodes = (key: any): { [x: string]: GraphNode; } => makeCaseInsensitive(__nodes.get(key));
const setNodes = (key: any, value: any): void => void __nodes.set(key, value);

/**
 * A weakmap of the depedency graph relations.
 *
 * @private
 */
export const __relations = new WeakMap();
const getRelations = (key: any): { [x: string]: { [x: string]: string; } } => makeCaseInsensitive(__relations.get(key));
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
  static stringifyDependencyMetadata: (opts: DependencyMetadata) => string = (
    R.compose(R.join("@"), R.values)
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
  static parseDependencyMetadata: (value: string) => DependencyMetadata = (
    R.compose(R.fromPairs as (x: string[][]) => DependencyMetadata, R.transpose, R.curry(R.pair)(["name", "version"]), R.split(/@/))
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
  __addNode(name: string, data: any): void {
    R.when(nodeExists(this), nodeAlreadyExistsErr)(name);

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
  __getNode: (name: string) => GraphNode = (
    R.ifElse(nodeExists(this), getNode(this), noNodeFoundErr)
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
  __hasNode(name: string): boolean {
    return nodeExists(this)(name);
  }

  /**
   * Retrieve a list of the names for each node that has been previously added to the graph.
   *
   * @function
   *
   * @returns {String[]} An array of node names that have been previously added to the graph
   */
  __listNodes: () => string[] = (
    ((ref) => () => R.keys(ref))(getNodes(this))
  );

  /**
   * Create a relationship from the node with the name provided as the first argument, to the node with the name
   * provided as the second argument. If either of the names cannot be found in the nodes list an error will be thrown.
   *
   * @param {String} from - The name of the dependant
   * @param {String} to   - The name of the dependency
   *
   * @returns {Void}
   */
  __markDependency(from: string, to: string, data: any): void {
    R.map(R.unless(nodeExists(this), noNodeFoundErr))([from, to]);

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
  __hasDependency: (from: string, to: string) => boolean = (
    relationExists(this)
  );

  /**
   * Retrieve the list of nodes that the node with the provided name depends upon.
   *
   * @function
   *
   * @param {String} of - The name of the node
   *
   * @returns {String[]} A list of nodes that the node with the provided name depends upon
   */
  __listDependencies: (of: string) => { [x: string]: string; } = (
    getRelation(this)
  );

  /**
   * Retrieve the list of nodes that rely upon the node with the provided name.
   *
   * @function
   *
   * @param {String} of - The name of the node
   *
   * @returns {String[]} A list of nodes that rely upon the node with the provided name
   */
  __listDependants: (of: string) => { [x: string]: string; } = (
    (x: string): { [x: string]: string; } => R.pickBy((y) => R.contains(x, R.keys(y)), getRelations(this))
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
  addRealDependency({name, version}: DependencyMetadata, data: any): void {
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
  addImpliedDependency({name, version}: DependencyMetadata): void {
    R.ifElse(versionExists(this, name), versionAlreadyExistsErr(name), pushToArray(this.__getNode(name).aliases))(version);
  }

  listAllRealDependencies: () => string[] = (
    this.__listNodes
  );

  getDependencyData: (name: string) => any = (
    (x: string) => R.prop("data", this.__getNode(x))
  );

  getDependencyVersion: (name: string) => any = (
    (x: string) => R.prop("version", this.__getNode(x))
  );

  getDependencyAliases: (name: string) => string[] = (
    ((ref) => (x: string) => R.path<string[]>([x, "aliases"], ref))(getNodes(this))
  );

  createInterDependency(from: string, to: DependencyMetadata): void {
    this.__markDependency(from, to.name, to.version);
  }

  listDependenciesOfDependency: (name: string) => { [x: string]: string; } = (
    this.__listDependencies
  );

  // listDependantsOfDependency: (name: string) => { [x: string]: string; } = (
    // R.compose(R.map(R.curry(R.pick)(["name", "version"])), R.map(this.getDependencyData), this.__listDependants)
  // );

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
  return R.flip(R.prop)(getNodes(scope));
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
  return R.flip(R.has)(getNodes(scope));
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
function getRelation(scope: any): (name: string) => { [x: string]: string; } {
  return R.flip(R.prop)(getRelations(scope));
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
    return R.contains(b, R.keys(getRelation(scope)(a)) || []);
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
  return R.curry((aliases: string[], version: string): boolean => R.contains(version, aliases))(getNode(scope)(name).aliases);
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

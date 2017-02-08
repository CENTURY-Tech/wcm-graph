import * as R from "ramda";

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
  data: Object;
  childOf?: string;
}

/**
 * A weakmap of the depedency graph nodes.
 *
 * @private
 */
export const __nodes = new WeakMap();
const getNodes = (key: any): { [x: string]: GraphNode; } => __nodes.get(key);
const setNodes = (key: any, value: any): void => void __nodes.set(key, value);

/**
 * A weakmap of the depedency graph relations.
 *
 * @private
 */
export const __relations = new WeakMap();
const getRelations = (key: any): { [x: string]: string[]; } => __relations.get(key);
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
    getRelations(this)[name] = [];
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
  __getNode: (name: string) => any = (
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
  __markDependency(from: string, to: string): void {
    R.map(R.unless(nodeExists(this), noNodeFoundErr))([from, to]);

    getRelation(this)(from).push(to);
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
  __listDependencies: (of: string) => string[] = (
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
  __listDependants: (of: string) => string[] = (
    (x: string) => R.keys(R.pickBy(R.contains(x), getRelations(this)))
  );

}

/**
 * A class built to manage the data relating to inter-dependencies in a project.
 *
 * @class
 * @extends BaseGraph
 */
export class DependencyGraph extends InternalGraph {

  addRealDependency({name, version}: DependencyMetadata, data: any): void {
    super.__addNode(name, { data, version, aliases: [version] });
  }

  addImpliedDependency({name, version}: DependencyMetadata) {
    super.__getNode(name).aliases.push(version);
  }

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
function getNode(scope: any): (name: string) => any {
  return (x: string) => {
    return R.view(R.lensProp(x), getNodes(scope));
  };
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
function getRelation(scope: any): (name: string) => any {
  return (x: string) => {
    return R.view(R.lensProp(x), getRelations(scope));
  };
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
    return R.contains(b, getRelation(scope)(a) || []);
  };
}

/**
 * An error that will alert upstream consumers that no node with the depedency name provided has been added to the
 * depedency graph.
 *
 * @private
 *
 * @param {String} name - The name of the dependency
 *
 * @returns {Never}
 */
function nodeAlreadyExistsErr(name: string): never {
  throw Error(`A node with the name '${name}' already exists`);
}

/**
 * An error that will alert upstream consumers that no node with the depedency name provided has been added to the
 * depedency graph.
 *
 * @private
 *
 * @param {String} name - The name of the dependency
 *
 * @returns {Never}
 */
function noNodeFoundErr(name: string): never {
  throw Error(`No node with the name '${name}' has been added`);
}

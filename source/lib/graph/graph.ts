import * as R from "ramda";

/**
 * A weakmap of the depedency graph nodes.
 */
export const __nodes = new WeakMap();
const getNodes = (key: any): Object => __nodes.get(key);
const setNodes = (key: any, value: any): void => void __nodes.set(key, value);

/**
 * A weakmap of the depedency graph relations.
 */
export const __relations = new WeakMap();
const getRelations = (key: any): Object => __relations.get(key);
const setRelations = (key: any, value: any): void => void __relations.set(key, value);

/**
 * A curried method to retrieve the data stored against a node with a specific depedency name.
 *
 * @param {Any} scope - The scope against which the nodes are mapped
 *
 * @returns {Function} A method that will retrieve the data stored against a node with a specific depedency name
 */
const getNode = (scope: any): (name: string) => any => R.flip(R.prop)(getNodes(scope));

/**
 * A curried method to retrieve the list of relations stored against a specific depedency name.
 *
 * @param {Any} scope - The scope against which the relations are mapped
 *
 * @returns {Function} A method that will retrieve the list of relations for a specific depedency name
 */
const getRelation = (scope: any): (name: string) => any => R.flip(R.prop)(getRelations(scope));

/**
 * A curried method to check the existances of a node with a specific depedency name.
 *
 * @param {Any} scope - The scope against which the nodes are mapped
 *
 * @returns {Function} A method that will determine whether or not a node with the depedency name provided exists
 */
const nodeExists = (scope: any): (name: string) => boolean => R.flip(R.has)(getNodes(scope));

/**
 * A curried method to check the existances of a relation between two nodes.
 *
 * @param {Any} scope - The scope against which the nodes are mapped
 *
 * @returns {Function} A method that will determine whether or not a relation between to nodes exists
 */
const relationExists = (scope: any): (from: string, to: string) => boolean => R.curry((from: string, to: string) => R.contains(to, getRelation(scope)(from) || []));

/**
 * An error that will alert upstream consumers that no node with the depedency name provided has been added to the
 * depedency graph.
 *
 * @param {String} name - The name of the dependency
 *
 * @returns {Never}
 */
const nodeAlreadyExists = (name: string): never => { throw Error(`A node with the name '${name}' already exists`); };

/**
 * An error that will alert upstream consumers that no node with the depedency name provided has been added to the
 * depedency graph.
 *
 * @param {String} name - The name of the dependency
 *
 * @returns {Never}
 */
const noNodeFound = (name: string): never => { throw Error(`No node with the name '${name}' has been added`); };

/**
 * A base class responsible for weakmap initialisation. This ensures that upstream classes are able to use curried
 * methods defined as properties that interface with the weakmaps.
 */
export class BaseGraph {

  constructor() {
    setNodes(this, {});
    setRelations(this, {});
  }

}

/**
 * A class built to manage the data relating to inter-dependencies in a project.
 */
export class DependencyGraph extends BaseGraph {

  /**
   * Add a node with the dependency name provided to the dependency graph, with the data provided. If a node with the
   * dependency name provided already exists on the dependency graph an error will be thrown.
   *
   * @param {String} name - The name of the dependency
   * @param {Any}    data - The data to map to the dependency
   *
   * @returns {Void}
   */
  addNode(name: string, data: any): void {
    R.when(nodeExists(this), nodeAlreadyExists)(name);

    getNodes(this)[name] = data;
    getRelations(this)[name] = [];
  }

  /**
   * Retrieve the data relating to the node with the dependency name provided. If no node exists with the depedency name
   * provided an error will be thrown.
   *
   * @param {String} name - The name of the dependency
   *
   * @returns {Any} Any data stored against the dependency graph at the node with the depedency name provided
   */
  getNode: (name: string) => any = (
    R.ifElse(nodeExists(this), getNode(this), noNodeFound)
  );

  /**
   * Check to see whether or not the dependency graph contains a node with the dependency name provided.
   *
   * @param {String} name - The name of the dependency
   *
   * @returns {Boolean} Whether or not the graph has a dependency with the name provided
   */
  hasNode: (name: string) => boolean = (
    nodeExists(this)
  );

  /**
   * Create a relationship from the depedency name provided as the first argument, to the depedency name provided as the
   * second argument. If either of the depedency names cannot be found in the nodes list an error will be thrown.
   *
   * @param {String} from - The name of the dependant
   * @param {String} to   - The name of the dependency
   *
   * @returns {Void}
   */
  markDependency(from: string, to: string): void {
    R.map(R.unless(nodeExists(this), noNodeFound))([from, to]);

    getRelation(this)(from).push(to);
  }

  /**
   * Check to see whether or not a relationship exists from the 'from' node to the 'to' node.
   *
   * @param {String} from - The name of the dependant
   * @param {String} to   - The name of the dependency
   *
   * @returns {Boolean} Whether or not a relationship exists from the 'from' node to the 'to' node
   */
  hasDependency: (from: string, to: string) => boolean = (
    relationExists(this)
  );

  /**
   * Retrieve the list of nodes that the node with the provided depedency name depends upon.
   *
   * @param {String} of - The name of the depedency
   *
   * @returns {String[]} A list of nodes that the node with the provided depedency name depends upon
   */
  listDependencies: (of: string) => string[] = (
    getRelation(this)
  );

  /**
   * Retrieve the list of nodes that rely upon the node with the provided depedency name.
   *
   * @param {String} of - The name of the depedency
   *
   * @returns {String[]} A list of nodes that rely upon the node with the provided depedency name
   */
  listDependants: (of: string) => string[] = (
    R.curryN(1, (of: string) => R.keys(R.filter(R.contains(of), getRelations(this) as any[]))) as (x: string) => string[]
  );

}

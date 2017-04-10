import { contains, ifElse, keys, map, mapObjIndexed, pickBy, prop, unless, when } from "ramda";
import { getNode, getNodes, nodeExists, setNode } from "../../storage/nodes/nodes";
import { getRelation, getRelations, relationExists, setRelation } from "../../storage/relations/relations";
import { IKeyValue } from "../../utilities/utilities";
import { AbstractBaseGraph, IBaseGraphNodeObject, IBaseGraphRelationObject } from "../base/base";

/**
 * An internal set of semi-private or hidden methods to simplify the construction of the depedency graph.
 *
 * @class
 * @extends AbstractBaseGraph
 */
export class AbstractInternalGraph extends AbstractBaseGraph {

  /**
   * Add a node with the name provided to the graph, with the data provided. If a node with the name provided already
   * exists on the dependency an error will be thrown.
   *
   * @param {String} name - The name of the node
   * @param {Any}    data - The data to map to the node
   *
   * @returns {Void}
   */
  public addInternalNode(name: string, data: IBaseGraphNodeObject): void {
    when(nodeExists(this), nodeAlreadyExistsErr)(name);

    setNode(this)(name, data);
    setRelation(this)(name, {});
  }

  /**
   * Retrieve the data relating to the node with the name provided. If no node exists with the name provided an error
   * will be thrown.
   *
   * @param {String} name - The name of the node
   *
   * @returns {IBaseGraphNodeObject} The data stored against the graph at the node with the name provided
   */
  public getInternalNode(name: string): IBaseGraphNodeObject {
    return ifElse(nodeExists(this), getNode(this), noNodeFoundErr)(name);
  }

  /**
   * Check to see whether or not the graph contains a node with the name provided.
   *
   * @param {String} name - The name of the node
   *
   * @returns {Boolean} Whether or not the graph has a node with the name provided
   */
  public hasInternalNode(name: string): boolean {
    return nodeExists(this)(name);
  }

  /**
   * Retrieve a list of the names for each node that has been previously added to the graph.
   *
   * @returns {String[]} An array of node names that have been previously added to the graph
   */
  public listInternalNodes(): string[] {
    return keys(getNodes(this));
  }

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
  public markInternalDependency(from: string, to: string, data: any): void {
    map(unless(nodeExists(this), noNodeFoundErr))([from, to]);

    getRelation(this)(from)[to] = data;
  }

  /**
   * Check to see whether or not a relationship exists from the 'from' node to the 'to' node.
   *
   * @param {String} from - The name of the dependant
   * @param {String} to   - The name of the dependency
   *
   * @returns {Boolean} Whether or not a relationship exists from the 'from' node to the 'to' node
   */
  public hasInternalDependency(from: string, to: string): boolean {
    return relationExists(this)(from, to);
  }

  /**
   * Retrieve the list of nodes that the node with the provided name depends upon.
   *
   * @param {String} of - The name of the node
   *
   * @returns {Object} A map of node names and their relationship data that the node with the provided name relies on
   */
  public listInternalDependencies(of: string): IBaseGraphRelationObject {
    return getRelation(this)(of);
  }

  /**
   * Retrieve the list of nodes that rely upon the node with the provided name.
   *
   * @param {String} of - The name of the node
   *
   * @returns {Object} A map of node names and their relationship data that rely on the node with the provided name
   */
  public listInternalDependants(of: string): IBaseGraphRelationObject {
    return mapObjIndexed<any, any>(prop(of), pickBy((y) => contains(of, keys(y)), getRelations(this)));
  }

}

/**
 * An error that will alert upstream consumers that a node with the depedency name provided has already been added to
 * the graph.
 *
 * @param {String} name - The name of the node
 *
 * @returns {Never}
 */
export function nodeAlreadyExistsErr(name: string): never {
  throw Error(`A node with the name '${name}' already exists`);
}

/**
 * An error that will alert upstream consumers that no node with the depedency name provided has been added to the
 * graph.
 *
 * @param {String} name - The name of the node
 *
 * @returns {Never}
 */
export function noNodeFoundErr(name: string): never {
  throw Error(`No node with the name '${name}' has been added`);
}

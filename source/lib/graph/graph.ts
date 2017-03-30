import { compose, contains, curry, has, ifElse, map, path, pick, prop, when } from "ramda";
import { IKeyValue, makeCaseInsensitive, pushToArray } from "../utilities/utilities";
import { BaseGraph, IBaseDependencyMetadata } from "./base/base";
import { getNode, InternalGraph } from "./internal/internal";
import { getNodes, getRelations } from "./storage/nodes";

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
  public addRealDependency({ name, version }: IBaseDependencyMetadata, data: any): void {
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
  public addImpliedDependency({ name, version }: IBaseDependencyMetadata): void {
    ifElse(this.versionExists(name), versionAlreadyExistsErr(name), pushToArray(this.__getNode(name).aliases))(version);
  }

  /**
   * Get a list of all of the real dependencies currently registered with the depedency graph.
   *
   * @returns {String[]} A list of names of the real dependencies currently registered with the depedency graph
   */
  public listAllRealDependencies(): string[] {
    return this.__listNodes();
  }

  /**
   * Retrieve the data stored against the real depedency node with the name provided.
   *
   * @param {String} name - The name of the depedency node
   *
   * @returns {Any} Any data stored against the depedency node with the name provided
   */
  public getDependencyData(name: string): any {
    return (x: string) => prop("data", this.__getNode(name));
  }

  /**
   * Retrieve the metadata for the real depedency node with the name provided.
   *
   * @param {String} name - The name of the depedency node
   *
   * @returns {IBaseDependencyMetadata} An object containing the metadata for the depedency node with the name provided
   */
  public getDependencyMetadata(name: string): IBaseDependencyMetadata {
    return ({ name, version: prop<string>("version", this.__getNode(name)) });
  }

  /**
   * Retrieve the declared version for the real depedency node with the name provided.
   *
   * @function
   *
   * @param {String} name - The name of the depedency node
   *
   * @returns {String} A version string for the real depedency node with the name provided
   */
  public getDependencyVersion(name: string): any {
    return prop("version", this.__getNode(name));
  }

  /**
   * Retrieve the list of the registered aliases for the real depedency node with the name provided.
   *
   * @function
   *
   * @param {String} name - The name of the depedency node
   *
   * @returns {String[]} A list of registered aliases for the real depedency node with the name provided
   */
  public getDependencyAliases(name: string): string[] {
    return path<string[]>([name, "aliases"], getNodes(this));
  }

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
  public createInterDependency(from: string, to: IBaseDependencyMetadata): void {
    this.__markDependency(from, to.name, to.version);
  }

  /**
   * Retrieve a list of depedencies for the real dependency node with the name provided.
   *
   * @function
   *
   * @param {String} name - The name of the depedency node
   *
   * @returns {Object} A key value store of real depedencies node names and their targeted aliases
   */
  public listDependenciesOfDependency(name: string): IKeyValue<string> {
    return this.__listDependencies(name);
  }

  /**
   * Retrieve a list of dependants for the real dependency node with the name provided.
   *
   * @function
   *
   * @param {String} name - The name of the depedency node
   *
   * @returns {Object} A key value store of real depedencies node names and their declared versions
   */
  public listDependantsOfDependency(name: string): IKeyValue<string> {
    return compose<any, any, any, any>(map(pick(["name", "version"])), map(this.getDependencyData), this.__listDependants)(name); // tslint:disable-line
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
  private versionExists(name: string): (version: string) => boolean {
    return (version: string): boolean => {
      return contains(version, this.__getNode(name).aliases);
    };
  }

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

export { BaseGraph, IBaseDependencyMetadata, InternalGraph };

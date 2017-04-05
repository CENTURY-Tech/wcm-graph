import { compose, contains, curry, has, ifElse, map, path, pick, prop, when } from "ramda";
import { IKeyValue, makeCaseInsensitive, pushToArray } from "../utilities/utilities";
import { AbstractBaseGraph, IBaseDependencyMetadata } from "./abstract/base/base";
import { AbstractInternalGraph } from "./abstract/internal/internal";

/**
 * A class built to manage the data relating to inter-dependencies in a project.
 *
 * @class
 * @extends AbstractInternalGraph
 */
export class DependencyGraph extends AbstractInternalGraph {

  /**
   * Add a real dependency to the depedency graph with the dependency name provided and mark the version provided as the
   * root version. Any extra data provided will be stored against the depedency node.
   *
   * @function
   *
   * @param {Object} opts         - The metadata relating to the depedency node
   * @param {String} opts.name    - The name of the depedency node
   * @param {String} opts.version - The version of the found depedency
   * @param {Any}    data         - The data to store against the depedency node
   *
   * @returns {Void}
   */
  public addRealDependency({ name, version }: IBaseDependencyMetadata, data: any): void {
    return this.addInternalNode(name, { data, version, aliases: [version] });
  }

  /**
   * Add an implied depedency to the depedency graph. Note that a real depedency with the same dependency name must have
   * been added prior to adding an implied depedency.
   *
   * @function
   *
   * @param {Object} opts         - The metadata relating to the depedency node
   * @param {String} opts.name    - The name of the depedency node
   * @param {String} opts.version - The version of the found depedency
   *
   * @returns {Void}
   */
  public addImpliedDependency({ name, version }: IBaseDependencyMetadata): void {
    const versionWithNameExists = this.versionExists(name);
    const versionWithNameExistsErr = versionAlreadyExistsErr(name);
    const proceedWithAliasUpdate = pushToArray(this.getInternalNode(name).aliases);

    return ifElse(versionWithNameExists, versionWithNameExistsErr, proceedWithAliasUpdate)(version);
  }

  /**
   * Retrieve the data stored against the real depedency node with the name provided.
   *
   * @function
   *
   * @param {String} name - The name of the depedency node
   *
   * @returns {Any} Any data stored against the depedency node with the name provided
   */
  public getDependencyData(name: string): any {
    return prop("data", this.getInternalNode(name));
  }

  /**
   * Retrieve the metadata for the real depedency node with the name provided.
   *
   * @function
   *
   * @todo Improve this method by use Ramdas "project" method
   *
   * @param {String} name - The name of the depedency node
   *
   * @returns {IBaseDependencyMetadata} An object containing the metadata for the depedency node with the name provided
   */
  public getDependencyMetadata(name: string): IBaseDependencyMetadata {
    return { name, version: prop<string>("version", this.getInternalNode(name)) };
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
  public getDependencyVersion(name: string): string {
    return prop<string>("version", this.getInternalNode(name));
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
    return prop<string[]>("aliases", this.getInternalNode(name));
  }

  /**
   * Get a list of all of the real dependencies currently registered with the depedency graph.
   *
   * @returns {String[]} A list of names of the real dependencies currently registered with the depedency graph
   */
  public listAllRealDependencies(): string[] {
    return this.listInternalNodes();
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
    return this.markInternalDependency(from, to.name, to.version);
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
  public listDependenciesOfDependency(name: string): IKeyValue<number> {
    return this.listInternalDependencies(name);
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
    const mapNameAndVersion = map(pick(["name", "version"]));
    const mapDependencyData = map(this.getDependencyData);

    return compose<any, any, any, any>(mapNameAndVersion, mapDependencyData, this.listInternalDependencies)(name);
  }

  /**
   * A curried method to check the existances of a node with a specific depedency name.
   *
   * @function
   *
   * @param {Any} scope - The scope against which the nodes are mapped
   *
   * @returns {Function} A method that will determine whether or not a node with the depedency name provided exists
   */
  public versionExists(name: string): (version: string) => boolean {
    return (version: string): boolean => contains(version, this.getInternalNode(name).aliases);
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

export { IBaseDependencyMetadata };

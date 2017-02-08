import * as R from "ramda";
import * as path from "path";
import { BaseGraph, DependencyGraph, DependencyMetadata } from "./lib/graph/graph";
import { PackageManager, DependencyJson, readBowerJson, readPackageJson, readDependenciesJson, listInstalledDependencies } from "./lib/filesystem/filesystem";
import { firstDefinedProperty } from "./lib/utilities/utilities";

const nodeNameFrom = BaseGraph.stringifyDependencyMetadata;

/**
 * An asynchronous function that will prepare and return a dependency graph representing the inter-dependencies within
 * the project at the path provided.
 *
 * @param {String} projectPath    - The full path to the project
 * @param {String} packageManager - The package manger used in the project
 *
 * @returns {Promise<DependencyGraph>} A dependency graph describing the inter-dependencies within the project
 */
export async function generateDeclaredDependenciesGraph(projectPath: string, packageManager: PackageManager): Promise<DependencyGraph> {
  "use strict";

  const dependencyGraph = new DependencyGraph();
  const dependencyRootMap: { [x: string]: string; } = {};

  /**
   * A curried method used to read the dependency JSON for the dependency with the name provided.
   */
  const readDependencyJson = readDependenciesJson(packageManager, projectPath);

  /**
   * A curried method used to add an installed dependency to the dependency graph.
   */
  const addInstalledDependency = addInstalledDependencyToGraph(dependencyGraph);

  /**
   * A curried method used to add an implied dependency to the dependency graph.
   */
  const addImpliedDependency = addImpliedDependencyToGraph(dependencyGraph);

  /**
   * 1) Retrieve a list of the installed dependencies
   * 2) Read each dependency JSON file and register accordingly
   */
  for (let dependency of await listInstalledDependencies(projectPath, packageManager)) {
    dependencyRootMap[dependency] = addInstalledDependency(await readDependencyJson(dependency));
  }

  /**
   * 1) Retrieve a list of the currently registered ndoes
   * 2) Loop through each nodes list of dependencies and register accordingly
   */
  for (let nodeName of dependencyGraph.__listNodes()) {
    const nodeData: DependencyJson = dependencyGraph.__getNode(nodeName);

    for (let [name, version] of R.toPairs<string, string>(nodeData.dependencies)) {
      if (dependencyRootMap[name] !== version) {
        addImpliedDependency(name, version);
      }

      dependencyGraph.__markDependency(nodeName, nodeNameFrom({ name, version }));
    }
  }

  console.log(dependencyGraph.__listDependants(nodeNameFrom({ name: "polymer", version: dependencyRootMap["polymer"] })));

  /*R.compose(
    R.uniq,
    R.unnest,
    R.map(
      R.compose(
        R.toPairs,
        R.prop("dependencies"),
        dependencyGraph.__getNode)
    )
  )(dependencyGraph.__listNodes());*/

  return Promise.resolve(dependencyGraph);
}

/**
 * An asynchronous function that will prepare and return a dependency graph representing the runtime dependencies within
 * the project at the path provided.
 *
 * @param {String} projectPath - The full path to the project
 * @param {String} entryPath   - The path to the application root relative from the project root
 *
 * @returns {Promise<DependencyGraph>} A dependency graph listing the runtime dependencies within the project
 */
export async function generateImportedDependenciesGraph(projectPath: string, entryPath: string): Promise<DependencyGraph> {
  "use strict";

  return Promise.resolve(new DependencyGraph());
}

/**
 * A curried method to register an installed dependency with the dependency graph and use dependency package JSON as the
 * node data.
 *
 * @private
 *
 * @param {DependencyGraph} dependencyGraph - The dependency to register dependencies with
 *
 * @returns {Function} A curried method the register a node with the provided dependency package JSON
 */
function addInstalledDependencyToGraph(dependencyGraph: DependencyGraph) {
  return (dependencyJson: DependencyJson): string => {
    const dependencyMetadata: DependencyMetadata = getDependencyMetadata(dependencyJson);
    dependencyGraph.__addNode(nodeNameFrom(dependencyMetadata), dependencyJson);
    return dependencyMetadata.version;
  };
}

/**
 * A curried method to register an installed dependency with the dependency graph and use dependency package JSON as the
 * node data.
 *
 * @private
 *
 * @param {DependencyGraph} dependencyGraph - The dependency to register dependencies with
 *
 * @returns {Function} A curried method the register a node with the provided dependency package JSON
 */
function addImpliedDependencyToGraph(dependencyGraph: DependencyGraph) {
  return (name: string, version: string): void => {
    dependencyGraph.__addNode(nodeNameFrom({ name, version }), null);
  };
}

/**
 * Retrieve the dependency metadata from the dependency JSON.
 *
 * @private
 *
 * @param {DependencyJson} dependencyJson - The dependency JSON
 *
 * @return {DependencyMetadata} A object containing the dependencys name and version
 */
function getDependencyMetadata(dependencyJson: DependencyJson): DependencyMetadata {
  return { name: dependencyJson.name, version: firstDefinedProperty(["version", "_release"])(dependencyJson) };
}

generateDeclaredDependenciesGraph("/Users/iain.reid/git_repositories/webapp-learn", "bower");

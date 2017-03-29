import { compose, contains, map, prop, toPairs, unnest } from "ramda";
import { DependencyJson, IDependencyOptions, listInstalledDependencies, readDependenciesJson } from "./lib/filesystem/filesystem";
import { BaseGraph, DependencyGraph, IBaseDependencyMetadata } from "./lib/graph/graph";
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
export async function generateDeclaredDependenciesGraph(opts: IDependencyOptions): Promise<DependencyGraph> {
  "use strict";

  const dependencyGraph = new DependencyGraph();

  await registerDeclaredDependencies(dependencyGraph, opts);
  await registerImpliedDependencies(dependencyGraph);

  for (let dependencyName of dependencyGraph.listAllRealDependencies()) {
    const dependencyData = dependencyGraph.getDependencyData(dependencyName);

    for (let [name, version] of toPairs<string, string>(dependencyData.dependencies)) {
      dependencyGraph.createInterDependency(dependencyName, { name, version });
    }
  }

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
 * Register each of the declared dependencies from the project at the path provided.
 *
 * @private
 *
 * @param {DependencyGraph} dependencyGraph - The dependency graph to register against
 * @param {String}          projectPath     - The full path to the project
 * @param {String}          packageManager  - The package manger used in the project
 *
 * @returns {Promise<Void>}
 */
async function registerDeclaredDependencies(dependencyGraph: DependencyGraph, opts: IDependencyOptions): Promise<void> {
  for (let dependencyJson of await readInstalledDependenciesJson(opts)) {
    dependencyGraph.addRealDependency(getDependencyMetadata(dependencyJson), dependencyJson);
  }
}

/**
 * Register each of the implied dependencies specified by the declared dependencies already registered.
 *
 * @private
 *
 * @param {DependencyGraph} dependencyGraph - The dependency graph to register against
 *
 * @returns {Promise<Void>}
 */
async function registerImpliedDependencies(dependencyGraph: DependencyGraph): Promise<void> {
  for (let [name, version] of getAllDependencyPairs(dependencyGraph)) {
    if (!contains(version, dependencyGraph.getDependencyAliases(name))) {
      dependencyGraph.addImpliedDependency({ name, version });
    }
  }
}

/**
 * Retrieve an array of the installed dependencies JSON.
 *
 * @private
 *
 * @param {String} projectPath    - The full path to the project
 * @param {String} packageManager - The package manger used in the project
 *
 * @returns {Promise<DependencyJson[]>} A list of the installed dependencies JSON files
 */
async function readInstalledDependenciesJson(opts: IDependencyOptions): Promise<DependencyJson[]> {
  return Promise.all((await listInstalledDependencies(opts)).map(readDependenciesJson(opts)));
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
function getDependencyMetadata(dependencyJson: DependencyJson): IBaseDependencyMetadata {
  return { name: dependencyJson.name, version: firstDefinedProperty(["version", "_release"])(dependencyJson) };
}

/**
 * Retrieve the child dependencies of the dependencies currently registered against the provided dependency graph.
 *
 * @private
 *
 * @param {DependencyGraph} dependencyGraph - The dependency graph to register against
 *
 * @returns {String[][]} The child dependencies as an array of arrays of strings
 */
function getAllDependencyPairs(dependencyGraph: DependencyGraph): string[][] {
  return compose(unnest, map(compose(getDependencyPairs, dependencyGraph.getDependencyData)))(dependencyGraph.listAllRealDependencies());
}

function getDependencyPairs(dependencyJson: DependencyJson): string[][] {
  return toPairs<string, string>(prop("dependencies", dependencyJson));
}

generateDeclaredDependenciesGraph({
  packageManager: "bower",
  projectPath: "/Users/iain.reid/git_repositories/webapp-learn",
})
  .then((graph) => console.log(JSON.stringify(graph.listDependantsOfDependency("polymer"), null, 4)))
  .catch((err) => console.log(err));

import * as R from "ramda";
import * as path from "path";
import { DependencyGraph } from "./lib/graph/graph";
import { PackageManager, DependencyJson, readBowerJson, readPackageJson, readDependencyJson, listInstalledDependencies } from "./lib/filesystem/filesystem";

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

  let dependencyGraph = new DependencyGraph();

  for (let dependency of await listInstalledDependencies(projectPath, packageManager)) {
    console.log(dependency);
  }

  /*let projectJson: DependencyJson;


  switch (packageManager) {
    case "bower":
      projectJson = await readBowerJson(projectPath);
      break;
    case "npm":
      projectJson = await readPackageJson(projectPath);
      break;
  }

  for (let [dependencyName, dependencyVersion] of R.toPairs<string, string>(projectJson.dependencies)) {
    // dependencyGraph.addNode(DependencyGraph.stringifyDependencyName(), {});

    processProjectDependency(dependencyName, dependencyGraph, readDependencyJson(packageManager, projectPath));
  }*/

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

function* processProjectDependency(dependencyName: string, dependencyGraph: DependencyGraph, readDependencyJson: (dependencyName: string) => Promise<DependencyJson>): IterableIterator<Promise<string>> {
  "use strict";

  let dependencyPairs;

  yield readDependencyJson(dependencyName)
    .then((dependencyJson: DependencyJson) => {
      dependencyPairs = R.toPairs(dependencyJson);
      return dependencyName;
    });

  for (let [dependencyName, dependencyVersion] of dependencyPairs) {
    if (!dependencyGraph.hasNode(dependencyName)) {
      yield* processProjectDependency(dependencyName, dependencyGraph, readDependencyJson);
    }
  }
}

function addDependencyToGraph(dependencyGraph: DependencyGraph) {
  return (name: string, version: string) => {
    dependencyGraph.addNode(DependencyGraph.stringifyDependencyName({ name, version }), null);
  };
}

generateDeclaredDependenciesGraph("/Users/iain.reid/git_repositories/webapp-learn", "bower");

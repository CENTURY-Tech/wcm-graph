import * as R from "ramda";
import { DependencyGraph } from "./lib/graph/graph";

/**
 * An enum of the supported package managers.
 */
export type PackageManager = "bower";

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

  return Promise.resolve(new DependencyGraph());
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

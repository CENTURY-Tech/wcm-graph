import { deepEqual, equal, ok, strictEqual, throws } from "assert";
import { DependencyGraph } from "./graph";
import { nodesMap } from "./storage/storage";

describe("DependencyGraph", () => {
  describe("Instance methods", () => {
    let dependencyGraph: DependencyGraph;

    beforeEach(() => {
      dependencyGraph = new DependencyGraph();
    });

    /**
     * Tests for the instance method "addRealDependency".
     */
    describe("Method: 'addRealDependency'", () => {
      it("should accept 2 parameters", () => {
        strictEqual(dependencyGraph.addRealDependency.length, 2);
      });

      it("should add a node with the name provided", () => {
        dependencyGraph.addRealDependency({ name: "foo", version: "1" }, null);
        ok(nodesMap.get(dependencyGraph).foo);
      });

      it("should add a node with the version provided", () => {
        dependencyGraph.addRealDependency({ name: "foo", version: "1" }, null);
        equal(nodesMap.get(dependencyGraph).foo.version, "1");
      });

      it("should add a node with the data provided", () => {
        dependencyGraph.addRealDependency({ name: "foo", version: "1" }, "bar");
        equal(nodesMap.get(dependencyGraph).foo.data, "bar");
      });

      it("should add a node and add the version to the aliases", () => {
        dependencyGraph.addRealDependency({ name: "foo", version: "1" }, null);
        deepEqual(nodesMap.get(dependencyGraph).foo.aliases, ["1"]);
      });

      it("should fail to add a node with the same name twice", () => {
        throws(() => {
          nodesMap.get(dependencyGraph).foo = {};
          dependencyGraph.addRealDependency({ name: "foo", version: "1" }, null);
        }, "A node with the name 'foo' already exists");
      });
    });

    /**
     * Tests for the instance method "addImpliedDependency".
     */
    describe("Method: 'addImpliedDependency'", () => {
      it("should accept 1 parameter", () => {
        strictEqual(dependencyGraph.addImpliedDependency.length, 1);
      });

      it("should add an alias to the node with the name provided", () => {
        nodesMap.get(dependencyGraph).foo = { aliases: [] };
        dependencyGraph.addImpliedDependency({ name: "foo", version: "1" });
        deepEqual(nodesMap.get(dependencyGraph).foo.aliases, ["1"]);
      });

      it("should fail to add a node with the same version twice", () => {
        throws(() => {
          nodesMap.get(dependencyGraph).foo = { aliases: ["1"] };
          dependencyGraph.addImpliedDependency({ name: "foo", version: "1" });
        }, "Version '1' has already been registed on node 'foo'");
      });

      it("should fail when a node has not been added", () => {
        throws(() => {
          dependencyGraph.addImpliedDependency({ name: "foo", version: "1" });
        }, "No node with the name 'foo' has been added");
      });
    });
  });
});

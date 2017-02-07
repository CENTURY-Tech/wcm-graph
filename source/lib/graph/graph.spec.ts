import * as R from "ramda";
import * as assert from "assert";
import * as graph from "./graph";

describe("Graph", () => {
  it("should export a class with the name 'BaseGraph'", () => {
    assert.ok(graph.BaseGraph);
  });

  it("should export a class with the name 'DependencyGraph'", () => {
    assert.ok(graph.DependencyGraph);
  });

  describe("DependencyGraph static methods", () => {
    /**
     * Tests for the static method "stringifyDependencyName".
     */
    describe("Method: 'stringifyDependencyName'", () => {
      it("should accept 1 parameter", () => {
        assert.strictEqual(graph.DependencyGraph.stringifyDependencyName.length, 1);
      });

      it("should convert the dependency metadata into a string", () => {
        assert.equal(graph.DependencyGraph.stringifyDependencyName({ name: "foo", version: "1.0.0" }), "foo@1.0.0");
      });
    });

    /**
     * Tests for the static method "parseDependencyName".
     */
    describe("Method: 'parseDependencyName'", () => {
      it("should accept 1 parameter", () => {
        assert.strictEqual(graph.DependencyGraph.parseDependencyName.length, 1);
      });

      it("should convert the dependency name into the original metadata", () => {
        assert.deepEqual(graph.DependencyGraph.parseDependencyName("foo@1.0.0"), { name: "foo", version: "1.0.0" });
      });
    });
  });

  describe("DependencyGraph instance methods", () => {
    let dependencyGraph: graph.DependencyGraph;

    beforeEach(() => {
      dependencyGraph = new graph.DependencyGraph();
    });

    /**
     * Tests for the instance method "addNode". This method should add a node with the dependency name provided and
     * store the data provided against that node.
     */
    describe("Method: 'addNode'", () => {
      it("should accept 2 parameters", () => {
        assert.strictEqual(dependencyGraph.addNode.length, 2);
      });

      it("should add a node with the supplied name", () => {
        dependencyGraph.addNode("foo", null);
        assert.ok(graph.__nodes.has(dependencyGraph));
      });

      it("should add a node with the supplied data", () => {
        dependencyGraph.addNode("foo", "bar");
        assert.equal(graph.__nodes.get(dependencyGraph).foo, "bar");
      });

      it("should fail to add a node with the same name twice", () => {
        assert.throws(() => {
          dependencyGraph.addNode("foo", null);
          dependencyGraph.addNode("foo", null);
        }, "A node with the name 'foo' already exists");
      });
    });

    /**
     * Tests for the instance method "getNode". This method should retrieve the node with the dependency name provided
     * and return the data stored against that node.
     */
    describe("Method: 'getNode'", () => {
      it("should accept 1 parameter", () => {
        assert.strictEqual(dependencyGraph.getNode.length, 1);
      });

      it("should return data stored against the node name supplied", () => {
        graph.__nodes.get(dependencyGraph).foo = "bar";
        assert.equal(dependencyGraph.getNode("foo"), "bar");
      });

      it("should fail when a node has not been added", () => {
        assert.throws(() => {
          dependencyGraph.getNode("foo");
        }, "No node with the name 'foo' has been added");
      });
    });

    /**
     * Tests for the instance method "hasNode".
     */
    describe("Method: 'hasNode'", () => {
      it("should accept 1 parameter", () => {
        assert.strictEqual(dependencyGraph.hasNode.length, 1);
      });

      it("should return 'true' when a node is found with the name supplied", () => {
        graph.__nodes.get(dependencyGraph).foo = "bar";
        assert.equal(dependencyGraph.hasNode("foo"), true);
      });

      it("should return 'false' when no node is found with the name supplied", () => {
        assert.equal(dependencyGraph.hasNode("foo"), false);
      });
    });

    /**
     * Tests for the instance method "listNodes".
     */
    describe("Method: 'listNodes'", () => {
      it("should accept 0 parameters", () => {
        assert.strictEqual(dependencyGraph.listNodes.length, 0);
      });

      it("should return a list of the previously added nodes", () => {
        graph.__nodes.get(dependencyGraph).foo = "bar";
        graph.__nodes.get(dependencyGraph).bar = "baz";
        assert.deepEqual(dependencyGraph.listNodes(), ["foo", "bar"]);
      });
    });

    /**
     * Tests for the instance method "markDependency".
     */
    describe("Method: 'markDependency'", () => {
      it("should accept 2 parameters", () => {
        assert.strictEqual(dependencyGraph.markDependency.length, 2);
      });

      it("should fail when the 'from' node has not been added", () => {
        assert.throws(() => {
          return dependencyGraph.markDependency("foo", "bar");
        }, "No node with the name 'foo' has been added");
      });

      it("should fail when the 'to' node has not been added", () => {
        assert.throws(() => {
          graph.__nodes.get(dependencyGraph).foo = "bar";
          dependencyGraph.markDependency("foo", "bar");
        }, "No node with the name 'bar' has been added");
      });

      it("should add 'to' to the relations array of 'from'", () => {
        graph.__nodes.get(dependencyGraph).foo = "bar";
        graph.__nodes.get(dependencyGraph).bar = "baz";
        graph.__relations.get(dependencyGraph).foo = [];
        dependencyGraph.markDependency("foo", "bar");
        assert.deepEqual(graph.__relations.get(dependencyGraph).foo, ["bar"]);
      });
    });

    /**
     * Tests for the instance method "hasDependency".
     */
    describe("Method: 'hasDependency'", () => {
      it("should accept 2 parameters", () => {
        assert.strictEqual(dependencyGraph.hasDependency.length, 2);
      });

      it("should return 'true' when a relationship between the 'from' and 'to' nodes is found", () => {
        graph.__relations.get(dependencyGraph).foo = ["bar"];
        assert.equal(dependencyGraph.hasDependency("foo", "bar"), true);
      });

      it("should return 'false' when no relationship between the 'from' and 'to' nodes is found", () => {
        assert.equal(dependencyGraph.hasDependency("foo", "bar"), false);
      });
    });

    /**
     * Tests for the instance method "listDependencies".
     */
    describe("Method: 'listDependencies'", () => {
      it("should accept 1 parameter", () => {
        assert.strictEqual(dependencyGraph.listDependencies.length, 1);
      });

      it("should return the dependencies of the 'of' node", () => {
        graph.__relations.get(dependencyGraph).foo = ["bar"];
        assert.deepEqual(dependencyGraph.listDependencies("foo"), ["bar"]);
      });
    });

    /**
     * Tests for the instance method "listDependants".
     */
    describe("Method: 'listDependants'", () => {
      it("should accept 1 parameter", () => {
        assert.strictEqual(dependencyGraph.listDependants.length, 1);
      });

      it("should return the dependants of the 'of' node", () => {
        graph.__relations.get(dependencyGraph).foo = ["bar"];
        assert.deepEqual(dependencyGraph.listDependants("bar"), ["foo"]);
      });
    });
  });
});

import * as assert from "assert";
import * as graph from "./graph";

describe("Graph", () => {
  it("should export a class with the name 'BaseGraph'", () => {
    assert.ok(graph.BaseGraph);
  });

  it("should export a class with the name 'InternalGraph'", () => {
    assert.ok(graph.InternalGraph);
  });

  it("should export a class with the name 'DependencyGraph'", () => {
    assert.ok(graph.DependencyGraph);
  });

  describe("BaseGraph static methods", () => {
    /**
     * Tests for the static method "stringifyDependencyMetadata".
     */
    describe("Method: 'stringifyDependencyMetadata'", () => {
      it("should accept 1 parameter", () => {
        assert.strictEqual(graph.BaseGraph.stringifyDependencyMetadata.length, 1);
      });

      it("should convert the dependency metadata into a string", () => {
        assert.equal(graph.BaseGraph.stringifyDependencyMetadata({ name: "foo", version: "1.0.0" }), "foo@1.0.0");
      });
    });

    /**
     * Tests for the static method "parseDependencyMetadata".
     */
    describe("Method: 'parseDependencyMetadata'", () => {
      it("should accept 1 parameter", () => {
        assert.strictEqual(graph.BaseGraph.parseDependencyMetadata.length, 1);
      });

      it("should convert the dependency name into the original metadata", () => {
        assert.deepEqual(graph.BaseGraph.parseDependencyMetadata("foo@1.0.0"), { name: "foo", version: "1.0.0" });
      });
    });
  });

  describe("InternalGraph instance methods", () => {
    let internalGraph: graph.InternalGraph;

    beforeEach(() => {
      internalGraph = new graph.InternalGraph();
    });

    /**
     * Tests for the instance method "addNode". This method should add a node with the dependency name provided and
     * store the data provided against that node.
     */
    describe("Method: '__addNode'", () => {
      it("should accept 2 parameters", () => {
        assert.strictEqual(internalGraph.__addNode.length, 2);
      });

      it("should add a node with the supplied name", () => {
        internalGraph.__addNode("foo", null);
        assert.ok(graph.__nodes.has(internalGraph));
      });

      it("should add a node with the supplied data", () => {
        internalGraph.__addNode("foo", "bar");
        assert.deepEqual(graph.__nodes.get(internalGraph).foo, "bar");
      });

      it("should fail to add a node with the same name twice", () => {
        assert.throws(() => {
          internalGraph.__addNode("foo", null);
          internalGraph.__addNode("foo", null);
        }, "A node with the name 'foo' already exists");
      });
    });

    /**
     * Tests for the instance method "getNode". This method should retrieve the node with the dependency name provided
     * and return the data stored against that node.
     */
    describe("Method: '__getNode'", () => {
      it("should accept 1 parameter", () => {
        assert.strictEqual(internalGraph.__getNode.length, 1);
      });

      it("should return data stored against the node name supplied", () => {
        graph.__nodes.get(internalGraph).foo = "bar";
        internalGraph.__getNode("foo");
        assert.equal(internalGraph.__getNode("foo"), "bar");
      });

      it("should fail when a node has not been added", () => {
        assert.throws(() => {
          internalGraph.__getNode("foo");
        }, "No node with the name 'foo' has been added");
      });
    });

    /**
     * Tests for the instance method "hasNode".
     */
    describe("Method: '__hasNode'", () => {
      it("should accept 1 parameter", () => {
        assert.strictEqual(internalGraph.__hasNode.length, 1);
      });

      it("should return 'true' when a node is found with the name supplied", () => {
        graph.__nodes.get(internalGraph).foo = "bar";
        assert.equal(internalGraph.__hasNode("foo"), true);
      });

      it("should return 'false' when no node is found with the name supplied", () => {
        assert.equal(internalGraph.__hasNode("foo"), false);
      });
    });

    /**
     * Tests for the instance method "listNodes".
     */
    describe("Method: '__listNodes'", () => {
      it("should accept 0 parameters", () => {
        assert.strictEqual(internalGraph.__listNodes.length, 0);
      });

      it("should return a list of the previously added nodes", () => {
        graph.__nodes.get(internalGraph).foo = "bar";
        graph.__nodes.get(internalGraph).bar = "baz";
        assert.deepEqual(internalGraph.__listNodes(), ["foo", "bar"]);
      });
    });

    /**
     * Tests for the instance method "markDependency".
     */
    describe("Method: '__markDependency'", () => {
      it("should accept 2 parameters", () => {
        assert.strictEqual(internalGraph.__markDependency.length, 2);
      });

      it("should fail when the 'from' node has not been added", () => {
        assert.throws(() => {
          return internalGraph.__markDependency("foo", "bar");
        }, "No node with the name 'foo' has been added");
      });

      it("should fail when the 'to' node has not been added", () => {
        assert.throws(() => {
          graph.__nodes.get(internalGraph).foo = "bar";
          internalGraph.__markDependency("foo", "bar");
        }, "No node with the name 'bar' has been added");
      });

      it("should add 'to' to the relations array of 'from'", () => {
        graph.__nodes.get(internalGraph).foo = "bar";
        graph.__nodes.get(internalGraph).bar = "baz";
        graph.__relations.get(internalGraph).foo = [];
        internalGraph.__markDependency("foo", "bar");
        assert.deepEqual(graph.__relations.get(internalGraph).foo, ["bar"]);
      });
    });

    /**
     * Tests for the instance method "hasDependency".
     */
    describe("Method: '__hasDependency'", () => {
      it("should accept 2 parameters", () => {
        assert.strictEqual(internalGraph.__hasDependency.length, 2);
      });

      it("should return 'true' when a relationship between the 'from' and 'to' nodes is found", () => {
        graph.__relations.get(internalGraph).foo = ["bar"];
        assert.equal(internalGraph.__hasDependency("foo", "bar"), true);
      });

      it("should return 'false' when no relationship between the 'from' and 'to' nodes is found", () => {
        assert.equal(internalGraph.__hasDependency("foo", "bar"), false);
      });
    });

    /**
     * Tests for the instance method "listDependencies".
     */
    describe("Method: '__listDependencies'", () => {
      it("should accept 1 parameter", () => {
        assert.strictEqual(internalGraph.__listDependencies.length, 1);
      });

      it("should return the dependencies of the 'of' node", () => {
        graph.__relations.get(internalGraph).foo = ["bar"];
        assert.deepEqual(internalGraph.__listDependencies("foo"), ["bar"]);
      });
    });

    /**
     * Tests for the instance method "listDependants".
     */
    describe("Method: '__listDependants'", () => {
      it("should accept 1 parameter", () => {
        assert.strictEqual(internalGraph.__listDependants.length, 1);
      });

      it("should return the dependants of the 'of' node", () => {
        graph.__relations.get(internalGraph).foo = ["bar"];
        assert.deepEqual(internalGraph.__listDependants("bar"), ["foo"]);
      });
    });
  });

  describe("DependencyGraph instance methods", () => {
    let dependencyGraph: graph.DependencyGraph;

    beforeEach(() => {
      dependencyGraph = new graph.DependencyGraph();
    });

    /**
     * Tests for the instance method "addRealDependency".
     */
    describe("Method: 'addRealDependency'", () => {
      it("should accept 2 parameters", () => {
        assert.strictEqual(dependencyGraph.addRealDependency.length, 2);
      });

      it("should add a node with the name provided", () => {
        dependencyGraph.addRealDependency({ name: "foo", version: "1" }, null);
        assert.ok(graph.__nodes.get(dependencyGraph).foo);
      });

      it("should add a node with the version provided", () => {
        dependencyGraph.addRealDependency({ name: "foo", version: "1" }, null);
        assert.equal(graph.__nodes.get(dependencyGraph).foo.version, "1");
      });

      it("should add a node with the data provided", () => {
        dependencyGraph.addRealDependency({ name: "foo", version: "1" }, "bar");
        assert.equal(graph.__nodes.get(dependencyGraph).foo.data, "bar");
      });

      it("should add a node and add the version to the aliases", () => {
        dependencyGraph.addRealDependency({ name: "foo", version: "1" }, null);
        assert.deepEqual(graph.__nodes.get(dependencyGraph).foo.aliases, ["1"]);
      });

      it("should fail to add a node with the same name twice", () => {
        assert.throws(() => {
          graph.__nodes.get(dependencyGraph).foo = {};
          dependencyGraph.addRealDependency({ name: "foo", version: "1" }, null);
        }, "A node with the name 'foo' already exists");
      });
    });

    /**
     * Tests for the instance method "addImpliedDependency".
     */
    describe("Method: 'addImpliedDependency'", () => {
      it("should accept 1 parameter", () => {
        assert.strictEqual(dependencyGraph.addImpliedDependency.length, 1);
      });

      it("should add an alias to the node with the name provided", () => {
        graph.__nodes.get(dependencyGraph).foo = { aliases: [] };
        dependencyGraph.addImpliedDependency({ name: "foo", version: "1" });
        assert.deepEqual(graph.__nodes.get(dependencyGraph).foo.aliases, ["1"]);
      });

      it("should fail to add a node with the same version twice", () => {
        assert.throws(() => {
          graph.__nodes.get(dependencyGraph).foo = { aliases: ["1"] };
          dependencyGraph.addImpliedDependency({ name: "foo", version: "1" });
        }, "Version '1' has already been registed on node 'foo'");
      });

      it("should fail when a node has not been added", () => {
        assert.throws(() => {
          dependencyGraph.addImpliedDependency({ name: "foo", version: "1" });
        }, "No node with the name 'foo' has been added");
      });
    });
  });
});

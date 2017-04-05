import { deepEqual, equal, ok, strictEqual, throws } from "assert";
import { getNodes, nodesMap } from "../../storage/nodes/nodes";
import { relationsMap } from "../../storage/relations/relations";
import { AbstractInternalGraph } from "./internal";

describe("AbstractInternalGraph", () => {
  describe("Instance methods", () => {
    let internalGraph: AbstractInternalGraph;

    beforeEach(() => {
      internalGraph = new AbstractInternalGraph();
    });

    /**
     * Tests for the instance method "addInternalNode". This method should add a node with the dependency name provided
     * and store the data provided against that node.
     */
    describe("Method: 'addInternalNode'", () => {
      it("should accept 2 parameters", () => {
        strictEqual(internalGraph.addInternalNode.length, 2);
      });

      it("should add a node with the supplied name", () => {
        internalGraph.addInternalNode("foo", null);
        ok(nodesMap.get(internalGraph).foo !== undefined);
      });

      it("should add a node with the supplied data", () => {
        internalGraph.addInternalNode("foo", "bar");
        deepEqual(getNodes(internalGraph).foo, "bar");
      });

      it("should fail to add a node with the same name twice", () => {
        throws(() => {
          internalGraph.addInternalNode("foo", null);
          internalGraph.addInternalNode("foo", null);
        }, "A node with the name 'foo' already exists");
      });
    });

    /**
     * Tests for the instance method "getInternalNode". This method should retrieve the node with the dependency name
     * provided and return the data stored against that node.
     */
    describe("Method: 'getInternalNode'", () => {
      it("should accept 1 parameter", () => {
        strictEqual(internalGraph.getInternalNode.length, 1);
      });

      it("should return data stored against the node name supplied", () => {
        nodesMap.get(internalGraph).foo = "bar";
        internalGraph.getInternalNode("foo");
        equal(internalGraph.getInternalNode("foo"), "bar");
      });

      it("should fail when a node has not been added", () => {
        throws(() => {
          internalGraph.getInternalNode("foo");
        }, "No node with the name 'foo' has been added");
      });
    });

    /**
     * Tests for the instance method "hasInternalNode".
     */
    describe("Method: 'hasInternalNode'", () => {
      it("should accept 1 parameter", () => {
        strictEqual(internalGraph.hasInternalNode.length, 1);
      });

      it("should return 'true' when a node is found with the name supplied", () => {
        nodesMap.get(internalGraph).foo = "bar";
        equal(internalGraph.hasInternalNode("foo"), true);
      });

      it("should return 'false' when no node is found with the name supplied", () => {
        equal(internalGraph.hasInternalNode("foo"), false);
      });
    });

    /**
     * Tests for the instance method "listInternalNodes".
     */
    describe("Method: 'listInternalNodes'", () => {
      it("should accept 0 parameters", () => {
        strictEqual(internalGraph.listInternalNodes.length, 0);
      });

      it("should return a list of the previously added nodes", () => {
        nodesMap.get(internalGraph).foo = "bar";
        nodesMap.get(internalGraph).bar = "baz";
        deepEqual(internalGraph.listInternalNodes(), ["foo", "bar"]);
      });
    });

    /**
     * Tests for the instance method "markInternalDependency".
     */
    describe("Method: 'markInternalDependency'", () => {
      it("should accept 3 parameters", () => {
        strictEqual(internalGraph.markInternalDependency.length, 3);
      });

      it("should fail when the 'from' node has not been added", () => {
        throws(() => {
          return internalGraph.markInternalDependency("foo", "bar", null);
        }, "No node with the name 'foo' has been added");
      });

      it("should fail when the 'to' node has not been added", () => {
        throws(() => {
          nodesMap.get(internalGraph).foo = "bar";
          internalGraph.markInternalDependency("foo", "bar", null);
        }, "No node with the name 'bar' has been added");
      });

      it("should add 'to' to the relations array of 'from'", () => {
        nodesMap.get(internalGraph).foo = "bar";
        nodesMap.get(internalGraph).bar = "baz";
        relationsMap.get(internalGraph).foo = {};
        internalGraph.markInternalDependency("foo", "bar", null);
        deepEqual(relationsMap.get(internalGraph).foo, { bar: null });
      });
    });

    /**
     * Tests for the instance method "hasInternalDependency".
     */
    describe("Method: 'hasInternalDependency'", () => {
      it("should accept 2 parameters", () => {
        strictEqual(internalGraph.hasInternalDependency.length, 2);
      });

      it("should return 'true' when a relationship between the 'from' and 'to' nodes is found", () => {
        relationsMap.get(internalGraph).foo = { bar: null };
        equal(internalGraph.hasInternalDependency("foo", "bar"), true);
      });

      it("should return 'false' when no relationship between the 'from' and 'to' nodes is found", () => {
        equal(internalGraph.hasInternalDependency("foo", "bar"), false);
      });
    });

    /**
     * Tests for the instance method "listInternalDependencies".
     */
    describe("Method: 'listInternalDependencies'", () => {
      it("should accept 1 parameter", () => {
        strictEqual(internalGraph.listInternalDependencies.length, 1);
      });

      it("should return the dependencies of the 'of' node", () => {
        relationsMap.get(internalGraph).foo = { bar: 1, baz: 2 };
        relationsMap.get(internalGraph).baz = { bar: 3, foo: 4 };
        deepEqual(internalGraph.listInternalDependencies("foo"), { bar: 1, baz: 2 });
      });
    });

    /**
     * Tests for the instance method "listInternalDependants".
     */
    describe("Method: 'listInternalDependants'", () => {
      it("should accept 1 parameter", () => {
        strictEqual(internalGraph.listInternalDependants.length, 1);
      });

      it("should return the dependants of the 'of' node", () => {
        relationsMap.get(internalGraph).foo = { bar: 1, baz: 2 };
        relationsMap.get(internalGraph).baz = { bar: 3, foo: 4 };
        deepEqual(internalGraph.listInternalDependants("bar"), { foo: 1, baz: 3 });
      });
    });
  });
});

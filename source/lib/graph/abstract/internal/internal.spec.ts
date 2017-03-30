import { deepEqual, equal, ok, strictEqual, throws } from "assert";
import { nodesMap, relationsMap } from "../../storage/storage";
import { AbstractInternalGraph } from "./internal";

describe("AbstractInternalGraph", () => {
  describe("Instance methods", () => {
    let internalGraph: AbstractInternalGraph;

    beforeEach(() => {
      internalGraph = new AbstractInternalGraph();
    });

    /**
     * Tests for the instance method "addNode". This method should add a node with the dependency name provided and
     * store the data provided against that node.
     */
    describe("Method: '__addNode'", () => {
      it("should accept 2 parameters", () => {
        strictEqual(internalGraph.__addNode.length, 2);
      });

      it("should add a node with the supplied name", () => {
        internalGraph.__addNode("foo", null);
        ok(nodesMap.get(internalGraph).foo !== undefined);
      });

      it("should add a node with the supplied data", () => {
        internalGraph.__addNode("foo", "bar");
        deepEqual(nodesMap.get(internalGraph).foo, "bar");
      });

      it("should fail to add a node with the same name twice", () => {
        throws(() => {
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
        strictEqual(internalGraph.__getNode.length, 1);
      });

      it("should return data stored against the node name supplied", () => {
        nodesMap.get(internalGraph).foo = "bar";
        internalGraph.__getNode("foo");
        equal(internalGraph.__getNode("foo"), "bar");
      });

      it("should fail when a node has not been added", () => {
        throws(() => {
          internalGraph.__getNode("foo");
        }, "No node with the name 'foo' has been added");
      });
    });

    /**
     * Tests for the instance method "hasNode".
     */
    describe("Method: '__hasNode'", () => {
      it("should accept 1 parameter", () => {
        strictEqual(internalGraph.__hasNode.length, 1);
      });

      it("should return 'true' when a node is found with the name supplied", () => {
        nodesMap.get(internalGraph).foo = "bar";
        equal(internalGraph.__hasNode("foo"), true);
      });

      it("should return 'false' when no node is found with the name supplied", () => {
        equal(internalGraph.__hasNode("foo"), false);
      });
    });

    /**
     * Tests for the instance method "listNodes".
     */
    describe("Method: '__listNodes'", () => {
      it("should accept 0 parameters", () => {
        strictEqual(internalGraph.__listNodes.length, 0);
      });

      it("should return a list of the previously added nodes", () => {
        nodesMap.get(internalGraph).foo = "bar";
        nodesMap.get(internalGraph).bar = "baz";
        deepEqual(internalGraph.__listNodes(), ["foo", "bar"]);
      });
    });

    /**
     * Tests for the instance method "markDependency".
     */
    describe("Method: '__markDependency'", () => {
      it("should accept 3 parameters", () => {
        strictEqual(internalGraph.__markDependency.length, 3);
      });

      it("should fail when the 'from' node has not been added", () => {
        throws(() => {
          return internalGraph.__markDependency("foo", "bar", null);
        }, "No node with the name 'foo' has been added");
      });

      it("should fail when the 'to' node has not been added", () => {
        throws(() => {
          nodesMap.get(internalGraph).foo = "bar";
          internalGraph.__markDependency("foo", "bar", null);
        }, "No node with the name 'bar' has been added");
      });

      it("should add 'to' to the relations array of 'from'", () => {
        nodesMap.get(internalGraph).foo = "bar";
        nodesMap.get(internalGraph).bar = "baz";
        relationsMap.get(internalGraph).foo = {};
        internalGraph.__markDependency("foo", "bar", null);
        deepEqual(relationsMap.get(internalGraph).foo, { bar: null });
      });
    });

    /**
     * Tests for the instance method "hasDependency".
     */
    describe("Method: '__hasDependency'", () => {
      it("should accept 2 parameters", () => {
        strictEqual(internalGraph.__hasDependency.length, 2);
      });

      it("should return 'true' when a relationship between the 'from' and 'to' nodes is found", () => {
        relationsMap.get(internalGraph).foo = { bar: null };
        equal(internalGraph.__hasDependency("foo", "bar"), true);
      });

      it("should return 'false' when no relationship between the 'from' and 'to' nodes is found", () => {
        equal(internalGraph.__hasDependency("foo", "bar"), false);
      });
    });

    /**
     * Tests for the instance method "listDependencies".
     */
    describe("Method: '__listDependencies'", () => {
      it("should accept 1 parameter", () => {
        strictEqual(internalGraph.__listDependencies.length, 1);
      });

      it("should return the dependencies of the 'of' node", () => {
        relationsMap.get(internalGraph).foo = { bar: 1, baz: 2 };
        relationsMap.get(internalGraph).baz = { bar: 3, foo: 4 };
        deepEqual(internalGraph.__listDependencies("foo"), { bar: 1, baz: 2 });
      });
    });

    /**
     * Tests for the instance method "listDependants".
     */
    describe("Method: '__listDependants'", () => {
      it("should accept 1 parameter", () => {
        strictEqual(internalGraph.__listDependants.length, 1);
      });

      it("should return the dependants of the 'of' node", () => {
        relationsMap.get(internalGraph).foo = { bar: 1, baz: 2 };
        relationsMap.get(internalGraph).baz = { bar: 3, foo: 4 };
        deepEqual(internalGraph.__listDependants("bar"), { foo: 1, baz: 3 });
      });
    });
  });
});

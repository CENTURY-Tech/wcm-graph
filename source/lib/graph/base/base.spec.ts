import { deepEqual, equal, ok, strictEqual, throws } from "assert";
import { BaseGraph } from "./base";

describe("BaseGraph", () => {
  describe("Static methods", () => {
    /**
     * Tests for the static method "stringifyDependencyMetadata".
     */
    describe("Method: 'stringifyDependencyMetadata'", () => {
      it("should accept 1 parameter", () => {
        strictEqual(BaseGraph.stringifyDependencyMetadata.length, 1);
      });

      it("should convert the dependency metadata into a string", () => {
        equal(BaseGraph.stringifyDependencyMetadata({ name: "foo", version: "1.0.0" }), "foo@1.0.0");
      });
    });

    /**
     * Tests for the static method "parseDependencyMetadata".
     */
    describe("Method: 'parseDependencyMetadata'", () => {
      it("should accept 1 parameter", () => {
        strictEqual(BaseGraph.parseDependencyMetadata.length, 1);
      });

      it("should convert the dependency name into the original metadata", () => {
        deepEqual(BaseGraph.parseDependencyMetadata("foo@1.0.0"), { name: "foo", version: "1.0.0" });
      });
    });
  });
});

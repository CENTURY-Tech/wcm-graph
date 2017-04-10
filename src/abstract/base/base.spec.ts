import { deepEqual, equal, strictEqual } from "assert";
import { AbstractBaseGraph } from "./base";

describe("AbstractBaseGraph", () => {
  describe("Static methods", () => {
    /**
     * Tests for the static method "stringifyDependencyMetadata".
     */
    describe("Method: 'stringifyDependencyMetadata'", () => {
      it("should accept 1 parameter", () => {
        strictEqual(AbstractBaseGraph.stringifyDependencyMetadata.length, 1);
      });

      it("should convert the dependency metadata into a string", () => {
        equal(AbstractBaseGraph.stringifyDependencyMetadata({ name: "foo", version: "1.0.0" }), "foo@1.0.0");
      });
    });

    /**
     * Tests for the static method "parseDependencyMetadata".
     */
    describe("Method: 'parseDependencyMetadata'", () => {
      it("should accept 1 parameter", () => {
        strictEqual(AbstractBaseGraph.parseDependencyMetadata.length, 1);
      });

      it("should convert the dependency name into the original metadata", () => {
        deepEqual(AbstractBaseGraph.parseDependencyMetadata("foo@1.0.0"), { name: "foo", version: "1.0.0" });
      });
    });
  });
});

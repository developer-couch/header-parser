import { suite, test } from "node:test";
import assert from "node:assert/strict";

import { parseContentType } from ".";

suite("Content-Type", function () {
  test("returns the passed content type as a javascript object", function () {
    const parsed = parseContentType("text/html; charset=ISO-8859-4; html-version=5");

    assert.deepEqual(parsed, {
      type: "text",
      subtype: "html",
      parameters: { charset: "ISO-8859-4", "html-version": "5" },
    });
  });

  test("accepts no parameters", function () {
    const parsed = parseContentType("application/json");

    assert.deepEqual(parsed, {
      type: "application",
      subtype: "json",
      parameters: null,
    });
  });

  test("accepts no parameters with trailing semicolons", function () {
    const parsed = parseContentType("application/json;;");

    assert.deepEqual(parsed, {
      type: "application",
      subtype: "json",
      parameters: null,
    });
  });

  test("returns null if value is invalid", function () {
    const parsed = parseContentType("invalid content type");

    assert.equal(parsed, null);
  });
});

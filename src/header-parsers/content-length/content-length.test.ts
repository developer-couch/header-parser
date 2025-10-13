import { suite, test } from "node:test";
import assert from "node:assert/strict";

import { parseContentLength } from ".";

suite("Content-Length", function () {
  test("returns the passed content length as a javascript number", function () {
    const parsed = parseContentLength("14234");

    assert.equal(parsed, 14234);
  });

  test("doesn't accept negative numbers", function () {
    const parsed = parseContentLength("-14234");

    assert.equal(parsed, null);
  });

  test("doesn't accept fractional numbers", function () {
    const parsed = parseContentLength("142.34");

    assert.equal(parsed, null);
  });

  test("returns null if syntax is invalid", function () {
    const parsed = parseContentLength("invalid number 123");

    assert.equal(parsed, null);
  });
});

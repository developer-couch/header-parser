import { suite, test } from "node:test";
import assert from "node:assert/strict";

import { parseContentEncoding } from ".";

suite("Content-Encoding", function () {
  test("returns the passed content encoding as a javascript object", function () {
    const parsed = parseContentEncoding("compress,deflate, gzip");

    assert.deepEqual(parsed, ["compress", "deflate", "gzip"]);
  });

  test("accepts no codings", function () {
    const parsed = parseContentEncoding("");

    assert.deepEqual(parsed, []);
  });

  test("returns null if value is invalid", function () {
    const parsed = parseContentEncoding("invalid content encoding");

    assert.equal(parsed, null);
  });
});

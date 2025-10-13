import { test, suite } from "node:test";
import assert from "node:assert/strict";

import { parseRange } from ".";

suite("Range", function () {
  test("returns all the passed ranges as a javascript object", () => {
    const range = parseRange(
      "bytes=20-100,40-50,30-,-80,-10,other-range?(123,another-range123df:[]"
    );

    assert.deepEqual(range, {
      unit: "bytes",
      set: [
        { type: "int", firstPos: 20, lastPos: 100 },
        { type: "int", firstPos: 40, lastPos: 50 },
        { type: "int", firstPos: 30, lastPos: null },
        { type: "suffix", length: 80 },
        { type: "suffix", length: 10 },
        { type: "other", spec: "other-range?(123" },
        { type: "other", spec: "another-range123df:[]" },
      ],
    });
  });

  test("returns null if value has no '=' character", () => {
    assert.equal(parseRange("invalid-syntax"), null);
  });

  test("returns null if unit is not specified", () => {
    assert.equal(parseRange("=0-100"), null);
  });

  test("returns null if no ranges are specified", () => {
    assert.equal(parseRange("bytes="), null);
  });

  test("ignores optional white spaces", () => {
    const range = parseRange("bytes=20-100 , 40-50, -80 ,\t30-50");
    assert.deepEqual(range, {
      unit: "bytes",
      set: [
        { type: "int", firstPos: 20, lastPos: 100 },
        { type: "int", firstPos: 40, lastPos: 50 },
        { type: "suffix", length: 80 },
        { type: "int", firstPos: 30, lastPos: 50 },
      ],
    });
  });

  test("returns null if range set starts with white spaces", () => {
    assert.equal(parseRange("bytes= 20-100"), null);
  });

  test("returns null if range set ends with white spaces", () => {
    assert.equal(parseRange("bytes=20-100 "), null);
  });

  test("returns null if an other range contains an invalid character", () => {
    assert.equal(parseRange("bytes=other range?(123"), null);
  });
});

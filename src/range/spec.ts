import assert from "node:assert/strict";
import { parseRange } from ".";
import test from "node:test";

test("returns all the passed ranges as a javascript object", () => {
  const range = parseRange("bytes=20-100,40-50,30-,-80,-10,other-range?(123,another-range123df:[]");

  assert.deepEqual(range, {
    unit: "bytes",
    rangeSet: [
      { type: "int", first: 20, last: 100 },
      { type: "int", first: 40, last: 50 },
      { type: "int", first: 30, last: null },
      { type: "suffix", length: 80 },
      { type: "suffix", length: 10 },
      { type: "other", spec: "other-range?(123" },
      { type: "other", spec: "another-range123df:[]" },
    ],
  });
});

test("returns null if value has no '=' character", () => {
  const range = parseRange("invalid-syntax");
  assert.equal(range, null);
});

test("returns null if unit is not specified", () => {
  const range = parseRange("=0-100");
  assert.equal(range, null);
});

test("returns null if no ranges are specified", () => {
  const range = parseRange("bytes=");
  assert.equal(range, null);
});

test("ignores empty ranges", () => {
  const range = parseRange("bytes=20-100,,40-50,-80,-10,other-range?(123,another-range123df:[]");
  assert.deepEqual(range, {
    unit: "bytes",
    rangeSet: [
      { type: "int", first: 20, last: 100 },
      { type: "int", first: 40, last: 50 },
      { type: "suffix", length: 80 },
      { type: "suffix", length: 10 },
      { type: "other", spec: "other-range?(123" },
      { type: "other", spec: "another-range123df:[]" },
    ],
  });
});

test("ignores optional white spaces", () => {
  const range = parseRange("bytes=,20-100 , 40-50, -80 ,, ,  ,\t30-50\t,\t");
  assert.deepEqual(range, {
    unit: "bytes",
    rangeSet: [
      { type: "int", first: 20, last: 100 },
      { type: "int", first: 40, last: 50 },
      { type: "suffix", length: 80 },
      { type: "int", first: 30, last: 50 },
    ],
  });
});

test("returns null if range set starts with white spaces", () => {
  const range = parseRange("bytes= 20-100");
  assert.equal(range, null);
});

test("returns null if range set ends with white spaces", () => {
  const range = parseRange("bytes=20-100 ");
  assert.equal(range, null);
});

test("returns null if an int range's last position is less than it's first position", () => {
  const range = parseRange("bytes=30-20");
  assert.equal(range, null);
});

test("returns null if an other range contains an invalid character", () => {
  const range = parseRange("bytes=other range?(123");
  assert.equal(range, null);
});

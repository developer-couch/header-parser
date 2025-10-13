import { test, suite } from "node:test";
import assert from "node:assert/strict";

import { parseDate } from ".";

suite("Date", function () {
  test("returns the passed date as a javascript Date object", () => {
    const date = parseDate("Sun, 06 Nov 1994 08:49:37 GMT");

    assert.deepEqual(date, new Date(Date.UTC(1994, 10, 6, 8, 49, 37, 0)));
  });

  test("accepts the obsolete RFC 850 format", () => {
    const date = parseDate("Sunday, 06-Nov-94 08:49:37 GMT");

    assert.deepEqual(date, new Date(Date.UTC(1994, 10, 6, 8, 49, 37, 0)));
  });

  test("accepts the obsolete ANSI C's asctime() format", () => {
    const date = parseDate("Sun Nov  6 08:49:37 1994");

    assert.deepEqual(date, new Date(Date.UTC(1994, 10, 6, 8, 49, 37, 0)));
  });

  test("returns null if format is invalid", () => {
    const date = parseDate("1994-11-06T08:49:37");

    assert.equal(date, null);
  });

  test("returns Invalid Date if format is valid but date is invalid", () => {
    const date = parseDate("Sun, 06 Nov 1994 08:72:37 GMT");

    assert.deepEqual(date?.valueOf(), NaN);
  });
});

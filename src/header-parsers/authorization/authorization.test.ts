import { suite, test } from "node:test";
import { deepEqual, equal } from "node:assert/strict";

import { parseAuthorization } from ".";

suite("Authorization", function () {
  test("returns the passed Authorization value as a javascript object", function () {
    const parsed = parseAuthorization(
      'scheme name1=value, name2 =  other-value, name3= "a quoted value", name4="an \\" \\ \\esca\\ped\\\\ value"'
    );

    deepEqual(parsed, {
      scheme: "scheme",
      params: {
        name1: "value",
        name2: "other-value",
        name3: "a quoted value",
        name4: 'an "  escaped\\ value',
      },
    });
  });

  test("accepts no params", function () {
    const parsed = parseAuthorization("scheme");

    deepEqual(parsed, {
      scheme: "scheme",
      params: null,
    });
  });

  test("accepts no params with space at the end", function () {
    const parsed = parseAuthorization("scheme  ");

    deepEqual(parsed, {
      scheme: "scheme",
      params: null,
    });
  });

  test("accepts token68 params", function () {
    const parsed = parseAuthorization("scheme a-token68-/====");

    deepEqual(parsed, {
      scheme: "scheme",
      params: "a-token68-/====",
    });
  });

  test("returns null if format is invalid", function () {
    const parsed = parseAuthorization("an invalid format");

    equal(parsed, null);
  });
});

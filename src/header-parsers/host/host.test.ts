import { suite, test } from "node:test";
import assert from "node:assert/strict";

import { parseHost } from ".";

suite("Host", function () {
  test("returns the passed host and port as a javascript object", function () {
    const host = parseHost("test:30");

    assert.deepEqual(host, { host: "test", port: 30 });
  });

  test("accepts domain names", function () {
    const host = parseHost("test.domain-name.test:30");

    assert.deepEqual(host, { host: "test.domain-name.test", port: 30 });
  });

  test("accepts ipv4", function () {
    const host = parseHost("192.168.0.0:30");

    assert.deepEqual(host, { host: "192.168.0.0", port: 30 });
  });

  test("accepts abbreviated ipv6", function () {
    const host = parseHost("[::1]:30");

    assert.deepEqual(host, { host: "[::1]", port: 30 });
  });

  test("accepts complete ipv6", function () {
    const host = parseHost("[2001:0db8:0000:0000:0000:ff00:0042:8329]:30");

    assert.deepEqual(host, { host: "[2001:0db8:0000:0000:0000:ff00:0042:8329]", port: 30 });
  });

  test("accepts no port", function () {
    const host = parseHost("example.com");

    assert.deepEqual(host, { host: "example.com", port: null });
  });

  test("returns null if the host has an invalid format", function () {
    const host = parseHost("http://192.168.0.0:30");

    assert.equal(host, null);
  });
});

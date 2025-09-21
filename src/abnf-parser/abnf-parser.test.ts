import { test } from "node:test";
import { deepEqual } from "node:assert/strict";

import { alternatives, concatenate, literal, repetition, terminal } from "./abnf-parser";

test("terminal", function () {
  const rule = terminal(0x61);

  deepEqual(rule.parse("a"), { result: "a", rest: "" });
  deepEqual(rule.parse("ab"), { result: "a", rest: "b" });
  deepEqual(rule.parse("aa"), { result: "a", rest: "a" });
  deepEqual(rule.parse(""), null);
  deepEqual(rule.parse("b"), null);
  deepEqual(rule.parse("ba"), null);
});

test("concatenate", function () {
  const rule = concatenate(terminal(0x61), terminal(0x62), terminal(0x63));

  deepEqual(rule.parse("abc"), { result: ["a", "b", "c"], rest: "" });
  deepEqual(rule.parse("abcd"), { result: ["a", "b", "c"], rest: "d" });
  deepEqual(rule.parse(""), null);
  deepEqual(rule.parse("ab"), null);
  deepEqual(rule.parse("bcd"), null);
});

test("deep concatenate", function () {
  const rule = concatenate(
    terminal(0x61),
    concatenate(),
    concatenate(terminal(0x62), terminal(0x63)),
    concatenate(terminal(0x64), terminal(0x65), concatenate(terminal(0x66), terminal(0x67)))
  );

  deepEqual(rule.parse("abcdefg"), {
    result: ["a", [], ["b", "c"], ["d", "e", ["f", "g"]]],
    rest: "",
  });
  deepEqual(rule.parse("abcdefgh"), {
    result: ["a", [], ["b", "c"], ["d", "e", ["f", "g"]]],
    rest: "h",
  });
  deepEqual(rule.parse(""), null);
  deepEqual(rule.parse("abc"), null);
  deepEqual(rule.parse("bcd"), null);
});

test("empty concatenate", function () {
  const rule = concatenate();

  deepEqual(rule.parse(""), { result: [], rest: "" });
  deepEqual(rule.parse("abc"), { result: [], rest: "abc" });
});

test("literal", function () {
  const rule = literal("abc");

  deepEqual(rule.parse("abc"), { result: ["a", "b", "c"], rest: "" });
  deepEqual(rule.parse("abcd"), { result: ["a", "b", "c"], rest: "d" });
  deepEqual(rule.parse(""), null);
  deepEqual(rule.parse("ab"), null);
  deepEqual(rule.parse("bcd"), null);
});

test("empty literal", function () {
  const rule = literal("");

  deepEqual(rule.parse(""), { result: [], rest: "" });
  deepEqual(rule.parse("abc"), { result: [], rest: "abc" });
});

test("mixed concatenate", function () {
  const rule = concatenate(literal("ab"), terminal(0x63));

  deepEqual(rule.parse("abc"), { result: [["a", "b"], "c"], rest: "" });
  deepEqual(rule.parse("abcd"), { result: [["a", "b"], "c"], rest: "d" });
  deepEqual(rule.parse(""), null);
  deepEqual(rule.parse("ab"), null);
  deepEqual(rule.parse("bcd"), null);
});

test("alternatives", function () {
  const rule = alternatives(terminal(0x61), terminal(0x62), terminal(0x63));

  deepEqual(rule.parse("a"), { result: "a", rest: "" });
  deepEqual(rule.parse("b"), { result: "b", rest: "" });
  deepEqual(rule.parse("c"), { result: "c", rest: "" });
  deepEqual(rule.parse("ab"), { result: "a", rest: "b" });
  deepEqual(rule.parse(""), null);
  deepEqual(rule.parse("d"), null);
});

test("deep alternatives", function () {
  const rule = alternatives(
    terminal(0x61),
    alternatives(),
    alternatives(terminal(0x62), terminal(0x63)),
    alternatives(terminal(0x64), terminal(0x65), alternatives(terminal(0x66), terminal(0x67)))
  );

  deepEqual(rule.parse("a"), { result: "a", rest: "" });
  deepEqual(rule.parse("b"), { result: "b", rest: "" });
  deepEqual(rule.parse("c"), { result: "c", rest: "" });
  deepEqual(rule.parse("d"), { result: "d", rest: "" });
  deepEqual(rule.parse("e"), { result: "e", rest: "" });
  deepEqual(rule.parse("f"), { result: "f", rest: "" });
  deepEqual(rule.parse("g"), { result: "g", rest: "" });
  deepEqual(rule.parse("ab"), { result: "a", rest: "b" });
  deepEqual(rule.parse(""), null);
  deepEqual(rule.parse("h"), null);
});

test("empty alternatives", function () {
  const rule = alternatives();

  deepEqual(rule.parse("a"), null);
  deepEqual(rule.parse(""), null);
});

test("concatenate alternatives", function () {
  const rule = concatenate(
    alternatives(terminal(0x61), terminal(0x62), terminal(0x63)),
    alternatives(terminal(0x64), terminal(0x65), terminal(0x66))
  );

  deepEqual(rule.parse("ad"), { result: ["a", "d"], rest: "" });
  deepEqual(rule.parse("ae"), { result: ["a", "e"], rest: "" });
  deepEqual(rule.parse("af"), { result: ["a", "f"], rest: "" });
  deepEqual(rule.parse("bd"), { result: ["b", "d"], rest: "" });
  deepEqual(rule.parse("be"), { result: ["b", "e"], rest: "" });
  deepEqual(rule.parse("bf"), { result: ["b", "f"], rest: "" });
  deepEqual(rule.parse("cd"), { result: ["c", "d"], rest: "" });
  deepEqual(rule.parse("ce"), { result: ["c", "e"], rest: "" });
  deepEqual(rule.parse("cf"), { result: ["c", "f"], rest: "" });
  deepEqual(rule.parse("ada"), { result: ["a", "d"], rest: "a" });
  deepEqual(rule.parse(""), null);
  deepEqual(rule.parse("da"), null);
  deepEqual(rule.parse("dd"), null);
  deepEqual(rule.parse("da"), null);
});

test("concatenate empty alternatives", function () {
  const rule = concatenate(alternatives(), alternatives());

  deepEqual(rule.parse(""), null);
  deepEqual(rule.parse("abc"), null);
});

test("alternative concatenates", function () {
  const rule = alternatives(
    concatenate(terminal(0x61), terminal(0x62), terminal(0x63)),
    concatenate(terminal(0x64), terminal(0x65), terminal(0x66))
  );

  deepEqual(rule.parse("abc"), { result: ["a", "b", "c"], rest: "" });
  deepEqual(rule.parse("def"), { result: ["d", "e", "f"], rest: "" });
  deepEqual(rule.parse("abcdef"), { result: ["a", "b", "c"], rest: "def" });
  deepEqual(rule.parse(""), null);
  deepEqual(rule.parse("bcd"), null);
});

test("alternative empty concatenates", function () {
  const rule = alternatives(concatenate(), concatenate());

  deepEqual(rule.parse(""), { result: [], rest: "" });
  deepEqual(rule.parse("abc"), { result: [], rest: "abc" });
});

test("repetition", function () {
  const rule = repetition(terminal(0x61));

  deepEqual(rule.parse("a"), { result: ["a"], rest: "" });
  deepEqual(rule.parse("aaaaaa"), { result: ["a", "a", "a", "a", "a", "a"], rest: "" });
  deepEqual(rule.parse("aaaaab"), { result: ["a", "a", "a", "a", "a"], rest: "b" });
  deepEqual(rule.parse(""), { result: [], rest: "" });
  deepEqual(rule.parse("b"), { result: [], rest: "b" });
});

test("repetition with min", function () {
  const rule = repetition(terminal(0x61), 3);

  deepEqual(rule.parse("aaa"), { result: ["a", "a", "a"], rest: "" });
  deepEqual(rule.parse("aaaaaa"), { result: ["a", "a", "a", "a", "a", "a"], rest: "" });
  deepEqual(rule.parse("aaaaab"), { result: ["a", "a", "a", "a", "a"], rest: "b" });
  deepEqual(rule.parse(""), null);
  deepEqual(rule.parse("aa"), null);
  deepEqual(rule.parse("baaa"), null);
});

test("repetition with max", function () {
  const rule = repetition(terminal(0x61), undefined, 3);

  deepEqual(rule.parse("aa"), { result: ["a", "a"], rest: "" });
  deepEqual(rule.parse("aaa"), { result: ["a", "a", "a"], rest: "" });
  deepEqual(rule.parse("aaaa"), { result: ["a", "a", "a"], rest: "a" });
  deepEqual(rule.parse("aaab"), { result: ["a", "a", "a"], rest: "b" });
  deepEqual(rule.parse("aab"), { result: ["a", "a"], rest: "b" });
  deepEqual(rule.parse(""), { result: [], rest: "" });
});

test("repetition with min and max", function () {
  const rule = repetition(terminal(0x61), 2, 4);

  deepEqual(rule.parse("aaa"), { result: ["a", "a", "a"], rest: "" });
  deepEqual(rule.parse("aa"), { result: ["a", "a"], rest: "" });
  deepEqual(rule.parse("aaaa"), { result: ["a", "a", "a", "a"], rest: "" });
  deepEqual(rule.parse("aaaaa"), { result: ["a", "a", "a", "a"], rest: "a" });
  deepEqual(rule.parse("aaab"), { result: ["a", "a", "a"], rest: "b" });
  deepEqual(rule.parse(""), null);
  deepEqual(rule.parse("a"), null);
  deepEqual(rule.parse("ab"), null);
});

test("exact repetition", function () {
  const rule = repetition(terminal(0x61), 3, 3);

  deepEqual(rule.parse("aaa"), { result: ["a", "a", "a"], rest: "" });
  deepEqual(rule.parse("aaaa"), { result: ["a", "a", "a"], rest: "a" });
  deepEqual(rule.parse("aa"), null);
});

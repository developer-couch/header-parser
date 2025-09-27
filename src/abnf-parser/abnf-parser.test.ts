import { suite, test } from "node:test";
import { deepEqual } from "node:assert/strict";

import {
  alternatives,
  concatenate,
  literal,
  optional,
  rangeAlternatives,
  repetition,
  terminal,
} from ".";

suite("ABNF Parser", function () {
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

    deepEqual(rule.parse("abc"), { result: "abc", rest: "" });
    deepEqual(rule.parse("abcd"), { result: "abc", rest: "d" });
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

    deepEqual(rule.parse("abcdefg"), { result: "abcdefg", rest: "" });
    deepEqual(rule.parse("abcdefgh"), { result: "abcdefg", rest: "h" });
    deepEqual(rule.parse(""), null);
    deepEqual(rule.parse("abc"), null);
    deepEqual(rule.parse("bcd"), null);
  });

  test("empty concatenate", function () {
    const rule = concatenate();

    deepEqual(rule.parse(""), { result: "", rest: "" });
    deepEqual(rule.parse("abc"), { result: "", rest: "abc" });
  });

  test("literal", function () {
    const rule = literal("abc");

    deepEqual(rule.parse("abc"), { result: "abc", rest: "" });
    deepEqual(rule.parse("abcd"), { result: "abc", rest: "d" });
    deepEqual(rule.parse(""), null);
    deepEqual(rule.parse("ab"), null);
    deepEqual(rule.parse("bcd"), null);
  });

  test("literal case insensitiveness", function () {
    const rule1 = literal("abc");

    deepEqual(rule1.parse("abc"), { result: "abc", rest: "" });
    deepEqual(rule1.parse("Abc"), { result: "Abc", rest: "" });
    deepEqual(rule1.parse("aBc"), { result: "aBc", rest: "" });
    deepEqual(rule1.parse("abC"), { result: "abC", rest: "" });
    deepEqual(rule1.parse("ABc"), { result: "ABc", rest: "" });
    deepEqual(rule1.parse("aBC"), { result: "aBC", rest: "" });
    deepEqual(rule1.parse("AbC"), { result: "AbC", rest: "" });
    deepEqual(rule1.parse("ABC"), { result: "ABC", rest: "" });

    const rule2 = literal("aBc");

    deepEqual(rule2.parse("abc"), { result: "abc", rest: "" });
    deepEqual(rule2.parse("Abc"), { result: "Abc", rest: "" });
    deepEqual(rule2.parse("aBc"), { result: "aBc", rest: "" });
    deepEqual(rule2.parse("abC"), { result: "abC", rest: "" });
    deepEqual(rule2.parse("ABc"), { result: "ABc", rest: "" });
    deepEqual(rule2.parse("aBC"), { result: "aBC", rest: "" });
    deepEqual(rule2.parse("AbC"), { result: "AbC", rest: "" });
    deepEqual(rule2.parse("ABC"), { result: "ABC", rest: "" });
  });

  test("empty literal", function () {
    const rule = literal("");

    deepEqual(rule.parse(""), { result: "", rest: "" });
    deepEqual(rule.parse("abc"), { result: "", rest: "abc" });
  });

  test("mixed concatenate", function () {
    const rule = concatenate(literal("ab"), terminal(0x63));

    deepEqual(rule.parse("abc"), { result: "abc", rest: "" });
    deepEqual(rule.parse("abcd"), { result: "abc", rest: "d" });
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

    deepEqual(rule.parse("ad"), { result: "ad", rest: "" });
    deepEqual(rule.parse("ae"), { result: "ae", rest: "" });
    deepEqual(rule.parse("af"), { result: "af", rest: "" });
    deepEqual(rule.parse("bd"), { result: "bd", rest: "" });
    deepEqual(rule.parse("be"), { result: "be", rest: "" });
    deepEqual(rule.parse("bf"), { result: "bf", rest: "" });
    deepEqual(rule.parse("cd"), { result: "cd", rest: "" });
    deepEqual(rule.parse("ce"), { result: "ce", rest: "" });
    deepEqual(rule.parse("cf"), { result: "cf", rest: "" });
    deepEqual(rule.parse("ada"), { result: "ad", rest: "a" });
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

    deepEqual(rule.parse("abc"), { result: "abc", rest: "" });
    deepEqual(rule.parse("def"), { result: "def", rest: "" });
    deepEqual(rule.parse("abcdef"), { result: "abc", rest: "def" });
    deepEqual(rule.parse(""), null);
    deepEqual(rule.parse("bcd"), null);
  });

  test("alternative empty concatenates", function () {
    const rule = alternatives(concatenate(), concatenate());

    deepEqual(rule.parse(""), { result: "", rest: "" });
    deepEqual(rule.parse("abc"), { result: "", rest: "abc" });
  });

  test("range alternatives", function () {
    const rule = rangeAlternatives(0x61, 0x63);

    deepEqual(rule.parse("a"), { result: "a", rest: "" });
    deepEqual(rule.parse("b"), { result: "b", rest: "" });
    deepEqual(rule.parse("c"), { result: "c", rest: "" });
    deepEqual(rule.parse("ab"), { result: "a", rest: "b" });
    deepEqual(rule.parse(""), null);
    deepEqual(rule.parse("d"), null);
  });

  test("repetition", function () {
    const rule = repetition(terminal(0x61));

    deepEqual(rule.parse("a"), { result: "a", rest: "" });
    deepEqual(rule.parse("aaaaaa"), { result: "aaaaaa", rest: "" });
    deepEqual(rule.parse("aaaaab"), { result: "aaaaa", rest: "b" });
    deepEqual(rule.parse(""), { result: "", rest: "" });
    deepEqual(rule.parse("b"), { result: "", rest: "b" });
  });

  test("repetition with min", function () {
    const rule = repetition(terminal(0x61), 3);

    deepEqual(rule.parse("aaa"), { result: "aaa", rest: "" });
    deepEqual(rule.parse("aaaaaa"), { result: "aaaaaa", rest: "" });
    deepEqual(rule.parse("aaaaab"), { result: "aaaaa", rest: "b" });
    deepEqual(rule.parse(""), null);
    deepEqual(rule.parse("aa"), null);
    deepEqual(rule.parse("baaa"), null);
  });

  test("repetition with max", function () {
    const rule = repetition(terminal(0x61), undefined, 3);

    deepEqual(rule.parse("aa"), { result: "aa", rest: "" });
    deepEqual(rule.parse("aaa"), { result: "aaa", rest: "" });
    deepEqual(rule.parse("aaaa"), { result: "aaa", rest: "a" });
    deepEqual(rule.parse("aaab"), { result: "aaa", rest: "b" });
    deepEqual(rule.parse("aab"), { result: "aa", rest: "b" });
    deepEqual(rule.parse(""), { result: "", rest: "" });
  });

  test("repetition with min and max", function () {
    const rule = repetition(terminal(0x61), 2, 4);

    deepEqual(rule.parse("aaa"), { result: "aaa", rest: "" });
    deepEqual(rule.parse("aa"), { result: "aa", rest: "" });
    deepEqual(rule.parse("aaaa"), { result: "aaaa", rest: "" });
    deepEqual(rule.parse("aaaaa"), { result: "aaaa", rest: "a" });
    deepEqual(rule.parse("aaab"), { result: "aaa", rest: "b" });
    deepEqual(rule.parse(""), null);
    deepEqual(rule.parse("a"), null);
    deepEqual(rule.parse("ab"), null);
  });

  test("exact repetition", function () {
    const rule = repetition(terminal(0x61), 3, 3);

    deepEqual(rule.parse("aaa"), { result: "aaa", rest: "" });
    deepEqual(rule.parse("aaaa"), { result: "aaa", rest: "a" });
    deepEqual(rule.parse("aa"), null);
  });

  test("optional", function () {
    const rule = optional(terminal(0x61));

    deepEqual(rule.parse("a"), { result: "a", rest: "" });
    deepEqual(rule.parse("aa"), { result: "a", rest: "a" });
    deepEqual(rule.parse("ab"), { result: "a", rest: "b" });
    deepEqual(rule.parse(""), { result: "", rest: "" });
    deepEqual(rule.parse("b"), { result: "", rest: "b" });
  });
});

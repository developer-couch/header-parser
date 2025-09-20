import { deepEqual } from "assert/strict";
import { DIGIT } from "../string-parsers";

type Result = (string | Result)[];

interface ABNFRule {
  literalText(text: string): ABNFRule;
  alternatives(...rules: ABNFRule[]): ABNFRule;
  repetition(rule: ABNFRule, min?: number, max?: number): ABNFRule;
  // capture(): ABNFRule;
  parse(input: string): { result: Result; rest: string } | null;
}

function ABNFRule(): ABNFRule {
  return {
    literalText(text) {
      const prev = this;

      return {
        ...prev,
        parse(input: string) {
          const result = prev.parse(input);
          if (result === null) {
            return null;
          }

          if (!result.rest.startsWith(text)) {
            return null;
          }

          return { result: [...result.result, text], rest: result.rest.slice(text.length) };
        },
      };
    },

    alternatives(...rules: ABNFRule[]) {
      const prev = this;
      return {
        ...prev,
        parse(input) {
          const prevResult = prev.parse(input);
          if (prevResult === null) {
            return null;
          }

          for (const alternative of rules) {
            const result = alternative.parse(prevResult.rest);
            if (result !== null) {
              return { result: [...prevResult.result, result.result], rest: result.rest };
            }
          }

          return null;
        },
      };
    },

    repetition(rule, min = 0, max = Infinity) {
      const prev = this;
      return {
        ...prev,
        parse(input) {
          const prevResult = prev.parse(input);
          if (prevResult === null) {
            return null;
          }

          const prevLength = prevResult.result.length;

          while (prevResult.rest.length > 0 && prevResult.result.length - prevLength < max) {
            const result = rule.parse(prevResult.rest);
            if (result === null) {
              break;
            }

            prevResult.result.push(result.result);
            prevResult.rest = result.rest;
          }

          if (prevResult.result.length - prevLength < min) {
            return null;
          }

          return prevResult;
        },
      };
    },

    // capture() {
    //   const prev = this;

    //   return {
    //     ...prev,
    //     parse(input) {
    //       const result = prev.parse(input);
    //       if (result === null) {
    //         return null;
    //       }

    //       return { result: [result.result.join("")], rest: result.rest };
    //     },
    //   };
    // },

    parse(input) {
      return { result: [], rest: input };
    },
  };
}

const a = ABNFRule().literalText("1");

deepEqual(a.parse("1"), { result: ["1"], rest: "" });
deepEqual(a.parse("12"), { result: ["1"], rest: "2" });
deepEqual(a.parse("2"), null);

const b = ABNFRule().literalText("123");

deepEqual(b.parse("123"), { result: ["123"], rest: "" });
deepEqual(b.parse("123456"), { result: ["123"], rest: "456" });
deepEqual(b.parse("222"), null);

const c = ABNFRule().literalText("1").literalText("2");

deepEqual(c.parse("12"), { result: ["1", "2"], rest: "" });
deepEqual(c.parse("1234"), { result: ["1", "2"], rest: "34" });
deepEqual(c.parse("22"), null);
deepEqual(c.parse("21"), null);
deepEqual(c.parse("13"), null);

const d = ABNFRule().literalText("123").literalText("456");

deepEqual(d.parse("123456"), { result: ["123", "456"], rest: "" });
deepEqual(d.parse("123456789"), { result: ["123", "456"], rest: "789" });
deepEqual(d.parse("2222222"), null);
deepEqual(d.parse("456123"), null);

// const e = c.capture();

// deepEqual(e.parse("12"), { result: ["12"], rest: "" });
// deepEqual(e.parse("1234"), { result: ["12"], rest: "34" });
// deepEqual(e.parse("34"), null);

const f = ABNFRule().alternatives(
  ABNFRule().literalText("123"),
  ABNFRule().literalText("456"),
  ABNFRule().literalText("789")
);

deepEqual(f.parse("123"), { result: [["123"]], rest: "" });
deepEqual(f.parse("456"), { result: [["456"]], rest: "" });
deepEqual(f.parse("789"), { result: [["789"]], rest: "" });
deepEqual(f.parse("123456"), { result: [["123"]], rest: "456" });
deepEqual(f.parse("012"), null);

const g = ABNFRule()
  .literalText("123")
  .alternatives(ABNFRule().literalText("123"), ABNFRule().literalText("456"));

deepEqual(g.parse("123123"), { result: ["123", ["123"]], rest: "" });
deepEqual(g.parse("123456"), { result: ["123", ["456"]], rest: "" });
deepEqual(g.parse("123456789"), { result: ["123", ["456"]], rest: "789" });
deepEqual(g.parse("123789"), null);
deepEqual(g.parse("456789"), null);

const h = ABNFRule()
  .literalText("123")
  .alternatives(ABNFRule().literalText("123").literalText("456"), ABNFRule().literalText("456"));

deepEqual(h.parse("123123456"), { result: ["123", ["123", "456"]], rest: "" });
deepEqual(h.parse("123456"), { result: ["123", ["456"]], rest: "" });
deepEqual(h.parse("123123456789"), { result: ["123", ["123", "456"]], rest: "789" });
deepEqual(h.parse("123456789"), { result: ["123", ["456"]], rest: "789" });
deepEqual(h.parse("123789"), null);

const i = ABNFRule()
  .literalText("123")
  .alternatives(ABNFRule().literalText("123").literalText("456"), ABNFRule().literalText("456"))
  .literalText("789");

deepEqual(i.parse("123123456789"), { result: ["123", ["123", "456"], "789"], rest: "" });
deepEqual(i.parse("123123456789012"), { result: ["123", ["123", "456"], "789"], rest: "012" });

// const j = ABNFRule()
//   .literalText("123")
//   .alternatives(
//     ABNFRule().literalText("123").literalText("456").capture(),
//     ABNFRule().literalText("456")
//   );

// deepEqual(j.parse("123123456"), { result: ["123", ["123456"]], rest: "" });

// const k = ABNFRule()
//   .literalText("123")
//   .alternatives(ABNFRule().literalText("123").literalText("456"), ABNFRule().literalText("456"))
//   .capture();

// deepEqual(k.parse("123123456"), { result: ["123", ["123", "456"]], rest: "" });

const k = ABNFRule().repetition(ABNFRule().literalText("1"));

deepEqual(k.parse("1"), { result: [["1"]], rest: "" });
deepEqual(k.parse("1111"), { result: [["1"], ["1"], ["1"], ["1"]], rest: "" });
deepEqual(k.parse("11112"), { result: [["1"], ["1"], ["1"], ["1"]], rest: "2" });

console.log("OK!");

// const result = "123";

// // @ts-ignore
// const intRange = ABNFRule().repetition(digits, 1).literalText("-").repetition(digits);

// // @ts-ignore
// const suffixRange = ABNFRule().literalText("-").repetition(digits, 1);

// // @ts-ignore
// const otherChars = ABNFRule().alternatives(
//   ...[...VCHAR.replace(",", "")].map(ABNFRule().literalText)
// );

// // @ts-ignore
// const otherRange = ABNFRule().repetition(otherChars, 1);

// // @ts-ignore
// const rangeSpec = ABNFRule().alternatives(intRange, suffixRange, otherRange);

// // @ts-ignore
// const ws = ABNFRule().alternatives(...[...WSP].map(ABNFRule().literalText));

// // @ts-ignore
// const ows = ABNFRule().repetition(ws);

// // @ts-ignore
// const listDelimiter = ABNFRule().rule(ows).literalText(",").rule(ows).ignore();

// // @ts-ignore
// const rangeSpecList = ABNFRule().rule(listDelimiter).rule(rangeSpec);

// // @ts-ignore
// const rangeSet = ABNFRule().rule(rangeSpec).repetition(rangeSpecList).grouped();

// // @ts-ignore
// const tchar = ABNFRule().alternatives([...TCHAR].map(ABNFRule().literalText));

// // @ts-ignore
// const token = ABNFRule().repetition(tchar, 1);

// // @ts-ignore
// const unit = ABNFRule().rule(token).grouped();

// // @ts-ignore
// const rangesSpecifier = ABNFRule().rule(unit).literalText("=").rule(rangeSet);

// const result = [unit, "=", [["1", "-", "5"], ["5", "-"], ["-", "5"], "other"]];

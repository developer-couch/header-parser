import { deepEqual } from "assert/strict";

type Result = string | { [K in string]: Result };

type ABNFRule = { parse(input: string): { result: Result; rest: string } | null };

export function terminal(value: number): ABNFRule {
  return {
    parse(input) {
      if (input.codePointAt(0) !== value) {
        return null;
      }

      return {
        result: String.fromCodePoint(value),
        rest: input.slice(1),
      };
    },
  };
}

export function concatenate(...rules: ABNFRule[]): ABNFRule {
  return {
    parse(input) {
      const firstRule = rules[0];
      if (firstRule === undefined) {
        return { result: "", rest: input };
      }

      const firstResult = firstRule.parse(input);
      if (firstResult === null) {
        return null;
      }

      const nextResult = concatenate(...rules.slice(1)).parse(firstResult.rest);
      if (nextResult === null) {
        return null;
      }

      const result =
        typeof firstResult.result === "object"
          ? typeof nextResult.result === "object"
            ? { ...firstResult.result, ...nextResult.result }
            : firstResult.result
          : typeof nextResult.result === "object"
            ? nextResult.result
            : firstResult.result + nextResult.result;

      return {
        result: result,
        rest: nextResult.rest,
      };
    },
  };
}

export function literal(text: string): ABNFRule {
  const rules = text.split("").map((char) => terminal(char.codePointAt(0)!));
  return concatenate(...rules);
}

export function alternatives(...rules: ABNFRule[]): ABNFRule {
  return {
    parse(input) {
      const firstRule = rules[0];
      if (firstRule === undefined) {
        return null;
      }

      const firstResult = firstRule.parse(input);
      if (firstResult === null) {
        return alternatives(...rules.slice(1)).parse(input);
      }

      return firstResult;
    },
  };
}

export function rangeAlternatives(from: number, to: number): ABNFRule {
  const rules = new Array(to - from + 1).fill(null).map((_, i) => terminal(from + i));
  return alternatives(...rules);
}

export function repetition(rule: ABNFRule, min = 0, max = Infinity): ABNFRule {
  return {
    parse(input) {
      if (max <= 0) {
        return { result: "", rest: input };
      }

      const firstResult = rule.parse(input);
      if (firstResult === null) {
        if (min > 0) {
          return null;
        }

        return { result: "", rest: input };
      }

      const nextResult = repetition(rule, min - 1, max - 1).parse(firstResult.rest);
      if (nextResult === null) {
        return null;
      }

      const result =
        typeof firstResult.result === "object"
          ? typeof nextResult.result === "object"
            ? { ...firstResult.result, ...nextResult.result }
            : firstResult.result
          : typeof nextResult.result === "object"
            ? nextResult.result
            : firstResult.result + nextResult.result;

      return { result: result, rest: nextResult.rest };
    },
  };
}

export function optional(rule: ABNFRule): ABNFRule {
  return repetition(rule, 0, 1);
}

export function named(name: string, rule: ABNFRule): ABNFRule {
  return {
    parse(input) {
      const result = rule.parse(input);
      if (result === null) {
        return null;
      }

      return { result: { [name]: result.result }, rest: result.rest };
    },
  };
}

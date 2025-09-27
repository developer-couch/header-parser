type Result = string;

type ABNFRule = { parse(input: string): { result: Result; rest: string } | null };

type ABNFRuleOrLiteral = string | number | readonly [number, number] | ABNFRule;

function literalToRule(rule: ABNFRuleOrLiteral): ABNFRule {
  if (typeof rule === "number") {
    return terminal(rule);
  }

  if (typeof rule === "string") {
    return literal(rule);
  }

  if (rule instanceof Array) {
    return rangeAlternatives(...rule);
  }

  return rule;
}

export function terminal(value: number): ABNFRule {
  return {
    parse(input) {
      if (input.length === 0) {
        return null;
      }

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

export function concatenate(...rules: ABNFRuleOrLiteral[]): ABNFRule {
  return {
    parse(input) {
      const firstRule = rules[0];
      if (firstRule === undefined) {
        return { result: "", rest: input };
      }

      const firstResult = literalToRule(firstRule).parse(input);
      if (firstResult === null) {
        return null;
      }

      const nextResult = concatenate(...rules.slice(1)).parse(firstResult.rest);
      if (nextResult === null) {
        return null;
      }

      return { result: firstResult.result + nextResult.result, rest: nextResult.rest };
    },
  };
}

export function literal(text: string): ABNFRule {
  const rules = text.split("").map((char) => terminal(char.codePointAt(0)!));
  return concatenate(...rules);
}

export function alternatives(...rules: ABNFRuleOrLiteral[]): ABNFRule {
  return {
    parse(input) {
      const firstRule = rules[0];
      if (firstRule === undefined) {
        return null;
      }

      const firstResult = literalToRule(firstRule).parse(input);
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

export function repetition(rule: ABNFRuleOrLiteral, min = 0, max = Infinity): ABNFRule {
  return {
    parse(input) {
      if (max <= 0) {
        return { result: "", rest: input };
      }

      const firstResult = literalToRule(rule).parse(input);
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

      return { result: firstResult.result + nextResult.result, rest: nextResult.rest };
    },
  };
}

export function optional(rule: ABNFRuleOrLiteral): ABNFRule {
  return repetition(rule, 0, 1);
}

export function end(rule: ABNFRuleOrLiteral) {
  return {
    parse(input: string) {
      const result = literalToRule(rule).parse(input);
      if (result === null) {
        return null;
      }

      if (result.rest.length > 0) {
        return null;
      }

      return result.result;
    },
  };
}

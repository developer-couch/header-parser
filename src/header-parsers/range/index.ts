import { alternatives, concatenate, end, repetition } from "../../abnf-parser";
import { DIGIT } from "../../abnf-parser/core-rules";

import { OWS, token } from "../core-rules";

interface IntRange {
  type: "int";
  firstPos: number;
  lastPos: number | null;
}

interface SuffixRange {
  type: "suffix";
  length: number;
}

interface OtherRange {
  type: "other";
  spec: string;
}

type RangeSpec = IntRange | SuffixRange | OtherRange;

interface RangesSpecifier {
  unit: string;
  set: RangeSpec[];
}

const rangeUnit = token;

const firstPos = repetition(DIGIT, 1);

const lastPos = repetition(DIGIT);

const intRange = concatenate(firstPos, "-", lastPos);

const suffixLength = repetition(DIGIT, 1);

const suffixRange = concatenate("-", suffixLength);

const otherRange = repetition(alternatives([0x21, 0x2b], [0x2d, 0x7e]), 1);

const rangeSpec = alternatives(intRange, suffixRange, otherRange);

const rangeSet = concatenate(rangeSpec, repetition(concatenate(OWS, ",", OWS, rangeSpec)));

const rangesSpecifier = concatenate(rangeUnit, "=", rangeSet);

const RangeParser = end(rangesSpecifier);

export function parseRange(input: string): RangesSpecifier | null {
  const parsed = RangeParser.parse(input);
  if (parsed === null) {
    return null;
  }

  const i = parsed.indexOf("=");

  return {
    unit: parsed.slice(0, i),
    set: parsed
      .slice(i + 1)
      .split(/\s*,\s*/)
      .map(function (spec) {
        if (end(intRange).parse(spec) !== null) {
          const [firstPos, lastPos] = spec.split("-") as [string, string];
          return {
            type: "int",
            firstPos: parseInt(firstPos),
            lastPos: lastPos !== "" ? parseInt(lastPos) : null,
          };
        }

        if (end(suffixRange).parse(spec) !== null) {
          const suffixLength = spec.slice(1);
          return { type: "suffix", length: parseInt(suffixLength) };
        }

        return { type: "other", spec };
      }),
  };
}

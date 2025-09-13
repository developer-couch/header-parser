import { getDigits, getToken, getVchar, getWsp, sliceWhile, VCHAR } from "../string-parsers";

interface IntRange {
  type: "int";
  first: number;
  last: number | null;
}

interface SuffixRange {
  type: "suffix";
  length: number;
}

interface OtherRange {
  type: "other";
  spec: string;
}

interface RangesSpecifier {
  unit: string;
  rangeSet: (IntRange | SuffixRange | OtherRange)[];
}

export function parseRange(value: string): RangesSpecifier | null {
  const unit = getToken(value);
  if (!unit) {
    return null;
  }

  value = value.slice(unit.length);

  if (value[0] !== "=") {
    return null;
  }

  value = value.slice(1);

  const rangeSet: RangesSpecifier["rangeSet"] = [];

  while (value) {
    const rangeSpec = sliceWhile(value, (c) => VCHAR.includes(c) && c !== ",");
    value = value.slice(rangeSpec.length);

    const trailingOws = getWsp(value);
    value = value.slice(trailingOws.length);

    if (value.length === 0 && trailingOws.length > 0) {
      return null;
    }

    if (value.length > 0 && value[0] !== ",") {
      return null;
    }

    value = value.slice(1);

    const leadingOws = getWsp(value);
    value = value.slice(leadingOws.length);

    if (rangeSpec.length === 0) {
      continue;
    }

    const firstPos = getDigits(rangeSpec);

    let rest = rangeSpec.slice(firstPos.length);

    if (rest[0] !== "-") {
      rangeSet.push({ type: "other", spec: rangeSpec });
      continue;
    }

    rest = rest.slice(1);

    const lastPosOrLength = getDigits(rest);

    rest = rest.slice(lastPosOrLength.length);

    if (rest) {
      rangeSet.push({ type: "other", spec: rangeSpec });
      continue;
    }

    if (!firstPos && !lastPosOrLength) {
      rangeSet.push({ type: "other", spec: rangeSpec });
      continue;
    }

    if (!firstPos) {
      rangeSet.push({ type: "suffix", length: parseInt(lastPosOrLength) });
      continue;
    }

    if (!lastPosOrLength) {
      rangeSet.push({ type: "int", first: parseInt(firstPos), last: null });
      continue;
    }

    const first = parseInt(firstPos);
    const last = parseInt(lastPosOrLength);

    if (last < first) {
      return null;
    }

    rangeSet.push({ type: "int", first, last });
  }

  if (rangeSet.length === 0) {
    return null;
  }

  return { unit, rangeSet };
}

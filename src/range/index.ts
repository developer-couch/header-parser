import { getDigit, getListItem, getToken, is, VCHAR } from "../string-parsers";

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

  if (!value) {
    return null;
  }

  const rangeSet: RangesSpecifier["rangeSet"] = [];

  while (value) {
    const rangeSpec = getListItem(value);
    if (!rangeSpec || !is(rangeSpec, VCHAR)) {
      return null;
    }

    value = value.slice(rangeSpec.length + 1);

    const firstPos = getDigit(rangeSpec);

    let rest = rangeSpec.slice(firstPos.length);

    if (rest[0] !== "-") {
      rangeSet.push({ type: "other", spec: rangeSpec });
      continue;
    }

    rest = rest.slice(1);

    const lastPosOrSuffix = getDigit(rest);

    rest = rest.slice(lastPosOrSuffix.length);

    if (rest) {
      rangeSet.push({ type: "other", spec: rangeSpec });
      continue;
    }

    if (!firstPos && !lastPosOrSuffix) {
      rangeSet.push({ type: "other", spec: rangeSpec });
      continue;
    }

    if (!firstPos) {
      rangeSet.push({ type: "suffix", length: parseInt(lastPosOrSuffix) });
      continue;
    }

    if (!lastPosOrSuffix) {
      rangeSet.push({ type: "int", first: parseInt(firstPos), last: null });
      continue;
    }

    const first = parseInt(firstPos);
    const last = parseInt(lastPosOrSuffix);

    if (last < first) {
      return null;
    }

    rangeSet.push({ type: "int", first, last });
  }

  return { unit, rangeSet };
}

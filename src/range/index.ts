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

type RangeSpec = IntRange | SuffixRange | OtherRange;

interface RangesSpecifier {
  unit: string;
  rangeSet: RangeSpec[];
}

function parseList<T>(input: string, parseItem: (item: string) => T): T[] | null {
  const parsedItems: T[] = [];

  while (input) {
    const item = sliceWhile(input, (c) => VCHAR.includes(c) && c !== ",");
    input = input.slice(item.length);

    if (item.length > 0) {
      parsedItems.push(parseItem(item));
    }

    const trailingOws = getWsp(input);
    input = input.slice(trailingOws.length);

    if (input.length === 0) {
      if (trailingOws.length > 0) {
        return null;
      }

      continue;
    }

    if (input[0] !== ",") {
      return null;
    }

    input = input.slice(1);

    const leadingOws = getWsp(input);
    input = input.slice(leadingOws.length);

    if (input.length == 0 && leadingOws.length > 0) {
      return null;
    }
  }

  return parsedItems;
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

  const rangeSet = parseList<RangeSpec | null>(value, function (item) {
    const firstPos = getDigits(item);
    item = item.slice(firstPos.length);

    if (item[0] !== "-") {
      return { type: "other", spec: item };
    }

    item = item.slice(1);

    const lastPosOrLength = getDigits(item);
    item = item.slice(lastPosOrLength.length);

    if (item.length > 0) {
      return { type: "other", spec: item };
    }

    if (!firstPos && !lastPosOrLength) {
      return { type: "other", spec: item };
    }

    if (!firstPos) {
      return { type: "suffix", length: parseInt(lastPosOrLength) };
    }

    if (!lastPosOrLength) {
      return { type: "int", first: parseInt(firstPos), last: null };
    }

    const first = parseInt(firstPos);
    const last = parseInt(lastPosOrLength);

    if (last < first) {
      return null;
    }

    return { type: "int", first, last };
  });

  if (
    rangeSet === null ||
    rangeSet.length === 0 ||
    !rangeSet.every((rangeSpec) => rangeSpec !== null)
  ) {
    return null;
  }

  return { unit, rangeSet };
}

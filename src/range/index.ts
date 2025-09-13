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

export class MalformedRange extends Error {
  constructor() {
    super("Range header value has invalid syntax");
  }
}

function parseList<T>(input: string, parseItem: (item: string) => T): T[] {
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
        throw new MalformedRange();
      }

      continue;
    }

    if (input[0] !== ",") {
      throw new MalformedRange();
    }

    input = input.slice(1);

    const leadingOws = getWsp(input);
    input = input.slice(leadingOws.length);

    if (input.length == 0 && leadingOws.length > 0) {
      throw new MalformedRange();
    }
  }

  return parsedItems;
}

export function parseRange(value: string): RangesSpecifier {
  const unit = getToken(value);
  if (!unit) {
    throw new MalformedRange();
  }

  value = value.slice(unit.length);

  if (value[0] !== "=") {
    throw new MalformedRange();
  }

  value = value.slice(1);

  const rangeSet = parseList<RangeSpec>(value, function (item) {
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
      throw new MalformedRange();
    }

    return { type: "int", first, last };
  });

  if (rangeSet.length === 0) {
    throw new MalformedRange();
  }

  return { unit, rangeSet };
}

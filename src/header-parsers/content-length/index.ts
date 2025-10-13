import { end, repetition } from "../../abnf-parser";
import { DIGIT } from "../../abnf-parser/core-rules";

const ContentLengthParser = end(repetition(DIGIT, 1));

export function parseContentLength(input: string): number | null {
  const parsed = ContentLengthParser.parse(input);
  if (parsed === null) {
    return null;
  }

  return parseInt(parsed);
}

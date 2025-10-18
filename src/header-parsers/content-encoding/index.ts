import { concatenate, end, optional, repetition } from "../../abnf-parser";
import { OWS, token } from "../core-rules";

const contentCoding = token;

const ContentEncodingParser = end(
  optional(concatenate(contentCoding, repetition(concatenate(OWS, ",", OWS, contentCoding))))
);

export function parseContentEncoding(input: string): string[] | null {
  const parsed = ContentEncodingParser.parse(input);
  if (parsed === null) {
    return null;
  }

  if (parsed.length === 0) {
    return [];
  }

  return parsed.split(/\s*,\s*/);
}

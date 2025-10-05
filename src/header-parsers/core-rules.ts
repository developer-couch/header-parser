import { alternatives, repetition } from "../abnf-parser";
import { ALPHA, DIGIT, HTAB, SP } from "../abnf-parser/core-rules";

export const OWS = repetition(alternatives(SP, HTAB));

export const tchar = alternatives(
  "!",
  "#",
  "$",
  "%",
  "&",
  "'",
  "*",
  "+",
  "-",
  ".",
  "^",
  "_",
  "`",
  "|",
  "~",
  DIGIT,
  ALPHA
);

export const token = repetition(tchar, 1);

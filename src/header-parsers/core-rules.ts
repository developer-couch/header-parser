import { alternatives, concatenate, repetition } from "../abnf-parser";
import { ALPHA, DIGIT, DQUOTE, HTAB, SP, VCHAR } from "../abnf-parser/core-rules";

export const OWS = repetition(alternatives(SP, HTAB));

export const BWS = OWS;

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

export const token68 = concatenate(
  repetition(alternatives(ALPHA, DIGIT, "-", ".", "_", "~", "+", "/")),
  repetition("=")
);

const obsText = [0x80, 0xff] as const;

const qdtext = alternatives(HTAB, SP, "!", [0x23, 0x5b], [0x5d, 0x7e], obsText);

export const quotedPair = concatenate("\\", alternatives(HTAB, SP, VCHAR, obsText));

export const quotedString = concatenate(
  DQUOTE,
  repetition(alternatives(qdtext, quotedPair)),
  DQUOTE
);

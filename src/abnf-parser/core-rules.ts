import { alternatives } from ".";

export const ALPHA = alternatives([0x41, 0x5a], [0x61, 0x7a]);

export const DIGIT = [0x30, 0x39] as const;

export const SP = 0x20;

export const HTAB = 0x09;

export const DQUOTE = 0x22;

export const VCHAR = [0x21, 0x7e] as const;

export const HEXDIG = alternatives(DIGIT, "A", "B", "C", "D", "E", "F");

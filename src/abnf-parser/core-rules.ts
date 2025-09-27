import { alternatives } from "./abnf-parser";

export const ALPHA = alternatives([0x41, 0x5a], [0x61, 0x7a]);

export const DIGIT = [0x30, 0x39] as const;

export const SP = 0x20;

export const HTAB = 0x09;

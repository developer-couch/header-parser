export const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
export const DIGIT = "0123456789";
export const TCHAR = ALPHA + DIGIT + "!#$%&'*+-.^_`|~";
export const VCHAR = TCHAR + '"(),/:;<=>?@[\\]{}';
export const WSP = " \t";

export function sliceWhile(input: string, match: (c: string) => boolean) {
  let r = "",
    i = 0;
  while (i < input.length && match(input[i]!)) r += input[i++];
  return r;
}

export function getDigits(input: string): string {
  return sliceWhile(input, (c) => DIGIT.includes(c));
}

export function getToken(input: string): string {
  return sliceWhile(input, (c) => TCHAR.includes(c));
}

export function getWsp(input: string): string {
  return sliceWhile(input, (c) => WSP.includes(c));
}

export function getVchar(input: string): string {
  return sliceWhile(input, (c) => VCHAR.includes(c));
}

export const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
export const DIGIT = "0123456789";
export const TCHAR = ALPHA + DIGIT + "!#$%&'*+-.^_`|~";
export const VCHAR = TCHAR + '"(),/:;<=>?@[\\]{}';

export function is(input: string, valid: string) {
  return [...input].every((c) => valid.includes(c));
}

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

export function getListItem(input: string): string {
  return sliceWhile(input, (c) => c !== ",");
}

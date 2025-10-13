import { alternatives, concatenate, end, optional, repetition } from "../../abnf-parser";
import { SP } from "../../abnf-parser/core-rules";
import { BWS, OWS, quotedPair, quotedString, token, token68 } from "../core-rules";
import { parseNameValuePairs } from "../utils";

export interface Credentials {
  scheme: string;
  params: Record<string, string> | string | null;
}

export const authScheme = token;

export const authParam = concatenate(token, BWS, "=", BWS, alternatives(token, quotedString));

export const authParams = concatenate(authParam, repetition(concatenate(OWS, ",", OWS, authParam)));

export const credentials = concatenate(
  authScheme,
  optional(concatenate(repetition(SP, 1), alternatives(token68, optional(authParams))))
);

const AuthorizationParser = end(credentials);

export function parseAuthorization(input: string): Credentials | null {
  const parsed = AuthorizationParser.parse(input);
  if (parsed === null) {
    return null;
  }

  const i = parsed.indexOf(" ");
  if (i === -1) {
    return { scheme: parsed, params: null };
  }

  const scheme = parsed.slice(0, i);
  const params = parsed.slice(i + 1).trimStart();

  if (params.length === 0) {
    return { scheme, params: null };
  }

  const nameValuePairs = end(authParams).parse(params);
  if (nameValuePairs === null) {
    return { scheme, params: params };
  }

  console.log(scheme, nameValuePairs);

  return {
    scheme,
    params: parseNameValuePairs(nameValuePairs.split(/\s*,\s*/)),
  };
}

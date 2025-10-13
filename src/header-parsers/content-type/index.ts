import { alternatives, concatenate, end, optional, repetition } from "../../abnf-parser";
import { OWS, quotedString, token } from "../core-rules";
import { parseNameValuePairs } from "../utils";

export interface MediaType {
  type: string;
  subtype: string;
  parameters: Record<string, string> | null;
}

const type = token;

const subtype = token;

const parameterName = token;

const parameterValue = alternatives(token, quotedString);

const parameter = concatenate(parameterName, "=", parameterValue);

const parameters = repetition(concatenate(OWS, ";", OWS, optional(parameter)));

const mediaType = concatenate(type, "/", subtype, parameters);

const ContentTypeParser = end(mediaType);

export function parseContentType(input: string): MediaType | null {
  const parsed = ContentTypeParser.parse(input);
  if (parsed === null) {
    return null;
  }

  const i = parsed.indexOf("/");
  const type = parsed.slice(0, i);

  const j = parsed.indexOf(";");
  if (j === -1) {
    return { type, subtype: parsed.slice(i + 1), parameters: null };
  }

  const subtype = parsed.slice(i + 1, j).trimEnd();

  const parameters = parsed
    .slice(j + 1)
    .trimStart()
    .split(/\s*;\s*/)
    .filter(function (parameter) {
      return parameter.length > 0;
    });

  if (parameters.length === 0) {
    return { type, subtype, parameters: null };
  }

  return {
    type,
    subtype,
    parameters: parseNameValuePairs(parameters),
  };
}

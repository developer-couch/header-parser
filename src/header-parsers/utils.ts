import { end } from "../abnf-parser";
import { quotedPair, token } from "./core-rules";

export function parseNameValuePairs(encodedPairs: string[]) {
  return Object.fromEntries(
    encodedPairs.map(function (pair) {
      const i = pair.indexOf("=");
      const name = pair.slice(0, i).trimEnd();
      const value = pair.slice(i + 1).trimStart();

      const parsedToken = end(token).parse(value);
      if (parsedToken !== null) {
        return [name, parsedToken];
      }

      return [
        name,
        value
          .slice(1, value.length - 1)
          .split("")
          .map(function (char, i, value) {
            const parsedQuotedPair = end(quotedPair).parse(value.slice(i, i + 2).join(""));
            if (parsedQuotedPair === null) {
              return char;
            }

            value.splice(i + 1, 1);
            return parsedQuotedPair[1];
          })
          .join(""),
      ];
    })
  );
}

import { parse } from "url";
import { alternatives, concatenate, end, optional, repetition } from "../../abnf-parser";
import { ALPHA, DIGIT, HEXDIG } from "../../abnf-parser/core-rules";

export interface Host {
  host: string;
  port: number | null;
}

const h16 = repetition(HEXDIG, 1, 4);

const decOctet = alternatives(
  DIGIT,
  concatenate([0x31, 0x39], DIGIT),
  concatenate("1", repetition(DIGIT, 2, 2)),
  concatenate("2", [0x30, 0x34], DIGIT),
  concatenate("25", [0x30, 0x35])
);

const IPv4address = concatenate(decOctet, ".", decOctet, ".", decOctet, ".", decOctet);

const ls32 = alternatives(concatenate(h16, ":", h16), IPv4address);

const IPv6address = alternatives(
  concatenate(repetition(concatenate(h16, ":"), 6, 6), ls32),
  concatenate("::", repetition(concatenate(h16, ":"), 5, 5), ls32),
  concatenate(optional(h16), "::", repetition(concatenate(h16, ":"), 4, 4), ls32),
  concatenate(
    optional(concatenate(repetition(concatenate(h16, ":"), undefined, 1), h16)),
    "::",
    repetition(concatenate(h16, ":"), 3, 3),
    ls32
  ),
  concatenate(
    optional(concatenate(repetition(concatenate(h16, ":"), undefined, 2), h16)),
    "::",
    repetition(concatenate(h16, ":"), 2, 2),
    ls32
  ),
  concatenate(
    optional(concatenate(repetition(concatenate(h16, ":"), undefined, 3), h16)),
    "::",
    h16,
    ":",
    ls32
  ),
  concatenate(
    optional(concatenate(repetition(concatenate(h16, ":"), undefined, 4), h16)),
    "::",
    ls32
  ),
  concatenate(
    optional(concatenate(repetition(concatenate(h16, ":"), undefined, 5), h16)),
    "::",
    h16
  ),
  concatenate(optional(concatenate(repetition(concatenate(h16, ":"), undefined, 6), h16)), "::")
);

const subDelims = alternatives("!", "$", "&", "'", "(", ")", "*", "+", ",", ";", "=");

const unreserved = alternatives(ALPHA, DIGIT, "-", ".", "_", "~");

const IPvFuture = concatenate(
  "v",
  repetition(HEXDIG, 1),
  ".",
  repetition(alternatives(unreserved, subDelims, ":"), 1)
);

const IPLiteral = concatenate("[", alternatives(IPv6address, IPvFuture), "]");

const pctEncoded = concatenate("%", HEXDIG, HEXDIG);

const regName = repetition(alternatives(unreserved, pctEncoded, subDelims));

const host = alternatives(IPLiteral, IPv4address, regName);

const port = repetition(DIGIT);

const HostParser = end(concatenate(host, optional(concatenate(":", port))));

export function parseHost(input: string): Host | null {
  const parsed = HostParser.parse(input);
  if (parsed === null) {
    return null;
  }

  const { result: parsedHost, rest } = host.parse(parsed)!;
  if (rest.length === 0) {
    return { host: parsedHost, port: null };
  }

  const port = parseInt(rest.slice(1));

  return {
    host: parsedHost,
    port: port,
  };
}

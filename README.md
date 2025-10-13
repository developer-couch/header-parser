# HTTP Header Parsers Collection

A collection of TypeScript header parsers, compliant with [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110).

## Supported Header Parsers

All parsers receive a string (the header value) and output either an object representing the header value, or null if the syntax is invalid.

### Date

```ts
function parseDate(input: string): Date | null;
```

#### Example

```ts
parseDate("Sun, 06 Nov 1994 08:49:37 GMT");
// [Out]: Date(1994-11-06T08:49:37.000Z)
```

### Host

```ts
interface Host {
  host: string;
  port: number | null;
}

function parseHost(input: string): Host | null;
```

#### Example

```ts
parseHost("example.com:8080");
// [Out]: { host: "example.com", port: 8080 }
```

### Content-Type

```ts
interface MediaType {
  type: string;
  subtype: string;
  parameters: Record<string, string> | null;
}

function parseContentType(input: string): MediaType | null;
```

#### Example

```ts
parseContentType("application/json; charset=utf-8");
// [Out]: { type: "application", subtype: "json", parameters: { charset: "utf-8" } }
```

### Content-Length

```ts
function parseContentLength(input: string): number | null;
```

#### Example

```ts
parseContentLength("28374");
// [Out]: 28374
```

### Authorization

```ts
interface Credentials {
  scheme: string;
  params: Record<string, string> | string | null;
}

function parseAuthorization(input: string): Credentials | null;
```

#### Example

```ts
parseAuthorization('AuthScheme param1=value, param2="quoted \\\"value\\\"\"');
// [Out]: { scheme: "AuthScheme", params: { param1: "value", param2: "quoted \"value\"" } }
```

### Range

```ts
interface IntRange {
  type: "int";
  firstPos: number;
  lastPos: number | null;
}

interface SuffixRange {
  type: "suffix";
  length: number;
}

interface OtherRange {
  type: "other";
  spec: string;
}

type RangeSpec = IntRange | SuffixRange | OtherRange;

interface RangesSpecifier {
  unit: string;
  set: RangeSpec[];
}

function parseRange(input: string): null;
```

#### Example

```ts
parseRange("bytes=0-100, -100");
// [Out]: {
//   unit: "bytes",
//   set: [
//     { type: "int", startPos: 0, endPos: 100 },
//     { type: "suffix", length: 100 }
//   ]
// }
```

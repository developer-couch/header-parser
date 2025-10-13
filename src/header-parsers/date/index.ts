import { alternatives, concatenate, end, repetition } from "../../abnf-parser";
import { DIGIT, SP } from "../../abnf-parser/core-rules";

const dayName = alternatives(
  concatenate(0x4d, 0x6f, 0x6e), // Mon
  concatenate(0x54, 0x75, 0x65), // Tue
  concatenate(0x57, 0x65, 0x64), // Wed
  concatenate(0x54, 0x68, 0x75), // Thu
  concatenate(0x46, 0x72, 0x69), // Fri
  concatenate(0x53, 0x61, 0x74), // Sat
  concatenate(0x53, 0x75, 0x6e) // Sun
);

const day = repetition(DIGIT, 2, 2);

const month = alternatives(
  concatenate(0x4a, 0x61, 0x6e), // Jan
  concatenate(0x46, 0x65, 0x62), // Feb
  concatenate(0x4d, 0x61, 0x72), // Mar
  concatenate(0x41, 0x70, 0x72), // Apr
  concatenate(0x4d, 0x61, 0x79), // May
  concatenate(0x4a, 0x75, 0x6e), // Jun
  concatenate(0x4a, 0x75, 0x6c), // Jul
  concatenate(0x41, 0x75, 0x67), // Aug
  concatenate(0x53, 0x65, 0x70), // Sep
  concatenate(0x4f, 0x63, 0x74), // Oct
  concatenate(0x4e, 0x6f, 0x76), // Nov
  concatenate(0x44, 0x65, 0x63) // Dec
);

const year = repetition(DIGIT, 4, 4);

const date1 = concatenate(day, SP, month, SP, year);

const hour = repetition(DIGIT, 2, 2);

const minute = repetition(DIGIT, 2, 2);

const second = repetition(DIGIT, 2, 2);

const timeOfDay = concatenate(hour, ":", minute, ":", second);

const GMT = concatenate(0x47, 0x4d, 0x54); // GMT

const IMFFixdate = concatenate(dayName, ",", SP, date1, SP, timeOfDay, SP, GMT);

const dayNameL = alternatives(
  concatenate(0x4d, 0x6f, 0x6e, 0x64, 0x61, 0x79), // Monday
  concatenate(0x54, 0x75, 0x65, 0x73, 0x64, 0x61, 0x79), // Tuesday
  concatenate(0x57, 0x65, 0x64, 0x6e, 0x65, 0x73, 0x64, 0x61, 0x79), // Wednesday
  concatenate(0x54, 0x68, 0x75, 0x72, 0x73, 0x64, 0x61, 0x79), // Thursday
  concatenate(0x46, 0x72, 0x69, 0x64, 0x61, 0x79), // Friday
  concatenate(0x53, 0x61, 0x74, 0x75, 0x72, 0x64, 0x61, 0x79), // Saturday
  concatenate(0x53, 0x75, 0x6e, 0x64, 0x61, 0x79) // Sunday
);

const date2 = concatenate(day, "-", month, "-", repetition(DIGIT, 2, 2));

const rfc850Date = concatenate(dayNameL, ",", SP, date2, SP, timeOfDay, SP, GMT);

const date3 = concatenate(month, SP, alternatives(repetition(DIGIT, 2, 2), concatenate(SP, DIGIT)));

const asctimeDate = concatenate(dayName, SP, date3, SP, timeOfDay, SP, year);

const obsDate = alternatives(rfc850Date, asctimeDate);

const HTTPDate = alternatives(IMFFixdate, obsDate);

const DateParser = end(HTTPDate);

export function parseDate(input: string): Date | null {
  const parsed = DateParser.parse(input);
  if (parsed === null) {
    return null;
  }

  const parsedAsctime = end(asctimeDate).parse(parsed);
  const date = parsedAsctime != null ? new Date(`${parsedAsctime} GMT`) : new Date(parsed);

  return date;
}

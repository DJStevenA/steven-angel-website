/**
 * Phone country prefixes for the RSVP form. US (+1) is the default.
 * The closed select shows "US +1"; the value is the ISO code.
 */
export const COUNTRIES = [
  { iso: "US", dial: "+1" },
  { iso: "CA", dial: "+1" },
  { iso: "PR", dial: "+1" },
  { iso: "MX", dial: "+52" },
  { iso: "BR", dial: "+55" },
  { iso: "AR", dial: "+54" },
  { iso: "CO", dial: "+57" },
  { iso: "CL", dial: "+56" },
  { iso: "PE", dial: "+51" },
  { iso: "DO", dial: "+1" },
  { iso: "GB", dial: "+44" },
  { iso: "IE", dial: "+353" },
  { iso: "ES", dial: "+34" },
  { iso: "FR", dial: "+33" },
  { iso: "DE", dial: "+49" },
  { iso: "IT", dial: "+39" },
  { iso: "PT", dial: "+351" },
  { iso: "NL", dial: "+31" },
  { iso: "BE", dial: "+32" },
  { iso: "CH", dial: "+41" },
  { iso: "AT", dial: "+43" },
  { iso: "SE", dial: "+46" },
  { iso: "NO", dial: "+47" },
  { iso: "DK", dial: "+45" },
  { iso: "FI", dial: "+358" },
  { iso: "PL", dial: "+48" },
  { iso: "GR", dial: "+30" },
  { iso: "TR", dial: "+90" },
  { iso: "IL", dial: "+972" },
  { iso: "AE", dial: "+971" },
  { iso: "AU", dial: "+61" },
  { iso: "NZ", dial: "+64" },
  { iso: "ZA", dial: "+27" },
  { iso: "IN", dial: "+91" },
  { iso: "JP", dial: "+81" },
  { iso: "KR", dial: "+82" },
  { iso: "CN", dial: "+86" },
  { iso: "RU", dial: "+7" },
  { iso: "UA", dial: "+380" },
  { iso: "RO", dial: "+40" },
];

export const DEFAULT_COUNTRY = "US";
export const dialFor = (iso) => (COUNTRIES.find((c) => c.iso === iso) || COUNTRIES[0]).dial;

// Characters people type between digits. Kept to a safe set so the same string
// works as an HTML `pattern` (u and v flags).
const SEP = "[\\s\\(\\)+.\\-]";

/**
 * HTML `pattern` for the phone input. +1: 10 digits (an optional leading 1 is
 * allowed). Everywhere else: 6 to 14 digits. Browser-native validation, so the
 * messages are the visitor's own browser's, not new copy.
 */
export function phonePattern(dial) {
  return dial === "+1"
    ? `${SEP}*(1${SEP}*)?(\\d${SEP}*){10}`
    : `${SEP}*(\\d${SEP}*){6,14}`;
}

/** "(305) 555-1234" + "+1" -> "+13055551234" */
export function toE164(dial, raw) {
  let digits = String(raw).replace(/\D/g, "");
  if (dial === "+1" && digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  digits = digits.replace(/^0+/, "");
  return `${dial}${digits}`;
}

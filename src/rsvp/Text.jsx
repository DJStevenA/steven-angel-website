/**
 * Line-break helpers. They only add <span>s around existing characters: the
 * text itself (textContent) is exactly what copy.js says, so the approved copy
 * is never altered.
 */
import React from "react";

// "9PM–4AM" must not break after the en dash.
const TIME_RANGE = /(\d{1,2}(?:AM|PM)–\d{1,2}(?:AM|PM))/;

/** Text with time ranges kept on one line. */
export function Copy({ text }) {
  return text.split(TIME_RANGE).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="rsvp-nowrap">{part}</span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );
}

/** "A B C | D E" -> the pipe stays on the end of the line with the word before
    it, so a wrapped title never starts a line with "|". */
export function Title({ text }) {
  const i = text.indexOf(" | ");
  if (i < 0) return text;
  const head = text.slice(0, i);
  const tail = text.slice(i + 3);
  const sp = head.lastIndexOf(" ");
  return (
    <>
      {head.slice(0, sp + 1)}
      <span className="rsvp-nowrap">{head.slice(sp + 1)} |</span>
      {" "}
      {tail}
    </>
  );
}

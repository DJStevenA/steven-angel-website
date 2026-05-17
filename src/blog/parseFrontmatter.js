/**
 * Tiny YAML frontmatter parser — handles the subset used by blog posts:
 *   ---
 *   key: value           (string, number, date)
 *   key: "quoted string"
 *   key:                 (followed by indented list / nested object)
 *     - item
 *     - item
 *     - key: value       (list of {q,a}-style objects)
 *       key: value
 *     key: value         (nested object)
 *   ---
 *   <body>
 *
 * Works in-browser; no Buffer / fs dependency. We use gray-matter only at
 * build time (Node side, in vite.config.js) so the browser bundle stays
 * lean and the ?raw imports here never hit Node-only code.
 *
 * Not a general YAML parser. Refuses anything fancier than what's actually
 * in src/blog/posts/*.md. If you add complex YAML, extend this here.
 */

function stripQuotes(s) {
  if (s.length >= 2 && (s[0] === '"' || s[0] === "'") && s[s.length - 1] === s[0]) {
    return s.slice(1, -1);
  }
  return s;
}

function coerceScalar(v) {
  const t = v.trim();
  if (t === '') return '';
  if (t === 'true') return true;
  if (t === 'false') return false;
  if (t === 'null' || t === '~') return null;
  // Numbers (but not version-y "1.2.3")
  if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
  return stripQuotes(t);
}

function indentOf(line) {
  let i = 0;
  while (i < line.length && line[i] === ' ') i++;
  return i;
}

/**
 * Parses YAML lines into a JS object. Recursive: when we hit a key with no
 * value on its own line, we look ahead at indent-greater children and
 * parse them as either an array or a nested object.
 *
 * Returns { obj, consumed } — consumed = how many lines were eaten.
 */
function parseBlock(lines, start, baseIndent) {
  const obj = {};
  let i = start;
  while (i < lines.length) {
    const rawLine = lines[i];
    // Skip blank lines inside a block (rare in our files, but harmless)
    if (rawLine.trim() === '') { i++; continue; }
    const ind = indentOf(rawLine);
    if (ind < baseIndent) break;
    if (ind > baseIndent) { i++; continue; } // shouldn't happen at top of block

    const line = rawLine.slice(baseIndent);
    // List item at this level => parent should have been array; handled in parseList
    if (line.startsWith('- ') || line === '-') break;

    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) { i++; continue; }
    const key = line.slice(0, colonIdx).trim();
    const rest = line.slice(colonIdx + 1).trim();

    if (rest === '') {
      // Look ahead: next non-blank line tells us if it's a list or nested object
      let j = i + 1;
      while (j < lines.length && lines[j].trim() === '') j++;
      if (j >= lines.length) { obj[key] = null; i = j; continue; }
      const nextInd = indentOf(lines[j]);
      if (nextInd <= baseIndent) {
        // No children — empty value
        obj[key] = null;
        i++;
        continue;
      }
      const nextLine = lines[j].slice(nextInd);
      if (nextLine.startsWith('- ')) {
        const { arr, consumed } = parseList(lines, j, nextInd);
        obj[key] = arr;
        i = consumed;
      } else {
        const { obj: child, consumed } = parseBlock(lines, j, nextInd);
        obj[key] = child;
        i = consumed;
      }
    } else {
      obj[key] = coerceScalar(rest);
      i++;
    }
  }
  return { obj, consumed: i };
}

function parseList(lines, start, listIndent) {
  const arr = [];
  let i = start;
  while (i < lines.length) {
    const rawLine = lines[i];
    if (rawLine.trim() === '') { i++; continue; }
    const ind = indentOf(rawLine);
    if (ind < listIndent) break;
    if (ind > listIndent) { i++; continue; }
    const line = rawLine.slice(listIndent);
    if (!line.startsWith('- ') && line !== '-') break;
    const after = line.slice(2); // strip "- "

    // Case A: "- key: value" => start of an object item
    const colonInAfter = after.indexOf(':');
    if (colonInAfter !== -1 && !after.startsWith('"') && !after.startsWith("'")) {
      const key = after.slice(0, colonInAfter).trim();
      const rest = after.slice(colonInAfter + 1).trim();
      const item = {};
      if (rest === '') {
        // Nested block follows — uncommon for us but handle gracefully
        let j = i + 1;
        while (j < lines.length && lines[j].trim() === '') j++;
        const nextInd = indentOf(lines[j] || '');
        if (nextInd > listIndent + 2) {
          const { obj: child, consumed } = parseBlock(lines, j, nextInd);
          item[key] = child;
          i = consumed;
        } else {
          item[key] = null;
          i++;
        }
      } else {
        item[key] = coerceScalar(rest);
        i++;
      }
      // Continuation lines at indent listIndent + 2, also "key: value" but no "- "
      const contIndent = listIndent + 2;
      while (i < lines.length) {
        const cont = lines[i];
        if (cont.trim() === '') { i++; continue; }
        const contInd = indentOf(cont);
        if (contInd !== contIndent) break;
        const contLine = cont.slice(contIndent);
        if (contLine.startsWith('- ')) break; // new list item
        const contColon = contLine.indexOf(':');
        if (contColon === -1) break;
        const k2 = contLine.slice(0, contColon).trim();
        const v2 = contLine.slice(contColon + 1).trim();
        item[k2] = coerceScalar(v2);
        i++;
      }
      arr.push(item);
    } else {
      // Case B: "- scalar"
      arr.push(coerceScalar(after));
      i++;
    }
  }
  return { arr, consumed: i };
}

/**
 * Parse a full markdown file with --- frontmatter --- body.
 * Returns { data: {}, content: "..." }.
 */
export function parseFrontmatter(raw) {
  if (!raw.startsWith('---')) {
    return { data: {}, content: raw };
  }
  // Find closing ---
  const lines = raw.split(/\r?\n/);
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') { end = i; break; }
  }
  if (end === -1) return { data: {}, content: raw };

  const fmLines = lines.slice(1, end);
  const { obj } = parseBlock(fmLines, 0, 0);
  const content = lines.slice(end + 1).join('\n').replace(/^\n+/, '');
  return { data: obj, content };
}

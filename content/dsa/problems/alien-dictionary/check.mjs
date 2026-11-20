// Many letter orders can be valid, so we check the answer's properties instead of one string.
//   - expected "" (no valid order): the answer must be "" too.
//   - otherwise: every letter that appears in the words exactly once, nothing else,
//     and every rule from adjacent words (first differing letter) respected.
export default function check(input, actual, expected) {
  if (typeof actual !== "string") return false;
  if (expected === "") return actual === "";

  const [words] = input;
  const letters = new Set(words.join(""));
  if (actual.length !== letters.size) return false;
  const rank = new Map();
  for (let i = 0; i < actual.length; i++) {
    const ch = actual[i];
    if (!letters.has(ch) || rank.has(ch)) return false; // unknown or repeated letter
    rank.set(ch, i);
  }

  for (let k = 0; k + 1 < words.length; k++) {
    const a = words[k], b = words[k + 1];
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    if (i === a.length || i === b.length) {
      if (a.length > b.length) return false; // can't be sorted, yet expected says it can
      continue;
    }
    if (rank.get(a[i]) >= rank.get(b[i])) return false;
  }
  return true;
}

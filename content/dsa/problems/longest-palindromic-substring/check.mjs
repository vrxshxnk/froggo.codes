// Several palindromes can share the maximum length ("babad" -> "bab" or "aba").
// Accept any answer that has the right length, really is a palindrome, and really occurs in s.
export default function check(input, actual, expected) {
  const s = input[0];
  if (typeof actual !== "string" || actual.length !== expected.length) return false;
  if (!s.includes(actual)) return false;
  return actual === [...actual].reverse().join("");
}

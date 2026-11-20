/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function (s) {
  const match = { ")": "(", "]": "[", "}": "{" }; // closer -> the opener it needs
  const stack = []; // openers still waiting for their closer

  for (const c of s) {
    if (c in match) {
      // a closer must match the most recent unmatched opener
      if (stack.length === 0 || stack[stack.length - 1] !== match[c]) return false;
      stack.pop();
    } else {
      stack.push(c);
    }
  }

  return stack.length === 0; // leftover openers were never closed
};

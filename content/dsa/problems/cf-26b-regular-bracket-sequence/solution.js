// Codeforces: choose "Node.js" as the language
const s = require("fs").readFileSync(0, "utf8").trim();
let openCount = 0; // '(' kept so far that are still waiting for a ')'
let matched = 0;   // length of the regular sequence we keep

for (let i = 0; i < s.length; i++) {
  if (s[i] === "(") {
    openCount++;
  } else if (openCount > 0) {
    // pair this ')' with any waiting '(' and keep both
    openCount--;
    matched += 2;
  }
  // else: a ')' with nothing to close can never be part of the answer, drop it
}

// the leftover openCount brackets are never closed, so they are dropped too
console.log(matched);

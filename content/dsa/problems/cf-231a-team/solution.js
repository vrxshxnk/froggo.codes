// Codeforces: choose "Node.js" as the language
const data = require("fs").readFileSync(0, "utf8").split(/\s+/).filter(Boolean).map(Number);
const n = data[0];
let solved = 0;

for (let i = 0; i < n; i++) {
  const a = data[1 + 3 * i], b = data[2 + 3 * i], c = data[3 + 3 * i];
  if (a + b + c >= 2) { // values are 0/1, so the sum counts who is sure
    solved++;
  }
}

console.log(solved);

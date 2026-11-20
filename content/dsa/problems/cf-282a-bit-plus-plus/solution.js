// Codeforces: choose "Node.js" as the language
const data = require("fs").readFileSync(0, "utf8").split(/\s+/).filter(Boolean);
const n = Number(data[0]);
let x = 0;

for (let i = 1; i <= n; i++) {
  const s = data[i];
  // In ++X, X++, --X and X-- the middle character is always the operator's
  if (s[1] === "+") {
    x++;
  } else {
    x--;
  }
}

console.log(x);

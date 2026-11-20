// Codeforces: choose "Node.js" as the language
const data = require("fs").readFileSync(0, "utf8").split(/\s+/).filter(Boolean).map(Number);
let pos = 0;
const t = data[pos++];
const out = [];

for (let test = 0; test < t; test++) {
  const n = data[pos++];
  const count = new Map(); // key -> how many earlier positions had it
  let answer = 0;          // max ~2e10 is still exact in a JS number (< 2^53)

  for (let k = 0; k < n; k++) {
    const key = data[pos + k] - k; // a[j] - j == a[i] - i
    const seen = count.get(key) || 0;
    answer += seen;                // pair with every earlier equal key
    count.set(key, seen + 1);
  }

  pos += n;
  out.push(answer);
}

console.log(out.join("\n"));

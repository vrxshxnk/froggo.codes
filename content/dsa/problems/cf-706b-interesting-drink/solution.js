// Codeforces: choose "Node.js" as the language
const data = require("fs").readFileSync(0, "utf8").split(/\s+/).filter(Boolean).map(Number);
let pos = 0;
const n = data[pos++];
// A typed array sorts numerically (a plain array's default sort compares strings)
const price = Int32Array.from(data.slice(pos, pos + n)).sort();
pos += n;
const q = data[pos++];
const out = [];

for (let j = 0; j < q; j++) {
  const m = data[pos++];
  // First index with price > m (the upper bound). Every shop before it is
  // affordable, so that index IS the count. It always stays in [lo, hi].
  let lo = 0, hi = n;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (price[mid] > m) {  // ">" not ">=": a price equal to m is affordable
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }
  out.push(lo);
}

console.log(out.join("\n"));

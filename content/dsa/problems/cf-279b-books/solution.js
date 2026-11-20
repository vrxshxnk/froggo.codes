// Codeforces: choose "Node.js" as the language
const data = require("fs").readFileSync(0, "utf8").split(/\s+/).filter(Boolean).map(Number);
const n = data[0], t = data[1];
const a = data.slice(2, 2 + n);

let left = 0;
let windowSum = 0; // minutes needed for books left..right
let best = 0;

for (let right = 0; right < n; right++) {
  windowSum += a[right];

  // Too long to read in t minutes: give up the earliest book until it fits.
  // Every a[i] is positive, so dropping one always shortens the reading time.
  while (windowSum > t) {
    windowSum -= a[left];
    left++;
  }

  best = Math.max(best, right - left + 1); // can be 0 when one book alone is too long
}

console.log(best);

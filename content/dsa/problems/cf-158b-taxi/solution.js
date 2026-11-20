// Codeforces: choose "Node.js" as the language
const data = require("fs").readFileSync(0, "utf8").split(/\s+/).filter(Boolean).map(Number);
const n = data[0];
const c = [0, 0, 0, 0, 0]; // c[s] = number of groups of size s
for (let i = 1; i <= n; i++) c[data[i]]++;

let taxis = c[4];                  // a group of 4 fills a taxi alone

taxis += c[3];                     // each 3 needs its own taxi...
let ones = Math.max(0, c[1] - c[3]); // ...and the one free seat is best given to a 1

taxis += Math.floor(c[2] / 2);     // two 2s fill a taxi exactly
if (c[2] % 2 === 1) {
  taxis += 1;                      // a leftover 2 rides with up to two 1s
  ones = Math.max(0, ones - 2);
}

taxis += Math.ceil(ones / 4);      // remaining 1s, four per taxi
console.log(taxis);

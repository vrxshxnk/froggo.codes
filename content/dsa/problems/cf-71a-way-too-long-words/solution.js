// Codeforces: choose "Node.js" as the language
const data = require("fs").readFileSync(0, "utf8").split(/\s+/).filter(Boolean);
const n = Number(data[0]);
const out = [];

for (let i = 1; i <= n; i++) {
  const word = data[i];
  if (word.length > 10) { // "too long" means 11 letters or more
    // first letter + how many letters sit between the ends + last letter
    out.push(word[0] + (word.length - 2) + word[word.length - 1]);
  } else {
    out.push(word);
  }
}

console.log(out.join("\n")); // one print at the end is faster than n small prints

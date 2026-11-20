// Codeforces: choose "Node.js" as the language
const w = Number(require("fs").readFileSync(0, "utf8").trim()); // text -> number

// Even + even is always even, and the smallest split is 2 + 2,
// so w must be even AND bigger than 2
if (w % 2 === 0 && w > 2) {
  console.log("YES");
} else {
  console.log("NO");
}

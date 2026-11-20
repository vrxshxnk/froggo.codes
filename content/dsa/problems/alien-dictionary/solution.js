/**
 * @param {string[]} words
 * @return {string}
 */
var alienOrder = function (words) {
  const A = "a".charCodeAt(0);
  // letters are nodes 0..25; edge[x][y] means "x comes before y"
  const present = new Array(26).fill(false);
  for (const w of words) for (const ch of w) present[ch.charCodeAt(0) - A] = true;
  const edge = Array.from({ length: 26 }, () => new Array(26).fill(false));
  const indegree = new Array(26).fill(0);

  // only ADJACENT words give rules, and only at their first differing letter
  for (let k = 0; k + 1 < words.length; k++) {
    const a = words[k], b = words[k + 1];
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    if (i === a.length || i === b.length) { // one is a prefix of the other
      if (a.length > b.length) return "";   // "abc" before "ab" is impossible
      continue;                             // "ab" before "abc" says nothing
    }
    const x = a.charCodeAt(i) - A, y = b.charCodeAt(i) - A;
    if (!edge[x][y]) { // skip duplicate rules so indegrees stay right
      edge[x][y] = true;
      indegree[y]++;
    }
  }

  // Kahn's algorithm: repeatedly output a letter nothing else must precede
  const queue = [];
  let letters = 0;
  for (let c = 0; c < 26; c++) {
    if (present[c]) letters++;
    if (present[c] && indegree[c] === 0) queue.push(c);
  }
  let order = "";
  for (let head = 0; head < queue.length; head++) { // head pointer = O(1) dequeue
    const x = queue[head];
    order += String.fromCharCode(A + x);
    for (let y = 0; y < 26; y++) {
      if (edge[x][y] && --indegree[y] === 0) queue.push(y);
    }
  }

  // letters left over are stuck in a cycle: no valid order exists
  return order.length === letters ? order : "";
};

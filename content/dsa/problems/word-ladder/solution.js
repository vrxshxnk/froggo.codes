/**
 * @param {string} beginWord
 * @param {string} endWord
 * @param {string[]} wordList
 * @return {number}
 */
var ladderLength = function (beginWord, endWord, wordList) {
  const unvisited = new Set(wordList);
  if (!unvisited.has(endWord)) return 0;
  unvisited.delete(beginWord);

  let queue = [beginWord];
  let steps = 1; // number of words in the sequence, counting beginWord

  while (queue.length) {
    const nextLevel = []; // one BFS level = one more word
    for (const word of queue) {
      if (word === endWord) return steps;

      const chars = word.split("");
      for (let i = 0; i < chars.length; i++) {
        const original = chars[i];
        for (let code = 97; code <= 122; code++) { // 'a'..'z'
          const c = String.fromCharCode(code);
          if (c === original) continue;
          chars[i] = c;
          const next = chars.join("");
          if (unvisited.has(next)) {
            unvisited.delete(next); // mark visited when we enqueue
            nextLevel.push(next);
          }
        }
        chars[i] = original; // undo before the next position
      }
    }
    queue = nextLevel;
    steps++;
  }

  return 0;
};

/**
 * @param {number[]} candidates
 * @param {number} target
 * @return {number[][]}
 */
var combinationSum = function (candidates, target) {
  candidates.sort((a, b) => a - b); // numeric sort; lets a loop stop once a number is too big
  const result = [];
  const path = [];

  const backtrack = (start, remaining) => {
    if (remaining === 0) {
      result.push([...path]); // copy: path keeps changing after this
      return;
    }
    for (let i = start; i < candidates.length; i++) {
      const c = candidates[i];
      if (c > remaining) break;        // every later candidate is even bigger
      path.push(c);                    // choose
      backtrack(i, remaining - c);     // i, not i + 1: c can be reused
      path.pop();                      // un-choose
    }
  };

  backtrack(0, target);
  return result;
};

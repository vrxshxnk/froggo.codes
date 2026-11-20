/**
 * @param {number} n
 * @return {string[]}
 */
var generateParenthesis = function (n) {
  const result = [];
  const path = []; // the string built so far, as an array for cheap push/pop

  const build = (openCount, closeCount) => {
    if (path.length === 2 * n) {
      result.push(path.join(""));
      return;
    }
    // we may open as long as we still have openers left
    if (openCount < n) {
      path.push("(");
      build(openCount + 1, closeCount);
      path.pop();
    }
    // we may close only if there is an unmatched opener to close
    if (closeCount < openCount) {
      path.push(")");
      build(openCount, closeCount + 1);
      path.pop();
    }
  };

  build(0, 0);
  return result;
};

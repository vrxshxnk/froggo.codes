/**
 * @param {number[]} heights
 * @return {number}
 */
var largestRectangleArea = function (heights) {
  const stack = []; // indices of bars, heights strictly increasing from bottom to top
  let best = 0;
  const n = heights.length;

  for (let i = 0; i <= n; i++) {
    // A height-0 bar after the end flushes every bar still on the stack.
    const h = i < n ? heights[i] : 0;
    while (stack.length && heights[stack[stack.length - 1]] >= h) {
      const top = stack.pop();
      // i is the first shorter bar to the right, the new stack top the first
      // shorter bar to the left, so `top` is the shortest bar between them.
      const left = stack.length ? stack[stack.length - 1] : -1;
      best = Math.max(best, heights[top] * (i - left - 1));
    }
    stack.push(i);
  }
  return best;
};

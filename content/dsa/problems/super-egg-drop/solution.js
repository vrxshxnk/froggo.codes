/**
 * @param {number} k
 * @param {number} n
 * @return {number}
 */
var superEggDrop = function (k, n) {
  // Flip the question: with `moves` drops and e eggs, how many floors can we
  // fully decide? Call it covered[e]. Find the first `moves` where covered[k] >= n.
  const covered = new Array(k + 1).fill(0);
  let moves = 0;
  while (covered[k] < n) {
    moves++;
    // High e to low so covered[e - 1] is still last move's value.
    for (let e = k; e >= 1; e--) {
      // Breaks: covered[e-1] floors below. Survives: covered[e] above. +1 for this floor.
      covered[e] = covered[e - 1] + covered[e] + 1;
    }
  }
  return moves;
};

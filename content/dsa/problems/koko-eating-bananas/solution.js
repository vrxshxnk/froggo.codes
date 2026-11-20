/**
 * @param {number[]} piles
 * @param {number} h
 * @return {number}
 */
var minEatingSpeed = function (piles, h) {
  // Search over speeds, not indices. "Speed k finishes in time" goes F F F T T T,
  // so we want the first T. hi = max(piles) always works (1 hour per pile).
  let lo = 1, hi = Math.max(...piles);
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    let hours = 0; // up to 1e13: still exact in a JS number (< 2^53)
    for (const p of piles) {
      hours += Math.ceil(p / mid); // leftovers cost a whole hour
    }
    if (hours <= h) {
      hi = mid;      // mid works; something slower might too
    } else {
      lo = mid + 1;  // mid is too slow, and so is everything below it
    }
  }
  return lo;
};

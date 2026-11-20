/**
 * @param {number[][]} accounts
 * @return {number}
 */
var maximumWealth = function (accounts) {
  let best = 0; // safe start: every amount is at least 1, so any real total beats it

  for (const row of accounts) {
    let wealth = 0;      // reset for EVERY customer, or totals leak across rows
    for (const money of row) {
      wealth += money;
    }
    if (wealth > best) {
      best = wealth;
    }
  }

  return best;
};

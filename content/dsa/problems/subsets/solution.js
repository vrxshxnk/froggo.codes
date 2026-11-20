/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var subsets = function (nums) {
  const result = [];
  const path = []; // the subset we are building right now

  const backtrack = (start) => {
    // Every node of the decision tree is a valid subset, so record it on arrival
    result.push([...path]); // copy: path keeps changing after this
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]); // choose
      backtrack(i + 1);   // explore: only later elements, so no repeats
      path.pop();         // un-choose
    }
  };

  backtrack(0);
  return result;
};

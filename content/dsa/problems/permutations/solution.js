/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var permute = function (nums) {
  const result = [];
  const path = [];
  const used = new Array(nums.length).fill(false); // used[i]: is nums[i] already in path?

  const backtrack = () => {
    if (path.length === nums.length) {
      result.push([...path]); // a full arrangement; copy it
      return;
    }
    for (let i = 0; i < nums.length; i++) { // any unused number may go next, so start at 0
      if (used[i]) continue;
      used[i] = true; // choose
      path.push(nums[i]);
      backtrack();    // explore
      path.pop();     // un-choose: undo BOTH changes
      used[i] = false;
    }
  };

  backtrack();
  return result;
};

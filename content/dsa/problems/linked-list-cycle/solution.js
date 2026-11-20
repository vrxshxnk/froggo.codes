/**
 * @param {ListNode} head
 * @return {boolean}
 */
var hasCycle = function (head) {
  let slow = head; // moves 1 step per turn
  let fast = head; // moves 2 steps per turn

  // fast reaches the end first if there is one, so only fast needs checking
  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) { // same node (not just same value): fast lapped slow inside a loop
      return true;
    }
  }

  return false; // fast hit the end, so there is no loop
};

/**
 * @param {ListNode} head
 * @return {void} Do not return anything, modify head in-place instead.
 */
var reorderList = function (head) {
  if (head === null) return;

  // 1. Find the end of the first half. Stopping when fast can't take two more
  //    steps leaves slow on the last node of the first (equal or longer) half.
  let slow = head;
  let fast = head;
  while (fast.next !== null && fast.next.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
  }

  // 2. Cut the list in two, then reverse the second half (save, flip, step).
  let second = slow.next;
  slow.next = null;
  let prev = null;
  while (second !== null) {
    const nxt = second.next;
    second.next = prev;
    prev = second;
    second = nxt;
  }
  second = prev; // head of the reversed second half: the old tail

  // 3. Zip the halves: one node from the front, one from the (reversed) back.
  let first = head;
  while (second !== null) { // the second half is never longer, so it runs out first
    const firstNext = first.next;   // save both rests
    const secondNext = second.next;
    first.next = second;
    second.next = firstNext;
    first = firstNext;
    second = secondNext;
  }
};

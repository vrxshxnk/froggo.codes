/**
 * @param {ListNode} head
 * @param {number} n
 * @return {ListNode}
 */
var removeNthFromEnd = function (head, n) {
  const dummy = new ListNode(0, head); // sits before head, so removing the head is not a special case
  let slow = dummy;
  let fast = dummy;

  // open a gap of exactly n nodes between slow and fast
  for (let i = 0; i < n; i++) {
    fast = fast.next;
  }

  // slide both until fast is on the last node; slow is then just BEFORE the target
  while (fast.next !== null) {
    slow = slow.next;
    fast = fast.next;
  }

  slow.next = slow.next.next; // unlink the nth node from the end
  return dummy.next; // not head: head itself may have been removed
};

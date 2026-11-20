/**
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */
var addTwoNumbers = function (l1, l2) {
  const dummy = new ListNode(); // fake first node, so we can always append to tail
  let tail = dummy;
  let carry = 0;

  // keep going while there's a digit left in either list, or a carry to write out
  while (l1 !== null || l2 !== null || carry !== 0) {
    let total = carry;
    if (l1 !== null) {
      total += l1.val;
      l1 = l1.next;
    }
    if (l2 !== null) {
      total += l2.val;
      l2 = l2.next;
    }

    carry = Math.floor(total / 10);         // 0 or 1: at most 9 + 9 + 1 = 19
    tail.next = new ListNode(total % 10);   // the digit that stays in this column
    tail = tail.next;
  }

  return dummy.next;
};

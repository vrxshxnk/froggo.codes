/**
 * @param {ListNode} list1
 * @param {ListNode} list2
 * @return {ListNode}
 */
var mergeTwoLists = function (list1, list2) {
  const dummy = new ListNode(); // fake first node, so "attach to the end" never needs a special case
  let tail = dummy;             // last node of the merged list so far

  while (list1 !== null && list2 !== null) {
    // take the smaller front node; <= keeps equal values in their original order
    if (list1.val <= list2.val) {
      tail.next = list1;
      list1 = list1.next;
    } else {
      tail.next = list2;
      list2 = list2.next;
    }
    tail = tail.next;
  }

  // one list is empty; the other is already sorted, so hang it on in one move
  tail.next = list1 !== null ? list1 : list2;
  return dummy.next; // skip the fake node
};

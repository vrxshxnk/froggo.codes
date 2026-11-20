/**
 * @param {string} s
 * @return {number}
 */
var calculate = function (s) {
  const stack = []; // signed terms; the answer is their sum
  let num = 0;      // the number we are reading right now
  let op = "+";     // the operator that came BEFORE num

  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c >= "0" && c <= "9") num = num * 10 + (c.charCodeAt(0) - 48);
    // an operator (or the end of the string) means num is complete
    if (c === "+" || c === "-" || c === "*" || c === "/" || i === s.length - 1) {
      if (op === "+") stack.push(num);
      else if (op === "-") stack.push(-num);
      else if (op === "*") stack.push(stack.pop() * num); // * binds tighter: fold into the last term now
      else stack.push(Math.trunc(stack.pop() / num));     // truncate toward zero, not Math.floor
      op = c;
      num = 0;
    }
  }

  return stack.reduce((sum, term) => sum + term, 0);
};

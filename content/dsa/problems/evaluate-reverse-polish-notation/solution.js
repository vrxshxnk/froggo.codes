/**
 * @param {string[]} tokens
 * @return {number}
 */
var evalRPN = function (tokens) {
  const stack = []; // numbers waiting for an operator

  for (const t of tokens) {
    if (t === "+" || t === "-" || t === "*" || t === "/") {
      const b = stack.pop(); // the top is the RIGHT operand
      const a = stack.pop();
      if (t === "+") stack.push(a + b);
      else if (t === "-") stack.push(a - b);
      else if (t === "*") stack.push(a * b);
      else stack.push(Math.trunc(a / b)); // truncate toward zero, not Math.floor
    } else {
      stack.push(Number(t)); // handles "-11" too
    }
  }

  return stack[stack.length - 1];
};

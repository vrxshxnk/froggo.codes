/**
 * @param {number} n
 * @return {string[]}
 */
var fizzBuzz = function (n) {
  const answer = [];

  for (let i = 1; i <= n; i++) {   // 1 to n inclusive, not 0 to n - 1
    if (i % 15 === 0) {            // most specific rule first, or 15 would stop at "Fizz"
      answer.push("FizzBuzz");
    } else if (i % 3 === 0) {
      answer.push("Fizz");
    } else if (i % 5 === 0) {
      answer.push("Buzz");
    } else {
      answer.push(String(i));      // the list holds text, not numbers
    }
  }

  return answer;
};

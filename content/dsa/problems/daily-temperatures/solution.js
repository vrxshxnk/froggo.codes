/**
 * @param {number[]} temperatures
 * @return {number[]}
 */
var dailyTemperatures = function (temperatures) {
  const answer = new Array(temperatures.length).fill(0); // 0 = no warmer day ever comes
  const stack = []; // indices still waiting for a warmer day; their temps only go down

  for (let i = 0; i < temperatures.length; i++) {
    // today is the warmer day for every colder day still waiting on top
    while (stack.length && temperatures[stack[stack.length - 1]] < temperatures[i]) {
      const j = stack.pop();
      answer[j] = i - j;
    }
    stack.push(i);
  }

  return answer;
};

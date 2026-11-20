class MinStack {
  constructor() {
    // each entry is [value, smallest value at or below this entry]
    this.stack = [];
  }

  /**
   * @param {number} val
   * @return {void}
   */
  push(val) {
    const n = this.stack.length;
    const currentMin = n === 0 ? val : Math.min(val, this.stack[n - 1][1]);
    this.stack.push([val, currentMin]);
  }

  /**
   * @return {void}
   */
  pop() {
    // the entry below still remembers the minimum from before this push
    this.stack.pop();
  }

  /**
   * @return {number}
   */
  top() {
    return this.stack[this.stack.length - 1][0];
  }

  /**
   * @return {number}
   */
  getMin() {
    return this.stack[this.stack.length - 1][1];
  }
}

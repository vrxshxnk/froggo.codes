/**
 * @param {number} numCourses
 * @param {number[][]} prerequisites
 * @return {boolean}
 */
var canFinish = function (numCourses, prerequisites) {
  // Adjacency list: graph[b] lists the courses that b unlocks (edge b -> a)
  const graph = Array.from({ length: numCourses }, () => []);
  const indegree = new Array(numCourses).fill(0); // how many prerequisites each course still waits on
  for (const [a, b] of prerequisites) {
    graph[b].push(a);
    indegree[a]++;
  }

  // Kahn's algorithm: start with every course that needs nothing
  const queue = [];
  for (let c = 0; c < numCourses; c++) if (indegree[c] === 0) queue.push(c);

  let taken = 0;
  // An array with a moving head is an O(1) queue; shift() would be O(n)
  for (let head = 0; head < queue.length; head++) {
    const course = queue[head];
    taken++;
    for (const nxt of graph[course]) {
      indegree[nxt]--;
      if (indegree[nxt] === 0) queue.push(nxt); // all of nxt's prerequisites are done
    }
  }

  // Courses on a cycle never reach indegree 0, so they are never taken
  return taken === numCourses;
};

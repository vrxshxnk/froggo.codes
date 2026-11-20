// One entry in the recency list. It stores its key so eviction can delete it from the map.
class CacheNode {
  constructor(key = 0, val = 0) {
    this.key = key;
    this.val = val;
    this.prev = null;
    this.next = null;
  }
}

class LRUCache {
  /**
   * @param {number} capacity
   */
  constructor(capacity) {
    this.capacity = capacity;
    this.nodes = new Map(); // key -> CacheNode, for O(1) lookup
    // Two sentinel nodes that are never removed, so every real node always has
    // a prev and a next. head.next is the most recent; tail.prev the least.
    this.head = new CacheNode();
    this.tail = new CacheNode();
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  remove(node) {
    // unhook node by joining its neighbours to each other
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  addFront(node) {
    // slot node in right after head: it becomes the most recently used
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next.prev = node;
    this.head.next = node;
  }

  /**
   * @param {number} key
   * @return {number}
   */
  get(key) {
    const node = this.nodes.get(key);
    if (node === undefined) return -1;
    this.remove(node);   // reading counts as a use,
    this.addFront(node); // so move it to the front
    return node.val;
  }

  /**
   * @param {number} key
   * @param {number} value
   * @return {void}
   */
  put(key, value) {
    let node = this.nodes.get(key);
    if (node !== undefined) { // existing key: update it and mark it as just used
      node.val = value;
      this.remove(node);
      this.addFront(node);
      return;
    }

    if (this.nodes.size === this.capacity) { // full: evict the least recently used
      const lru = this.tail.prev;
      this.remove(lru);
      this.nodes.delete(lru.key); // this is why each node remembers its key
    }

    node = new CacheNode(key, value);
    this.nodes.set(key, node);
    this.addFront(node);
  }
}

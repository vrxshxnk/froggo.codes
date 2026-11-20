class LRUCache {
    // One entry in the recency list. It stores its key so eviction can remove it from the map.
    private static class CacheNode {
        int key, val;
        CacheNode prev, next;

        CacheNode(int key, int val) {
            this.key = key;
            this.val = val;
        }
    }

    private final int capacity;
    private final Map<Integer, CacheNode> nodes = new HashMap<>(); // key -> node, for O(1) lookup
    // Two sentinel nodes that are never removed, so every real node always has
    // a prev and a next. head.next is the most recent; tail.prev the least.
    private final CacheNode head = new CacheNode(0, 0);
    private final CacheNode tail = new CacheNode(0, 0);

    public LRUCache(int capacity) {
        this.capacity = capacity;
        head.next = tail;
        tail.prev = head;
    }

    private void remove(CacheNode node) {
        // unhook node by joining its neighbours to each other
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    private void addFront(CacheNode node) {
        // slot node in right after head: it becomes the most recently used
        node.prev = head;
        node.next = head.next;
        head.next.prev = node;
        head.next = node;
    }

    public int get(int key) {
        CacheNode node = nodes.get(key);
        if (node == null) return -1;
        remove(node);   // reading counts as a use,
        addFront(node); // so move it to the front
        return node.val;
    }

    public void put(int key, int value) {
        CacheNode node = nodes.get(key);
        if (node != null) { // existing key: update it and mark it as just used
            node.val = value;
            remove(node);
            addFront(node);
            return;
        }

        if (nodes.size() == capacity) { // full: evict the least recently used
            CacheNode lru = tail.prev;
            remove(lru);
            nodes.remove(lru.key); // this is why each node remembers its key
        }

        node = new CacheNode(key, value);
        nodes.put(key, node);
        addFront(node);
    }
}

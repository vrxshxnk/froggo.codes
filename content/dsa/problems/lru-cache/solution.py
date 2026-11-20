class CacheNode:
    """One entry in the recency list. It stores its key so eviction can delete it from the map."""

    def __init__(self, key: int = 0, val: int = 0):
        self.key = key
        self.val = val
        self.prev = None
        self.next = None


class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.nodes = {}  # key -> CacheNode, for O(1) lookup
        # Two sentinel nodes that are never removed, so every real node always has
        # a prev and a next. head.next is the most recent; tail.prev the least.
        self.head = CacheNode()
        self.tail = CacheNode()
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove(self, node: CacheNode) -> None:
        # unhook node by joining its neighbours to each other
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add_front(self, node: CacheNode) -> None:
        # slot node in right after head: it becomes the most recently used
        node.prev = self.head
        node.next = self.head.next
        self.head.next.prev = node
        self.head.next = node

    def get(self, key: int) -> int:
        node = self.nodes.get(key)
        if node is None:
            return -1
        self._remove(node)     # reading counts as a use,
        self._add_front(node)  # so move it to the front
        return node.val

    def put(self, key: int, value: int) -> None:
        node = self.nodes.get(key)
        if node is not None:   # existing key: update it and mark it as just used
            node.val = value
            self._remove(node)
            self._add_front(node)
            return

        if len(self.nodes) == self.capacity:  # full: evict the least recently used
            lru = self.tail.prev
            self._remove(lru)
            del self.nodes[lru.key]  # this is why each node remembers its key

        node = CacheNode(key, value)
        self.nodes[key] = node
        self._add_front(node)

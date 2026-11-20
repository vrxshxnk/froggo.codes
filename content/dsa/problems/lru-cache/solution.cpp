class LRUCache {
    // One entry in the recency list. It stores its key so eviction can erase it from the map.
    struct CacheNode {
        int key, val;
        CacheNode* prev = nullptr;
        CacheNode* next = nullptr;
        CacheNode(int k, int v) : key(k), val(v) {}
    };

    int capacity;
    unordered_map<int, CacheNode*> nodes;  // key -> node, for O(1) lookup
    // Two sentinel nodes that are never removed, so every real node always has
    // a prev and a next. head->next is the most recent; tail->prev the least.
    CacheNode* head;
    CacheNode* tail;

    void remove(CacheNode* node) {
        // unhook node by joining its neighbours to each other
        node->prev->next = node->next;
        node->next->prev = node->prev;
    }

    void addFront(CacheNode* node) {
        // slot node in right after head: it becomes the most recently used
        node->prev = head;
        node->next = head->next;
        head->next->prev = node;
        head->next = node;
    }

public:
    LRUCache(int capacity) : capacity(capacity), head(new CacheNode(0, 0)), tail(new CacheNode(0, 0)) {
        head->next = tail;
        tail->prev = head;
    }

    ~LRUCache() {
        for (CacheNode* node = head; node != nullptr;) {
            CacheNode* nxt = node->next;
            delete node;
            node = nxt;
        }
    }

    int get(int key) {
        auto it = nodes.find(key);
        if (it == nodes.end()) return -1;
        CacheNode* node = it->second;
        remove(node);    // reading counts as a use,
        addFront(node);  // so move it to the front
        return node->val;
    }

    void put(int key, int value) {
        auto it = nodes.find(key);
        if (it != nodes.end()) {  // existing key: update it and mark it as just used
            CacheNode* node = it->second;
            node->val = value;
            remove(node);
            addFront(node);
            return;
        }

        if ((int)nodes.size() == capacity) {  // full: evict the least recently used
            CacheNode* lru = tail->prev;
            remove(lru);
            nodes.erase(lru->key);  // this is why each node remembers its key
            delete lru;
        }

        CacheNode* node = new CacheNode(key, value);
        nodes[key] = node;
        addFront(node);
    }
};

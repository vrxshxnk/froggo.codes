#!/usr/bin/env node
// Runs every walkthrough's solution, in every language, against its tests.json
// so no student ever copies a solution that doesn't pass.
//
//   node scripts/test-dsa-solutions.mjs                 # all problems
//   node scripts/test-dsa-solutions.mjs two-sum         # one problem
//   node scripts/test-dsa-solutions.mjs two-sum 3sum    # several
//
// tests.json, LeetCode-style (function call):
//   { "fn": "twoSum", "params": ["int[]", "int"], "returns": "int[]",
//     "compare": "exact" | "unordered" | "unordered-outer" | "unordered-groups" | "float" | "u32",
//     "inplace": 0,            // optional: the function returns void and edits param 0 — compare that instead
//     "cases": [{ "in": [[2,7,11,15], 9], "out": [0,1] }] }
//
// tests.json, class design (Min Stack, LRU Cache, Trie, ...):
//   { "mode": "design", "class": "MinStack", "ctor": [],
//     "methods": { "push": { "params": ["int"], "returns": "void" }, "getMin": { "params": [], "returns": "int" } },
//     "compare": "exact" | "float",
//     "cases": [{ "ops": ["MinStack", "push", "getMin"], "args": [[], [-2], []], "out": [null, null, -2] }] }
//
// tests.json, Codeforces-style (stdin/stdout):
//   { "mode": "stdio", "cases": [{ "in": "3\n1 2 3\n", "out": "6" }] }
//
// Types: int, long, uint32, bool, double, string, int[], long[], bool[], char[], string[],
//   string-list (Java List<String>), int[][], char[][], string[][],
//   ListNode ([1,2,3]), ListNode[] ([[1,4],[2]]), ListNode-cycle ([[3,2,0,-4], pos], input only),
//   TreeNode (LeetCode level order, [3,9,20,null,null,15,7]),
//   TreeNode-ref (input: the node with this value in param 0's tree; output: that node's value),
//   RandomList ([[7,null],[13,0]] — LeetCode 138's Node), Graph (adjacency list — LeetCode 133's Node).
//   ListNode/TreeNode/Node are defined by the harness, exactly as LeetCode defines them, so
//   solution files must not define them.
//
// A problem whose answers aren't unique can ship check.mjs next to tests.json:
//   export default function check(input, actual, expected) { return true | false; }
//
// Needs python3, node, g++ (C++20) and a JDK on the PATH. Set DSA_PROBLEMS_DIR to test another folder.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import vm from "node:vm";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const PROBLEMS_DIR = process.env.DSA_PROBLEMS_DIR
  ? path.resolve(process.env.DSA_PROBLEMS_DIR)
  : path.join(ROOT, "content/dsa/problems");
const WORK = fs.mkdtempSync(path.join(os.tmpdir(), "dsa-tests-"));

// clang on macOS ships no <bits/stdc++.h>; Codeforces-style C++ needs it
const SHIM = path.join(WORK, "include");
fs.mkdirSync(path.join(SHIM, "bits"), { recursive: true });
fs.writeFileSync(
  path.join(SHIM, "bits/stdc++.h"),
  [
    "algorithm", "array", "bitset", "cassert", "climits", "cmath", "cstdint", "cstdio", "cstdlib", "cstring",
    "deque", "functional", "iomanip", "iostream", "list", "map", "numeric", "optional", "queue", "set", "sstream",
    "stack", "string", "tuple", "unordered_map", "unordered_set", "utility", "vector",
  ].map((h) => `#include <${h}>`).join("\n") + "\n"
);

const run = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"], timeout: 180000, maxBuffer: 64 << 20, ...opts });

// Every type a spec mentions, so harnesses only include the node classes they need
function typesOf(spec) {
  const t = new Set([...(spec.params || []), spec.returns, ...(spec.ctor || [])]);
  for (const m of Object.values(spec.methods || {})) [...(m.params || []), m.returns].forEach((x) => t.add(x));
  return t;
}
const nodeKind = (spec) => {
  const t = typesOf(spec);
  return t.has("Graph") ? "graph" : t.has("RandomList") ? "random" : null;
};

// ---------- comparison ----------
const key = (v) => JSON.stringify(v);
const sortDeep = (v) => (Array.isArray(v) ? v.map(sortDeep).sort((a, b) => key(a).localeCompare(key(b))) : v);
const close = (a, b) =>
  typeof a === "number" && typeof b === "number"
    ? Math.abs(a - b) < 1e-5
    : Array.isArray(a) && Array.isArray(b)
      ? a.length === b.length && a.every((x, i) => close(x, b[i]))
      : key(a) === key(b);

function same(actual, expected, mode) {
  if (actual === undefined) return false;
  if (mode === "unordered") return key([...actual].sort()) === key([...expected].sort());
  if (mode === "unordered-outer") return key(actual.map(key).sort()) === key(expected.map(key).sort());
  if (mode === "unordered-groups") return key(sortDeep(actual)) === key(sortDeep(expected));
  if (mode === "float") return close(actual, expected);
  if (mode === "u32") return typeof actual === "number" && actual >>> 0 === expected;
  return key(actual) === key(expected);
}

const tokens = (s) => s.trim().split(/\s+/).join(" ");

// ---------- Python ----------
const PY_NODE = {
  random: `
class Node:
    def __init__(self, x, next=None, random=None):
        self.val = int(x); self.next = next; self.random = random`,
  graph: `
class Node:
    def __init__(self, val=0, neighbors=None):
        self.val = val; self.neighbors = neighbors if neighbors is not None else []`,
};

function runPython(dir, spec) {
  const harness = `
import json, sys
sys.setrecursionlimit(100000)
from typing import *
from collections import *
import heapq, math, bisect, functools, itertools, string
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val; self.next = next
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val; self.left = left; self.right = right
${PY_NODE[nodeKind(spec)] || ""}
def __mk_list(v):
    d = c = ListNode()
    for x in v:
        c.next = ListNode(x); c = c.next
    return d.next
def __mk_cycle(v):
    vals, pos = v
    h = __mk_list(vals)
    if pos < 0 or h is None: return h
    t, at, i = h, None, 0
    while True:
        if i == pos: at = t
        if t.next is None:
            t.next = at; break
        t = t.next; i += 1
    return h
def __mk_tree(v):
    if not v or v[0] is None: return None
    n = [None if x is None else TreeNode(x) for x in v]
    q = deque([n[0]]); i = 1
    while q and i < len(v):
        x = q.popleft()
        if i < len(v) and n[i] is not None: x.left = n[i]; q.append(n[i])
        i += 1
        if i < len(v) and n[i] is not None: x.right = n[i]; q.append(n[i])
        i += 1
    return n[0]
def __find(r, v):
    if r is None: return None
    if r.val == v: return r
    return __find(r.left, v) or __find(r.right, v)
__orig = set()  # ids of input nodes: a copy must not hand these back
__keep = []     # holds the input nodes so their ids can't be reused by new nodes
def __mk_random(v):
    n = [Node(p[0]) for p in v]
    __orig.update(id(x) for x in n); __keep.extend(n)
    for i, p in enumerate(v):
        n[i].next = n[i + 1] if i + 1 < len(n) else None
        n[i].random = None if p[1] is None else n[p[1]]
    return n[0] if n else None
def __mk_graph(adj):
    if not adj: return None
    n = [Node(i + 1) for i in range(len(adj))]
    __orig.update(id(x) for x in n); __keep.extend(n)
    for i, nb in enumerate(adj): n[i].neighbors = [n[j - 1] for j in nb]
    return n[0]
def __build(t, v, args):
    if t == "ListNode": return __mk_list(v)
    if t == "ListNode[]": return [__mk_list(x) for x in v]
    if t == "ListNode-cycle": return __mk_cycle(v)
    if t == "TreeNode": return __mk_tree(v)
    if t == "TreeNode-ref": return None if v is None else __find(args[0], v)
    if t == "RandomList": return __mk_random(v)
    if t == "Graph": return __mk_graph(v)
    return v
def __ser(t, v):
    if t == "void": return None
    if t == "ListNode":
        o, k = [], 0
        while v is not None and k < 100000: o.append(v.val); v = v.next; k += 1
        return o
    if t == "TreeNode":
        if v is None: return []
        o, q = [], deque([v])
        while q:
            x = q.popleft()
            if x is None: o.append(None); continue
            o.append(x.val); q.append(x.left); q.append(x.right)
        while o and o[-1] is None: o.pop()
        return o
    if t == "TreeNode-ref": return None if v is None else v.val
    if t == "RandomList":
        ns, idx, k = [], {}, 0
        while v is not None and k < 100000: idx[id(v)] = len(ns); ns.append(v); v = v.next; k += 1
        if any(id(x) in __orig for x in ns): return "returned original nodes, not a copy"
        return [[x.val, None if x.random is None else idx.get(id(x.random), -99)] for x in ns]
    if t == "Graph":
        if v is None: return []
        seen, q = {v.val: v}, deque([v])
        while q:
            for nb in q.popleft().neighbors:
                if nb.val not in seen: seen[nb.val] = nb; q.append(nb)
        if any(id(x) in __orig for x in seen.values()): return "returned original nodes, not a copy"
        return [[nb.val for nb in seen[k].neighbors] for k in sorted(seen)]
    return v
def __args(types, vals):
    a = []
    for t, v in zip(types, vals): a.append(__build(t, v, a))
    return a
exec(open(${JSON.stringify(path.join(dir, "solution.py"))}).read())
spec = json.load(open(${JSON.stringify(path.join(dir, "tests.json"))}))
out = []
for case in spec["cases"]:
    if spec.get("mode") == "design":
        obj, r = None, []
        for op, a in zip(case["ops"], case["args"]):
            if op == spec["class"]:
                obj = globals()[spec["class"]](*__args(spec.get("ctor", []), a)); r.append(None)
            else:
                m = spec["methods"][op]
                r.append(__ser(m.get("returns", "void"), getattr(obj, op)(*__args(m.get("params", []), a))))
        out.append(r)
    else:
        a = __args(spec["params"], case["in"])
        res = getattr(Solution(), spec["fn"])(*a)
        ip = spec.get("inplace")
        out.append(__ser(spec["params"][ip], a[ip]) if ip is not None else __ser(spec.get("returns"), res))
print(json.dumps(out))
`;
  return JSON.parse(run("python3", ["-c", harness]));
}

// ---------- JavaScript ----------
const JS_NODE = {
  random: "function _Node(val, next, random) { this.val = val; this.next = next === undefined ? null : next; this.random = random === undefined ? null : random; }",
  graph: "function _Node(val, neighbors) { this.val = val === undefined ? 0 : val; this.neighbors = neighbors === undefined ? [] : neighbors; }",
};
const JS_PRELUDE = `
function ListNode(val, next) { this.val = (val === undefined ? 0 : val); this.next = (next === undefined ? null : next); }
function TreeNode(val, left, right) { this.val = (val === undefined ? 0 : val); this.left = (left === undefined ? null : left); this.right = (right === undefined ? null : right); }
function __mkList(v) { const d = new ListNode(); let c = d; for (const x of v) { c.next = new ListNode(x); c = c.next; } return d.next; }
function __mkCycle(v) { const h = __mkList(v[0]), pos = v[1]; if (pos < 0 || !h) return h; let t = h, at = null; for (let i = 0; ; i++) { if (i === pos) at = t; if (!t.next) { t.next = at; break; } t = t.next; } return h; }
function __mkTree(v) { if (!v.length || v[0] === null) return null; const n = v.map((x) => (x === null ? null : new TreeNode(x))); const q = [n[0]]; let i = 1; for (let h = 0; h < q.length && i < v.length; h++) { const x = q[h]; if (i < v.length && n[i]) { x.left = n[i]; q.push(n[i]); } i++; if (i < v.length && n[i]) { x.right = n[i]; q.push(n[i]); } i++; } return n[0]; }
function __find(r, v) { if (!r) return null; if (r.val === v) return r; return __find(r.left, v) || __find(r.right, v); }
const __orig = new Set();
function __mkRandom(v) { const n = v.map((p) => new _Node(p[0], null, null)); n.forEach((x) => __orig.add(x)); n.forEach((x, i) => { x.next = n[i + 1] || null; x.random = v[i][1] === null ? null : n[v[i][1]]; }); return n[0] || null; }
function __mkGraph(adj) { if (!adj.length) return null; const n = adj.map((_, i) => new _Node(i + 1, [])); n.forEach((x) => __orig.add(x)); adj.forEach((nb, i) => { n[i].neighbors = nb.map((j) => n[j - 1]); }); return n[0]; }
function __build(t, v, a) {
  switch (t) {
    case "ListNode": return __mkList(v);
    case "ListNode[]": return v.map(__mkList);
    case "ListNode-cycle": return __mkCycle(v);
    case "TreeNode": return __mkTree(v);
    case "TreeNode-ref": return v === null ? null : __find(a[0], v);
    case "RandomList": return __mkRandom(v);
    case "Graph": return __mkGraph(v);
    default: return v;
  }
}
function __ser(t, v) {
  if (t === "void") return null;
  if (t === "ListNode") { const o = []; let k = 0; while (v && k++ < 100000) { o.push(v.val); v = v.next; } return o; }
  if (t === "TreeNode") { if (!v) return []; const o = [], q = [v]; for (let h = 0; h < q.length; h++) { const x = q[h]; if (!x) { o.push(null); continue; } o.push(x.val); q.push(x.left || null, x.right || null); } while (o.length && o[o.length - 1] === null) o.pop(); return o; }
  if (t === "TreeNode-ref") return v ? v.val : null;
  if (t === "RandomList") { const ns = [], idx = new Map(); let k = 0; while (v && k++ < 100000) { idx.set(v, ns.length); ns.push(v); v = v.next; } if (ns.some((x) => __orig.has(x))) return "returned original nodes, not a copy"; return ns.map((x) => [x.val, x.random ? (idx.has(x.random) ? idx.get(x.random) : -99) : null]); }
  if (t === "Graph") { if (!v) return []; const seen = new Map([[v.val, v]]), q = [v]; for (let h = 0; h < q.length; h++) for (const nb of q[h].neighbors) if (!seen.has(nb.val)) { seen.set(nb.val, nb); q.push(nb); } if ([...seen.values()].some((x) => __orig.has(x))) return "returned original nodes, not a copy"; return [...seen.keys()].sort((a, b) => a - b).map((k) => seen.get(k).neighbors.map((nb) => nb.val)); }
  return v === undefined ? null : v;
}
function __args(types, vals) { const a = []; types.forEach((t, j) => a.push(__build(t, vals[j], a))); return a; }
function __drive(spec, target) {
  const out = [];
  for (const c of spec.cases) {
    if (spec.mode === "design") {
      let obj = null; const r = [];
      c.ops.forEach((op, i) => {
        if (op === spec.class) { obj = new target(...__args(spec.ctor || [], c.args[i])); r.push(null); }
        else { const m = spec.methods[op]; r.push(__ser(m.returns || "void", obj[op](...__args(m.params || [], c.args[i])))); }
      });
      out.push(r);
    } else {
      const a = __args(spec.params, c.in);
      const res = target(...a);
      out.push(spec.inplace != null ? __ser(spec.params[spec.inplace], a[spec.inplace]) : __ser(spec.returns, res));
    }
  }
  return JSON.stringify(out);
}
`;

function runJs(dir, spec) {
  const src = fs.readFileSync(path.join(dir, "solution.js"), "utf8");
  const target = spec.mode === "design" ? spec.class : spec.fn;
  const code = `${JS_NODE[nodeKind(spec)] || ""}\nvar Node = typeof _Node === "undefined" ? undefined : _Node;\n${JS_PRELUDE}\n${src}\n;__drive(${JSON.stringify(spec)}, ${target});`;
  return JSON.parse(vm.runInContext(code, vm.createContext({ console }), { timeout: 30000 }));
}

// ---------- C++ ----------
const cppType = {
  int: "int", long: "long long", uint32: "uint32_t", bool: "bool", string: "string", double: "double",
  "int[]": "vector<int>", "long[]": "vector<long long>", "string[]": "vector<string>", "string-list": "vector<string>",
  "int[][]": "vector<vector<int>>", "char[][]": "vector<vector<char>>", "string[][]": "vector<vector<string>>",
  "bool[]": "vector<bool>", "char[]": "vector<char>",
  ListNode: "ListNode*", "ListNode[]": "vector<ListNode*>", "ListNode-cycle": "ListNode*",
  TreeNode: "TreeNode*", "TreeNode-ref": "TreeNode*", RandomList: "Node*", Graph: "Node*",
};
const cppInt = (x) => (x === -2147483648 ? "INT_MIN" : String(x));
const intVec = (v) => `vector<int>{${v.map(cppInt).join(", ")}}`;

function cppLit(type, v, first) {
  switch (type) {
    case "string": return `string(${JSON.stringify(v)})`;
    case "bool": return v ? "true" : "false";
    case "long": return `${v}LL`;
    case "uint32": return `${v}u`;
    case "int": return cppInt(v);
    case "double": return String(v);
    case "string-list": return cppLit("string[]", v);
    case "ListNode": return `L(${intVec(v)})`;
    case "ListNode[]": return `vector<ListNode*>{${v.map((x) => `L(${intVec(x)})`).join(", ")}}`;
    case "ListNode-cycle": return `LC(${intVec(v[0])}, ${v[1]})`;
    case "TreeNode": return `T(${intVec(v.map((x) => x ?? 0))}, ${intVec(v.map((x) => (x === null ? 0 : 1)))})`;
    case "TreeNode-ref": return v === null ? "nullptr" : `F(${first}, ${cppInt(v)})`;
    case "RandomList": return `R(${intVec(v.map((p) => p[0]))}, ${intVec(v.map((p) => p[1] ?? -1))})`;
    case "Graph": return `G(${cppLit("int[][]", v)})`;
  }
  if (type.endsWith("[]")) {
    const inner = type.slice(0, -2);
    const el = (x) => (inner === "char" ? `'${x}'` : inner === "string" ? JSON.stringify(x) : cppLit(inner, x));
    return `${cppType[type]}{${v.map(el).join(", ")}}`;
  }
  throw new Error(`Unknown type ${type}`);
}

const CPP_NODE = {
  random: "class Node { public: int val; Node* next; Node* random; Node(int _val) { val = _val; next = NULL; random = NULL; } };",
  graph: "class Node { public: int val; vector<Node*> neighbors; Node() { val = 0; neighbors = vector<Node*>(); } Node(int _val) { val = _val; neighbors = vector<Node*>(); } Node(int _val, vector<Node*> _neighbors) { val = _val; neighbors = _neighbors; } };",
};
const CPP_NODE_HELPERS = {
  random: `unordered_set<Node*> ORIG;
Node* R(vector<int> v, vector<int> rnd){ vector<Node*> n; for(int x: v){ n.push_back(new Node(x)); ORIG.insert(n.back()); } for(size_t i=0;i<n.size();i++){ n[i]->next = i+1<n.size()? n[i+1] : nullptr; n[i]->random = rnd[i]<0? nullptr : n[rnd[i]]; } return n.empty()? nullptr : n[0]; }
string J(Node* h){ vector<Node*> ns; unordered_map<Node*,int> idx; int k=0; while(h && k++<100000){ if(ORIG.count(h)) return "\\"returned original nodes, not a copy\\""; idx[h]=ns.size(); ns.push_back(h); h=h->next; } string r="["; for(size_t i=0;i<ns.size();i++){ if(i) r+=","; r+="["+to_string(ns[i]->val)+","+(ns[i]->random? (idx.count(ns[i]->random)? to_string(idx[ns[i]->random]) : string("-99")) : string("null"))+"]"; } return r+"]"; }`,
  graph: `unordered_set<Node*> ORIG;
Node* G(vector<vector<int>> adj){ if(adj.empty()) return nullptr; vector<Node*> n; for(size_t i=0;i<adj.size();i++){ n.push_back(new Node(i+1)); ORIG.insert(n.back()); } for(size_t i=0;i<adj.size();i++) for(int j: adj[i]) n[i]->neighbors.push_back(n[j-1]); return n[0]; }
string J(Node* s){ if(!s) return "[]"; map<int,Node*> seen; seen[s->val]=s; queue<Node*> q; q.push(s); while(!q.empty()){ Node* x=q.front(); q.pop(); for(Node* nb: x->neighbors) if(!seen.count(nb->val)){ seen[nb->val]=nb; q.push(nb); } } for(auto& kv: seen) if(ORIG.count(kv.second)) return "\\"returned original nodes, not a copy\\""; string r="["; bool first=true; for(auto& kv: seen){ if(!first) r+=","; first=false; r+="["; for(size_t i=0;i<kv.second->neighbors.size();i++){ if(i) r+=","; r+=to_string(kv.second->neighbors[i]->val); } r+="]"; } return r+"]"; }`,
};

function cppProgram(dir, spec, body) {
  const kind = nodeKind(spec);
  return `#include <bits/stdc++.h>
using namespace std;
struct ListNode { int val; ListNode *next; ListNode() : val(0), next(nullptr) {} ListNode(int x) : val(x), next(nullptr) {} ListNode(int x, ListNode *next) : val(x), next(next) {} };
struct TreeNode { int val; TreeNode *left; TreeNode *right; TreeNode() : val(0), left(nullptr), right(nullptr) {} TreeNode(int x) : val(x), left(nullptr), right(nullptr) {} TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {} };
${CPP_NODE[kind] || ""}
${fs.readFileSync(path.join(dir, "solution.cpp"), "utf8")}
ListNode* L(vector<int> v){ ListNode d; ListNode* c=&d; for(int x: v){ c->next=new ListNode(x); c=c->next; } return d.next; }
ListNode* LC(vector<int> v, int pos){ ListNode* h=L(v); if(pos<0||!h) return h; ListNode* t=h; ListNode* at=nullptr; for(int i=0;;i++){ if(i==pos) at=t; if(!t->next){ t->next=at; break; } t=t->next; } return h; }
TreeNode* T(vector<int> v, vector<int> has){ if(v.empty()||!has[0]) return nullptr; vector<TreeNode*> n(v.size()); for(size_t i=0;i<v.size();i++) n[i]=has[i]? new TreeNode(v[i]) : nullptr; queue<TreeNode*> q; q.push(n[0]); size_t i=1; while(!q.empty()&&i<v.size()){ TreeNode* x=q.front(); q.pop(); if(i<v.size()&&n[i]){ x->left=n[i]; q.push(n[i]); } i++; if(i<v.size()&&n[i]){ x->right=n[i]; q.push(n[i]); } i++; } return n[0]; }
TreeNode* F(TreeNode* r, int v){ if(!r) return nullptr; if(r->val==v) return r; TreeNode* a=F(r->left,v); return a? a : F(r->right,v); }
string J(int v){return to_string(v);} string J(long v){return to_string(v);} string J(long long v){return to_string(v);}
string J(unsigned v){return to_string(v);} string J(unsigned long v){return to_string(v);} string J(unsigned long long v){return to_string(v);}
string J(bool v){return v?"true":"false";} string J(double v){ostringstream o; o<<setprecision(12)<<v; return o.str();}
string J(char c){return string("\\"")+c+"\\"";}
string J(const string& s){string r="\\""; for(char c: s){ if(c=='"'||c=='\\\\') r+='\\\\'; r+=c;} return r+"\\"";}
string J(ListNode* h){ string r="["; int k=0; while(h && k++<100000){ if(r.size()>1) r+=","; r+=to_string(h->val); h=h->next; } return r+"]"; }
string J(TreeNode* root){ if(!root) return "[]"; vector<string> o; queue<TreeNode*> q; q.push(root); while(!q.empty()){ TreeNode* x=q.front(); q.pop(); if(!x){ o.push_back("null"); continue; } o.push_back(to_string(x->val)); q.push(x->left); q.push(x->right); } while(!o.empty()&&o.back()=="null") o.pop_back(); string r="["; for(size_t i=0;i<o.size();i++){ if(i) r+=","; r+=o[i]; } return r+"]"; }
string JRef(TreeNode* x){ return x? to_string(x->val) : "null"; }
${CPP_NODE_HELPERS[kind] || ""}
template<class T> string J(const vector<T>& v){string r="["; for(size_t i=0;i<v.size();i++){ if(i) r+=","; r+=J((T)v[i]);} return r+"]";}
string JOIN(const vector<string>& v){ string r="["; for(size_t i=0;i<v.size();i++){ if(i) r+=","; r+=v[i]; } return r+"]"; }
int main(){ vector<string> out;
${body}
  cout<<JOIN(out); }
`;
}

const cppDecls = (types, vals, prefix) =>
  types.map((t, j) => `    ${cppType[t]} ${prefix}${j} = ${cppLit(t, vals[j], `${prefix}0`)};`).join("\n");
const cppWrap = (t) => (t === "TreeNode-ref" ? "JRef" : "J");

function runCpp(dir, spec) {
  let body;
  if (spec.mode === "design") {
    body = spec.cases
      .map((c, i) => {
        const steps = c.ops.map((op, k) => {
          const p = `a${i}_${k}_`;
          if (op === spec.class) {
            const ctor = spec.ctor || [];
            return `  {\n${cppDecls(ctor, c.args[k], p)}\n    o = new ${spec.class}(${ctor.map((_, j) => p + j).join(", ")}); r.push_back("null"); }`;
          }
          const m = spec.methods[op];
          const params = m.params || [];
          const call = `o->${op}(${params.map((_, j) => p + j).join(", ")})`;
          const ret = m.returns || "void";
          return `  {\n${cppDecls(params, c.args[k], p)}\n    ${ret === "void" ? `${call}; r.push_back("null");` : `r.push_back(${cppWrap(ret)}(${call}));`} }`;
        });
        return `{ ${spec.class}* o = nullptr; vector<string> r;\n${steps.join("\n")}\n  out.push_back(JOIN(r)); }`;
      })
      .join("\n");
  } else {
    body = spec.cases
      .map((c, i) => {
        const p = `a${i}_`;
        const call = `s.${spec.fn}(${spec.params.map((_, j) => p + j).join(", ")})`;
        const result =
          spec.inplace != null
            ? `${call}; out.push_back(${cppWrap(spec.params[spec.inplace])}(${p}${spec.inplace}));`
            : `out.push_back(${cppWrap(spec.returns)}(${call}));`;
        return `  {\n${cppDecls(spec.params, c.in, p)}\n    Solution s; ${result} }`;
      })
      .join("\n");
  }
  const file = path.join(WORK, "lc.cpp");
  fs.writeFileSync(file, cppProgram(dir, spec, body));
  run("g++", ["-std=c++20", "-O1", "-w", "-I", SHIM, "-o", path.join(WORK, "lc"), file]);
  return JSON.parse(run(path.join(WORK, "lc"), []));
}

// ---------- Java ----------
const javaType = {
  int: "int", long: "long", uint32: "int", bool: "boolean", string: "String", double: "double",
  "int[]": "int[]", "long[]": "long[]", "string[]": "String[]", "string-list": "List<String>",
  "int[][]": "int[][]", "char[][]": "char[][]", "string[][]": "List<List<String>>",
  "bool[]": "boolean[]", "char[]": "char[]",
  ListNode: "ListNode", "ListNode[]": "ListNode[]", "ListNode-cycle": "ListNode",
  TreeNode: "TreeNode", "TreeNode-ref": "TreeNode", RandomList: "Node", Graph: "Node",
};
const jIntArr = (v) => `new int[]{${v.join(", ")}}`;

function javaLit(type, v, first) {
  switch (type) {
    case "string": return JSON.stringify(v);
    case "bool": return v ? "true" : "false";
    case "long": return `${v}L`;
    case "uint32": return `(int) ${v}L`;
    case "int": case "double": return String(v);
    case "string-list": return `new ArrayList<>(List.of(${v.map((s) => JSON.stringify(s)).join(", ")}))`;
    case "string[][]": return `new ArrayList<>(List.of(${v.map((row) => javaLit("string-list", row)).join(", ")}))`;
    case "ListNode": return `L(${jIntArr(v)})`;
    case "ListNode[]": return `new ListNode[]{${v.map((x) => `L(${jIntArr(x)})`).join(", ")}}`;
    case "ListNode-cycle": return `LC(${jIntArr(v[0])}, ${v[1]})`;
    case "TreeNode": return `T(${jIntArr(v.map((x) => x ?? 0))}, new boolean[]{${v.map((x) => x !== null).join(", ")}})`;
    case "TreeNode-ref": return v === null ? "null" : `F(${first}, ${v})`;
    case "RandomList": return `R(${jIntArr(v.map((p) => p[0]))}, ${jIntArr(v.map((p) => p[1] ?? -1))})`;
    case "Graph": return `G(${javaLit("int[][]", v)})`;
  }
  if (type.endsWith("[]")) {
    const inner = type.slice(0, -2);
    const body = v
      .map((x) => (inner === "char" ? `'${x}'` : inner.endsWith("[]") ? javaLit(inner, x).replace(/^new [^{]+/, "") : javaLit(inner, x)))
      .join(", ");
    return `new ${javaType[type]}{${body}}`;
  }
  throw new Error(`Unknown type ${type}`);
}

const JAVA_NODE = {
  random: "class Node { int val; Node next; Node random; public Node(int val) { this.val = val; this.next = null; this.random = null; } }",
  graph: "class Node { public int val; public List<Node> neighbors; public Node() { val = 0; neighbors = new ArrayList<Node>(); } public Node(int _val) { val = _val; neighbors = new ArrayList<Node>(); } public Node(int _val, ArrayList<Node> _neighbors) { val = _val; neighbors = _neighbors; } }",
};
const JAVA_NODE_HELPERS = {
  random: `  static Set<Node> ORIG = Collections.newSetFromMap(new IdentityHashMap<>());
  static Node R(int[] v, int[] rnd) { Node[] n = new Node[v.length]; for (int i = 0; i < v.length; i++) { n[i] = new Node(v[i]); ORIG.add(n[i]); } for (int i = 0; i < v.length; i++) { n[i].next = i + 1 < v.length ? n[i + 1] : null; n[i].random = rnd[i] < 0 ? null : n[rnd[i]]; } return v.length == 0 ? null : n[0]; }
  static String JN(Node h) { List<Node> ns = new ArrayList<>(); IdentityHashMap<Node, Integer> idx = new IdentityHashMap<>(); int k = 0; while (h != null && k++ < 100000) { if (ORIG.contains(h)) return "\\"returned original nodes, not a copy\\""; idx.put(h, ns.size()); ns.add(h); h = h.next; } List<String> o = new ArrayList<>(); for (Node x : ns) o.add("[" + x.val + "," + (x.random == null ? "null" : String.valueOf(idx.getOrDefault(x.random, -99))) + "]"); return "[" + String.join(",", o) + "]"; }`,
  graph: `  static Set<Node> ORIG = Collections.newSetFromMap(new IdentityHashMap<>());
  static Node G(int[][] adj) { if (adj.length == 0) return null; Node[] n = new Node[adj.length]; for (int i = 0; i < adj.length; i++) { n[i] = new Node(i + 1); ORIG.add(n[i]); } for (int i = 0; i < adj.length; i++) for (int j : adj[i]) n[i].neighbors.add(n[j - 1]); return n[0]; }
  static String JN(Node s) { if (s == null) return "[]"; TreeMap<Integer, Node> seen = new TreeMap<>(); seen.put(s.val, s); ArrayDeque<Node> q = new ArrayDeque<>(); q.add(s); while (!q.isEmpty()) for (Node nb : q.poll().neighbors) if (!seen.containsKey(nb.val)) { seen.put(nb.val, nb); q.add(nb); } for (Node x : seen.values()) if (ORIG.contains(x)) return "\\"returned original nodes, not a copy\\""; List<String> o = new ArrayList<>(); for (Node x : seen.values()) o.add(x.neighbors.stream().map(nb -> String.valueOf(nb.val)).collect(Collectors.joining(",", "[", "]"))); return "[" + String.join(",", o) + "]"; }`,
};

function javaProgram(dir, spec, body) {
  const kind = nodeKind(spec);
  return `import java.util.*;
import java.util.function.*;
import java.util.stream.*;
class ListNode { int val; ListNode next; ListNode() {} ListNode(int val) { this.val = val; } ListNode(int val, ListNode next) { this.val = val; this.next = next; } }
class TreeNode { int val; TreeNode left; TreeNode right; TreeNode() {} TreeNode(int val) { this.val = val; } TreeNode(int val, TreeNode left, TreeNode right) { this.val = val; this.left = left; this.right = right; } }
${JAVA_NODE[kind] || ""}
${fs.readFileSync(path.join(dir, "solution.java"), "utf8").replace(/^public (class|final class) /gm, "$1 ")}
public class Main {
  static ListNode L(int[] v) { ListNode d = new ListNode(), c = d; for (int x : v) { c.next = new ListNode(x); c = c.next; } return d.next; }
  static ListNode LC(int[] v, int pos) { ListNode h = L(v); if (pos < 0 || h == null) return h; ListNode t = h, at = null; for (int i = 0; ; i++) { if (i == pos) at = t; if (t.next == null) { t.next = at; break; } t = t.next; } return h; }
  static TreeNode T(int[] v, boolean[] has) { if (v.length == 0 || !has[0]) return null; TreeNode[] n = new TreeNode[v.length]; for (int i = 0; i < v.length; i++) n[i] = has[i] ? new TreeNode(v[i]) : null; ArrayDeque<TreeNode> q = new ArrayDeque<>(); q.add(n[0]); int i = 1; while (!q.isEmpty() && i < v.length) { TreeNode x = q.poll(); if (i < v.length && n[i] != null) { x.left = n[i]; q.add(n[i]); } i++; if (i < v.length && n[i] != null) { x.right = n[i]; q.add(n[i]); } i++; } return n[0]; }
  static TreeNode F(TreeNode r, int v) { if (r == null) return null; if (r.val == v) return r; TreeNode a = F(r.left, v); return a != null ? a : F(r.right, v); }
  static String JRef(TreeNode x) { return x == null ? "null" : String.valueOf(x.val); }
  static String JL(ListNode x) { return x == null ? "[]" : J(x); }
  static String JT(TreeNode x) { return x == null ? "[]" : J(x); }
${JAVA_NODE_HELPERS[kind] || ""}
  static String J(Object o) {
    if (o == null) return "null";
    if (o instanceof ListNode) { ListNode h = (ListNode) o; StringBuilder b = new StringBuilder("["); int k = 0; while (h != null && k++ < 100000) { if (b.length() > 1) b.append(","); b.append(h.val); h = h.next; } return b.append("]").toString(); }
    if (o instanceof TreeNode) { List<String> out = new ArrayList<>(); LinkedList<TreeNode> q = new LinkedList<>(); q.add((TreeNode) o); while (!q.isEmpty()) { TreeNode x = q.poll(); if (x == null) { out.add("null"); continue; } out.add(String.valueOf(x.val)); q.add(x.left); q.add(x.right); } while (!out.isEmpty() && out.get(out.size() - 1).equals("null")) out.remove(out.size() - 1); return "[" + String.join(",", out) + "]"; }
${kind ? "    if (o instanceof Node) return JN((Node) o);" : ""}
    if (o instanceof String s) return "\\"" + s.replace("\\\\", "\\\\\\\\").replace("\\"", "\\\\\\"") + "\\"";
    if (o instanceof Character ch) return "\\"" + ch + "\\"";
    if (o instanceof int[] a) return Arrays.stream(a).mapToObj(String::valueOf).collect(Collectors.joining(",", "[", "]"));
    if (o instanceof long[] a) return Arrays.stream(a).mapToObj(String::valueOf).collect(Collectors.joining(",", "[", "]"));
    if (o instanceof double[] a) return Arrays.stream(a).mapToObj(String::valueOf).collect(Collectors.joining(",", "[", "]"));
    if (o instanceof boolean[] a) { StringBuilder b = new StringBuilder("["); for (int i = 0; i < a.length; i++) { if (i > 0) b.append(","); b.append(a[i]); } return b.append("]").toString(); }
    if (o instanceof char[] a) { StringBuilder b = new StringBuilder("["); for (int i = 0; i < a.length; i++) { if (i > 0) b.append(","); b.append(J(a[i])); } return b.append("]").toString(); }
    if (o instanceof Object[] a) return Arrays.stream(a).map(Main::J).collect(Collectors.joining(",", "[", "]"));
    if (o instanceof Collection<?> c) return c.stream().map(Main::J).collect(Collectors.joining(",", "[", "]"));
    return String.valueOf(o);
  }
  public static void main(String[] args) {
    List<String> out = new ArrayList<>();
${body}
    System.out.print("[" + String.join(",", out) + "]");
  }
}
`;
}

const javaDecls = (types, vals, prefix) =>
  types.map((t, j) => `      ${javaType[t]} ${prefix}${j} = ${javaLit(t, vals[j], `${prefix}0`)};`).join("\n");
const javaWrap = (t) =>
  ({ "TreeNode-ref": "JRef", ListNode: "JL", TreeNode: "JT", Graph: "JN", RandomList: "JN" })[t] || "J";

function runJava(dir, spec) {
  let body;
  if (spec.mode === "design") {
    body = spec.cases
      .map((c, i) => {
        const steps = c.ops.map((op, k) => {
          const p = `a${i}_${k}_`;
          if (op === spec.class) {
            const ctor = spec.ctor || [];
            return `    {\n${javaDecls(ctor, c.args[k], p)}\n      o = new ${spec.class}(${ctor.map((_, j) => p + j).join(", ")}); r.add("null"); }`;
          }
          const m = spec.methods[op];
          const params = m.params || [];
          const call = `o.${op}(${params.map((_, j) => p + j).join(", ")})`;
          const ret = m.returns || "void";
          return `    {\n${javaDecls(params, c.args[k], p)}\n      ${ret === "void" ? `${call}; r.add("null");` : `r.add(${javaWrap(ret)}(${call}));`} }`;
        });
        return `    { ${spec.class} o = null; List<String> r = new ArrayList<>();\n${steps.join("\n")}\n      out.add("[" + String.join(",", r) + "]"); }`;
      })
      .join("\n");
  } else {
    body = spec.cases
      .map((c, i) => {
        const p = `a${i}_`;
        const call = `new Solution().${spec.fn}(${spec.params.map((_, j) => p + j).join(", ")})`;
        const result =
          spec.inplace != null
            ? `${call}; out.add(${javaWrap(spec.params[spec.inplace])}(${p}${spec.inplace}));`
            : `out.add(${javaWrap(spec.returns)}(${call}));`;
        return `    {\n${javaDecls(spec.params, c.in, p)}\n      ${result} }`;
      })
      .join("\n");
  }
  const jdir = path.join(WORK, "java-lc");
  fs.rmSync(jdir, { recursive: true, force: true });
  fs.mkdirSync(jdir);
  fs.writeFileSync(path.join(jdir, "Main.java"), javaProgram(dir, spec, body));
  run("javac", ["-nowarn", "-d", jdir, path.join(jdir, "Main.java")]);
  return JSON.parse(run("java", ["-Xss64m", "-cp", jdir, "Main"]));
}

// ---------- Codeforces-style (stdin/stdout) ----------
function stdioRunner(dir, lang) {
  if (lang === "python") return (input) => run("python3", [path.join(dir, "solution.py")], { input });
  if (lang === "javascript") return (input) => run("node", [path.join(dir, "solution.js")], { input });
  if (lang === "cpp") {
    const bin = path.join(WORK, "cf");
    run("g++", ["-std=c++17", "-O2", "-I", SHIM, "-o", bin, path.join(dir, "solution.cpp")]);
    return (input) => run(bin, [], { input });
  }
  const jdir = path.join(WORK, "java-cf");
  fs.rmSync(jdir, { recursive: true, force: true });
  fs.mkdirSync(jdir);
  fs.copyFileSync(path.join(dir, "solution.java"), path.join(jdir, "Main.java"));
  run("javac", ["-d", jdir, path.join(jdir, "Main.java")]);
  return (input) => run("java", ["-cp", jdir, "Main"], { input });
}

// ---------- main ----------
const LANGS = { python: runPython, javascript: runJs, cpp: runCpp, java: runJava };
const EXT = { python: "py", javascript: "js", cpp: "cpp", java: "java" };
const only = process.argv.slice(2);
const slugs = fs
  .readdirSync(PROBLEMS_DIR)
  .filter((s) => fs.statSync(path.join(PROBLEMS_DIR, s)).isDirectory())
  .filter((s) => !only.length || only.includes(s))
  .sort();
let failures = 0;

for (const slug of slugs) {
  const dir = path.join(PROBLEMS_DIR, slug);
  const specFile = path.join(dir, "tests.json");
  if (!fs.existsSync(specFile)) {
    console.log(`⚠️  ${slug}: no tests.json`);
    failures++;
    continue;
  }
  const spec = JSON.parse(fs.readFileSync(specFile, "utf8"));
  const checkFile = path.join(dir, "check.mjs");
  const check = fs.existsSync(checkFile) ? (await import(pathToFileURL(checkFile).href)).default : null;
  const results = [];
  for (const lang of Object.keys(LANGS)) {
    if (!fs.existsSync(path.join(dir, `solution.${EXT[lang]}`))) {
      results.push(`${lang}: missing`);
      failures++;
      continue;
    }
    try {
      const bad = [];
      if (spec.mode === "stdio") {
        const exec = stdioRunner(dir, lang);
        spec.cases.forEach((c, i) => {
          const got = exec(c.in);
          if (tokens(got) !== tokens(c.out)) bad.push(`#${i + 1} expected "${tokens(c.out)}" got "${tokens(got)}"`);
        });
      } else {
        const got = LANGS[lang](dir, spec);
        spec.cases.forEach((c, i) => {
          const input = spec.mode === "design" ? c.args : c.in;
          const ok = check ? check(input, got[i], c.out) : same(got[i], c.out, spec.compare);
          if (!ok) bad.push(`#${i + 1} expected ${JSON.stringify(c.out)} got ${JSON.stringify(got[i])}`);
        });
      }
      if (bad.length) {
        failures++;
        results.push(`${lang}: FAIL ${bad.join("; ").slice(0, 600)}`);
      } else results.push(`${lang} ✓`);
    } catch (err) {
      failures++;
      results.push(`${lang}: ERROR ${(err.stderr || err.message).toString().split("\n").slice(0, 8).join(" | ")}`);
    }
  }
  const ok = results.every((r) => r.endsWith("✓"));
  console.log(`${ok ? "✅" : "❌"} ${slug} (${spec.cases.length} cases) — ${results.join(", ")}`);
}

fs.rmSync(WORK, { recursive: true, force: true });
console.log(failures ? `\n${failures} failure(s)` : `\nAll ${slugs.length} problem(s) pass in every language.`);
process.exit(failures ? 1 : 0);

class Solution:
    def buildTree(self, preorder: List[int], inorder: List[int]) -> Optional[TreeNode]:
        # Values are unique, so each value has exactly one position in inorder.
        index_in_inorder = {val: i for i, val in enumerate(inorder)}
        next_root = 0  # preorder lists roots first, so we consume it left to right

        def build(lo: int, hi: int) -> Optional[TreeNode]:
            # Builds the subtree whose values are exactly inorder[lo..hi].
            nonlocal next_root
            if lo > hi:
                return None
            root_val = preorder[next_root]
            next_root += 1
            root = TreeNode(root_val)
            mid = index_in_inorder[root_val]
            # Preorder is root, then the WHOLE left subtree, then the right.
            # So the left subtree must be built first, or we'd take the wrong roots.
            root.left = build(lo, mid - 1)
            root.right = build(mid + 1, hi)
            return root

        return build(0, len(inorder) - 1)

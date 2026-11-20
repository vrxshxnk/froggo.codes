class Solution {
    public List<Integer> rightSideView(TreeNode root) {
        List<Integer> result = new ArrayList<>();
        if (root == null) return result;

        Queue<TreeNode> queue = new ArrayDeque<>();
        queue.offer(root);
        while (!queue.isEmpty()) {
            int size = queue.size(); // exactly one level is in the queue right now
            for (int i = 0; i < size; i++) {
                TreeNode node = queue.poll();
                // Left children are queued before right ones, so the last
                // node of a level is the rightmost one: the one you can see.
                if (i == size - 1) result.add(node.val);
                if (node.left != null) queue.offer(node.left);
                if (node.right != null) queue.offer(node.right);
            }
        }

        return result;
    }
}

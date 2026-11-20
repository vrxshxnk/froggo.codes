class Solution:
    def superEggDrop(self, k: int, n: int) -> int:
        # Flip the question: with `moves` drops and e eggs, how many floors can we
        # fully decide? Call it covered[e]. Find the first `moves` where covered[k] >= n.
        covered = [0] * (k + 1)
        moves = 0
        while covered[k] < n:
            moves += 1
            # Go from high e to low so covered[e - 1] is still last move's value.
            for e in range(k, 0, -1):
                # Drop from the right floor: if it breaks we can still cover
                # covered[e-1] floors below; if not, covered[e] floors above; +1 for this floor.
                covered[e] = covered[e - 1] + covered[e] + 1
        return moves

class Solution:
    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:
        candidates.sort()  # sorted, so we can stop a loop the moment a number is too big
        result = []
        path = []

        def backtrack(start: int, remaining: int) -> None:
            if remaining == 0:
                result.append(path[:])  # copy: path keeps changing after this
                return
            for i in range(start, len(candidates)):
                c = candidates[i]
                if c > remaining:
                    break               # every later candidate is even bigger
                path.append(c)          # choose
                backtrack(i, remaining - c)  # explore: i, not i + 1, so c can be reused
                path.pop()              # un-choose

        backtrack(0, target)
        return result

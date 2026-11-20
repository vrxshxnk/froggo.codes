class Solution:
    def twoSum(self, numbers: List[int], target: int) -> List[int]:
        left, right = 0, len(numbers) - 1

        while left < right:
            total = numbers[left] + numbers[right]
            if total == target:
                return [left + 1, right + 1]  # the answer is 1-indexed
            if total < target:
                # numbers[left] is too small even with the biggest partner left,
                # so it can't be in any answer: drop it
                left += 1
            else:
                # numbers[right] is too big even with the smallest partner left
                right -= 1

        return []  # the problem guarantees an answer, so we never get here

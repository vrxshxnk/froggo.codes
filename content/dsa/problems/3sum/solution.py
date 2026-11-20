class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        nums.sort()  # sorting lets two pointers work and puts duplicates side by side
        n = len(nums)
        result = []

        for i in range(n - 2):
            if nums[i] > 0:
                break  # the smallest of the three is positive: no sum can be 0
            if i > 0 and nums[i] == nums[i - 1]:
                continue  # same first number as last time: same triplets again

            # Two Sum II on the part to the right of i, looking for -nums[i]
            left, right = i + 1, n - 1
            while left < right:
                total = nums[i] + nums[left] + nums[right]
                if total < 0:
                    left += 1
                elif total > 0:
                    right -= 1
                else:
                    result.append([nums[i], nums[left], nums[right]])
                    left += 1
                    right -= 1
                    # skip copies of the middle number so this triplet isn't added twice
                    while left < right and nums[left] == nums[left - 1]:
                        left += 1

        return result

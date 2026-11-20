class Solution:
    def leastInterval(self, tasks: List[str], n: int) -> int:
        count = [0] * 26
        for t in tasks:
            count[ord(t) - ord("A")] += 1

        max_count = max(count)                        # the busiest task sets the skeleton
        num_max = sum(1 for c in count if c == max_count)  # tasks tied for busiest share the last row

        # (max_count - 1) full rows of width n + 1, then one last row holding the tied tasks.
        frame = (max_count - 1) * (n + 1) + num_max
        # If there are more tasks than slots, no idling is ever needed.
        return max(frame, len(tasks))

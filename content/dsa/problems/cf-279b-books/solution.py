import sys


def main():
    data = sys.stdin.buffer.read().split()
    n, t = int(data[0]), int(data[1])
    a = list(map(int, data[2:2 + n]))

    left = 0
    window_sum = 0  # minutes needed for books left..right
    best = 0

    for right in range(n):
        window_sum += a[right]

        # Too long to read in t minutes: give up the earliest book until it fits.
        # Every a[i] is positive, so dropping one always shortens the reading time.
        while window_sum > t:
            window_sum -= a[left]
            left += 1

        best = max(best, right - left + 1)  # can be 0 when one book alone is too long

    print(best)


main()

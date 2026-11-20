import sys
from collections import defaultdict


def main():
    data = sys.stdin.buffer.read().split()
    t = int(data[0])
    pos = 1
    out = []

    for _ in range(t):
        n = int(data[pos]); pos += 1
        count = defaultdict(int)       # key -> how many earlier positions had it
        answer = 0

        for k in range(n):
            key = int(data[pos + k]) - k   # a[j] - j == a[i] - i
            answer += count[key]           # pair with every earlier equal key
            count[key] += 1

        pos += n
        out.append(str(answer))

    print("\n".join(out))


main()

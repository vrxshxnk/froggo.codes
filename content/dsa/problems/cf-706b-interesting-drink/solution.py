import sys


def main():
    data = sys.stdin.buffer.read().split()
    n = int(data[0])
    price = sorted(int(x) for x in data[1:1 + n])
    q = int(data[1 + n])
    out = []

    for j in range(q):
        m = int(data[2 + n + j])
        # First index with price > m (the upper bound). Every shop before it is
        # affordable, so that index IS the count. It always stays in [lo, hi].
        lo, hi = 0, n
        while lo < hi:
            mid = lo + (hi - lo) // 2
            if price[mid] > m:     # ">" not ">=": a price equal to m is affordable
                hi = mid
            else:
                lo = mid + 1
        out.append(str(lo))

    print("\n".join(out))


main()

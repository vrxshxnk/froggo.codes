import sys


def main():
    data = sys.stdin.buffer.read().split()
    n = int(data[0])
    c = [0] * 5  # c[s] = number of groups of size s
    for s in data[1:1 + n]:
        c[int(s)] += 1

    taxis = c[4]                 # a group of 4 fills a taxi alone

    taxis += c[3]                # each 3 needs its own taxi...
    ones = max(0, c[1] - c[3])   # ...and the one free seat is best given to a 1

    taxis += c[2] // 2           # two 2s fill a taxi exactly
    if c[2] % 2 == 1:
        taxis += 1               # a leftover 2 rides with up to two 1s
        ones = max(0, ones - 2)

    taxis += (ones + 3) // 4     # remaining 1s, four per taxi (ceiling division)
    print(taxis)


main()

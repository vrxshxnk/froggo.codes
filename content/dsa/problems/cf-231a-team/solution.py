import sys


def main():
    data = list(map(int, sys.stdin.read().split()))  # all numbers, ignoring line breaks
    n = data[0]
    solved = 0

    for i in range(n):
        a, b, c = data[1 + 3 * i], data[2 + 3 * i], data[3 + 3 * i]
        if a + b + c >= 2:  # values are 0/1, so the sum counts who is sure
            solved += 1

    print(solved)


main()

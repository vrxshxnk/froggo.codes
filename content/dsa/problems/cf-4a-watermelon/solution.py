import sys


def main():
    w = int(sys.stdin.readline())  # input arrives as text: convert it to a number

    # Even + even is always even, and the smallest split is 2 + 2,
    # so w must be even AND bigger than 2
    if w % 2 == 0 and w > 2:
        print("YES")
    else:
        print("NO")


main()

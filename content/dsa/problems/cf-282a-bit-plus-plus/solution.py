import sys


def main():
    data = sys.stdin.read().split()  # ["2", "X++", "--X"]
    n = int(data[0])
    x = 0

    for s in data[1:n + 1]:
        # In ++X, X++, --X and X-- the middle character is always the operator's
        if s[1] == "+":
            x += 1
        else:
            x -= 1

    print(x)


main()

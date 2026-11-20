import sys


def main():
    data = sys.stdin.read().split()  # every word and number, as a list of strings
    n = int(data[0])
    out = []

    for word in data[1:n + 1]:
        if len(word) > 10:  # "too long" means 11 letters or more
            # first letter + how many letters sit between the ends + last letter
            out.append(word[0] + str(len(word) - 2) + word[-1])
        else:
            out.append(word)

    print("\n".join(out))  # one print at the end is faster than n small prints


main()

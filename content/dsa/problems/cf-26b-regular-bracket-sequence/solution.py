import sys


def main():
    s = sys.stdin.readline().strip()
    open_count = 0  # '(' kept so far that are still waiting for a ')'
    matched = 0     # length of the regular sequence we keep

    for c in s:
        if c == "(":
            open_count += 1
        elif open_count > 0:
            # pair this ')' with any waiting '(' and keep both
            open_count -= 1
            matched += 2
        # else: a ')' with nothing to close can never be part of the answer, drop it

    # the leftover open_count brackets are never closed, so they are dropped too
    print(matched)


main()

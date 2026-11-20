#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    string s;
    cin >> s;
    int openCount = 0;  // '(' kept so far that are still waiting for a ')'
    int matched = 0;    // length of the regular sequence we keep

    for (char c : s) {
        if (c == '(') {
            openCount++;
        } else if (openCount > 0) {
            // pair this ')' with any waiting '(' and keep both
            openCount--;
            matched += 2;
        }
        // else: a ')' with nothing to close can never be part of the answer, drop it
    }

    // the leftover openCount brackets are never closed, so they are dropped too
    cout << matched << '\n';
    return 0;
}

#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    cin >> n;
    int x = 0;

    for (int i = 0; i < n; i++) {
        string s;
        cin >> s;
        // In ++X, X++, --X and X-- the middle character is always the operator's
        if (s[1] == '+') {   // a char, so single quotes
            x++;
        } else {
            x--;
        }
    }

    cout << x << '\n';
    return 0;
}

#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);  // fast I/O: a good habit on Codeforces
    cin.tie(nullptr);

    int w;
    cin >> w;

    // Even + even is always even, and the smallest split is 2 + 2,
    // so w must be even AND bigger than 2
    if (w % 2 == 0 && w > 2) {
        cout << "YES" << '\n';
    } else {
        cout << "NO" << '\n';
    }
    return 0;
}

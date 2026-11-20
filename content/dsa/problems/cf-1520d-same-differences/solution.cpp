#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int t;
    cin >> t;
    while (t--) {
        int n;
        cin >> n;

        // key = a[k] - k lies in [-n, n], so an array offset by n beats a hash map
        vector<long long> count(2 * n + 2, 0);
        long long answer = 0;                  // can reach ~2e10: needs 64 bits

        for (int k = 1; k <= n; k++) {
            int a;
            cin >> a;
            int key = a - k + n;               // shift so the index is never negative
            answer += count[key];              // pair with every earlier equal key
            count[key]++;
        }

        cout << answer << '\n';
    }
    return 0;
}

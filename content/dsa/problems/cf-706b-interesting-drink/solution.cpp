#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    cin >> n;
    vector<int> price(n);
    for (int& x : price) cin >> x;
    sort(price.begin(), price.end());

    int q;
    cin >> q;
    string out;
    while (q--) {
        int m;  // up to 1e9, still fits in int
        cin >> m;
        // First index with price > m (the upper bound). Every shop before it is
        // affordable, so that index IS the count. It always stays in [lo, hi].
        int lo = 0, hi = n;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (price[mid] > m) {  // ">" not ">=": a price equal to m is affordable
                hi = mid;
            } else {
                lo = mid + 1;
            }
        }
        out += to_string(lo);
        out += '\n';
    }
    cout << out;
    return 0;
}

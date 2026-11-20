#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    long long t;
    cin >> n >> t;
    vector<int> a(n);
    for (int& x : a) cin >> x;

    int left = 0;
    long long windowSum = 0;  // minutes needed for books left..right (up to 10^9)
    int best = 0;

    for (int right = 0; right < n; right++) {
        windowSum += a[right];

        // Too long to read in t minutes: give up the earliest book until it fits.
        // Every a[i] is positive, so dropping one always shortens the reading time.
        while (windowSum > t) {
            windowSum -= a[left];
            left++;
        }

        best = max(best, right - left + 1);  // can be 0 when one book alone is too long
    }

    cout << best << '\n';
    return 0;
}

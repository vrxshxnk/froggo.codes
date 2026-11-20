#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    cin >> n;
    int c[5] = {0};  // c[s] = number of groups of size s
    for (int i = 0; i < n; i++) {
        int s;
        cin >> s;
        c[s]++;
    }

    int taxis = c[4];                 // a group of 4 fills a taxi alone

    taxis += c[3];                    // each 3 needs its own taxi...
    int ones = max(0, c[1] - c[3]);   // ...and the one free seat is best given to a 1

    taxis += c[2] / 2;                // two 2s fill a taxi exactly
    if (c[2] % 2 == 1) {
        taxis += 1;                   // a leftover 2 rides with up to two 1s
        ones = max(0, ones - 2);
    }

    taxis += (ones + 3) / 4;          // remaining 1s, four per taxi (ceiling division)
    cout << taxis << '\n';
    return 0;
}

#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    cin >> n;
    int solved = 0;

    for (int i = 0; i < n; i++) {
        int a, b, c;
        cin >> a >> b >> c;
        if (a + b + c >= 2) {  // values are 0/1, so the sum counts who is sure
            solved++;
        }
    }

    cout << solved << '\n';
    return 0;
}

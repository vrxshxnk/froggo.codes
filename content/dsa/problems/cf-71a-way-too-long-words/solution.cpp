#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    cin >> n;

    for (int i = 0; i < n; i++) {
        string word;
        cin >> word;

        if (word.size() > 10) {  // "too long" means 11 letters or more
            // first letter + how many letters sit between the ends + last letter.
            // Print the pieces one by one: word[0] + number would add character codes.
            cout << word[0] << word.size() - 2 << word.back() << '\n';
        } else {
            cout << word << '\n';
        }
    }
    return 0;
}

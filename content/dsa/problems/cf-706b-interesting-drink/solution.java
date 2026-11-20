import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        DataInputStream in = new DataInputStream(new BufferedInputStream(System.in, 1 << 16));
        StringBuilder out = new StringBuilder();

        int n = nextInt(in);
        int[] price = new int[n];
        for (int i = 0; i < n; i++) price[i] = nextInt(in);

        // Arrays.sort(int[]) is a quicksort that crafted tests can push to O(n^2);
        // a random shuffle first makes that practically impossible.
        Random rnd = new Random();
        for (int i = n - 1; i > 0; i--) {
            int j = rnd.nextInt(i + 1);
            int tmp = price[i]; price[i] = price[j]; price[j] = tmp;
        }
        Arrays.sort(price);

        int q = nextInt(in);
        while (q-- > 0) {
            int m = nextInt(in); // up to 1e9, still fits in int
            // First index with price > m (the upper bound). Every shop before it is
            // affordable, so that index IS the count. It always stays in [lo, hi].
            int lo = 0, hi = n;
            while (lo < hi) {
                int mid = lo + (hi - lo) / 2;
                if (price[mid] > m) { // ">" not ">=": a price equal to m is affordable
                    hi = mid;
                } else {
                    lo = mid + 1;
                }
            }
            out.append(lo).append('\n');
        }
        System.out.print(out);
    }

    // Fast integer reader: Scanner is too slow for 2*10^5 numbers
    private static int nextInt(DataInputStream in) throws IOException {
        int ret = 0, b = in.read();
        while (b != '-' && (b < '0' || b > '9')) b = in.read();
        boolean neg = b == '-';
        if (neg) b = in.read();
        while (b >= '0' && b <= '9') {
            ret = ret * 10 + (b - '0');
            b = in.read();
        }
        return neg ? -ret : ret;
    }
}

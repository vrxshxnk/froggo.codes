import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        DataInputStream in = new DataInputStream(new BufferedInputStream(System.in, 1 << 16));
        StringBuilder out = new StringBuilder();

        int t = nextInt(in);
        while (t-- > 0) {
            int n = nextInt(in);

            // key = a[k] - k lies in [-n, n], so an array offset by n is enough
            long[] count = new long[2 * n + 2];
            long answer = 0; // can reach ~2e10: needs 64 bits

            for (int k = 1; k <= n; k++) {
                int key = nextInt(in) - k + n; // shift so the index is never negative
                answer += count[key];          // pair with every earlier equal key
                count[key]++;
            }
            out.append(answer).append('\n');
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

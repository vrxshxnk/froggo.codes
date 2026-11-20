import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        StreamTokenizer in = new StreamTokenizer(new BufferedReader(new InputStreamReader(System.in)));
        in.nextToken();
        int n = (int) in.nval;
        in.nextToken();
        long t = (long) in.nval;
        int[] a = new int[n];
        for (int i = 0; i < n; i++) {
            in.nextToken();
            a[i] = (int) in.nval;
        }

        int left = 0;
        long windowSum = 0; // minutes needed for books left..right (up to 10^9)
        int best = 0;

        for (int right = 0; right < n; right++) {
            windowSum += a[right];

            // Too long to read in t minutes: give up the earliest book until it fits.
            // Every a[i] is positive, so dropping one always shortens the reading time.
            while (windowSum > t) {
                windowSum -= a[left];
                left++;
            }

            best = Math.max(best, right - left + 1); // can be 0 when one book alone is too long
        }

        System.out.println(best);
    }
}

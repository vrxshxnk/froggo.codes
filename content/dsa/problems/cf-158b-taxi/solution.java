import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        // StreamTokenizer: Scanner is too slow for 10^5 numbers
        StreamTokenizer in = new StreamTokenizer(new BufferedReader(new InputStreamReader(System.in)));
        in.nextToken();
        int n = (int) in.nval;
        int[] c = new int[5]; // c[s] = number of groups of size s
        for (int i = 0; i < n; i++) {
            in.nextToken();
            c[(int) in.nval]++;
        }

        int taxis = c[4];                    // a group of 4 fills a taxi alone

        taxis += c[3];                       // each 3 needs its own taxi...
        int ones = Math.max(0, c[1] - c[3]); // ...and the one free seat is best given to a 1

        taxis += c[2] / 2;                   // two 2s fill a taxi exactly
        if (c[2] % 2 == 1) {
            taxis += 1;                      // a leftover 2 rides with up to two 1s
            ones = Math.max(0, ones - 2);
        }

        taxis += (ones + 3) / 4;             // remaining 1s, four per taxi (ceiling division)
        System.out.println(taxis);
    }
}

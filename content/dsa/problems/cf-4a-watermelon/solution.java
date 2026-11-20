import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int w = Integer.parseInt(in.readLine().trim()); // input arrives as text: convert it

        // Even + even is always even, and the smallest split is 2 + 2,
        // so w must be even AND bigger than 2
        if (w % 2 == 0 && w > 2) {
            System.out.println("YES");
        } else {
            System.out.println("NO");
        }
    }
}

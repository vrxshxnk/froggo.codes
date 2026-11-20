import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        int solved = 0;

        for (int i = 0; i < n; i++) {
            StringTokenizer st = new StringTokenizer(in.readLine()); // one problem per line
            int a = Integer.parseInt(st.nextToken());
            int b = Integer.parseInt(st.nextToken());
            int c = Integer.parseInt(st.nextToken());
            if (a + b + c >= 2) { // values are 0/1, so the sum counts who is sure
                solved++;
            }
        }

        System.out.println(solved);
    }
}

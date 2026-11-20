import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        int x = 0;

        for (int i = 0; i < n; i++) {
            String s = in.readLine().trim(); // trim drops a stray '\r' from Windows line endings
            // In ++X, X++, --X and X-- the middle character is always the operator's
            if (s.charAt(1) == '+') {        // a char, so == is safe (unlike String ==)
                x++;
            } else {
                x--;
            }
        }

        System.out.println(x);
    }
}

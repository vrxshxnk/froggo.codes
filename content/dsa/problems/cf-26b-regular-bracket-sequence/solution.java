import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        // the line can be 10^6 characters: read it in one go, Scanner would be slow
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in), 1 << 16);
        String s = in.readLine().trim();
        int openCount = 0; // '(' kept so far that are still waiting for a ')'
        int matched = 0;   // length of the regular sequence we keep

        for (int i = 0; i < s.length(); i++) {
            if (s.charAt(i) == '(') {
                openCount++;
            } else if (openCount > 0) {
                // pair this ')' with any waiting '(' and keep both
                openCount--;
                matched += 2;
            }
            // else: a ')' with nothing to close can never be part of the answer, drop it
        }

        // the leftover openCount brackets are never closed, so they are dropped too
        System.out.println(matched);
    }
}

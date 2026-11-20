import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(in.readLine().trim());
        StringBuilder out = new StringBuilder(); // print once at the end: much faster

        for (int i = 0; i < n; i++) {
            String word = in.readLine().trim();  // one word per line

            if (word.length() > 10) {            // "too long" means 11 letters or more
                // first letter + how many letters sit between the ends + last letter.
                // Appending one piece at a time avoids char + int arithmetic.
                out.append(word.charAt(0))
                   .append(word.length() - 2)
                   .append(word.charAt(word.length() - 1));
            } else {
                out.append(word);
            }
            out.append('\n');
        }

        System.out.print(out);
    }
}

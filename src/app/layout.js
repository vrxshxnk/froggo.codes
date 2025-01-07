import localFont from "next/font/local";
import "./globals.css";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Python BootCamp",
  description: "Best way to learn Python. Learn to code in 30 days.",
};

export default async function RootLayout({ children }) {
  const supabase = createServerComponentClient({ cookies });

  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

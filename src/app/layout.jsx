import { AuthProvider } from "@/context/AuthContext";
import Script from "next/script";
import localFont from "next/font/local";
import "./globals.css";

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
  metadataBase: new URL("https://your-domain.com"), // Replace with your domain
  title: {
    template: "%s | Coding BootCamp",
    default: "Coding BootCamp",
  },
  description: "Best way to learn how to code. Learn to code in 30 days.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

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

const description =
  "Free 90-day DSA roadmap and 6 real projects, one step a day. Track your streak and get interview ready with FroggoCodes.";

export const metadata = {
  metadataBase: new URL("https://www.froggo.codes"),
  title: {
    default: "FroggoCodes — Free DSA & Development Roadmaps",
    template: "%s",
  },
  description,
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    siteName: "FroggoCodes",
    title: "FroggoCodes — Free DSA & Development Roadmaps",
    description,
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@froggocodes",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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

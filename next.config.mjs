// Every third party the browser talks to: Firebase Auth (Google sign-in
// popup) and Analytics, Razorpay and Paddle checkout, Bunny Stream embeds,
// and the location lookup used for INR vs USD pricing.
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://cdn.paddle.com https://apis.google.com https://www.googletagmanager.com https://assets.mediadelivery.net",
  "style-src 'self' 'unsafe-inline' https://cdn.paddle.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://api.razorpay.com https://lumberjack.razorpay.com https://*.paddle.com https://cloudflare.com https://ip-api.com https://*.mediadelivery.net",
  "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://api.razorpay.com https://checkout.razorpay.com https://*.paddle.com https://iframe.mediadelivery.net",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(self \"https://checkout.razorpay.com\" \"https://api.razorpay.com\" \"https://buy.paddle.com\")",
  },
  // Enforced. Ran report-only first: page loads, the Google sign-in frame,
  // Razorpay and Paddle checkout, Bunny embeds and the location lookups raised
  // no violations. Adding a third party? Add its hosts above or it will break.
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  output: "standalone",
  experimental: {
    // Optional: Only needed for older Next.js versions
    // appDir: true,
  },
  // Tell Next.js where to find your app directory
  distDir: ".next",
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  },
  pageExtensions: ["js", "jsx", "ts", "tsx"],
};

export default nextConfig;

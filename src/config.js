const config = {
  // REQUIRED
  appName: "FroggoCodes",
  // REQUIRED: a short description of your app for SEO tags (can be overwritten)
  appDescription:
    "Join FroggoCodes, the ultimate 30-day in-depth bootcamp designed to take you from zero to job-ready! Learn coding essentials and advanced skills with a focus on practical, real-world projects that prepare you to excel as a junior software engineer. Start your journey to a professional tech career today!",
  // REQUIRED (no https://, not trialing slash at the end, just the naked domain)
  domainName: "froggo.codes",

  // Featured course configuration
  featuredCourseId: "zero-to-hero", // Course to display on main pricing page

  // Bunny.net video streaming configuration
  bunny: {
    // Your Bunny.net library ID for video streaming
    libraryId: process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID || "your-library-id",
    // Base URL for Bunny.net iframe embeds
    embedBaseUrl: "https://iframe.mediadelivery.net/embed",
    // Player.js library URL hosted on Bunny.net CDN
    playerJsUrl: "//assets.mediadelivery.net/playerjs/player-0.1.0.min.js",
    // Bunny video GUID of the public course intro video shown on the landing
    // page. Signed like any other video but viewable without sign-in.
    introVideoId: process.env.NEXT_PUBLIC_BUNNY_INTRO_VIDEO_ID || "",
  },

  // Paddle Billing — merchant of record for international customers
  // (Razorpay stays for INR). Courses opt in via a paddle_price_id field.
  paddle: {
    clientToken: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || "",
    // "sandbox" or "production"
    environment: process.env.NEXT_PUBLIC_PADDLE_ENV || "production",
  },

  // Resend — transactional email (receipts, welcome emails).
  // Requires RESEND_API_KEY in the environment and a verified sending domain.
  resend: {
    // Email 'From' field. The domain must be verified in Resend.
    from: "FroggoCodes <noreply@froggo.codes>",
    // Replies to transactional emails land here
    supportEmail: "vrxshxnk@gmail.com",
  },
  //   crisp: {
  //     // Crisp website ID. IF YOU DON'T USE CRISP: just remove this => Then add a support email in this config file (mailgun.supportEmail) otherwise customer support won't work.
  //     id: "",
  //     // Hide Crisp by default, except on route "/". Crisp is toggled with <ButtonSupport/>. If you want to show Crisp on every routes, just remove this below
  //     onlyShowOnRoutes: ["/"],
  //   },
  //   stripe: {
  //     // Create multiple plans in your Stripe dashboard, then add them here. You can add as many plans as you want, just make sure to add the priceId
  //     plans: [
  //       {
  //         // REQUIRED — we use this to find the plan in the webhook (for instance if you want to update the user's credits based on the plan)
  //         priceId:
  //           process.env.NODE_ENV === "development"
  //             ? "price_1Niyy5AxyNprDp7iZIqEyD2h"
  //             : "price_456",
  //         //  REQUIRED - Name of the plan, displayed on the pricing page
  //         name: "Argo",
  //         // A friendly description of the plan, displayed on the pricing page. Tip: explain why this plan and not others
  //         description: "For small projects",
  //         // The price you want to display, the one user will be charged on Stripe.
  //         price: 99,
  //         // If you have an anchor price (i.e. $29) that you want to display crossed out, put it here. Otherwise, leave it empty
  //         priceAnchor: 119,
  //         features: [
  //           {
  //             name: "MinuteShip Boilerplate",
  //           },
  //           { name: "Authentication" },
  //           { name: "Database" },
  //           { name: "Emails" },
  //           { name: "Themes" },
  //           { name: "Payments" },
  //         ],
  //       },
  //       {
  //         priceId:
  //           process.env.NODE_ENV === "development"
  //             ? "price_1Nk4AbAxyNprDp7iXEPBvXju"
  //             : "price_456",
  //         // This plan will look different on the pricing page, it will be highlighted. You can only have one plan with isFeatured: true
  //         isFeatured: true,
  //         name: "Argo+",
  //         description: "For not-so-small projects",
  //         price: 119,
  //         priceAnchor: 199,
  //         features: [
  //           { name: "Everything in Argo" },
  //           { name: "+ Blog" },
  //           { name: "+ 1 year of updates" },
  //           { name: "+ Fresh components" },
  //           { name: "+ New technologies" },
  //           { name: "+ All new themes" },
  //           { name: "+ Every new innovation" },
  //         ],
  //       },
  //     ],
  //   },
  //   aws: {
  //     // If you use AWS S3/Cloudfront, put values in here
  //     bucket: "bucket-name",
  //     bucketUrl: `https://bucket-name.s3.amazonaws.com/`,
  //     cdn: "https://cdn-id.cloudfront.net/",
  //   },
  //   colors: {
  //     // REQUIRED — The DaisyUI theme to use (added to the main layout.js). Leave blank for default (light & dark mode). If you any other theme than light/dark, you need to add it in config.tailwind.js in daisyui.themes.
  //     theme: "light",
  //     // REQUIRED — This color will be reflected on the whole app outside of the document (loading bar, Chrome tabs, etc..). By default it takes the primary color from your DaisyUI theme (make sure to update your the theme name after "data-theme=")
  //     // OR you can just do this to use a custom color: main: "#f37055". HEX only.
  //     main: themes[`[data-theme=light]`]["white"],
  //   },
  //   auth: {
  //     // REQUIRED — the path to log in users. It's use to protect private routes (like /dashboard). It's used in apiClient (/libs/api.js) upon 401 errors from our API
  //     loginUrl: "/api/auth/signin",
  //     // REQUIRED — the path you want to redirect users after successfull login (i.e. /dashboard, /private). This is normally a private page for users to manage their accounts. It's used in apiClient (/libs/api.js) upon 401 errors from our API & in ButtonSignin.js
  //     callbackUrl: "/dashboard",
  //   },
};

export default config;

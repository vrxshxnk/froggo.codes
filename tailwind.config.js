/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        shine: "shine 1s ease-in-out forwards",
        "fade-in": "fadeIn 0.5s ease-in-out forwards",
        "fade-in-up": "fadeInUp 0.5s ease-in-out forwards",
        "fade-in-delayed": "fadeIn 0.5s ease-in-out 0.2s forwards",
        "fade-in-delayed-more": "fadeIn 0.5s ease-in-out 0.4s forwards",
        "fade-in-delayed-most": "fadeIn 0.5s ease-in-out 0.6s forwards",
        "bounce-left-right": "bounceLeftRight 8s ease-in-out infinite",
        "bounce-right-left": "bounceRightLeft 7s ease-in-out infinite 1s",
      },
      keyframes: {
        shine: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        bounceLeftRight: {
          "0%": { transform: "translate(0, 0)" },
          "25%": { transform: "translate(100px, -150px)" },
          "50%": { transform: "translate(200px, -50px)" },
          "75%": { transform: "translate(100px, -200px)" },
          "100%": { transform: "translate(0, 0)" },
        },
        bounceRightLeft: {
          "0%": { transform: "translate(0, 0)" },
          "25%": { transform: "translate(-120px, -180px)" },
          "50%": { transform: "translate(-220px, -60px)" },
          "75%": { transform: "translate(-100px, -220px)" },
          "100%": { transform: "translate(0, 0)" },
        },
      },
    },
  },
  plugins: [],
};

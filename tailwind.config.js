/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "K2D-Regular",
          "K2D-Medium",
          "K2D-Bold",
          "K2D-Italic",
          "K2D-MediumItalic",
          "K2D-BoldItalic",
        ],
      },
      fontSize: {
        // Heading
        h1: ["48px", { lineHeight: "1.5" }],
        h2: ["40px", { lineHeight: "1.5" }],
        h3: ["33px", { lineHeight: "1.5" }],
        h4: ["28px", { lineHeight: "1.5" }],
        h5: ["23px", { lineHeight: "1.5" }],
        h6: ["19px", { lineHeight: "1.5" }],

        // Body Text
        body: ["16px", { lineHeight: "1.5" }],
        small: ["13px", { lineHeight: "1.5" }],
        tiny: ["11px", { lineHeight: "1.5" }],
      },
      colors: {
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        background: "rgb(var(--color-background) / <alpha-value>)",
        text: "rgb(var(--color-text) / <alpha-value>)",
        card: "rgb(var(--color-card) / <alpha-value>)",

        success: "rgb(var(--color-success) / <alpha-value>)",
        alert: "rgb(var(--color-alert) / <alpha-value>)",
        disabletext: "rgb(var(--color-disabletext) / <alpha-value>)",
        disablebg: "rgb(var(--color-disablebg) / <alpha-value>)",
      },
      boxShadow: {
        custom: "0px 0px 5px 0px rgb(var(--shadow-color) / 0.5)",
      },
    },
  },
  plugins: [],
};

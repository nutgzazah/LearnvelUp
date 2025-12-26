/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--color-primary))",
        secondary: "rgb(var(--color-secondary))",
        background: "rgb(var(--color-background))",
        text: "rgb(var(--color-text))",
        card: "rgb(var(--color-card))",
      },
      boxShadow: {
        custom: "0px 0px 5px 0px rgb(var(--shadow-color) / 0.5)",
      },
    },
  },
  plugins: [],
};

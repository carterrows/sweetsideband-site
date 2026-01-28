/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#f4f1de",
        haze: "#efe6d4",
        mist: "#e4d7c1",
        ink: {
          900: "#262322",
          800: "#3b3634",
          700: "#5b534f",
          600: "#6f6561"
        },
        accent: "#ee6c4d"
      },
      boxShadow: {
        glow: "0 10px 30px rgba(238, 108, 77, 0.25)"
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

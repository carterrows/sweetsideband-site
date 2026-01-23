/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: {
          900: "#0b0c10",
          800: "#12141b",
          700: "#1a1f2a",
          600: "#232a3a"
        },
        accent: "#c6ff1a"
      },
      boxShadow: {
        glow: "0 0 25px rgba(198, 255, 26, 0.35)"
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

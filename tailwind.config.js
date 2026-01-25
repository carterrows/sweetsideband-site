/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#fffff7",
        haze: "#f5f5f7",
        mist: "#e6e8ee",
        ink: {
          900: "#0b0c10",
          800: "#1a1f2a",
          700: "#2d3340",
          600: "#4b5563"
        },
        accent: "#ca0012"
      },
      boxShadow: {
        glow: "0 10px 30px rgba(202, 0, 18, 0.25)"
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

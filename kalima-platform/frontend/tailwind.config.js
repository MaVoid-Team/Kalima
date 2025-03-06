/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx}",
    "./public/index.html",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
        accent: "hsl(var(--accent))",
        card: {
          background: "hsl(var(--card-background))",
          foreground: "hsl(var(--card-foreground))",
        },
        button: {
          background: "hsl(var(--button-background))",
          foreground: "hsl(var(--button-foreground))",
        }
      },
    },
  },
  plugins: [require("daisyui")],
}
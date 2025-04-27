/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      
      animation: {
      'bounce-slow': 'bounce-slow 3s ease-in-out infinite',
    },
    keyframes: {
      'bounce-slow': {
        '0%, 100%': { 
          transform: 'translateY(-25%)',
          animationTimingFunction: 'cubic-bezier(0.8,0,1,1)'
        },
        '50%': { 
          transform: 'translateY(0)',
          animationTimingFunction: 'cubic-bezier(0,0,0.2,1)'
        },
      }
    },
  },
  },
  plugins: [require("daisyui", "@tailwindcss/postcss"),
  ],
  daisyui: {
    themes: [
      {light: { 
        "primary": "#018383",    // Primary color
        "secondary": "#FFE492",  // Secondary color
        "accent": "#14B8A6",     // Accent color
        "neutral": "#1F2937",    // Neutral color
        "base-100": "#F9F9F9",   // Base background color

      }},          // default light theme
      {dark: { 
        "primary": "#018383",    // Primary color
        "secondary": "#FFE492",  // Secondary color
        "accent": "#14B8A6",     // Accent color
        "neutral": "#1F2937",    // Neutral color
        "base-100": "#333333",   // Base background color
      }},           
      "cupcake",
      "bumblebee",
      "emerald",
      "corporate",
      "synthwave",
      "retro",
      "cyberpunk",
      "valentine",
      "halloween",
      "garden",
      "forest",
      "aqua",
      "lofi",
      "pastel",
      "fantasy",
      "wireframe",
      "black",
      "luxury",
      "dracula",
      "cmyk",
      "autumn",
      "business",
      "acid",
      "lemonade",
      "night",
      "coffee",         
      "winter",
    ],
  
    base: true,         
    styled: true,       
    utils: true,      
  },
}
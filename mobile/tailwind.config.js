/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#000000',
        'glass-bg': 'rgba(255, 255, 255, 0.05)',
        'neon-purple': '#9D00FF',
        'neon-purple-dim': 'rgba(157, 0, 255, 0.2)',
      },
    },
  },
  plugins: [],
};

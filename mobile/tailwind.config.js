/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Dark mode backgrounds
        "dark-bg": "#000000",
        "dark-secondary": "#0A0A0A",
        "dark-tertiary": "#141414",

        // Premium chat system colors
        "chat-bg": "#0B0B12",
        "chat-secondary": "#14141C",
        "chat-card": "#171720",
        "chat-divider": "rgba(255,255,255,0.06)",
        "chat-text-primary": "#FFFFFF",
        "chat-text-secondary": "#A7A7B5",
        "chat-purple": "#6B4EFF",
        "chat-purple-light": "#8D6CFF",
        "chat-green": "#00E676",

        // Glass surfaces
        "glass-light": "rgba(20,20,20,0.6)",
        "glass-medium": "rgba(20,20,20,0.8)",
        "glass-dark": "rgba(15,15,15,0.9)",

        // Borders
        "border-glass-light": "rgba(255,255,255,0.08)",
        "border-glass-medium": "rgba(255,255,255,0.12)",
        "border-glass-highlight": "rgba(255,255,255,0.15)",

        // Text colors
        "text-primary": "#FFFFFF",
        "text-secondary": "#E5E7EB",
        "text-tertiary": "#9CA3AF",

        // Accent colors (Apple blue)
        "accent-blue": "#0A84FF",
        "accent-blue-light": "rgba(10,132,255,0.2)",

        // Legacy support (keeping neon-purple for existing functionality)
        "neon-purple": "#0A84FF",
        "neon-purple-dim": "rgba(10,132,255,0.2)",
      },
      backgroundColor: {
        "glass-blur": "rgba(20,20,20,0.6)",
      },
    },
  },
  plugins: [],
};

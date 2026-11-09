/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Circlee Hybrid Premium Design Tokens
        "premium-bg": "#0B0B10",
        "premium-card": "#14141C",
        "premium-surface": "#1B1B25",
        "premium-accent": "#8B5CF6",
        "premium-blue": "#3B82F6",
        "premium-text": "#F5F5F7",
        "premium-muted": "#A1A1AA",
        "premium-border": "#272733",

        // Dark mode backgrounds
        "dark-bg": "#0B0B10",
        "dark-secondary": "#14141C",
        "dark-tertiary": "#1B1B25",

        // Premium chat system colors
        "chat-bg": "#0B0B10",
        "chat-secondary": "#14141C",
        "chat-card": "#171720",
        "chat-divider": "rgba(255,255,255,0.06)",
        "chat-text-primary": "#F5F5F7",
        "chat-text-secondary": "#A1A1AA",
        "chat-purple": "#8B5CF6",
        "chat-purple-light": "#A78BFA",
        "chat-green": "#00E676",

        // Glass surfaces
        "glass-light": "rgba(20,20,28,0.7)",
        "glass-medium": "rgba(20,20,28,0.85)",
        "glass-dark": "rgba(11,11,16,0.95)",

        // Borders
        "border-glass-light": "#272733",
        "border-glass-medium": "rgba(255,255,255,0.12)",
        "border-glass-highlight": "rgba(255,255,255,0.15)",

        // Text colors
        "text-primary": "#F5F5F7",
        "text-secondary": "#A1A1AA",
        "text-tertiary": "#71717A",

        // Accent colors
        "accent-blue": "#8B5CF6",
        "accent-blue-light": "rgba(139,92,246,0.2)",

        // Legacy support
        "neon-purple": "#8B5CF6",
        "neon-purple-dim": "rgba(139,92,246,0.2)",
      },
      backgroundColor: {
        "glass-blur": "rgba(20,20,20,0.6)",
      },
    },
  },
  plugins: [],
};

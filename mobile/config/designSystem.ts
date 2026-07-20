export const chatDesignSystem = {
  colors: {
    background: "#0B0B12",
    secondaryBackground: "#14141C",
    card: "#171720",
    divider: "rgba(255, 255, 255, 0.06)",
    textPrimary: "#FFFFFF",
    textSecondary: "#A7A7B5",
    accentPurple: "#6B4EFF",
    accentPurpleLight: "#8D6CFF",
    successGreen: "#00E676",
    glassBorder: "rgba(255, 255, 255, 0.08)",
    glassBg: "rgba(20, 20, 28, 0.6)",
  },
  gradients: {
    purple: ["#6B4EFF", "#8D6CFF"] as [string, string],
    glow: ["rgba(107, 78, 255, 0.15)", "rgba(141, 108, 255, 0.0)"] as [string, string],
    avatarBorder: ["#6B4EFF", "#8D6CFF", "#00E676"] as [string, string, string],
  },
  typography: {
    conversationName: {
      fontSize: 16,
      fontWeight: "700" as const,
      fontFamily: "System",
    },
    messageText: {
      fontSize: 15,
      lineHeight: 20,
      fontFamily: "System",
    },
    metaText: {
      fontSize: 11,
      fontFamily: "System",
      color: "#A7A7B5",
    },
  },
  radius: {
    bubble: 28,
    card: 16,
    input: 24,
    avatar: 9999,
  },
  shadows: {
    bubbleGlow: {
      shadowColor: "#6B4EFF",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    cardShadow: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 3,
    },
  },
};

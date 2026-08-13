import React from "react";
import { View, ViewProps, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";

interface GlassCardProps extends ViewProps {
  intensity?: number;
  tint?: "dark" | "light" | "default";
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 35,
  tint = "dark",
  className = "",
  ...props
}) => {
  return (
    <View
      style={style}
      className={`rounded-2xl overflow-hidden border border-border-glass-light ${className}`}
      {...props}
    >
      <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFillObject} />
      <View className="bg-glass-light/10">
        {children}
      </View>
    </View>
  );
};

export default GlassCard;

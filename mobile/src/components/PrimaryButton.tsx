import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../theme/colors";

type Props = {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "ghost";
  disabled?: boolean;
  loading?: boolean;
};

export function PrimaryButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
}: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        variant === "ghost" && styles.ghost,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === "ghost" ? colors.text : "white"} />
      ) : (
        <Text style={[styles.label, variant === "ghost" && styles.ghostLabel]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.primaryStrong,
    marginVertical: 6,
  },
  label: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: colors.border,
  },
  ghostLabel: {
    color: colors.text,
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.5,
  },
});

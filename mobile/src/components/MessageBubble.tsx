import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { ChatMessage } from "../../server/chat/types";
import { colors } from "../theme/colors";

type Props = {
  message: ChatMessage;
};

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <View style={[styles.container, isUser ? styles.user : styles.assistant]}>
      <Text style={styles.role}>{isUser ? "Você" : "Assessor"}</Text>
      <Text style={styles.content}>{message.content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 14,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  user: {
    alignSelf: "flex-end",
    backgroundColor: colors.primary,
    borderColor: colors.primaryStrong,
  },
  assistant: {
    alignSelf: "flex-start",
  },
  role: {
    color: colors.muted,
    fontSize: 12,
    marginBottom: 4,
  },
  content: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
  },
});

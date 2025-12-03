import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { MessageBubble } from "../components/MessageBubble";
import { Screen } from "../components/Screen";
import { PrimaryButton } from "../components/PrimaryButton";
import { colors } from "../theme/colors";
import { useChatStore } from "../store/chat";
import { useSessionStore } from "../store/session";
import { api } from "../lib/api";
import type { RootStackParamList } from "../navigation/AppNavigator";

export default function ChatScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { history, addMessage, appendResponse } = useChatStore();
  const user = useSessionStore(state => state.user);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const content = input.trim();
    setInput("");
    addMessage({ role: "user", content });
    setSending(true);

    try {
      const result = await api.talkToBrain(content, history);
      appendResponse(result);
    } catch (error) {
      addMessage({ role: "assistant", content: "Não consegui responder agora. Tente novamente em instantes." });
    } finally {
      setSending(false);
    }
  };

  return (
    <Screen padded>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Second Brain</Text>
          <Text style={styles.title}>{user?.name ? `${user.name}` : "Chat"}</Text>
        </View>
        <PrimaryButton
          label="Config"
          variant="ghost"
          onPress={() => navigation.navigate("Settings")}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.chat}
        keyboardVerticalOffset={64}
      >
        <View style={styles.feed}>
          {history.length === 0 && (
            <Text style={styles.placeholder}>
              Contexto preservado e pronto para conversar com o assessor.
            </Text>
          )}
          {history.map((message, index) => (
            <MessageBubble key={`${message.content}-${index}`} message={message} />
          ))}
        </View>

        <View style={styles.composer}>
          <TextInput
            placeholder="Envie uma mensagem"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={input}
            onChangeText={setInput}
            multiline
          />
          <PrimaryButton label={sending ? "Enviando" : "Enviar"} onPress={sendMessage} loading={sending} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  eyebrow: {
    color: colors.primary,
    letterSpacing: 1,
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "800",
  },
  chat: {
    flex: 1,
  },
  feed: {
    flex: 1,
    marginBottom: 12,
  },
  composer: {
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderColor: colors.border,
    borderWidth: 1,
    color: colors.text,
    padding: 12,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 8,
  },
  placeholder: {
    color: colors.muted,
    textAlign: "center",
    marginTop: 40,
  },
});

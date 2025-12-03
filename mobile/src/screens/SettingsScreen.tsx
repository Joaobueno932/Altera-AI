import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "../components/Screen";
import { PrimaryButton } from "../components/PrimaryButton";
import { colors } from "../theme/colors";
import { env } from "../config/env";
import { useSessionStore } from "../store/session";
import { api } from "../lib/api";
import type { RootStackParamList } from "../navigation/AppNavigator";

export default function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const logout = useSessionStore(state => state.logout);
  const user = useSessionStore(state => state.user);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (error) {
      // ignore: backend may not have a session yet
    }
    logout();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Configurações</Text>
        <Text style={styles.subtitle}>Ajuste preferências do app mobile-first.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Usuário</Text>
        <Text style={styles.value}>{user?.name ?? "Visitante"}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>API Base URL</Text>
        <Text style={styles.value}>{env.BACKEND_BASE_URL}</Text>
        <Text style={styles.hint}>Configure EXPO_PUBLIC_BACKEND_BASE_URL no .env</Text>
      </View>

      <PrimaryButton label="Sair" variant="ghost" onPress={handleLogout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
    marginBottom: 18,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.muted,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    marginBottom: 4,
  },
  value: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  hint: {
    marginTop: 6,
    color: colors.muted,
    fontSize: 12,
  },
});

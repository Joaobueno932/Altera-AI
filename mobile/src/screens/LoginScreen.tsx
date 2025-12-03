import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Screen } from "../components/Screen";
import { TextField } from "../components/TextField";
import { PrimaryButton } from "../components/PrimaryButton";
import { colors } from "../theme/colors";
import { useSessionStore } from "../store/session";
import { api } from "../lib/api";
import type { RootStackParamList } from "../navigation/AppNavigator";

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const setUser = useSessionStore(state => state.setUser);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleLogin = async () => {
    setLoading(true);
    setError(undefined);
    try {
      await api.health();
      setUser({ name });
      navigation.reset({ index: 0, routes: [{ name: "Onboarding" }] });
    } catch (err) {
      setError("Não foi possível conectar ao servidor. Verifique a URL no .env.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Second Brain</Text>
        <Text style={styles.title}>Entrar</Text>
        <Text style={styles.subtitle}>
          Conecte-se ao backend atual e continue o fluxo mobile-first.
        </Text>
      </View>

      <TextField
        label="Como devemos te chamar?"
        placeholder="Seu nome"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <PrimaryButton label="Continuar" onPress={handleLogin} loading={loading} disabled={!name.trim()} />
      <PrimaryButton
        label="Já tenho sessão ativa"
        variant="ghost"
        onPress={() => navigation.navigate("Splash")}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
    marginBottom: 24,
  },
  eyebrow: {
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 2,
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 20,
  },
  error: {
    color: colors.danger,
    marginBottom: 8,
  },
});

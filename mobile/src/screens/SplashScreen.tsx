import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { api } from "../lib/api";
import { colors } from "../theme/colors";
import { useSessionStore } from "../store/session";
import type { RootStackParamList } from "../navigation/AppNavigator";

export default function SplashScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const setUser = useSessionStore(state => state.setUser);
  const onboardingComplete = useSessionStore(state => state.onboardingComplete);
  const [message, setMessage] = useState("Sincronizando com o servidor...");

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await api.health();
        setMessage("Checando sessão ativa...");
        const user = await api.currentUser();
        if (user) {
          setUser(user);
          navigation.reset({
            index: 0,
            routes: [{ name: onboardingComplete ? "Chat" : "Onboarding" }],
          });
          return;
        }
      } catch (error) {
        setMessage("Continuando em modo autenticado manualmente...");
      }

      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    };

    bootstrap();
  }, [navigation, onboardingComplete, setUser]);

  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  text: {
    color: colors.muted,
    fontSize: 14,
  },
});

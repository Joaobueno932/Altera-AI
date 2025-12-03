import React, { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Screen } from "../components/Screen";
import { PrimaryButton } from "../components/PrimaryButton";
import { colors } from "../theme/colors";
import { onboardingSteps, type OnboardingStep } from "../../../shared/onboardingData";
import { useSessionStore } from "../store/session";
import { api, type OnboardingAnswer } from "../lib/api";
import type { RootStackParamList } from "../navigation/AppNavigator";

export default function OnboardingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const completeOnboarding = useSessionStore(state => state.completeOnboarding);

  const step = onboardingSteps[stepIndex];
  const progress = useMemo(() => (stepIndex + 1) / onboardingSteps.length, [stepIndex]);

  const toggleOption = (step: OnboardingStep, option: string) => {
    setAnswers(current => {
      const currentValues = current[step.id] ?? [];
      if (step.allowMultiple) {
        const exists = currentValues.includes(option);
        return {
          ...current,
          [step.id]: exists ? currentValues.filter(item => item !== option) : [...currentValues, option],
        };
      }

      return {
        ...current,
        [step.id]: [option],
      };
    });
  };

  const handleNext = async () => {
    if (stepIndex < onboardingSteps.length - 1) {
      setStepIndex(index => index + 1);
      return;
    }

    setSubmitting(true);
    try {
      const payload: OnboardingAnswer[] = onboardingSteps.map(({ id }) => ({
        id,
        responses: answers[id] ?? [],
      }));

      await api.saveOnboarding(payload);
      await api.submitOnboarding(payload);

      completeOnboarding();
      navigation.reset({ index: 0, routes: [{ name: "Chat" }] });
    } catch (error) {
      Alert.alert(
        "Erro ao salvar",
        "Não foi possível enviar suas respostas agora. Verifique a conexão e tente novamente."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const disableNext = (answers[step.id]?.length ?? 0) === 0;

  return (
    <Screen padded scrollable>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Onboarding</Text>
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.subtitle}>{step.description}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      <View style={styles.options}>
        {step.options.map(option => {
          const selected = answers[step.id]?.includes(option);
          return (
            <Pressable
              key={option}
              style={[styles.option, selected && styles.optionSelected]}
              onPress={() => toggleOption(step, option)}
            >
              <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{option}</Text>
              {selected && <Text style={styles.hint}>Selecionado</Text>}
            </Pressable>
          );
        })}
      </View>

      <PrimaryButton
        label={stepIndex === onboardingSteps.length - 1 ? "Finalizar" : "Continuar"}
        onPress={handleNext}
        disabled={disableNext}
        loading={submitting}
      />

      {stepIndex > 0 && (
        <PrimaryButton
          label="Voltar"
          variant="ghost"
          onPress={() => setStepIndex(index => Math.max(0, index - 1))}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
    marginBottom: 16,
  },
  eyebrow: {
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 2,
    fontWeight: "700",
    fontSize: 12,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 20,
  },
  progressBar: {
    marginTop: 12,
    backgroundColor: colors.surface,
    borderRadius: 999,
    height: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  options: {
    gap: 10,
    marginBottom: 12,
  },
  option: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryStrong,
  },
  optionLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  optionLabelSelected: {
    color: "white",
  },
  hint: {
    color: colors.muted,
    marginTop: 6,
  },
});

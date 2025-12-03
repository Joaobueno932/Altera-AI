import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";
import { colors } from "../theme/colors";

type Props = {
  children: React.ReactNode;
  padded?: boolean;
  scrollable?: boolean;
};

export function Screen({ children, padded = true, scrollable = false }: Props) {
  const content = <View style={[styles.content, padded && styles.padded]}>{children}</View>;

  return (
    <SafeAreaView style={styles.container}>
      {scrollable ? (
        <ScrollView contentContainerStyle={styles.scroll}>{content}</ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingVertical: 16,
  },
  content: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
});

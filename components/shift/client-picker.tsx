import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Text from "@/components/shared/text";
import { THEME } from "@/constants/theme";
import { ShiftClientChoice } from "@/helpers/shift-clients";

const ClientPicker = ({
  clients,
  value,
  onChange,
  label = "Which client is this for?",
}: {
  clients: ShiftClientChoice[];
  value?: string;
  onChange: (key: string) => void;
  label?: string;
}) => {
  if (clients.length < 2) return null;

  return (
    <View style={styles.wrap}>
      <Text weight="semiBold" size="sm">
        {label}
      </Text>
      {clients.map((client) => {
        const selected = client.key === value;
        return (
          <Pressable
            key={client.key}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(client.key)}
            style={[styles.choice, selected && styles.choiceSelected]}
          >
            <Text
              weight={selected ? "semiBold" : "regular"}
              style={{ color: selected ? THEME.colors.primary : THEME.colors.black }}
            >
              {client.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
    marginBottom: 12,
  },
  choice: {
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: THEME.colors.white,
  },
  choiceSelected: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primary + "12",
  },
});

export default ClientPicker;

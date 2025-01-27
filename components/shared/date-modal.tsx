import { THEME } from "@/constants/theme";
import normalize from "@/libs/normalize";
import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { Pressable, View } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Text from "./text";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (date: string) => void;
}
const DateModal = ({ label = "Date", onChange, value }: DatePickerProps) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const formattedDate = `${year}-${month}-${day}`;
    onChange(formattedDate);
    hideDatePicker();
  };

  return (
    <View>
      <View style={[styles.outerContainer]}>
        {label && (
          <View style={{ flexDirection: "row" }}>
            <Text style={styles.inputLabel}>{label} </Text>
          </View>
        )}
        <Pressable
          style={[
            styles.container,
            {
              borderColor: isDatePickerVisible
                ? THEME.colors.primary
                : THEME.colors.border,
            },
          ]}
          onPress={showDatePicker}
        >
          <Text style={styles.inputLabel}>
            {value.trim() === "" ? "DD-MM-YYYY" : value}
          </Text>

          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="calendar"
              size={22}
              color={THEME.colors.grayBg}
            />
          </View>
        </Pressable>
      </View>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </View>
  );
};

export default DateModal;

const styles = StyleSheet.create({
  outerContainer: {
    width: "100%",
    overflow: "hidden",
    borderRadius: normalize(6),
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: normalize(6),
    paddingHorizontal: 10,
    height: normalize(38),
  },
  iconContainer: {
    marginRight: normalize(4),
  },
  input: {
    flex: 1,
  },
  inputLabel: {
    fontSize: THEME.fontSize.md,
    fontFamily: THEME.fontFamily.semiBold,
    marginBottom: 5,
    color: THEME.colors.grayBg,
  },
});

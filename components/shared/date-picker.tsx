import React, { useState } from "react";
import { Platform, Pressable, View, StyleSheet } from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import TextInput from "./input";
import { THEME } from "@/constants/theme";
import Text from "./text";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (date: string) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ label, value, onChange }) => {
  const [date, setDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState<boolean>(false);

  const toggleDatePicker = () => {
    setShowPicker((prev) => !prev);
  };

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (event.type === "set") {
      const currentDate = selectedDate || date;
      setDate(currentDate);
      const formattedDate = formatDate(currentDate);
      onChange(formattedDate);
      if (Platform.OS === "android") {
        toggleDatePicker();
      }
    } else {
      toggleDatePicker();
    }
  };

  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const confirmIosDate = () => {
    const formattedDate = formatDate(date);
    onChange(formattedDate);
    toggleDatePicker();
  };

  return (
    <View>
      {/* {!showPicker && ( */}
      <Pressable onPress={toggleDatePicker}>
        <TextInput
          value={value}
          label={label}
          placeholder="dd/mm/yyyy"
          editable={false}
          icon={
            <MaterialCommunityIcons
              name="calendar"
              size={22}
              color={THEME.colors.grayBg}
            />
          }
          // inputStyle={{ backgroundColor: THEME.colors.light }}
          onPressIn={toggleDatePicker}
        />
      </Pressable>
      {/* )} */}
      {showPicker && (
        <DateTimePicker
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          value={new Date(value)}
          onChange={handleDateChange}
          style={styles.datePicker}
        />
      )}
      {showPicker && Platform.OS === "ios" && (
        <View style={styles.iosActions}>
          <Pressable
            onPress={toggleDatePicker}
            style={{
              ...styles.iosActionButton,
              backgroundColor: THEME.colors.red,
            }}
          >
            <Text
              weight="medium"
              style={{ ...styles.iosActionText, color: THEME.colors.white }}
            >
              Cancel
            </Text>
          </Pressable>
          <Pressable onPress={confirmIosDate} style={styles.iosActionButton}>
            <Text weight="medium" style={styles.iosActionText}>
              Confirm
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default DatePicker;

const styles = StyleSheet.create({
  datePicker: {
    height: 120,
    marginTop: -10,
  },
  iosActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 10,
  },
  iosActionButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    backgroundColor: THEME.colors.dark,
  },
  iosActionText: {
    color: "#fff",
    textAlign: "center",
  },
});

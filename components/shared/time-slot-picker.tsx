import React, { useState } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { THEME } from "@/constants/theme";
import Text from "./text";
import { convertTo12HourFormat } from "@/helpers/shift-service";

interface TimePickerProps {
  label?: string;
  value: string;
  onChange: (date: string) => void;
}
const TimeSlotPicker = ({ value, onChange }: TimePickerProps) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date: Date) => {
    onChange(
      date.toLocaleTimeString([], {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      })
    );
    hideDatePicker();
  };

  return (
    <>
      <TouchableOpacity style={styles.input} onPress={showDatePicker}>
        <Text size="md" weight="medium">
          {convertTo12HourFormat(value)}
        </Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="time"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
    </>
  );
};

const styles = StyleSheet.create({
  input: {
    paddingHorizontal: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: THEME.colors.lightGray,
    borderRadius: 5,
  },
});

export default TimeSlotPicker;

import React from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Pressable,
} from "react-native";
// import TimeSlotPicker from "./TimeSlotPicker"; // Import the TimeSlotPicker component
import { Feather, Ionicons } from "@expo/vector-icons";
import { DaySlots, TimeSlot } from "@/app/(root)/(tabs)/add";
import { THEME } from "@/constants/theme";
import Text from "@/components/shared/text";
import TimeSlotPicker from "@/components/shared/time-slot-picker";

interface Props {
  handleAddTimeSlot: (day: string) => void;
  day: string;
  availableHours: DaySlots;
  handleChangeTime: (
    day: string,
    index: number,
    field: keyof TimeSlot,
    id: string,
    value: string
  ) => void;
  handleDeleteTimeSlot: (
    day: string,
    index: number,
    id: string
  ) => Promise<void>;
  overlapErrors: {
    [key: string]: boolean[];
  };
  index: number;
}

const DayAvailabilityForm = ({
  day,
  availableHours,
  handleAddTimeSlot,
  handleChangeTime,
  handleDeleteTimeSlot,
  overlapErrors,
}: Props) => {
  return (
    <View
      style={[styles.dayComponent, { backgroundColor: THEME.colors.white }]}
    >
      <View style={styles.dayHeader}>
        <Text size="lg" weight="bold" style={styles.dayText}>
          {day}
        </Text>

        <TouchableOpacity onPress={() => handleAddTimeSlot(day)}>
          <Feather name="plus-circle" size={24} color={THEME.colors.grayBg} />
        </TouchableOpacity>
      </View>

      <View style={styles.dayBody}>
        {availableHours[day] && (
          <FlatList
            data={availableHours[day]}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <View style={styles.slotContainer}>
                <View style={styles.label}>
                  <Text weight="semiBold" style={styles.dayText}>
                    From
                  </Text>
                  <TimeSlotPicker
                    label=""
                    value={item.startTime}
                    onChange={(time) =>
                      handleChangeTime(day, index, "startTime", item.id, time)
                    }
                  />
                </View>
                <View style={styles.label}>
                  <Text weight="semiBold" style={styles.dayText}>
                    To
                  </Text>
                  <TimeSlotPicker
                    label=""
                    value={item.endTime}
                    onChange={(time) =>
                      handleChangeTime(day, index, "endTime", item.id, time)
                    }
                  />
                </View>
                <Pressable
                  onPress={() => handleDeleteTimeSlot(day, index, item.id)}
                  style={styles.closeIcon}
                >
                  <Ionicons
                    name="close"
                    size={22}
                    color={THEME.colors.grayBg}
                  />
                </Pressable>

                {/* {overlapErrors[day]?.[index] && (
                <Text style={styles.errorText}>Overlapping time slots!</Text>
              )} */}
              </View>
            )}
          />
        )}

        {/* <View style={styles.slotContainer}>
            <Text size="md" weight="medium" style={styles.emptySlotText}>
              Unavailable
            </Text>
          </View> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  dayComponent: {
    rowGap: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 10,
    borderColor: THEME.colors.lightGray,
    borderWidth: 1,
    borderRadius: 5,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dayBody: {},
  label: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  dayText: {
    color: THEME.colors.grayBg,
  },

  slotContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
    gap: 10,
    marginBottom: 4,
  },
  emptySlotText: {
    color: THEME.colors.grayBg,
  },

  errorText: {
    color: "red",

    marginTop: 5,
  },
  closeIcon: {
    backgroundColor: THEME.colors.border,
    padding: 3,
    borderRadius: 5,
    marginRight: 10,
  },
});

export default DayAvailabilityForm;

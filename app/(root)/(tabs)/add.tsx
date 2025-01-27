import { FlatList, StyleSheet, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import { THEME } from "@/constants/theme";
import useAuthStore from "@/store/use-auth-store";
import { profileQuery } from "@/hooks/queries/profile";
import { StaffAvailability } from "@/types/users";
import MiniLoader from "@/components/shared/mini-loader";
import DayAvailabilityForm from "@/modules/profile/availability-form";
import {
  availbilityMutation,
  FormEditType,
  FormSubmitType,
} from "@/hooks/mutation/availability";
import { showMessage } from "react-native-flash-message";
import { Animated } from "react-native";
import Header from "@/components/shared/header";

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  loading?: boolean; // Optional property to track loading state
}
export interface DaySlots {
  [day: string]: TimeSlot[];
}
const AddAvailability = () => {
  const scrollY = useRef(new Animated.Value(0)).current;

  const opacityTitle = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });
  const translateTitle = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 40],
    extrapolate: "clamp",
  });
  const { user, staff } = useAuthStore();
  const {
    data: availabilityData,
    isError,
    isRefetching,
    isPending: isLoading,
  } = profileQuery.useFetchAvailability(staff?.staffId as number);

  const [availableHours, setAvailableHours] = useState<DaySlots>({});
  const [overlapErrors, setOverlapErrors] = useState<{
    [key: string]: boolean[];
  }>({});
  const daysOfWeek: string[] = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  useEffect(() => {
    organizeHours(availabilityData as StaffAvailability[]);
  }, [availabilityData]);

  const organizeHours = (staffSchedule: StaffAvailability[]) => {
    const hoursByDay: DaySlots = {};
    staffSchedule?.forEach((slot: StaffAvailability) => {
      if (!hoursByDay[slot.days]) {
        hoursByDay[slot.days] = [];
      }
      hoursByDay[slot.days].push({
        id: slot.staffAvailibilityId.toString(),
        startTime: slot.fromTimeOfDay,
        endTime: slot.toTimeOfDay,
        loading: false, // Initialize with no loading
      });
    });
    setAvailableHours(hoursByDay);
  };

  const addHour = (time: string) => {
    const [hour, minute] = time.split(":").map((str) => parseInt(str));
    const nextHour = hour === 23 ? 0 : hour + 1;
    return `${nextHour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  };

  const [submitInfo, setSubmitInfo] = React.useState({
    day: "",
    newStartTime: "",
    newEndTime: "",
  });
  const info: FormSubmitType = {
    ...submitInfo,
    user: user?.userId as string,
    staffId: staff?.staffId as number,
    companyID: user?.companyId as number,
  };
  const mutation = availbilityMutation.useSubmitStaffAvailability(info);

  const handleSubmit = async (
    day: string,
    newStartTime: string,
    newEndTime: string
  ) => {
    setSubmitInfo({
      day,
      newStartTime,
      newEndTime,
    });
    mutation.mutate();
  };

  const handleAddTimeSlot = (day: string) => {
    const lastSlot = availableHours[day]?.[availableHours[day]?.length - 1];
    const newId = `temp-${new Date().getTime()}`;

    // Calculate the start and end times for the new time slot
    const newStartTime = lastSlot ? addHour(lastSlot.endTime) : "07:00";
    const newEndTime = addHour(newStartTime);

    handleSubmit(day, newStartTime, newEndTime);

    setAvailableHours((prev) => ({
      ...prev,
      [day]: [
        ...(prev[day] || []),
        {
          id: newId,
          startTime: newStartTime,
          endTime: newEndTime,
        },
      ],
    }));
  };

  const [editInfo, setEditInfo] = React.useState<FormEditType>({
    staffAvailibilityId: 0,
    days: "",
    fromTimeOfDay: "",
    toTimeOfDay: "",
    user: user?.userId as string,
    staffId: staff?.staffId as number,
    companyID: user?.companyId as number,
  });

  const editMutation = availbilityMutation.useEditStaffAvailability(editInfo);
  const handleEdit = async (
    day: string,
    id: string,
    field: string,
    value: string
  ) => {
    const existingTimeSlot = availableHours[day].find((slot) => slot.id === id);
    setEditInfo({
      staffAvailibilityId: Number(id),
      days: day,
      fromTimeOfDay:
        field === "startTime"
          ? value
          : existingTimeSlot && (existingTimeSlot?.startTime as string),
      toTimeOfDay:
        field === "endTime"
          ? value
          : existingTimeSlot && existingTimeSlot?.endTime,
      user: user?.userId as string,
      staffId: staff?.staffId as number,
      companyID: user?.companyId as number,
    });
    editMutation.mutate();
  };
  const handleChangeTime = (
    day: string,
    index: number,
    field: keyof TimeSlot,
    id: string,
    value: string
  ) => {
    setAvailableHours((prevHours) => ({
      ...prevHours,
      [day]: prevHours[day].map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot
      ),
    }));

    // Check for overlapping time slots
    const newStartTime =
      field === "startTime" ? value : availableHours[day][index].startTime;
    const newEndTime =
      field === "endTime" ? value : availableHours[day][index].endTime;

    // Check if endTime is greater than startTime
    if (field === "endTime" && newStartTime >= newEndTime) {
      // Reset the time slot in the local state
      setAvailableHours((prevHours) => ({
        ...prevHours,
        [day]: prevHours[day].map((slot, i) =>
          i === index
            ? { ...slot, [field]: availableHours[day][index][field] }
            : slot
        ),
      }));

      // Show error message
      showMessage({
        type: "info",
        message: "End time must be greater than start time!",
      });
      return;
    }

    // Check for overlapping time slots
    const overlapping = availableHours[day].map((slot, i) => {
      if (i === index) return false; // Skip checking against itself
      return (
        (newStartTime >= slot.startTime && newStartTime < slot.endTime) ||
        (newEndTime > slot.startTime && newEndTime <= slot.endTime) ||
        (newStartTime <= slot.startTime && newEndTime >= slot.endTime)
      );
    });

    // Update overlapErrors state
    setOverlapErrors((prevErrors) => ({
      ...prevErrors,
      [day]: overlapping,
    }));

    // If any overlap, return without editing
    if (overlapping.includes(true)) {
      // Show error message
      showMessage({
        type: "danger",
        message: "Overlapping time slots not allowed!!",
      });
      return;
    }
    handleEdit(day, id, field, value);
  };

  const [delId, setDelId] = React.useState(0);
  const delMutation = availbilityMutation.useDeleteStaffAvailability(delId);

  const handleDelete = (id: number) => {
    setDelId(id);
    delMutation.mutate();
  };

  const handleDeleteTimeSlot = async (
    day: string,
    index: number,
    id: string
  ) => {
    setAvailableHours((prevHours) => ({
      ...prevHours,
      [day]: prevHours[day].filter((_, i) => i !== index),
    }));
    const parsedValue = parseFloat(id);
    if (isNaN(parsedValue)) {
      return;
    } else {
      handleDelete(parsedValue);
    }
  };

  return (
    <ScreenWrapper
      statusBgColor={THEME.colors.brand}
      bgColor={THEME.colors.brand}
      barStyle="light-content"
    >
      <View
        style={[
          // styles.header,
          { backgroundColor: THEME.colors.brand, paddingBottom: 10 },
        ]}
      >
        <Header
          name={`Add Availability`}
          image={staff?.imageUrl!}
          opacityTitle={opacityTitle}
          translateTitle={translateTitle}
        />
      </View>
      <MiniLoader visible={isLoading} title="Loading Availability" />
      <View style={styles.container}>
        <FlatList
          data={daysOfWeek}
          keyExtractor={(item) => item}
          contentContainerStyle={{ ...styles.content, paddingBottom: 10 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: day, index }) => (
            <DayAvailabilityForm
              day={day}
              availableHours={availableHours}
              handleAddTimeSlot={handleAddTimeSlot}
              handleChangeTime={handleChangeTime}
              handleDeleteTimeSlot={handleDeleteTimeSlot}
              overlapErrors={overlapErrors}
              index={index}
            />
          )}
        />
      </View>
    </ScreenWrapper>
  );
};

export default AddAvailability;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.white,
  },
  header: {
    width: "100%",
    // backgroundColor: THEME.colors.light,
  },
  content: {
    rowGap: THEME.spacing.md,
    backgroundColor: THEME.colors.white,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.lg,
  },
});

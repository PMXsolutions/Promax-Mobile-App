import { ScrollView, StyleSheet, View } from "react-native";
import React from "react";
import { ShiftRosterType } from "@/types/shift";
import Text from "../shared/text";
import CustomButton from "../shared/custom-button";

const ShiftMessage = ({
  shift,
  closeModal,
}: {
  shift: ShiftRosterType;
  closeModal: () => void;
}) => {
  // Define the date-time strings
  const startTimeString = shift?.dateFrom;
  const endTimeString = shift?.dateTo;

  // Parse the date-time strings into Date objects
  const startTime = new Date(startTimeString);
  const endTime = new Date(endTimeString);

  // Calculate the difference in milliseconds
  const differenceInMilliseconds = Number(endTime) - Number(startTime);

  // Convert the difference to hours and minutes
  const differenceInHours = Math.floor(
    differenceInMilliseconds / (1000 * 60 * 60)
  );
  const differenceInMinutes = Math.floor(
    (differenceInMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
  );
  return (
    <View style={{ width: "90%" }}>
      <Text
        size="base"
        weight="regular"
        style={{
          lineHeight: 24,
        }}
      >
        {"\n"} You have successfully clocked into this shift that last for{" "}
        <Text weight="bold">
          {" "}
          {`${differenceInHours} hours and ${differenceInMinutes} minutes`}
        </Text>
        . Please remember to fill out your shift report form before clocking out
        to avoid errors or being unable to clock into your next shift.
        {"\n"}
      </Text>
      <CustomButton title="Ok" onPress={closeModal} />
    </View>
  );
};

export default ShiftMessage;

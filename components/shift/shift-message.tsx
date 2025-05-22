import { ScrollView, StyleSheet, View } from "react-native";
import React from "react";
import { ShiftRosterType } from "@/types/shift";
import Text from "../shared/text";
import CustomButton from "../shared/custom-button";
import LottieView from "lottie-react-native";

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
    <View>
      <View
        style={{
          width: 100,
          height: 100,
          overflow: "hidden",
          padding: 0,

          justifyContent: "center",
          alignItems: "center",
          alignSelf: "center",
        }}
      >
        <LottieView
          source={require("@/assets/json/success.json")}
          autoPlay
          loop={true}
          style={{
            alignSelf: "center",
            width: 130,
            height: 130,
          }}
        />
      </View>
      <Text weight="semiBold" size="lg">
        Well done, {shift?.staff?.firstName}
      </Text>
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
      <View style={{ paddingVertical: 10 }}>
        <CustomButton title="Ok" onPress={closeModal} />
      </View>
    </View>
  );
};

export default ShiftMessage;

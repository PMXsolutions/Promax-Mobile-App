import { StyleSheet, View } from "react-native";
import React from "react";
import { ShiftRosterType } from "@/types/shift";
import UserHeader from "@/components/shift/shift-user-header";
import SmallMap from "@/components/map/small-map";
import { formattedTime } from "@/helpers/shift-service";
import TableStructure from "@/components/shared/table-display";
import Text from "@/components/shared/text";
import { FontAwesome } from "@expo/vector-icons";
import ListDisplay from "@/components/shared/list-display";
import { THEME } from "@/constants/theme";

const ShiftDetailContent = ({ shift }: { shift: ShiftRosterType }) => {
  const shiftActivities = shift?.activities.split(",");

  return (
    <>
      <View style={styles.header}>
        <UserHeader
          image={shift?.staff.imageUrl!}
          name={`${shift?.staff.firstName} ${shift?.staff.surName}`}
          role={"STAFF"}
        />
        <UserHeader
          image={shift?.profile.imageUrl}
          name={shift?.clients}
          role={"CLIENT"}
        />
      </View>
      <SmallMap shiftInfo={shift} />
      {shift && (
        <TableStructure
          iconName={"calendar-month"}
          label={"Date"}
          value={formattedTime(shift?.dateCreated, "d MMMM, yyyy")}
        />
      )}
      {shift && (
        <TableStructure
          iconName={"access-time"}
          label={"Start Time"}
          value={formattedTime(shift?.dateFrom, "h:mm a")}
        />
      )}
      {shift && (
        <TableStructure
          iconName={"access-time"}
          label={"End Time"}
          value={formattedTime(shift?.dateTo, "h:mm a")}
        />
      )}
      {shift && (
        <TableStructure
          iconName={"location-pin"}
          label={"Location"}
          value={shift?.profile?.address || ""}
        />
      )}
      {shift && (
        <ListDisplay
          iconName={"format-list-numbered"}
          title={"Activities"}
          children={
            <View style={styles.section}>
              {shiftActivities.map((activity, index) => (
                <View
                  style={{
                    flexDirection: "row",
                    gap: 4,
                    alignItems: "center",
                    marginBottom: 5,
                  }}
                  key={index}
                >
                  <FontAwesome
                    color="#999"
                    size={11}
                    name={"circle"}
                    style={{
                      marginRight: 10,
                    }}
                  />
                  <Text size="lg" weight="medium" style={styles.sectionItem}>
                    {activity.trim()}
                  </Text>
                </View>
              ))}
            </View>
          }
        />
      )}
      {shift.description && (
        <ListDisplay
          iconName={"description"}
          title={"Description"}
          children={
            <View
              style={{
                ...styles.section,
                padding: 10,
              }}
            >
              <Text
                weight="medium"
                size="md"
                style={[
                  styles.sectionItem,
                  { color: shift.description ? "#000" : THEME.colors.inactive },
                ]}
              >
                {shift?.description ||
                  "If there's additional description for shift, it will appear in this text box, do well to ignore when there is no description."}
              </Text>
            </View>
          }
        />
      )}
      {shift && (
        <ListDisplay
          iconName={"description"}
          title={"Client Appointment Request"}
          children={
            <View
              style={{
                ...styles.section,
                borderRadius: 5,
                borderWidth: 1,
                padding: 10,
                flex: 1,
                borderColor: THEME.colors.lightGray,
              }}
            >
              <Text
                weight="medium"
                size="md"
                style={[
                  styles.sectionItem,
                  { color: shift.appointment ? "#000" : THEME.colors.inactive },
                ]}
              >
                {shift?.appointment ||
                  "If a client request for an appointment, it will appear in this text box, do well to ignore when there is no additional appointment request."}
              </Text>
            </View>
          }
        />
      )}
    </>
  );
};

export default ShiftDetailContent;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  section: {
    margin: THEME.spacing.xs,
    marginTop: THEME.spacing.sm,
    width: "100%",
  },

  sectionItem: {
    lineHeight: 19.2,
  },
});

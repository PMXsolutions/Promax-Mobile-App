import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import HeaderWhite from "@/components/shared/header-no-bg";
import Text from "@/components/shared/text";
import { THEME } from "@/constants/theme";
import {
  STAFF_READ_LABELS,
  StaffReadWorkflow,
} from "@/libs/staff-workflow-contract";
import {
  blockedStaffWorkflows,
  staffReadAccessibility,
} from "@/libs/staff-work-a11y";

const READS = Object.keys(STAFF_READ_LABELS) as StaffReadWorkflow[];

export default function StaffWork() {
  return (
    <ScreenWrapper barStyle="dark-content">
      <HeaderWhite name="Staff work" />
      <ScrollView contentContainerStyle={styles.page}>
        <Text size="sm" style={styles.note}>
          These are PromaxCare web staff reads. Saves for attendance, progress
          notes, incidents, and tickets are not sent from this screen. Daily
          report, PBS, SIMA chat, and policies stay closed until their web
          request is confirmed. This is not the installed store build.
        </Text>
        {READS.map((workflow) => {
          const access = staffReadAccessibility(workflow);
          return (
            <Pressable
              key={workflow}
              accessibilityRole={access.accessibilityRole}
              accessibilityLabel={access.accessibilityLabel}
              accessibilityHint={access.accessibilityHint}
              onPress={() => router.push(`/(root)/staff-work/${workflow}`)}
              style={styles.row}
            >
              <Text weight="semiBold">{STAFF_READ_LABELS[workflow]}</Text>
              <Text size="sm" style={styles.meta}>
                Read only
              </Text>
            </Pressable>
          );
        })}
        <Text weight="semiBold" style={styles.heading} accessibilityRole="header">
          Waiting on the signed-in web request
        </Text>
        {blockedStaffWorkflows().map((item) => (
          <View
            key={item.workflow}
            accessible
            accessibilityRole={item.accessibilityRole}
            accessibilityLabel={item.accessibilityLabel}
            style={styles.blocked}
          >
            <Text weight="semiBold">{item.workflow}</Text>
            <Text size="sm" style={styles.meta}>
              {item.question}
            </Text>
          </View>
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, gap: 12, paddingBottom: 32 },
  note: { lineHeight: 20, color: THEME.colors.neutral[300] },
  row: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    gap: 4,
  },
  meta: { color: "#475569", lineHeight: 18 },
  heading: { marginTop: 8 },
  blocked: {
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    padding: 14,
    gap: 4,
  },
});

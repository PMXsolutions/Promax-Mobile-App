import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ScreenWrapper from "@/components/wrapper/screen-wrapper";
import HeaderWhite from "@/components/shared/header-no-bg";
import Text from "@/components/shared/text";
import { CarePlanItem, carePlanService, ShiftCarePlanPack } from "@/services/care-plan";
import { THEME } from "@/constants/theme";

const sectionTitle = (value: string) => value.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");

export default function ShiftCarePlan() {
  const { shiftId } = useLocalSearchParams<{ shiftId: string }>();
  const id = Number(shiftId);
  const [pack, setPack] = useState<ShiftCarePlanPack | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const grouped = useMemo(() => (pack?.items || []).reduce<Record<string, CarePlanItem[]>>((all, item) => { (all[item.sectionCode] ||= []).push(item); return all; }, {}), [pack]);

  const load = async () => {
    setLoading(true);
    try { setPack(await carePlanService.getShiftPack(id)); }
    catch { Alert.alert("Care plan unavailable", "This care plan could not be loaded. Your shift and clocking functions are not affected."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [id]);

  const acknowledge = async () => {
    if (!pack?.plan) return;
    setBusy(true);
    try { await carePlanService.acknowledge(id, pack.plan.clientCarePlanVersionId); await load(); Alert.alert("Acknowledged", "Your acknowledgement has been recorded."); }
    catch { Alert.alert("Not recorded", "Please try again. This does not affect your shift."); }
    finally { setBusy(false); }
  };
  const clarify = async () => {
    if (!pack?.plan || !note.trim()) return;
    setBusy(true);
    try { await carePlanService.requestClarification(id, pack.plan.clientCarePlanVersionId, note.trim()); setNote(""); await load(); Alert.alert("Sent", "Your clarification request has been recorded for the organisation."); }
    catch { Alert.alert("Not sent", "Please try again. This does not affect your shift."); }
    finally { setBusy(false); }
  };

  return <ScreenWrapper barStyle="dark-content"><HeaderWhite name="Care plan & handover" />{loading && !pack ? <View style={styles.loading}><ActivityIndicator color={THEME.colors.primary} size="large" /></View> : <ScrollView contentContainerStyle={styles.page}>
    <View style={styles.hero}><Text size="xs" weight="bold" style={styles.eyebrow}>ASSIGNED SHIFT · APPROVED INFORMATION</Text><Text size="xl" weight="bold" color="#fff">{pack?.shift.participant || "Participant care plan"}</Text><Text size="sm" color="#dbeafe" style={styles.heroCopy}>{pack?.plan ? `Approved care plan · version ${pack.plan.versionNumber}` : "No approved care plan has been published yet."}</Text></View>
    {(pack?.handovers.length || 0) > 0 && <View style={styles.section}><Text size="lg" weight="bold">Current handover</Text>{pack?.handovers.map((handover) => <View key={handover.clientHandoverId} style={[styles.handover, handover.priority === "Critical" && styles.criticalBorder]}><Text size="xs" weight="bold" color={handover.priority === "Critical" ? "#b91c1c" : "#92400e"}>{handover.priority.toUpperCase()}</Text><Text style={styles.body}>{handover.content}</Text></View>)}</View>}
    {!pack?.plan ? <View style={styles.empty}><MaterialCommunityIcons name="file-alert-outline" size={36} color="#94a3b8" /><Text weight="semiBold" style={styles.emptyTitle}>No published plan available</Text><Text size="sm" color="#64748b" style={styles.center}>Contact your supervisor if you need care instructions. You can still use normal shift functions.</Text></View> : <>
      {Object.entries(grouped).map(([section, items]) => <View key={section} style={styles.section}><Text size="lg" weight="bold" style={styles.sectionTitle}>{sectionTitle(section)}</Text>{items.map((item) => <View key={item.clientCarePlanItemId} style={[styles.item, item.criticality === "Critical" && styles.criticalBorder]}><View style={styles.itemHeader}><Text weight="semiBold" style={styles.itemLabel}>{item.label}</Text><View style={[styles.badge, item.criticality === "Critical" ? styles.badgeCritical : item.criticality === "Important" ? styles.badgeImportant : styles.badgeRoutine]}><Text size="xs" weight="bold" color={item.criticality === "Critical" ? "#991b1b" : item.criticality === "Important" ? "#92400e" : "#334155"}>{item.criticality}</Text></View></View><Text style={styles.body}>{item.value}</Text></View>)}</View>)}
      <View style={styles.section}><Text size="lg" weight="bold">Read and acknowledge</Text><Text size="sm" color="#475569" style={styles.attestation}>{pack.attestation}</Text>{pack.acknowledgement?.acknowledgedAtUtc ? <View style={styles.success}><MaterialCommunityIcons name="check-decagram" size={22} color="#047857" /><Text weight="semiBold" color="#047857">Acknowledged</Text></View> : <TouchableOpacity accessibilityRole="button" style={styles.primaryButton} disabled={busy} onPress={acknowledge}><Text weight="bold" color="#fff">{busy ? "Saving…" : "I have read and understood"}</Text></TouchableOpacity>}
        <TextInput multiline value={note} onChangeText={setNote} placeholder="Something unclear? Ask your supervisor here…" style={styles.input} /><TouchableOpacity accessibilityRole="button" style={styles.secondaryButton} disabled={busy || !note.trim()} onPress={clarify}><Text weight="semiBold" color="#102a56">Request clarification</Text></TouchableOpacity>
      </View>
    </>}
    <Text size="xs" color="#64748b" style={styles.center}>Care-plan access and acknowledgement are separate from clock-in, clock-out and attendance.</Text>
  </ScrollView>}</ScreenWrapper>;
}

const styles = StyleSheet.create({
  page: { padding: 16, paddingBottom: 42, gap: 14 }, loading: { flex: 1, alignItems: "center", justifyContent: "center" }, hero: { backgroundColor: "#111442", borderRadius: 18, padding: 20, gap: 6 }, eyebrow: { color: "#7dd3fc", letterSpacing: 1 }, heroCopy: { marginTop: 4, lineHeight: 20 }, section: { backgroundColor: "#fff", borderRadius: 16, padding: 16, gap: 12, borderWidth: 1, borderColor: "#e2e8f0" }, sectionTitle: { textTransform: "none" }, item: { borderRadius: 12, padding: 14, backgroundColor: "#f8fafc", borderLeftWidth: 4, borderLeftColor: "#94a3b8" }, criticalBorder: { borderLeftColor: "#dc2626" }, itemHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }, itemLabel: { flex: 1 }, badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 }, badgeCritical: { backgroundColor: "#fee2e2" }, badgeImportant: { backgroundColor: "#fef3c7" }, badgeRoutine: { backgroundColor: "#e2e8f0" }, body: { marginTop: 8, lineHeight: 22 }, handover: { borderRadius: 12, backgroundColor: "#fffbeb", padding: 14, borderLeftWidth: 4, borderLeftColor: "#f59e0b" }, attestation: { lineHeight: 20 }, primaryButton: { alignItems: "center", borderRadius: 12, backgroundColor: "#0f766e", padding: 15 }, secondaryButton: { alignItems: "center", borderRadius: 12, borderWidth: 1, borderColor: "#102a56", padding: 13 }, input: { minHeight: 88, borderRadius: 12, borderWidth: 1, borderColor: "#cbd5e1", padding: 12, textAlignVertical: "top", color: "#0f172a" }, success: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, backgroundColor: "#d1fae5", padding: 14 }, empty: { alignItems: "center", gap: 8, borderRadius: 16, backgroundColor: "#fff", padding: 30, borderWidth: 1, borderColor: "#e2e8f0" }, emptyTitle: { marginTop: 4 }, center: { textAlign: "center", lineHeight: 19 },
});

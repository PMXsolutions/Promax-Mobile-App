import axiosInstance from "@/libs/axiosInstance";

export type CarePlanItem = {
  clientCarePlanItemId: number;
  sectionCode: string;
  label: string;
  value: string;
  criticality: "Routine" | "Important" | "Critical";
};

export type ShiftCarePlanPack = {
  shift: { shiftRosterId: number; profileId: number; participant?: string; dateFrom: string; dateTo: string };
  plan?: { clientCarePlanVersionId: number; versionNumber: number; title: string; reviewDueAtUtc?: string };
  items: CarePlanItem[];
  acknowledgement?: { viewedAtUtc?: string; acknowledgedAtUtc?: string; clarificationRequestedAtUtc?: string };
  handovers: Array<{ clientHandoverId: number; priority: string; content: string; effectiveAtUtc: string; expiresAtUtc?: string }>;
  attestation: string;
};

export const carePlanService = {
  getShiftPack: async (shiftId: number) =>
    (await axiosInstance.get<ShiftCarePlanPack>(`/client-care-plans/my-shift/${shiftId}`)).data,
  acknowledge: async (shiftId: number, versionId: number) =>
    (await axiosInstance.post(`/client-care-plans/my-shift/${shiftId}/versions/${versionId}/acknowledge`, {
      appVersion: "1.0.0",
      deviceDescription: "PromaxCare mobile app",
    })).data,
  requestClarification: async (shiftId: number, versionId: number, note: string) =>
    (await axiosInstance.post(`/client-care-plans/my-shift/${shiftId}/versions/${versionId}/clarification`, { note })).data,
};

import axiosInstance from "@/libs/axiosInstance";

export type StaffPolicy = {
  userPolicyConsentId: number;
  policyDocumentId: number;
  policyName: string;
  policyUrl: string;
  category?: string;
  audience?: string;
  version?: string;
  requiresConsent: boolean;
  viewedDate?: string;
  consent: boolean;
  consentDate?: string;
  notificationDate?: string;
};

export const policyService = {
  mine: async () => (await axiosInstance.get<{ data: StaffPolicy[] }>("/PolicyDocuments/my-policies")).data.data,
  viewed: async (id: number) => (await axiosInstance.post(`/PolicyDocuments/my-policies/${id}/view`)).data,
  acknowledge: async (id: number) => (await axiosInstance.post(`/PolicyDocuments/my-policies/${id}/acknowledge`)).data,
};

import { MaterialCommunityIcons } from "@expo/vector-icons";

type labelArrProps = {
  title: string;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  url: any;
}[];

export const labelArr: labelArrProps = [
  {
    title: "Identity Card",
    iconName: "account",
    url: "/(root)/profile/identity",
  },
  {
    title: "Personal Information",
    iconName: "book-account",
    url: "/(root)/profile/personal-info",
  },
  {
    title: "Emergency Contact",
    iconName: "contacts",
    url: "/(root)/profile/emergency-info",
  },
  {
    title: "Bank Information",
    iconName: "card-account-details",
    url: "/(root)/profile/bank-info",
  },
  {
    title: "Employment Details",
    iconName: "briefcase-account",
    url: "/(root)/profile/employment-info",
  },
  {
    title: "Other Information",
    iconName: "information",
    url: "/(root)/profile/other-info",
  },
];

export const documentNames = [
  "Current first aid certificate",
  "Current Police check",
  "NDIS orientation module certificate",
  "Working with vulnerable Peoples card",
  "Australian Driver's license",
  "Comprehensive Car Insurance Certificate",
  "Relevant academic certificate",
];

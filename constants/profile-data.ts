import { MaterialCommunityIcons } from "@expo/vector-icons";

type labelArrProps = {
  title: string;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  url: any;
  edit: boolean;
}[];

export const labelArr: labelArrProps = [
  {
    title: "Identity Card",
    iconName: "account",
    url: "/(root)/profile/identity",
    edit: false,
  },

  {
    title: "Personal Information",
    iconName: "book-account",
    url: "/(root)/profile/personal-info",
    edit: true,
  },
  {
    title: "Emergency Contact",
    iconName: "contacts",
    url: "/(root)/profile/emergency-info",
    edit: true,
  },
  {
    title: "Bank Information",
    iconName: "card-account-details",
    url: "/(root)/profile/bank-info",
    edit: false,
  },
  {
    title: "Employment Details",
    iconName: "briefcase-account",
    url: "/(root)/profile/employment-info",
    edit: false,
  },
  {
    title: "Other Information",
    iconName: "information",
    url: "/(root)/profile/other-info",
    edit: true,
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

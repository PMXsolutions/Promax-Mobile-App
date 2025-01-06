import { MaterialCommunityIcons } from "@expo/vector-icons";

type labelArrProps = {
  title: string;
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  url: any;
}[];

export const labelArr: labelArrProps = [
  {
    title: "Identity Card",
    iconName: "account-outline",
    url: "/",
  },
  {
    title: "Personal Information",
    iconName: "book-account-outline",
    url: "/",
  },
  {
    title: "Emergency Contact",
    iconName: "contacts-outline",
    url: "/",
  },
  {
    title: "Bank Information",
    iconName: "card-account-details-outline",
    url: "/",
  },
  {
    title: "Employment Details",
    iconName: "briefcase-account-outline",
    url: "/",
  },
  {
    title: "Other Information",
    iconName: "information-outline",
    url: "/",
  },
];

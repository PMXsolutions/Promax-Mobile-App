import { Feather, MaterialIcons } from "@expo/vector-icons";
import { StyleProp, TouchableOpacityProps, ViewStyle } from "react-native";

declare interface ButtonProps extends TouchableOpacityProps {
  title: string;
  bgVariant?:
    | "primary"
    | "secondary"
    | "danger"
    | "outline"
    | "success"
    | "light";
  textVariant?: "primary" | "default" | "secondary" | "danger" | "success";
  IconLeft?: React.ComponentType<any>;
  IconRight?: React.ComponentType<any>;
  loading?: boolean;
}

declare interface LocationStore {
  userLatitude: number;
  userLongitude: number;
  userAddress: string | null;
  destinationLatitude: number;
  destinationLongitude: number;
  destinationAddress: string | null;
  setUserLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
  setDestinationLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
}

declare interface GoogleInputProps {
  icon?: keyof typeof Feather.glyphMap;
  initialLocation?: string;
  containerStyle?: StyleProp<ViewStyle>;
  placeHolder?: string;

  textInputBackgroundColor?: string;
  handlePress: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
}

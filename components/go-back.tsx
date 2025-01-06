import { router } from "expo-router";
import { Pressable } from "react-native";
import Icon from "@expo/vector-icons/MaterialIcons";
import { THEME } from "@/constants/theme";

const GoBack = ({ mode = "primary" }: { mode?: "primary" | "light" }) => {
  return (
    <Pressable
      style={{
        alignSelf: "flex-start",
        justifyContent: "center",
        alignItems: "center",
        padding: mode === "primary" ? 8 : 0,
        backgroundColor: mode === "primary" ? THEME.colors.primary : "white",
        borderRadius: 100,
      }}
      onPress={router.back}
    >
      <Icon
        name="arrow-back"
        size={24}
        color={mode === "primary" ? "white" : THEME.colors.primary}
      />
    </Pressable>
  );
};
export default GoBack;

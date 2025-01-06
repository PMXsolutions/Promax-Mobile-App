import React, { useState } from "react";
import { View, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { CollapsableContainer } from "../wrapper/collapsible-wrapper";
import Text from "./text";

const ListDisplay = ({
  title,
  children,
  iconName,
}: {
  title: string;
  children: React.ReactNode;
  iconName: keyof typeof MaterialIcons.glyphMap;
}) => {
  const [expanded, setExpanded] = useState(true);

  const onItemPress = () => {
    setExpanded(!expanded);
  };

  return (
    <View style={styles.wrap}>
      <TouchableWithoutFeedback onPress={onItemPress}>
        <View style={styles.container}>
          <View style={styles.textContainer}>
            <View
              style={{ flexDirection: "row", gap: 10, alignItems: "center" }}
            >
              <MaterialIcons name={iconName} size={18} color={"#5C5C5C"} />
              <Text weight="semiBold" size="lg" style={styles.title}>
                {title}
              </Text>
            </View>
            <MaterialIcons
              name={expanded ? "keyboard-arrow-down" : "keyboard-arrow-right"}
              size={20}
              color={"#5C5C5C"}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>

      <CollapsableContainer expanded={expanded}>
        {children}
      </CollapsableContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    borderColor: "#ccc",
    // borderWidth: 1,
    marginVertical: 20,
    borderRadius: 5,
    backgroundColor: "#fff",
    // elevation: 3,
    // shadowColor: theme.colors.grayBg,
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.2,
    // shadowRadius: 2,
  },
  container: {
    // flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  textContainer: {
    justifyContent: "space-between",
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    color: "#030229",
  },
});

export default ListDisplay;

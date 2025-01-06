import React, { useState } from "react";
import { StyleSheet, TextInput, View, Pressable } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { THEME } from "@/constants/theme";

const Search = ({
  placeholder = "Search...", // Allows custom placeholder
  onSearch, // Callback for search text
  initialValue = "", // Initial value for the search field
}: {
  placeholder: string;
  initialValue: string;
  onSearch: (text: string) => void;
}) => {
  const [search, setSearch] = useState(initialValue);

  const handleText = (text: string) => {
    setSearch(text);
    onSearch(text); // Callback to pass search input back to parent
  };

  const handleClear = () => {
    setSearch("");
    onSearch(""); // Clear the search value and pass an empty string back
  };

  return (
    <View style={styles.searchBar}>
      <View style={styles.searchIcon}>
        <Feather name="search" size={20} color={THEME.colors.grayBg} />
      </View>
      <TextInput
        placeholder={placeholder}
        style={styles.searchInput}
        value={search}
        onChangeText={handleText}
      />
      {search.length > 0 && (
        <Pressable onPress={handleClear} style={styles.closeIcon}>
          <Ionicons name="close" size={22} color={THEME.colors.grayBg} />
        </Pressable>
      )}
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: THEME.colors.lightGray,
    backgroundColor: THEME.colors.white,
    height: 43,
    borderRadius: 5,
  },
  searchIcon: {
    padding: 8,
  },
  searchInput: {
    flex: 1,
    borderRadius: 5,
    paddingVertical: 10,
    fontSize: THEME.fontSize.md,
  },
  closeIcon: {
    backgroundColor: THEME.colors.border,
    padding: 3,
    borderRadius: 5,
    marginRight: 10,
  },
});

import React from "react";
import { View, StyleSheet, TextInput } from "react-native";

const SearchBox = ({ searchQuery, handleSearch }) => {
  console.log("Search: " + searchQuery);
  return (
    <TextInput
      placeholder="Tìm kiếm..."
      clearButtonMode="always"
      style={styles.searchBox}
      autoCapitalize="none"
      autoCorrect={false}
      value={searchQuery}
      onChangeText={handleSearch}
    />
  );
};

const styles = StyleSheet.create({
  searchBox: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
  },
});

export default SearchBox;

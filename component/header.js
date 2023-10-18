import React from "react";
import { StyleSheet, View, Text } from "react-native";

const Header = () => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Xin chào Lê Duy Thái</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    color: "black",
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 20,
  },
});

export default Header;

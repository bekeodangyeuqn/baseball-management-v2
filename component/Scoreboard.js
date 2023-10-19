import React from "react";
import { View, StyleSheet, Image, Text } from "react-native";

const Scoreboard = ({ away, home, awayScore, homeScore }) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View>
          <Image source={{ uri: away.logo }}></Image>
          <Text style={styles.text}>{away.name}</Text>
        </View>
        <Text style={styles.text}>{awayScore}</Text>
      </View>
      <View style={styles.row}>
        <View>
          <Image source={{ uri: home.logo }}></Image>
          <Text style={styles.text}>{home.name}</Text>
        </View>
        <Text style={styles.text}>{homeScore}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    height: 100,
    marginBottom: 10,
  },
  row: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Scoreboard;

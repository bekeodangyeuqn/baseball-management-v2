import React from "react";
import { View, StyleSheet, Image, Text, TouchableOpacity } from "react-native";

const Scoreboard = ({ myTeam, oppTeam, myScore, oppScore }) => {
  return (
    <TouchableOpacity style={styles.container}>
      <View style={styles.row}>
        <View>
          <Text style={styles.text}>{myTeam.name}</Text>
        </View>
        <Text style={styles.text}>{myScore}</Text>
      </View>
      <View style={styles.row}>
        <View>
          <Text style={styles.text}>{oppTeam.name}</Text>
        </View>
        <Text style={styles.text}>{oppScore}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    height: 100,
    margin: 10,
  },
  row: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    color: "green",
  },
});

export default Scoreboard;

import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, StyleSheet, Image, Text, TouchableOpacity } from "react-native";

const Scoreboard = ({ myTeam, oppTeam, myScore, oppScore, status }) => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate("GameDetail")}
    >
      <View style={styles.row}>
        <View>
          <Text style={styles.text}>{myTeam}</Text>
        </View>
        <Text style={styles.text}>{myScore}</Text>
      </View>
      <View style={styles.row}>
        <View>
          <Text style={styles.text}>{oppTeam}</Text>
        </View>
        <Text style={styles.text}>{oppScore}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.text}>
          {status === -1
            ? "Upcoming"
            : status === 0
            ? "In progress"
            : "Completed"}
        </Text>
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
    marginTop: 5,
  },
});

export default Scoreboard;

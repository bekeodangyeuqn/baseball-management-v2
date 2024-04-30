import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Text,
} from "react-native";
import Scoreboard from "../../component/Scoreboard";
import { useNavigation } from "@react-navigation/native";
import jwtDecode from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useToast } from "react-native-toast-notifications";
import axiosInstance from "../../lib/axiosClient";
import AddIcon from "../../component/AddIcon";

const InprogressGameScreen = (props) => {
  const navigation = useNavigation();
  const { games, teamName } = props;
  return (
    <View style={styles.container}>
      <View>
        {games.map((game) => {
          if (game.status === 0) {
            return (
              <Scoreboard
                myTeam={teamName}
                oppTeam={game.oppTeam}
                myScore={game.team_score}
                oppScore={game.opp_score}
                status={game.status}
                game={game}
              />
            );
          }
        })}
      </View>
      <View style={{ position: "absolute", right: 20, bottom: 50, zIndex: 4 }}>
        <TouchableOpacity onPress={() => navigation.navigate("CreateGame")}>
          <AddIcon />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  buttonHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  button: {
    marginBottom: 5,
    borderStyle: "solid",
    borderColor: "black",
    backgroundColor: "green",
    padding: 4,
    marginRight: 4,
  },
  textButton: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
});

export default InprogressGameScreen;

import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import Scoreboard from "../../component/Scoreboard";
import { useNavigation } from "@react-navigation/native";
import jwtDecode from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useToast } from "react-native-toast-notifications";
import axiosInstance from "../../lib/axiosClient";

const UpcomingGameScreen = (props) => {
  const navigation = useNavigation();
  const { games, teamName } = props;
  return (
    <View style={styles.container}>
      {games && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
      <View style={styles.container}>
        <View style={styles.buttonHeader}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("CreateGame")}
          >
            <Text style={styles.textButton}>Thêm trận đấu</Text>
          </TouchableOpacity>
        </View>
        {games.map((game) => {
          if (game.status === -1) {
            return (
              <Scoreboard
                key={game.id}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    height: "100%",
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default UpcomingGameScreen;

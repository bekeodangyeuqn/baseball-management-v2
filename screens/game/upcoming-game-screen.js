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

const hro = {
  name: "Red Owls",
};

const ulis = {
  name: "Devil Bats",
};

const archers = {
  name: "Archers",
};

const UpcomingGameScreen = () => {
  const navigation = useNavigation();
  const [teamid, setTeamId] = useState(null);
  useEffect(() => {
    const getInfo = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        const decoded = jwtDecode(token);
        setTeamId(decoded.teamid);
      } catch (error) {
        console.log(error);
      }
    };
    getInfo().catch((error) => console.error(error));
  });
  return (
    <View>
      <View style={styles.buttonHeader}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("CreateGame")}
        >
          <Text style={styles.textButton}>Thêm trận đấu</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <Scoreboard
          myTeam={hro}
          oppTeam={ulis}
          myScore={7}
          oppScore={6}
        ></Scoreboard>
        <Scoreboard
          myTeam={hro}
          oppTeam={archers}
          myScore={4}
          oppScore={25}
        ></Scoreboard>
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
  },
});

export default UpcomingGameScreen;

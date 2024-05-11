import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRecoilState, useRecoilValue } from "recoil";
import { myGamePlayers, myGamePlayersByGameId } from "../atom/GamePlayers";
import { useRoute } from "@react-navigation/native";
import axiosInstance from "../lib/axiosClient";
import { Row, Rows, Table } from "react-native-table-component";
import { playersState } from "../atom/Players";
import { useToast } from "react-native-toast-notifications";

const GameBattingScreen = () => {
  const toast = useToast();
  const route = useRoute();
  const gameid = route.params.gameid;
  const players = route.params.players;
  const [batting, setBatting] = useState([]);
  const [recoilBatting, setRecoilBatting] = useRecoilState(myGamePlayers);
  const gameBattings = useRecoilValue(myGamePlayersByGameId(gameid));
  const placeholderData = new Array(10).fill([
    "...",
    "...",
    "...",
    "...",
    "...",
    "...",
    "...",
    "...",
    "...",
    "...",
    "...",
    "...",
    "...",
  ]);
  let tableHead = [
    "",
    "Player",
    "AB",
    "R",
    "H",
    "BB",
    "RBI",
    "SB",
    "SO",
    "AVG",
    "OBP",
    "SLG",
    "LOB",
  ];

  let widthArr = [50, 150, 50, 50, 50, 50, 50, 50, 50, 75, 75, 75, 50];
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const getInfo = async () => {
      console.log("Call func");
      try {
        if (gameBattings.length > 0) {
          let data = gameBattings.map((obj) => {
            return {
              ...obj,
              player: players.find((p) => p.id === obj.player_id),
            };
          });
          setBatting(data);
          data = data.filter(
            (obj) => obj.playedPos.includes(1) == false || obj.battingOrder <= 9
          );
          data = data.sort((a, b) => a.battingOrder - b.battingOrder);
          setTableData((prev) => {
            let temp = [];
            data.map((obj, index) => {
              const playerExists = temp.some((playerData) =>
                playerData[1].props.children.props.children.includes(
                  `#${obj.jerseyNumber}.${obj.firstName} ${obj.lastName}`
                )
              );
              if (!playerExists) {
                temp.push([
                  index + 1,
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("PlayerProfile", { id: obj.id })
                    }
                  >
                    <Text
                      style={{ textAlign: "center" }}
                    >{`#${obj.player.jerseyNumber}.${obj.player.firstName} ${obj.player.lastName}`}</Text>
                  </TouchableOpacity>,
                  obj.atBat,
                  obj.run,
                  obj.hit,
                  obj.baseOnBall,
                  obj.runBattedIn,
                  obj.stolenBase,
                  obj.strikeOut,
                  obj.battingAverage,
                  obj.onBasePercentage,
                  obj.sluggingPercentage,
                  obj.leftOnBase,
                ]);
              }
            });
            return temp;
          });
        } else {
          const { data } = await axiosInstance.get(
            `/playergames/game/${gameid}/`
          );
          let data1 = data.map((obj) => {
            return {
              ...obj,
              player: players.find((p) => p.id === obj.player_id),
            };
          });
          setBatting(data1);
          setRecoilBatting((prev) => [...prev, ...data1]);
          data1 = data1.filter(
            (obj) => obj.playedPos.includes(1) == false || obj.battingOrder <= 9
          );
          data1 = data1.sort((a, b) => a.battingOrder - b.battingOrder);
          setTableData((prev) => {
            let temp = [];
            data1.map((obj, index) => {
              const playerExists = temp.some((playerData) =>
                playerData[1].props.children.props.children.includes(
                  `#${obj.jerseyNumber}.${obj.firstName} ${obj.lastName}`
                )
              );
              if (!playerExists) {
                temp.push([
                  index + 1,
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("PlayerProfile", { id: obj.id })
                    }
                  >
                    <Text
                      style={{ textAlign: "center" }}
                    >{`#${obj.player.jerseyNumber}.${obj.player.firstName} ${obj.player.lastName}`}</Text>
                  </TouchableOpacity>,
                  obj.atBat,
                  obj.run,
                  obj.hit,
                  obj.baseOnBall,
                  obj.runBattedIn,
                  obj.stolenBase,
                  obj.strikeOut,
                  obj.battingAverage,
                  obj.onBasePercentage,
                  obj.sluggingPercentage,
                  obj.leftOnBase,
                ]);
              }
            });
            return temp;
          });
        }
      } catch (error) {}
    };
    getInfo();
  }, []);
  return (
    <View style={styles.container}>
      <ScrollView>
        <ScrollView horizontal={true}>
          <Table borderStyle={{ borderWidth: 2, borderColor: "#c8e1ff" }}>
            <Row
              data={tableHead}
              widthArr={widthArr}
              style={styles.head}
              textStyle={styles.text}
            />
            <Rows
              data={tableData.length <= 0 ? placeholderData : tableData}
              widthArr={widthArr}
              textStyle={styles.text}
            />
          </Table>
        </ScrollView>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 30,
    backgroundColor: "#fff",
  },
  head: { height: 40, backgroundColor: "#f1f8ff" },
  text: { margin: 6, textAlign: "center" },
  button: {
    width: 300,
    height: 40,
    backgroundColor: "#000",
    color: "#fff",
    borderRadius: 5,
    marginTop: 20,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});

export default GameBattingScreen;

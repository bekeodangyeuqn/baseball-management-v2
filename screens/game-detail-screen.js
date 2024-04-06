import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
} from "react-native";
import HorizontalTable from "../component/HorizontalTable";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode from "jwt-decode";
import { useToast } from "react-native-toast-notifications";
import axiosInstance from "../lib/axiosClient";
import {
  RecoilLoadable,
  useRecoilState,
  useRecoilStateLoadable,
  useRecoilValue,
  useRecoilValueLoadable,
} from "recoil";
import { playersAsyncSelector, playersState } from "../atom/Players";
import { myGamePlayers, myGamePlayersByGameId } from "../atom/GamePlayers";
import {
  atBatsSelectorByGameId,
  atBatsState,
  lastStatusState,
} from "../atom/AtBats";
import { gamesState } from "../atom/Games";

const GameDetailScreen = () => {
  const navigation = useNavigation();
  const [teamid, setTeamId] = useState(null);
  const [teamName, setTeamName] = useState(null);
  const route = useRoute();
  const [game, setGame] = useState();
  const [recoilGames, setRecoilGames] = useRecoilState(gamesState);
  const gameid = route.params.game.id;
  const status = route.params.game.status;
  const oppTeamShort = route.params.game.oppTeamShort;
  const timeStart = route.params.game.timeStart;
  const timeEnd = route.params.game.timeEnd;
  const description = route.params.game.description;
  const stadium = route.params.game.stadium;
  const toast = useToast();
  const [isLoadingToGame, setIsLoadingToGame] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [gamePlayers, setGamePlayers] = useRecoilState(myGamePlayers);
  const gamePlayersByGameId = useRecoilValue(myGamePlayersByGameId(gameid));
  const atBatsByGameId = useRecoilValue(atBatsSelectorByGameId(gameid));
  const [players, setPlayers] = useState(null);
  const [recoilAtBats, setRecoilAtBats] = useRecoilState(atBatsState);
  const [recoilLastState, setRecoilLastState] = useRecoilState(lastStatusState);
  const [gameData, setGameData] = useState({});

  const [recoilPlayers, setRecoilPlayers] = useRecoilState(playersState);

  useEffect(() => {
    const getInfo = async () => {
      try {
        setIsLoading(true);
        const token = await AsyncStorage.getItem("access_token");
        const decoded = jwtDecode(token);
        const savedGame = recoilGames.find(
          (game) => game.id == gameid && game.team_inning_score
        );
        if (!savedGame) {
          const { data } = await axiosInstance.get(`/game/${gameid}`);
          setGame(data);
          setGameData({
            tableHead: [
              "",
              "1",
              "2",
              "3",
              "4",
              "5",
              "6",
              "7",
              "8",
              "9",
              "R",
              "H",
              "E",
            ],
            widthArr: [50, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25],
            tableData: [
              [
                `${decoded.shortName}`,
                data.team_inning_score[0] ? data.team_inning_score[0] : "",
                data.team_inning_score[1] ? data.team_inning_score[1] : "",
                data.team_inning_score[2] ? data.team_inning_score[2] : "",
                data.team_inning_score[3] ? data.team_inning_score[3] : "",
                data.team_inning_score[4] ? data.team_inning_score[4] : "",
                data.team_inning_score[5] ? data.team_inning_score[5] : "",
                data.team_inning_score[6] ? data.team_inning_score[6] : "",
                data.team_inning_score[7] ? data.team_inning_score[7] : "",
                data.team_inning_score[8] ? data.team_inning_score[8] : "",
                data.team_score,
                data.team_hit,
                data.team_error,
              ],
              [
                `${oppTeamShort}`,
                data.opp_inning_score[0] ? data.opp_inning_score[0] : "",
                data.opp_inning_score[1] ? data.opp_inning_score[1] : "",
                data.opp_inning_score[2] ? data.opp_inning_score[2] : "",
                data.opp_inning_score[3] ? data.opp_inning_score[3] : "",
                data.opp_inning_score[4] ? data.opp_inning_score[4] : "",
                data.opp_inning_score[5] ? data.opp_inning_score[5] : "",
                data.opp_inning_score[6] ? data.opp_inning_score[6] : "",
                data.opp_inning_score[7] ? data.opp_inning_score[7] : "",
                data.opp_inning_score[8] ? data.opp_inning_score[8] : "",
                data.opp_score,
                data.opp_hit,
                data.opp_error,
              ],
            ],
          });
        } else {
          setGame(savedGame);
          setGameData({
            tableHead: [
              "",
              "1",
              "2",
              "3",
              "4",
              "5",
              "6",
              "7",
              "8",
              "9",
              "R",
              "H",
              "E",
            ],
            widthArr: [50, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25],
            tableData: [
              [
                `${decoded.shortName}`,
                savedGame.team_inning_score[0]
                  ? savedGame.team_inning_score[0]
                  : "",
                savedGame.team_inning_score[1]
                  ? savedGame.team_inning_score[1]
                  : "",
                savedGame.team_inning_score[2]
                  ? savedGame.team_inning_score[2]
                  : "",
                savedGame.team_inning_score[3]
                  ? savedGame.team_inning_score[3]
                  : "",
                savedGame.team_inning_score[4]
                  ? savedGame.team_inning_score[4]
                  : "",
                savedGame.team_inning_score[5]
                  ? savedGame.team_inning_score[5]
                  : "",
                savedGame.team_inning_score[6]
                  ? savedGame.team_inning_score[6]
                  : "",
                savedGame.team_inning_score[7]
                  ? savedGame.team_inning_score[7]
                  : "",
                savedGame.team_inning_score[8]
                  ? savedGame.team_inning_score[8]
                  : "",
                savedGame.team_score,
                savedGame.team_hit,
                savedGame.team_error,
              ],
              [
                `${oppTeamShort}`,
                savedGame.opp_inning_score[0]
                  ? savedGame.opp_inning_score[0]
                  : "",
                savedGame.opp_inning_score[1]
                  ? savedGame.opp_inning_score[1]
                  : "",
                savedGame.opp_inning_score[2]
                  ? savedGame.opp_inning_score[2]
                  : "",
                savedGame.opp_inning_score[3]
                  ? savedGame.opp_inning_score[3]
                  : "",
                savedGame.opp_inning_score[4]
                  ? savedGame.opp_inning_score[4]
                  : "",
                savedGame.opp_inning_score[5]
                  ? savedGame.opp_inning_score[5]
                  : "",
                savedGame.opp_inning_score[6]
                  ? savedGame.opp_inning_score[6]
                  : "",
                savedGame.opp_inning_score[7]
                  ? savedGame.opp_inning_score[7]
                  : "",
                savedGame.opp_inning_score[8]
                  ? savedGame.opp_inning_score[8]
                  : "",
                savedGame.opp_score,
                savedGame.opp_hit,
                savedGame.opp_error,
              ],
            ],
          });
        }

        if (recoilPlayers.length === 0) {
          const { data } = await axiosInstance.get(
            `/players/team/${decoded.teamid}`
          );
          setPlayers(data);
          setRecoilPlayers(data);
        } else setPlayers(recoilPlayers);
        setTeamId(decoded.teamid);
        setTeamName(decoded.shortName);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        toast.show(error.message, {
          type: "danger",
          placement: "bottom",
          duration: 4000,
          offset: 30,
          animationType: "zoom-in",
        });
      }
    };
    getInfo();
  }, []);

  const handleContinueGame = async () => {
    try {
      let myBatting;
      let atBats;
      setIsLoadingToGame(true);
      if (gamePlayersByGameId.length == 0) {
        const response = await axiosInstance.get(
          `/playergames/game/${gameid}/`
        );
        const data = response.data;
        myBatting = data
          .map((obj) => {
            return {
              ...obj,
              player: players.find((player) => player.id == obj.player_id),
              playerid: obj.player_id,
              gameid: obj.game_id,
            };
          })
          .sort((a, b) => a.battingOrder - b.battingOrder);
        setGamePlayers((prev) => [...prev, ...myBatting]);
      } else {
        myBatting = [...gamePlayersByGameId];
      }
      console.log("My batting complete!");
      console.log(myBatting.find((m) => m.id == 93));
      if (atBatsByGameId.length == 0) {
        const response2 = await axiosInstance.get(`/atbats/game/${gameid}/`);
        const data2 = response2.data;
        atBats = data2
          .map((obj) => {
            let isRunnerFirst = myBatting.find((player) => {
              return obj.isRunnerFirstOff_id == player.id;
            });
            isRunnerFirst = isRunnerFirst ? isRunnerFirst : null;

            let isRunnerSecond = myBatting.find((player) => {
              return obj.isRunnerSecondOff_id == player.id;
            });
            isRunnerSecond = isRunnerSecond ? isRunnerSecond : null;

            let isRunnerThird = myBatting.find((player) => {
              return obj.isRunnerThirdOff_id == player.id;
            });
            isRunnerThird = isRunnerThird ? isRunnerThird : null;

            let currentPitcher = myBatting.find((player) => {
              return obj.currentPitcher_id == player.id;
            });
            currentPitcher = currentPitcher ? currentPitcher : null;
            return {
              ...obj,
              isRunnerFirst:
                obj.isOffense == 1 ? isRunnerFirst : obj.isRunnerFirstDef,
              isRunnerSecond:
                obj.isOffense == 1 ? isRunnerSecond : obj.isRunnerSecondDef,
              isRunnerThird:
                obj.isOffense == 1 ? isRunnerThird : obj.isRunnerThirdDef,
              currentPitcher: currentPitcher,
              gameid: obj.game_id,
            };
          })
          .sort((a, b) => a.id - b.id);
        setRecoilAtBats((prev) => [...prev, ...atBats]);
        setRecoilLastState((prev) => [
          ...prev.filter(
            (la) => la.atBat.gameid !== atBats[atBats.length - 1].gameid
          ),
          {
            myBatting: myBatting,
            atBat: atBats[atBats.length - 1],
          },
        ]);
      } else {
        atBats = [...atBatsByGameId];
      }
      setIsLoadingToGame(false);
      navigation.navigate("PlayByPlay", {
        gameid: gameid,
        myBatting: myBatting,
        beforeId: atBats[atBats.length - 1].isOffense,
      });
      return myBatting;
    } catch (error) {
      toast.show(error.message, {
        type: "danger",
        placement: "bottom",
        duration: 4000,
        offset: 30,
        animationType: "zoom-in",
      });
      setIsLoadingToGame(false);
    }
  };

  if (isLoading || !gameData) {
    return (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView>
      <View style={styles.result}>
        <Text style={styles.resultText}>{teamName}</Text>
        <Text style={styles.resultText}>
          {status === -1
            ? "Upcoming"
            : status === 0
            ? "In progess"
            : "Completed"}
        </Text>
        <Text style={styles.resultText}>{oppTeamShort}</Text>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          if (status === -1)
            navigation.navigate("GamePlayerSelect", {
              teamid: teamid,
              gameid: gameid,
            });
          else {
            handleContinueGame();
          }
        }}
      >
        <Text style={styles.textButton}>
          {status === -1
            ? "Play ball"
            : status === 0
            ? "Tiếp tục"
            : "Đã kết thúc"}
        </Text>
      </TouchableOpacity>
      <View style={{ borderTop: "1px solid green" }}>
        <HorizontalTable data={gameData} />
      </View>
      <View style={styles.title}>
        <Text style={styles.titleText}>Diễn biến trận đấu</Text>
      </View>
      <TouchableOpacity style={styles.subTitle}>
        <Text style={styles.subTitleText}>Pitch by pitch</Text>
      </TouchableOpacity>
      <View style={styles.title}>
        <Text style={styles.titleText}>Thống kê của đội</Text>
      </View>
      <TouchableOpacity style={styles.subTitle}>
        <Text style={styles.subTitleText}>Team Batting</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.subTitle}>
        <Text style={styles.subTitleText}>Team Pitching</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.subTitle}>
        <Text style={styles.subTitleText}>Team Fielding</Text>
      </TouchableOpacity>
      <View style={styles.title}>
        <Text style={styles.titleText}>Thông tin trận đấu</Text>
      </View>
      <View style={styles.row}>
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 20,
            padding: 8,
            color: "white",
          }}
        >
          Bắt đầu
        </Text>
        <Text style={{ color: "white" }}>{timeStart}</Text>
      </View>
      <View style={styles.row}>
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 20,
            padding: 8,
            color: "white",
          }}
        >
          Kết thúc
        </Text>
        <Text style={{ color: "white" }}>{timeEnd ? timeEnd : "Chưa có"}</Text>
      </View>
      <View style={styles.row}>
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 20,
            padding: 8,
            color: "white",
          }}
        >
          Sân vận động
        </Text>
        <Text style={{ color: "white" }}>{stadium}</Text>
      </View>
      <View style={styles.row}>
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 20,
            padding: 8,
            color: "white",
          }}
        >
          Mô tả
        </Text>
        <Text style={{ color: "white" }}>{description}</Text>
      </View>
      {isLoadingToGame && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  result: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderBottom: "1px solid green",
    marginTop: 10,
  },
  resultText: {
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  button: {
    marginBottom: 5,
    marginTop: 5,
    borderStyle: "solid",
    borderColor: "black",
    backgroundColor: "green",
    padding: 4,
    marginRight: 4,
    alignItems: "center",
    justifyContent: "center",
    marginEnd: "auto",
    marginStart: "auto",
  },
  textButton: {
    padding: 4,
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  title: {
    backgroundColor: "green",
    marginTop: 10,
    paddingTop: 5,
    paddingBottom: 5,
  },
  titleText: {
    color: "white",
    fontSize: 16,
    padding: 4,
  },
  subTitle: {
    backgroundColor: "#365731",
  },
  subTitleText: {
    color: "white",
    fontSize: 20,
    padding: 8,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#365731",
    borderBottomWidth: 1,
    flexDirection: "row",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default GameDetailScreen;

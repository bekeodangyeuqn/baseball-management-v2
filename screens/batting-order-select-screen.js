import React, { useEffect, useState } from "react";
import { View, StyleSheet, SafeAreaView, Pressable } from "react-native";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  myBattingOrder,
  myGamePlayers,
  myGamePlayersByGameId,
} from "../atom/GamePlayers";
import DraggableFlatList from "react-native-draggable-flatlist";
import { Text } from "react-native";
import BattingOrderItem from "../component/BattingOrderItem";
import { useNavigation, useRoute } from "@react-navigation/native";
import axiosInstance from "../lib/axiosClient";
import { useToast } from "react-native-toast-notifications";
import { ActivityIndicator } from "react-native";
import { playersAsyncSelector } from "../atom/Players";
import { gamesState } from "../atom/Games";
import { atBatsState, lastStatusState } from "../atom/AtBats";

const BattingOrderSelectScreen = () => {
  const route = useRoute();
  const gameid = route.params.gameid;
  const teamid = route.params.teamid;
  const navigation = useNavigation();
  const players = useRecoilValue(myGamePlayersByGameId(gameid));
  const [myPlayers, setMyPlayers] = useState(players);
  const [isLoading, setIsLoading] = useState(false);
  const [recoilAtBat, setRecoilAtBat] = useRecoilState(atBatsState);
  const toast = useToast();
  const allPlayers = useRecoilValue(playersAsyncSelector(teamid));
  const [recoilGames, setRecoilGames] = useRecoilState(gamesState);
  const [lastState, setLastState] = useRecoilState(lastStatusState);

  useEffect(() => {
    if (myPlayers.length === 10) {
      setMyPlayers((curPlayers) => {
        const pitcher = curPlayers.find((obj) => obj.position === 1);
        return [...curPlayers.filter((obj) => obj.position !== 1), pitcher];
      });
    }
  }, []);

  const updateGameInProgress = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.patch(`/game/updates/${gameid}/`, {
        status: 0,
      });
      console.log("Game updated:", response.data);
      setRecoilGames((prev) => [
        ...prev.filter((game) => game.id != gameid),
        response.data,
      ]);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      toast.show(`Lỗi khi gửi dữ liệu lên server: ${error.message}`, {
        type: "danger",
        placement: "bottom",
        duration: 4000,
        offset: 30,
        animationType: "zoom-in",
      });
    }
  };
  console.log(myPlayers);
  const savePlayerToServer = async () => {
    setIsLoading(true);
    try {
      const promises = myPlayers.map(async (mp, index) => {
        try {
          const response = await axiosInstance.post(`/playergame/create/`, {
            player_id: mp.player.id,
            game_id: gameid,
            plateApperance: mp.plateApperance,
            battingOrder: index + 1,
            runBattedIn: mp.runBattedIn,
            single: mp.single,
            double: mp.double,
            triple: mp.triple,
            homeRun: mp.homeRun,
            baseOnBall: mp.baseOnBall,
            intentionalBB: mp.intentionalBB,
            hitByPitch: mp.hitByPitch,
            strikeOut: mp.strikeOut,
            fielderChoice: mp.fielderChoice,
            sacrificeFly: mp.sacrificeFly,
            sacrificeBunt: mp.sacrificeBunt,
            stolenBase: mp.stolenBase,
            leftOnBase: mp.leftOnBase,
            doublePlay: mp.doublePlay,
            triplePlay: mp.triplePlay,
            run: mp.run,
            onBaseByError: mp.onBaseByError,
            position: mp.position,
            playedPos: mp.playedPos,
            putOut: mp.putOut,
            assist: mp.assist,
            error: mp.error,
            pitchBall: mp.pitchBall,
            pitchStrike: mp.pitchStrike,
            totalBatterFaced: mp.totalBatterFaced,
            totalInGameOut: mp.totalInGameOut,
            oppHit: mp.oppHit,
            oppRun: mp.oppRun,
            earnedRun: mp.earnedRun,
            oppBaseOnBall: mp.oppBaseOnBall,
            oppStrikeOut: mp.oppStrikeOut,
            hitBatter: mp.hitBatter,
            balk: mp.balk,
            wildPitch: mp.wildPitch,
            oppHomeRun: mp.oppHomeRun,
            firstPitchStrike: mp.firstPitchStrike,
            pickOff: mp.pickOff,
          });
          return response;
        } catch (error) {
          console.error(`Error with player ${index}:`, error);
          return error;
        }
      });
      const responses = await Promise.all(promises);
      let haveError = false;
      for (const response of responses) {
        if (!response.data) {
          haveError = true;
          break;
        }
      }
      let newPlayers = responses.map((obj) => {
        return {
          ...obj.data,
          player: allPlayers.find((p) => p.id === obj.data.player_id),
          gameid: obj.data.game_id,
        };
      });
      setMyPlayers((prev) => {
        if (haveError) return prev;
        else {
          let newPlayers = responses.map((obj) => {
            return {
              ...obj.data,
              player: allPlayers.find((p) => p.id === obj.data.player_id),
              gameid: obj.data.game_id,
            };
          });
          if (prev.length > 0)
            return [
              ...prev.filter((obj) => obj.gameid !== gameid),
              ...newPlayers,
            ];
          else return [...newPlayers];
        }
      });
      setIsLoading(false);
      if (!haveError) {
        navigation.navigate("PlayBall", {
          gameid: gameid,
          myBatting: newPlayers,
        });
      }
    } catch (e) {
      setIsLoading(false);
      toast.show(`Lỗi khi gửi dữ liệu lên server: ${e.message}`, {
        type: "danger",
        placement: "bottom",
        duration: 4000,
        offset: 30,
        animationType: "zoom-in",
      });
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <Text
        style={{
          fontSize: 30,
          alignContent: "center",
          paddingTop: 90,
          fontWeight: "bold",
        }}
      >
        BATTING ORDER
      </Text>
      <DraggableFlatList
        data={myPlayers}
        renderItem={({ item, getIndex, drag, isActive }) => {
          const isLastItem = getIndex() === 9;

          return (
            <BattingOrderItem
              obj={item}
              drag={isLastItem ? undefined : drag} // Don't pass the drag function if it's the last item
              isActive={isLastItem ? false : isActive}
              index={getIndex()}
            />
          );
        }}
        keyExtractor={(item) => item.player.id}
        onDragEnd={({ data }) => {
          const lastItem = myPlayers[myPlayers.length - 1];
          const lastIndexInNewData = data.indexOf(lastItem);

          if (lastIndexInNewData !== myPlayers.length - 1) {
            // The last item has been moved, move it back to the end
            data.splice(lastIndexInNewData, 1);
            data.push(lastItem);
          }

          setMyPlayers(data);
        }}
      />
      <Pressable
        style={{ ...styles.button }}
        onPress={() => {
          // updateGameInProgress();
          savePlayerToServer();
        }}
      >
        <Text style={{ fontWeight: "bold" }}>Let's play</Text>
      </Pressable>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    backgroundColor: "orange",
    width: "90%",
    margin: 5,
    padding: 10,
    borderRadius: 50,
    alignItems: "center",
    marginTop: "auto",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default BattingOrderSelectScreen;

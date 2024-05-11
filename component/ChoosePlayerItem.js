import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useRecoilState } from "recoil";
import { myGamePlayers } from "../atom/GamePlayers";

const ChoosePlayerItem = (props) => {
  const { player, pos, gameid, ingame, posRun } = props;

  const [myBatting, setMyBatting] = ingame ? props.functions : useState(null);
  const [atBat, setAtBat] = ingame ? props.functionsAB : useState(null);
  const [atBatStatus, setAtBatStatus] = ingame
    ? props.functionABS
    : useState(null);
  const position = ["DH", "P", "C", "1B", "2B", "3B", "SS", "OF", "None"];
  const splitAvatarURI = (str) => {
    const arr = str.split("?");
    return arr[0];
  };
  const [myPlayers, setMyPlayers] = useRecoilState(myGamePlayers);
  console.log(ingame);
  const onPress = (pos) => {
    let samePosPLayer = ingame
      ? myBatting.find((obj) => obj.position === pos)
      : null;
    let samePosPlayerId = ingame
      ? myBatting.findIndex((obj) => obj.position === pos)
      : null;
    let newPlayer = {
      player: player,
      position: pos,
      gameid: gameid,
      battingOrder: ingame ? samePosPLayer.battingOrder : 1,
      plateApperance: 0,
      runBattedIn: 0,
      single: 0,
      double: 0,
      triple: 0,
      homeRun: 0,
      baseOnBall: 0,
      intentionalBB: 0,
      hitByPitch: 0,
      strikeOut: 0,
      fielderChoice: 0,
      sacrificeFly: 0,
      sacrificeBunt: 0,
      stolenBase: 0,
      leftOnBase: 0,
      doublePlay: 0,
      triplePlay: 0,
      run: 0,
      onBaseByError: 0,
      putOut: 0,
      assist: 0,
      error: 0,
      playedPos: [pos],
      pitchBall: 0,
      pitchStrike: 0,
      totalBatterFaced: 0,
      totalInGameOut: 0,
      oppHit: 0,
      oppRun: 0,
      earnedRun: 0,
      oppBaseOnBall: 0,
      oppStrikeOut: 0,
      hitBatter: 0,
      balk: 0,
      wildPitch: 0,
      oppHomeRun: 0,
      firstPitchStrike: 0,
      pickOff: 0,
    };
    if (ingame) {
      // const samePosPLayer = myBatting.find((obj) => obj.position === pos);
      // const samePosPlayerId = myBatting.findIndex(
      //   (obj) => obj.position === pos
      // );
      setMyBatting((prev) => {
        if (!prev.some((obj) => obj.player.id === player.id)) {
          let newBatting = [...prev];
          newBatting.push(samePosPLayer);
          newBatting.splice(samePosPlayerId, 1, newPlayer);
          return newBatting;
        } else {
          const curPlayerInGame = prev
            .map((obj, index) => {
              return { ...obj, index: index };
            })
            .find((obj, index) => player.id === obj.player.id);
          console.log(curPlayerInGame);
          if (player.id !== samePosPLayer.player.id) {
            let newBatting = [...prev];
            let newPlayer = {
              ...curPlayerInGame,
              playedPos:
                pos !==
                curPlayerInGame.playedPos[curPlayerInGame.playedPos.length - 1]
                  ? [...curPlayerInGame.playedPos, pos]
                  : [...curPlayerInGame.playedPos],
              position: pos,
            };
            if (curPlayerInGame.index <= 9) {
              let changedPlayer = {
                ...samePosPLayer,
                position: curPlayerInGame.position,
                playedPos:
                  curPlayerInGame.position !==
                  samePosPLayer.playedPos[samePosPLayer.playedPos.length - 1]
                    ? [...samePosPLayer.playedPos, curPlayerInGame.position]
                    : [...samePosPLayer.playedPos],
              };
              newBatting.splice(curPlayerInGame.index, 1, newPlayer);
              newBatting.splice(samePosPlayerId, 1, changedPlayer);
            } else {
              newBatting.splice(samePosPlayerId, 1, newPlayer);
              newBatting.push(samePosPLayer);
            }
            return newBatting;
          } else return myBatting;
        }
      });
      if (pos == 1) {
        setAtBat((prev) => {
          return {
            ...prev,
            currentPitcher: newPlayer,
          };
        });
        setAtBatStatus((prev) => {
          return {
            atBat: {
              ...prev.atBat,
              currentPitcher: newPlayer,
            },
            myBatting: prev.myBatting,
          };
        });
      }
    }

    if (posRun && ingame) {
      if (!myBatting.some((obj) => obj.player.id === player.id)) {
        setAtBat((prev) => {
          return {
            ...prev,
            isRunnerFirst: posRun === 11 ? newPlayer : prev.isRunnerFirst,
            isRunnerSecond: posRun === 12 ? newPlayer : prev.isRunnerSecond,
            isRunnerThird: posRun === 13 ? newPlayer : prev.isRunnerThird,
          };
        });
        setAtBatStatus((prev) => {
          return {
            atBat: {
              ...prev.atBat,
              isRunnerFirst:
                posRun === 11 ? newPlayer : prev.atBat.isRunnerFirst,
              isRunnerSecond:
                posRun === 12 ? newPlayer : prev.atBat.isRunnerSecond,
              isRunnerThird:
                posRun === 13 ? newPlayer : prev.atBat.isRunnerThird,
            },
            myBatting: prev.myBatting,
          };
        });
      }
    }

    setMyPlayers((curPlayers) => {
      if (
        curPlayers.some(
          (obj) => obj.player.id === player.id && obj.gameid === gameid
        )
      ) {
        if (!ingame)
          return curPlayers.filter(
            (obj) =>
              obj.player.id !== player.id ||
              (obj.gameid !== gameid && obj.player.id === player.id)
          );
        else return curPlayers;
      }
      if (
        curPlayers.some((obj) => {
          return obj.position === pos && obj.gameid === gameid;
        })
      ) {
        return [
          ...curPlayers.filter((obj) => {
            if (ingame) return true;
            if (obj.gameid !== gameid) return true;
            else {
              if (obj.position === pos) return false;
              else return true;
            }
          }),
          {
            player,
            position: pos,
            gameid: gameid,
            plateApperance: 0,
            runBattedIn: 0,
            single: 0,
            double: 0,
            triple: 0,
            homeRun: 0,
            baseOnBall: 0,
            intentionalBB: 0,
            hitByPitch: 0,
            strikeOut: 0,
            fielderChoice: 0,
            sacrificeFly: 0,
            sacrificeBunt: 0,
            stolenBase: 0,
            leftOnBase: 0,
            doublePlay: 0,
            triplePlay: 0,
            run: 0,
            onBaseByError: 0,
            putOut: 0,
            assist: 0,
            error: 0,
            playedPos: [pos],
            pitchBall: 0,
            pitchStrike: 0,
            totalBatterFaced: 0,
            totalInGameOut: 0,
            oppHit: 0,
            oppRun: 0,
            earnedRun: 0,
            oppBaseOnBall: 0,
            oppStrikeOut: 0,
            hitBatter: 0,
            balk: 0,
            wildPitch: 0,
            oppHomeRun: 0,
            firstPitchStrike: 0,
            pickOff: 0,
          },
        ];
      }
      return [
        ...curPlayers,
        {
          player,
          position: pos,
          gameid: gameid,
          plateApperance: 0,
          runBattedIn: 0,
          single: 0,
          double: 0,
          triple: 0,
          homeRun: 0,
          baseOnBall: 0,
          intentionalBB: 0,
          hitByPitch: 0,
          strikeOut: 0,
          fielderChoice: 0,
          sacrificeFly: 0,
          sacrificeBunt: 0,
          stolenBase: 0,
          leftOnBase: 0,
          doublePlay: 0,
          triplePlay: 0,
          run: 0,
          onBaseByError: 0,
          putOut: 0,
          assist: 0,
          error: 0,
          playedPos: [pos],
          pitchBall: 0,
          pitchStrike: 0,
          totalBatterFaced: 0,
          totalInGameOut: 0,
          oppHit: 0,
          oppRun: 0,
          earnedRun: 0,
          oppBaseOnBall: 0,
          oppStrikeOut: 0,
          hitBatter: 0,
          balk: 0,
          wildPitch: 0,
          oppHomeRun: 0,
          firstPitchStrike: 0,
          pickOff: 0,
        },
      ];
    });
  };
  const isSelected = myPlayers.some((obj) => {
    return obj.player.id === player.id && obj.gameid === gameid;
  });
  return (
    <Pressable
      onPress={() => onPress(pos)}
      style={{
        ...styles.container,
        backgroundColor: isSelected ? "green" : "white",
      }}
    >
      <Image
        style={styles.image}
        resizeMode="contain"
        source={{
          uri: splitAvatarURI(player.avatar),
        }}
      />

      <View style={{ flexGrow: 1 }}>
        <Text
          style={{ ...styles.title, color: isSelected ? "white" : "black" }}
        >
          Họ tên:
        </Text>
        <Text
          style={{ ...styles.content, color: isSelected ? "white" : "black" }}
        >{`${player.firstName} ${player.lastName}`}</Text>
      </View>

      <View style={{ marginHorizontal: 15 }}>
        <Text
          style={{ ...styles.title, color: isSelected ? "white" : "black" }}
        >
          Vị trí chính:
        </Text>
        <Text
          style={{ ...styles.content, color: isSelected ? "white" : "black" }}
        >
          {position[player.firstPos]}
        </Text>
      </View>

      <View>
        <Text
          style={{ ...styles.title, color: isSelected ? "white" : "black" }}
        >
          Vị trí phụ:
        </Text>
        <Text
          style={{ ...styles.content, color: isSelected ? "white" : "black" }}
        >
          {position[player.secondPos]}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 4,
    width: "100%",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  image: {
    width: 40,
    height: 40,
    marginEnd: 4,
  },

  title: {
    color: "grey",
  },

  content: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ChoosePlayerItem;

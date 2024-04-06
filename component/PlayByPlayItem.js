import React, { memo } from "react";
import { View, StyleSheet, Text } from "react-native";
import { Entypo, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRecoilValue } from "recoil";
import { gameByIdState } from "../atom/Games";

const PlayByPlayItem = ({ atBat, teamName }) => {
  const game = useRecoilValue(
    gameByIdState(atBat.game_id ? atBat.game_id : atBat.gameid)
  );

  return (
    <View
      style={{
        backgroundColor: "white",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 12,
        paddingHorizontal: 8,
        margin: 10,
      }}
    >
      <View style={styles.scoreBoard}>
        <View style={styles.scoreBoardTeam}>
          <Text style={{ fontWeight: "bold" }}>{teamName}</Text>
          <Text>{atBat.teamScore}</Text>
        </View>
        <View style={styles.scoreBoardTeam}>
          <Text style={{ fontWeight: "bold" }}>{game.oppTeamShort}</Text>
          <Text>{atBat.oppScore}</Text>
        </View>
        <View style={{ flex: 1, flexDirection: "row" }}>
          {atBat.isTop ? (
            <Entypo name="triangle-up" size={15} color="green" />
          ) : (
            <Entypo name="triangle-down" size={15} color="green" />
          )}
          <Text>{atBat.inning}</Text>
        </View>
        <View
          style={{ flex: 1, flexDirection: "row", border: "1px solid black" }}
        >
          <Text>
            {atBat.out} {atBat.out != 1 ? "OUTS" : "OUT"}
          </Text>
        </View>
        <View style={{ flex: 1, flexDirection: "column", height: 35 }}>
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
            <Text>B</Text>
            {atBat.ball >= 1 ? (
              <MaterialCommunityIcons
                name="square-rounded"
                size={15}
                color="green"
              />
            ) : (
              <MaterialCommunityIcons
                name="square-rounded"
                size={15}
                color="grey"
              />
            )}
            {atBat.ball >= 2 ? (
              <MaterialCommunityIcons
                name="square-rounded"
                size={15}
                color="green"
              />
            ) : (
              <MaterialCommunityIcons
                name="square-rounded"
                size={15}
                color="grey"
              />
            )}
            {atBat.ball >= 3 ? (
              <MaterialCommunityIcons
                name="square-rounded"
                size={15}
                color="green"
              />
            ) : (
              <MaterialCommunityIcons
                name="square-rounded"
                size={15}
                color="grey"
              />
            )}
          </View>
          <View style={{ flex: 1, flexDirection: "row" }}>
            <Text>S</Text>
            {atBat.strike >= 1 ? (
              <MaterialCommunityIcons
                name="square-rounded"
                size={15}
                color="red"
              />
            ) : (
              <MaterialCommunityIcons
                name="square-rounded"
                size={15}
                color="grey"
              />
            )}
            {atBat.strike >= 2 ? (
              <MaterialCommunityIcons
                name="square-rounded"
                size={15}
                color="red"
              />
            ) : (
              <MaterialCommunityIcons
                name="square-rounded"
                size={15}
                color="grey"
              />
            )}
          </View>
        </View>
        <View
          style={{ flex: 1, flexDirection: "row", border: "1px solid black" }}
        >
          {atBat.isRunnerThird ? (
            <MaterialCommunityIcons
              name="rhombus"
              size={18}
              color="green"
              style={{ position: "relative", top: 12 }}
            />
          ) : (
            <MaterialCommunityIcons
              name="rhombus"
              size={18}
              color="grey"
              style={{ position: "relative", top: 12 }}
            />
          )}
          {atBat.isRunnerSecond ? (
            <MaterialCommunityIcons name="rhombus" size={18} color="green" />
          ) : (
            <MaterialCommunityIcons name="rhombus" size={18} color="grey" />
          )}
          {atBat.isRunnerFirst ? (
            <MaterialCommunityIcons
              name="rhombus"
              size={18}
              color="green"
              style={{ position: "relative", top: 12 }}
            />
          ) : (
            <MaterialCommunityIcons
              name="rhombus"
              size={18}
              color="grey"
              style={{ position: "relative", top: 12 }}
            />
          )}
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "flex-start",
        }}
      >
        <Text>{atBat.description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scoreBoard: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",

    padding: 10,
    borderBottomColor: "#000000",
    borderBottomWidth: 1,
  },
  scoreBoardTeam: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-around",
    width: "20%",
  },
});

export default memo(PlayByPlayItem);

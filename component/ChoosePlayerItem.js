import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useRecoilState } from "recoil";
import { myGamePlayers } from "../atom/GamePlayers";

const ChoosePlayerItem = (props) => {
  const { player, pos } = props;
  const position = ["DH", "P", "C", "1B", "2B", "3B", "SS", "OF", "None"];
  const splitAvatarURI = (str) => {
    const arr = str.split("?");
    return arr[0];
  };
  const [myPlayers, setMyPlayers] = useRecoilState(myGamePlayers);

  const onPress = (pos) => {
    setMyPlayers((curPlayers) => {
      if (curPlayers.some((obj) => obj.player.id === player.id)) {
        return curPlayers.filter((obj) => obj.player.id !== player.id);
      }
      if (curPlayers.some((obj) => obj.position === pos)) {
        return [
          ...curPlayers.filter((obj) => obj.position !== pos),
          { player, position: pos },
        ];
      }
      return [...curPlayers, { player, position: pos }];
    });
  };
  const isSelected = myPlayers.some((obj) => obj.player.id === player.id);
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

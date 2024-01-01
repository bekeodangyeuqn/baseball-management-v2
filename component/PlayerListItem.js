import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useRecoilState } from "recoil";
import { myGamePlayers } from "../atom/GamePlayers";

const PlayerListItem = (props) => {
  const { player } = props;
  const position = ["DH", "P", "C", "1B", "2B", "3B", "SS", "OF", "None"];
  const splitAvatarURI = (str) => {
    const arr = str.split("?");
    return arr[0];
  };
  return (
    <Pressable
      style={{
        ...styles.container,
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
        <Text style={{ ...styles.title }}>Họ tên:</Text>
        <Text
          style={{ ...styles.content }}
        >{`${player.firstName} ${player.lastName}`}</Text>
      </View>

      <View>
        <Text style={{ ...styles.title }}>Số áo:</Text>
        <Text style={{ ...styles.content }}>{player.jerseyNumber}</Text>
      </View>

      <View style={{ marginHorizontal: 15 }}>
        <Text style={{ ...styles.title }}>Vị trí chính:</Text>
        <Text style={{ ...styles.content }}>{position[player.firstPos]}</Text>
      </View>

      <View>
        <Text style={{ ...styles.title }}>Vị trí phụ:</Text>
        <Text style={{ ...styles.content }}>{position[player.secondPos]}</Text>
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
export default PlayerListItem;

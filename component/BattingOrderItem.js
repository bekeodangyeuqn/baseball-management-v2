import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useRecoilState } from "recoil";
import { myGamePlayers } from "../atom/GamePlayers";
import { ScaleDecorator } from "react-native-draggable-flatlist";

const BattingOrderItem = (props) => {
  const { obj, drag, isActive } = props;
  const positionStr = [
    "DH",
    "P",
    "C",
    "1B",
    "2B",
    "3B",
    "SS",
    "LF",
    "CF",
    "RF",
    "None",
  ];
  const [isDragging, setIsDragging] = useState(false);
  const splitAvatarURI = (str) => {
    const arr = str.split("?");
    return arr[0];
  };
  return (
    <ScaleDecorator>
      <Pressable
        style={{
          ...styles.container,
          backgroundColor: isActive ? "green" : "white",
        }}
        onLongPress={drag}
        disabled={isActive}
        onPressIn={() => setIsDragging(true)}
        onPressOut={() => setIsDragging(false)}
      >
        <Image
          style={styles.image}
          resizeMode="contain"
          source={{
            uri: splitAvatarURI(obj.player.avatar),
          }}
        />

        <View style={{ flexGrow: 1 }}>
          <Text
            style={{ ...styles.title, color: isActive ? "white" : "black" }}
          >
            Họ tên:
          </Text>
          <Text
            style={{ ...styles.content, color: isActive ? "white" : "black" }}
          >{`${obj.player.firstName} ${obj.player.lastName}`}</Text>
        </View>

        <View>
          <Text
            style={{ ...styles.title, color: isActive ? "white" : "black" }}
          >
            Số áo:
          </Text>
          <Text
            style={{ ...styles.content, color: isActive ? "white" : "black" }}
          >
            {obj.player.jerseyNumber}
          </Text>
        </View>

        <View style={{ marginHorizontal: 15 }}>
          <Text
            style={{ ...styles.title, color: isActive ? "white" : "black" }}
          >
            Vị trí:
          </Text>
          <Text
            style={{ ...styles.content, color: isActive ? "white" : "black" }}
          >
            {positionStr[obj.position]}
          </Text>
        </View>
      </Pressable>
    </ScaleDecorator>
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

export default BattingOrderItem;

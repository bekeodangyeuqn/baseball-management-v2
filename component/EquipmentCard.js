import React from "react";
import { Image, Text } from "react-native";
import { View, StyleSheet, Pressable, TouchableOpacity } from "react-native";
import { useRecoilValue } from "recoil";
import { playersState } from "../atom/Players";

const EquipmentCard = ({ item }) => {
  const splitAvatarURI = (str) => {
    const arr = str.split("?");
    return arr[0];
  };
  const players = useRecoilValue(playersState);
  const player = players.find((player) => player.id == item.player_id);
  return (
    <TouchableOpacity
      style={{
        backgroundColor: "white",
        padding: 12,
        paddingHorizontal: 8,
        marginBottom: 10,
        borderRadius: 75,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Image
          style={styles.image}
          resizeMode="contain"
          source={{
            uri: splitAvatarURI(item.avatar),
          }}
        />
        <View style={{ flexGrow: 1, width: "25%" }}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ fontSize: 16, fontWeight: "bold" }}
          >
            {item.name}
          </Text>
        </View>
        <View style={{ paddingRight: 4 }}>
          <Text>Giá</Text>
          <Text style={{ fontWeight: "bold" }}>
            {item.price === null ? "Chưa rõ" : item.price}
          </Text>
        </View>
      </View>
      <Text style={{ padding: 5 }}>
        Người sở hữu:{" "}
        {player
          ? `#.${player.jerseyNumber} ${player.firstName} ${player.lastName}`
          : "Chưa rõ"}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 40,
    height: 40,
    marginEnd: 4,
    marginStart: 8,
  },
});

export default EquipmentCard;

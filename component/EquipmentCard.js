import React from "react";
import { Image, Text } from "react-native";
import { View, StyleSheet, Pressable, TouchableOpacity } from "react-native";

const EquipmentCard = ({ item }) => {
  const splitAvatarURI = (str) => {
    const arr = str.split("?");
    return arr[0];
  };
  return (
    <TouchableOpacity
      style={{
        backgroundColor: "white",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 12,
        paddingHorizontal: 8,
        marginBottom: 10,
        borderRadius: 75,
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
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 40,
    height: 40,
    marginEnd: 4,
  },
});

export default EquipmentCard;

import React from "react";
import { StyleSheet, View, Text, Image } from "react-native";
import { managerByIdState, playerByIdState } from "../atom/Players";
import { useRecoilValue } from "recoil";

const PersonEventItem = (props) => {
  const { person } = props;
  const status = person.status;
  const player = person.player
    ? useRecoilValue(playerByIdState(person.player))
    : useRecoilValue(managerByIdState(person.manager));

  const splitAvatarURI = (str) => {
    const arr = str.split("?");
    return arr[0];
  };
  return (
    <View
      style={{
        ...styles.container,
      }}
    >
      <Image
        style={styles.image}
        resizeMode="contain"
        source={{
          uri: player.avatar
            ? splitAvatarURI(player.avatar)
            : "https://cdn0.iconfinder.com/data/icons/baseball-filledoutline/64/baseball_player-user-boy-sports-avatar-profile-man-people-coach-512.png",
        }}
      />

      <View style={{ flexGrow: 1, width: "30%" }}>
        <Text style={{ ...styles.title }}>Họ tên:</Text>
        <Text
          style={{ ...styles.content }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >{`${player.firstName} ${player.lastName}`}</Text>
      </View>

      <View style={{ flexGrow: 1 }}>
        <Text style={{ ...styles.title }}>Chức vụ:</Text>
        <Text style={{ ...styles.content }}>
          {person.player ? "Player" : "Manager"}
        </Text>
      </View>

      <View style={{ marginHorizontal: 15 }}>
        <Text style={{ ...styles.title }}>Trạng thái:</Text>
        <Text
          style={{
            ...styles.content,
            color: status == 2 ? "orange" : status == 0 ? "red" : "green",
          }}
        >
          {status == 2 ? "Đang chờ" : status == 0 ? "Từ chối" : "Đồng ý"}
        </Text>
      </View>
    </View>
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

export default PersonEventItem;

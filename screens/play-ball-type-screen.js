import React, { useState, useEffect, useMemo } from "react";
import { StyleSheet, Text, View, Button, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import RadioGroup from "react-native-radio-buttons-group";

const PlayBallTypeScreen = () => {
  const navigaton = useNavigation();
  const route = useRoute();
  const gameid = route.params.gameid;
  const [beforeId, setBeforeId] = useState();

  const radioButtons = useMemo(
    () => [
      {
        id: "1",
        label: "Tấn công trước",
        value: 1,
      },
      {
        id: "0",
        label: "Phòng thủ trước",
        value: 0,
      },
    ],
    []
  );
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Play ball</Text>
      <Text style={styles.body}>Hãy lựa chọn cách thức cập nhật trận đấu</Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigaton.navigate("PlayByPlay", {
              gameid: gameid,
              beforeId: beforeId,
            })
          }
        >
          <Text style={styles.textButton}>Play by play</Text>
          <Text style={styles.subTextButton}>
            Cập nhật theo thời gian thực diễn biến trên sân của trận đấu
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            navigaton.navigate("BoxScore", {
              gameid: gameid,
              beforeId: beforeId,
            });
          }}
        >
          <Text style={styles.textButton}>Box score</Text>
          <Text style={styles.subTextButton}>
            Cập nhật kết quả và các thông số sau khi trận đấu đã kết thúc
          </Text>
        </TouchableOpacity>
        <RadioGroup
          radioButtons={radioButtons}
          onPress={setBeforeId}
          selectedId={beforeId}
          layout="row"
        />
      </View>
    </View>
  );
};

export default PlayBallTypeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
  },
  body: {
    fontSize: 16,
    margin: 10,
  },
  actions: {
    flexDirection: "column",
    justifyContent: "space-between",
    width: "80%",
  },
  button: {
    minHeight: 100,
    marginBottom: 10,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "black",
    backgroundColor: "green",
  },
  textButton: {
    marginLeft: 5,
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  subTextButton: {
    marginLeft: 5,
    fontSize: 14,
    color: "white",
  },
  lgbutton: {
    backgroundColor: "red",
    padding: 10,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    borderRadius: 5,
  },
  lgbuttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

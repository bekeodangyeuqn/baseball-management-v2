import React, { useState, useEffect, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import RadioGroup from "react-native-radio-buttons-group";
import { atBatsState } from "../atom/AtBats";
import { useToast } from "react-native-toast-notifications";

const PlayBallTypeScreen = () => {
  const navigaton = useNavigation();
  const route = useRoute();
  const gameid = route.params.gameid;
  const myBatting = route.params.myBatting;
  const [beforeId, setBeforeId] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [recoilAtBat, setRecoilAtBat] = useRecoilState(atBatsState);
  const toast = useToast();

  const addInitAtBat = async () => {
    try {
      setIsLoading(true);
      const initAtBat = {
        game_id: gameid,
        teamScore: 0,
        isLastState: false,
        oppScore: 0,
        out: 0,
        inning: 1,
        isTop: true,
        ball: 0,
        strike: 0,
        isOffense: beforeId,
        isRunnerFirstOff_id: null,
        isRunnerSecondOff_id: null,
        isRunnerThirdOff_id: null,
        currentPitcher_id: null,
        isRunnerFirstDef: null,
        isRunnerSecondDef: null,
        isRunnerThirdDef: null,
        currentPlayer: 0,
        oppCurPlayer: 0,
        outcomeType: null,
        description: "Game start",
      };
      const { data } = await axiosInstance.post("/atbat/create/", initAtBat);
      setRecoilAtBat((prev) => [...prev, data]);
      navigaton.navigate("PlayByPlay", {
        gameid: gameid,
        beforeId: beforeId,
        myBatting: myBatting,
      });
      setIsLoading(false);
    } catch (error) {
      toast.show(`Lỗi khi gửi dữ liệu lên server: ${error.message}`, {
        type: "danger",
        placement: "bottom",
        duration: 4000,
        offset: 30,
        animationType: "zoom-in",
      });
      setIsLoading(false);
    }
  };

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
        <TouchableOpacity style={styles.button} onPress={() => addInitAtBat()}>
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
              myBatting: myBatting,
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
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});

import React, { useEffect, useState } from "react";
import { ScrollView, View, StyleSheet, Text } from "react-native";
import HorizontalTable from "../component/HorizontalTable";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode from "jwt-decode";

const gameData = {
  tableHead: ["", "1", "2", "3", "4", "5", "6", "7", "8", "9", "R", "H", "E"],
  widthArr: [50, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25],
  tableData: [
    ["HRO", "2", "6", "0", "1", "0", "", "", "", "", "9", "5", "5"],
    ["ULIS", "3", "2", "0", "0", "4", "", "", "", "", "9", "10", "6"],
  ],
};

const GameDetailScreen = () => {
  const navigation = useNavigation();
  const [teamid, setTeamId] = useState(null);
  useEffect(() => {
    const getInfo = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        const decoded = jwtDecode(token);
        setTeamId(decoded.teamid);
      } catch (error) {
        toast.show(error.message, {
          type: "danger",
          placement: "bottom",
          duration: 4000,
          offset: 30,
          animationType: "zoom-in",
        });
      }
    };
    getInfo();
  }, []);
  return (
    <ScrollView>
      <View style={styles.result}>
        <Text style={styles.resultText}>HRO 9</Text>
        <Text style={styles.resultText}>FINAL</Text>
        <Text style={styles.resultText}>ULIS 9</Text>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          navigation.navigate("GamePlayerSelect", { teamid: teamid });
        }}
      >
        <Text style={styles.textButton}>Play</Text>
      </TouchableOpacity>
      <View style={{ borderTop: "1px solid green" }}>
        <HorizontalTable data={gameData} />
      </View>
      <View style={styles.title}>
        <Text style={styles.titleText}>Diễn biến trận đấu</Text>
      </View>
      <TouchableOpacity style={styles.subTitle}>
        <Text style={styles.subTitleText}>Pitch by pitch</Text>
      </TouchableOpacity>
      <View style={styles.title}>
        <Text style={styles.titleText}>Thống kê của đội</Text>
      </View>
      <TouchableOpacity style={styles.subTitle}>
        <Text style={styles.subTitleText}>Team Batting</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.subTitle}>
        <Text style={styles.subTitleText}>Team Pitching</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.subTitle}>
        <Text style={styles.subTitleText}>Team Fielding</Text>
      </TouchableOpacity>
      <View style={styles.title}>
        <Text style={styles.titleText}>Thông tin trận đấu</Text>
      </View>
      <View style={styles.row}>
        <Text style={{ fontWeight: "bold", fontSize: 20, padding: 8 }}>
          Bắt đầu
        </Text>
        <Text>2023-12-17 08:00</Text>
      </View>
      <View style={styles.row}>
        <Text style={{ fontWeight: "bold", fontSize: 20, padding: 8 }}>
          Kết thúc
        </Text>
        <Text>2023-12-17 11:00</Text>
      </View>
      <View style={styles.row}>
        <Text style={{ fontWeight: "bold", fontSize: 20, padding: 8 }}>
          Sân vận động
        </Text>
        <Text>Splendora stadium</Text>
      </View>
      <View style={styles.row}>
        <Text style={{ fontWeight: "bold", fontSize: 20, padding: 8 }}>
          Mô tả
        </Text>
        <Text>Mùa đông không lạnh</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  result: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderBottom: "1px solid green",
    marginTop: 10,
  },
  resultText: {
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  button: {
    marginBottom: 5,
    marginTop: 5,
    borderStyle: "solid",
    borderColor: "black",
    backgroundColor: "green",
    padding: 4,
    marginRight: 4,
    alignItems: "center",
    justifyContent: "center",
    marginEnd: "auto",
    marginStart: "auto",
  },
  textButton: {
    padding: 4,
    fontSize: 16,
    fontWeight: "bold",
  },
  title: {
    backgroundColor: "green",
    marginTop: 10,
    paddingTop: 5,
    paddingBottom: 5,
  },
  titleText: {
    color: "white",
    fontSize: 16,
    padding: 4,
  },
  subTitle: {
    backgroundColor: "#365731",
  },
  subTitleText: {
    color: "white",
    fontSize: 20,
    padding: 8,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#365731",
    borderBottomWidth: 1,
    flexDirection: "row",
  },
});

export default GameDetailScreen;

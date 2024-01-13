import React, { useEffect, useState } from "react";
import {
  Image,
  Text,
  Button,
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import HorizontalTable from "../component/HorizontalTable";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../lib/axiosClient";
import { useToast } from "react-native-toast-notifications";
import { useRoute } from "@react-navigation/native";

const tableDataSample = {
  tableHead: [
    "Giai đoạn",
    "AB",
    "R",
    "H",
    "HR",
    "RBI",
    "BB",
    "SO",
    "SB",
    "AVG",
    "OBP",
    "SLG",
  ],
  widthArr: [200, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
  tableData: [
    [
      "3 trận qua",
      "12",
      "1",
      "4",
      "0",
      "1",
      "0",
      "3",
      "3",
      ".375",
      ".375",
      ".542",
    ],
    [
      "7 trận qua",
      "12",
      "1",
      "4",
      "0",
      "1",
      "0",
      "3",
      "3",
      ".375",
      ".375",
      ".542",
    ],
    [
      "15 trận qua",
      "12",
      "1",
      "4",
      "0",
      "1",
      "0",
      "3",
      "3",
      ".375",
      ".375",
      ".542",
    ],
  ],
};

const careerData = {
  tableHead: [
    "Mùa giải",
    "Đội",
    "Số trận",
    "AB",
    "R",
    "H",
    "2B",
    "3B",
    "HR",
    "RBI",
    "BB",
    "SO",
    "SB",
    "AVG",
    "OBP",
    "SLG",
    "OPS",
  ],
  widthArr: [
    100, 100, 75, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50,
  ],
  tableData: [
    [
      "2023",
      "HRO",
      28,
      120,
      14,
      30,
      36,
      6,
      0,
      0,
      15,
      8,
      16,
      3,
      ".286",
      ".336",
      ".445",
      ".783",
    ],
  ],
};

const position = ["DH", "P", "C", "1B", "2B", "3B", "SS", "OF", "None"];
const PlayerProfileScreen = () => {
  const route = useRoute();
  const id = route.params.id;
  const [player, setPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const splitAvatarURI = (str) => {
    const arr = str.split("?");
    return arr[0];
  };

  useEffect(() => {
    const getInfo = async () => {
      setIsLoading(true);
      try {
        const storedPlayer = await AsyncStorage.getItem(`player_${id}`);
        if (storedPlayer) {
          const data = JSON.parse(storedPlayer);
          setPlayer(data);
        } else {
          const { data } = await axiosInstance.get(`/player/profile/${id}/`);
          setPlayer(data);
          AsyncStorage.setItem(
            `player_${id}`,
            JSON.stringify(data),
            (error) => {
              if (error) {
                console.error(error);
              } else {
                console.log("Player stored successfully.");
              }
            }
          );
        }
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
        toast.show(error.message, {
          type: "danger",
          placement: "bottom",
          duration: 4000,
          offset: 30,
          animationType: "zoom-in",
        });
      }
    };
    getInfo().catch((error) => console.error(error));
  }, []);

  return (
    <ScrollView>
      {!player ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <View>
          <Image
            source={{ uri: splitAvatarURI(player.avatar) }}
            style={styles.profilePicture}
          />
          <View style={styles.profileInfo}>
            <Text
              style={styles.name}
            >{`${player.firstName} ${player.lastName}`}</Text>
            <Text style={{ fontSize: 24, textAlign: "center" }}>
              Team: HUST Red Owls
            </Text>
            <Text style={{ fontSize: 24, textAlign: "center" }}>
              Role: Player
            </Text>
            <View style={styles.profileRow}>
              <Text style={{ marginRight: 8 }}>Chiều cao</Text>
              <Text style={{ marginRight: 8 }}>Cân nặng</Text>
              <Text>Số áo</Text>
            </View>
            <View style={styles.profileRow}>
              <Text
                style={{ marginRight: 8, fontWeight: "bold" }}
              >{`${player.height}cm`}</Text>
              <Text
                style={{ marginRight: 8, fontWeight: "bold" }}
              >{`${player.weight}kg`}</Text>
              <Text style={{ fontWeight: "bold" }}>{player.jerseyNumber}</Text>
            </View>
          </View>
          <View style={{ marginVertical: 4, marginStart: 10 }}>
            <View style={{ flexDirection: "row" }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", marginEnd: 4 }}>
                Vị trí chính:
              </Text>
              <Text style={{ fontSize: 16 }}>{position[player.firstPos]}</Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", marginEnd: 4 }}>
                Vị trí phụ:
              </Text>
              <Text style={{ fontSize: 16 }}>
                {player.secondPos ? position[player.secondPos] : "Chưa rõ"}
              </Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", marginEnd: 4 }}>
                Ngày tháng năm sinh:
              </Text>
              <Text style={{ fontSize: 16 }}>
                {player.birthDate ? player.birthDate : "Chưa rõ"}
              </Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", marginEnd: 4 }}>
                Email:
              </Text>
              <Text style={{ fontSize: 16 }}>
                {player.email ? player.email : "Chưa rõ"}
              </Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", marginEnd: 4 }}>
                Số điện thoại:
              </Text>
              <Text style={{ fontSize: 16 }}>{player.phoneNumber}</Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", marginEnd: 4 }}>
                Quê quán:
              </Text>
              <Text style={{ fontSize: 16 }}>
                {player.homeTown ? player.homeTown : "Chưa rõ"}
              </Text>
            </View>
          </View>
          <HorizontalTable data={tableDataSample} />
          <Text style={styles.title}>Sự nghiệp</Text>
          <HorizontalTable data={careerData} />
        </View>
      )}
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginLeft: 15,
  },
  profilePicture: {
    width: 200,
    height: 200,
    borderRadius: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    alignSelf: "center",
    marginTop: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  profileInfo: {
    fontSize: 24,
    textAlign: "center",
    borderStyle: "solid",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  profileRow: {
    fontSize: 24,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
});

export default PlayerProfileScreen;

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
import { useNavigation, useRoute } from "@react-navigation/native";
import jwtDecode from "jwt-decode";
import { useRecoilState } from "recoil";
import { playersState } from "../atom/Players";
import { TouchableOpacity } from "react-native";

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
  const [teamName, setTeamName] = useState("");
  const [recoilPlayers, setRecoilPlayers] = useRecoilState(playersState);
  const navigation = useNavigation();
  const [teamId, setTeamId] = useState(null);

  const splitAvatarURI = (str) => {
    const arr = str.split("?");
    return arr[0];
  };

  useEffect(() => {
    const getInfo = async () => {
      setIsLoading(true);
      try {
        const token = await AsyncStorage.getItem("access_token");
        const decoded = jwtDecode(token);
        setTeamName(decoded.teamName);
        setTeamId(decoded.teamid);
        const storedPlayer = recoilPlayers.find(
          (p) => p.id == id && p.plateApperance
        );
        if (storedPlayer) {
          setPlayer(storedPlayer);
          setBattingData((prev) => {
            return {
              ...prev,
              tableData: [
                [
                  storedPlayer.plateApperance,
                  storedPlayer.atBat,
                  storedPlayer.hit,
                  storedPlayer.homeRun,
                  storedPlayer.runBattedIn,
                  storedPlayer.run,
                  storedPlayer.baseOnBall,
                  storedPlayer.strikeOut,
                  storedPlayer.stolenBase,
                  storedPlayer.battingAverage,
                  storedPlayer.onBasePercentage,
                  storedPlayer.sluggingPercentage,
                  storedPlayer.onBasePlusSlugging,
                  storedPlayer.weightedOnBasePercentage,
                ],
              ],
            };
          });

          setFieldingData((prev) => {
            return {
              ...prev,
              tableData: [
                [
                  storedPlayer.putOut,
                  storedPlayer.assist,
                  storedPlayer.error,
                  storedPlayer.fieldingPercentage,
                ],
              ],
            };
          });

          setPitchingData((prev) => {
            return {
              ...prev,
              tableData: [
                [
                  storedPlayer.totalBatterFaced,
                  `${Math.floor(storedPlayer.totalInGameOut / 3)}.${
                    storedPlayer.totalInGameOut % 3
                  }`,
                  storedPlayer.oppHit,
                  storedPlayer.oppRun,
                  storedPlayer.earnedRun,
                  storedPlayer.oppHomeRun,
                  storedPlayer.oppBaseOnBall,
                  storedPlayer.hitBatter,
                  storedPlayer.oppStrikeOut,
                  storedPlayer.balk,
                  storedPlayer.earnedRunAverage,
                  storedPlayer.walkAndHitPerInning,
                ],
              ],
            };
          });
        } else {
          const { data } = await axiosInstance.get(`/player/profile/${id}/`);
          setPlayer(data);
          setRecoilPlayers((prev) => [
            ...prev.filter((p) => p.id != data.id),
            data,
          ]);
          let storedPlayer = data;
          setBattingData((prev) => {
            return {
              ...prev,
              tableData: [
                [
                  storedPlayer.plateApperance,
                  storedPlayer.atBat,
                  storedPlayer.hit,
                  storedPlayer.homeRun,
                  storedPlayer.runBattedIn,
                  storedPlayer.run,
                  storedPlayer.baseOnBall,
                  storedPlayer.strikeOut,
                  storedPlayer.stolenBase,
                  storedPlayer.battingAverage,
                  storedPlayer.onBasePercentage,
                  storedPlayer.sluggingPercentage,
                  storedPlayer.onBasePlusSlugging,
                  storedPlayer.weightedOnBasePercentage,
                ],
              ],
            };
          });

          setFieldingData((prev) => {
            return {
              ...prev,
              tableData: [
                [
                  storedPlayer.putOut,
                  storedPlayer.assist,
                  storedPlayer.error,
                  storedPlayer.fieldingPercentage,
                ],
              ],
            };
          });

          setPitchingData((prev) => {
            return {
              ...prev,
              tableData: [
                [
                  storedPlayer.totalBatterFaced,
                  `${Math.floor(storedPlayer.totalInGameOut / 3)}.${
                    storedPlayer.totalInGameOut % 3
                  }`,
                  storedPlayer.oppHit,
                  storedPlayer.oppRun,
                  storedPlayer.earnedRun,
                  storedPlayer.oppHomeRun,
                  storedPlayer.oppBaseOnBall,
                  storedPlayer.hitBatter,
                  storedPlayer.oppStrikeOut,
                  storedPlayer.balk,
                  storedPlayer.earnedRunAverage,
                  storedPlayer.walkAndHitPerInning,
                ],
              ],
            };
          });
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

  const [battingData, setBattingData] = useState({
    tableHead: [
      "PA",
      "AB",
      "H",
      "HR",
      "RBI",
      "R",
      "BB",
      "SO",
      "SB",
      "AVG",
      "OBP",
      "SLG",
      "OPS",
      "wOBA",
    ],
    widthArr: [50, 50, 50, 50, 50, 50, 50, 50, 50, 60, 60],
    tableData: [["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"]],
  });

  const [fieldingData, setFieldingData] = useState({
    tableHead: ["PO", "A", "E", "FPCT"],
    widthArr: [50, 50, 50, 60],
    tableData: [["-", "-", "-", "-"]],
  });

  const [pitchingData, setPitchingData] = useState({
    tableHead: [
      "TBF",
      "IP",
      "H",
      "R",
      "ER",
      "HR",
      "BB",
      "HBP",
      "SO",
      "BLK",
      "ERA",
      "WHIP",
    ],
    widthArr: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
    tableData: [["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"]],
  });

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      setImage({
        uri: result.assets[0].uri,
        base64: result.assets[0].base64,
      });
      // formik.handleChange("avatar");
    }
  };

  return (
    <ScrollView>
      {!player ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <View>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("UpdatePlayerAvatar", {
                playerid: id,
                teamid: teamId,
              });
            }}
          >
            <Image
              source={{ uri: splitAvatarURI(player.avatar) }}
              style={styles.profilePicture}
            />
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <Text
              style={styles.name}
            >{`${player.firstName} ${player.lastName}`}</Text>
            <Text style={{ fontSize: 24, textAlign: "center" }}>
              Team: {`${teamName}`}
            </Text>
            <Button
              onPress={() => {
                navigation.navigate("EditPlayerScreen", {
                  id: player.id,
                });
              }}
              style={{ alignItems: "center" }}
              title="Cập nhật thông tin"
            />
            <View style={styles.profileRow}>
              <Text style={{ marginRight: 8 }}>Chiều cao</Text>
              <Text style={{ marginRight: 8 }}>Cân nặng</Text>
              <Text>Số áo</Text>
            </View>
            <View style={styles.profileRow}>
              <Text style={{ marginRight: 8, fontWeight: "bold" }}>
                {player.height ? `${player.height} cm` : "Chưa rõ"}
              </Text>
              <Text style={{ marginRight: 8, fontWeight: "bold" }}>
                {player.weight ? `${player.weight} kg` : "Chưa rõ"}
              </Text>
              <Text style={{ fontWeight: "bold" }}>{player.jerseyNumber}</Text>
            </View>
          </View>
          <View style={{ marginVertical: 4, marginStart: 10 }}>
            <View style={{ flexDirection: "row" }}>
              <Text style={{ fontSize: 20, fontWeight: "bold", marginEnd: 4 }}>
                Vị trí chính:
              </Text>
              <Text style={{ fontSize: 20 }}>{position[player.firstPos]}</Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text style={{ fontSize: 20, fontWeight: "bold", marginEnd: 4 }}>
                Vị trí phụ:
              </Text>
              <Text style={{ fontSize: 20 }}>
                {player.secondPos ? position[player.secondPos] : "Chưa rõ"}
              </Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text style={{ fontSize: 20, fontWeight: "bold", marginEnd: 4 }}>
                Ngày tháng năm sinh:
              </Text>
              <Text style={{ fontSize: 20 }}>
                {player.birthDate ? player.birthDate : "Chưa rõ"}
              </Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text style={{ fontSize: 20, fontWeight: "bold", marginEnd: 4 }}>
                Email:
              </Text>
              <Text style={{ fontSize: 20 }}>
                {player.email ? player.email : "Chưa rõ"}
              </Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text style={{ fontSize: 20, fontWeight: "bold", marginEnd: 4 }}>
                Số điện thoại:
              </Text>
              <Text style={{ fontSize: 20 }}>{player.phoneNumber}</Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text style={{ fontSize: 20, fontWeight: "bold", marginEnd: 4 }}>
                Quê quán:
              </Text>
              <Text style={{ fontSize: 20 }}>
                {player.homeTown ? player.homeTown : "Chưa rõ"}
              </Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text style={{ fontSize: 20, fontWeight: "bold", marginEnd: 4 }}>
                Trạng thái:
              </Text>
              <Text style={{ fontSize: 20 }}>
                {player.status == 1
                  ? "Đang hoạt động"
                  : player.status == 0
                  ? "Tạm ngưng hoạt động"
                  : "Đã rời đội"}
              </Text>
            </View>
          </View>
          <View>
            <Text style={styles.title}>Thành tích tấn công</Text>
            <HorizontalTable data={battingData} />
            <Text style={styles.title}>Thành tích phòng ngự</Text>
            <HorizontalTable data={fieldingData} />
            <Text style={styles.title}>Thành tích ném bóng</Text>
            <HorizontalTable data={pitchingData} />
          </View>
        </View>
      )}
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 15,
    alignItems: "center",
    justifyContent: "center",
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

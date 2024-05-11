import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Button,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PieChart from "../component/PieChart";
import PieChartComponent from "../component/PieChart";
import { useNavigation, useRoute } from "@react-navigation/native";
import jwtDecode from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../lib/axiosClient";
import { useToast } from "react-native-toast-notifications";
import { useRecoilState, useRecoilValue } from "recoil";
import { teamByIdState, teamsState } from "../atom/Teams";

const splitAvatarURI = (str) => {
  const arr = str.split("?");
  return arr[0];
};

const TeamScreen = () => {
  const size = 50;
  const navigation = useNavigation();
  const route = useRoute();
  const teamid = route.params.teamid;
  const [teamName, setTeamName] = useState("");
  const [team, setTeam] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const recoilTeam = useRecoilValue(teamByIdState(teamid));
  const [fullTeams, setFullTeams] = useRecoilState(teamsState);
  useEffect(() => {
    const getInfo = async () => {
      setIsLoading(true);
      try {
        // const token = await AsyncStorage.getItem("access_token");
        // const decoded = jwtDecode(token);
        // setTeamName(decoded.teamName);
        if (recoilTeam) {
          setTeam(recoilTeam);
          setIsLoading(false);
          return;
        }
        const { data } = await axiosInstance.get(`/team/profile/${teamid}/`);
        console.log("Get API completed");
        setTeam(data);
        setFullTeams((prev) => [...prev, data]);
        console.log(data.id);
        setIsLoading(false);
      } catch (error) {
        toast.show(error.message, {
          type: "danger",
          placement: "bottom",
          duration: 4000,
          offset: 30,
          animationType: "zoom-in",
        });
        setIsLoading(false);
      }
    };
    getInfo();
  }, []);

  if (isLoading || !team) {
    return (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate("UpdateTeamAvatar", {
            teamid: teamid,
          });
        }}
      >
        <Image
          source={{ uri: splitAvatarURI(team.logo) }}
          style={styles.profilePicture}
        />
      </TouchableOpacity>
      <View style={styles.profileInfo}>
        <Text style={styles.name}>{`${team.name}`}</Text>
        <Button
          onPress={() => {
            navigation.navigate("EditTeam", {
              id: team.id,
            });
          }}
          style={{ alignItems: "center" }}
          title="Cập nhật thông tin"
        />
      </View>
      <View style={{ marginVertical: 4, marginStart: 10 }}>
        <View style={{ flexDirection: "row" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginEnd: 4 }}>
            Thành phố:
          </Text>
          <Text style={{ fontSize: 20 }}>
            {team.city ? team.city : "Chưa rõ"}
          </Text>
        </View>
        <View style={{ flexDirection: "row" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginEnd: 4 }}>
            Quốc gia:
          </Text>
          <Text style={{ fontSize: 20 }}>
            {team.country ? team.country : "Chưa rõ"}
          </Text>
        </View>
        <View style={{ flexDirection: "row" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginEnd: 4 }}>
            Sân nhà:
          </Text>
          <Text style={{ fontSize: 20 }}>
            {team.homeStadium ? team.homeStadium : "Chưa rõ"}
          </Text>
        </View>
        <View style={{ flexDirection: "row" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginEnd: 4 }}>
            Ngày thành lập:
          </Text>
          <Text style={{ fontSize: 20 }}>
            {team.foundedDate ? team.foundedDate : "Chưa rõ"}
          </Text>
        </View>
      </View>
      <View style={{ flex: 1, marginTop: 10 }}>
        <Text style={{ fontSize: 24, marginLeft: 8, fontWeight: "bold" }}>
          Sự kiện
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          <View style={{ flex: 1, padding: 10, alignItems: "center" }}>
            <Ionicons
              name="trophy"
              size={size}
              onPress={() =>
                navigation.navigate("Leagues", {
                  teamid: teamid,
                  teamName: team.name,
                })
              }
            />
            <Text style={{ fontSize: 16 }}>Giải đấu</Text>
          </View>
          <View style={{ flex: 1, padding: 10, alignItems: "center" }}>
            <Ionicons
              name="baseball"
              size={size}
              onPress={() =>
                navigation.navigate("Games", {
                  teamid: teamid,
                  teamName: team.name,
                })
              }
            />
            <Text style={{ fontSize: 16 }}>Trận đấu</Text>
          </View>
          <View style={{ flex: 1, padding: 10, alignItems: "center" }}>
            <Ionicons name="barbell" size={size} />
            <Text style={{ fontSize: 16 }}>Buổi tập</Text>
          </View>
          <View style={{ flex: 1, padding: 10, alignItems: "center" }}>
            <Ionicons
              name="wine"
              size={size}
              onPress={() =>
                navigation.navigate("Events", {
                  teamid: teamid,
                  teamName: team.name,
                })
              }
            />
            <Text style={{ fontSize: 16 }}>Sự kiện thông thường</Text>
          </View>
        </View>
        <Text style={{ fontSize: 24, marginLeft: 8, fontWeight: "bold" }}>
          Quản lý
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          <View style={{ flex: 1, padding: 10, alignItems: "center" }}>
            <Ionicons
              name="newspaper"
              size={size}
              onPress={() =>
                navigation.navigate("PlayerList", { teamid: teamid })
              }
            />
            <Text style={{ fontSize: 16 }}>Quản lý nhân sự</Text>
          </View>
          <View style={{ flex: 1, padding: 10, alignItems: "center" }}>
            <Ionicons
              name="shirt"
              size={size}
              onPress={() =>
                navigation.navigate("Equipments", {
                  teamid: teamid,
                })
              }
            />
            <Text style={{ fontSize: 16 }}>Quản lý đồ</Text>
          </View>
          <View style={{ flex: 1, padding: 10, alignItems: "center" }}>
            <Ionicons
              name="cash"
              size={size}
              onPress={() =>
                navigation.navigate("Transactions", { teamid: teamid })
              }
            />
            <Text style={{ fontSize: 16 }}>Quản lý thu chi</Text>
          </View>
        </View>
        <Text style={{ fontSize: 24, marginLeft: 8, fontWeight: "bold" }}>
          Thống kê
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          <View style={{ flex: 1, padding: 10, alignItems: "center" }}>
            <PieChartComponent game={20} total={50} color="green" />
            <Text style={{ fontSize: 16 }}>Thắng</Text>
          </View>
          <View style={{ flex: 1, padding: 10, alignItems: "center" }}>
            <PieChartComponent game={2} total={50} color="yellow" />
            <Text style={{ fontSize: 16, marginTop: 5 }}>Hòa</Text>
          </View>
          <View style={{ flex: 1, padding: 10, alignItems: "center" }}>
            <PieChartComponent game={28} total={50} color="red" />
            <Text style={{ fontSize: 16 }}>Thua</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          <View style={{ flex: 1, padding: 10, alignItems: "center" }}>
            <Ionicons
              name="person"
              size={size}
              onPress={() =>
                navigation.navigate("Stats", {
                  teamid: teamid,
                  teamName: team.name,
                })
              }
            />
            <Text style={{ fontSize: 16 }}> Thông số cầu thủ</Text>
          </View>
          <View style={{ flex: 1, padding: 10, alignItems: "center" }}>
            <Ionicons name="medal" size={size} />
            <Text style={{ fontSize: 16 }}>Thành tích đội</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default TeamScreen;

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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});

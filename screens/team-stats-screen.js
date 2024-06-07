import { useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { useRecoilState, useRecoilValue } from "recoil";
import { gameByIdState } from "../atom/Games";
import axiosInstance from "../lib/axiosClient";
import { statsState } from "../atom/Stats";
import { useToast } from "react-native-toast-notifications";
import { Text } from "react-native";
import { leaguesState } from "../atom/League";

const TeamStatsScreen = () => {
  const [stats, setStats] = useState(null);
  const [recoilStats, setRecoilStats] = useRecoilState(statsState);
  const [isLoading, setIsLoading] = useState(false);
  const route = useRoute();
  const id = route.params.teamid;
  const games = useRecoilValue(gameByIdState(id));
  const toast = useToast();
  const [leagues, setLeagues] = useRecoilState(leaguesState);
  const [statsOffList, setStatsOffList] = useState([]);
  const [pitchingStatsList, setPitchingStatsList] = useState([]);

  useEffect(() => {
    const getInfo = async () => {
      try {
        setIsLoading(true);
        if (recoilStats) {
          setStats(recoilStats);
          console.log(recoilStats);
          setStatsOffList([
            { name: "Plate Apperance (PA)", value: recoilStats.totalPA },
            { name: "Atbat (AB)", value: recoilStats.totalAtBat },
            { name: "Single", value: recoilStats.totalSingle },
            { name: "Double", value: recoilStats.totalDouble },
            { name: "Triple", value: recoilStats.totalTriple },
            { name: "Home Run", value: recoilStats.totalHR },
            { name: "Run", value: recoilStats.totalRun },
            { name: "RBI", value: recoilStats.totalRBI },
            { name: "Hit", value: recoilStats.totalHit },
            { name: "Base on Ball", value: recoilStats.totalBB },
            { name: "Hit by Pitch", value: recoilStats.totalHBP },
            { name: "Strike Out", value: recoilStats.totalStrikeOut },
            { name: "Stolen Base", value: recoilStats.totalStolenBase },
            { name: "AVG", value: recoilStats.totalAVG },
            { name: "OBP", value: recoilStats.totalOBP },
            { name: "SLG", value: recoilStats.totalSLG },
            { name: "OPS", value: recoilStats.totalOPS },
          ]);
          setPitchingStatsList([
            { name: "Earned Run", value: recoilStats.totalER },
            { name: "Base on Ball", value: recoilStats.totalOppBB },
            { name: "Strikeout", value: recoilStats.totalOppSO },
            { name: "Hit", value: recoilStats.totalOppHit },
            { name: "WHIP", value: recoilStats.totalWHIP },
            { name: "ERA/9", value: recoilStats.totalERA },
          ]);
        } else {
          const { data } = await axiosInstance.get(`/teamstats/${id}/`);
          setStats(data);
          setRecoilStats(data);
          console.log(data);
          setStatsOffList([
            { name: "Plate Apperance (PA)", value: data.totalPA },
            { name: "Atbat (AB)", value: data.totalAtBat },
            { name: "Single", value: data.totalSingle },
            { name: "Double", value: data.totalDouble },
            { name: "Triple", value: data.totalTriple },
            { name: "Home Run", value: data.totalHR },
            { name: "Run", value: data.totalRun },
            { name: "RBI", value: data.totalRBI },
            { name: "Hit", value: data.totalHit },
            { name: "Base on Ball", value: data.totalBB },
            { name: "Hit by Pitch", value: data.totalHBP },
            { name: "Strike Out", value: data.totalStrikeOut },
            { name: "Stolen Base", value: data.totalStolenBase },
            { name: "AVG", value: data.totalAVG },
            { name: "OBP", value: data.totalOBP },
            { name: "SLG", value: data.totalSLG },
            { name: "OPS", value: data.totalOPS },
          ]);
          setPitchingStatsList([
            { name: "Earned Run", value: data.totalER },
            { name: "Base on Ball", value: data.totalOppBB },
            { name: "Strikeout", value: data.totalOppSO },
            { name: "Hit", value: data.totalOppHit },
            { name: "WHIP", value: data.totalWHIP },
            { name: "ERA", value: data.totalERA },
          ]);
        }
        if (leagues.length <= 0) {
          const { data } = await axiosInstance.get(`/leagues/team/${id}/`);
          setLeagues(data);
        }
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
  if (isLoading) {
    return (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={{ backgroundColor: "green", padding: 10 }}>
          <Text
            style={{ alignSelf: "center", color: "white", fontWeight: "bold" }}
          >
            Thắng thua
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            borderBottomWidth: 2,
            borderBottomColor: "grey",
            fontSize: 16,
            justifyContent: "space-between",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              borderRightWidth: 2,
              borderRightColor: "grey",
              padding: 5,
              width: "33%",
            }}
          >
            <Text style={{ alignSelf: "center" }}>Thắng</Text>
            <Text style={{ fontSize: 20, alignSelf: "center" }}>
              {games.filter((g) => g.team_score > g.opp_score).length}
            </Text>
          </View>
          <View
            style={{
              borderRightWidth: 2,
              borderRightColor: "grey",
              padding: 5,
              width: "33%",
            }}
          >
            <Text style={{ alignSelf: "center" }}>Hòa</Text>
            <Text style={{ fontSize: 20, alignSelf: "center" }}>
              {games.filter((g) => g.team_score == g.opp_score).length}
            </Text>
          </View>
          <View
            style={{
              padding: 5,
              width: "33%",
            }}
          >
            <Text style={{ alignSelf: "center" }}>Thua</Text>
            <Text style={{ fontSize: 20, alignSelf: "center" }}>
              {games.filter((g) => g.team_score < g.opp_score).length}
            </Text>
          </View>
        </View>
        <View style={{ backgroundColor: "green", padding: 10 }}>
          <Text
            style={{ alignSelf: "center", color: "white", fontWeight: "bold" }}
          >
            Thành tích ở các giải đấu
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            borderBottomWidth: 2,
            borderBottomColor: "grey",
            fontSize: 16,
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              borderRightWidth: 2,
              borderRightColor: "grey",
              width: "33%",
              padding: 5,
            }}
          >
            <Text style={{ alignSelf: "center" }}>Giải nhất</Text>
            <Text style={{ fontSize: 20, alignSelf: "center" }}>
              {leagues.filter((l) => l.achieve == 1).length}
            </Text>
          </View>
          <View
            style={{
              borderRightWidth: 2,
              borderRightColor: "grey",
              width: "33%",
              padding: 5,
            }}
          >
            <Text style={{ alignSelf: "center" }}>Giải nhì</Text>
            <Text style={{ fontSize: 20, alignSelf: "center" }}>
              {games.filter((l) => l.achieve == 2).length}
            </Text>
          </View>
          <View
            style={{
              borderRightWidth: 2,
              borderRightColor: "grey",
              width: "33%",
              padding: 5,
            }}
          >
            <Text style={{ alignSelf: "center" }}>Giải ba</Text>
            <Text style={{ fontSize: 20, alignSelf: "center" }}>
              {games.filter((l) => l.achieve == 3).length}
            </Text>
          </View>
        </View>
        <View style={{ backgroundColor: "green", padding: 10 }}>
          <Text
            style={{ alignSelf: "center", color: "white", fontWeight: "bold" }}
          >
            Team Batting
          </Text>
        </View>
        {statsOffList.map((stat, index) => (
          <View
            key={index}
            style={{
              flexDirection: "row",
              padding: 10,
              borderBottomWidth: 2,
              borderBottomColor: "grey",
              fontSize: 16,
            }}
          >
            <Text style={{ width: "80%", fontSize: 20 }}>{stat.name}</Text>
            <Text
              style={{
                width: "20%",
                fontWeight: "bold",
                fontSize: 20,
                alignSelf: "center",
              }}
            >
              {stat.value}
            </Text>
          </View>
        ))}
        <View style={{ backgroundColor: "green", padding: 10 }}>
          <Text
            style={{ alignSelf: "center", color: "white", fontWeight: "bold" }}
          >
            Team Pitching
          </Text>
        </View>
        {pitchingStatsList.map((stat, index) => (
          <View
            key={index}
            style={{
              flexDirection: "row",
              padding: 10,
              borderBottomWidth: 2,
              borderBottomColor: "grey",
              fontSize: 16,
            }}
          >
            <Text style={{ width: "80%", fontSize: 20 }}>{stat.name}</Text>
            <Text
              style={{
                width: "20%",
                fontWeight: "bold",
                fontSize: 20,
                alignSelf: "center",
              }}
            >
              {stat.value}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default TeamStatsScreen;

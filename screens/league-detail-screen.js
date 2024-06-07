import { useRoute } from "@react-navigation/native";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useRecoilValue } from "recoil";
import { gameByIdState, gamesState } from "../atom/Games";

const LeagueDetailScreen = () => {
  const route = useRoute();
  const league = route.params.league;
  const games = useRecoilValue(gamesState).filter(
    (g) => g.league_id == league.id
  );
  // if (isLoading === 0) {
  //   return (
  //     <View style={styles.loadingOverlay}>
  //       <ActivityIndicator size="large" color="#0000ff" />
  //     </View>
  //   );
  // }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.title}>{league.title}</Text>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.bodyComponent}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              Thời gian bắt đầu:
            </Text>
            <Text>{league.timeStart}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              Thời gian kết thúc:
            </Text>
            <Text>{league.timeEnd ? league.timeEnd : "Chưa rõ"}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>Địa điểm:</Text>
            <Text>{league.location}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>Mô tả:</Text>
            <Text>{league.description}</Text>
          </View>
        </View>
      </View>
      <View style={{ backgroundColor: "green", padding: 10 }}>
        <Text
          style={{
            alignSelf: "center",
            color: "white",
            fontWeight: "bold",
          }}
        >
          Thành tích giải
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
          padding: 10,
        }}
      >
        <Text>
          {league.achieve == 1
            ? "Vô địch"
            : league.achieve == 2
            ? "Á quân"
            : league.achieve == 3
            ? "Hạng 3"
            : "Không có thành tích"}
        </Text>
      </View>
      <View style={{ backgroundColor: "green", padding: 10 }}>
        <Text
          style={{ alignSelf: "center", color: "white", fontWeight: "bold" }}
        >
          Thắng thua trong giải
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    borderRadius: 6,
    elevation: 3,
    backgroundColor: "#FFFFFF",
    shadowOffset: { width: 1, height: 1 },
    shadowColor: "#333",
    shadowOpacity: 0.3,
    shadowRadius: 2,
    marginHorizontal: 4,
    marginVertical: 6,
    padding: 8,
  },
  cardHeader: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LeagueDetailScreen;

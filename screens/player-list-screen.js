import React, { Component, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { Card } from "@rneui/themed";
import axiosInstance from "../lib/axiosClient";
import { useToast } from "react-native-toast-notifications";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  filteredPlayers,
  managersAsyncSelector,
  managersState,
  playersAsyncSelector,
  playersState,
} from "../atom/Players";
import { myGamePlayers } from "../atom/GamePlayers";
import {
  useRecoilState,
  useRecoilValue,
  useRecoilValueLoadable,
  useSetRecoilState,
} from "recoil";
import SearchBox from "../component/SearchBox";
import filter from "lodash.filter";

const { width } = Dimensions.get("window");
const gap = 4;
const itemPerRow = 3;
const totalGapSize = (itemPerRow - 1) * gap;
const windowWidth = width;
const childWidth = (windowWidth - totalGapSize) / itemPerRow;

const PlayerListScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const position = ["DH", "P", "C", "1B", "2B", "3B", "SS", "OF", "None"];
  const route = useRoute();
  const teamid = route.params.teamid;
  // const players = useRecoilValue(playersAsyncSelector(teamid));
  // const managers = useRecoilValue(managersAsyncSelector(teamid));
  const [players, setPlayers] = useState([]);
  const [fullPlayers, setFullPlayers] = useRecoilState(playersState);

  const [managers, setManagers] = useState([]);
  const [fullManagers, setFullManagers] = useRecoilState(managersState);

  const navigation = useNavigation();
  const [fullData, setFullData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const getInfo = async () => {
      setIsLoading(true);
      try {
        if (fullPlayers.length === 0) {
          const { data } = await axiosInstance.get(`/players/team/${teamid}/`);

          setFullPlayers(data);
          setPlayers(data);
        } else {
          setPlayers(fullPlayers);
        }

        if (fullManagers.length === 0) {
          const { data } = await axiosInstance.get(`/managers/team/${teamid}/`);
          setFullManagers(data);
          setManagers(data);
          setFullData([...players, ...data]);
        } else {
          setManagers(fullManagers);
          setFullData([...players, ...fullManagers]);
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
      } finally {
        setIsLoading(false);
      }
    };
    getInfo().catch((error) => console.error(error));
  }, []);

  const splitAvatarURI = (str) => {
    const arr = str.split("?");
    return arr[0];
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const fomartedQuery = query.toLowerCase();
    console.log("Query: " + fomartedQuery);
    const filteredPlayers = filter(fullPlayers, (player) => {
      return contain(player, fomartedQuery);
    });
    const filteredManagers = filter(fullManagers, (manager) => {
      return contain(manager, fomartedQuery);
    });
    setPlayers(filteredPlayers);
    setManagers(filteredManagers);
  };

  const contain = (query, fomartedQuery) => {
    return (
      query.firstName.toLowerCase().includes(fomartedQuery) ||
      query.lastName.toLowerCase().includes(fomartedQuery)
    );
  };
  if (isLoading) {
    return (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  return (
    <ScrollView style={{ marginVertical: 20 }}>
      <SearchBox
        searchQuery={searchQuery}
        handleSearch={(query) => handleSearch(query)}
      />
      <SafeAreaView style={styles.buttonHeader}>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate("CreatePlayer", { teamid: teamid })
          }
        >
          <Text style={styles.textButton}>Thêm player</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("ImportPlayer")}
        >
          <Text style={styles.textButton}>Import excel</Text>
        </TouchableOpacity>
      </SafeAreaView>
      <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>
        Danh sách cầu thủ
      </Text>
      <View style={styles.itemsWrap}>
        {players.map((player) => (
          <TouchableOpacity
            style={styles.singleItem}
            key={player.id}
            onPress={() => {
              navigation.navigate("PlayerProfile", { id: player.id });
            }}
          >
            <Card>
              <View style={{ position: "relative", alignItems: "center" }}>
                <Image
                  style={{ height: 40, width: 40 }}
                  resizeMode="contain"
                  source={{
                    uri: splitAvatarURI(player.avatar),
                  }}
                />
                <Text>{player.lastName}</Text>
                <Text>{player.jerseyNumber}</Text>
                <Text>{position[player.firstPos]}</Text>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
      <Text
        style={{
          fontWeight: "bold",
          fontSize: 16,
          marginBottom: 8,
          marginTop: 8,
        }}
      >
        Danh sách quản lý
      </Text>
      <View style={styles.itemsWrap}>
        {managers.map((manager) => (
          <TouchableOpacity
            style={styles.singleItem}
            key={manager.id}
            onPress={() => {
              navigation.navigate("ManagerProfile", { id: manager.id });
            }}
          >
            <Card>
              <View style={{ position: "relative", alignItems: "center" }}>
                <Image
                  style={{ height: 40, width: 40 }}
                  resizeMode="contain"
                  source={{
                    uri: manager.avatar
                      ? splitAvatarURI(manager.avatar)
                      : "https://cdn0.iconfinder.com/data/icons/baseball-filledoutline/64/baseball_player-user-boy-sports-avatar-profile-man-people-coach-512.png",
                  }}
                />
                <Text>{manager.lastName}</Text>
                <Text></Text>
                <Text></Text>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 40,
    height: 40,
    borderRadius: 50,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  position: {
    fontSize: 16,
  },
  team: {
    fontSize: 14,
  },
  buttonHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  button: {
    marginBottom: 5,
    borderStyle: "solid",
    borderColor: "black",
    backgroundColor: "green",
    padding: 4,
    marginRight: 4,
  },
  textButton: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  itemsWrap: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: -(gap / 2),
    marginHorizontal: -(gap / 2),
  },
  singleItem: {
    marginHorizontal: gap / 2,
    minWidth: childWidth,
    maxWidth: childWidth,
  },
});

export default PlayerListScreen;

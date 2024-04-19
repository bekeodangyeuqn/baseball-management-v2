import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useRecoilState, useRecoilValueLoadable } from "recoil";
import { fetchTeamsState, teamsState } from "../atom/Teams";
import { useToast } from "react-native-toast-notifications";
import axiosInstance from "../lib/axiosClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode from "jwt-decode";
import { useRoute } from "@react-navigation/native";

const JoinTeamListScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const [teams, setTeams] = useRecoilState(teamsState);
  const [page, setPage] = useState(1);
  const [id, setId] = useState(null);
  const route = useRoute();
  const managerId = route.params.managerId;
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const getUserId = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        const decoded = jwtDecode(token);
        console.log(decoded.id);
        setId(decoded.id);
      } catch (error) {
        console.log(error);
      }
    };
    getUserId();
  });

  const splitAvatarURI = (str) => {
    const arr = str.split("?");
    return arr[0];
  };

  const searchFilter = (item) => {
    const query = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(query);
  };

  const handleSendJoinTeamRequest = async (teamid) => {
    console.log("Manager: " + managerId, id);
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.post("/request_jointeam/", {
        manager_id: id ? id : managerId,
        team_id: teamid,
      });
      setIsLoading(false);
      toast.show("Bạn đã gửi lời mời thành công", {
        type: "success",
        placement: "bottom",
        duration: 4000,
        offset: 30,
        animationType: "zoom-in",
      });
    } catch (error) {
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

  useEffect(() => {
    loadMoreTeams(1);
  }, []);

  const loadMoreTeams = async (p) => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get(`/teams?page=${p}`);
      setTeams([...teams, ...data]);
      setPage(page + 1);
      setIsLoading(false);
    } catch (error) {
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách các đội</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={teams.filter(searchFilter)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.item}>
              <Image
                source={{ uri: splitAvatarURI(item.logo) }}
                style={styles.itemImage}
              />
              <View style={styles.itemContent}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>{item.city}</Text>
              </View>
            </View>
            <View style={styles.buttons}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleSendJoinTeamRequest(item.id)}
              >
                <Text style={styles.buttonText}>Gửi lời mời</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
        onEndReached={loadMoreTeams(page)}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    resizeMode: "cover",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 50,
    marginBottom: 20,
    marginHorizontal: 20,
  },
  searchInput: {
    height: 40,
    borderWidth: 2,
    borderRadius: 5,
    borderColor: "#A9A9A9",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  card: {
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 20,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 20,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 24,
    fontWeight: "bold",
  },
  itemPrice: {
    fontSize: 16,
    color: "#999",
  },
  buttons: {
    flexDirection: "row",
  },
  button: {
    backgroundColor: "#FFC107",
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default JoinTeamListScreen;

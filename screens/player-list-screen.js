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

const { width } = Dimensions.get("window");
const gap = 4;
const itemPerRow = 4;
const totalGapSize = (itemPerRow - 1) * gap;
const windowWidth = width;
const childWidth = (windowWidth - totalGapSize) / itemPerRow;

const PlayerListScreen = () => {
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const position = ["DH", "P", "C", "1B", "2B", "3B", "SS", "OF", "None"];
  const route = useRoute();
  const teamid = route.params.teamid;
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPlayers = async () => {
      setIsLoading(true);
      try {
        const storedPlayers = await AsyncStorage.getItem("players");
        if (storedPlayers) {
          setPlayers(JSON.parse(storedPlayers));
          setIsLoading(false);
          return;
        } else {
          const { data } = await axiosInstance.get(`/players/team/${teamid}/`);
          console.log(data[0]);
          setPlayers(data);
          AsyncStorage.setItem("players", JSON.stringify(data), (error) => {
            if (error) {
              console.error(error);
            } else {
              console.log("Players stored successfully.");
            }
          });
        }
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
    fetchPlayers();
  }, []);

  const splitAvatarURI = (str) => {
    const arr = str.split("?");
    return arr[0];
  };

  return (
    <ScrollView>
      <View style={styles.buttonHeader}>
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate("CreatePlayer", { teamid: teamid })
          }
        >
          <Text style={styles.textButton}>Thêm player</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.textButton}>Import excel</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.itemsWrap}>
        {players.map((player) => (
          <TouchableOpacity style={styles.singleItem} key={player.id}>
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
                <Text>{position[player.firstPos]}</Text>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
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

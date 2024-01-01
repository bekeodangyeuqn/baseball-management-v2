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
import { filteredPlayers, playersAsyncSelector } from "../atom/Players";
import { myGamePlayers } from "../atom/GamePlayers";
import { useRecoilState, useRecoilValue } from "recoil";

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
  const players = useRecoilValue(filteredPlayers(teamid));
  const navigation = useNavigation();

  const splitAvatarURI = (str) => {
    const arr = str.split("?");
    return arr[0];
  };

  return (
    <ScrollView>
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
                <Text>{player.jerseyNumber}</Text>
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

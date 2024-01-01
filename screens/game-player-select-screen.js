import React, { useRef, useMemo, useState, useEffect } from "react";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import {
  StyleSheet,
  ImageBackground,
  Text,
  View,
  SafeAreaView,
  Pressable,
  TouchableOpacity,
} from "react-native";
import field from "../assets/image/field.jpg";
import { useNavigation, useRoute } from "@react-navigation/native";
import { FontAwesome5 } from "@expo/vector-icons";
import PlayerListItem from "../component/PlayerListItem";
import { useToast } from "react-native-toast-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Filter from "../component/Filter";
import { useRecoilState, useRecoilValue } from "recoil";
import { filteredPlayers } from "../atom/Players";
import { myGamePlayers } from "../atom/GamePlayers";
import ChoosePlayerItem from "../component/ChoosePlayerItem";
const GamePlayerSelectScreen = () => {
  const navigation = useNavigation();
  const playersPos = {
    Outfield: [7, 8, 9],
    Infield: [5, 6, 4, 3],
    P: [1],
    C: [2],
  };

  const positionStr = [
    "DH",
    "P",
    "C",
    "1B",
    "2B",
    "3B",
    "SS",
    "RF",
    "CF",
    "LF",
    "None",
  ];
  const [myPlayers, setMyPlayers] = useRecoilState(myGamePlayers);
  const snapPoints = useMemo(() => ["50%"], []);
  const playersBottomSheet = useRef(null);
  const filterBottomSheet = useRef(null);
  const choosePlayerBottomSheet = useRef(null);
  const viewPlayers = () => {
    playersBottomSheet.current?.expand();
  };

  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const route = useRoute();
  const teamid = route.params.teamid;

  const players = useRecoilValue(filteredPlayers(teamid));
  const [pos, setPos] = useState(null);

  const isSelected = (pos) => {
    return myPlayers.some((obj) => obj.position === pos);
  };
  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={field}
        style={{
          width: "100%",
          aspectRatio: 2 / 3,
          alignItems: "center",
          justifyContent: "space-around",
        }}
        resizeMode="contain"
      >
        {Object.keys(playersPos).map((position, index) => (
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              justifyContent: "space-around",
            }}
            key={index}
          >
            {playersPos[position].map((posNumber, index2) => (
              <TouchableOpacity
                onPress={() => {
                  setPos(posNumber);
                  choosePlayerBottomSheet.current?.expand();
                }}
                style={{ alignItems: "center" }}
              >
                <FontAwesome5
                  name="tshirt"
                  size={35}
                  color={isSelected(posNumber) ? "#d170db" : "#5c5c5cbb"}
                ></FontAwesome5>
                {myPlayers ? (
                  <Text
                    style={{
                      color: "white",
                      padding: 2,
                      paddingHorizontal: 7,
                      fontWeight: "bold",
                    }}
                  >
                    {myPlayers.find((obj) => obj.position === posNumber)
                      ? myPlayers.find((obj) => obj.position === posNumber)
                          .player.jerseyNumber
                      : null}
                  </Text>
                ) : null}
                <Text
                  style={{
                    backgroundColor: "#333333bb",
                    color: "white",
                    padding: 2,
                    paddingHorizontal: 7,
                    fontWeight: "bold",
                  }}
                >
                  {positionStr[posNumber]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ImageBackground>

      <Pressable onPress={viewPlayers} style={{ ...styles.button }}>
        <Text style={{ fontWeight: "bold" }}>View players</Text>
      </Pressable>

      <Pressable
        onPress={() => navigation.navigate("BattingOrderSelect")}
        style={styles.button}
      >
        <Text style={{ fontWeight: "bold" }}>Batting order</Text>
      </Pressable>

      <BottomSheet
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        ref={playersBottomSheet}
        index={-1}
      >
        <Pressable
          onPress={() => filterBottomSheet.current?.expand()}
          style={{ ...styles.button, paddingEnd: 8 }}
        >
          <Text style={{ fontWeight: "bold" }}>Lọc cầu thủ</Text>
        </Pressable>
        <BottomSheetFlatList
          data={players}
          renderItem={({ item }) => <PlayerListItem player={item} />}
        />
      </BottomSheet>
      <BottomSheet
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        ref={filterBottomSheet}
        index={-1}
      >
        <Filter players={players} />
      </BottomSheet>

      <BottomSheet
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        ref={choosePlayerBottomSheet}
        index={-1}
      >
        <BottomSheetFlatList
          data={players}
          renderItem={({ item }) => (
            <ChoosePlayerItem player={item} pos={pos} />
          )}
        />
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  button: {
    backgroundColor: "orange",
    width: "90%",
    margin: 5,
    padding: 10,
    borderRadius: 50,
    alignItems: "center",
    marginTop: "auto",
  },
});

export default GamePlayerSelectScreen;

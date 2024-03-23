import React, { useEffect, useState } from "react";
import { View, StyleSheet, SafeAreaView, Pressable } from "react-native";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  myBattingOrder,
  myGamePlayers,
  myGamePlayersByGameId,
} from "../atom/GamePlayers";
import DraggableFlatList from "react-native-draggable-flatlist";
import { Text } from "react-native";
import BattingOrderItem from "../component/BattingOrderItem";
import { useNavigation, useRoute } from "@react-navigation/native";

const BattingOrderSelectScreen = () => {
  const route = useRoute();
  const gameid = route.params.gameid;
  const navigation = useNavigation();
  const players = useRecoilValue(myGamePlayersByGameId(gameid));
  const [myPlayers, setMyPlayers] = useState(players);

  useEffect(() => {
    if (myPlayers.length === 10) {
      setMyPlayers((curPlayers) => {
        const pitcher = curPlayers.find((obj) => obj.position === 1);
        return [...curPlayers.filter((obj) => obj.position !== 1), pitcher];
      });
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text
        style={{
          fontSize: 30,
          alignContent: "center",
          paddingTop: 90,
          fontWeight: "bold",
        }}
      >
        BATTING ORDER
      </Text>
      <DraggableFlatList
        data={myPlayers}
        renderItem={({ item, getIndex, drag, isActive }) => {
          const isLastItem = getIndex() === 9;

          return (
            <BattingOrderItem
              obj={item}
              drag={isLastItem ? undefined : drag} // Don't pass the drag function if it's the last item
              isActive={isLastItem ? false : isActive}
              index={getIndex()}
            />
          );
        }}
        keyExtractor={(item) => item.player.id}
        onDragEnd={({ data }) => {
          const lastItem = myPlayers[myPlayers.length - 1];
          const lastIndexInNewData = data.indexOf(lastItem);

          if (lastIndexInNewData !== myPlayers.length - 1) {
            // The last item has been moved, move it back to the end
            data.splice(lastIndexInNewData, 1);
            data.push(lastItem);
          }

          setMyPlayers(data);
        }}
      />
      <Pressable
        style={{ ...styles.button }}
        onPress={() => {
          navigation.navigate("PlayBall", {
            gameid: gameid,
            myBatting: myPlayers,
          });
        }}
      >
        <Text style={{ fontWeight: "bold" }}>Let's play</Text>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
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

export default BattingOrderSelectScreen;

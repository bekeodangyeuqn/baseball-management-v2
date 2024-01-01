import React, { useEffect } from "react";
import { View, StyleSheet, SafeAreaView, Pressable } from "react-native";
import { useRecoilState } from "recoil";
import { myBattingOrder, myGamePlayers } from "../atom/GamePlayers";
import DraggableFlatList from "react-native-draggable-flatlist";
import { Text } from "react-native";
import BattingOrderItem from "../component/BattingOrderItem";

const BattingOrderSelectScreen = () => {
  const [myPlayers, setMyPlayers] = useRecoilState(myBattingOrder);
  useEffect(() => {
    if (myPlayers.length === 10) {
      setMyPlayers((curPlayers) => {
        return curPlayers.filter((obj) => obj.position !== 1);
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
        renderItem={({ item, drag, isActive }) => (
          <BattingOrderItem obj={item} drag={drag} isActive={isActive} />
        )}
        keyExtractor={(item) => item.player.id}
        onDragEnd={({ data }) => setMyPlayers(data)}
      />
      <Pressable style={{ ...styles.button }}>
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

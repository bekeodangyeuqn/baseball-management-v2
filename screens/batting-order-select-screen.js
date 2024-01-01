import React from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import { useRecoilState } from "recoil";
import { myGamePlayers } from "../atom/GamePlayers";
import DraggableFlatList from "react-native-draggable-flatlist";
import { Text } from "react-native";
import BattingOrderItem from "../component/BattingOrderItem";

const BattingOrderSelectScreen = () => {
  const [myPlayers, setMyPlayers] = useRecoilState(myGamePlayers);
  return (
    <SafeAreaView style={styles.container}>
      <Text
        style={{
          fontSize: 20,
          alignContent: "center",
          paddingTop: 150,
          fontWeight: "bold",
        }}
      >
        Batting order:
      </Text>
      <DraggableFlatList
        data={myPlayers}
        renderItem={({ item, drag, isActive }) => (
          <BattingOrderItem obj={item} drag={drag} isActive={isActive} />
        )}
        keyExtractor={(item) => item.player.id}
        onDragEnd={({ data }) => setMyPlayers(data)}
      />
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
});

export default BattingOrderSelectScreen;

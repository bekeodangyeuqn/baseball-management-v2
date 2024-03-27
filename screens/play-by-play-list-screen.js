import { useRoute } from "@react-navigation/native";
import React from "react";
import { View, StyleSheet, Text, FlatList } from "react-native";
import { useRecoilValue } from "recoil";
import { atBatsSelectorByGameId } from "../atom/AtBats";
import EmptyList from "../component/EmptyList";
import PlayByPlayItem from "../component/PlayByPlayItem";

const PlayByPlayListScreen = () => {
  const route = useRoute();
  const gameid = route.params.gameid;
  const teamName = route.params.teamName;
  const atBats = useRecoilValue(atBatsSelectorByGameId(gameid));
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <View>
        <FlatList
          data={atBats}
          ListEmptyComponent={<EmptyList />}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => index}
          renderItem={({ item }) => (
            <PlayByPlayItem atBat={item} teamName={teamName} />
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({});

export default PlayByPlayListScreen;

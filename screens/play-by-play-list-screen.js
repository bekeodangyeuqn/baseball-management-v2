import { useRoute } from "@react-navigation/native";
import React from "react";
import { View, StyleSheet, Text, FlatList } from "react-native";
import { useRecoilValue } from "recoil";
import { atBatsSelectorByGameId } from "../atom/AtBats";
import EmptyList from "../component/EmptyList";

const PlayByPlayListScreen = () => {
  const route = useRoute();
  const gameid = route.params.gameid;
  const atBats = useRecoilValue(atBatsSelectorByGameId(gameid));
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <View>
        <FlatList
          data={atBats}
          ListEmptyComponent={<EmptyList />}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Text>
              {item.ball}-{item.strike} {item.description}
            </Text>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({});

export default PlayByPlayListScreen;

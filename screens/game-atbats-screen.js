import { useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useRecoilValue } from "recoil";
import { atBatsSelectorByGameId, atBatsState } from "../atom/AtBats";
import EmptyList from "../component/EmptyList";
import PlayByPlayItem from "../component/PlayByPlayItem";
import axiosInstance from "../lib/axiosClient";
import { useToast } from "react-native-toast-notifications";

const GameAtBatScreen = () => {
  const route = useRoute();
  const gameid = route.params.gameid;
  const teamName = route.params.teamName;
  let atBats = useRecoilValue(atBatsSelectorByGameId(gameid));
  let sortedAtBats = [...atBats].sort((a, b) => a.id - b.id);
  const [gameAtBats, setGameAtBats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const getInfo = async () => {
      try {
        setIsLoading(true);
        if (sortedAtBats.length > 0) {
          setGameAtBats(atBats);
        } else {
          let { data } = await axiosInstance.get(`/atbats/game/${gameid}/`);
          data = data.sort((a, b) => a.id - b.id);
          setGameAtBats(data);
          console.log(data[1]);
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
        setIsLoading(false);
      }
    };
    getInfo();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <View>
        <FlatList
          data={gameAtBats.filter((a) => !a.isLastState && !a.inTheAtBat)}
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

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default GameAtBatScreen;

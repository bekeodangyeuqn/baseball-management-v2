import React, { useEffect, useState } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import CompletedGameScreen from "../screens/game/completed-game-screen";
import UpcomingGameScreen from "../screens/game/upcoming-game-screen";
import InprogressGameScreen from "../screens/game/inprogress-game-screen";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useToast } from "react-native-toast-notifications";
import jwtDecode from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../lib/axiosClient";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  gamesState,
  gameByIdState,
  addGameState,
  deleteGameState,
  fetchGamesState,
} from "../atom/Games";

const GameTopNav = () => {
  const Tab = createMaterialTopTabNavigator();

  const navigation = useNavigation();
  const [games, setGames] = useRecoilState(gamesState);
  // const getGameById = useRecoilValue(gameByIdState);
  // const addGame = useSetRecoilState(addGameState);
  // const deleteGame = useSetRecoilState(deleteGameState);
  const fetchGames = useSetRecoilState(fetchGamesState);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const route = useRoute();
  const teamid = route.params.teamid;
  const teamName = route.params.teamName;

  useEffect(() => {
    if (games.length === 0) {
      fetchGames();
    }
  }, [games, fetchGames]);
  return (
    <Tab.Navigator initialRouteName="Upcoming">
      <Tab.Screen
        name="Upcoming"
        children={() => (
          <UpcomingGameScreen games={games} teamName={teamName} />
        )}
      />
      <Tab.Screen
        name="InProgress"
        children={() => (
          <InprogressGameScreen games={games} teamName={teamName} />
        )}
      />
      <Tab.Screen
        name="Completed"
        children={() => (
          <CompletedGameScreen games={games} teamName={teamName} />
        )}
      />
    </Tab.Navigator>
  );
};

export default GameTopNav;

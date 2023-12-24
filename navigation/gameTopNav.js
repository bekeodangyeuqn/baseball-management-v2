import React, { useEffect, useState } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import CompletedGameScreen from "../screens/game/completed-game-screen";
import UpcomingGameScreen from "../screens/game/upcoming-game-screen";
import InprogressGameScreen from "../screens/game/inprogress-game-screen";
import { useNavigation } from "@react-navigation/native";
import { useToast } from "react-native-toast-notifications";
import jwtDecode from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../lib/axiosClient";

const GameTopNav = () => {
  const Tab = createMaterialTopTabNavigator();

  const navigation = useNavigation();
  const [teamid, setTeamId] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const getInfo = async () => {
      setIsLoading(true);
      try {
        const token = await AsyncStorage.getItem("access_token");
        const decoded = jwtDecode(token);
        setTeamId(decoded.teamid);
        setTeamName(decoded.teamName);
        const storedGames = await AsyncStorage.getItem("games");
        if (storedGames) {
          setGames(JSON.parse(storedGames));
          console.log("Games stored successfully.");
          setIsLoading(false);
          return;
        } else {
          const { data } = await axiosInstance.get(`/games/${teamid}/`);
          console.log(data[0]);
          setGames(data);
          AsyncStorage.setItem("games", JSON.stringify(data), (error) => {
            if (error) {
              console.error(error);
            } else {
              console.log("Games stored successfully.");
            }
          });
        }
        console.log("Game top nav");
      } catch (error) {
        console.log(error);
      }
    };
    getInfo().catch((error) => console.error(error));
  }, []);
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

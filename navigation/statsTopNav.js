import React, { useEffect, useState } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useToast } from "react-native-toast-notifications";
import { useRecoilState, useRecoilValueLoadable } from "recoil";
import { leaguesState } from "../atom/League";
import axiosInstance from "../lib/axiosClient";
import UpcomingLeagueScreen from "../screens/league/upcoming-league-screen";
import InprogressLeagueScreen from "../screens/league/inprogress-league-screen";
import CompletedLeagueScreen from "../screens/league/completed-league-screen";
import { statsState } from "../atom/Players";
import BattingStatsScreen from "../screens/stats/batting-stats-screen";
import PitchingStatsScreen from "../screens/stats/pitching-stats-screen";
import FieldingStatsScreen from "../screens/stats/fielding-stats-screen";

const StatsTopNav = () => {
  const Tab = createMaterialTopTabNavigator();

  const navigation = useNavigation();
  const [recoilStats, setRecoilStats] = useRecoilState(statsState);
  const [stats, setStats] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const route = useRoute();
  const teamid = route.params.teamid;
  const teamName = route.params.teamName;

  useEffect(() => {
    const fetchAndSetEvents = async () => {
      setIsLoading(true);
      try {
        if (recoilStats.length <= 0) {
          const { data } = await axiosInstance.get(
            `/playerstats/team/${teamid}/`
          );
          setStats(data);
          setRecoilStats(data);
        } else {
          setStats(recoilStats);
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
      } finally {
        setIsLoading(false);
        console.log("Load game completed");
      }
    };

    fetchAndSetEvents();
  }, []);
  return (
    <Tab.Navigator initialRouteName="Batting">
      <Tab.Screen
        name="Batting"
        children={() => (
          <BattingStatsScreen
            stats={stats ? stats : undefined}
            teamName={teamName}
          />
        )}
      />
      <Tab.Screen
        name="Pitching"
        children={() => (
          <PitchingStatsScreen
            stats={stats ? stats : undefined}
            teamName={teamName}
          />
        )}
      />
      {/* <Tab.Screen
        name="Fielding"
        children={() => (
          <FieldingStatsScreen
            stats={stats ? stats : undefined}
            teamName={teamName}
          />
        )}
      /> */}
    </Tab.Navigator>
  );
};

export default StatsTopNav;

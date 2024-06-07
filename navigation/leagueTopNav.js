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

const LeagueTopNav = () => {
  const Tab = createMaterialTopTabNavigator();

  const navigation = useNavigation();
  const [recoilLeagues, setRecoilLeagues] = useRecoilState(leaguesState);
  const [leagues, setLeagues] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const route = useRoute();
  const teamid = route.params.teamid;
  const teamName = route.params.teamName;

  useEffect(() => {
    const fetchAndSetEvents = async () => {
      setIsLoading(true);
      try {
        if (recoilLeagues.length <= 0) {
          const { data } = await axiosInstance.get(`/leagues/team/${teamid}/`);
          setLeagues(data);
          setRecoilLeagues(data);
        } else {
          setLeagues(recoilLeagues);
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
    <Tab.Navigator initialRouteName="Upcoming">
      <Tab.Screen
        name="Upcoming"
        children={() => (
          <UpcomingLeagueScreen
            leagues={
              leagues
                ? leagues.filter((l) => l.status === -1 && l.id != 1)
                : undefined
            }
            teamName={teamName}
          />
        )}
      />
      <Tab.Screen
        name="InProgress"
        children={() => (
          <InprogressLeagueScreen
            leagues={
              leagues
                ? leagues.filter((l) => l.status === 0 && l.id != 1)
                : undefined
            }
            teamName={teamName}
          />
        )}
      />
      <Tab.Screen
        name="Completed"
        children={() => (
          <CompletedLeagueScreen
            leagues={
              leagues
                ? leagues.filter((l) => l.status === 1 && l.id != 1)
                : undefined
            }
            teamName={teamName}
          />
        )}
      />
    </Tab.Navigator>
  );
};

export default LeagueTopNav;

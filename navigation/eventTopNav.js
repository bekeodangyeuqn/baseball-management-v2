import React, { useEffect, useState } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useToast } from "react-native-toast-notifications";
import jwtDecode from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../lib/axiosClient";
import UpcomingEventScreen from "../screens/event/upcoming-event-screen";
import InprogressEventScreen from "../screens/event/inprogress-event-screen";
import CompletedEventScreen from "../screens/event/completed-event-screen";

const EventTopNav = () => {
  const Tab = createMaterialTopTabNavigator();

  const navigation = useNavigation();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const route = useRoute();
  const teamid = route.params.teamid;
  const teamName = route.params.teamName;

  useEffect(() => {
    const getInfo = async () => {
      setIsLoading(true);
      try {
        const storedEvents = await AsyncStorage.getItem("events");
        if (storedEvents) {
          setGames(JSON.parse(storedEvents));
          console.log("Events stored successfully.");
          setIsLoading(false);
          return;
        } else {
          const { data } = await axiosInstance.get(`/events/team/${teamid}/`);
          console.log(data[0]);
          setEvents(data);
          AsyncStorage.setItem("events", JSON.stringify(data), (error) => {
            if (error) {
              console.error(error);
            } else {
              console.log("Events stored successfully.");
            }
          });
        }
      } catch (error) {
        console.log(error);
      }
    };
    getInfo().catch((error) => console.error(error));
  }, [teamid]);
  return (
    <Tab.Navigator initialRouteName="Upcoming">
      <Tab.Screen
        name="Upcoming"
        children={() => (
          <UpcomingEventScreen events={events} teamName={teamName} />
        )}
      />
      <Tab.Screen
        name="InProgress"
        children={() => (
          <InprogressEventScreen events={events} teamName={teamName} />
        )}
      />
      <Tab.Screen
        name="Completed"
        children={() => (
          <CompletedEventScreen events={events} teamName={teamName} />
        )}
      />
    </Tab.Navigator>
  );
};

export default EventTopNav;

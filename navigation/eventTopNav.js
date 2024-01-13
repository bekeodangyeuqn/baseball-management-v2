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
import { useRecoilState, useRecoilValueLoadable } from "recoil";
import { eventsState, fetchEventsState } from "../atom/Events";

const EventTopNav = () => {
  const Tab = createMaterialTopTabNavigator();

  const navigation = useNavigation();
  const [events, setEvents] = useRecoilState(eventsState);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const route = useRoute();
  const teamid = route.params.teamid;
  const teamName = route.params.teamName;
  const fetchEvents = useRecoilValueLoadable(fetchEventsState(teamid));

  useEffect(() => {
    const fetchAndSetEvents = async () => {
      setIsLoading(true);
      try {
        console.log(fetchEvents.state);
        if (fetchEvents.state === "hasValue") {
          setEvents(fetchEvents.contents);
          console.log("Load event successfully");
        } else if (fetchEvents.state === "hasError") {
          throw fetchEvents.contents; // Throw the error to be caught in the catch block
        }
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
  }, [fetchEvents, setEvents, toast]);
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

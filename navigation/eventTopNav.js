import React, { useEffect, useState } from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useToast } from "react-native-toast-notifications";
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
        if (events.length <= 0) {
          const { data } = await axiosInstance.get(`/events/team/${teamid}/`);
          setEvents(data);
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

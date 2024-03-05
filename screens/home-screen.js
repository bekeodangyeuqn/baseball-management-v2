import React, { useState, useEffect } from "react";
import { Calendar, LocaleConfig } from "react-native-calendars";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Button,
  TextInput,
  TouchableOpacity,
} from "react-native";
import Header from "../component/header";
import { useNavigation, useRoute } from "@react-navigation/native";
import jwtDecode from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchGamesState, gamesState } from "../atom/Games";
import { useRecoilState } from "recoil";
import { eventsState, fetchEventsState } from "../atom/Events";
import { ActivityIndicator } from "react-native";
import axiosInstance from "../lib/axiosClient";
import { useToast } from "react-native-toast-notifications";
import { teamIdSelector } from "../atom/Players";

const configDateTime = (datetime) => {
  let dateAndTime = datetime.split("T"); // split date and time

  let date = dateAndTime[0]; // get the date

  let time = dateAndTime[1].split(":"); // split hours and minutes
  let hoursAndMinutes = `${time[0]}:${time[1]}`;
  return `${hoursAndMinutes} ${date}`; // get hours and minutes
};

const getDate = (datetime) => {
  let dateAndTime = datetime.split("T"); // split date and time

  let date = dateAndTime[0]; // get the date
  return date;
};
const HomeScreen = () => {
  const route = useRoute();
  const teamid = route.params.teamid;
  const navigation = useNavigation();

  const [events, setEvents] = useState([]);
  // const fetchEvents = useRecoilValueLoadable(fetchEventsState(teamid));
  const [recoilEvents, setRecoilEvent] = useRecoilState(eventsState);

  const [games, setGames] = useState([]);
  // const fetchGames = useRecoilValueLoadable(fetchGamesState(teamid));
  const [recoilGames, setRecoilGame] = useRecoilState(gamesState);

  const [selected, setSelected] = useState("");
  const [username, setUsername] = useState("");
  const [teamName, setTeamName] = useState("");
  const [datesEvent, setDatesEvent] = useState([]);
  const [isloading, setIsLoading] = useState(false);
  const toast = useToast();

  const getDatesHaveEvent = (events, games) => {
    let dates = [];
    for (e of events) {
      dates.push(getDate(e.timeStart));
    }
    for (g of games) {
      dates.push(getDate(g.timeStart));
    }
    console.log("dates: ", dates);
    return [...new Set(dates)];
  };

  const markedDates = datesEvent.reduce((acc, date) => {
    acc[date] = { marked: true, selectedColor: "green" };
    return acc;
  }, {});

  useEffect(() => {
    const getInfo = async () => {
      try {
        setIsLoading(true);
        const token = await AsyncStorage.getItem("access_token");
        const decoded = jwtDecode(token);
        setUsername(decoded.username);
        setTeamName(decoded.teamName);
        if (recoilEvents.length === 0) {
          const { data } = await axiosInstance.get(`/events/team/${teamid}/`);

          setEvents(data);
          setRecoilEvent(data);
        } else {
          setEvents(recoilEvents);
        }

        if (recoilGames.length === 0) {
          const { data } = await axiosInstance.get(`/games/team/${teamid}/`);
          setGames(data);
          setRecoilGame(data);
          setEvents((prev) => [...prev, ...data]);
          setDatesEvent((prev) => [
            ...prev,
            ...getDatesHaveEvent(events, data),
          ]);
        } else {
          setGames(recoilGames);
          setEvents((prev) => [...prev, ...recoilGames]);
          setDatesEvent((prev) => [
            ...prev,
            ...getDatesHaveEvent(events, recoilGames),
          ]);
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
  console.log(datesEvent);
  console.log(teamid);
  const renderEvents = () => {
    return events.map((event) => {
      if (getDate(event.timeStart) === selected) {
        return <Event key={event.id} event={event} teamName={teamName} />;
      }
    });
  };
  if (isloading || datesEvent.length === 0) {
    return (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Xin chào {username}</Text>
        <Text style={styles.title}>Đội bóng của bạn: {teamName}</Text>
      </View>
      <Calendar
        onDayPress={(day) => {
          setSelected(day.dateString);
        }}
        markedDates={{
          ...markedDates,
          [selected]: {
            selected: true,
            marked: datesEvent.some((date) => date === selected),
            disableTouchEvent: true,
            selectedDotColor: "orange",
          },
        }}
      />
      <ScrollView>{renderEvents()}</ScrollView>
      {/* <Button title="Thêm sự kiện" onPress={handleAddEvent} /> */}
    </View>
  );
};
const Event = ({ event, teamName }) => {
  const navigaton = useNavigation();
  return (
    <TouchableOpacity
      style={styles.event}
      onPress={() => {
        event.title
          ? navigaton.navigate("EventDetail", {
              event: event,
            })
          : navigaton.navigate("GameDetail", {
              game: event,
            });
      }}
    >
      <Text style={styles.title}>
        {event.title ? event.title : `${teamName} - ${event.oppTeam}`}
      </Text>
      <Text style={styles.time}>
        {configDateTime(event.timeStart)} -{" "}
        {event.timeEnd ? configDateTime(event.timeEnd) : "Chưa rõ"}
      </Text>
      <Text style={styles.location}>
        {event.location ? event.location : event.stadium}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  event: {
    padding: 6,
    borderRadius: 5,
    backgroundColor: "#ccc",
    marginBottom: 10,
    marginHorizontal: 5,
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  location: {
    marginBottom: 2,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});
export default HomeScreen;

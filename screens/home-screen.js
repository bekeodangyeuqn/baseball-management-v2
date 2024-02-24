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
import {
  useRecoilState,
  useRecoilValueLoadable,
  useSetRecoilState,
} from "recoil";
import { eventsState, fetchEventsState } from "../atom/Events";

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

  const [events, setEvents] = useRecoilState(eventsState);
  const fetchEvents = useRecoilValueLoadable(fetchEventsState(teamid));
  const setRecoilEvent = useSetRecoilState(eventsState);

  const [games, setGames] = useRecoilState(gamesState);
  const fetchGames = useRecoilValueLoadable(fetchGamesState(teamid));
  const setRecoilGame = useSetRecoilState(gamesState);

  const [selected, setSelected] = useState("");
  const navigaton = useNavigation();
  const [username, setUsername] = useState("");
  const [teamName, setTeamName] = useState("");
  const [datesEvent, setDatesEvent] = useState([]);

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
    acc[date] = { marked: true, selectedColor: "blue" };
    return acc;
  }, {});

  useEffect(() => {
    const getInfo = async () => {
      try {
        const [gamesResponse, eventsResponse] = await Promise.all([
          fetchGames,
          fetchEvents,
        ]);
        const token = await AsyncStorage.getItem("access_token");
        const decoded = jwtDecode(token);
        setUsername(decoded.username);
        setTeamName(decoded.teamName);

        if (eventsResponse.state === "hasValue") {
          setEvents(eventsResponse.contents);
          setRecoilEvent(eventsResponse.contents);
          console.log("Load event successfully");
        } else if (eventsResponse.state === "hasError") {
          throw eventsResponse.contents; // Throw the error to be caught in the catch block
        }

        if (gamesResponse.state === "hasValue") {
          setGames(gamesResponse.contents);
          setRecoilGame(gamesResponse.contents);
          console.log("Load game successfully");
        } else if (gamesResponse.state === "hasError") {
          throw gamesResponse.contents; // Throw the error to be caught in the catch block
        }
        setDatesEvent(getDatesHaveEvent(events, games));
        setEvents((prev) => [...prev, ...games]);
      } catch (error) {
        console.log(error);
      }
    };
    getInfo().catch((error) => console.error(error));
  }, []);
  console.log(games);
  const renderEvents = () => {
    return events.map((event) => {
      if (getDate(event.timeStart) === selected) {
        return <Event key={event.id} event={event} teamName={teamName} />;
      }
    });
  };
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
  return (
    <TouchableOpacity style={styles.event}>
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
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  location: {
    marginBottom: 2,
  },
});
export default HomeScreen;

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
import { useNavigation } from "@react-navigation/native";
import jwtDecode from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HomeScreen = () => {
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState("");
  const navigaton = useNavigation();
  const [username, setUsername] = useState("");
  const [teamName, setTeamName] = useState("");
  useEffect(() => {
    const getInfo = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        const decoded = jwtDecode(token);
        setUsername(decoded.username);
        setTeamName(decoded.teamName);
      } catch (error) {
        console.log(error);
      }
    };
    getInfo().catch((error) => console.error(error));
    setEvents([
      {
        id: 1,
        title: "Hust Red Owl - Ulis Devil Bats",
        start: new Date(2023, 10, 5, 8, 25),
        end: new Date(2023, 10, 5, 11, 5),
        location: "Sân Tân Mỹ",
      },
      {
        id: 2,
        title: "Tổng kết cuối năm",
        start: new Date(2023, 10, 5, 19, 15),
        end: new Date(2023, 10, 5, 21, 45),
        location: "Quán lẩu gà lá é",
      },
    ]);
  }, []);

  const handleAddEvent = () => {
    // Mở màn hình thêm sự kiện
  };
  console.log(username);
  const renderEvents = () => {
    return events.map((event) => <Event key={event.id} event={event} />);
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
          [selected]: {
            selected: true,
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
const Event = ({ event }) => {
  const { id, title, start, end, location } = event;

  return (
    <TouchableOpacity style={styles.event}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.time}>
        {start.toLocaleString()} - {end.toLocaleString()}
      </Text>
      <Text style={styles.location}>{location}</Text>
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
    margin: 10,
    borderRadius: 5,
    backgroundColor: "#ccc",
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  time: {
    marginStart: 4,
  },
  location: {
    marginStart: 4,
    marginBottom: 2,
  },
});
export default HomeScreen;

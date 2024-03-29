import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";

const EventInfo = (props) => {
  const { key, title, timeStart, timeEnd, location, event } = props;
  const navigation = useNavigation();
  const getDate = (datetime) => {
    let dateAndTime = datetime.split("T"); // split date and time

    let date = dateAndTime[0]; // get the date

    let time = dateAndTime[1].split(":"); // split hours and minutes
    let hoursAndMinutes = `${time[0]}:${time[1]}`;
    return `${hoursAndMinutes} ${date}`; // get hours and minutes
  };
  return (
    <TouchableOpacity
      key={event.id}
      style={styles.event}
      onPress={() =>
        navigation.navigate("EventDetail", {
          event: event,
        })
      }
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.time}>
        {getDate(timeStart.toString())} -{" "}
        {timeEnd ? getDate(timeEnd.toLocaleString()) : "Chưa rõ"}
      </Text>
      <Text style={styles.location}>{location}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  event: {
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    height: 100,
    margin: 10,
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

export default EventInfo;

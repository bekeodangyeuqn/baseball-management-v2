import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";

const EventInfo = (props) => {
  const { key, title, timeStart, timeEnd, location } = props;
  return (
    <TouchableOpacity style={styles.event} key={key}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.time}>
        {timeStart.toLocaleString()} - {timeEnd.toLocaleString()}
      </Text>
      <Text style={styles.location}>{location}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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

export default EventInfo;

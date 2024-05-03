import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Skeleton } from "moti/skeleton";
import Animated, { FadeIn, Layout } from "react-native-reanimated";
import { SkeletonCommonProps } from "../lib/skeleton";
const EventInfo = (props) => {
  const { key1, title, timeStart, timeEnd, location, event, league } = props;
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
      key={key1}
      style={styles.event}
      onPress={() => {
        if (league) {
          navigation.navigate("LeagueDetail", {
            league: league,
          });
        } else {
          navigation.navigate("EventDetail", {
            event: event,
          });
        }
      }}
    >
      <Skeleton.Group>
        <Skeleton {...SkeletonCommonProps} width="100%">
          {(league || event) && (
            <Animated.Text
              layout={Layout}
              entering={FadeIn.duration(1500)}
              style={styles.title}
            >
              {title}
            </Animated.Text>
          )}
        </Skeleton>
        <Skeleton {...SkeletonCommonProps} width="100%">
          {event && (
            <Animated.Text
              layout={Layout}
              entering={FadeIn.duration(1500)}
              style={styles.time}
            >
              Thời gian: {getDate(timeStart.toString())} -{" "}
              {timeEnd ? getDate(timeEnd.toLocaleString()) : "Chưa rõ"}
            </Animated.Text>
          )}
          {league && (
            <Animated.Text
              layout={Layout}
              entering={FadeIn.duration(1500)}
              style={styles.time}
            >
              Thời gian: {timeStart ? timeStart : "Chưa rõ"} -{" "}
              {timeEnd ? timeEnd : "Chưa rõ"}
            </Animated.Text>
          )}
        </Skeleton>
        <Skeleton {...SkeletonCommonProps} width="100%">
          {(league || event) && (
            <Animated.Text
              layout={Layout}
              entering={FadeIn.duration(1500)}
              style={styles.location}
            >
              Đại điểm: {location ? location : "Chưa rõ"}
            </Animated.Text>
          )}
        </Skeleton>
      </Skeleton.Group>
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

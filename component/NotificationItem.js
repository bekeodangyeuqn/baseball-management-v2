import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRecoilState, useRecoilValue } from "recoil";
import { gamesState } from "../atom/Games";
import { leaguesState } from "../atom/League";
import { eventsState } from "../atom/Events";
import { notificationsState } from "../atom/Notifications";
import axios from "axios";
import axiosInstance from "../lib/axiosClient";

const configDateTime = (datetime) => {
  let dateAndTime = datetime.split("T"); // split date and time

  let date = dateAndTime[0]; // get the date

  let time = dateAndTime[1].split(":"); // split hours and minutes
  let hoursAndMinutes = `${time[0]}:${time[1]}`;
  return `${hoursAndMinutes} ${date}`; // get hours and minutes
};

const NotificationItem = ({ notification }) => {
  const navigation = useNavigation();
  const games = useRecoilValue(gamesState);
  const leagues = useRecoilValue(leaguesState);
  const events = useRecoilValue(eventsState);
  const [notifications, setNotifications] = useRecoilState(notificationsState);

  const handleNotificationClick = async (notificationId) => {
    // Find the clicked notification and update its isRead property
    const updatedNotifications = notifications.map((notification) =>
      notification.id === notificationId
        ? { ...notification, isRead: true }
        : notification
    );

    // Update the notifications state
    setNotifications(updatedNotifications);

    if (notification.isRead == false)
      await axiosInstance.patch(`/notification/updates/${notificationId}/`, {
        isRead: true,
      });
  };

  return (
    <TouchableOpacity
      style={{
        backgroundColor: notification.isRead ? "white" : "rgba(255, 0, 0, 0.1)",
        flexDirection: "column",
        justifyContent: "flex-start",
        padding: 20,
        paddingHorizontal: 8,
        margin: 10,
      }}
      onPress={() => {
        handleNotificationClick(notification.id);
        if (notification.screen) {
          if (notification.screen == "PlayerProfile")
            navigation.navigate(notification.screen, {
              id: notification.item_id,
            });
          else if (notification.screen == "GameDetail")
            navigation.navigate(notification.screen, {
              game: games.find((game) => game.id == notification.item_id),
            });
          else if (notification.screen == "EventDetail")
            navigation.navigate(notification.screen, {
              event: events.find((event) => event.id == notification.item_id),
            });
          else if (notification.screen == "LeagueDetail")
            navigation.navigate(notification.screen, {
              league: leagues.find(
                (league) => league.id == notification.item_id
              ),
            });
          else if (notification.screen == "EquipmentDetail")
            navigation.navigate(notification.screen, {
              id: notification.item_id,
            });
        }
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <Text>Baseball Management</Text>
        <Text>{configDateTime(notification.time)}</Text>
      </View>
      <View style={styles.head}>
        <Text style={{ fontWeight: "bold" }}>{notification.title}</Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          marginTop: 10,
        }}
      >
        <Text>{notification.content}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  head: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    borderBottomColor: "#000000",
    borderBottomWidth: 1,
  },
});

export default NotificationItem;

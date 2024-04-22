import React, { useEffect, useRef, useState } from "react";
import { registerForPushNotificationsAsync } from "../lib/notifications";
import * as Notifications from "expo-notifications";
import axiosInstance from "../lib/axiosClient";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const NotificationProvider = ({ children, id }) => {
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  const savePushToken = async (newToken) => {
    setExpoPushToken(newToken);
    if (!newToken && !userid) {
      return;
    }
    await axiosInstance.patch(`/userpushtoken/update/${id}/`, {
      push_token: newToken,
    });
  };
  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      savePushToken(token);
    });
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      if (notificationListener.current)
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      if (responseListener.current)
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);
  console.log("Push token: " + expoPushToken);
  console.log("Notification: " + notification);
  return <>{children}</>;
};

export default NotificationProvider;

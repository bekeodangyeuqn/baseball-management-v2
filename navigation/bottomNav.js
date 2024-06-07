import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/home-screen";
import TeamScreen from "../screens/team-screen";
import ManagerProfileScreen from "../screens/manager-profile-screen";
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { Badge } from "react-native-elements";
import { TouchableOpacity } from "react-native";
import { useRecoilValue } from "recoil";
import { notificationsState } from "../atom/Notifications";

const BottomNav = () => {
  const Tab = createBottomTabNavigator();
  const route = useRoute();
  const id = route.params.id;
  const teamid = route.params.teamid;
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState(
    route.params.notifications
  );
  const isFocus = useIsFocused();
  const recoilNotifications = useRecoilValue(notificationsState);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    if (isFocus) {
      if (recoilNotifications && recoilNotifications.length > 0) {
        setNotifications(recoilNotifications);
        setUnreadNotifications(
          recoilNotifications.filter(
            (notification) => notification.isRead === false
          ).length
        );
      }
    } else {
      if (notifications && notifications.length > 0) {
        setUnreadNotifications(
          notifications.filter((notification) => notification.isRead === false)
            .length
        );
      }
    }
  }, [isFocus]);

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Trang chủ"
        options={{
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name="home"
              size={size}
              color={focused ? "blue" : "gray"}
            />
          ),
          headerRight: () => (
            <TouchableOpacity style={{ paddingRight: 10 }}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color="black"
                style={{ marginRight: 10 }}
                onPress={() => {
                  navigation.navigate("Notifications", {
                    notifications: notifications,
                  });
                }}
              />
              {unreadNotifications > 0 && (
                <Badge
                  value={unreadNotifications}
                  status="error"
                  containerStyle={{ position: "absolute", top: -4, right: 8 }}
                />
              )}
            </TouchableOpacity>
          ),
        }}
        component={HomeScreen}
        initialParams={{ teamid: teamid }}
      ></Tab.Screen>
      <Tab.Screen
        name="Đội"
        options={{
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name="shirt"
              size={size}
              color={focused ? "blue" : "gray"}
            />
          ),
        }}
        component={TeamScreen}
        initialParams={{ teamid: teamid }}
      ></Tab.Screen>
      <Tab.Screen
        name="Cá nhân"
        options={{
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name="person"
              size={size}
              color={focused ? "blue" : "gray"}
            />
          ),
        }}
        component={ManagerProfileScreen}
        initialParams={{ id: id }}
      ></Tab.Screen>
    </Tab.Navigator>
  );
};

export default BottomNav;

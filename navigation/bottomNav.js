import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/home-screen";
import TeamScreen from "../screens/team-screen";
import ManagerProfileScreen from "../screens/manager-profile-screen";
import { useRoute } from "@react-navigation/native";

const BottomNav = () => {
  const Tab = createBottomTabNavigator();
  const route = useRoute();
  const id = route.params.id;
  const teamid = route.params.teamid;

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

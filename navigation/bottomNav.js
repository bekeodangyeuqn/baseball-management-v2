import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/home-screen";
import ProfileScreen from "../screens/profile-screen";
import TeamScreen from "../screens/team-screen";

const BottomNav = () => {
  const Tab = createBottomTabNavigator();

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
      ></Tab.Screen>
      <Tab.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name="person"
              size={size}
              color={focused ? "blue" : "gray"}
            />
          ),
        }}
        component={ProfileScreen}
      ></Tab.Screen>
    </Tab.Navigator>
  );
};

export default BottomNav;

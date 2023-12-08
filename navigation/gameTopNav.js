import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import CompletedGameScreen from "../screens/game/completed-game-screen";
import UpcomingGameScreen from "../screens/game/upcoming-game-screen";
import InprogressGameScreen from "../screens/game/inprogress-game-screen";

const GameTopNav = () => {
  const Tab = createMaterialTopTabNavigator();
  return (
    <Tab.Navigator initialRouteName="Upcoming">
      <Tab.Screen name="Upcoming" component={UpcomingGameScreen}></Tab.Screen>
      <Tab.Screen
        name="Inprogress"
        component={InprogressGameScreen}
      ></Tab.Screen>
      <Tab.Screen name="Completed" component={CompletedGameScreen}></Tab.Screen>
    </Tab.Navigator>
  );
};

export default GameTopNav;

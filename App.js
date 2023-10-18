import { NavigationContainer } from "@react-navigation/native";
import { StyleSheet, Text, View } from "react-native";
import BottomNav from "./navigation/bottomNav";

export default function App() {
  return (
    <NavigationContainer>
      <BottomNav />
    </NavigationContainer>
  );
}

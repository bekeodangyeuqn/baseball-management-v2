import { NavigationContainer } from "@react-navigation/native";
import { StyleSheet, Text, View } from "react-native";
import BottomNav from "./navigation/bottomNav";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./screens/auth/login-screen";
import RegisterScreen from "./screens/auth/register-screen";
import GameScreen from "./screens/game-screen";
import { LogBox } from "react-native";
import { ToastProvider } from "react-native-toast-notifications";

export default function App() {
  const Stack = createStackNavigator();
  LogBox.ignoreLogs(["Invalid prop textStyle of type array supplied to Cell"]);
  return (
    <ToastProvider>
      <NavigationContainer>
        {/* <BottomNav /> */}
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SignUp"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Home" component={BottomNav} />
          <Stack.Screen name="Games" component={GameScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ToastProvider>
  );
}

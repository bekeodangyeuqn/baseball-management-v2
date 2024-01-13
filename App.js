import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { StyleSheet, Text, View } from "react-native";
import BottomNav from "./navigation/bottomNav";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./screens/auth/login-screen";
import RegisterScreen from "./screens/auth/register-screen";
import GameTopNav from "./navigation/gameTopNav";
import { LogBox } from "react-native";
import { ToastProvider } from "react-native-toast-notifications";
import CreateOrJoinTeamScreen from "./screens/create-join-team-screen";
import CreateManagerScreen from "./screens/create-manager-screen";
import CreateTeamScreen from "./screens/create-team-screen";
import { useEffect, useState } from "react";
import jwtDecode from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PlayerListScreen from "./screens/player-list-screen";
import CreatePlayerScreen from "./screens/create-player-scrren";
import UpdatePlayerAvaScreen from "./screens/update-player-ava-screen";
import CreateGameScreen from "./screens/create-game-screen";
import GameDetailScreen from "./screens/game-detail-screen";
import ImportExcelPlayerScreen from "./screens/import-excel-player-screen";
import GamePlayerSelectScreen from "./screens/game-player-select-screen";
import { RecoilRoot } from "recoil";
import BattingOrderSelectScreen from "./screens/batting-order-select-screen";
import EventTopNav from "./navigation/eventTopNav";
import CreateEventScreen from "./screens/create-event-screen";
import EventDetailScreen from "./screens/event-detail-screen";
import PlayerProfileScreen from "./screens/player-profile-screen";
import JoinTeamListScreen from "./screens/join-team-list-screen";
import { Image } from "react-native";
export default function App() {
  const Stack = createStackNavigator();
  const [token, setToken] = useState("");
  const [teamName, setTeamName] = useState("");
  const [id, setId] = useState(null);

  useEffect(() => {
    const getInfo = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        const decoded = jwtDecode(token);
        setToken(token);
        setTeamName(decoded.teamName);
        setId(decoded.userid);
      } catch (error) {
        console.log(error);
      }
    };
    getInfo().catch((error) => console.error(error));
  }, []);

  LogBox.ignoreLogs(["Invalid prop textStyle of type array supplied to Cell"]);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ToastProvider>
        <RecoilRoot>
          <NavigationContainer>
            {/* <BottomNav /> */}
            <Stack.Navigator
              initialRouteName={
                token ? (teamName ? "Home" : "CreateJoinTeam") : "Login"
              }
            >
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
              <Stack.Screen
                name="CreateJoinTeam"
                component={CreateOrJoinTeamScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="CreateTeam"
                component={CreateTeamScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="JoinTeamList"
                component={JoinTeamListScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="CreateManager"
                component={CreateManagerScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Home"
                component={BottomNav}
                options={{ headerShown: false }}
                initialParams={{ id: id }}
              />
              <Stack.Screen
                name="Games"
                component={GameTopNav}
                options={{ title: "Trận đấu" }}
              />
              <Stack.Screen
                name="Events"
                component={EventTopNav}
                options={{ title: "Sự kiện" }}
              />
              <Stack.Screen
                name="PlayerList"
                component={PlayerListScreen}
                options={{ title: "Danh sách player" }}
              />
              <Stack.Screen
                name="CreatePlayer"
                component={CreatePlayerScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="UpdatePlayerAvatar"
                component={UpdatePlayerAvaScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="CreateGame"
                component={CreateGameScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="CreateEvent"
                component={CreateEventScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="GameDetail"
                component={GameDetailScreen}
                options={{ title: "Chi tiết trận đấu" }}
              />
              <Stack.Screen
                name="EventDetail"
                component={EventDetailScreen}
                options={{ title: "Chi tiết sự kiện" }}
              />
              <Stack.Screen
                name="ImportPlayer"
                component={ImportExcelPlayerScreen}
                options={{ title: "Import cầu thủ" }}
              />
              <Stack.Screen
                name="GamePlayerSelect"
                component={GamePlayerSelectScreen}
                options={{ title: "Fielder select" }}
              />
              <Stack.Screen
                name="BattingOrderSelect"
                component={BattingOrderSelectScreen}
                options={{ title: "Batting Order" }}
              />
              <Stack.Screen
                name="PlayerProfile"
                component={PlayerProfileScreen}
                options={{ title: "Trận đấu" }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </RecoilRoot>
      </ToastProvider>
    </GestureHandlerRootView>
  );
}

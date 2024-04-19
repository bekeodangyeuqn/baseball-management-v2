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
import PlayBallTypeScreen from "./screens/play-ball-type-screen";
import PlayByPlayScreen from "./screens/play-by-play-screen";
import ManagerProfileScreen from "./screens/manager-profile-screen";
import TransactionsScreen from "./screens/transactions-screen";
import AddTransactionScreen from "./screens/add-transaction-screen";
import { ThemeProvider } from "@shopify/restyle";
import theme from "./component/theme";
import EquipmentScreen from "./screens/equipment-screen";
import AddEquipmentScreen from "./screens/add-equipment-screen";
import GlovesScreen from "./screens/equipment/gloves-screen";
import BallsScreen from "./screens/equipment/balls-screen";
import BatsScreen from "./screens/equipment/bats-screen";
import OthersScreen from "./screens/equipment/others-screen";
import { MenuProvider } from "react-native-popup-menu";
import BattingStatScreen from "./screens/batting-stat-screen";
import PitchingStatScreen from "./screens/pitching-stat-screen";
import PlayByPlayListScreen from "./screens/play-by-play-list-screen";
import NotificationProvider from "./provider/NotificationProvider";
import EditPlayerScreen from "./screens/edit-player-screen";

export default function App() {
  const Stack = createStackNavigator();
  const [token, setToken] = useState("");
  const [teamName, setTeamName] = useState("");
  const [id, setId] = useState(null);
  const [teamid, setTeamId] = useState(null);

  useEffect(() => {
    const getInfo = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        const decoded = jwtDecode(token);
        setToken(token);
        setTeamName(decoded.teamName);
        setId(decoded.id);
        setTeamId(decoded.teamid);
      } catch (error) {
        console.log(error);
      }
    };
    getInfo().catch((error) => console.error(error));
  }, []);

  LogBox.ignoreLogs(["Invalid prop textStyle of type array supplied to Cell"]);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider {...{ theme }}>
        <ToastProvider>
          <MenuProvider>
            <NotificationProvider>
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
                      initialParams={{ id: id, teamid: teamid }}
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
                      options={{ title: "Thông tin cầu thủ" }}
                    />
                    <Stack.Screen
                      name="EditPlayerScreen"
                      component={EditPlayerScreen}
                      options={{ title: "Cập nhật thông tin cầu thủ" }}
                    />
                    <Stack.Screen
                      name="PlayBall"
                      component={PlayBallTypeScreen}
                      options={{ title: "Lựa chọn cách cập nhật" }}
                    />
                    <Stack.Screen
                      name="PlayByPlay"
                      component={PlayByPlayScreen}
                      options={{ headerShown: false }}
                    />
                    <Stack.Screen
                      name="BattingStat"
                      component={BattingStatScreen}
                      options={{ title: "Thông số tấn công" }}
                    />
                    <Stack.Screen
                      name="PitchingStat"
                      component={PitchingStatScreen}
                      options={{ title: "Thông số pitcher" }}
                    />
                    <Stack.Screen
                      name="PlayByPlayList"
                      component={PlayByPlayListScreen}
                      options={{ title: "Play-by-play" }}
                    />
                    <Stack.Screen
                      name="ManagerProfile"
                      component={ManagerProfileScreen}
                      options={{ title: "Thông tin quản lý" }}
                    />
                    <Stack.Screen
                      name="Transactions"
                      component={TransactionsScreen}
                      options={{ title: "Quản lý thu chi" }}
                    />
                    <Stack.Screen
                      name="AddTransaction"
                      component={AddTransactionScreen}
                      options={{ title: "Thêm thu chi" }}
                    />
                    <Stack.Screen
                      name="Equipments"
                      component={EquipmentScreen}
                      options={{ title: "Quản lý dụng cụ" }}
                    />
                    <Stack.Screen
                      name="AddEquipment"
                      component={AddEquipmentScreen}
                      options={{ title: "Thêm dụng cụ" }}
                    />
                    <Stack.Screen
                      name="Gloves"
                      component={GlovesScreen}
                      options={{ title: "Găng" }}
                    />
                    <Stack.Screen
                      name="Balls"
                      component={BallsScreen}
                      options={{ title: "Bóng" }}
                    />
                    <Stack.Screen
                      name="Bats"
                      component={BatsScreen}
                      options={{ title: "Gậy" }}
                    />
                    <Stack.Screen
                      name="Others"
                      component={OthersScreen}
                      options={{ title: "Khác" }}
                    />
                  </Stack.Navigator>
                </NavigationContainer>
              </RecoilRoot>
            </NotificationProvider>
          </MenuProvider>
        </ToastProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

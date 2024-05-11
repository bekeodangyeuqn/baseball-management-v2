import { useRoute } from "@react-navigation/native";
import { useState } from "react";
import {
  View,
  useWindowDimensions,
  StyleSheet,
  Text,
  Image,
  ScrollView,
  TextInput,
  Button,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { useToast } from "react-native-toast-notifications";
import { useRecoilState } from "recoil";
import { myGamePlayers } from "../atom/GamePlayers";
import axiosInstance from "../lib/axiosClient";

const positionStr = [
  "DH",
  "P",
  "C",
  "1B",
  "2B",
  "3B",
  "SS",
  "LF",
  "CF",
  "RF",
  "None",
];

const BoxScoreScreen = () => {
  const route = useRoute();
  let initMyBatting = route.params.myBatting;
  initMyBatting = initMyBatting.sort((a, b) => a.battingOrder - b.battingOrder);
  const [index, setIndex] = useState(0);
  const [routes] = useState(
    initMyBatting.map((item, i) => ({
      key: String(i),
      title: `${item.player.jerseyNumber}.${item.player.lastName}`,
      player: item.player,
      myBatting: item,
    }))
  );
  const [isLoading, setIsLoading] = useState(false);
  const [recoilPlayersGame, setRecoilPlayersGame] =
    useRecoilState(myGamePlayers);
  const toast = useToast();
  const splitAvatarURI = (str) => {
    const arr = str.split("?");
    return arr[0];
  };

  const renderScene = SceneMap(
    routes.reduce((scenes, route) => {
      scenes[route.key] = () => {
        const [myBatting, setMyBatting] = useState(route.myBatting);
        const saveStat = async () => {
          setIsLoading(true);
          try {
            const { data } = await axiosInstance.patch(
              `playergame/updates/${myBatting.id}/`,
              {
                plateApperance: myBatting.plateApperance,
                runBattedIn: myBatting.runBattedIn,
                single: myBatting.single,
                double: myBatting.double,
                triple: myBatting.triple,
                homeRun: myBatting.homeRun,
                baseOnBall: myBatting.baseOnBall,
                intentionalBB: myBatting.intentionalBB,
                hitByPitch: myBatting.hitByPitch,
                strikeOut: myBatting.strikeOut,
                fielderChoice: myBatting.fielderChoice,
                sacrificeFly: myBatting.sacrificeFly,
                sacrificeBunt: myBatting.sacrificeBunt,
                stolenBase: myBatting.stolenBase,
                leftOnBase: myBatting.leftOnBase,
                doublePlay: myBatting.doublePlay,
                triplePlay: myBatting.triplePlay,
                run: myBatting.run,
                onBaseByError: myBatting.onBaseByError,
                position: myBatting.position,
                playedPos: myBatting.playedPos,
                putOut: myBatting.putOut,
                assist: myBatting.assist,
                error: myBatting.error,
                pitchBall: myBatting.pitchBall,
                pitchStrike: myBatting.pitchStrike,
                totalBatterFaced: myBatting.totalBatterFaced,
                totalInGameOut: myBatting.totalInGameOut,
                oppHit: myBatting.oppHit,
                oppRun: myBatting.oppRun,
                earnedRun: myBatting.earnedRun,
                oppBaseOnBall: myBatting.oppBaseOnBall,
                oppStrikeOut: myBatting.oppStrikeOut,
                hitBatter: myBatting.hitBatter,
                balk: myBatting.balk,
                wildPitch: myBatting.wildPitch,
                oppHomeRun: myBatting.oppHomeRun,
                firstPitchStrike: myBatting.firstPitchStrike,
                pickOff: myBatting.pickOff,
              }
            );
            setRecoilPlayersGame((prev) => [
              ...prev.filter((p) => p.id != data.id),
              { ...data, gameid: data.game_id },
            ]);
            setIsLoading(false);
            toast.show("Cập nhật thông số thành công", {
              type: "success",
              placement: "bottom",
              duration: 4000,
              offset: 30,
              animationType: "zoom-in",
            });
          } catch (error) {
            toast.show(error.message, {
              type: "danger",
              placement: "bottom",
              duration: 4000,
              offset: 30,
              animationType: "zoom-in",
            });
            setIsLoading(false);
          }
        };
        return (
          <SafeAreaView style={{ flex: 1 }}>
            <View style={{ backgroundColor: "#ccd5e3", padding: 10 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontSize: 16 }}>
                  {route.myBatting.battingOrder <= 9
                    ? `${route.myBatting.battingOrder}.`
                    : ""}
                </Text>
                <Text style={{ fontSize: 16 }}>
                  {
                    positionStr[
                      route.myBatting.position || route.myBatting.position == 0
                        ? route.myBatting.position
                        : route.myBatting.pos
                    ]
                  }
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-around",
                  }}
                >
                  <Image
                    source={{ uri: splitAvatarURI(route.player.avatar) }}
                    style={styles.profilePicture}
                  />
                  <Text
                    style={{ fontSize: 16, fontWeight: "bold" }}
                  >{`${route.player.jerseyNumber}.${route.player.firstName} ${route.player.lastName}`}</Text>
                </View>
              </View>
              <View
                style={{
                  width: 150,
                  alignSelf: "center",
                  marginTop: 10,
                  marginBottom: 10,
                }}
              >
                <Button title="Lưu thông số" onPress={() => saveStat()} />
              </View>
            </View>
            <ScrollView>
              <View style={{ backgroundColor: "green", padding: 10 }}>
                <Text style={{ alignSelf: "center", color: "white" }}>
                  Thông số batting
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  padding: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: "grey",
                  fontSize: 16,
                }}
              >
                <Text style={{ width: "80%" }}>Plate Apperance (PA)</Text>
                <TextInput
                  style={{ width: "20%" }}
                  name="plateApperance"
                  value={`${myBatting.plateApperance}`}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    if (/^\d+$/.test(text)) {
                      setMyBatting({
                        ...myBatting,
                        plateApperance: Number(text),
                      });
                    }
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  padding: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: "grey",
                  fontSize: 16,
                }}
              >
                <Text style={{ width: "80%" }}>Run Batted In (RBI)</Text>
                <TextInput
                  style={{ width: "20%" }}
                  name="runBattedIn"
                  value={`${myBatting.runBattedIn}`}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    if (/^\d+$/.test(text)) {
                      setMyBatting({
                        ...myBatting,
                        runBattedIn: Number(text),
                      });
                    }
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  padding: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: "grey",
                  fontSize: 16,
                }}
              >
                <Text style={{ width: "80%" }}>Single (1B)</Text>
                <TextInput
                  style={{ width: "20%" }}
                  name="single"
                  value={`${myBatting.single}`}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    if (/^\d+$/.test(text)) {
                      setMyBatting({
                        ...myBatting,
                        single: Number(text),
                      });
                    }
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  padding: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: "grey",
                  fontSize: 16,
                }}
              >
                <Text style={{ width: "80%" }}>Double (2B)</Text>
                <TextInput
                  style={{ width: "20%" }}
                  name="double"
                  value={`${myBatting.double}`}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    if (/^\d+$/.test(text)) {
                      setMyBatting({
                        ...myBatting,
                        double: Number(text),
                      });
                    }
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  padding: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: "grey",
                  fontSize: 16,
                }}
              >
                <Text style={{ width: "80%" }}>Triple (3B)</Text>
                <TextInput
                  style={{ width: "20%" }}
                  name="triple"
                  value={`${myBatting.triple}`}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    if (/^\d+$/.test(text)) {
                      setMyBatting({
                        ...myBatting,
                        triple: Number(text),
                      });
                    }
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  padding: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: "grey",
                  fontSize: 16,
                }}
              >
                <Text style={{ width: "80%" }}>Homerun (HR)</Text>
                <TextInput
                  style={{ width: "20%" }}
                  name="homeRun"
                  value={`${myBatting.homeRun}`}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    if (/^\d+$/.test(text)) {
                      setMyBatting({
                        ...myBatting,
                        homeRun: Number(text),
                      });
                    }
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  padding: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: "grey",
                  fontSize: 16,
                }}
              >
                <Text style={{ width: "80%" }}>Walk (BB)</Text>
                <TextInput
                  style={{ width: "20%" }}
                  name="baseOnBall"
                  value={`${myBatting.baseOnBall}`}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    if (/^\d+$/.test(text)) {
                      setMyBatting({
                        ...myBatting,
                        baseOnBall: Number(text),
                      });
                    }
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  padding: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: "grey",
                  fontSize: 16,
                }}
              >
                <Text style={{ width: "80%" }}>Intentional Walk (IBB)</Text>
                <TextInput
                  style={{ width: "20%" }}
                  name="intentinalBB"
                  value={`${myBatting.intentionalBB}`}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    if (/^\d+$/.test(text)) {
                      setMyBatting({
                        ...myBatting,
                        intentionalBB: Number(text),
                      });
                    }
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  padding: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: "grey",
                  fontSize: 16,
                }}
              >
                <Text style={{ width: "80%" }}>Hit By Pitch (HBP)</Text>
                <TextInput
                  style={{ width: "20%" }}
                  name="hitByPitch"
                  value={`${myBatting.hitByPitch}`}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    if (/^\d+$/.test(text)) {
                      setMyBatting({
                        ...myBatting,
                        hitByPitch: Number(text),
                      });
                    }
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  padding: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: "grey",
                  fontSize: 16,
                }}
              >
                <Text style={{ width: "80%" }}>Fielder Choice (FC)</Text>
                <TextInput
                  style={{ width: "20%" }}
                  name="fielderChoice"
                  value={`${myBatting.fielderChoice}`}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    if (/^\d+$/.test(text)) {
                      setMyBatting({
                        ...myBatting,
                        fielderChoice: Number(text),
                      });
                    }
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  padding: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: "grey",
                  fontSize: 16,
                }}
              >
                <Text style={{ width: "80%" }}>Sacrifice Fly</Text>
                <TextInput
                  style={{ width: "20%" }}
                  name="sacrificeFly"
                  value={`${myBatting.sacrificeFly}`}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    if (/^\d+$/.test(text)) {
                      setMyBatting({
                        ...myBatting,
                        sacrificeFly: Number(text),
                      });
                    }
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  padding: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: "grey",
                  fontSize: 16,
                }}
              >
                <Text style={{ width: "80%" }}>Sacrifice Bunt</Text>
                <TextInput
                  style={{ width: "20%" }}
                  name="sacrificeBunt"
                  value={`${myBatting.sacrificeBunt}`}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    if (/^\d+$/.test(text)) {
                      setMyBatting({
                        ...myBatting,
                        sacrificeBunt: Number(text),
                      });
                    }
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  padding: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: "grey",
                  fontSize: 16,
                }}
              >
                <Text style={{ width: "80%" }}>Run (R)</Text>
                <TextInput
                  style={{ width: "20%" }}
                  name="run"
                  value={`${myBatting.run}`}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    if (/^\d+$/.test(text)) {
                      setMyBatting({
                        ...myBatting,
                        run: Number(text),
                      });
                    }
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  padding: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: "grey",
                  fontSize: 16,
                }}
              >
                <Text style={{ width: "80%" }}>Strikeout (SO)</Text>
                <TextInput
                  style={{ width: "20%" }}
                  name="strikeout"
                  value={`${myBatting.strikeOut}`}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    if (/^\d+$/.test(text)) {
                      setMyBatting({
                        ...myBatting,
                        strikeOut: Number(text),
                      });
                    }
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  padding: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: "grey",
                  fontSize: 16,
                }}
              >
                <Text style={{ width: "80%" }}>Stolen Base (SB)</Text>
                <TextInput
                  style={{ width: "20%" }}
                  name="stolenBase"
                  value={`${myBatting.stolenBase}`}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    if (/^\d+$/.test(text)) {
                      setMyBatting({
                        ...myBatting,
                        stolenBase: Number(text),
                      });
                    }
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  padding: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: "grey",
                  fontSize: 16,
                }}
              >
                <Text style={{ width: "80%" }}>Left On Base (LOB)</Text>
                <TextInput
                  style={{ width: "20%" }}
                  name="leftOnBase"
                  value={`${myBatting.leftOnBase}`}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    if (/^\d+$/.test(text)) {
                      setMyBatting({
                        ...myBatting,
                        leftOnBase: Number(text),
                      });
                    }
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  padding: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: "grey",
                  fontSize: 16,
                }}
              >
                <Text style={{ width: "80%" }}>Double Play (DP)</Text>
                <TextInput
                  style={{ width: "20%" }}
                  name="doublePlay"
                  value={`${myBatting.doublePlay}`}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    if (/^\d+$/.test(text)) {
                      setMyBatting({
                        ...myBatting,
                        doublePlay: Number(text),
                      });
                    }
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  padding: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: "grey",
                  fontSize: 16,
                }}
              >
                <Text style={{ width: "80%" }}>Triple Play</Text>
                <TextInput
                  style={{ width: "20%" }}
                  name="triplePlay"
                  value={`${myBatting.triplePlay}`}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    if (/^\d+$/.test(text)) {
                      setMyBatting({
                        ...myBatting,
                        triplePlay: Number(text),
                      });
                    }
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  padding: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: "grey",
                  fontSize: 16,
                }}
              >
                <Text style={{ width: "80%" }}>On Base By Fielder Error</Text>
                <TextInput
                  style={{ width: "20%" }}
                  name="onBaseByError"
                  value={`${myBatting.onBaseByError}`}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    if (/^\d+$/.test(text)) {
                      setMyBatting({
                        ...myBatting,
                        onBaseByError: Number(text),
                      });
                    }
                  }}
                />
              </View>
              <View style={{ backgroundColor: "green", padding: 10 }}>
                <Text style={{ alignSelf: "center", color: "white" }}>
                  Thông số pitching
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  padding: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: "grey",
                  fontSize: 16,
                }}
              >
                <Text style={{ width: "80%" }}>Pitch Ball</Text>
                <TextInput
                  style={{ width: "20%" }}
                  name="pitchBall"
                  value={`${myBatting.pitchBall}`}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    if (/^\d+$/.test(text)) {
                      setMyBatting({
                        ...myBatting,
                        pitchBall: Number(text),
                      });
                    }
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  padding: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: "grey",
                  fontSize: 16,
                }}
              >
                <Text style={{ width: "80%" }}>Pitch Strike</Text>
                <TextInput
                  style={{ width: "20%" }}
                  name="pitchStrike"
                  value={`${myBatting.pitchStrike}`}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    if (/^\d+$/.test(text)) {
                      setMyBatting({
                        ...myBatting,
                        pitchStrike: Number(text),
                      });
                    }
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  padding: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: "grey",
                  fontSize: 16,
                }}
              >
                <Text style={{ width: "80%" }}>Total Batter Faced (TBF)</Text>
                <TextInput
                  style={{ width: "20%" }}
                  name="totalBatterFaced"
                  value={`${myBatting.totalBatterFaced}`}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    if (/^\d+$/.test(text)) {
                      setMyBatting({
                        ...myBatting,
                        totalBatterFaced: Number(text),
                      });
                    }
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  padding: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: "grey",
                  fontSize: 16,
                }}
              >
                <Text style={{ width: "80%" }}>Total Outs</Text>
                <TextInput
                  style={{ width: "20%" }}
                  name="totalInGameOut"
                  value={`${myBatting.totalInGameOut}`}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    if (/^\d+$/.test(text)) {
                      setMyBatting({
                        ...myBatting,
                        totalInGameOut: Number(text),
                      });
                    }
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  padding: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: "grey",
                  fontSize: 16,
                }}
              >
                <Text style={{ width: "80%" }}>Opponent Hits (H)</Text>
                <TextInput
                  style={{ width: "20%" }}
                  name="oppHit"
                  value={`${myBatting.oppHit}`}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    if (/^\d+$/.test(text)) {
                      setMyBatting({
                        ...myBatting,
                        oppHit: Number(text),
                      });
                    }
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  padding: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: "grey",
                  fontSize: 16,
                }}
              >
                <Text style={{ width: "80%" }}>Opponent Runs (R)</Text>
                <TextInput
                  style={{ width: "20%" }}
                  name="oppRun"
                  value={`${myBatting.oppRun}`}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    if (/^\d+$/.test(text)) {
                      setMyBatting({
                        ...myBatting,
                        oppRun: Number(text),
                      });
                    }
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  padding: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: "grey",
                  fontSize: 16,
                }}
              >
                <Text style={{ width: "80%" }}>Earned Runs (ER)</Text>
                <TextInput
                  style={{ width: "20%" }}
                  name="earnedRun"
                  value={`${myBatting.earnedRun}`}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    if (/^\d+$/.test(text)) {
                      setMyBatting({
                        ...myBatting,
                        earnedRun: Number(text),
                      });
                    }
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  padding: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: "grey",
                  fontSize: 16,
                }}
              >
                <Text style={{ width: "80%" }}>Opponent Walk (BB)</Text>
                <TextInput
                  style={{ width: "20%" }}
                  name="oppBaseOnBall"
                  value={`${myBatting.oppBaseOnBall}`}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    if (/^\d+$/.test(text)) {
                      setMyBatting({
                        ...myBatting,
                        oppBaseOnBall: Number(text),
                      });
                    }
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  padding: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: "grey",
                  fontSize: 16,
                }}
              >
                <Text style={{ width: "80%" }}>Opponent Strikeouts (SO)</Text>
                <TextInput
                  style={{ width: "20%" }}
                  name="oppStrikeOut"
                  value={`${myBatting.oppStrikeOut}`}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    if (/^\d+$/.test(text)) {
                      setMyBatting({
                        ...myBatting,
                        oppStrikeOut: Number(text),
                      });
                    }
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  padding: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: "grey",
                  fontSize: 16,
                }}
              >
                <Text style={{ width: "80%" }}>Hit Batter</Text>
                <TextInput
                  style={{ width: "20%" }}
                  name="hitBatter"
                  value={`${myBatting.hitBatter}`}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    if (/^\d+$/.test(text)) {
                      setMyBatting({
                        ...myBatting,
                        hitBatter: Number(text),
                      });
                    }
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  padding: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: "grey",
                  fontSize: 16,
                }}
              >
                <Text style={{ width: "80%" }}>Balk (BK)</Text>
                <TextInput
                  style={{ width: "20%" }}
                  name="balk"
                  value={`${myBatting.balk}`}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    if (/^\d+$/.test(text)) {
                      setMyBatting({
                        ...myBatting,
                        balk: Number(text),
                      });
                    }
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  padding: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: "grey",
                  fontSize: 16,
                }}
              >
                <Text style={{ width: "80%" }}>Wild Pitch (WP)</Text>
                <TextInput
                  style={{ width: "20%" }}
                  name="wildPitch"
                  value={`${myBatting.wildPitch}`}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    if (/^\d+$/.test(text)) {
                      setMyBatting({
                        ...myBatting,
                        wildPitch: Number(text),
                      });
                    }
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  padding: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: "grey",
                  fontSize: 16,
                }}
              >
                <Text style={{ width: "80%" }}>Opponent Homerun (HR)</Text>
                <TextInput
                  style={{ width: "20%" }}
                  name="oppHomeRun"
                  value={`${myBatting.oppHomeRun}`}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    if (/^\d+$/.test(text)) {
                      setMyBatting({
                        ...myBatting,
                        oppHomeRun: Number(text),
                      });
                    }
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  padding: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: "grey",
                  fontSize: 16,
                }}
              >
                <Text style={{ width: "80%" }}>
                  Count of First Pitch Strikes
                </Text>
                <TextInput
                  style={{ width: "20%" }}
                  name="firstPitchStrike"
                  value={`${myBatting.firstPitchStrike}`}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    if (/^\d+$/.test(text)) {
                      setMyBatting({
                        ...myBatting,
                        firstPitchStrike: Number(text),
                      });
                    }
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  padding: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: "grey",
                  fontSize: 16,
                }}
              >
                <Text style={{ width: "80%" }}>Success Pickoff (PO)</Text>
                <TextInput
                  style={{ width: "20%" }}
                  name="pickOff"
                  value={`${myBatting.pickOff}`}
                  keyboardType="numeric"
                  onChangeText={(text) => {
                    if (/^\d+$/.test(text)) {
                      setMyBatting({
                        ...myBatting,
                        pickOff: Number(text),
                      });
                    }
                  }}
                />
              </View>
            </ScrollView>
          </SafeAreaView>
        );
      }; // Replace this with your own component
      return scenes;
    }, {})
  );

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      scrollEnabled
      renderLabel={({ route }) => (
        <View style={{ width: 100 }}>
          <Text style={styles.tabText}>{route.title}</Text>
        </View>
      )}
      style={styles.tab}
      indicatorStyle={styles.indicator}
    />
  );

  const layout = useWindowDimensions();

  return (
    <>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
      />
      {isLoading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <></>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  tab: {
    // padding: 5,
    backgroundColor: "white",
  },
  tabText: {
    fontSize: 16,
    alignSelf: "center",
  },
  indicator: {
    borderBottomWidth: 2,
    borderBottomColor: "blue",
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 100,
    borderColor: "#ccc",
    borderWidth: 1,
    // alignSelf: "center",
    // marginTop: 20,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default BoxScoreScreen;

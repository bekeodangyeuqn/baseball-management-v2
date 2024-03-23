import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { useRecoilValue } from "recoil";
import field from "../assets/image/field.jpg";
import { gameByIdState } from "../atom/Games";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode from "jwt-decode";
import {
  Ionicons,
  MaterialCommunityIcons,
  Entypo,
  FontAwesome5,
} from "@expo/vector-icons";
import { filteredPlayers } from "../atom/Players";
import { myBattingOrder, myGamePlayersByGameId } from "../atom/GamePlayers";
import { Text, View, TouchableOpacity } from "react-native";
import PlayerListItem from "../component/PlayerListItem";
import { useToast } from "react-native-toast-notifications";
import Filter from "../component/Filter";
import { TabView, SceneMap } from "react-native-tab-view";
import MenuIcon from "../component/MenuIcon";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import { Audio } from "expo-av";

const FirstRoute = () => (
  <View style={[styles.scene, { backgroundColor: "#ff4081" }]}>
    <Text>View 1</Text>
  </View>
);
const SecondRoute = () => (
  <View style={[styles.scene, { backgroundColor: "#673ab7" }]}>
    <Text>View 2</Text>
  </View>
);

const renderScene = SceneMap({
  first: FirstRoute,
  second: SecondRoute,
});

const PlayByPlayScreen = () => {
  const toast = useToast();

  const [sound, setSound] = useState();

  async function playSound(type) {
    console.log("Loading Sound");
    let sound;
    if (type === 1) {
      const { sound: newSound } = await Audio.Sound.createAsync(
        require("../assets/sound/ball.mp3")
      );
      sound = newSound;
    }

    if (type === 2) {
      const { sound: newSound } = await Audio.Sound.createAsync(
        require("../assets/sound/strike.mp3")
      );
      sound = newSound;
    }

    if (type === 3) {
      const { sound: newSound } = await Audio.Sound.createAsync(
        require("../assets/sound/foul.mp3")
      );
      sound = newSound;
    }

    setSound(sound);

    console.log("Playing Sound");
    await sound.playAsync();
  }

  useEffect(() => {
    return sound
      ? () => {
          console.log("Unloading Sound");
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);
  const playersPos = {
    Outfield: [7, 8, 9],
    Infield: [5, 6, 4, 3],
    P: [1],
    DH: [0],
    C: [2],
  };
  const [outModalVisible, setOutModalVisible] = useState(false);
  const [safeModalVisible, setSafeModalVisible] = useState(false);

  const [firstRunnerVisible, setFirstRunnerVisible] = useState(false);
  const [secondRunnerVisible, setSecondRunnerVisible] = useState(false);
  const [thirdRunnerVisible, setThirdRunnerVisible] = useState(false);
  const [batterRunnerVisible, setBatterRunnerVisible] = useState(false);

  const runnerPos = [13, 12, 11];

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

  const route = useRoute();
  const gameid = route.params.gameid;
  const beforeId = route.params.beforeId;
  const myFirstBatting = route.params.myBatting;
  const [teamid, setTeamid] = useState(null);
  const players = useRecoilValue(filteredPlayers(teamid));
  const game = useRecoilValue(gameByIdState(gameid));
  const navigation = useNavigation();
  const myPlayers = useRecoilValue(myGamePlayersByGameId(gameid));
  // const myFirstBatting = useRecoilValue(myBattingOrder(gameid));
  const [myBatting, setMyBatting] = useState(myFirstBatting);
  const [pos, setPos] = useState(null);
  const snapPoints = useMemo(() => ["50%"], []);
  const playersBottomSheet = useRef(null);
  const filterBottomSheet = useRef(null);
  const choosePlayerBottomSheet = useRef(null);
  const [teamName, setTeamName] = useState("");

  const [teamScore, setTeamScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [out, setOut] = useState(0);
  const [inning, setinning] = useState(1);
  const [isTop, setIsTop] = useState(true);
  const [ball, setBall] = useState(0);
  const [strike, setStrike] = useState(0);
  const [isOffense, setIsOffense] = useState(beforeId);
  const [isRunnerFirst, setIsRunnerFirst] = useState(null);
  const [isRunnerSecond, setIsRunnerSecond] = useState(null);
  const [isRunnerThird, setIsRunnerThird] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [outcomeType, setOutcomeType] = useState(null);
  const [description, setDescription] = useState("");
  const [numPitchers, setNumPitchers] = useState(1);

  const [atBat, setAtBat] = useState({
    gameid: gameid,
    teamScore: 0,
    oppScore: 0,
    out: 0,
    inning: 1,
    isTop: true,
    ball: 0,
    strike: 0,
    isOffense: Number(beforeId),
    isRunnerFirst: null,
    isRunnerSecond: null,
    isRunnerThird: null,
    currentPlayer: 1,
    oppCurPlayer: 1,
    outcomeType: null,
    description: "",
    currentPitcher: myPlayers.find((p) => p.position === 1),
  });

  const [pitchers, setPitchers] = useState([]);

  const [showStrike, setShowStrike] = useState(false);
  const [showBall, setShowBall] = useState(false);
  const [showFoul, setShowFoul] = useState(false);
  useEffect(() => {
    const getInfo = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        const decoded = jwtDecode(token);
        setTeamName(decoded.shortName);
        setTeamid(decoded.teamid);
      } catch (error) {
        console.log(error);
      }
    };
    getInfo().catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    let timer;
    if (showStrike) {
      timer = setTimeout(() => {
        setShowStrike(false);
      }, 2000);
    } else if (showBall) {
      timer = setTimeout(() => {
        setShowBall(false);
      }, 2000);
    } else if (showFoul) {
      timer = setTimeout(() => {
        setShowFoul(false);
      }, 2000);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [showStrike, showBall, showFoul]);
  const viewPlayers = () => {
    playersBottomSheet.current?.expand();
  };

  const updatePitcherStat = (
    pitcher,
    type,
    ball,
    strike,
    out,
    run,
    earnRun,
    balk,
    wildPitch,
    firstPitchStrike,
    pickOff
  ) => {
    const updatePitcher = {
      ...pitcher,
      pitchBall: ball === 1 ? pitcher.pitchBall + 1 : pitcher.pitchBall,
      pitchStrike:
        strike === 1 || (type !== null && type !== 11 && type !== 12)
          ? pitcher.pitchStrike + 1
          : pitcher.pitchStrike,
      totalBatterFaced:
        type !== null ? pitcher.totalBatterFaced + 1 : pitcher.totalBatterFaced,
      totalInGameOut:
        out === 1 ? pitcher.totalInGameOut + 1 : pitcher.totalInGameOut,
      oppHit: type >= 13 && type <= 17 ? pitcher.oppHit + 1 : pitcher.oppHit,
      oppRun: run > 0 ? pitcher.oppRun + run : pitcher.oppRun,
      earnedRun: earnRun > 0 ? pitcher.earnedRun + earnRun : pitcher.earnedRun,
      oppBaseOnBall:
        type === 11 || type === 12
          ? pitcher.oppBaseOnBall + 1
          : pitcher.oppBaseOnBall,
      oppStrikeOut:
        type === 1 || type === 2
          ? pitcher.oppStrikeOut + 1
          : pitcher.oppStrikeOut,
      hitBatter: type === 19 ? pitcher.hitBatter + 1 : pitcher.hitBatter,
      balk: balk > 0 ? pitcher.balk + balk : pitcher.balk,
      wildPitch:
        wildPitch > 0 ? pitcher.wildPitch + wildPitch : pitcher.wildPitch,
      oppHomeRun: type === 16 ? pitcher.oppHomeRun + 1 : pitcher.oppHomeRun,
      firstPitchStrike:
        firstPitchStrike > 0
          ? pitcher.firstPitchStrike + 1
          : pitcher.firstPitchStrike,
      pickOff: pickOff > 0 ? pitcher.pickOff + pickOff : pitcher.pickOff,
    };
    setMyBatting((prev) => {
      let newBatting = [
        ...prev.filter((obj) => obj.player.id !== pitcher.player.id),
      ];
      newBatting.splice(9 * numPitchers, 0, updatePitcher);
      return newBatting;
    });
  };

  console.log(atBat.isOffense, atBat.out);

  const updateBatterStat = (
    player,
    type,
    rbi,
    run,
    isStolen,
    lob,
    isRunner = false
  ) => {
    const updatePlayer = {
      ...player,
      plateApperance:
        type !== null ? player.plateApperance + 1 : player.plateApperance,
      runBattedIn:
        rbi > 0 && atBat.outcomeType !== 18
          ? player.runBattedIn + rbi
          : player.runBattedIn,
      single: type === 13 ? player.single + 1 : player.single,
      double: type === 14 ? player.double + 1 : player.double,
      triple: type === 15 ? player.triple + 1 : player.triple,
      homeRun: type === 16 ? player.homeRun + 1 : player.homeRun,
      baseOnBall: type === 11 ? player.baseOnBall + 1 : player.baseOnBall,
      intentionalBB:
        type === 12 ? player.intentionalBB + 1 : player.intentionalBB,
      hitByPitch: type === 19 ? player.hitByPitch + 1 : player.hitByPitch,
      strikeOut:
        type === 1 || type === 2 || type == 8
          ? player.strikeOut + 1
          : player.strikeOut,
      fielderChoice:
        type === 20 ? player.fielderChoice + 1 : player.fielderChoice,
      sacrificeFly: type === 5 ? player.sacrificeFly + 1 : player.sacrificeFly,
      sacrificeBunt:
        type === 6 ? player.sacrificeBunt + 1 : player.sacrificeBunt,
      stolenBase: isStolen ? player.stolenBase + 1 : player.stolenBase,
      leftOnBase: lob > 0 ? player.leftOnBase + lob : player.leftOnBase,
      doublePlay: type === 9 ? player.doublePlay + 1 : player.doublePlay,
      triplePlay: type === 10 ? player.triplePlay + 1 : player.triplePlay,
      run: run > 0 ? player.run + run : player.run,
      onBaseByError:
        type === 18 ? player.onBaseByError + 1 : player.onBaseByError,
    };
    setMyBatting((prev) => {
      let newBatting = [
        ...prev.filter((obj) => obj.player.id !== player.player.id),
      ];
      if (isRunner) {
        let index = 0;
        for (let i = 0; i < prev.length; i++) {
          if (prev[i].player.id === player.player.id) {
            index = i;
            break;
          }
        }
        newBatting.splice(index, 0, updatePlayer);
      } else newBatting.splice(atBat.currentPlayer - 1, 0, updatePlayer);
      return newBatting;
    });
  };

  const handleOut = (isBatter = null, player) => {
    if (atBat.out < 2) {
      setAtBat((prev) => {
        let out = prev.out + 1;
        let player = prev.currentPlayer;
        let oppPLayer = prev.oppCurPlayer;
        if (prev.isOffense === 1) {
          if (prev.currentPlayer === 9) player = 1;
          else player = prev.currentPlayer + 1;
        } else {
          if (prev.oppCurPlayer === 9) oppPLayer = 1;
          else oppPLayer = prev.oppCurPlayer + 1;
        }

        return {
          ...prev,
          out: out,
          currentPlayer: isBatter === true ? player : prev.currentPlayer,
          oppCurPlayer: isBatter === true ? oppPLayer : prev.oppCurPlayer,
          isRunnerFirst: isBatter === 1 ? null : prev.isRunnerFirst,
          isRunnerSecond: isBatter === 2 ? null : prev.isRunnerSecond,
          isRunnerThird: isBatter === 3 ? null : prev.isRunnerThird,
          ball: 0,
          strike: 0,
        };
      });
    } else {
      setAtBat((prev) => {
        let player = prev.currentPlayer;
        let oppCurPlayer = prev.oppCurPlayer;
        if (prev.isOffense === 1) {
          if (prev.currentPlayer === 9) player = 1;
          else player = prev.currentPlayer + 1;
        } else {
          if (prev.oppCurPlayer === 9) oppCurPlayer = 1;
          else oppCurPlayer = prev.oppCurPlayer + 1;
        }

        let inn = prev.inning;
        if (!prev.isTop) inn = inn + 1;
        return {
          ...prev,
          isOffense: prev.isOffense == 0 ? 1 : 0,
          inning: inn,
          ball: 0,
          strike: 0,
          out: 0,
          currentPlayer: player,
          oppCurPlayer: oppCurPlayer,
          isRunnerFirst: null,
          isRunnerSecond: null,
          isRunnerThird: null,
          isTop: !prev.isTop,
        };
      });
    }
  };

  const isSelected = (pos) => {
    return myPlayers
      ? myPlayers.some((obj) => {
          return obj.position === pos && obj.gameid === gameid;
        })
      : false;
  };

  const isRunnerHave = (pos) => {
    switch (pos) {
      case 11:
        return atBat.isRunnerFirst !== null;
      case 12:
        return atBat.isRunnerSecond !== null;
      case 13:
        return atBat.isRunnerThird !== null;
      default:
        return false;
    }
  };

  const splitAvatarURI = (str) => {
    const arr = str.split("?");
    return arr[0];
  };
  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={outModalVisible}
        onRequestClose={() => {
          setOutModalVisible(!outModalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.modalButtonList}>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  onPress={() => {
                    setOutModalVisible(false);
                    setOutcomeType(1);
                    let lob = 0;
                    if (atBat.isRunnerFirst) lob++;
                    if (atBat.isRunnerSecond) lob++;
                    if (atBat.isRunnerThird) lob++;

                    if (atBat.isOffense === 1) {
                      updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        1,
                        0,
                        0,
                        false,
                        lob
                      );
                      handleOut(true, myBatting[atBat.currentPlayer - 1]);
                    } else {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(
                        pitcher,
                        1,
                        0,
                        3 - atBat.strike,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                      );
                      handleOut(true, atBat.oppCurPlayer);
                    }
                  }}
                  style={styles.modelButton}
                >
                  <Text style={styles.textButton}>Strikeout Looking</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setOutModalVisible(false);
                    setOutcomeType(2);
                    let lob = 0;
                    if (atBat.isRunnerFirst) lob++;
                    if (atBat.isRunnerSecond) lob++;
                    if (atBat.isRunnerThird) lob++;

                    if (atBat.isOffense === 1) {
                      updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        2,
                        0,
                        0,
                        false,
                        lob
                      );
                      handleOut(true, myBatting[atBat.currentPlayer - 1]);
                    } else {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(
                        pitcher,
                        2,
                        0,
                        3 - atBat.strike,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                      );
                      handleOut(true, atBat.oppCurPlayer);
                    }
                  }}
                  style={styles.modelButton}
                >
                  <Text style={styles.textButton}>Strikeout Swinging</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  onPress={() => {
                    setOutModalVisible(false);
                    setOutcomeType(3);
                    let lob = 0;
                    if (atBat.isRunnerFirst) lob++;
                    if (atBat.isRunnerSecond) lob++;
                    if (atBat.isRunnerThird) lob++;
                    if (atBat.isRunnerThird) setThirdRunnerVisible(true);
                    else if (atBat.isRunnerSecond) setSecondRunnerVisible(true);
                    else if (atBat.isRunnerFirst) setFirstRunnerVisible(true);
                    if (atBat.isOffense === 1) {
                      updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        3,
                        0,
                        0,
                        false,
                        lob
                      );
                      handleOut(true, myBatting[atBat.currentPlayer - 1]);
                    } else {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(pitcher, 3, 0, 0, 1, 0, 0, 0, 0, 0, 0);
                      handleOut(true, atBat.oppCurPlayer);
                    }
                  }}
                  style={styles.modelButton}
                >
                  <Text style={styles.textButton}>Groundout</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setOutModalVisible(false);
                    setOutcomeType(4);
                    let lob = 0;
                    if (atBat.isRunnerFirst) lob++;
                    if (atBat.isRunnerSecond) lob++;
                    if (atBat.isRunnerThird) lob++;
                    if (atBat.isRunnerThird) setThirdRunnerVisible(true);
                    else if (atBat.isRunnerSecond) setSecondRunnerVisible(true);
                    else if (atBat.isRunnerFirst) setFirstRunnerVisible(true);
                    if (atBat.isOffense === 1) {
                      updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        4,
                        0,
                        0,
                        false,
                        lob
                      );
                      handleOut(true, myBatting[atBat.currentPlayer - 1]);
                    } else {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(pitcher, 4, 0, 0, 1, 0, 0, 0, 0, 0, 0);
                      handleOut(true, atBat.oppCurPlayer);
                    }
                  }}
                  style={styles.modelButton}
                >
                  <Text style={styles.textButton}>Pop/Flyout</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  onPress={() => {
                    setOutModalVisible(false);
                    setOutcomeType(5);
                    if (atBat.isRunnerThird) setThirdRunnerVisible(true);
                    else if (atBat.isRunnerSecond) setSecondRunnerVisible(true);
                    else if (atBat.isRunnerFirst) setFirstRunnerVisible(true);
                    if (atBat.isOffense === 1) {
                      updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        5,
                        0,
                        0,
                        false,
                        0
                      );
                      handleOut(true, myBatting[atBat.currentPlayer - 1]);
                    } else {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(pitcher, 5, 0, 0, 1, 0, 0, 0, 0, 0, 0);
                      handleOut(true, atBat.oppCurPlayer);
                    }
                  }}
                  style={styles.modelButton}
                >
                  <Text style={styles.textButton}>Sacrifice Fly</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setOutModalVisible(false);
                    setOutcomeType(6);
                    if (atBat.isRunnerThird) setThirdRunnerVisible(true);
                    else if (atBat.isRunnerSecond) setSecondRunnerVisible(true);
                    else if (atBat.isRunnerFirst) setFirstRunnerVisible(true);
                    if (atBat.isOffense === 1) {
                      updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        6,
                        0,
                        0,
                        false,
                        0
                      );
                      handleOut(true, myBatting[atBat.currentPlayer - 1]);
                    } else {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(pitcher, 6, 0, 0, 1, 0, 0, 0, 0, 0, 0);
                      handleOut(true, atBat.oppCurPlayer);
                    }
                  }}
                  style={styles.modelButton}
                >
                  <Text style={styles.textButton}>Sacrifice Bunt</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  disabled={atBat.out > 2 ? true : false}
                  onPress={() => {
                    let lob = 0;
                    if (atBat.isRunnerFirst) lob++;
                    if (atBat.isRunnerSecond) lob++;
                    if (atBat.isRunnerThird) lob++;
                    setOutModalVisible(false);
                    setOutcomeType(7);
                    if (atBat.isRunnerThird) setThirdRunnerVisible(true);
                    else if (atBat.isRunnerSecond) setSecondRunnerVisible(true);
                    else if (atBat.isRunnerFirst) setFirstRunnerVisible(true);
                    if (atBat.isOffense === 1) {
                      updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        7,
                        0,
                        0,
                        false,
                        lob
                      );
                      handleOut(true, myBatting[atBat.currentPlayer - 1]);
                    } else {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(pitcher, 7, 0, 0, 1, 0, 0, 0, 0, 0, 0);
                      handleOut(true, atBat.oppCurPlayer);
                    }
                  }}
                  style={styles.modelButton}
                >
                  <Text style={styles.textButton}>Infield Fly</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    let lob = 0;
                    if (atBat.isRunnerFirst) lob++;
                    if (atBat.isRunnerSecond) lob++;
                    if (atBat.isRunnerThird) lob++;
                    setOutModalVisible(false);
                    setOutcomeType(8);
                    if (atBat.isRunnerThird) setThirdRunnerVisible(true);
                    else if (atBat.isRunnerSecond) setSecondRunnerVisible(true);
                    else if (atBat.isRunnerFirst) setFirstRunnerVisible(true);
                    else setBatterRunnerVisible(true);
                    if (atBat.isOffense === 1) {
                      updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        8,
                        0,
                        0,
                        false,
                        lob
                      );
                    } else {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(pitcher, 8, 0, 0, 1, 0, 0, 0, 0, 0, 0);
                      handleOut(true, atBat.oppCurPlayer);
                    }
                  }}
                  style={styles.modelButton}
                >
                  <Text style={styles.textButton}>Dropped 3rd strike</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  disabled={atBat.out > 2 ? true : false}
                  onPress={() => {
                    let lob = 0;
                    if (atBat.isRunnerFirst) lob++;
                    if (atBat.isRunnerSecond) lob++;
                    if (atBat.isRunnerThird) lob++;
                    setOutModalVisible(false);
                    setOutcomeType(9);
                    if (atBat.isRunnerThird) setThirdRunnerVisible(true);
                    else if (atBat.isRunnerSecond) setSecondRunnerVisible(true);
                    else if (atBat.isRunnerFirst) setFirstRunnerVisible(true);
                    else setBatterRunnerVisible(true);
                    if (atBat.isOffense === 1) {
                      updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        9,
                        0,
                        0,
                        false,
                        lob
                      );
                    }
                  }}
                  style={styles.modelButton}
                >
                  <Text style={styles.textButton}>
                    Grounded into Double Play
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={atBat.out > 1 ? true : false}
                  onPress={() => {
                    let lob = 0;
                    if (atBat.isRunnerFirst) lob++;
                    if (atBat.isRunnerSecond) lob++;
                    if (atBat.isRunnerThird) lob++;
                    setOutModalVisible(false);
                    setOutcomeType(10);
                    if (atBat.isRunnerThird) setThirdRunnerVisible(true);
                    else if (atBat.isRunnerSecond) setSecondRunnerVisible(true);
                    else if (atBat.isRunnerFirst) setFirstRunnerVisible(true);
                    else setBatterRunnerVisible(true);
                    if (atBat.isOffense === 1) {
                      updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        10,
                        0,
                        0,
                        false,
                        lob
                      );
                    } else {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(pitcher, 10, 0, 0, 1, 0, 0, 0, 0, 0, 0);
                      handleOut(true, atBat.oppCurPlayer);
                    }
                  }}
                  style={styles.modelButton}
                >
                  <Text style={styles.textButton}>
                    Grounded into Triple Play
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <Button title="Close" onPress={() => setOutModalVisible(false)} />
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={safeModalVisible}
        onRequestClose={() => {
          setSafeModalVisible(!safeModalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.modalButtonList}>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  onPress={() => {
                    setSafeModalVisible(false);
                    setOutcomeType(11);
                    let player = atBat.currentPlayer;
                    let oppPlayer = atBat.oppCurPlayer;
                    let runner1 = atBat.isRunnerFirst;
                    let runner2 = atBat.isRunnerSecond;
                    let runner3 = atBat.isRunnerThird;
                    let teamscore = atBat.teamScore;
                    let oppScore = atBat.oppScore;
                    let rbi = 0;
                    let earnRun = 0;
                    let run = 0;
                    if (atBat.isOffense === 1) {
                      if (player === 9) player = 1;
                      else player = atBat.currentPlayer + 1;
                      if (atBat.isRunnerFirst === null) {
                        runner1 = myBatting[atBat.currentPlayer - 1];
                      } else if (atBat.isRunnerSecond === null) {
                        runner2 = atBat.isRunnerFirst;
                        runner1 = myBatting[atBat.currentPlayer - 1];
                      } else if (atBat.isRunnerThird === null) {
                        runner3 = atBat.isRunnerSecond;
                        runner2 = atBat.isRunnerFirst;
                        runner1 = myBatting[atBat.currentPlayer - 1];
                      } else {
                        runner3 = atBat.isRunnerSecond;
                        runner2 = atBat.isRunnerFirst;
                        runner1 = myBatting[atBat.currentPlayer - 1];

                        teamscore++;
                        rbi++;
                      }
                    } else {
                      if (oppPlayer === 9) oppPlayer = 1;
                      else oppPlayer = atBat.oppCurPlayer + 1;
                      if (atBat.isRunnerFirst === null) {
                        runner1 = atBat.oppCurPlayer;
                      } else if (atBat.isRunnerSecond === null) {
                        runner2 = atBat.isRunnerFirst;
                        runner1 = atBat.oppCurPlayer;
                      } else if (atBat.isRunnerThird === null) {
                        runner3 = atBat.isRunnerSecond;
                        runner2 = atBat.isRunnerFirst;
                        runner1 = atBat.oppCurPlayer;
                      } else {
                        runner3 = atBat.isRunnerSecond;
                        runner2 = atBat.isRunnerFirst;
                        runner1 = atBat.oppCurPlayer;

                        oppScore++;
                        run++;
                        if (!Array.isArray(atBat.isRunnerFirst)) earnRun++;
                      }
                    }

                    if (atBat.isOffense === 1)
                      updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        11,
                        rbi,
                        0,
                        false,
                        0
                      );
                    else {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(
                        pitcher,
                        11,
                        4 - atBat.ball,
                        0,
                        0,
                        run,
                        earnRun,
                        0,
                        0,
                        0,
                        0
                      );
                    }

                    setAtBat((prev) => {
                      return {
                        ...prev,
                        currentPlayer: player,
                        oppCurPlayer: oppPlayer,
                        isRunnerFirst: runner1,
                        isRunnerSecond: runner2,
                        isRunnerThird: runner3,
                        teamScore: teamscore,
                        oppScore: oppScore,
                        ball: 0,
                        strike: 0,
                        outcomeType: 11,
                      };
                    });
                  }}
                  style={styles.modelButton}
                >
                  <Text style={styles.textButton}>Walk</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setSafeModalVisible(false);
                    setOutcomeType(12);
                    let player = atBat.currentPlayer;
                    let oppPlayer = atBat.oppCurPlayer;
                    let runner1 = atBat.isRunnerFirst;
                    let runner2 = atBat.isRunnerSecond;
                    let runner3 = atBat.isRunnerThird;
                    let teamscore = atBat.teamScore;
                    let oppScore = atBat.oppScore;
                    let rbi = 0;
                    let earnRun = 0;
                    let run = 0;
                    if (atBat.isOffense === 1) {
                      if (player === 9) player = 1;
                      else player = atBat.currentPlayer + 1;
                      if (atBat.isRunnerFirst === null) {
                        runner1 = myBatting[atBat.currentPlayer - 1];
                      } else if (atBat.isRunnerSecond === null) {
                        runner2 = atBat.isRunnerFirst;
                        runner1 = myBatting[atBat.currentPlayer - 1];
                      } else if (atBat.isRunnerThird === null) {
                        runner3 = atBat.isRunnerSecond;
                        runner2 = atBat.isRunnerFirst;
                        runner1 = myBatting[atBat.currentPlayer - 1];
                      } else {
                        runner3 = atBat.isRunnerSecond;
                        runner2 = atBat.isRunnerFirst;
                        runner1 = myBatting[atBat.currentPlayer - 1];

                        teamscore++;
                        rbi++;
                      }
                    } else {
                      if (oppPlayer === 9) oppPlayer = 1;
                      else oppPlayer = atBat.oppCurPlayer + 1;
                      if (atBat.isRunnerFirst === null) {
                        runner1 = atBat.oppCurPlayer;
                      } else if (atBat.isRunnerSecond === null) {
                        runner2 = atBat.isRunnerFirst;
                        runner1 = atBat.oppCurPlayer;
                      } else if (atBat.isRunnerThird === null) {
                        runner3 = atBat.isRunnerSecond;
                        runner2 = atBat.isRunnerFirst;
                        runner1 = atBat.oppCurPlayer;
                      } else {
                        runner3 = atBat.isRunnerSecond;
                        runner2 = atBat.isRunnerFirst;
                        runner1 = atBat.oppCurPlayer;

                        oppScore++;
                        run++;
                        if (!Array.isArray(atBat.isRunnerFirst)) earnRun++;
                      }
                    }

                    if (atBat.isOffense === 1)
                      updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        12,
                        rbi,
                        0,
                        false,
                        0
                      );
                    else {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(
                        pitcher,
                        12,
                        4 - atBat.ball,
                        0,
                        0,
                        run,
                        earnRun,
                        0,
                        0,
                        0,
                        0
                      );
                    }

                    setAtBat((prev) => {
                      return {
                        ...prev,
                        currentPlayer: player,
                        oppCurPlayer: oppPlayer,
                        isRunnerFirst: runner1,
                        isRunnerSecond: runner2,
                        isRunnerThird: runner3,
                        teamScore: teamscore,
                        ball: 0,
                        strike: 0,
                        outcomeType: 12,
                      };
                    });
                  }}
                  style={styles.modelButton}
                >
                  <Text style={styles.textButton}>Intentional walk</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  onPress={() => {
                    const player = myBatting[atBat.currentPlayer - 1];
                    setSafeModalVisible(false);
                    setOutcomeType(13);
                    setAtBat((prev) => {
                      return {
                        ...prev,
                        ball: 0,
                        strike: 0,
                        outcomeType: 13,
                      };
                    });
                    if (atBat.isRunnerThird !== null)
                      setThirdRunnerVisible(true);
                    else if (atBat.isRunnerSecond !== null)
                      setSecondRunnerVisible(true);
                    else if (atBat.isRunnerFirst !== null)
                      setFirstRunnerVisible(true);
                    else setBatterRunnerVisible(true);
                  }}
                  style={styles.modelButton}
                >
                  <Text style={styles.textButton}>Single</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    const player = myBatting[atBat.currentPlayer - 1];
                    setSafeModalVisible(false);
                    setOutcomeType(14);
                    setAtBat((prev) => {
                      return {
                        ...prev,
                        ball: 0,
                        strike: 0,
                        outcomeType: 14,
                      };
                    });
                    if (atBat.isRunnerThird !== null)
                      setThirdRunnerVisible(true);
                    else if (atBat.isRunnerSecond !== null)
                      setSecondRunnerVisible(true);
                    else if (atBat.isRunnerFirst !== null)
                      setFirstRunnerVisible(true);
                    else setBatterRunnerVisible(true);
                  }}
                  style={styles.modelButton}
                >
                  <Text style={styles.textButton}>Double</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  onPress={() => {
                    const player = myBatting[atBat.currentPlayer - 1];
                    setSafeModalVisible(false);
                    setOutcomeType(15);
                    setAtBat((prev) => {
                      return {
                        ...prev,
                        ball: 0,
                        strike: 0,
                        outcomeType: 15,
                      };
                    });
                    if (atBat.isRunnerThird !== null)
                      setThirdRunnerVisible(true);
                    else if (atBat.isRunnerSecond !== null)
                      setSecondRunnerVisible(true);
                    else if (atBat.isRunnerFirst !== null)
                      setFirstRunnerVisible(true);
                    else setBatterRunnerVisible(true);
                  }}
                  style={styles.modelButton}
                >
                  <Text style={styles.textButton}>Triple</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    let teamscore = atBat.teamScore;
                    let oppScore = atBat.oppScore;
                    let rbi = 1;
                    let earnRun = 1;
                    let run = 1;
                    if (atBat.isRunnerFirst !== null) {
                      if (atBat.isOffense === 1) {
                        teamscore++;
                        rbi++;
                      } else {
                        run++;
                        oppScore++;
                        if (!Array.isArray(atBat.isRunnerFirst)) earnRun++;
                      }
                    }
                    if (atBat.isRunnerSecond !== null) {
                      if (atBat.isOffense === 1) {
                        teamscore++;
                        rbi++;
                      } else {
                        run++;
                        oppScore++;
                        if (!Array.isArray(atBat.isRunnerFirst)) earnRun++;
                      }
                    }
                    if (atBat.isRunnerThird !== null) {
                      if (atBat.isOffense === 1) {
                        teamscore++;
                        rbi++;
                      } else {
                        run++;
                        oppScore++;
                        if (!Array.isArray(atBat.isRunnerFirst)) earnRun++;
                      }
                    }

                    let player = atBat.currentPlayer;
                    let oppPlayer = atBat.oppCurPlayer;
                    if (atBat.isOffense === 1) {
                      if (player === 9) player = 1;
                      else player = atBat.currentPlayer + 1;
                    } else {
                      if (oppPlayer === 9) oppPlayer = 1;
                      else oppPlayer = atBat.oppCurPlayer + 1;
                    }
                    if (atBat.isOffense === 1) teamscore++;
                    else oppScore++;
                    setSafeModalVisible(false);
                    setOutcomeType(16);
                    if (atBat.isOffense === 1)
                      updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        16,
                        rbi,
                        1,
                        false,
                        0
                      );
                    else {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(
                        pitcher,
                        16,
                        0,
                        0,
                        0,
                        run,
                        earnRun,
                        0,
                        0,
                        0,
                        0
                      );
                    }
                    setAtBat((prev) => {
                      return {
                        ...prev,
                        teamScore: teamscore,
                        oppScore: oppScore,
                        ball: 0,
                        strike: 0,
                        isRunnerFirst: null,
                        isRunnerSecond: null,
                        isRunnerThird: null,
                        currentPlayer: player,
                        oppCurPlayer: oppPlayer,
                        outcomeType: 16,
                      };
                    });
                  }}
                  style={styles.modelButton}
                >
                  <Text style={styles.textButton}>Homerun</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  onPress={() => {
                    let player = myBatting[atBat.currentPlayer - 1];
                    setSafeModalVisible(false);
                    setOutcomeType(18);
                    setAtBat((prev) => {
                      return {
                        ...prev,
                        // currentPlayer: player,
                        ball: 0,
                        strike: 0,
                        outcomeType: 18,
                      };
                    });
                    if (atBat.isRunnerThird !== null)
                      setThirdRunnerVisible(true);
                    else if (atBat.isRunnerSecond !== null)
                      setSecondRunnerVisible(true);
                    else if (atBat.isRunnerFirst !== null)
                      setFirstRunnerVisible(true);
                    else setBatterRunnerVisible(true);
                  }}
                  style={styles.modelButton}
                >
                  <Text style={styles.textButton}>Error</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    let player = atBat.currentPlayer;
                    let oppPlayer = atBat.oppCurPlayer;
                    let runner1 = atBat.isRunnerFirst;
                    let runner2 = atBat.isRunnerSecond;
                    let runner3 = atBat.isRunnerThird;
                    let teamscore = atBat.teamScore;
                    let oppScore = atBat.oppScore;
                    let rbi = 0;
                    let earnRun = 0;
                    let run = 0;

                    if (atBat.isOffense === 1) {
                      if (player === 9) player = 1;
                      else player = atBat.currentPlayer + 1;
                      if (atBat.isRunnerFirst === null) {
                        runner1 = myBatting[atBat.currentPlayer - 1];
                      } else if (atBat.isRunnerSecond === null) {
                        runner2 = atBat.isRunnerFirst;
                        runner1 = myBatting[atBat.currentPlayer - 1];
                      } else if (atBat.isRunnerThird === null) {
                        runner3 = atBat.isRunnerSecond;
                        runner2 = atBat.isRunnerFirst;
                        runner1 = myBatting[atBat.currentPlayer - 1];
                      } else {
                        runner3 = atBat.isRunnerSecond;
                        runner2 = atBat.isRunnerFirst;
                        runner1 = myBatting[atBat.currentPlayer - 1];

                        teamscore++;
                        rbi++;
                      }
                    } else {
                      if (oppPlayer === 9) oppPlayer = 1;
                      else oppPlayer = atBat.oppCurPlayer + 1;
                      if (atBat.isRunnerFirst === null) {
                        runner1 = atBat.oppCurPlayer;
                      } else if (atBat.isRunnerSecond === null) {
                        runner2 = atBat.isRunnerFirst;
                        runner1 = atBat.oppCurPlayer;
                      } else if (atBat.isRunnerThird === null) {
                        runner3 = atBat.isRunnerSecond;
                        runner2 = atBat.isRunnerFirst;
                        runner1 = atBat.oppCurPlayer;
                      } else {
                        runner3 = atBat.isRunnerSecond;
                        runner2 = atBat.isRunnerFirst;
                        runner1 = atBat.oppCurPlayer;
                        run++;
                        oppScore++;
                        if (!Array.isArray(atBat.isRunnerFirst)) earnRun++;
                      }
                    }
                    setSafeModalVisible(false);
                    setOutcomeType(19);
                    if (atBat.isOffense === 1)
                      updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        19,
                        rbi,
                        0,
                        false,
                        0
                      );
                    else {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(
                        pitcher,
                        12,
                        1,
                        0,
                        0,
                        run,
                        earnRun,
                        0,
                        0,
                        0,
                        0
                      );
                    }
                    setAtBat((prev) => {
                      return {
                        ...prev,
                        currentPlayer: player,
                        oppCurPlayer: oppPlayer,
                        isRunnerFirst: runner1,
                        isRunnerSecond: runner2,
                        isRunnerThird: runner3,
                        teamScore: teamscore,
                        ball: 0,
                        strike: 0,
                        outcomeType: 19,
                      };
                    });
                  }}
                  style={styles.modelButton}
                >
                  <Text style={styles.textButton}>Hit by pitch</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  onPress={() => {
                    setSafeModalVisible(false);
                    setOutcomeType(20);
                    setAtBat((prev) => {
                      return {
                        ...prev,
                        // currentPlayer: player,
                        ball: 0,
                        strike: 0,
                        outcomeType: 20,
                      };
                    });
                    if (atBat.isRunnerThird !== null)
                      setThirdRunnerVisible(true);
                    else if (atBat.isRunnerSecond !== null)
                      setSecondRunnerVisible(true);
                    else if (atBat.isRunnerFirst !== null)
                      setFirstRunnerVisible(true);
                    else setBatterRunnerVisible(true);
                  }}
                  style={styles.modelButton}
                >
                  <Text style={styles.textButton}>Fielder choice</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    let player = atBat.currentPlayer;
                    let oppPlayer = atBat.oppCurPlayer;
                    let runner1 = atBat.isRunnerFirst;
                    let runner2 = atBat.isRunnerSecond;
                    let runner3 = atBat.isRunnerThird;
                    let teamscore = atBat.teamScore;
                    let oppScore = atBat.oppScore;
                    let rbi = 0;
                    let earnRun = 0;
                    let run = 0;

                    if (atBat.isOffense === 1) {
                      if (player === 9) player = 1;
                      else player = atBat.currentPlayer + 1;
                      if (atBat.isRunnerFirst === null) {
                        runner1 = myBatting[atBat.currentPlayer - 1];
                      } else if (atBat.isRunnerSecond === null) {
                        runner2 = atBat.isRunnerFirst;
                        runner1 = myBatting[atBat.currentPlayer - 1];
                      } else if (atBat.isRunnerThird === null) {
                        runner3 = atBat.isRunnerSecond;
                        runner2 = atBat.isRunnerFirst;
                        runner1 = myBatting[atBat.currentPlayer - 1];
                      } else {
                        runner3 = atBat.isRunnerSecond;
                        runner2 = atBat.isRunnerFirst;
                        runner1 = myBatting[atBat.currentPlayer - 1];

                        teamscore++;
                        rbi++;
                      }
                    } else {
                      if (oppPlayer === 9) oppPlayer = 1;
                      else oppPlayer = atBat.oppCurPlayer + 1;
                      if (atBat.isRunnerFirst === null) {
                        runner1 = atBat.oppCurPlayer;
                      } else if (atBat.isRunnerSecond === null) {
                        runner2 = atBat.isRunnerFirst;
                        runner1 = atBat.oppCurPlayer;
                      } else if (atBat.isRunnerThird === null) {
                        runner3 = atBat.isRunnerSecond;
                        runner2 = atBat.isRunnerFirst;
                        runner1 = atBat.oppCurPlayer;
                      } else {
                        runner3 = atBat.isRunnerSecond;
                        runner2 = atBat.isRunnerFirst;
                        runner1 = atBat.oppCurPlayer;
                        run++;
                        oppScore++;
                        if (!Array.isArray(atBat.isRunnerFirst)) earnRun++;
                      }
                    }
                    setSafeModalVisible(false);
                    setOutcomeType(21);
                    if (atBat.isOffense === 1)
                      updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        21,
                        rbi,
                        0,
                        false,
                        0
                      );
                    else {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(
                        pitcher,
                        12,
                        0,
                        1,
                        0,
                        run,
                        earnRun,
                        0,
                        0,
                        0,
                        0
                      );
                    }
                    setAtBat((prev) => {
                      return {
                        ...prev,
                        currentPlayer: player,
                        isRunnerFirst: runner1,
                        isRunnerSecond: runner2,
                        isRunnerThird: runner3,
                        teamScore: teamscore,
                        ball: 0,
                        strike: 0,
                        outcomeType: 21,
                      };
                    });
                  }}
                  style={styles.modelButton}
                >
                  <Text style={styles.textButton}>Catcher interference</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Button title="Close" onPress={() => setSafeModalVisible(false)} />
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={batterRunnerVisible}
        onRequestClose={() => {
          setBatterRunnerVisible(!batterRunnerVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>
              Chuyện gì xảy ra với batter sau khi thành runner
            </Text>
            <View style={styles.modalButtonList}>
              <View style={{ ...styles.modalButtonRow, flexWrap: "wrap" }}>
                <TouchableOpacity
                  style={{ ...styles.modelButton, marginBottom: 4 }}
                  onPress={() => {
                    setBatterRunnerVisible(false);
                    if (atBat.isOffense == 1)
                      updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        outcomeType,
                        0,
                        0,
                        false,
                        0
                      );
                    else {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(
                        pitcher,
                        outcomeType,
                        0,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                      );
                    }
                    setAtBat((prev) => {
                      return {
                        ...prev,
                        isRunnerFirst:
                          atBat.isOffense == 1
                            ? myBatting[prev.currentPlayer - 1]
                            : outcomeType === 18
                            ? [atBat.oppCurPlayer]
                            : atBat.oppCurPlayer,
                        currentPlayer:
                          atBat.isOffense == 1
                            ? prev.currentPlayer >= 9
                              ? 1
                              : prev.currentPlayer + 1
                            : prev.currentPlayer,
                        oppCurPlayer:
                          atBat.isOffense == 0
                            ? prev.oppCurPlayer >= 9
                              ? 1
                              : prev.oppCurPlayer + 1
                            : prev.oppCurPlayer,
                      };
                    });
                  }}
                >
                  <Text style={styles.textButton}>Lên B1</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ ...styles.modelButton, marginBottom: 4 }}
                  onPress={() => {
                    setBatterRunnerVisible(false);
                    if (atBat.isOffense == 1 && outcomeType > 2)
                      updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        outcomeType,
                        0,
                        0,
                        false,
                        0
                      );
                    else if (atBat.isOffense == 0) {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(
                        pitcher,
                        outcomeType,
                        0,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                      );
                    }
                    setAtBat((prev) => {
                      return {
                        ...prev,
                        isRunnerSecond:
                          atBat.isOffense == 1
                            ? myBatting[prev.currentPlayer - 1]
                            : outcomeType === 18
                            ? [atBat.oppCurPlayer]
                            : atBat.oppCurPlayer,
                        currentPlayer:
                          atBat.isOffense == 1
                            ? prev.currentPlayer >= 9
                              ? 1
                              : prev.currentPlayer + 1
                            : prev.currentPlayer,
                        oppCurPlayer:
                          atBat.isOffense == 0
                            ? prev.oppCurPlayer >= 9
                              ? 1
                              : prev.oppCurPlayer + 1
                            : prev.oppCurPlayer,
                      };
                    });
                  }}
                >
                  <Text style={styles.textButton}>Lên B2</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    setBatterRunnerVisible(false);
                    if (atBat.isOffense == 1)
                      updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        outcomeType,
                        0,
                        0,
                        false,
                        0
                      );
                    else {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(
                        pitcher,
                        outcomeType,
                        0,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                      );
                    }
                    setAtBat((prev) => {
                      return {
                        ...prev,
                        isRunnerThird:
                          atBat.isOffense == 1
                            ? myBatting[prev.currentPlayer - 1]
                            : outcomeType == 18
                            ? [atBat.oppCurPlayer]
                            : atBat.oppCurPlayer,
                        currentPlayer:
                          atBat.isOffense == 1
                            ? prev.currentPlayer >= 9
                              ? 1
                              : prev.currentPlayer + 1
                            : prev.currentPlayer,
                        oppCurPlayer:
                          atBat.isOffense == 0
                            ? prev.oppCurPlayer >= 9
                              ? 1
                              : prev.oppCurPlayer + 1
                            : prev.oppCurPlayer,
                      };
                    });
                  }}
                >
                  <Text style={styles.textButton}>Lên B3</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    setBatterRunnerVisible(false);
                    if (atBat.isOffense == 1)
                      updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        outcomeType,
                        1,
                        1,
                        false,
                        0
                      );
                    else if (atBat.isOffense == 0) {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(
                        pitcher,
                        outcomeType,
                        0,
                        1,
                        0,
                        1,
                        outcomeType === 18 ? 0 : 1,
                        0,
                        0,
                        0,
                        0
                      );
                    }
                    setAtBat((prev) => {
                      return {
                        ...prev,
                        teamScore:
                          atBat.isOffense == 1
                            ? prev.teamScore + 1
                            : prev.teamScore,
                        oppScore:
                          atBat.isOffense == 0
                            ? prev.oppScore + 1
                            : prev.oppScore,
                        currentPlayer:
                          atBat.isOffense == 1
                            ? prev.currentPlayer >= 9
                              ? 1
                              : prev.currentPlayer + 1
                            : prev.currentPlayer,
                        oppCurPlayer:
                          atBat.isOffense == 0
                            ? prev.oppCurPlayer >= 9
                              ? 1
                              : prev.oppCurPlayer + 1
                            : prev.oppCurPlayer,
                      };
                    });
                  }}
                >
                  <Text style={styles.textButton}>Về home</Text>
                </TouchableOpacity>
              </View>
              <View style={{ ...styles.modalButtonRow, flexWrap: "wrap" }}>
                <TouchableOpacity
                  style={{ ...styles.modelButton, marginBottom: 4 }}
                  onPress={() => {
                    setBatterRunnerVisible(false);
                    if (atBat.isOffense === 1)
                      handleOut(true, myBatting[atBat.currentPlayer - 1]);
                    else {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(
                        pitcher,
                        null,
                        0,
                        1,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                      );
                      handleOut(true, atBat.oppCurPlayer);
                    }
                  }}
                >
                  <Text style={styles.textButton}>Out ở B1</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ ...styles.modelButton, marginBottom: 4 }}
                  onPress={() => {
                    setBatterRunnerVisible(false);
                    if (atBat.isOffense === 1)
                      handleOut(true, myBatting[atBat.currentPlayer - 1]);
                    else {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(
                        pitcher,
                        null,
                        0,
                        1,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                      );
                      handleOut(true, atBat.oppCurPlayer);
                    }
                  }}
                >
                  <Text style={styles.textButton}>Tag out ở B2</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ ...styles.modelButton, marginBottom: 4 }}
                  onPress={() => {
                    setBatterRunnerVisible(false);
                    if (atBat.isOffense === 1)
                      handleOut(true, myBatting[atBat.currentPlayer - 1]);
                    else {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(
                        pitcher,
                        null,
                        0,
                        1,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                      );
                      handleOut(true, atBat.oppCurPlayer);
                    }
                  }}
                >
                  <Text style={styles.textButton}>Tag out ở B3</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    setBatterRunnerVisible(false);
                    if (atBat.isOffense == 1)
                      handleOut(true, myBatting[atBat.currentPlayer - 1]);
                    else {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(
                        pitcher,
                        null,
                        0,
                        1,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                      );
                      handleOut(true, atBat.oppCurPlayer);
                    }
                  }}
                >
                  <Text style={styles.textButton}>Tag out ở home</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    setBatterRunnerVisible(false);
                    if (atBat.isOffense == 1)
                      handleOut(true, myBatting[atBat.currentPlayer - 1]);
                    else {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(
                        pitcher,
                        null,
                        0,
                        1,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                      );
                      handleOut(true, atBat.oppCurPlayer);
                    }
                  }}
                >
                  <Text style={styles.textButton}>
                    Out by fielder interference
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <Button
              title="Close"
              onPress={() => setBatterRunnerVisible(false)}
            />
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={firstRunnerVisible}
        onRequestClose={() => {
          setFirstRunnerVisible(!firstRunnerVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>
              Chuyện gì xảy ra với runner ở B1
            </Text>
            <View style={styles.modalButtonList}>
              <View style={{ ...styles.modalButtonRow, flexWrap: "wrap" }}>
                <TouchableOpacity
                  style={{ ...styles.modelButton, marginBottom: 4 }}
                  onPress={() => {
                    setFirstRunnerVisible(false);
                  }}
                >
                  <Text style={styles.textButton}>Vẫn ở B1</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ ...styles.modelButton, marginBottom: 4 }}
                  onPress={() => {
                    setFirstRunnerVisible(false);
                    setAtBat((prev) => {
                      return {
                        ...prev,
                        isRunnerFirst: null,
                        isRunnerSecond: prev.isRunnerFirst,
                      };
                    });
                    if (outcomeType > 7) setBatterRunnerVisible(true);
                  }}
                >
                  <Text style={styles.textButton}>Lên B2</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    setFirstRunnerVisible(false);
                    setAtBat((prev) => {
                      return {
                        ...prev,
                        isRunnerFirst: null,
                        isRunnerThird: prev.isRunnerFirst,
                      };
                    });
                    if (outcomeType > 7) setBatterRunnerVisible(true);
                  }}
                >
                  <Text style={styles.textButton}>Lên B3</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    setFirstRunnerVisible(false);
                    if (atBat.isOffense === 1) {
                      updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        null,
                        1,
                        0,
                        false,
                        0
                      );
                      updateBatterStat(
                        myBatting.find(
                          (obj) =>
                            atBat.isRunnerFirst.player.id === obj.player.id
                        ),
                        null,
                        0,
                        1,
                        false,
                        0,
                        true
                      );
                    } else {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(
                        pitcher,
                        null,
                        0,
                        0,
                        0,
                        1,
                        Array.isArray(atBat.isRunnerFirst) ? 1 : 0,
                        0,
                        0,
                        0,
                        0
                      );
                    }
                    setAtBat((prev) => {
                      return {
                        ...prev,
                        isRunnerFirst: null,
                        teamScore:
                          prev.isOffense == 1
                            ? prev.teamScore + 1
                            : prev.teamScore,
                        oppScore:
                          prev.isOffense == 0
                            ? prev.oppScore + 1
                            : prev.oppScore,
                      };
                    });
                    if (outcomeType > 7) setBatterRunnerVisible(true);
                  }}
                >
                  <Text style={styles.textButton}>Về home</Text>
                </TouchableOpacity>
              </View>
              <View style={{ ...styles.modalButtonRow, flexWrap: "wrap" }}>
                <TouchableOpacity
                  style={{ ...styles.modelButton, marginBottom: 4 }}
                  onPress={() => {
                    setFirstRunnerVisible(false);
                    handleOut(1, atBat.isRunnerFirst);
                    if (atBat.isOffense !== 1) {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(
                        pitcher,
                        null,
                        0,
                        0,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                      );
                    }
                    if (outcomeType > 7) setBatterRunnerVisible(true);
                  }}
                >
                  <Text style={styles.textButton}>Tag out ở B2</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ ...styles.modelButton, marginBottom: 4 }}
                  onPress={() => {
                    setFirstRunnerVisible(false);
                    if (outcomeType > 7) setBatterRunnerVisible(true);
                    handleOut(1, atBat.isRunnerFirst);
                    if (atBat.isOffense != 1) {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(
                        pitcher,
                        null,
                        0,
                        0,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                      );
                    }
                  }}
                >
                  <Text style={styles.textButton}>Tag out ở B3</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    setFirstRunnerVisible(false);
                    if (outcomeType > 7) setBatterRunnerVisible(true);
                    handleOut(1, atBat.isRunnerFirst);
                    if (atBat.isOffense != 1) {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(
                        pitcher,
                        null,
                        0,
                        0,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                      );
                    }
                  }}
                >
                  <Text style={styles.textButton}>Tag out ở home</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    setFirstRunnerVisible(false);
                    handleOut(1, atBat.isRunnerFirst);
                    if (atBat.isOffense != 1) {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(
                        pitcher,
                        null,
                        0,
                        0,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                      );
                    }
                    if (outcomeType > 7) setBatterRunnerVisible(true);
                  }}
                >
                  <Text style={styles.textButton}>Force out ở B2</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    setFirstRunnerVisible(false);
                    handleOut(1, atBat.isRunnerFirst);
                    if (atBat.isOffense != 1) {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(
                        pitcher,
                        null,
                        0,
                        0,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                      );
                    }
                    if (outcomeType > 7) setBatterRunnerVisible(true);
                  }}
                >
                  <Text style={styles.textButton}>
                    Out by fielder interference
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <Button
              title="Close"
              onPress={() => setFirstRunnerVisible(false)}
            />
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={secondRunnerVisible}
        onRequestClose={() => {
          setSecondRunnerVisible(!secondRunnerVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>
              Chuyện gì xảy ra với runner ở B2
            </Text>
            <View style={styles.modalButtonList}>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    setSecondRunnerVisible(false);
                    if (atBat.isRunnerFirst !== null)
                      setFirstRunnerVisible(true);
                    else if (outcomeType > 7) setBatterRunnerVisible(true);
                  }}
                >
                  <Text style={styles.textButton}>Vẫn ở B2</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    setSecondRunnerVisible(false);
                    setAtBat((prev) => {
                      return {
                        ...prev,
                        isRunnerSecond: null,
                        isRunnerThird: prev.isRunnerSecond,
                      };
                    });
                    if (atBat.isRunnerFirst !== null)
                      setFirstRunnerVisible(true);
                    else if (outcomeType > 7) setBatterRunnerVisible(true);
                  }}
                >
                  <Text style={styles.textButton}>Lên B3</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    setSecondRunnerVisible(false);
                    if (atBat.isOffense == 1) {
                      updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        null,
                        1,
                        0,
                        false,
                        0
                      );
                      updateBatterStat(
                        myBatting.find(
                          (obj) =>
                            atBat.isRunnerSecond.player.id === obj.player.id
                        ),
                        null,
                        0,
                        1,
                        false,
                        0,
                        true
                      );
                    } else {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(
                        pitcher,
                        null,
                        0,
                        0,
                        0,
                        1,
                        Array.isArray(atBat.isRunnerSecond) ? 1 : 0,
                        0,
                        0,
                        0,
                        0
                      );
                    }
                    setAtBat((prev) => {
                      return {
                        ...prev,
                        isRunnerSecond: null,
                        teamScore:
                          prev.isOffense == 1
                            ? prev.teamScore + 1
                            : prev.teamScore,
                        oppScore:
                          prev.isOffense == 0
                            ? prev.oppScore + 1
                            : prev.oppScore,
                      };
                    });
                    if (atBat.isRunnerFirst !== null)
                      setFirstRunnerVisible(true);
                    else if (outcomeType > 7) setBatterRunnerVisible(true);
                  }}
                >
                  <Text style={styles.textButton}>Về home</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    setSecondRunnerVisible(false);
                    handleOut(2, atBat.isRunnerSecond);
                    if (atBat.isOffense != 1) {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(
                        pitcher,
                        null,
                        0,
                        0,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                      );
                    }
                    if (atBat.isRunnerFirst !== null)
                      setFirstRunnerVisible(true);
                  }}
                >
                  <Text style={styles.textButton}>Tag out ở B3</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    setSecondRunnerVisible(false);
                    handleOut(2, atBat.isRunnerSecond);
                    if (atBat.isOffense != 1) {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(
                        pitcher,
                        null,
                        0,
                        0,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                      );
                    }
                    if (atBat.isRunnerFirst !== null)
                      setFirstRunnerVisible(true);
                  }}
                >
                  <Text style={styles.textButton}>Tag out ở home</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    setSecondRunnerVisible(false);
                    handleOut(2, atBat.isRunnerSecond);
                    if (atBat.isOffense != 1) {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(
                        pitcher,
                        null,
                        0,
                        0,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                      );
                    }
                    if (atBat.isRunnerFirst !== null)
                      setFirstRunnerVisible(true);
                  }}
                >
                  <Text style={styles.textButton}>Force out ở B3</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    setSecondRunnerVisible(false);
                    handleOut(2, atBat.isRunnerSecond);
                    if (atBat.isOffense != 1) {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(
                        pitcher,
                        null,
                        0,
                        0,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                      );
                    }
                    if (atBat.isRunnerFirst !== null)
                      setFirstRunnerVisible(true);
                  }}
                >
                  <Text style={styles.textButton}>Force out ở home</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    setSecondRunnerVisible(false);
                    handleOut(2, atBat.isRunnerSecond);
                    if (atBat.isOffense != 1) {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(
                        pitcher,
                        null,
                        0,
                        0,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                      );
                    }
                    if (atBat.isRunnerFirst !== null)
                      setFirstRunnerVisible(true);
                  }}
                >
                  <Text style={styles.textButton}>
                    Out by fielder interference
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <Button
              title="Close"
              onPress={() => setSecondRunnerVisible(false)}
            />
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={thirdRunnerVisible}
        onRequestClose={() => {
          setThirdRunnerVisible(!thirdRunnerVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>
              Chuyện gì xảy ra với runner ở B3
            </Text>
            <View style={styles.modalButtonList}>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    setThirdRunnerVisible(false);
                    if (atBat.isRunnerSecond !== null)
                      setSecondRunnerVisible(true);
                    else if (atBat.isRunnerFirst !== null)
                      setFirstRunnerVisible(true);
                    else if (outcomeType > 7) setBatterRunnerVisible(true);
                  }}
                >
                  <Text style={styles.textButton}>Vẫn ở B3</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    setThirdRunnerVisible(false);
                    if (atBat.isOffense === 1) {
                      if (outcomeType !== 18)
                        updateBatterStat(
                          myBatting[atBat.currentPlayer - 1],
                          null,
                          1,
                          0,
                          false,
                          0
                        );
                      updateBatterStat(
                        myBatting.find(
                          (obj) =>
                            atBat.isRunnerThird.player.id === obj.player.id
                        ),
                        null,
                        0,
                        1,
                        false,
                        0,
                        true
                      );
                    } else {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(
                        pitcher,
                        null,
                        0,
                        0,
                        0,
                        1,
                        Array.isArray(atBat.isRunnerThird) ? 1 : 0,
                        0,
                        0,
                        0,
                        0
                      );
                    }
                    setAtBat((prev) => {
                      return {
                        ...prev,
                        teamScore:
                          prev.isOffense == 1
                            ? prev.teamScore + 1
                            : prev.teamScore,
                        oppScore:
                          prev.isOffense == 0
                            ? prev.oppScore + 1
                            : prev.oppScore,
                        isRunnerThird: null,
                      };
                    });
                    if (atBat.isRunnerSecond !== null)
                      setSecondRunnerVisible(true);
                    else if (atBat.isRunnerFirst !== null)
                      setFirstRunnerVisible(true);
                    else if (outcomeType > 7) setBatterRunnerVisible(true);
                  }}
                >
                  <Text style={styles.textButton}>Về home</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    setThirdRunnerVisible(false);
                    handleOut(3, atBat.isRunnerThird);
                    if (atBat.isOffense != 1) {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(
                        pitcher,
                        null,
                        0,
                        0,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                      );
                    }
                    if (atBat.isRunnerSecond != null)
                      setSecondRunnerVisible(true);
                    else if (atBat.isRunnerFirst !== null)
                      setFirstRunnerVisible(true);
                  }}
                >
                  <Text style={styles.textButton}>Tag out ở home</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    setThirdRunnerVisible(false);
                    handleOut(3, atBat.isRunnerThird);
                    if (atBat.isOffense != 1) {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(
                        pitcher,
                        null,
                        0,
                        0,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                      );
                    }
                    if (atBat.isRunnerSecond !== null)
                      setSecondRunnerVisible(true);
                    else if (atBat.isRunnerFirst !== null)
                      setFirstRunnerVisible(true);
                  }}
                >
                  <Text style={styles.textButton}>Force out ở home</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    setThirdRunnerVisible(false);
                    handleOut(3, atBat.isRunnerThird);
                    if (atBat.isOffense !== 1) {
                      let reversedBatting = [...myBatting].reverse();
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(
                        pitcher,
                        null,
                        0,
                        0,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        0
                      );
                    }
                    if (atBat.isRunnerSecond !== null)
                      setSecondRunnerVisible(true);
                    else if (atBat.isRunnerFirst !== null)
                      setFirstRunnerVisible(true);
                  }}
                >
                  <Text style={styles.textButton}>
                    Out by fielder interference
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <Button
              title="Close"
              onPress={() => setThirdRunnerVisible(false)}
            />
          </View>
        </View>
      </Modal>
      <View style={styles.scoreBoard} elevation={5}>
        <View style={styles.scoreBoardTeam}>
          <Text style={{ fontWeight: "bold" }}>{teamName}</Text>
          <Text>{atBat.teamScore}</Text>
        </View>
        <View style={styles.scoreBoardTeam}>
          <Text style={{ fontWeight: "bold" }}>{game.oppTeamShort}</Text>
          <Text>{atBat.oppScore}</Text>
        </View>
        <View
          style={{ flex: 1, flexDirection: "row", border: "1px solid black" }}
        >
          {atBat.isTop ? (
            <Entypo name="triangle-up" size={15} color="green" />
          ) : (
            <Entypo name="triangle-down" size={15} color="green" />
          )}
          <Text>{atBat.inning}</Text>
        </View>
        <View
          style={{ flex: 1, flexDirection: "row", border: "1px solid black" }}
        >
          <Text>
            {atBat.out} {atBat.out != 1 ? "OUTS" : "OUT"}
          </Text>
        </View>
        <View style={{ flex: 1, flexDirection: "column", height: 35 }}>
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
            <Text>B</Text>
            {atBat.ball >= 1 ? (
              <MaterialCommunityIcons
                name="square-rounded"
                size={15}
                color="green"
              />
            ) : (
              <MaterialCommunityIcons
                name="square-rounded"
                size={15}
                color="grey"
              />
            )}
            {atBat.ball >= 2 ? (
              <MaterialCommunityIcons
                name="square-rounded"
                size={15}
                color="green"
              />
            ) : (
              <MaterialCommunityIcons
                name="square-rounded"
                size={15}
                color="grey"
              />
            )}
            {atBat.ball >= 3 ? (
              <MaterialCommunityIcons
                name="square-rounded"
                size={15}
                color="green"
              />
            ) : (
              <MaterialCommunityIcons
                name="square-rounded"
                size={15}
                color="grey"
              />
            )}
          </View>
          <View style={{ flex: 1, flexDirection: "row" }}>
            <Text>S</Text>
            {atBat.strike >= 1 ? (
              <MaterialCommunityIcons
                name="square-rounded"
                size={15}
                color="red"
              />
            ) : (
              <MaterialCommunityIcons
                name="square-rounded"
                size={15}
                color="grey"
              />
            )}
            {atBat.strike >= 2 ? (
              <MaterialCommunityIcons
                name="square-rounded"
                size={15}
                color="red"
              />
            ) : (
              <MaterialCommunityIcons
                name="square-rounded"
                size={15}
                color="grey"
              />
            )}
          </View>
        </View>
        <View
          style={{ flex: 1, flexDirection: "row", border: "1px solid black" }}
        >
          {atBat.isRunnerThird ? (
            <MaterialCommunityIcons
              name="rhombus"
              size={18}
              color="green"
              style={{ position: "relative", top: 12 }}
            />
          ) : (
            <MaterialCommunityIcons
              name="rhombus"
              size={18}
              color="white"
              style={{ position: "relative", top: 12 }}
            />
          )}
          {atBat.isRunnerSecond ? (
            <MaterialCommunityIcons name="rhombus" size={18} color="green" />
          ) : (
            <MaterialCommunityIcons name="rhombus" size={18} color="white" />
          )}
          {atBat.isRunnerFirst ? (
            <MaterialCommunityIcons
              name="rhombus"
              size={18}
              color="green"
              style={{ position: "relative", top: 12 }}
            />
          ) : (
            <MaterialCommunityIcons
              name="rhombus"
              size={18}
              color="white"
              style={{ position: "relative", top: 12 }}
            />
          )}
        </View>
      </View>
      <ImageBackground
        source={field}
        style={{
          width: "100%",
          aspectRatio: 2 / 3,
          alignItems: "center",
          justifyContent: "space-around",
        }}
        resizeMode="contain"
      >
        {atBat.isOffense == 0 ? (
          Object.keys(playersPos).map((position, index) => (
            <View
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "space-around",
              }}
              key={index}
            >
              {playersPos[position].map((posNumber) => (
                <TouchableOpacity
                  key={posNumber}
                  onPress={() => {
                    setPos(posNumber);
                    choosePlayerBottomSheet.current?.expand();
                  }}
                  style={{
                    alignItems: "center",
                    marginLeft: posNumber === 0 ? 300 : 0,
                    marginTop:
                      posNumber !== 2
                        ? posNumber === 3 || posNumber === 5
                          ? 220
                          : 180
                        : 0,
                    marginBottom:
                      posNumber === 2 ? 120 : posNumber === 0 ? 120 : 0,
                  }}
                >
                  <FontAwesome5
                    name="tshirt"
                    size={35}
                    color={isSelected(posNumber) ? "green" : "white"}
                  ></FontAwesome5>
                  {myPlayers ? (
                    <Text
                      style={{
                        color: "white",
                        backgroundColor: isSelected(posNumber)
                          ? "#333333bb"
                          : null,
                        padding: 2,
                        paddingHorizontal: 7,
                        fontWeight: "bold",
                        alignItems: "center",
                      }}
                    >
                      {myPlayers.find((obj) => obj.position === posNumber)
                        ? myPlayers.find((obj) => obj.position === posNumber)
                            .player.jerseyNumber
                        : null}
                    </Text>
                  ) : null}
                  <Text
                    style={{
                      backgroundColor: "#333333bb",
                      color: "white",
                      padding: 2,
                      paddingHorizontal: 7,
                      fontWeight: "bold",
                    }}
                  >
                    {positionStr[posNumber]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))
        ) : (
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              justifyContent: "space-around",
            }}
          >
            {runnerPos.map((posNumber) => (
              <TouchableOpacity
                key={posNumber}
                onPress={() => {
                  setPos(posNumber);
                  choosePlayerBottomSheet.current?.expand();
                }}
                style={{
                  alignItems: "center",

                  marginTop: posNumber === 12 ? 100 : 200,
                }}
              >
                <FontAwesome5
                  name="tshirt"
                  size={35}
                  color={isRunnerHave(posNumber) ? "green" : "white"}
                ></FontAwesome5>
                {myPlayers ? (
                  <Text
                    style={{
                      color: "white",
                      backgroundColor: isRunnerHave(posNumber)
                        ? "#333333bb"
                        : null,
                      padding: 2,
                      paddingHorizontal: 7,
                      fontWeight: "bold",
                    }}
                  >
                    {posNumber === 11
                      ? atBat.isRunnerFirst === null
                        ? null
                        : atBat.isRunnerFirst.player.jerseyNumber
                      : posNumber === 12
                      ? atBat.isRunnerSecond === null
                        ? null
                        : atBat.isRunnerSecond.player.jerseyNumber
                      : atBat.isRunnerThird === null
                      ? null
                      : atBat.isRunnerThird.player.jerseyNumber}
                  </Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ImageBackground>
      {atBat.isOffense == 1 ? (
        <View style={styles.batterRow}>
          <View>
            <Text style={styles.title}>STT</Text>
            <Text style={styles.content}>{atBat.currentPlayer}</Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Image
              style={styles.image}
              resizeMode="contain"
              source={{
                uri: splitAvatarURI(
                  myBatting[atBat.currentPlayer - 1].player.avatar
                ),
              }}
            />
            <View>
              <Text style={styles.title}>At bat</Text>
              <Text style={styles.content}>{`${
                myBatting[atBat.currentPlayer - 1].player.jerseyNumber
              }.${myBatting[atBat.currentPlayer - 1].player.firstName} ${
                myBatting[atBat.currentPlayer - 1].player.lastName
              }`}</Text>
            </View>
          </View>
          <View>
            <Text style={styles.title}>Vị trí</Text>
            <Text style={styles.content}>
              {positionStr[myBatting[atBat.currentPlayer - 1].position]}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.batterRow}>
          <View style={{ flexDirection: "row" }}>
            <Image
              style={styles.image}
              resizeMode="contain"
              source={{
                uri: splitAvatarURI(atBat.currentPitcher.player.avatar),
              }}
            />
            <View>
              <Text style={styles.title}>Pitcher</Text>
              <Text
                style={styles.content}
              >{`${atBat.currentPitcher.player.jerseyNumber}.${atBat.currentPitcher.player.firstName} ${atBat.currentPitcher.player.lastName}`}</Text>
            </View>
          </View>
          <View>
            <Text style={styles.title}>ERA</Text>
            <Text style={styles.content}>0.00</Text>
          </View>
          <View>
            <Text style={styles.title}>Count</Text>
            <Text style={styles.content}>
              {[...myBatting].reverse().find((p) => p.position === 1)
                .pitchStrike +
                [...myBatting].reverse().find((p) => p.position === 1)
                  .pitchBall}
            </Text>
          </View>
        </View>
      )}
      <View style={styles.buttonRow}>
        <Button
          style={styles.button}
          title="Ball"
          onPress={() => {
            if (atBat.ball < 3) {
              let pitcher = [...myBatting]
                .reverse()
                .find((p) => p.position === 1);
              updatePitcherStat(pitcher, null, 1, 0, 0, 0, 0, 0, 0, 0, 0);
              setAtBat((prev) => {
                return { ...prev, ball: prev.ball + 1 };
              });
              playSound(1);
              setShowBall(true);
            }
          }}
        />
        <Button
          style={styles.button}
          title="Strike"
          onPress={() => {
            if (atBat.strike < 2) {
              let pitcher = [...myBatting]
                .reverse()
                .find((p) => p.position === 1);
              updatePitcherStat(pitcher, null, 0, 1, 0, 0, 0, 0, 0, 0, 0);
              setAtBat((prev) => {
                return { ...prev, strike: prev.strike + 1 };
              });
              playSound(2);
              setShowStrike(true);
            }
          }}
        />
        <Button
          style={styles.button}
          title="Foul"
          onPress={() => {
            if (atBat.strike < 2) {
              setAtBat((prev) => {
                return { ...prev, strike: prev.strike + 1 };
              });
            }
            let pitcher = [...myBatting]
              .reverse()
              .find((p) => p.position === 1);
            updatePitcherStat(pitcher, null, 0, 1, 0, 0, 0, 0, 0, 0, 0);
            playSound(3);
            setShowFoul(true);
          }}
        />
        <Button
          style={styles.button}
          title="Out"
          onPress={() => setOutModalVisible(true)}
        />
        <Button
          style={styles.button}
          title="Safe"
          onPress={() => setSafeModalVisible(true)}
        />
      </View>
      {showStrike && <Text style={styles.strikeText}>Strike</Text>}
      {showBall && (
        <Text style={{ ...styles.strikeText, color: "green" }}>Ball</Text>
      )}
      {showFoul && (
        <Text style={{ ...styles.strikeText, color: "orange" }}>Foul</Text>
      )}
      <View
        style={{
          position: "absolute",
          right: 15,
          top: 75,
          zIndex: 4,
        }}
      >
        <Menu>
          <MenuTrigger>
            <Entypo name="menu" size={24} color="black" />
          </MenuTrigger>
          <MenuOptions>
            <MenuOption onSelect={() => {}}>
              <Text>Play by play</Text>
            </MenuOption>
            <MenuOption
              onSelect={() => {
                let offData = [];
                let numPlayerEachOrder = [0, 0, 0, 0, 0, 0, 0, 0, 0];
                let myBattingAll = [];
                for (let i = 0; i < myBatting.length; i++) {
                  if (i % 9 === 0 && i !== 0) continue;
                  else if (myBatting[i] !== null) numPlayerEachOrder[i % 10]++;
                }

                for (let i = 0; i < 9; i++) {
                  for (let j = 0; j < numPlayerEachOrder[i]; j++) {
                    if (myBatting[i + 10 * j] !== null)
                      myBattingAll.push(myBatting[i + 10 * j]);
                  }
                }
                myBattingAll.map((obj) => {
                  const atBat =
                    obj.plateApperance -
                    obj.baseOnBall -
                    obj.hitByPitch -
                    obj.sacrificeFly -
                    obj.sacrificeBunt -
                    obj.intentionalBB;
                  const hit =
                    obj.single + obj.double + obj.triple + obj.homeRun;
                  offData.push([
                    `#${obj.player.jerseyNumber}.${obj.player.lastName}`,
                    atBat,
                    obj.run,
                    hit,
                    obj.baseOnBall + obj.intentionalBB,
                    obj.runBattedIn,
                    obj.stolenBase,
                    obj.strikeOut,
                    atBat === 0 ? "-" : `.${(hit / atBat).toFixed(3) * 1000}`,
                    obj.plateApperance === 0
                      ? "-"
                      : `.${
                          (
                            (hit +
                              obj.baseOnBall +
                              obj.hitByPitch +
                              obj.intentionalBB) /
                            obj.plateApperance
                          ).toFixed(3) * 1000
                        }`,
                    obj.leftOnBase,
                  ]);
                });
                navigation.navigate("BattingStat", { offData: offData });
              }}
            >
              <Text>Thống kê Batting</Text>
            </MenuOption>
            <MenuOption onSelect={() => console.log("Option 3 clicked")}>
              <Text>Thống kê Fielding</Text>
            </MenuOption>
            <MenuOption
              onSelect={() => {
                let pitchData = [];
                let myPitchingAll = [];
                for (let i = 0; i < myBatting.length; i++) {
                  if (myBatting[i] !== null) {
                    if (myBatting[i].position === 1)
                      myPitchingAll.push(myBatting[i]);
                  }
                }

                myPitchingAll.map((obj) => {
                  let inning = Math.floor(obj.totalInGameOut / 3);
                  let leftOut = obj.totalInGameOut % 3;
                  let up = obj.earnedRun * game.inningERA * 3;
                  let down = obj.totalInGameOut;
                  let era = "";
                  if (down === 0)
                    if (obj.earnedRun !== 0) era = "INF";
                    else era = "-";
                  else era = (up / down).toFixed(2);
                  pitchData.push([
                    `#${obj.player.jerseyNumber}.${obj.player.lastName}`,
                    `${inning}.${leftOut}`,
                    obj.oppHit,
                    obj.oppRun,
                    obj.earnedRun,
                    obj.oppBaseOnBall,
                    obj.oppStrikeOut,
                    obj.oppHomeRun,
                    era,
                  ]);
                });
                navigation.navigate("PitchingStat", { pitchData: pitchData });
              }}
            >
              <Text>Thống kê Pitching</Text>
            </MenuOption>
          </MenuOptions>
        </Menu>
      </View>
    </View>
  );
};

export default PlayByPlayScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 35,
  },
  button: {
    backgroundColor: "green",
    margin: 5,
    padding: 10,
    alignItems: "center",
    marginTop: "auto",
    border: "1px solid black",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
    marginTop: 20,
  },
  scoreBoard: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",

    padding: 10,
    backgroundColor: "#d9d9d9",
    shadowColor: "#000000",
    shadowOpacity: 0.8,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 1,
    },
  },
  scoreBoardTeam: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-around",
    width: "20%",
    border: "1px solid black",
  },
  batterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 2,
    width: "100%",
    alignItems: "center",
    backgroundColor: "#d9d9d9",
    shadowColor: "#000000",
    shadowOpacity: 0.8,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 1,
    },
  },
  image: {
    width: 40,
    height: 40,
    marginEnd: 4,
  },
  content: {
    fontSize: 16,
    fontWeight: "bold",
  },
  title: {
    color: "grey",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "100%",
    height: "90%",
  },
  scene: {
    flex: 1,
  },
  modalButtonList: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    width: "100%",
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    flexWrap: "wrap",
  },
  modelButton: {
    width: "45%",
    borderStyle: "solid",
    borderColor: "black",
    backgroundColor: "green",
    padding: 10,
    marginBottom: 4,
  },
  textButton: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
  },
  strikeText: {
    position: "absolute",
    fontSize: 30,
    color: "red",
    fontWeight: "bold",
  },
});

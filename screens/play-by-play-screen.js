import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Image,
  ImageBackground,
  Modal,
  StyleSheet,
} from "react-native";
import { useRecoilState, useRecoilValue } from "recoil";
import field from "../assets/image/field.jpg";
import { gameByIdState, gameBygameIdState, gamesState } from "../atom/Games";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode from "jwt-decode";
import {
  Ionicons,
  MaterialCommunityIcons,
  Entypo,
  FontAwesome5,
} from "@expo/vector-icons";
import { filteredPlayers, playersState } from "../atom/Players";
import { myBattingOrder, myGamePlayersByGameId } from "../atom/GamePlayers";
import { Text, View, TouchableOpacity } from "react-native";
import PlayerListItem from "../component/PlayerListItem";
import { useToast } from "react-native-toast-notifications";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import { Audio } from "expo-av";
import {
  atBatsSelectorByGameId,
  atBatsState,
  atBatsStatusSelectorByGameId,
  atBatsStatusState,
  lastStatusSelectorByGameId,
  lastStatusState,
} from "../atom/AtBats";
import axiosInstance from "../lib/axiosClient";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import ChoosePlayerItem from "../component/ChoosePlayerItem";

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

  const [posRun, setPosRun] = useState(null);

  const [firstRunnerStatusVisible, setFirstRunnerStatusVisible] =
    useState(false);
  const [secondRunnerStatusVisible, setSecondRunnerStatusVisible] =
    useState(false);
  const [thirdRunnerStatusVisible, setThirdRunnerStatusVisible] =
    useState(false);

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
  let myFirstBatting = route.params.myBatting;
  const [isLoading, setIsLoading] = useState(false);
  const game = useRecoilValue(gameBygameIdState(gameid));
  const navigation = useNavigation();
  let myPlayers = useRecoilValue(myGamePlayersByGameId(gameid));
  // const myFirstBatting = useRecoilValue(myBattingOrder(gameid));

  const [pos, setPos] = useState(null);
  const snapPoints = useMemo(() => ["50%"], []);
  const playersBottomSheet = useRef(null);
  const filterBottomSheet = useRef(null);
  const choosePlayerBottomSheet = useRef(null);
  const [teamName, setTeamName] = useState("");
  const [teamNameLong, setTeamNameLong] = useState("");
  const [teamId, setTeamId] = useState(null);
  const [players, setPlayers] = useRecoilState(playersState);
  const [atBatsList, setAtBatsList] = useRecoilState(atBatsState);

  const [teamScore, setTeamScore] = useState(0);
  const [oppScore, setOppScore] = useState(0);
  const [out, setOut] = useState(0);
  const [inning, setinning] = useState(1);
  const [isTop, setIsTop] = useState(true);
  const [ball, setBall] = useState(0);
  const [strike, setStrike] = useState(0);
  const [isOffense, setIsOffense] = useState(beforeId);
  const [isRunnerFirst, setIsRunnerFirst] = useState(true);
  const [isRunnerSecond, setIsRunnerSecond] = useState(true);
  const [isRunnerThird, setIsRunnerThird] = useState(true);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [outcomeType, setOutcomeType] = useState(null);
  const [description, setDescription] = useState("");
  const [numPitchers, setNumPitchers] = useState(1);

  const undo = () => {
    console.log(pastState[pastState.length - 1]);
    if (pastState.length === 0) return;

    const newPast = [...pastState];
    const newPresent = newPast.pop();

    setPastState(newPast);
    setAtBatStatus(newPresent);
    setFutureState([atBatStatus, ...futureState]);
    setAtBat(newPresent.atBat);
    setMyBatting(newPresent.myBatting);
    setAtBatsList((prev) => {
      let newArray = [...prev];

      let future = newArray.pop();
      const newPast = [...pastList];
      newPast.pop();
      setPastList(newPast);
      setFutureList((prev) => [future, ...prev]);
      return newArray;
    });
    setNotSavedAtBats((prev) => {
      let newArray = [...prev];

      let future = newArray.pop();
      const newPast = [...pastNotSaved];
      newPast.pop();
      setPastNotSaved(newPast);
      setFutureNotSaved((prev) => [future, ...prev]);
      return newArray;
    });
  };

  const redo = () => {
    console.log(futureState[0]);
    if (futureState.length === 0) return;

    const newFuture = [...futureState];
    const newPresent = newFuture.shift();

    setPastState([...pastState, atBatStatus]);
    setFutureState(newFuture);
    setAtBatStatus(newPresent);
    setAtBat(newPresent.atBat);
    setMyBatting(newPresent.myBatting);
    setAtBatsList((prev) => {
      let newFuture = [...futureList];
      const newPresent = newFuture.shift();
      let newArray = [...prev, newPresent];
      setFutureList(newFuture);
      setPastList([...pastList, prev[prev.length - 1]]);
      return newArray;
    });
    setNotSavedAtBats((prev) => {
      let newFuture = [...futureNotSaved];
      const newPresent = newFuture.shift();
      let newArray = [...prev, newPresent];
      setFutureNotSaved(newFuture);
      setPastNotSaved([...pastList, prev[prev.length - 1]]);
      return newArray;
    });
  };

  let recoilAtBat = useRecoilValue(atBatsSelectorByGameId(gameid));
  const [lastState, setLastState] = useRecoilState(lastStatusState);
  const recoilLastState = useRecoilValue(lastStatusSelectorByGameId(gameid));
  const [recoilAtBatStatus, setRecoilAtBatStatus] =
    useRecoilState(atBatsStatusState);
  const [atBatStatus, setAtBatStatus] = useState(recoilLastState);
  const [pastState, setPastState] = useState(async () => {
    const lastPastState = await AsyncStorage.getItem(`pastState-${gameid}`);
    return lastPastState ? JSON.parse(lastPastState) : [];
  });

  const [futureState, setFutureState] = useState(async () => {
    const lastFutureState = await AsyncStorage.getItem(`futureState-${gameid}`);
    return lastFutureState ? JSON.parse(lastFutureState) : [];
  });

  const [pastList, setPastList] = useState([]);
  const [futureList, setFutureList] = useState([]);
  const [pastNotSaved, setPastNotSaved] = useState([]);
  const [futureNotSaved, setFutureNotSaved] = useState([]);
  useEffect(() => {
    AsyncStorage.setItem(`pastState-${gameid}`, JSON.stringify(pastState));
  }, [pastState]);

  useEffect(() => {
    AsyncStorage.setItem(`futureState-${gameid}`, JSON.stringify(futureState));
  }, [futureState]);

  const [myBatting, setMyBatting] = useState(
    recoilAtBat.length <= 1
      ? myFirstBatting
      : lastState.find((state) => state.atBat.gameid === gameid).myBatting
  );
  const [notSavedAtBats, setNotSavedAtBats] = useState(
    recoilAtBat.filter((b) => !b.id)
  );
  const [atBat, setAtBat] = useState(
    recoilAtBat.length <= 1
      ? {
          gameid: gameid,
          teamScore: 0,
          oppScore: 0,
          out: 0,
          inning: 1,
          isTop: true,
          ball: 0,
          strike: 0,
          beforeBall: 0,
          beforeStrike: 0,
          isOffense: Number(beforeId),
          isRunnerFirst: null,
          isRunnerSecond: null,
          isRunnerThird: null,
          beforeRunnerFirst: null,
          beforeRunnerSecond: null,
          beforeRunnerThird: null,
          currentPlayer: 1,
          oppCurPlayer: 1,
          outcomeType: null,
          description: "",
          currentPitcher: myPlayers.find((p) => p.position === 1),
          pitcherResponseFirst: null,
          pitcherResponseSecond: null,
          pitcherResponseThird: null,
        }
      : lastState.find((state) => state.atBat.gameid === gameid).atBat
  );

  const [pitchers, setPitchers] = useState([]);

  const [showStrike, setShowStrike] = useState(false);
  const [showBall, setShowBall] = useState(false);
  const [showFoul, setShowFoul] = useState(false);

  const [tempRunnerFirst, setTempRunnerFirst] = useState(
    recoilAtBat.length <= 1
      ? null
      : lastState.find((state) => state.atBat.gameid === gameid).atBat
          .isRunnerFirst
  );
  const [tempRunnerSecond, setTempRunnerSecond] = useState(
    recoilAtBat.length <= 1
      ? null
      : lastState.find((state) => state.atBat.gameid === gameid).atBat
          .isRunnerSecond
  );
  const [tempRunnerThird, setTempRunnerThird] = useState(
    recoilAtBat.length <= 1
      ? null
      : lastState.find((state) => state.atBat.gameid === gameid).atBat
          .isRunnerThird
  );
  const [tempPitcherResponseFirst, setTempPitcherResponseFirst] = useState(
    recoilAtBat.length <= 1
      ? null
      : lastState.find((state) => state.atBat.gameid === gameid).atBat
          .pitcherResponseFirst
  );
  const [tempPitcherResponseSecond, setTempPitcherResponseSecond] = useState(
    recoilAtBat.length <= 1
      ? null
      : lastState.find((state) => state.atBat.gameid === gameid).atBat
          .pitcherResponseSecond
  );
  const [tempPitcherResponseThird, setTempPitcherResponseThird] = useState(
    recoilAtBat.length <= 1
      ? null
      : lastState.find((state) => state.atBat.gameid === gameid).atBat
          .pitcherResponseThird
  );

  useEffect(() => {
    const getInfo = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        const decoded = jwtDecode(token);
        setTeamName(decoded.shortName);
        setTeamId(decoded.teamid);
        setTeamNameLong(decoded.teamName);
        if (players.length <= 0) {
          const { data } = await axiosInstance.get(`/players/team/${teamId}`);
          setPlayers(data);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getInfo().catch((error) => console.error(error));
  }, []);

  // useEffect(() => {
  //   if (outcomeType !== 9 && outcomeType !== 10)
  //     setAtBatStatus({ atBat: atBat, myBatting: myBatting });
  // }, [myBatting]);

  useEffect(() => {
    setLastState((prev) => {
      return [
        ...prev.filter((obj) => obj.atBat.gameid !== gameid),
        { atBat: atBat, myBatting: myBatting },
      ];
    });
  }, [
    atBat.teamScore,
    atBat.oppScore,
    atBat.out,
    atBat.inning,
    atBat.isTop,
    atBat.ball,
    atBat.strike,
    atBat.isOffense,
    atBat.isRunnerFirst,
    atBat.isRunnerSecond,
    atBat.isRunnerThird,
    atBat.beforeRunnerFirst,
    atBat.beforeRunnerSecond,
    atBat.beforeRunnerThird,
    atBat.currentPlayer,
    atBat.oppCurPlayer,
    atBat.outcomeType,
    atBat.description,
    atBat.currentPitcher,
    myBatting,
  ]);

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

  const saveNotSavedAtBats = async () => {
    setIsLoading(true);
    if (notSavedAtBats.length == 0) return;
    try {
      const promises = notSavedAtBats
        .filter((obj) => !obj.inTheAtBat)
        .map(async (obj, index) => {
          try {
            const re = {
              game_id: gameid,
              isLastState: false,
              teamScore: obj.teamScore,
              oppScore: obj.oppScore,
              out: obj.out,
              inning: obj.inning,
              isTop: obj.isTop,
              ball: obj.ball,
              strike: obj.strike,
              isOffense: obj.isOffense,
              isRunnerFirstOff_id:
                obj.isOffense == 1
                  ? obj.isRunnerFirst
                    ? Array.isArray(obj.isRunnerFirst)
                      ? obj.isRunnerFirst[0].id
                      : obj.isRunnerFirst.id
                    : null
                  : null,
              isRunnerSecondOff_id:
                obj.isOffense == 1
                  ? obj.isRunnerSecond
                    ? Array.isArray(obj.isRunnerSecond)
                      ? obj.isRunnerSecond[0].id
                      : obj.isRunnerSecond.id
                    : null
                  : null,
              isRunnerThirdOff_id:
                obj.isOffense == 1
                  ? obj.isRunnerThird
                    ? Array.isArray(obj.isRunnerThird)
                      ? obj.isRunnerThird[0].id
                      : obj.isRunnerThird.id
                    : null
                  : null,
              currentPitcher_id: obj.currentPitcher.id,
              isRunnerFirstDef:
                obj.isOffense == 0
                  ? Array.isArray(obj.isRunnerFirst)
                    ? obj.isRunnerFirst[0]
                    : obj.isRunnerFirst
                  : null,
              isRunnerSecondDef:
                obj.isOffense == 0
                  ? Array.isArray(obj.isRunnerSecond)
                    ? obj.isRunnerSecond[0]
                    : obj.isRunnerSecond
                  : null,
              isRunnerThirdDef:
                obj.isOffense == 0
                  ? Array.isArray(obj.isRunnerThird)
                    ? obj.isRunnerThird[0]
                    : obj.isRunnerThird
                  : null,
              currentPlayer: obj.currentPlayer,
              oppCurPlayer: obj.oppCurPlayer,
              outcomeType: obj.outcomeType,
              description: obj.description,
              pitcherResponseFirst_id:
                obj.isOffense == 0
                  ? obj.isRunnerFirst
                    ? obj.pitcherResponseFirst.player.id
                    : null
                  : null,
              pitcherResponseSecond_id:
                obj.isOffense == 0
                  ? obj.isRunnerSecond
                    ? obj.pitcherResponseSecond.player.id
                    : null
                  : null,
              pitcherResponseThird_id:
                obj.isOffense == 0
                  ? obj.isRunnerThird
                    ? obj.pitcherResponseThird.player.id
                    : null
                  : null,
            };
            const response = await axiosInstance.post(`/atbat/create/`, re);
            return response;
          } catch (error) {
            console.error(`Error with player ${index}:`, error);
            return error;
          }
        });

      const responses = await Promise.all(promises);
      const req = {
        game_id: gameid,
        isLastState: true,
        teamScore: atBat.teamScore,
        oppScore: atBat.oppScore,
        out: atBat.out,
        inning: atBat.inning,
        isTop: atBat.isTop,
        ball: atBat.ball,
        strike: atBat.strike,
        isOffense: atBat.isOffense,
        isRunnerFirstOff_id:
          atBat.isOffense == 1
            ? atBat.isRunnerFirst
              ? atBat.isRunnerFirst.id
              : null
            : null,
        isRunnerSecondOff_id:
          atBat.isOffense == 1
            ? atBat.isRunnerSecond
              ? atBat.isRunnerSecond.id
              : null
            : null,
        isRunnerThirdOff_id:
          atBat.isOffense == 1
            ? atBat.isRunnerThird
              ? atBat.isRunnerThird.id
              : null
            : null,
        currentPitcher_id: atBat.currentPitcher.id,
        isRunnerFirstDef: atBat.isOffense == 0 ? atBat.isRunnerFirst : null,
        isRunnerSecondDef: atBat.isOffense == 0 ? atBat.isRunnerSecond : null,
        isRunnerThirdDef: atBat.isOffense == 0 ? atBat.isRunnerThird : null,
        currentPlayer: atBat.currentPlayer,
        oppCurPlayer: atBat.oppCurPlayer,
        outcomeType: atBat.outcomeType,
        description: "",
        pitcherResponseFirst_id:
          atBat.isOffense == 0
            ? atBat.pitcherResponseFirst
              ? atBat.pitcherResponseFirst.player.id
              : null
            : null,
        pitcherResponseSecond_id:
          atBat.isOffense == 0
            ? atBat.pitcherResponseSecond
              ? atBat.pitcherResponseSecond.player.id
              : null
            : null,
        pitcherResponseThird_id:
          atBat.isOffense == 0
            ? atBat.pitcherResponseThird
              ? atBat.pitcherResponseThird.player.id
              : null
            : null,
      };
      const oneMore = await axiosInstance.post(`/atbat/create/`, req);
      let haveError = false;
      for (const response of responses) {
        if (!response.data) {
          haveError = true;
          break;
        }
      }
      if (!oneMore.data) haveError = true;

      if (!haveError) setNotSavedAtBats([]);
      // setMyPlayers((prev) => {
      //   if (haveError) return prev;
      //   else
      //     return responses.map((obj) => {
      //       return {
      //         ...obj.data,
      //         player: allPlayers.find((p) => p.id === obj.data.player_id),
      //         gameid: obj.data.game_id,
      //       };
      //     });
      // });
      toast.show("Lưu các atbat lên server thành công", {
        type: "success",
        placement: "bottom",
        duration: 4000,
        offset: 30,
        animationType: "zoom-in",
      });
      setIsLoading(false);
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
  console.log(
    "My pitching",
    myBatting.filter((m) => m.position == 1)
  );
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
      pitchBall: ball >= 1 ? pitcher.pitchBall + ball : pitcher.pitchBall,
      pitchStrike:
        strike >= 1 || (type !== null && type !== 11 && type !== 12)
          ? pitcher.pitchStrike + strike
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
    let newBatting = [
      ...myBatting.filter((obj) => obj.player.id !== pitcher.player.id),
    ];
    newBatting.splice(9, 0, updatePitcher);
    setMyBatting((prev) => {
      return newBatting;
    });
    return newBatting;
  };

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

    let newBatting = [
      ...myBatting.filter((obj) => obj.player.id !== player.player.id),
    ];
    if (isRunner) {
      let index = 0;
      for (let i = 0; i < myBatting.length; i++) {
        if (myBatting[i].player.id === player.player.id) {
          index = i;
          break;
        }
      }
      newBatting.splice(index, 0, updatePlayer);
    } else newBatting.splice(atBat.currentPlayer - 1, 0, updatePlayer);
    setMyBatting((prev) => {
      return newBatting;
    });
    return newBatting;
  };

  const handleOut = (isBatter = null, player) => {
    if (atBat.out < 2) {
      setOut((prev) => prev + 1);
      setAtBat((prev) => {
        let player = prev.currentPlayer;
        let oppPLayer = prev.oppCurPlayer;
        if (prev.isOffense === 1) {
          if (prev.currentPlayer === 9) player = 1;
          else player = prev.currentPlayer + 1;
        } else {
          if (prev.oppCurPlayer === 9) oppPLayer = 1;
          else oppPLayer = prev.oppCurPlayer + 1;
        }
        if (isBatter === 1 && isBatter !== true) {
          setTempRunnerFirst(null);
          setTempPitcherResponseFirst(null);
        }
        if (isBatter === 2 && isBatter !== true) {
          setTempRunnerSecond(null);
          setTempPitcherResponseSecond(null);
        }
        if (isBatter === 3 && isBatter !== true) {
          setTempRunnerThird(null);
          setTempPitcherResponseThird(null);
        }
        return {
          ...prev,
          // out: out,
          currentPlayer: isBatter === true ? player : prev.currentPlayer,
          oppCurPlayer: isBatter === true ? oppPLayer : prev.oppCurPlayer,
          // isRunnerFirst: isBatter === 1 ? null : prev.isRunnerFirst,
          // isRunnerSecond: isBatter === 2 ? null : prev.isRunnerSecond,
          // isRunnerThird: isBatter === 3 ? null : prev.isRunnerThird,
          beforeRunnerFirst: prev.isRunnerFirst,
          beforeRunnerSecond: prev.isRunnerSecond,
          beforeRunnerThird: prev.isRunnerThird,
          // ball: 0,
          // strike: 0,
          beforeBall: prev.ball,
          beforeStrike: prev.strike,
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

  const endTheAtBat = (
    des = null,
    isOut = false,
    isScore = false,
    newBatting = myBatting
  ) => {
    setAtBatsList((prev) => [
      ...prev,
      {
        ...atBat,
        isLastState: false,
        description: des === null ? description : des,
      },
    ]);
    setPastList((prev) => [
      ...prev,
      {
        ...atBat,
        isLastState: false,
        description: des === null ? description : des,
      },
    ]);
    setFutureList([]);
    setNotSavedAtBats((prev) => [
      ...prev,
      {
        ...atBat,
        isLastState: false,
        id: null,
        description: des === null ? description : des,
      },
    ]);
    setPastNotSaved((prev) => [
      ...prev,
      {
        ...atBat,
        isLastState: false,
        id: null,
        description: des === null ? description : des,
      },
    ]);
    setFutureNotSaved([]);
    setDescription("");
    setFutureState([]);
    setRecoilAtBatStatus((prev) => {
      let newArray = [...prev];
      return [...newArray, { atBat: atBat, myBatting: newBatting }];
    });
    setPastState(() => {
      let newAtBat = {
        ...atBat,
        isLastState: false,
        description: des === null ? description : des,
      };
      if (Array.isArray(pastState)) {
        return [...pastState, { atBat: newAtBat, myBatting: newBatting }];
      } else return [{ atBat: newAtBat, myBatting: newBatting }];
    });

    setAtBatStatus((prev) => {
      let player = atBat.currentPlayer;
      let oppCurPlayer = atBat.oppCurPlayer;
      if (atBat.isOffense === 1) {
        if (atBat.currentPlayer === 9) player = 1;
        else player = atBat.currentPlayer + 1;
      } else {
        if (atBat.oppCurPlayer === 9) oppCurPlayer = 1;
        else oppCurPlayer = atBat.oppCurPlayer + 1;
      }
      if (isOut && atBat.out + out + 1 >= 3) {
        setTempRunnerFirst(null);
        setTempRunnerSecond(null);
        setTempRunnerThird(null);
      }
      let inn = atBat.inning;
      if (!atBat.isTop) inn = inn + 1;
      let newAtBat = {
        ...atBat,
        isLastState: false,
        description: des === null ? description : des,
        id: null,
        ball: 0,
        strike: 0,
        isLastState: false,
        oppScore: isScore
          ? atBat.oppScore + oppScore + 1
          : atBat.oppScore + oppScore,
        teamScore: isScore
          ? atBat.teamScore + teamScore + 1
          : atBat.teamScore + teamScore,
        beforeBall: atBat.ball,
        beforeStrike: atBat.strike,
        currentPlayer: isOut ? player : atBat.currentPlayer,
        oppCurPlayer: isOut ? oppCurPlayer : atBat.oppCurPlayer,
        isRunnerFirst: isOut
          ? atBat.out + out + 1 < 3
            ? tempRunnerFirst
            : null
          : tempRunnerFirst,
        isRunnerSecond: isOut
          ? atBat.out + out + 1 < 3
            ? tempRunnerSecond
            : null
          : tempRunnerSecond,
        isRunnerThird: isOut
          ? atBat.out + out + 1 < 3
            ? tempRunnerThird
            : null
          : tempRunnerThird,
        out: isOut
          ? atBat.out + out + 1 < 3
            ? atBat.out + out + 1
            : 0
          : atBat.out,
        isOffense: isOut
          ? atBat.out + out + 1 >= 3
            ? atBat.isOffense == 0
              ? 1
              : 0
            : atBat.isOffense
          : atBat.isOffense,
        isTop: isOut
          ? atBat.out + out + 1 >= 3
            ? !atBat.isTop
            : atBat.isTop
          : atBat.isTop,
        inning: isOut
          ? atBat.out + out + 1 >= 3
            ? inn
            : atBat.inning
          : atBat.inning,
        pitcherResponseFirst: isOut
          ? atBat.out + out + 1 < 3 && atBat.isOffense == 0
            ? tempPitcherResponseFirst
            : null
          : atBat.isOffense == 0
          ? tempPitcherResponseFirst
          : null,
        pitcherResponseSecond: isOut
          ? atBat.out + out + 1 < 3 && atBat.isOffense == 0
            ? tempPitcherResponseSecond
            : null
          : atBat.isOffense == 0
          ? tempPitcherResponseSecond
          : null,
        pitcherResponseThird: isOut
          ? atBat.out + out + 1 < 3 && atBat.isOffense == 0
            ? tempPitcherResponseThird
            : null
          : atBat.isOffense == 0
          ? tempPitcherResponseThird
          : null,
      };
      return { atBat: newAtBat, myBatting: newBatting };
    });

    setAtBat((prev) => {
      let player = atBat.currentPlayer;
      let oppCurPlayer = atBat.oppCurPlayer;
      if (atBat.isOffense === 1) {
        if (atBat.currentPlayer === 9) player = 1;
        else player = atBat.currentPlayer + 1;
      } else {
        if (atBat.oppCurPlayer === 9) oppCurPlayer = 1;
        else oppCurPlayer = atBat.oppCurPlayer + 1;
      }
      if (isOut && atBat.out + out + 1 >= 3) {
        setTempRunnerFirst(null);
        setTempRunnerSecond(null);
        setTempRunnerThird(null);
      }
      let inn = atBat.inning;
      if (!atBat.isTop) inn = inn + 1;
      return {
        ...prev,
        id: null,
        ball: 0,
        strike: 0,
        isLastState: false,
        oppScore: isScore
          ? atBat.oppScore + oppScore + 1
          : atBat.oppScore + oppScore,
        teamScore: isScore
          ? atBat.teamScore + teamScore + 1
          : atBat.teamScore + teamScore,
        beforeBall: prev.ball,
        beforeStrike: prev.strike,
        currentPlayer: isOut ? player : atBat.currentPlayer,
        oppCurPlayer: isOut ? oppCurPlayer : atBat.oppCurPlayer,
        isRunnerFirst: isOut
          ? atBat.out + out + 1 < 3
            ? tempRunnerFirst
            : null
          : tempRunnerFirst,
        isRunnerSecond: isOut
          ? atBat.out + out + 1 < 3
            ? tempRunnerSecond
            : null
          : tempRunnerSecond,
        isRunnerThird: isOut
          ? atBat.out + out + 1 < 3
            ? tempRunnerThird
            : null
          : tempRunnerThird,
        out: isOut
          ? atBat.out + out + 1 < 3
            ? prev.out + out + 1
            : 0
          : prev.out,
        isOffense: isOut
          ? atBat.out + out + 1 >= 3
            ? atBat.isOffense == 0
              ? 1
              : 0
            : prev.isOffense
          : prev.isOffense,
        isTop: isOut
          ? atBat.out + out + 1 >= 3
            ? !atBat.isTop
            : atBat.isTop
          : atBat.isTop,
        inning: isOut
          ? atBat.out + out + 1 >= 3
            ? inn
            : atBat.inning
          : atBat.inning,
        pitcherResponseFirst: isOut
          ? atBat.out + out + 1 < 3 && atBat.isOffense == 0
            ? tempPitcherResponseFirst
            : null
          : atBat.isOffense == 0
          ? tempPitcherResponseFirst
          : null,
        pitcherResponseSecond: isOut
          ? atBat.out + out + 1 < 3 && atBat.isOffense == 0
            ? tempPitcherResponseSecond
            : null
          : atBat.isOffense == 0
          ? tempPitcherResponseSecond
          : null,
        pitcherResponseThird: isOut
          ? atBat.out + out + 1 < 3 && atBat.isOffense == 0
            ? tempPitcherResponseThird
            : null
          : atBat.isOffense == 0
          ? tempPitcherResponseThird
          : null,
      };
    });
    setIsRunnerFirst(true);
    setIsRunnerSecond(true);
    setIsRunnerThird(true);
    setOut(0);
    setTeamScore(0);
    setOppScore(0);
  };

  const addDescription = (str) => {
    setDescription((prev) => {
      if (prev.length === 0) return str + ". ";
      else return prev + str + ". ";
    });
  };

  const [recoilGames, setRecoilGames] = useRecoilState(gamesState);
  const makeEndGame = async () => {
    try {
      const response = await axiosInstance.patch(`/game/updates/${gameid}/`, {
        status: 1,
      });
      if (response.data) {
        setRecoilGames((prev) => [
          ...prev.filter((games) => games.id !== gameid),
          response.data,
        ]);
        toast.show("Kết thúc trận đấu thành công", {
          type: "success",
          placement: "bottom",
          duration: 4000,
          offset: 30,
          animationType: "zoom-in",
        });
        navigation.navigate("Games", {
          teamid: teamId,
          teamName: teamNameLong,
        });
      }
    } catch (error) {
      toast.show(error.message, {
        type: "danger",
        placement: "bottom",
        duration: 4000,
        offset: 30,
        animationType: "zoom-in",
      });
    }
  };

  const saveMyBatting = async () => {
    setIsLoading(true);
    try {
      const promises = myBatting.map(async (obj, index) => {
        if (obj === null) return null;
        try {
          let response = null;
          if (!obj.id) {
            response = await axiosInstance.post(`/playergame/create/`, {
              game_id: gameid,
              player_id: obj.player.id,
              plateApperance: obj.plateApperance,
              runBattedIn: obj.runBattedIn,
              single: obj.single,
              double: obj.double,
              triple: obj.triple,
              homeRun: obj.homeRun,
              baseOnBall: obj.baseOnBall,
              intentionalBB: obj.intentionalBB,
              hitByPitch: obj.hitByPitch,
              strikeOut: obj.strikeOut,
              fielderChoice: obj.fielderChoice,
              sacrificeFly: obj.sacrificeFly,
              sacrificeBunt: obj.sacrificeBunt,
              stolenBase: obj.stolenBase,
              leftOnBase: obj.leftOnBase,
              doublePlay: obj.doublePlay,
              triplePlay: obj.triplePlay,
              run: obj.run,
              onBaseByError: obj.onBaseByError,
              position: obj.position,
              playedPos: obj.playedPos,
              putOut: obj.putOut,
              assist: obj.assist,
              error: obj.error,
              pitchBall: obj.pitchBall,
              pitchStrike: obj.pitchStrike,
              totalBatterFaced: obj.totalBatterFaced,
              totalInGameOut: obj.totalInGameOut,
              oppHit: obj.oppHit,
              oppRun: obj.oppRun,
              earnedRun: obj.earnedRun,
              oppBaseOnBall: obj.oppBaseOnBall,
              oppStrikeOut: obj.oppStrikeOut,
              hitBatter: obj.hitBatter,
              balk: obj.balk,
              wildPitch: obj.wildPitch,
              oppHomeRun: obj.oppHomeRun,
              firstPitchStrike: obj.firstPitchStrike,
              pickOff: obj.pickOff,
            });
          } else {
            response = await axiosInstance.patch(
              `/playergame/updates/${obj.id}/`,
              {
                game_id: gameid,
                player_id: obj.player.id,
                plateApperance: obj.plateApperance,
                runBattedIn: obj.runBattedIn,
                single: obj.single,
                double: obj.double,
                triple: obj.triple,
                homeRun: obj.homeRun,
                baseOnBall: obj.baseOnBall,
                intentionalBB: obj.intentionalBB,
                hitByPitch: obj.hitByPitch,
                strikeOut: obj.strikeOut,
                fielderChoice: obj.fielderChoice,
                sacrificeFly: obj.sacrificeFly,
                sacrificeBunt: obj.sacrificeBunt,
                stolenBase: obj.stolenBase,
                leftOnBase: obj.leftOnBase,
                doublePlay: obj.doublePlay,
                triplePlay: obj.triplePlay,
                run: obj.run,
                onBaseByError: obj.onBaseByError,
                position: obj.position,
                playedPos: obj.playedPos,
                putOut: obj.putOut,
                assist: obj.assist,
                error: obj.error,
                pitchBall: obj.pitchBall,
                pitchStrike: obj.pitchStrike,
                totalBatterFaced: obj.totalBatterFaced,
                totalInGameOut: obj.totalInGameOut,
                oppHit: obj.oppHit,
                oppRun: obj.oppRun,
                earnedRun: obj.earnedRun,
                oppBaseOnBall: obj.oppBaseOnBall,
                oppStrikeOut: obj.oppStrikeOut,
                hitBatter: obj.hitBatter,
                balk: obj.balk,
                wildPitch: obj.wildPitch,
                oppHomeRun: obj.oppHomeRun,
                firstPitchStrike: obj.firstPitchStrike,
                pickOff: obj.pickOff,
              }
            );
          }
          return response;
        } catch (error) {
          console.error(`Error with player ${index}:`, error);
          return error;
        }
      });

      const responses = await Promise.all(promises);

      let haveError = false;
      for (const response of responses) {
        if (response !== null && !response.data) {
          haveError = true;
          break;
        }
      }

      if (!haveError) {
        toast.show("Lưu thông số cầu thủ lên server thành công", {
          type: "success",
          placement: "bottom",
          duration: 4000,
          offset: 30,
          animationType: "zoom-in",
        });
        setIsLoading(false);
      }
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

                    let description = "";
                    let newBatting = myBatting;

                    if (atBat.isOffense === 1) {
                      newBatting = updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        1,
                        0,
                        0,
                        false,
                        lob
                      );
                      description += `#${
                        myBatting[atBat.currentPlayer - 1].player.jerseyNumber
                      }.${
                        myBatting[atBat.currentPlayer - 1].player.firstName
                      } ${
                        myBatting[atBat.currentPlayer - 1].player.lastName
                      } bị strikeout looking`;
                      endTheAtBat(description, true);
                      // handleOut(true, myBatting[atBat.currentPlayer - 1]);
                    } else {
                      let reversedBatting = [...myBatting];
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      newBatting = updatePitcherStat(
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
                      description += `Batter ${atBat.oppCurPlayer} đối phương bị strikeout looking`;
                      endTheAtBat(description, true, false, newBatting);
                      // handleOut(true, atBat.oppCurPlayer);
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

                    let description = "";
                    let newBatting = myBatting;

                    if (atBat.isOffense === 1) {
                      newBatting = updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        2,
                        0,
                        0,
                        false,
                        lob
                      );
                      description += `#${
                        myBatting[atBat.currentPlayer - 1].player.jerseyNumber
                      }.${
                        myBatting[atBat.currentPlayer - 1].player.firstName
                      } ${
                        myBatting[atBat.currentPlayer - 1].player.lastName
                      } bị strikeout swinging`;
                      endTheAtBat(description, true);
                      // handleOut(true, myBatting[atBat.currentPlayer - 1]);
                    } else {
                      let reversedBatting = [...myBatting];
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      newBatting = updatePitcherStat(
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
                      description += `Batter ${atBat.oppCurPlayer} đối phương bị strikeout swinging`;
                      endTheAtBat(description, true, false, newBatting);
                      // handleOut(true, atBat.oppCurPlayer);
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
                    let description = "";
                    if (atBat.isRunnerFirst) lob++;
                    if (atBat.isRunnerSecond) lob++;
                    if (atBat.isRunnerThird) lob++;
                    if (atBat.isOffense === 1) {
                      updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        3,
                        0,
                        0,
                        false,
                        lob
                      );
                      addDescription(
                        `#${
                          myBatting[atBat.currentPlayer - 1].player.jerseyNumber
                        }.${
                          myBatting[atBat.currentPlayer - 1].player.firstName
                        } ${
                          myBatting[atBat.currentPlayer - 1].player.lastName
                        } bị ground out`
                      );
                      description += `#${
                        myBatting[atBat.currentPlayer - 1].player.jerseyNumber
                      }.${
                        myBatting[atBat.currentPlayer - 1].player.firstName
                      } ${
                        myBatting[atBat.currentPlayer - 1].player.lastName
                      } bị ground out.`;
                    } else {
                      addDescription(
                        `Batter ${atBat.oppCurPlayer} đối phương bị ground out`
                      );
                      description += `Batter ${atBat.oppCurPlayer} đối phương bị ground out.`;
                    }
                    if (atBat.isRunnerThird) setThirdRunnerVisible(true);
                    else if (atBat.isRunnerSecond) setSecondRunnerVisible(true);
                    else if (atBat.isRunnerFirst) setFirstRunnerVisible(true);
                    else setBatterRunnerVisible(true);
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
                    let description = "";
                    if (atBat.isRunnerFirst) lob++;
                    if (atBat.isRunnerSecond) lob++;
                    if (atBat.isRunnerThird) lob++;
                    if (atBat.isOffense === 1) {
                      updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        4,
                        0,
                        0,
                        false,
                        lob
                      );
                      addDescription(
                        `#${
                          myBatting[atBat.currentPlayer - 1].player.jerseyNumber
                        }.${
                          myBatting[atBat.currentPlayer - 1].player.firstName
                        } ${
                          myBatting[atBat.currentPlayer - 1].player.lastName
                        } bị fly out`
                      );
                      description += `#${
                        myBatting[atBat.currentPlayer - 1].player.jerseyNumber
                      }.${
                        myBatting[atBat.currentPlayer - 1].player.firstName
                      } ${
                        myBatting[atBat.currentPlayer - 1].player.lastName
                      } bị fly out`;
                    } else {
                      addDescription(
                        `Batter ${atBat.oppCurPlayer} đối phương bị fly out`
                      );
                      description += `Batter ${atBat.oppCurPlayer} đối phương bị fly out`;
                    }
                    if (atBat.isRunnerThird) setThirdRunnerVisible(true);
                    else if (atBat.isRunnerSecond) setSecondRunnerVisible(true);
                    else if (atBat.isRunnerFirst) setFirstRunnerVisible(true);
                    else setBatterRunnerVisible(true);
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
                    let description = "";
                    if (atBat.isOffense === 1) {
                      updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        5,
                        0,
                        0,
                        false,
                        0
                      );
                      addDescription(
                        `#${
                          myBatting[atBat.currentPlayer - 1].player.jerseyNumber
                        }.${
                          myBatting[atBat.currentPlayer - 1].player.firstName
                        } ${
                          myBatting[atBat.currentPlayer - 1].player.lastName
                        } đã fly hi sinh`
                      );
                      description += `#${
                        myBatting[atBat.currentPlayer - 1].player.jerseyNumber
                      }.${
                        myBatting[atBat.currentPlayer - 1].player.firstName
                      } ${
                        myBatting[atBat.currentPlayer - 1].player.lastName
                      } đã fly hi sinh`;
                    } else {
                      let reversedBatting = [...myBatting];
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      addDescription(
                        `Batter ${atBat.oppCurPlayer} đối phương đã fly hi sinh`
                      );
                      description += `Batter ${atBat.oppCurPlayer} đối phương đã fly hi sinh`;
                    }
                    if (atBat.isRunnerThird) setThirdRunnerVisible(true);
                    else if (atBat.isRunnerSecond) setSecondRunnerVisible(true);
                    else if (atBat.isRunnerFirst) setFirstRunnerVisible(true);
                    else setBatterRunnerVisible(true);
                  }}
                  style={styles.modelButton}
                >
                  <Text style={styles.textButton}>Sacrifice Fly</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setOutModalVisible(false);
                    setOutcomeType(6);
                    let description = "";
                    if (atBat.isOffense === 1) {
                      updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        6,
                        0,
                        0,
                        false,
                        0
                      );
                      addDescription(
                        `#${
                          myBatting[atBat.currentPlayer - 1].player.jerseyNumber
                        }.${
                          myBatting[atBat.currentPlayer - 1].player.firstName
                        } ${
                          myBatting[atBat.currentPlayer - 1].player.lastName
                        } đã bunt hi sinh`
                      );
                      description += `#${
                        myBatting[atBat.currentPlayer - 1].player.jerseyNumber
                      }.${
                        myBatting[atBat.currentPlayer - 1].player.firstName
                      } ${
                        myBatting[atBat.currentPlayer - 1].player.lastName
                      } đã bunt hi sinh`;
                    } else {
                      let reversedBatting = [...myBatting];
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      addDescription(
                        `Batter ${atBat.oppCurPlayer} đối phương đã bunt hi sinh`
                      );
                      description += `Batter ${atBat.oppCurPlayer} đối phương đã bunt hi sinh`;
                    }
                    if (atBat.isRunnerThird) setThirdRunnerVisible(true);
                    else if (atBat.isRunnerSecond) setSecondRunnerVisible(true);
                    else if (atBat.isRunnerFirst) setFirstRunnerVisible(true);
                    else setBatterRunnerVisible(true);
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
                    let description = "";
                    if (atBat.isRunnerFirst) lob++;
                    if (atBat.isRunnerSecond) lob++;
                    if (atBat.isRunnerThird) lob++;
                    setOutModalVisible(false);
                    setOutcomeType(7);
                    if (atBat.isOffense === 1) {
                      updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        7,
                        0,
                        0,
                        false,
                        lob
                      );
                      addDescription(
                        `#${
                          myBatting[atBat.currentPlayer - 1].player.jerseyNumber
                        }.${
                          myBatting[atBat.currentPlayer - 1].player.firstName
                        } ${
                          myBatting[atBat.currentPlayer - 1].player.lastName
                        } bị infield fly`
                      );
                      description += `#${
                        myBatting[atBat.currentPlayer - 1].player.jerseyNumber
                      }.${
                        myBatting[atBat.currentPlayer - 1].player.firstName
                      } ${
                        myBatting[atBat.currentPlayer - 1].player.lastName
                      } bị infield fly`;
                    } else {
                      let reversedBatting = [...myBatting];
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      addDescription(
                        `Batter ${atBat.oppCurPlayer} đối phương bị infield fly`
                      );
                      description += `Batter ${atBat.oppCurPlayer} đối phương bị infield fly`;
                    }
                    if (atBat.isRunnerThird) setThirdRunnerVisible(true);
                    else if (atBat.isRunnerSecond) setSecondRunnerVisible(true);
                    else if (atBat.isRunnerFirst) setFirstRunnerVisible(true);
                    else setBatterRunnerVisible(true);
                  }}
                  style={styles.modelButton}
                >
                  <Text style={styles.textButton}>Infield Fly</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    let lob = 0;
                    let description = "";
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
                      addDescription(
                        `#${
                          myBatting[atBat.currentPlayer - 1].player.jerseyNumber
                        }.${
                          myBatting[atBat.currentPlayer - 1].player.firstName
                        } ${
                          myBatting[atBat.currentPlayer - 1].player.lastName
                        } bị strike thứ 3 nhưng catcher drop`
                      );
                    } else {
                      let reversedBatting = [...myBatting];
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      addDescription(
                        `Batter ${atBat.oppCurPlayer} đối phương bị strike thứ 3 nhưng catcher drop`
                      );
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
                    if (atBat.isOffense === 1) {
                      updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        9,
                        0,
                        0,
                        false,
                        lob
                      );
                      addDescription(
                        `#${
                          myBatting[atBat.currentPlayer - 1].player.jerseyNumber
                        }.${
                          myBatting[atBat.currentPlayer - 1].player.firstName
                        } ${
                          myBatting[atBat.currentPlayer - 1].player.lastName
                        } bị ground into double play`
                      );
                    } else {
                      let reversedBatting = [...myBatting];
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      addDescription(
                        `Batter ${atBat.oppCurPlayer} đối phương bị ground into double play`
                      );
                    }
                    if (atBat.isRunnerThird) setThirdRunnerVisible(true);
                    else if (atBat.isRunnerSecond) setSecondRunnerVisible(true);
                    else if (atBat.isRunnerFirst) setFirstRunnerVisible(true);
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
                    if (atBat.isOffense === 1) {
                      updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        10,
                        0,
                        0,
                        false,
                        lob
                      );
                      addDescription(
                        `#${
                          myBatting[atBat.currentPlayer - 1].player.jerseyNumber
                        }.${
                          myBatting[atBat.currentPlayer - 1].player.firstName
                        } ${
                          myBatting[atBat.currentPlayer - 1].player.lastName
                        } bị grounded into triple play`
                      );
                    } else {
                      let reversedBatting = [...myBatting];
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      addDescription(
                        `Batter ${atBat.oppCurPlayer} đối phương bị ground into triple play`
                      );
                    }
                    if (atBat.isRunnerThird) setThirdRunnerVisible(true);
                    else if (atBat.isRunnerSecond) setSecondRunnerVisible(true);
                    else if (atBat.isRunnerFirst) setFirstRunnerVisible(true);
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

                    let newBatting = myBatting;

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
                    let description = "";
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

                    if (atBat.isOffense === 1) {
                      newBatting = updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        11,
                        rbi,
                        0,
                        false,
                        0
                      );
                      description += `#${
                        myBatting[atBat.currentPlayer - 1].player.jerseyNumber
                      }.${
                        myBatting[atBat.currentPlayer - 1].player.firstName
                      } ${
                        myBatting[atBat.currentPlayer - 1].player.lastName
                      } walk. `;
                      if (atBat.isRunnerFirst)
                        description += `#${atBat.isRunnerFirst.player.jerseyNumber}.${atBat.isRunnerFirst.player.firstName} ${atBat.isRunnerFirst.player.lastName} lên chốt 2. `;
                      if (atBat.isRunnerSecond && atBat.isRunnerFirst)
                        description += `#${atBat.isRunnerSecond.player.jerseyNumber}.${atBat.isRunnerSecond.player.firstName} ${atBat.isRunnerSecond.player.lastName} lên chốt 3. `;
                      if (
                        atBat.isRunnerThird &&
                        atBat.isRunnerSecond &&
                        atBat.isRunnerFirst
                      )
                        description += `#${atBat.isRunnerThird.player.jerseyNumber}.${atBat.isRunnerThird.player.firstName} ${atBat.isRunnerThird.player.lastName} ghi điểm.`;
                    } else {
                      let reversedBatting = [...myBatting];
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      console.log(pitcher);
                      if (atBat.pitcherResponseThird) {
                        if (
                          atBat.pitcherResponseThird.player.id !=
                          pitcher.player.id
                        ) {
                          newBatting = updatePitcherStat(
                            atBat.pitcherResponseThird,
                            null,
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
                      }
                      newBatting = updatePitcherStat(
                        pitcher,
                        11,
                        4 - atBat.ball,
                        0,
                        0,
                        atBat.pitcherResponseThird
                          ? atBat.pitcherResponseThird.player.id ==
                            pitcher.player.id
                            ? run
                            : 0
                          : 0,
                        atBat.pitcherResponseThird
                          ? atBat.pitcherResponseThird.player.id ==
                            pitcher.player.id
                            ? earnRun
                            : 0
                          : 0,
                        0,
                        0,
                        0,
                        0
                      );
                      description += `Batter ${atBat.oppCurPlayer} đối phương walk. `;
                      if (atBat.isRunnerFirst) {
                        description += `Runner B1 đối phương lên B2. `;
                      }
                      if (atBat.isRunnerFirst && atBat.isRunnerSecond) {
                        description += `Runner B2 đối phương lên B3. `;
                      }
                      if (
                        atBat.isRunnerThird &&
                        atBat.isRunnerFirst &&
                        atBat.isRunnerSecond
                      ) {
                        description += `Runner B3 đối phương ghi điểm.`;
                      }
                      setAtBat((prev) => {
                        return {
                          ...prev,
                          pitcherResponseFirst: runner1
                            ? prev.currentPitcher
                            : null,
                          pitcherResponseSecond: runner2
                            ? prev.currentPitcher
                            : null,
                          pitcherResponseThird: runner3
                            ? prev.currentPitcher
                            : null,
                        };
                      });
                    }
                    endTheAtBat(description, false, false, newBatting);
                    setTempRunnerFirst(runner1);
                    setTempRunnerSecond(runner2);
                    setTempRunnerThird(runner3);
                    setAtBat((prev) => {
                      return {
                        ...prev,
                        currentPlayer: player,
                        oppCurPlayer: oppPlayer,
                        isRunnerFirst: runner1,
                        isRunnerSecond: runner2,
                        isRunnerThird: runner3,
                        beforeRunnerFirst: prev.isRunnerFirst,
                        beforeRunnerSecond: prev.isRunnerSecond,
                        beforeRunnerThird: prev.isRunnerThird,
                        teamScore: teamscore,
                        oppScore: oppScore,
                        ball: 0,
                        strike: 0,
                        outcomeType: 11,
                      };
                    });
                    setAtBatStatus((prev) => {
                      let newAtBat = {
                        ...prev.atBat,
                        currentPlayer: player,
                        oppCurPlayer: oppPlayer,
                        isRunnerFirst: runner1,
                        isRunnerSecond: runner2,
                        isRunnerThird: runner3,
                        beforeRunnerFirst: prev.atBat.isRunnerFirst,
                        beforeRunnerSecond: prev.atBat.isRunnerSecond,
                        beforeRunnerThird: prev.atBat.isRunnerThird,
                        teamScore: teamscore,
                        oppScore: oppScore,
                        ball: 0,
                        strike: 0,
                        outcomeType: 11,
                      };
                      return { atBat: newAtBat, myBatting: newBatting };
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
                    let newBatting = myBatting;
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
                    let description = "";
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

                    if (atBat.isOffense === 1) {
                      newBatting = updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        12,
                        rbi,
                        0,
                        false,
                        0
                      );
                      description += `#${
                        myBatting[atBat.currentPlayer - 1].player.jerseyNumber
                      }.${
                        myBatting[atBat.currentPlayer - 1].player.firstName
                      } ${
                        myBatting[atBat.currentPlayer - 1].player.lastName
                      } được pitcher cố tình walk. `;
                      if (atBat.isRunnerFirst)
                        description += `#${atBat.isRunnerFirst.player.jerseyNumber}.${atBat.isRunnerFirst.player.firstName} ${atBat.isRunnerFirst.player.lastName} lên chốt 2. `;
                      if (atBat.isRunnerSecond && atBat.isRunnerFirst)
                        description += `#${atBat.isRunnerSecond.player.jerseyNumber}.${atBat.isRunnerSecond.player.firstName} ${atBat.isRunnerSecond.player.lastName} lên chốt 3. `;
                      if (
                        atBat.isRunnerThird &&
                        atBat.isRunnerSecond &&
                        atBat.isRunnerFirst
                      )
                        description += `#${atBat.isRunnerThird.player.jerseyNumber}.${atBat.isRunnerThird.player.firstName} ${atBat.isRunnerThird.player.lastName} ghi điểm.`;
                    } else {
                      let reversedBatting = [...myBatting];
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      if (atBat.pitcherResponseThird) {
                        if (
                          atBat.pitcherResponseThird.player.id !=
                          pitcher.player.id
                        ) {
                          newBatting = updatePitcherStat(
                            atBat.pitcherResponseThird,
                            null,
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
                      }
                      newBatting = updatePitcherStat(
                        pitcher,
                        12,
                        4 - atBat.ball,
                        0,
                        0,
                        atBat.pitcherResponseThird.player.id ==
                          pitcher.player.id
                          ? run
                          : 0,
                        atBat.pitcherResponseThird.player.id ==
                          pitcher.player.id
                          ? earnRun
                          : 0,
                        0,
                        0,
                        0,
                        0
                      );
                      description += `Batter ${atBat.oppCurPlayer} đối phương được pitcher cố tình walk. `;
                      if (atBat.isRunnerFirst) {
                        description += `Runner B1 đối phương lên B2. `;
                      }
                      if (atBat.isRunnerFirst && atBat.isRunnerSecond) {
                        description += `Runner B2 đối phương lên B3. `;
                      }
                      if (
                        atBat.isRunnerThird &&
                        atBat.isRunnerFirst &&
                        atBat.isRunnerSecond
                      ) {
                        description += `Runner B3 đối phương ghi điểm.`;
                      }
                      setAtBat((prev) => {
                        return {
                          ...prev,
                          pitcherResponseFirst: runner1
                            ? prev.currentPitcher
                            : null,
                          pitcherResponseSecond: runner2
                            ? prev.currentPitcher
                            : null,
                          pitcherResponseThird: runner3
                            ? prev.currentPitcher
                            : null,
                        };
                      });
                    }
                    endTheAtBat(description, false, false, newBatting);
                    setTempRunnerFirst(runner1);
                    setTempRunnerSecond(runner2);
                    setTempRunnerThird(runner3);
                    setAtBat((prev) => {
                      return {
                        ...prev,
                        currentPlayer: player,
                        oppCurPlayer: oppPlayer,
                        isRunnerFirst: runner1,
                        isRunnerSecond: runner2,
                        isRunnerThird: runner3,
                        beforeRunnerFirst: prev.isRunnerFirst,
                        beforeRunnerSecond: prev.isRunnerSecond,
                        beforeRunnerThird: prev.isRunnerThird,
                        teamScore: teamscore,
                        oppScore: oppScore,
                        ball: 0,
                        strike: 0,
                        beforeBall: prev.ball,
                        beforeStrike: prev.strike,
                        outcomeType: 12,
                      };
                    });
                    setAtBatStatus((prev) => {
                      let newAtBat = {
                        ...prev.atBat,
                        currentPlayer: player,
                        oppCurPlayer: oppPlayer,
                        isRunnerFirst: runner1,
                        isRunnerSecond: runner2,
                        isRunnerThird: runner3,
                        beforeRunnerFirst: prev.atBat.isRunnerFirst,
                        beforeRunnerSecond: prev.atBat.isRunnerSecond,
                        beforeRunnerThird: prev.atBat.isRunnerThird,
                        teamScore: teamscore,
                        oppScore: oppScore,
                        ball: 0,
                        strike: 0,
                        outcomeType: 12,
                      };
                      return { atBat: newAtBat, myBatting: newBatting };
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

                    if (atBat.isOffense === 1) {
                      addDescription(
                        `#${
                          myBatting[atBat.currentPlayer - 1].player.jerseyNumber
                        }.${
                          myBatting[atBat.currentPlayer - 1].player.firstName
                        } ${
                          myBatting[atBat.currentPlayer - 1].player.lastName
                        } hit single`
                      );
                      updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        13,
                        0,
                        0,
                        false,
                        0
                      );
                    } else {
                      addDescription(
                        `Batter ${atBat.oppCurPlayer} đối phương hit single`
                      );
                      let reversedBatting = [...myBatting];
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(pitcher, 13, 0, 1, 0, 0, 0, 0, 0, 0, 0);
                    }
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
                    if (atBat.isOffense === 1) {
                      addDescription(
                        `#${
                          myBatting[atBat.currentPlayer - 1].player.jerseyNumber
                        }.${
                          myBatting[atBat.currentPlayer - 1].player.firstName
                        } ${
                          myBatting[atBat.currentPlayer - 1].player.lastName
                        } hit double`
                      );
                      updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        14,
                        0,
                        0,
                        false,
                        0
                      );
                    } else {
                      addDescription(
                        `Batter ${atBat.oppCurPlayer} đối phương hit double`
                      );
                      let reversedBatting = [...myBatting];
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(pitcher, 14, 0, 1, 0, 0, 0, 0, 0, 0, 0);
                    }
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

                    if (atBat.isOffense === 1) {
                      addDescription(
                        `#${
                          myBatting[atBat.currentPlayer - 1].player.jerseyNumber
                        }.${
                          myBatting[atBat.currentPlayer - 1].player.firstName
                        } ${
                          myBatting[atBat.currentPlayer - 1].player.lastName
                        } hit triple`
                      );
                      updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        15,
                        0,
                        0,
                        false,
                        0
                      );
                    } else {
                      addDescription(
                        `Batter ${atBat.oppCurPlayer} đối phương hit triple`
                      );
                      let reversedBatting = [...myBatting];
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      updatePitcherStat(pitcher, 15, 0, 1, 0, 0, 0, 0, 0, 0, 0);
                    }
                  }}
                  style={styles.modelButton}
                >
                  <Text style={styles.textButton}>Triple</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    let newBatting = myBatting;
                    let teamscore = atBat.teamScore;
                    let oppScore = atBat.oppScore;
                    let rbi = 1;
                    let earnRun = 1;
                    let run = 1;
                    let description = "";
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
                    if (atBat.isOffense === 1) {
                      newBatting = updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        16,
                        rbi,
                        1,
                        false,
                        0
                      );
                      description += `#${
                        myBatting[atBat.currentPlayer - 1].player.jerseyNumber
                      }.${
                        myBatting[atBat.currentPlayer - 1].player.firstName
                      } ${
                        myBatting[atBat.currentPlayer - 1].player.lastName
                      } hit ${
                        rbi === 4
                          ? "Grand-slam"
                          : run === 1
                          ? "Solo"
                          : `${rbi}-run`
                      } homerun. `;
                      if (atBat.isRunnerFirst)
                        description += `#${atBat.isRunnerFirst.player.jerseyNumber}.${atBat.isRunnerFirst.player.firstName} ${atBat.isRunnerFirst.player.lastName} ghi điểm. `;
                      if (atBat.isRunnerSecond)
                        description += `#${atBat.isRunnerSecond.player.jerseyNumber}.${atBat.isRunnerSecond.player.firstName} ${atBat.isRunnerSecond.player.lastName} ghi điểm. `;
                      if (atBat.isRunnerThird)
                        description += `#${atBat.isRunnerThird.player.jerseyNumber}.${atBat.isRunnerThird.player.firstName} ${atBat.isRunnerThird.player.lastName} ghi điểm. `;
                    } else {
                      let reversedBatting = [...myBatting];
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      newBatting = updatePitcherStat(
                        pitcher,
                        16,
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
                      description += `Batter ${
                        atBat.oppCurPlayer
                      } đối phương hit ${
                        run === 4
                          ? "Grand-slam"
                          : run === 1
                          ? "Solo"
                          : `${run}-run`
                      } homerun. `;
                      if (atBat.isRunnerFirst)
                        description += `Runner B1 đối phương ghi điểm. `;
                      if (atBat.isRunnerSecond)
                        description += `Runner B2 đối phương ghi điểm. `;
                      if (atBat.isRunnerThird)
                        description += `Runner B3 đối phương ghi điểm. `;
                    }
                    endTheAtBat(description, false, false, newBatting);
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
                        beforeRunnerFirst: prev.isRunnerFirst,
                        beforeRunnerSecond: prev.isRunnerSecond,
                        beforeRunnerThird: prev.isRunnerThird,
                        currentPlayer: player,
                        oppCurPlayer: oppPlayer,
                        outcomeType: 16,
                      };
                    });
                    setAtBatStatus((prev) => {
                      let newAtBat = {
                        ...prev.atBat,
                        currentPlayer: player,
                        oppCurPlayer: oppPlayer,
                        isRunnerFirst: null,
                        isRunnerSecond: null,
                        isRunnerThird: null,
                        beforeRunnerFirst: prev.atBat.isRunnerFirst,
                        beforeRunnerSecond: prev.atBat.isRunnerSecond,
                        beforeRunnerThird: prev.atBat.isRunnerThird,
                        teamScore: teamscore,
                        oppScore: oppScore,
                        ball: 0,
                        strike: 0,
                        outcomeType: 16,
                      };
                      return { atBat: newAtBat, myBatting: newBatting };
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

                    if (atBat.isOffense === 1) {
                      addDescription(
                        `#${
                          myBatting[atBat.currentPlayer - 1].player.jerseyNumber
                        }.${
                          myBatting[atBat.currentPlayer - 1].player.firstName
                        } ${
                          myBatting[atBat.currentPlayer - 1].player.lastName
                        } an toàn bởi lỗi phòng ngự`
                      );
                    } else {
                      addDescription(
                        `Batter ${atBat.oppCurPlayer} an toàn bởi lỗi phòng ngự`
                      );
                    }
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
                    let description = "";
                    let newBatting = myBatting;

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
                    if (atBat.isOffense === 1) {
                      newBatting = updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        19,
                        rbi,
                        0,
                        false,
                        0
                      );
                      description += `#${
                        myBatting[atBat.currentPlayer - 1].player.jerseyNumber
                      }.${
                        myBatting[atBat.currentPlayer - 1].player.firstName
                      } ${
                        myBatting[atBat.currentPlayer - 1].player.lastName
                      } bị hit by pitch. `;
                      if (atBat.isRunnerFirst)
                        description += `#${atBat.isRunnerFirst.player.jerseyNumber}.${atBat.isRunnerFirst.player.firstName} ${atBat.isRunnerFirst.player.lastName} lên chốt 2. `;
                      if (atBat.isRunnerSecond && atBat.isRunnerFirst)
                        description += `#${atBat.isRunnerSecond.player.jerseyNumber}.${atBat.isRunnerSecond.player.firstName} ${atBat.isRunnerSecond.player.lastName} lên chốt 3. `;
                      if (
                        atBat.isRunnerThird &&
                        atBat.isRunnerSecond &&
                        atBat.isRunnerFirst
                      )
                        description += `#${atBat.isRunnerThird.player.jerseyNumber}.${atBat.isRunnerThird.player.firstName} ${atBat.isRunnerThird.player.lastName} ghi điểm.`;
                    } else {
                      let reversedBatting = [...myBatting];
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      if (atBat.pitcherResponseThird) {
                        if (
                          atBat.pitcherResponseThird.player.id !=
                          pitcher.player.id
                        ) {
                          newBatting = updatePitcherStat(
                            atBat.pitcherResponseThird,
                            null,
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
                      }
                      newBatting = updatePitcherStat(
                        pitcher,
                        19,
                        4 - atBat.ball,
                        0,
                        0,
                        atBat.pitcherResponseThird.player.id ==
                          pitcher.player.id
                          ? run
                          : 0,
                        atBat.pitcherResponseThird.player.id ==
                          pitcher.player.id
                          ? earnRun
                          : 0,
                        0,
                        0,
                        0,
                        0
                      );
                      description += `Batter ${atBat.oppCurPlayer} đối phương bị hit by pitch. `;
                      if (atBat.isRunnerFirst) {
                        description += `Runner B1 đối phương lên B2. `;
                      }
                      if (atBat.isRunnerFirst && atBat.isRunnerSecond) {
                        description += `Runner B2 đối phương lên B3. `;
                      }
                      if (
                        atBat.isRunnerThird &&
                        atBat.isRunnerFirst &&
                        atBat.isRunnerSecond
                      ) {
                        description += `Runner B3 đối phương ghi điểm.`;
                      }
                      setAtBat((prev) => {
                        return {
                          ...prev,
                          pitcherResponseFirst: runner1
                            ? prev.currentPitcher
                            : null,
                          pitcherResponseSecond: runner2
                            ? prev.currentPitcher
                            : null,
                          pitcherResponseThird: runner3
                            ? prev.currentPitcher
                            : null,
                        };
                      });
                    }
                    endTheAtBat(description, false, false, newBatting);
                    setTempRunnerFirst(runner1);
                    setTempRunnerSecond(runner2);
                    setTempRunnerThird(runner3);
                    setAtBat((prev) => {
                      return {
                        ...prev,
                        currentPlayer: player,
                        oppCurPlayer: oppPlayer,
                        isRunnerFirst: runner1,
                        isRunnerSecond: runner2,
                        isRunnerThird: runner3,
                        beforeRunnerFirst: prev.isRunnerFirst,
                        beforeRunnerSecond: prev.isRunnerSecond,
                        beforeRunnerThird: prev.isRunnerThird,
                        teamScore: teamscore,
                        oppScore: oppScore,
                        ball: 0,
                        strike: 0,
                        outcomeType: 19,
                      };
                    });
                    setAtBatStatus((prev) => {
                      let newAtBat = {
                        ...prev.atBat,
                        currentPlayer: player,
                        oppCurPlayer: oppPlayer,
                        isRunnerFirst: runner1,
                        isRunnerSecond: runner2,
                        isRunnerThird: runner3,
                        beforeRunnerFirst: prev.atBat.isRunnerFirst,
                        beforeRunnerSecond: prev.atBat.isRunnerSecond,
                        beforeRunnerThird: prev.atBat.isRunnerThird,
                        teamScore: teamscore,
                        oppScore: oppScore,
                        ball: 0,
                        strike: 0,
                        outcomeType: 19,
                      };
                      return { atBat: newAtBat, myBatting: newBatting };
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

                    if (atBat.isOffense === 1) {
                      addDescription(
                        `#${
                          myBatting[atBat.currentPlayer - 1].player.jerseyNumber
                        }.${
                          myBatting[atBat.currentPlayer - 1].player.firstName
                        } ${
                          myBatting[atBat.currentPlayer - 1].player.lastName
                        } ground dẫn đến fielder choice`
                      );
                      updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        20,
                        0,
                        0,
                        false,
                        0
                      );
                    } else {
                      addDescription(
                        `Batter ${atBat.oppCurPlayer} đối phương ground dẫn đến fielder choice`
                      );
                    }
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
                    let description = "";
                    let newBatting = myBatting;

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
                    if (atBat.isOffense === 1) {
                      newBatting = updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        21,
                        rbi,
                        0,
                        false,
                        0
                      );
                      description += `#${
                        myBatting[atBat.currentPlayer - 1].player.jerseyNumber
                      }.${
                        myBatting[atBat.currentPlayer - 1].player.firstName
                      } ${
                        myBatting[atBat.currentPlayer - 1].player.lastName
                      } lên chốt 1 do bị catcher interference. `;
                      if (atBat.isRunnerFirst)
                        description += `#${atBat.isRunnerFirst.player.jerseyNumber}.${atBat.isRunnerFirst.player.firstName} ${atBat.isRunnerFirst.player.lastName} lên chốt 2. `;
                      if (atBat.isRunnerSecond && atBat.isRunnerFirst)
                        description += `#${atBat.isRunnerSecond.player.jerseyNumber}.${atBat.isRunnerSecond.player.firstName} ${atBat.isRunnerSecond.player.lastName} lên chốt 3. `;
                      if (
                        atBat.isRunnerThird &&
                        atBat.isRunnerSecond &&
                        atBat.isRunnerFirst
                      )
                        description += `#${atBat.isRunnerThird.player.jerseyNumber}.${atBat.isRunnerThird.player.firstName} ${atBat.isRunnerThird.player.lastName} ghi điểm.`;
                    } else {
                      let reversedBatting = [...myBatting];
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      if (atBat.pitcherResponseThird) {
                        if (
                          atBat.pitcherResponseThird.player.id !=
                          pitcher.player.id
                        ) {
                          newBatting = updatePitcherStat(
                            atBat.pitcherResponseThird,
                            null,
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
                      }
                      newBatting = updatePitcherStat(
                        pitcher,
                        21,
                        4 - atBat.ball,
                        0,
                        0,
                        atBat.pitcherResponseThird.player.id ==
                          pitcher.player.id
                          ? run
                          : 0,
                        atBat.pitcherResponseThird.player.id ==
                          pitcher.player.id
                          ? earnRun
                          : 0,
                        0,
                        0,
                        0,
                        0
                      );
                      description += `Batter ${atBat.oppCurPlayer} đối phương lên chốt 1 do bị catcher interference. `;
                      if (atBat.isRunnerFirst) {
                        description += `Runner B1 đối phương lên B2. `;
                      }
                      if (atBat.isRunnerFirst && atBat.isRunnerSecond) {
                        description += `Runner B2 đối phương lên B3. `;
                      }
                      if (
                        atBat.isRunnerThird &&
                        atBat.isRunnerFirst &&
                        atBat.isRunnerSecond
                      ) {
                        description += `Runner B3 đối phương ghi điểm.`;
                      }
                      setAtBat((prev) => {
                        return {
                          ...prev,
                          pitcherResponseFirst: runner1
                            ? prev.currentPitcher
                            : null,
                          pitcherResponseSecond: runner2
                            ? prev.currentPitcher
                            : null,
                          pitcherResponseThird: runner3
                            ? prev.currentPitcher
                            : null,
                        };
                      });
                    }
                    endTheAtBat(description, false, false, newBatting);
                    setTempRunnerFirst(runner1);
                    setTempRunnerSecond(runner2);
                    setTempRunnerThird(runner3);
                    setAtBat((prev) => {
                      return {
                        ...prev,
                        currentPlayer: player,
                        isRunnerFirst: runner1,
                        isRunnerSecond: runner2,
                        isRunnerThird: runner3,
                        beforeRunnerFirst: prev.isRunnerFirst,
                        beforeRunnerSecond: prev.isRunnerSecond,
                        beforeRunnerThird: prev.isRunnerThird,
                        teamScore: teamscore,
                        oppScore: oppScore,
                        ball: 0,
                        strike: 0,
                        outcomeType: 21,
                      };
                    });
                    setAtBatStatus((prev) => {
                      let newAtBat = {
                        ...prev.atBat,
                        currentPlayer: player,
                        oppCurPlayer: oppPlayer,
                        isRunnerFirst: runner1,
                        isRunnerSecond: runner2,
                        isRunnerThird: runner3,
                        beforeRunnerFirst: prev.atBat.isRunnerFirst,
                        beforeRunnerSecond: prev.atBat.isRunnerSecond,
                        beforeRunnerThird: prev.atBat.isRunnerThird,
                        teamScore: teamscore,
                        oppScore: oppScore,
                        ball: 0,
                        strike: 0,
                        outcomeType: 21,
                      };
                      return { atBat: newAtBat, myBatting: myBatting };
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
                    let newBatting = myBatting;
                    setBatterRunnerVisible(false);
                    let des = description;
                    if (atBat.isOffense == 1 && outcomeType > 2) {
                      setTempRunnerFirst(
                        outcomeType === 18
                          ? [myBatting[atBat.currentPlayer - 1], "error"]
                          : myBatting[atBat.currentPlayer - 1]
                      );
                      newBatting = updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        outcomeType < 13 || outcomeType > 15
                          ? outcomeType
                          : null,
                        0,
                        0,
                        false,
                        0
                      );
                      des += `#${
                        myBatting[atBat.currentPlayer - 1].player.jerseyNumber
                      }.${
                        myBatting[atBat.currentPlayer - 1].player.firstName
                      } ${
                        myBatting[atBat.currentPlayer - 1].player.lastName
                      } lên chốt 1.`;
                    } else {
                      setTempRunnerFirst(
                        outcomeType === 18
                          ? [atBat.oppCurPlayer, "error"]
                          : atBat.oppCurPlayer
                      );
                      let reversedBatting = [...myBatting];
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      // updatePitcherStat(
                      //   pitcher,
                      //   outcomeType < 13 || outcomeType > 15
                      //     ? outcomeType
                      //     : null,
                      //   0,
                      //   1,
                      //   0,
                      //   0,
                      //   0,
                      //   0,
                      //   0,
                      //   0,
                      //   0
                      // );
                      des += `Batter ${atBat.oppCurPlayer} đối phương lên chốt 1.`;
                    }
                    endTheAtBat(des, false, false, newBatting);
                    setAtBatStatus((prev) => {
                      let newAtBat = {
                        ...prev.atBat,
                        isRunnerFirst:
                          atBat.isOffense == 1
                            ? myBatting[atBat.currentPlayer - 1]
                            : outcomeType === 18
                            ? [atBat.oppCurPlayer]
                            : atBat.oppCurPlayer,
                        currentPlayer:
                          atBat.isOffense == 1
                            ? atBat.currentPlayer >= 9
                              ? 1
                              : atBat.currentPlayer + 1
                            : atBat.currentPlayer,
                        oppCurPlayer:
                          atBat.isOffense == 0
                            ? atBat.oppCurPlayer >= 9
                              ? 1
                              : atBat.oppCurPlayer + 1
                            : atBat.oppCurPlayer,
                        pitcherResponseFirst:
                          atBat.isOffense == 0 ? atBat.currentPitcher : null,
                      };
                      return { atBat: newAtBat, myBatting: newBatting };
                    });
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
                        pitcherResponseFirst:
                          atBat.isOffense == 0 ? atBat.currentPitcher : null,
                      };
                    });
                  }}
                >
                  <Text style={styles.textButton}>Lên B1</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ ...styles.modelButton, marginBottom: 4 }}
                  onPress={() => {
                    let des = description;
                    let newBatting = myBatting;
                    setBatterRunnerVisible(false);
                    if (atBat.isOffense == 1) {
                      setTempRunnerSecond(
                        outcomeType === 18
                          ? [myBatting[atBat.currentPlayer - 1], "error"]
                          : myBatting[atBat.currentPlayer - 1]
                      );
                      newBatting = updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        outcomeType < 13 || outcomeType > 15
                          ? outcomeType
                          : null,
                        0,
                        0,
                        false,
                        0
                      );
                      des += `#${
                        myBatting[atBat.currentPlayer - 1].player.jerseyNumber
                      }.${
                        myBatting[atBat.currentPlayer - 1].player.firstName
                      } ${
                        myBatting[atBat.currentPlayer - 1].player.lastName
                      } lên chốt 2.`;
                    } else if (atBat.isOffense == 0) {
                      setTempRunnerSecond(
                        outcomeType === 18
                          ? [atBat.oppCurPlayer, "error"]
                          : atBat.oppCurPlayer
                      );
                      let reversedBatting = [...myBatting];
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      // updatePitcherStat(
                      //   pitcher,
                      //   outcomeType < 13 || outcomeType > 15
                      //     ? outcomeType
                      //     : null,
                      //   0,
                      //   0,
                      //   0,
                      //   0,
                      //   0,
                      //   0,
                      //   0,
                      //   0,
                      //   0
                      // );
                      des += `Batter ${atBat.oppCurPlayer} đối phương lên chốt 2.`;
                    }
                    endTheAtBat(des, false, false, newBatting);
                    setAtBatStatus((prev) => {
                      let newAtBat = {
                        ...prev.atBat,
                        isRunnerSecond:
                          atBat.isOffense == 1
                            ? myBatting[atBat.currentPlayer - 1]
                            : outcomeType === 18
                            ? [atBat.oppCurPlayer]
                            : atBat.oppCurPlayer,
                        currentPlayer:
                          atBat.isOffense == 1
                            ? atBat.currentPlayer >= 9
                              ? 1
                              : atBat.currentPlayer + 1
                            : atBat.currentPlayer,
                        oppCurPlayer:
                          atBat.isOffense == 0
                            ? atBat.oppCurPlayer >= 9
                              ? 1
                              : atBat.oppCurPlayer + 1
                            : atBat.oppCurPlayer,
                        pitcherResponseSecond:
                          atBat.isOffense == 0 ? atBat.currentPitcher : null,
                      };
                      return { atBat: newAtBat, myBatting: newBatting };
                    });
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
                        pitcherResponseSecond:
                          atBat.isOffense == 0 ? atBat.currentPitcher : null,
                      };
                    });
                  }}
                >
                  <Text style={styles.textButton}>Lên B2</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    let des = description;
                    let newBatting = myBatting;
                    setBatterRunnerVisible(false);
                    if (atBat.isOffense == 1) {
                      setTempRunnerThird(
                        outcomeType === 18
                          ? [myBatting[atBat.currentPlayer - 1], "error"]
                          : myBatting[atBat.currentPlayer - 1]
                      );
                      newBatting = updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        outcomeType < 13 || outcomeType > 15
                          ? outcomeType
                          : null,
                        0,
                        0,
                        false,
                        0
                      );
                      des += `#${
                        myBatting[atBat.currentPlayer - 1].player.jerseyNumber
                      }.${
                        myBatting[atBat.currentPlayer - 1].player.firstName
                      } ${
                        myBatting[atBat.currentPlayer - 1].player.lastName
                      } lên chốt 3.`;
                    } else {
                      setTempRunnerThird(
                        outcomeType === 18
                          ? [atBat.oppCurPlayer, "error"]
                          : atBat.oppCurPlayer
                      );
                      let reversedBatting = [...myBatting];
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      // updatePitcherStat(
                      //   pitcher,
                      //   outcomeType < 13 || outcomeType > 15
                      //     ? outcomeType
                      //     : null,
                      //   0,
                      //   1,
                      //   0,
                      //   0,
                      //   0,
                      //   0,
                      //   0,
                      //   0,
                      //   0
                      // );
                      des += `Batter ${atBat.oppCurPlayer} đối phương lên chốt 3.`;
                    }
                    endTheAtBat(des, false, false, newBatting);
                    setAtBatStatus((prev) => {
                      let newAtBat = {
                        ...prev.atBat,
                        isRunnerThird:
                          atBat.isOffense == 1
                            ? myBatting[atBat.currentPlayer - 1]
                            : outcomeType == 18
                            ? [atBat.oppCurPlayer]
                            : atBat.oppCurPlayer,
                        currentPlayer:
                          atBat.isOffense == 1
                            ? atBat.currentPlayer >= 9
                              ? 1
                              : atBat.currentPlayer + 1
                            : atBat.currentPlayer,
                        oppCurPlayer:
                          atBat.isOffense == 0
                            ? atBat.oppCurPlayer >= 9
                              ? 1
                              : atBat.oppCurPlayer + 1
                            : atBat.oppCurPlayer,
                        pitcherResponseThird:
                          atBat.isOffense == 0 ? atBat.currentPitcher : null,
                      };
                      return { atBat: newAtBat, myBatting: newBatting };
                    });
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
                        pitcherResponseThird:
                          atBat.isOffense == 0 ? atBat.currentPitcher : null,
                      };
                    });
                  }}
                >
                  <Text style={styles.textButton}>Lên B3</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    let des = description;
                    setBatterRunnerVisible(false);
                    let newBatting = myBatting;
                    if (atBat.isOffense == 1) {
                      newBatting = updateBatterStat(
                        myBatting[atBat.currentPlayer - 1],
                        outcomeType,
                        1,
                        1,
                        false,
                        0
                      );
                      des += `#${
                        myBatting[atBat.currentPlayer - 1].player.jerseyNumber
                      }.${
                        myBatting[atBat.currentPlayer - 1].player.firstName
                      } ${
                        myBatting[atBat.currentPlayer - 1].player.lastName
                      } ghi điểm.`;
                    } else if (atBat.isOffense == 0) {
                      let reversedBatting = [...myBatting];
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      newBatting = updatePitcherStat(
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
                      des += `Batter ${atBat.oppCurPlayer} ghi điểm.`;
                    }
                    endTheAtBat(des, false, true, newBatting);
                    setAtBatStatus((prev) => {
                      let newAtBat = {
                        ...prev.atBat,
                        currentPlayer:
                          atBat.isOffense == 1
                            ? atBat.currentPlayer >= 9
                              ? 1
                              : atBat.currentPlayer + 1
                            : atBat.currentPlayer,
                        oppCurPlayer:
                          atBat.isOffense == 0
                            ? atBat.oppCurPlayer >= 9
                              ? 1
                              : atBat.oppCurPlayer + 1
                            : atBat.oppCurPlayer,
                      };
                      return { atBat: newAtBat, myBatting: newBatting };
                    });
                    setAtBat((prev) => {
                      return {
                        ...prev,
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
                    let des = description;
                    let newBatting = myBatting;
                    setBatterRunnerVisible(false);
                    console.log(outcomeType);
                    if (atBat.isOffense === 1) {
                      des += `#${
                        myBatting[atBat.currentPlayer - 1].player.jerseyNumber
                      }.${
                        myBatting[atBat.currentPlayer - 1].player.firstName
                      } ${
                        myBatting[atBat.currentPlayer - 1].player.lastName
                      } out ở chốt 1.`;

                      handleOut(true, myBatting[atBat.currentPlayer - 1]);
                      endTheAtBat(des, true);
                    } else {
                      let reversedBatting = [...myBatting];
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      newBatting = updatePitcherStat(
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
                      des += `Batter ${atBat.oppCurPlayer} out ở chốt 1.`;
                      handleOut(true, atBat.oppCurPlayer);
                      endTheAtBat(des, true, false, newBatting);
                    }
                  }}
                >
                  <Text style={styles.textButton}>Out ở B1</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ ...styles.modelButton, marginBottom: 4 }}
                  onPress={() => {
                    let des = description;
                    let newBatting = myBatting;
                    setBatterRunnerVisible(false);
                    if (atBat.isOffense === 1) {
                      des += `#${
                        myBatting[atBat.currentPlayer - 1].player.jerseyNumber
                      }.${
                        myBatting[atBat.currentPlayer - 1].player.firstName
                      } ${
                        myBatting[atBat.currentPlayer - 1].player.lastName
                      } bị tag out ở chốt 2.`;

                      handleOut(true, myBatting[atBat.currentPlayer - 1]);
                      endTheAtBat(des, true);
                    } else {
                      let reversedBatting = [...myBatting];
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      newBatting = updatePitcherStat(
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
                      des += `Batter ${atBat.oppCurPlayer} bị tag out ở chốt 2.`;
                      handleOut(true, atBat.oppCurPlayer);
                      endTheAtBat(des, true, false, newBatting);
                    }
                  }}
                >
                  <Text style={styles.textButton}>Tag out ở B2</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ ...styles.modelButton, marginBottom: 4 }}
                  onPress={() => {
                    let des = description;
                    let newBatting = myBatting;
                    setBatterRunnerVisible(false);
                    if (atBat.isOffense === 1) {
                      des += `#${
                        myBatting[atBat.currentPlayer - 1].player.jerseyNumber
                      }.${
                        myBatting[atBat.currentPlayer - 1].player.firstName
                      } ${
                        myBatting[atBat.currentPlayer - 1].player.lastName
                      } bị tag out ở chốt 3.`;

                      handleOut(true, myBatting[atBat.currentPlayer - 1]);
                      endTheAtBat(des, true);
                    } else {
                      let reversedBatting = [...myBatting];
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      newBatting = updatePitcherStat(
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
                      des += `Batter ${atBat.oppCurPlayer} bị tag out ở chốt 3.`;
                      handleOut(true, atBat.oppCurPlayer);
                      endTheAtBat(des, true, false, newBatting);
                    }
                  }}
                >
                  <Text style={styles.textButton}>Tag out ở B3</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    let des = description;
                    let newBatting = myBatting;
                    setBatterRunnerVisible(false);
                    if (atBat.isOffense === 1) {
                      des += `#${
                        myBatting[atBat.currentPlayer - 1].player.jerseyNumber
                      }.${
                        myBatting[atBat.currentPlayer - 1].player.firstName
                      } ${
                        myBatting[atBat.currentPlayer - 1].player.lastName
                      } bị tag out ở home.`;

                      handleOut(true, myBatting[atBat.currentPlayer - 1]);
                      endTheAtBat(des, true);
                    } else {
                      let reversedBatting = [...myBatting];
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      newBatting = updatePitcherStat(
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
                      des += `Batter ${atBat.oppCurPlayer} bị tag out ở home.`;

                      handleOut(true, atBat.oppCurPlayer);
                      endTheAtBat(des, true, false, newBatting);
                    }
                  }}
                >
                  <Text style={styles.textButton}>Tag out ở home</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    let des = description;
                    let newBatting = myBatting;
                    setBatterRunnerVisible(false);
                    if (atBat.isOffense === 1) {
                      des += `#${
                        myBatting[atBat.currentPlayer - 1].player.jerseyNumber
                      }.${
                        myBatting[atBat.currentPlayer - 1].player.firstName
                      } ${
                        myBatting[atBat.currentPlayer - 1].player.lastName
                      } out vì cản trở fielder.`;
                      handleOut(true, myBatting[atBat.currentPlayer - 1]);
                      endTheAtBat(des, true);
                    } else {
                      let reversedBatting = [...myBatting];
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      newBatting = updatePitcherStat(
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
                      des += `Batter ${atBat.oppCurPlayer} out vì cản trở fielder.`;
                      handleOut(true, atBat.oppCurPlayer);
                      endTheAtBat(des, true, false, newBatting);
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
                    setBatterRunnerVisible(true);
                  }}
                >
                  <Text style={styles.textButton}>Vẫn ở B1</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ ...styles.modelButton, marginBottom: 4 }}
                  onPress={() => {
                    setFirstRunnerVisible(false);
                    if (atBat.isOffense) {
                      addDescription(
                        `#${atBat.isRunnerFirst.player.jerseyNumber}.${atBat.isRunnerFirst.player.firstName} ${atBat.isRunnerFirst.player.lastName} lên chốt 2`
                      );
                    } else {
                      addDescription(`Runner B1 đối phương lên chốt 2`);
                    }
                    setAtBat((prev) => {
                      setTempRunnerFirst(null);
                      setTempRunnerSecond(prev.isRunnerFirst);
                      setTempPitcherResponseFirst(null);
                      setTempPitcherResponseSecond(prev.pitcherResponseFirst);
                      return {
                        ...prev,
                        //isRunnerFirst: null,
                        beforeRunnerFirst: prev.isRunnerFirst,
                        //isRunnerSecond: prev.isRunnerFirst,
                      };
                    });
                    setBatterRunnerVisible(true);
                  }}
                >
                  <Text style={styles.textButton}>Lên B2</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    setFirstRunnerVisible(false);
                    if (atBat.isOffense) {
                      addDescription(
                        `#${atBat.isRunnerFirst.player.jerseyNumber}.${atBat.isRunnerFirst.player.firstName} ${atBat.isRunnerFirst.player.lastName} lên chốt 3`
                      );
                    } else {
                      addDescription(`Runner B1 đối phương lên chốt 3`);
                    }
                    setAtBat((prev) => {
                      setTempRunnerFirst(null);
                      setTempRunnerThird(prev.isRunnerFirst);
                      setTempPitcherResponseFirst(null);
                      setTempPitcherResponseThird(prev.pitcherResponseFirst);
                      return {
                        ...prev,
                        // isRunnerFirst: null,
                        beforeRunnerFirst: prev.isRunnerFirst,
                        //isRunnerThird: prev.isRunnerFirst,
                      };
                    });
                    setBatterRunnerVisible(true);
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
                      addDescription(
                        `#${atBat.isRunnerFirst.player.jerseyNumber}.${atBat.isRunnerFirst.player.firstName} ${atBat.isRunnerFirst.player.lastName} ghi điểm`
                      );
                    } else {
                      updatePitcherStat(
                        atBat.pitcherResponseFirst,
                        null,
                        0,
                        0,
                        0,
                        1,
                        Array.isArray(atBat.isRunnerFirst) ? 0 : 1,
                        0,
                        0,
                        0,
                        0
                      );
                      addDescription(`Runner B1 đối phương ghi điểm`);
                    }
                    setAtBat((prev) => {
                      setTempRunnerFirst(null);
                      setTempPitcherResponseFirst(null);
                      if (prev.isOffense == 1) setTeamScore((prev) => prev + 1);
                      else if (prev.isOffense == 0)
                        setOppScore((prev) => prev + 1);
                      return {
                        ...prev,
                        beforeRunnerFirst: prev.isRunnerFirst,
                      };
                    });
                    setBatterRunnerVisible(true);
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
                    if (atBat.isOffense === 1) {
                      addDescription(
                        `#${atBat.isRunnerFirst.player.jerseyNumber}.${atBat.isRunnerFirst.player.firstName} ${atBat.isRunnerFirst.player.lastName} bị tag out ở chốt 2`
                      );
                      handleOut(1, atBat.isRunnerFirst);
                    } else {
                      let reversedBatting = [...myBatting];
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
                      addDescription(
                        `Runner B1 đối phương bị tag out ở chốt 2`
                      );
                      handleOut(1, atBat.isRunnerFirst);
                    }
                    setBatterRunnerVisible(true);
                  }}
                >
                  <Text style={styles.textButton}>Tag out ở B2</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ ...styles.modelButton, marginBottom: 4 }}
                  onPress={() => {
                    setFirstRunnerVisible(false);
                    setBatterRunnerVisible(true);
                    if (atBat.isOffense === 1) {
                      addDescription(
                        `#${atBat.isRunnerFirst.player.jerseyNumber}.${atBat.isRunnerFirst.player.firstName} ${atBat.isRunnerFirst.player.lastName} bị tag out ở chốt 3`
                      );
                      handleOut(1, atBat.isRunnerFirst);
                    } else {
                      let reversedBatting = [...myBatting];
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
                      addDescription(
                        `Runner B1 đối phương bị tag out ở chốt 3`
                      );
                      handleOut(1, atBat.isRunnerFirst);
                    }
                  }}
                >
                  <Text style={styles.textButton}>Tag out ở B3</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    setFirstRunnerVisible(false);
                    setBatterRunnerVisible(true);
                    if (atBat.isOffense === 1) {
                      addDescription(
                        `#${atBat.isRunnerFirst.player.jerseyNumber}.${atBat.isRunnerFirst.player.firstName} ${atBat.isRunnerFirst.player.lastName} bị tag out ở home`
                      );
                      handleOut(1, atBat.isRunnerFirst);
                    } else {
                      let reversedBatting = [...myBatting];
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
                      addDescription(`Runner B1 đối phương bị tag out ở home`);
                      handleOut(1, atBat.isRunnerFirst);
                    }
                  }}
                >
                  <Text style={styles.textButton}>Tag out ở home</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    setFirstRunnerVisible(false);
                    if (atBat.isOffense === 1) {
                      addDescription(
                        `#${atBat.isRunnerFirst.player.jerseyNumber}.${atBat.isRunnerFirst.player.firstName} ${atBat.isRunnerFirst.player.lastName} force out ở chốt 2`
                      );
                      handleOut(1, atBat.isRunnerFirst);
                    } else {
                      let reversedBatting = [...myBatting];
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
                      addDescription(`Runner B1 đối phương force out ở chốt 2`);
                      handleOut(1, atBat.isRunnerFirst);
                    }
                    setBatterRunnerVisible(true);
                  }}
                >
                  <Text style={styles.textButton}>Force out ở B2</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    setFirstRunnerVisible(false);
                    if (atBat.isOffense === 1) {
                      addDescription(
                        `#${atBat.isRunnerFirst.player.jerseyNumber}.${atBat.isRunnerFirst.player.firstName} ${atBat.isRunnerFirst.player.lastName} out vì cản trở fielder`
                      );
                      handleOut(1, atBat.isRunnerFirst);
                    } else {
                      let reversedBatting = [...myBatting];
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
                      addDescription(
                        `Runner B1 đối phương out vì cản trở fielder`
                      );
                      handleOut(1, atBat.isRunnerFirst);
                    }
                    setBatterRunnerVisible(true);
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
                    else setBatterRunnerVisible(true);
                  }}
                >
                  <Text style={styles.textButton}>Vẫn ở B2</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    setSecondRunnerVisible(false);
                    if (atBat.isOffense === 1) {
                      addDescription(
                        `#${atBat.isRunnerSecond.player.jerseyNumber}.${atBat.isRunnerSecond.player.firstName} ${atBat.isRunnerSecond.player.lastName} lên chốt 3`
                      );
                    } else {
                      addDescription(`Runner B2 đối phương lên chốt 3`);
                    }
                    setAtBat((prev) => {
                      setTempRunnerSecond(null);
                      setTempRunnerThird(prev.isRunnerSecond);
                      if (atBat.isOffense == 0) {
                        setTempPitcherResponseSecond(null);
                        setTempPitcherResponseThird(prev.pitcherResponseSecond);
                      }
                      return {
                        ...prev,
                        //isRunnerSecond: null,
                        beforeRunnerSecond: prev.isRunnerSecond,
                        //isRunnerThird: prev.isRunnerSecond,
                      };
                    });
                    if (atBat.isRunnerFirst !== null)
                      setFirstRunnerVisible(true);
                    else setBatterRunnerVisible(true);
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
                      addDescription(
                        `#${atBat.isRunnerSecond.player.jerseyNumber}.${atBat.isRunnerSecond.player.firstName} ${atBat.isRunnerSecond.player.lastName} ghi điểm`
                      );
                    } else {
                      let reversedBatting = [...myBatting];
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      if (
                        atBat.pitcherResponseSecond.player.id ==
                        atBat.currentPitcher.player.id
                      ) {
                        updatePitcherStat(
                          pitcher,
                          null,
                          0,
                          0,
                          0,
                          1,
                          Array.isArray(atBat.isRunnerSecond) ? 0 : 1,
                          0,
                          0,
                          0,
                          0
                        );
                      } else {
                        updatePitcherStat(
                          atBat.pitcherResponseSecond,
                          null,
                          0,
                          0,
                          0,
                          1,
                          Array.isArray(atBat.isRunnerSecond) ? 0 : 1,
                          0,
                          0,
                          0,
                          0
                        );
                      }
                      addDescription(`Runner B2 đối phương ghi điểm`);
                    }
                    setAtBat((prev) => {
                      setTempRunnerSecond(null);
                      if (atBat.isOffense == 0)
                        setTempPitcherResponseSecond(null);
                      if (prev.isOffense == 1) setTeamScore((prev) => prev + 1);
                      else if (prev.isOffense == 0)
                        setOppScore((prev) => prev + 1);
                      return {
                        ...prev,
                        //isRunnerSecond: null,
                        beforeRunnerSecond: prev.isRunnerSecond,
                      };
                    });
                    if (atBat.isRunnerFirst !== null)
                      setFirstRunnerVisible(true);
                    else setBatterRunnerVisible(true);
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
                    if (atBat.isOffense === 1) {
                      addDescription(
                        `#${atBat.isRunnerSecond.player.jerseyNumber}.${atBat.isRunnerSecond.player.firstName} ${atBat.isRunnerSecond.player.lastName} bị tag out ở chốt 3`
                      );
                      handleOut(2, atBat.isRunnerSecond);
                    } else {
                      let reversedBatting = [...myBatting];
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
                      addDescription(
                        `Runner B2 đối phương bị tag out ở chốt 3`
                      );
                      handleOut(2, atBat.isRunnerSecond);
                    }
                    if (atBat.isRunnerFirst !== null)
                      setFirstRunnerVisible(true);
                    else setBatterRunnerVisible(true);
                  }}
                >
                  <Text style={styles.textButton}>Tag out ở B3</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    setSecondRunnerVisible(false);
                    if (atBat.isOffense === 1) {
                      addDescription(
                        `#${atBat.isRunnerSecond.player.jerseyNumber}.${atBat.isRunnerSecond.player.firstName} ${atBat.isRunnerSecond.player.lastName} bị tag out ở home`
                      );
                      handleOut(2, atBat.isRunnerSecond);
                    } else {
                      let reversedBatting = [...myBatting];
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
                      addDescription(`Runner B2 đối phương bị tag out ở home`);
                      handleOut(2, atBat.isRunnerSecond);
                    }
                    if (atBat.isRunnerFirst !== null)
                      setFirstRunnerVisible(true);
                    else setBatterRunnerVisible(true);
                  }}
                >
                  <Text style={styles.textButton}>Tag out ở home</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    setSecondRunnerVisible(false);
                    if (atBat.isOffense === 1) {
                      addDescription(
                        `#${atBat.isRunnerSecond.player.jerseyNumber}.${atBat.isRunnerSecond.player.firstName} ${atBat.isRunnerSecond.player.lastName} bị force out ở chốt 3`
                      );
                      handleOut(2, atBat.isRunnerSecond);
                    } else {
                      let reversedBatting = [...myBatting];
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
                      addDescription(`Runner B2 đối phương force out ở chốt 3`);
                      handleOut(2, atBat.isRunnerSecond);
                    }
                    if (atBat.isRunnerFirst !== null)
                      setFirstRunnerVisible(true);
                    else setBatterRunnerVisible(true);
                  }}
                >
                  <Text style={styles.textButton}>Force out ở B3</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    setSecondRunnerVisible(false);
                    if (atBat.isOffense === 1) {
                      addDescription(
                        `#${atBat.isRunnerSecond.player.jerseyNumber}.${atBat.isRunnerSecond.player.firstName} ${atBat.isRunnerSecond.player.lastName} out vì cản trở fielder`
                      );
                      handleOut(2, atBat.isRunnerSecond);
                    } else {
                      let reversedBatting = [...myBatting];
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
                      addDescription(
                        `Runner B2 đối phương out vì cản trở fielder`
                      );
                      handleOut(2, atBat.isRunnerSecond);
                    }
                    if (atBat.isRunnerFirst !== null)
                      setFirstRunnerVisible(true);
                    else setBatterRunnerVisible(true);
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
                    else setBatterRunnerVisible(true);
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
                      let reversedBatting = [...myBatting];
                      let pitcher = reversedBatting.find(
                        (p) => p.position === 1
                      );
                      if (
                        atBat.pitcherResponseThird.player.id ==
                        atBat.currentPitcher.player.id
                      ) {
                        updatePitcherStat(
                          pitcher,
                          null,
                          0,
                          0,
                          0,
                          1,
                          Array.isArray(atBat.isRunnerThird) ? 0 : 1,
                          0,
                          0,
                          0,
                          0
                        );
                      } else {
                        updatePitcherStat(
                          atBat.pitcherResponseThird,
                          null,
                          0,
                          0,
                          0,
                          1,
                          Array.isArray(atBat.isRunnerThird) ? 0 : 1,
                          0,
                          0,
                          0,
                          0
                        );
                      }
                    }
                    if (atBat.isOffense === 1) {
                      addDescription(
                        `#${atBat.isRunnerThird.player.jerseyNumber}.${atBat.isRunnerThird.player.firstName} ${atBat.isRunnerThird.player.lastName} ghi điểm`
                      );
                    } else {
                      addDescription(`Runner B3 đối phương ghi điểm`);
                    }
                    setAtBat((prev) => {
                      setTempRunnerThird(null);
                      if (prev.isOffense == 1) setTeamScore((prev) => prev + 1);
                      else if (prev.isOffense == 0)
                        setOppScore((prev) => prev + 1);
                      return {
                        ...prev,
                        beforeRunnerThird: prev.isRunnerThird,
                        // isRunnerThird: null,
                      };
                    });
                    if (atBat.isRunnerSecond !== null)
                      setSecondRunnerVisible(true);
                    else if (atBat.isRunnerFirst !== null)
                      setFirstRunnerVisible(true);
                    else setBatterRunnerVisible(true);
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
                    if (atBat.isOffense === 1) {
                      addDescription(
                        `#${atBat.isRunnerThird.player.jerseyNumber}.${atBat.isRunnerThird.player.firstName} ${atBat.isRunnerThird.player.lastName} bị tag out ở home`
                      );
                      handleOut(3, atBat.isRunnerThird);
                    } else {
                      let reversedBatting = [...myBatting];
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
                      addDescription(`Runner B3 đối phương bị tag out ở home`);
                      handleOut(3, atBat.isRunnerThird);
                    }
                    if (atBat.isRunnerSecond != null)
                      setSecondRunnerVisible(true);
                    else if (atBat.isRunnerFirst !== null)
                      setFirstRunnerVisible(true);
                    else setBatterRunnerVisible(true);
                  }}
                >
                  <Text style={styles.textButton}>Tag out ở home</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    setThirdRunnerVisible(false);
                    if (atBat.isOffense === 1) {
                      addDescription(
                        `#${atBat.isRunnerThird.player.jerseyNumber}.${atBat.isRunnerThird.player.firstName} ${atBat.isRunnerThird.player.lastName} force out ở home`
                      );
                      handleOut(3, atBat.isRunnerThird);
                    } else {
                      let reversedBatting = [...myBatting];
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
                      addDescription(`Runner B3 đối phương force out ở home`);
                      handleOut(3, atBat.isRunnerThird);
                    }
                    if (atBat.isRunnerSecond !== null)
                      setSecondRunnerVisible(true);
                    else if (atBat.isRunnerFirst !== null)
                      setFirstRunnerVisible(true);
                    else setBatterRunnerVisible(true);
                  }}
                >
                  <Text style={styles.textButton}>Force out ở home</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    setThirdRunnerVisible(false);
                    if (atBat.isOffense === 1) {
                      addDescription(
                        `#${atBat.isRunnerThird.player.jerseyNumber}.${atBat.isRunnerThird.player.firstName} ${atBat.isRunnerThird.player.lastName} bị out vì cản trở fielder`
                      );
                      handleOut(3, atBat.isRunnerThird);
                    } else {
                      let reversedBatting = [...myBatting];
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
                      addDescription(
                        `Runner B3 đối phương bị out vì cản trở fielder`
                      );
                      handleOut(3, atBat.isRunnerThird);
                    }
                    if (atBat.isRunnerSecond !== null)
                      setSecondRunnerVisible(true);
                    else if (atBat.isRunnerFirst !== null)
                      setFirstRunnerVisible(true);
                    else setBatterRunnerVisible(true);
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
      <Modal
        animationType="slide"
        transparent={true}
        visible={firstRunnerStatusVisible}
        onRequestClose={() => {
          setFirstRunnerStatusVisible(!firstRunnerStatusVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>
              Cập nhật tình hình runner ở B1
            </Text>
            <View style={styles.modalButtonList}>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    setFirstRunnerStatusVisible(false);
                    setFirstRunnerStatusVisible(false);
                    let des = "";
                    let newBatting = myBatting;
                    if (atBat.isRunnerFirst && !atBat.isRunnerSecond) {
                      if (atBat.isOffense === 1) {
                        des = `#${atBat.isRunnerFirst.player.jerseyNumber}.${atBat.isRunnerFirst.player.firstName} ${atBat.isRunnerFirst.player.lastName} cướp chốt 2 thành công`;
                        newBatting = updateBatterStat(
                          atBat.isRunnerFirst,
                          null,
                          0,
                          0,
                          1,
                          0,
                          true
                        );
                      } else {
                        des = "Runner B1 đối phương cướp chốt 2 thành công";
                      }
                      setAtBatsList((prev) => [
                        ...prev,
                        {
                          ...atBat,
                          isLastState: false,
                          description: des,
                        },
                      ]);
                      setNotSavedAtBats((prev) => [
                        ...prev,
                        {
                          ...atBat,
                          isLastState: false,
                          id: null,
                          description: des,
                        },
                      ]);
                      setFutureState([]);
                      setRecoilAtBatStatus((prev) => {
                        let newArray = [...prev];
                        return [
                          ...newArray,
                          { atBat: atBat, myBatting: newBatting },
                        ];
                      });
                      setPastState(() => {
                        if (Array.isArray(pastState))
                          return [...pastState, atBatStatus];
                        else return [];
                      });
                      setAtBatStatus((prev) => {
                        return {
                          atBat: {
                            ...prev.atBat,
                            isRunnerSecond: prev.atBat.isRunnerFirst,
                            beforeRunnerFirst: prev.atBat.isRunnerFirst,
                            isRunnerFirst: null,
                          },
                          myBatting: newBatting,
                        };
                      });
                      setAtBat((prev) => {
                        setTempRunnerSecond(prev.isRunnerFirst);
                        setTempRunnerFirst(null);
                        return {
                          ...prev,
                          isRunnerSecond: prev.isRunnerFirst,
                          beforeRunnerFirst: prev.isRunnerFirst,
                          isRunnerFirst: null,
                        };
                      });
                    } else if (!atBat.isRunnerFirst) {
                      toast.show(
                        "Không có runner ở chốt 1 để thực hiện cập nhật",
                        {
                          type: "warn",
                          placement: "bottom",
                          duration: 4000,
                          offset: 30,
                          animationType: "zoom-in",
                        }
                      );
                    } else if (atBat.isRunnerSecond) {
                      toast.show(
                        "Vì chốt 2 đã có runner nên không thể thực hiện cập nhật. Hãy cập nhật trạng thái của runner ở chốt 2 trước",
                        {
                          type: "warn",
                          placement: "bottom",
                          duration: 4000,
                          offset: 30,
                          animationType: "zoom-in",
                        }
                      );
                    }
                  }}
                >
                  <Text style={styles.textButton}>Cướp chốt 2 thành công</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    if (atBat.isRunnerFirst) {
                      setFirstRunnerStatusVisible(false);
                      let des = "";
                      if (atBat.isOffense === 1) {
                        des = `#${atBat.isRunnerFirst.player.jerseyNumber}.${atBat.isRunnerFirst.player.firstName} ${atBat.isRunnerFirst.player.lastName} cướp chốt 2 thất bại`;
                      } else {
                        des = "Runner B1 đối phương cướp chốt 2 thất bại";
                      }
                      setAtBatsList((prev) => [
                        ...prev,
                        {
                          ...atBat,
                          isLastState: false,
                          description: des,
                        },
                      ]);
                      setNotSavedAtBats((prev) => [
                        ...prev,
                        {
                          ...atBat,
                          isLastState: false,
                          id: null,
                          description: des,
                        },
                      ]);
                      setFutureState([]);
                      setRecoilAtBatStatus((prev) => {
                        let newArray = [...prev];
                        return [
                          ...newArray,
                          { atBat: atBat, myBatting: myBatting },
                        ];
                      });
                      setPastState(() => {
                        if (Array.isArray(pastState))
                          return [...pastState, atBatStatus];
                        else return [];
                      });
                      setAtBatStatus((prev) => {
                        let inning = prev.atBat.inning;
                        if (!prev.atBat.isTop && prev.atBat.out + 1 > 2)
                          inning++;
                        let newAtBat = {
                          ...prev,
                          atBat,
                          isRunnerFirst: null,
                          isRunnerSecond:
                            prev.atBat.out + 1 > 2
                              ? null
                              : prev.atBat.isRunnerSecond,
                          isRunnerThird:
                            prev.atBat.out + 1 > 2
                              ? null
                              : prev.atBat.isRunnerThird,
                          out: prev.atBat.out + 1 > 2 ? 0 : prev.atBat.out + 1,
                          isOffense:
                            prev.atBat.out + 1 > 2
                              ? prev.atBat.isOffense == 1
                                ? 0
                                : 1
                              : prev.atBat.isOffense,
                          isTop:
                            prev.atBat.out + 1 > 2
                              ? !prev.atBat.isTop
                              : prev.atBat.isTop,
                          inning: inning,
                        };
                        return { atBat: newAtBat, myBatting: myBatting };
                      });
                      setAtBat((prev) => {
                        setTempRunnerFirst(null);
                        if (prev.out + 1 > 2) {
                          setTempRunnerSecond(null);
                          setTempRunnerThird(null);
                        }
                        let inning = prev.inning;
                        if (!prev.isTop && prev.out + 1 > 2) inning++;
                        return {
                          ...prev,
                          isRunnerFirst: null,
                          isRunnerSecond:
                            prev.out + 1 > 2 ? null : prev.isRunnerSecond,
                          isRunnerThird:
                            prev.out + 1 > 2 ? null : prev.isRunnerThird,
                          out: prev.out + 1 > 2 ? 0 : prev.out + 1,
                          isOffense:
                            prev.out + 1 > 2
                              ? prev.isOffense == 1
                                ? 0
                                : 1
                              : prev.isOffense,
                          isTop: prev.out + 1 > 2 ? !prev.isTop : prev.isTop,
                          inning: inning,
                        };
                      });
                    } else {
                      toast.show(
                        "Không có runner ở chốt 1 để thực hiện cập nhật",
                        {
                          type: "warn",
                          placement: "bottom",
                          duration: 4000,
                          offset: 30,
                          animationType: "zoom-in",
                        }
                      );
                    }
                  }}
                >
                  <Text style={styles.textButton}>Cướp chốt 2 thất bại</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    setFirstRunnerStatusVisible(false);
                    let des = "";
                    let newBatting = myBatting;
                    if (atBat.isRunnerFirst && !atBat.isRunnerSecond) {
                      if (atBat.isOffense === 1) {
                        des = `#${atBat.isRunnerFirst.player.jerseyNumber}.${atBat.isRunnerFirst.player.firstName} ${atBat.isRunnerFirst.player.lastName} lên chốt 2 do pitcher balk`;
                      } else {
                        des = "Runner B1 đối phương lên chốt 2 do pitcher balk";
                        let reversedBatting = [...myBatting]
                          .reverse()
                          .reverse();
                        let pitcher = reversedBatting.find(
                          (p) => p.position === 1
                        );
                        newBatting = updatePitcherStat(
                          pitcher,
                          null,
                          0,
                          0,
                          0,
                          0,
                          0,
                          1,
                          0,
                          0,
                          0
                        );
                      }
                      setAtBatsList((prev) => [
                        ...prev,
                        {
                          ...atBat,
                          isLastState: false,
                          description: des,
                        },
                      ]);
                      setNotSavedAtBats((prev) => [
                        ...prev,
                        {
                          ...atBat,
                          isLastState: false,
                          id: null,
                          description: des,
                        },
                      ]);
                      setFutureState([]);
                      setRecoilAtBatStatus((prev) => {
                        let newArray = [...prev];
                        return [
                          ...newArray,
                          { atBat: atBat, myBatting: newBatting },
                        ];
                      });
                      setPastState(() => {
                        if (Array.isArray(pastState))
                          return [...pastState, atBatStatus];
                        else return [];
                      });
                      setAtBatStatus((prev) => {
                        return {
                          atBat: {
                            ...prev.atBat,
                            isRunnerSecond: prev.atBat.isRunnerFirst,
                            beforeRunnerFirst: prev.atBat.isRunnerFirst,
                            isRunnerFirst: null,
                          },
                          myBatting: newBatting,
                        };
                      });
                      setAtBat((prev) => {
                        setTempRunnerSecond(prev.isRunnerFirst);
                        setTempRunnerFirst(null);
                        return {
                          ...prev,
                          isRunnerSecond: prev.isRunnerFirst,
                          beforeRunnerFirst: prev.isRunnerFirst,
                          isRunnerFirst: null,
                        };
                      });
                    } else if (!atBat.isRunnerFirst) {
                      toast.show(
                        "Không có runner ở chốt 1 để thực hiện cập nhật",
                        {
                          type: "warn",
                          placement: "bottom",
                          duration: 4000,
                          offset: 30,
                          animationType: "zoom-in",
                        }
                      );
                    } else if (atBat.isRunnerSecond) {
                      toast.show(
                        "Vì chốt 2 đã có runner nên không thể thực hiện cập nhật. Hãy cập nhật trạng thái của runner ở chốt 2 trước",
                        {
                          type: "warn",
                          placement: "bottom",
                          duration: 4000,
                          offset: 30,
                          animationType: "zoom-in",
                        }
                      );
                    }
                  }}
                >
                  <Text style={styles.textButton}>
                    Lên chốt 2 do pitcher balk
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    if (atBat.isRunnerFirst) {
                      setFirstRunnerStatusVisible(false);
                      let des = "";
                      let newBatting = myBatting;
                      if (atBat.isOffense === 1) {
                        des = `#${atBat.isRunnerFirst.player.jerseyNumber}.${atBat.isRunnerFirst.player.firstName} ${atBat.isRunnerFirst.player.lastName} out vì bị pickoff ở chốt 1`;
                      } else {
                        des = "Runner B1 đối phương out vì bị pickoff ở chốt 1";
                        let reversedBatting = [...myBatting]
                          .reverse()
                          .reverse();
                        let pitcher = reversedBatting.find(
                          (p) => p.position === 1
                        );
                        newBatting = updatePitcherStat(
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
                          1
                        );
                      }
                      setAtBatsList((prev) => [
                        ...prev,
                        {
                          ...atBat,
                          isLastState: false,
                          description: des,
                        },
                      ]);

                      setNotSavedAtBats((prev) => [
                        ...prev,
                        {
                          ...atBat,
                          isLastState: false,
                          id: null,
                          description: des,
                        },
                      ]);
                      setFutureState([]);
                      setRecoilAtBatStatus((prev) => {
                        let newArray = [...prev];
                        return [
                          ...newArray,
                          { atBat: atBat, myBatting: newBatting },
                        ];
                      });
                      setPastState(() => {
                        if (Array.isArray(pastState))
                          return [...pastState, atBatStatus];
                        else return [];
                      });
                      setAtBatStatus((prev) => {
                        let inning = prev.atBat.inning;
                        if (!prev.atBat.isTop && prev.atBat.out + 1 > 2)
                          inning++;
                        let newAtBat = {
                          ...prev,
                          atBat,
                          isRunnerFirst: null,
                          isRunnerSecond:
                            prev.atBat.out + 1 > 2
                              ? null
                              : prev.atBat.isRunnerSecond,
                          isRunnerThird:
                            prev.atBat.out + 1 > 2
                              ? null
                              : prev.atBat.isRunnerThird,
                          out: prev.atBat.out + 1 > 2 ? 0 : prev.atBat.out + 1,
                          isOffense:
                            prev.atBat.out + 1 > 2
                              ? prev.atBat.isOffense == 1
                                ? 0
                                : 1
                              : prev.atBat.isOffense,
                          isTop:
                            prev.atBat.out + 1 > 2
                              ? !prev.atBat.isTop
                              : prev.atBat.isTop,
                          inning: inning,
                        };
                        return { atBat: newAtBat, myBatting: newBatting };
                      });

                      setAtBat((prev) => {
                        setTempRunnerFirst(null);
                        if (prev.out + 1 > 2) {
                          setTempRunnerSecond(null);
                          setTempRunnerThird(null);
                        }
                        let inning = prev.inning;
                        if (!prev.isTop && prev.out + 1 > 2) inning++;
                        return {
                          ...prev,
                          isRunnerFirst: null,
                          isRunnerSecond:
                            prev.out + 1 > 2 ? null : prev.isRunnerSecond,
                          isRunnerThird:
                            prev.out + 1 > 2 ? null : prev.isRunnerThird,
                          out: prev.out + 1 > 2 ? 0 : prev.out + 1,
                          isOffense:
                            prev.out + 1 > 2
                              ? prev.isOffense == 1
                                ? 0
                                : 1
                              : prev.isOffense,
                          isTop: prev.out + 1 > 2 ? !prev.isTop : prev.isTop,
                          inning: inning,
                        };
                      });
                    } else {
                      toast.show(
                        "Không có runner ở chốt 1 để thực hiện cập nhật",
                        {
                          type: "warn",
                          placement: "bottom",
                          duration: 4000,
                          offset: 30,
                          animationType: "zoom-in",
                        }
                      );
                    }
                  }}
                >
                  <Text style={styles.textButton}>Out vì bị pickoff</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Button
              title="Close"
              onPress={() => setFirstRunnerStatusVisible(false)}
            />
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={secondRunnerStatusVisible}
        onRequestClose={() => {
          setSecondRunnerStatusVisible(!secondRunnerStatusVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>
              Cập nhật tình hình runner ở B2
            </Text>
            <View style={styles.modalButtonList}>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    setSecondRunnerStatusVisible(false);
                    setSecondRunnerStatusVisible(false);
                    let des = "";
                    let newBatting = myBatting;
                    if (atBat.isRunnerSecond && !atBat.isRunnerThird) {
                      if (atBat.isOffense === 1) {
                        des = `#${atBat.isRunnerSecond.player.jerseyNumber}.${atBat.isRunnerSecond.player.firstName} ${atBat.isRunnerSecond.player.lastName} cướp chốt 3 thành công`;
                        newBatting = updateBatterStat(
                          atBat.isRunnerFirst,
                          null,
                          0,
                          0,
                          1,
                          0,
                          true
                        );
                      } else {
                        des = "Runner B2 đối phương cướp chốt 3 thành công";
                      }
                      setAtBatsList((prev) => [
                        ...prev,
                        {
                          ...atBat,
                          isLastState: false,
                          description: des,
                        },
                      ]);
                      setNotSavedAtBats((prev) => [
                        ...prev,
                        {
                          ...atBat,
                          isLastState: false,
                          id: null,
                          description: des,
                        },
                      ]);
                      setFutureState([]);
                      setRecoilAtBatStatus((prev) => {
                        let newArray = [...prev];
                        return [
                          ...newArray,
                          { atBat: atBat, myBatting: newBatting },
                        ];
                      });
                      setPastState(() => {
                        if (Array.isArray(pastState))
                          return [...pastState, atBatStatus];
                        else return [];
                      });
                      setAtBatStatus((prev) => {
                        return {
                          atBat: {
                            ...prev.atBat,
                            ...prev,
                            isRunnerThird: prev.atBat.isRunnerSecond,
                            beforeRunnerSecond: prev.atBat.isRunnerSecond,
                            isRunnerSecond: null,
                          },
                          myBatting: newBatting,
                        };
                      });
                      setAtBat((prev) => {
                        setTempRunnerThird(prev.isRunnerSecond);
                        setTempRunnerSecond(null);
                        return {
                          ...prev,
                          isRunnerThird: prev.isRunnerSecond,
                          beforeRunnerSecond: prev.isRunnerSecond,
                          isRunnerSecond: null,
                        };
                      });
                    } else if (!atBat.isRunnerFirst) {
                      toast.show(
                        "Không có runner ở chốt 2 để thực hiện cập nhật",
                        {
                          type: "warn",
                          placement: "bottom",
                          duration: 4000,
                          offset: 30,
                          animationType: "zoom-in",
                        }
                      );
                    } else if (atBat.isRunnerSecond) {
                      toast.show(
                        "Vì chốt 3 đã có runner nên không thể thực hiện cập nhật. Hãy cập nhật trạng thái của runner ở chốt 3 trước",
                        {
                          type: "warn",
                          placement: "bottom",
                          duration: 4000,
                          offset: 30,
                          animationType: "zoom-in",
                        }
                      );
                    }
                  }}
                >
                  <Text style={styles.textButton}>Cướp chốt 3 thành công</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    if (atBat.isRunnerSecond) {
                      setSecondRunnerStatusVisible(false);
                      let des = "";
                      if (atBat.isOffense === 1) {
                        des = `#${atBat.isRunnerSecond.player.jerseyNumber}.${atBat.isRunnerSecond.player.firstName} ${atBat.isRunnerSecond.player.lastName} cướp chốt 3 thất bại`;
                      } else {
                        des = "Runner B2 đối phương cướp chốt 3 thất bại";
                      }
                      setAtBatsList((prev) => [
                        ...prev,
                        {
                          ...atBat,
                          isLastState: false,
                          description: des,
                        },
                      ]);
                      setNotSavedAtBats((prev) => [
                        ...prev,
                        {
                          ...atBat,
                          isLastState: false,
                          id: null,
                          description: des,
                        },
                      ]);
                      setFutureState([]);
                      setRecoilAtBatStatus((prev) => {
                        let newArray = [...prev];
                        return [
                          ...newArray,
                          { atBat: atBat, myBatting: myBatting },
                        ];
                      });
                      setPastState(() => {
                        if (Array.isArray(pastState))
                          return [...pastState, atBatStatus];
                        else return [];
                      });
                      setAtBatStatus((prev) => {
                        let inning = prev.atBat.inning;
                        if (!prev.atBat.isTop && prev.atBat.out + 1 > 2)
                          inning++;
                        let newAtBat = {
                          ...prev.atBat,
                          isRunnerSecond: null,
                          isRunnerFirst:
                            prev.atBat.out + 1 > 2
                              ? null
                              : prev.atBat.isRunnerFirst,
                          isRunnerThird:
                            prev.atBat.out + 1 > 2
                              ? null
                              : prev.atBat.isRunnerThird,
                          out: prev.atBat.out + 1 > 2 ? 0 : prev.atBat.out + 1,
                          isOffense:
                            prev.atBat.out + 1 > 2
                              ? prev.atBat.isOffense == 1
                                ? 0
                                : 1
                              : prev.atBat.isOffense,
                          isTop:
                            prev.atBat.out + 1 > 2
                              ? !prev.atBat.isTop
                              : prev.atBat.isTop,
                          inning: inning,
                        };
                        return { atBat: newAtBat, myBatting: myBatting };
                      });
                      setAtBat((prev) => {
                        setTempRunnerSecond(null);
                        if (prev.out + 1 > 2) {
                          setTempRunnerFirst(null);
                          setTempRunnerThird(null);
                        }
                        let inning = prev.inning;
                        if (!prev.isTop && prev.out + 1 > 2) inning++;
                        return {
                          ...prev,
                          isRunnerSecond: null,
                          isRunnerFirst:
                            prev.out + 1 > 2 ? null : prev.isRunnerFirst,
                          isRunnerThird:
                            prev.out + 1 > 2 ? null : prev.isRunnerThird,
                          out: prev.out + 1 > 2 ? 0 : prev.out + 1,
                          isOffense:
                            prev.out + 1 > 2
                              ? prev.isOffense == 1
                                ? 0
                                : 1
                              : prev.isOffense,
                          isTop: prev.out + 1 > 2 ? !prev.isTop : prev.isTop,
                          inning: inning,
                        };
                      });
                    } else {
                      toast.show(
                        "Không có runner ở chốt 2 để thực hiện cập nhật",
                        {
                          type: "warn",
                          placement: "bottom",
                          duration: 4000,
                          offset: 30,
                          animationType: "zoom-in",
                        }
                      );
                    }
                  }}
                >
                  <Text style={styles.textButton}>Cướp chốt 3 thất bại</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    setSecondRunnerStatusVisible(false);
                    let des = "";
                    let newBatting = myBatting;
                    if (atBat.isRunnerSecond && !atBat.isRunnerThird) {
                      if (atBat.isOffense === 1) {
                        des = `#${atBat.isRunnerSecond.player.jerseyNumber}.${atBat.isRunnerSecond.player.firstName} ${atBat.isRunnerSecond.player.lastName} lên chốt 3 do pitcher balk`;
                      } else {
                        des = "Runner B2 đối phương lên chốt 3 do pitcher balk";
                        let reversedBatting = [...myBatting]
                          .reverse()
                          .reverse();
                        let pitcher = reversedBatting.find(
                          (p) => p.position === 1
                        );
                        newBatting = updatePitcherStat(
                          pitcher,
                          null,
                          0,
                          0,
                          0,
                          0,
                          0,
                          1,
                          0,
                          0,
                          0
                        );
                      }
                      setAtBatsList((prev) => [
                        ...prev,
                        {
                          ...atBat,
                          isLastState: false,
                          description: des,
                        },
                      ]);
                      setNotSavedAtBats((prev) => [
                        ...prev,
                        {
                          ...atBat,
                          isLastState: false,
                          id: null,
                          description: des,
                        },
                      ]);
                      setFutureState([]);
                      setRecoilAtBatStatus((prev) => {
                        let newArray = [...prev];
                        return [
                          ...newArray,
                          { atBat: atBat, myBatting: newBatting },
                        ];
                      });
                      setPastState(() => {
                        if (Array.isArray(pastState))
                          return [...pastState, atBatStatus];
                        else return [];
                      });
                      setAtBatStatus((prev) => {
                        return {
                          atBat: {
                            ...prev.atBat,
                            ...prev,
                            isRunnerThird: prev.atBat.isRunnerSecond,
                            beforeRunnerSecond: prev.atBat.isRunnerSecond,
                            isRunnerSecond: null,
                          },
                          myBatting: newBatting,
                        };
                      });
                      setAtBat((prev) => {
                        setTempRunnerThird(prev.isRunnerSecond);
                        setTempRunnerSecond(null);
                        return {
                          ...prev,
                          isRunnerThird: prev.isRunnerSecond,
                          beforeRunnerFirst: prev.isRunnerFirst,
                          isRunnerSecond: null,
                        };
                      });
                    } else if (!atBat.isRunnerFirst) {
                      toast.show(
                        "Không có runner ở chốt 2 để thực hiện cập nhật",
                        {
                          type: "warn",
                          placement: "bottom",
                          duration: 4000,
                          offset: 30,
                          animationType: "zoom-in",
                        }
                      );
                    } else if (atBat.isRunnerSecond) {
                      toast.show(
                        "Vì chốt 3 đã có runner nên không thể thực hiện cập nhật. Hãy cập nhật trạng thái của runner ở chốt 3 trước",
                        {
                          type: "warn",
                          placement: "bottom",
                          duration: 4000,
                          offset: 30,
                          animationType: "zoom-in",
                        }
                      );
                    }
                  }}
                >
                  <Text style={styles.textButton}>
                    Lên chốt 3 do pitcher balk
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    if (atBat.isRunnerSecond) {
                      setSecondRunnerStatusVisible(false);
                      let des = "";
                      let newBatting = myBatting;
                      if (atBat.isOffense === 1) {
                        des = `#${atBat.isRunnerSecond.player.jerseyNumber}.${atBat.isRunnerSecond.player.firstName} ${atBat.isRunnerSecond.player.lastName} out vì bị pickoff ở chốt 2`;
                      } else {
                        des = "Runner B2 đối phương out vì bị pickoff ở chốt 2";
                        let reversedBatting = [...myBatting]
                          .reverse()
                          .reverse();
                        let pitcher = reversedBatting.find(
                          (p) => p.position === 1
                        );
                        newBatting = updatePitcherStat(
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
                          1
                        );
                      }
                      setAtBatsList((prev) => [
                        ...prev,
                        {
                          ...atBat,
                          isLastState: false,
                          description: des,
                        },
                      ]);

                      setNotSavedAtBats((prev) => [
                        ...prev,
                        {
                          ...atBat,
                          isLastState: false,
                          id: null,
                          description: des,
                        },
                      ]);
                      setFutureState([]);
                      setRecoilAtBatStatus((prev) => {
                        let newArray = [...prev];
                        return [
                          ...newArray,
                          { atBat: atBat, myBatting: newBatting },
                        ];
                      });
                      setPastState(() => {
                        if (Array.isArray(pastState))
                          return [...pastState, atBatStatus];
                        else return [];
                      });
                      setAtBatStatus((prev) => {
                        let inning = prev.atBat.inning;
                        if (!prev.atBat.isTop && prev.atBat.out + 1 > 2)
                          inning++;
                        let newAtBat = {
                          ...prev.atBat,
                          isRunnerSecond: null,
                          isRunnerFirst:
                            prev.atBat.out + 1 > 2
                              ? null
                              : prev.atBat.isRunnerFirst,
                          isRunnerThird:
                            prev.atBat.out + 1 > 2
                              ? null
                              : prev.atBat.isRunnerThird,
                          out: prev.atBat.out + 1 > 2 ? 0 : prev.atBat.out + 1,
                          isOffense:
                            prev.atBat.out + 1 > 2
                              ? prev.atBat.isOffense == 1
                                ? 0
                                : 1
                              : prev.atBat.isOffense,
                          isTop:
                            prev.atBat.out + 1 > 2
                              ? !prev.atBat.isTop
                              : prev.atBat.isTop,
                          inning: inning,
                        };
                        return { atBat: newAtBat, myBatting: newBatting };
                      });

                      setAtBat((prev) => {
                        setTempRunnerSecond(null);
                        if (prev.out + 1 > 2) {
                          setTempRunnerFirst(null);
                          setTempRunnerThird(null);
                        }
                        let inning = prev.inning;
                        if (!prev.isTop && prev.out + 1 > 2) inning++;
                        return {
                          ...prev,
                          isRunnerSecond: null,
                          isRunnerFirst:
                            prev.out + 1 > 2 ? null : prev.isRunnerFirst,
                          isRunnerThird:
                            prev.out + 1 > 2 ? null : prev.isRunnerThird,
                          out: prev.out + 1 > 2 ? 0 : prev.out + 1,
                          isOffense:
                            prev.out + 1 > 2
                              ? prev.isOffense == 1
                                ? 0
                                : 1
                              : prev.isOffense,
                          isTop: prev.out + 1 > 2 ? !prev.isTop : prev.isTop,
                          inning: inning,
                        };
                      });
                    } else {
                      toast.show(
                        "Không có runner ở chốt 2 để thực hiện cập nhật",
                        {
                          type: "warn",
                          placement: "bottom",
                          duration: 4000,
                          offset: 30,
                          animationType: "zoom-in",
                        }
                      );
                    }
                  }}
                >
                  <Text style={styles.textButton}>Out vì bị pickoff</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Button
              title="Close"
              onPress={() => setSecondRunnerStatusVisible(false)}
            />
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={thirdRunnerStatusVisible}
        onRequestClose={() => {
          setThirdRunnerStatusVisible(!thirdRunnerStatusVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>
              Cập nhật tình hình runner ở B3
            </Text>
            <View style={styles.modalButtonList}>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    setThirdRunnerStatusVisible(false);
                    setThirdRunnerStatusVisible(false);
                    let des = "";
                    let newBatting = myBatting;
                    if (atBat.isRunnerThird) {
                      if (atBat.isOffense === 1) {
                        des = `#${atBat.isRunnerThird.player.jerseyNumber}.${atBat.isRunnerThird.player.firstName} ${atBat.isRunnerThird.player.lastName} cướp home thành công. #${atBat.isRunnerThird.player.jerseyNumber}.${atBat.isRunnerThird.player.firstName} ${atBat.isRunnerThird.player.lastName} ghi điểm`;
                        newBatting = updateBatterStat(
                          atBat.isRunnerThird,
                          null,
                          0,
                          1,
                          1,
                          0,
                          true
                        );
                      } else {
                        des =
                          "Runner B3 đối phương cướp home thành công. Runner B3 ghi điểm";
                        let reversedBatting = [...myBatting]
                          .reverse()
                          .reverse();
                        let pitcher = reversedBatting.find(
                          (p) => p.position === 1
                        );
                        newBatting = updatePitcherStat(
                          pitcher,
                          null,
                          0,
                          0,
                          0,
                          1,
                          Array.isArray(atBat.isRunnerThird) ? 0 : 1,
                          0,
                          0,
                          0,
                          0
                        );
                      }
                      setAtBatsList((prev) => [
                        ...prev,
                        {
                          ...atBat,
                          isLastState: false,
                          description: des,
                        },
                      ]);
                      setNotSavedAtBats((prev) => [
                        ...prev,
                        {
                          ...atBat,
                          isLastState: false,
                          id: null,
                          description: des,
                        },
                      ]);
                      setFutureState([]);
                      setRecoilAtBatStatus((prev) => {
                        let newArray = [...prev];
                        return [
                          ...newArray,
                          { atBat: atBat, myBatting: newBatting },
                        ];
                      });
                      setPastState(() => {
                        if (Array.isArray(pastState))
                          return [...pastState, atBatStatus];
                        else return [];
                      });
                      setAtBatStatus((prev) => {
                        return {
                          atBat: {
                            ...prev.atBat,
                            isRunnerThird: null,
                            beforeRunnerThird: prev.atBat.isRunnerThird,
                            teamScore:
                              prev.atBat.isOffense === 1
                                ? prev.atBat.teamScore + 1
                                : prev.atBat.teamScore,
                            oppScore:
                              prev.atBat.isOffense === 0
                                ? prev.atBat.oppScore + 1
                                : prev.atBat.oppScore,
                          },
                          myBatting: newBatting,
                        };
                      });
                      setAtBat((prev) => {
                        setTempRunnerThird(null);
                        return {
                          ...prev,
                          isRunnerThird: null,
                          beforeRunnerThird: prev.isRunnerThird,
                          teamScore:
                            prev.isOffense === 1
                              ? prev.teamScore + 1
                              : prev.teamScore,
                          oppScore:
                            prev.isOffense === 0
                              ? prev.oppScore + 1
                              : prev.oppScore,
                        };
                      });
                    } else {
                      toast.show(
                        "Không có runner ở chốt 3 để thực hiện cập nhật",
                        {
                          type: "warn",
                          placement: "bottom",
                          duration: 4000,
                          offset: 30,
                          animationType: "zoom-in",
                        }
                      );
                    }
                  }}
                >
                  <Text style={styles.textButton}>Cướp home thành công</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    if (atBat.isRunnerThird) {
                      setThirdRunnerStatusVisible(false);
                      let des = "";
                      if (atBat.isOffense === 1) {
                        des = `#${atBat.isRunnerThird.player.jerseyNumber}.${atBat.isRunnerThird.player.firstName} ${atBat.isRunnerThird.player.lastName} cướp home thất bại`;
                      } else {
                        des = "Runner B3 đối phương cướp home thất bại";
                      }
                      setAtBatsList((prev) => [
                        ...prev,
                        {
                          ...atBat,
                          isLastState: false,
                          description: des,
                        },
                      ]);
                      setNotSavedAtBats((prev) => [
                        ...prev,
                        {
                          ...atBat,
                          isLastState: false,
                          id: null,
                          description: des,
                        },
                      ]);
                      setFutureState([]);
                      setRecoilAtBatStatus((prev) => {
                        let newArray = [...prev];
                        return [
                          ...newArray,
                          { atBat: atBat, myBatting: myBatting },
                        ];
                      });
                      setPastState(() => {
                        if (Array.isArray(pastState))
                          return [...pastState, atBatStatus];
                        else return [];
                      });
                      setAtBatStatus((prev) => {
                        let inning = prev.atBat.inning;
                        if (!prev.atBat.isTop && prev.atBat.out + 1 > 2)
                          inning++;
                        let newAtBat = {
                          ...prev.atBat,
                          isRunnerThird: null,
                          beforeRunnerSecond: prev.atBat.isRunnerSecond,
                          isRunnerFirst:
                            prev.atBat.out + 1 > 2
                              ? null
                              : prev.atBat.isRunnerFirst,
                          isRunnerSecond:
                            prev.atBat.out + 1 > 2
                              ? null
                              : prev.atBat.isRunnerThird,
                          out: prev.atBat.out + 1 > 2 ? 0 : prev.atBat.out + 1,
                          isOffense:
                            prev.atBat.out + 1 > 2
                              ? prev.atBat.isOffense == 1
                                ? 0
                                : 1
                              : prev.atBat.isOffense,
                          isTop:
                            prev.atBat.out + 1 > 2
                              ? !prev.atBat.isTop
                              : prev.atBat.isTop,
                          inning: inning,
                        };
                        return { atBat: newAtBat, myBatting: myBatting };
                      });
                      setAtBat((prev) => {
                        setTempRunnerThird(null);
                        if (prev.out + 1 > 2) {
                          setTempRunnerFirst(null);
                          setTempRunnerSecond(null);
                        }
                        let inning = prev.inning;
                        if (!prev.isTop && prev.out + 1 > 2) inning++;
                        return {
                          ...prev,
                          isRunnerThird: null,
                          beforeRunnerSecond: prev.isRunnerSecond,
                          isRunnerFirst:
                            prev.out + 1 > 2 ? null : prev.isRunnerFirst,
                          isRunnerSecond:
                            prev.out + 1 > 2 ? null : prev.isRunnerThird,
                          out: prev.out + 1 > 2 ? 0 : prev.out + 1,
                          isOffense:
                            prev.out + 1 > 2
                              ? prev.isOffense == 1
                                ? 0
                                : 1
                              : prev.isOffense,
                          isTop: prev.out + 1 > 2 ? !prev.isTop : prev.isTop,
                          inning: inning,
                        };
                      });
                    } else {
                      toast.show(
                        "Không có runner ở chốt 3 để thực hiện cập nhật",
                        {
                          type: "warn",
                          placement: "bottom",
                          duration: 4000,
                          offset: 30,
                          animationType: "zoom-in",
                        }
                      );
                    }
                  }}
                >
                  <Text style={styles.textButton}>Cướp home thất bại</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  disabled={atBat.isRunnerSecond ? false : true}
                  style={styles.modelButton}
                  onPress={() => {
                    setThirdRunnerStatusVisible(false);
                    let des = "";
                    let newBatting = myBatting;
                    if (atBat.isRunnerThird) {
                      if (atBat.isOffense === 1) {
                        des = `#${atBat.isRunnerThird.player.jerseyNumber}.${atBat.isRunnerThird.player.firstName} ${atBat.isRunnerThird.player.lastName} về home do pitcher balk. #${atBat.isRunnerThird.player.jerseyNumber}.${atBat.isRunnerThird.player.firstName} ${atBat.isRunnerThird.player.lastName} ghi điểm`;
                        newBatting = updateBatterStat(
                          atBat.isRunnerThird,
                          null,
                          0,
                          1,
                          0,
                          0,
                          true
                        );
                      } else {
                        des =
                          "Runner B3 đối phương về home do pitcher balk. Runner B3 ghi điểm";
                        let reversedBatting = [...myBatting]
                          .reverse()
                          .reverse();
                        let pitcher = reversedBatting.find(
                          (p) => p.position === 1
                        );
                        newBatting = updatePitcherStat(
                          pitcher,
                          null,
                          0,
                          0,
                          0,
                          1,
                          Array.isArray(atBat.isRunnerThird) ? 0 : 1,
                          1,
                          0,
                          0,
                          0
                        );
                      }
                      setAtBatsList((prev) => [
                        ...prev,
                        {
                          ...atBat,
                          isLastState: false,
                          description: des,
                        },
                      ]);
                      setNotSavedAtBats((prev) => [
                        ...prev,
                        {
                          ...atBat,
                          isLastState: false,
                          id: null,
                          description: des,
                        },
                      ]);
                      setFutureState([]);
                      setRecoilAtBatStatus((prev) => {
                        let newArray = [...prev];
                        return [
                          ...newArray,
                          { atBat: atBat, myBatting: newBatting },
                        ];
                      });
                      setPastState(() => {
                        if (Array.isArray(pastState))
                          return [...pastState, atBatStatus];
                        else return [];
                      });
                      setAtBatStatus((prev) => {
                        return {
                          atBat: {
                            ...prev.atBat,
                            isRunnerThird: null,
                            beforeRunnerThird: prev.atBat.isRunnerThird,
                            teamScore:
                              prev.atBat.isOffense === 1
                                ? prev.atBat.teamScore + 1
                                : prev.atBat.teamScore,
                            oppScore:
                              prev.atBat.isOffense === 0
                                ? prev.atBat.oppScore + 1
                                : prev.atBat.oppScore,
                          },
                          myBatting: newBatting,
                        };
                      });
                      setAtBat((prev) => {
                        setTempRunnerThird(null);
                        return {
                          ...prev,
                          isRunnerThird: null,
                          beforeRunnerThird: prev.isRunnerThird,
                          teamScore:
                            prev.isOffense === 1
                              ? prev.teamScore + 1
                              : prev.teamScore,
                          oppScore:
                            prev.isOffense === 0
                              ? prev.oppScore + 1
                              : prev.oppScore,
                        };
                      });
                    } else {
                      toast.show(
                        "Không có runner ở chốt 3 để thực hiện cập nhật",
                        {
                          type: "warn",
                          placement: "bottom",
                          duration: 4000,
                          offset: 30,
                          animationType: "zoom-in",
                        }
                      );
                    }
                  }}
                >
                  <Text style={styles.textButton}>Về home do pitcher balk</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modelButton}
                  onPress={() => {
                    if (atBat.isRunnerThird) {
                      setThirdRunnerStatusVisible(false);
                      let des = "";
                      let newBatting = myBatting;
                      if (atBat.isOffense === 1) {
                        des = `#${atBat.isRunnerThird.player.jerseyNumber}.${atBat.isRunnerThird.player.firstName} ${atBat.isRunnerThird.player.lastName} out vì bị pickoff ở chốt 3`;
                      } else {
                        des = "Runner B3 đối phương out vì bị pickoff ở chốt 3";
                        let reversedBatting = [...myBatting]
                          .reverse()
                          .reverse();
                        let pitcher = reversedBatting.find(
                          (p) => p.position === 1
                        );
                        newBatting = updatePitcherStat(
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
                          1
                        );
                      }
                      setAtBatsList((prev) => [
                        ...prev,
                        {
                          ...atBat,
                          isLastState: false,
                          description: des,
                        },
                      ]);

                      setNotSavedAtBats((prev) => [
                        ...prev,
                        {
                          ...atBat,
                          isLastState: false,
                          id: null,
                          description: des,
                        },
                      ]);
                      setFutureState([]);
                      setRecoilAtBatStatus((prev) => {
                        let newArray = [...prev];
                        return [
                          ...newArray,
                          { atBat: atBat, myBatting: newBatting },
                        ];
                      });
                      setPastState(() => {
                        if (Array.isArray(pastState))
                          return [...pastState, atBatStatus];
                        else return [];
                      });
                      setAtBatStatus((prev) => {
                        let inning = prev.atBat.inning;
                        if (!prev.atBat.isTop && prev.atBat.out + 1 > 2)
                          inning++;
                        let newAtBat = {
                          ...prev.atBat,
                          isRunnerThird: null,
                          beforeRunnerSecond: prev.atBat.isRunnerSecond,
                          isRunnerFirst:
                            prev.atBat.out + 1 > 2
                              ? null
                              : prev.atBat.isRunnerFirst,
                          isRunnerSecond:
                            prev.atBat.out + 1 > 2
                              ? null
                              : prev.atBat.isRunnerThird,
                          out: prev.atBat.out + 1 > 2 ? 0 : prev.atBat.out + 1,
                          isOffense:
                            prev.atBat.out + 1 > 2
                              ? prev.atBat.isOffense == 1
                                ? 0
                                : 1
                              : prev.atBat.isOffense,
                          isTop:
                            prev.atBat.out + 1 > 2
                              ? !prev.atBat.isTop
                              : prev.atBat.isTop,
                          inning: inning,
                        };
                        return { atBat: newAtBat, myBatting: newBatting };
                      });

                      setAtBat((prev) => {
                        setTempRunnerThird(null);
                        if (prev.out + 1 > 2) {
                          setTempRunnerFirst(null);
                          setTempRunnerSecond(null);
                        }
                        let inning = prev.inning;
                        if (!prev.isTop && prev.out + 1 > 2) inning++;
                        return {
                          ...prev,
                          isRunnerThird: null,
                          isRunnerFirst:
                            prev.out + 1 > 2 ? null : prev.isRunnerFirst,
                          isRunnerSecond:
                            prev.out + 1 > 2 ? null : prev.isRunnerThird,
                          out: prev.out + 1 > 2 ? 0 : prev.out + 1,
                          isOffense:
                            prev.out + 1 > 2
                              ? prev.isOffense == 1
                                ? 0
                                : 1
                              : prev.isOffense,
                          isTop: prev.out + 1 > 2 ? !prev.isTop : prev.isTop,
                          inning: inning,
                        };
                      });
                    } else {
                      toast.show(
                        "Không có runner ở chốt 3 để thực hiện cập nhật",
                        {
                          type: "warn",
                          placement: "bottom",
                          duration: 4000,
                          offset: 30,
                          animationType: "zoom-in",
                        }
                      );
                    }
                  }}
                >
                  <Text style={styles.textButton}>Out vì bị pickoff</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Button
              title="Close"
              onPress={() => setThirdRunnerStatusVisible(false)}
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
                  {myBatting ? (
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
                      {myBatting.find((obj) => obj.position === posNumber)
                        ? myBatting.find((obj) => obj.position === posNumber)
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
                disabled={
                  (posNumber === 11 && !atBat.isRunnerFirst) ||
                  (posNumber === 12 && !atBat.isRunnerSecond) ||
                  (posNumber === 13 && !atBat.isRunnerThird)
                }
                onPress={() => {
                  setPos(
                    posNumber === 13
                      ? atBat.isRunnerThird.position
                      : posNumber === 12
                      ? atBat.isRunnerSecond.position
                      : atBat.isRunnerFirst.position
                  );
                  setPosRun(posNumber);
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
                      ? !atBat.isRunnerFirst
                        ? null
                        : atBat.isRunnerFirst.player.jerseyNumber
                      : posNumber === 12
                      ? !atBat.isRunnerSecond
                        ? null
                        : atBat.isRunnerSecond.player.jerseyNumber
                      : !atBat.isRunnerThird
                      ? null
                      : atBat.isRunnerThird.player.jerseyNumber}
                  </Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View
          style={{
            position: "absolute",
            bottom: 50,
            left: 20,
            flexDirection: "row",
          }}
        >
          <Button style={styles.button} title="Undo" onPress={() => undo()} />
          <Button style={styles.button} title="Redo" onPress={() => redo()} />
        </View>
        <View
          style={{
            position: "absolute",
            bottom: 50,
            right: 20,
            flexDirection: "row",
          }}
        >
          <Menu>
            <MenuTrigger>
              <FontAwesome5 name="running" size={30} color="black" />
            </MenuTrigger>
            <MenuOptions>
              <MenuOption
                onSelect={() => {
                  setFirstRunnerStatusVisible(true);
                }}
              >
                <Text>Cập nhật tình hình runner B1</Text>
              </MenuOption>
              <MenuOption
                onSelect={() => {
                  setSecondRunnerStatusVisible(true);
                }}
              >
                <Text>Cập nhật tình hình runner B2</Text>
              </MenuOption>
              <MenuOption
                onSelect={() => {
                  setThirdRunnerStatusVisible(true);
                }}
              >
                <Text>Cập nhật tình hình runner B3</Text>
              </MenuOption>
            </MenuOptions>
          </Menu>
        </View>
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
            <Text style={styles.content}>
              {[...myBatting].find((p) => p.position === 1).totalInGameOut === 0
                ? [...myBatting].find((p) => p.position === 1).earnedRun !== 0
                  ? "INF"
                  : "-"
                : (
                    ([...myBatting].find((p) => p.position === 1).earnedRun *
                      game.inningERA *
                      3) /
                    [...myBatting].find((p) => p.position === 1).totalInGameOut
                  ).toFixed(2)}
            </Text>
          </View>
          <View>
            <Text style={styles.title}>Count</Text>
            <Text style={styles.content}>
              {[...myBatting].find((p) => p.position === 1).pitchStrike +
                [...myBatting].find((p) => p.position === 1).pitchBall}
            </Text>
          </View>
        </View>
      )}
      <View style={styles.buttonRow}>
        <Button
          style={styles.button}
          title="Ball"
          onPress={() => {
            let newBatting = myBatting;
            if (atBat.ball < 3) {
              if (atBat.isOffense !== 1) {
                let pitcher = [...myBatting]
                  .reverse()
                  .find((p) => p.position === 1);
                newBatting = updatePitcherStat(
                  pitcher,
                  null,
                  1,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0,
                  0
                );
              }
              setFutureState([]);
              setRecoilAtBatStatus((prev) => {
                let newArray = [...prev];
                return [...newArray, { atBat: atBat, myBatting: newBatting }];
              });
              setPastState(() => {
                if (Array.isArray(pastState))
                  return [...pastState, atBatStatus];
                else return [];
              });
              setAtBatStatus({
                atBat: { ...atBat, ball: atBat.ball + 1 },
                myBatting: newBatting,
              });
              setAtBatsList((prev) => [
                ...prev,
                {
                  ...atBat,
                  isLastState: false,
                  ball: atBat.ball + 1,
                  isLastState: false,
                  description: "Ball",
                  inTheAtBat: true,
                },
              ]);
              setNotSavedAtBats((prev) => [
                ...prev,
                {
                  ...atBat,
                  isLastState: false,
                  ball: atBat.ball + 1,
                  id: null,
                  description: "Ball",
                  inTheAtBat: true,
                },
              ]);
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
            let newBatting = myBatting;
            if (atBat.strike < 2) {
              if (atBat.isOffense !== 1) {
                let pitcher = [...myBatting]
                  .reverse()
                  .find((p) => p.position === 1);
                newBatting = updatePitcherStat(
                  pitcher,
                  null,
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
              setFutureState([]);
              setRecoilAtBatStatus((prev) => {
                let newArray = [...prev];
                return [...newArray, { atBat: atBat, myBatting: newBatting }];
              });
              setPastState(() => {
                if (Array.isArray(pastState))
                  return [...pastState, atBatStatus];
                else return [];
              });
              setAtBatStatus({
                atBat: { ...atBat, strike: atBat.strike + 1 },
                myBatting: newBatting,
              });
              setAtBatsList((prev) => [
                ...prev,
                {
                  ...atBat,
                  strike: atBat.strike + 1,
                  isLastState: false,
                  description: "Strike",
                  inTheAtBat: true,
                },
              ]);
              setNotSavedAtBats((prev) => [
                ...prev,
                {
                  ...atBat,
                  isLastState: false,
                  strike: atBat.strike + 1,
                  id: null,
                  description: "Strike",
                  inTheAtBat: true,
                },
              ]);

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
            let newBatting = myBatting;
            if (atBat.isOffense !== 1) {
              let pitcher = [...myBatting]
                .reverse()
                .find((p) => p.position === 1);
              newBatting = updatePitcherStat(
                pitcher,
                null,
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
            setAtBatsList((prev) => [
              ...prev,
              {
                ...atBat,
                strike: atBat.strike < 2 ? atBat.strike + 1 : atBat.strike,
                isLastState: false,
                description: "Foul",
                inTheAtBat: true,
              },
            ]);
            setFutureState([]);
            setRecoilAtBatStatus((prev) => {
              let newArray = [...prev];
              return [...newArray, { atBat: atBat, myBatting: newBatting }];
            });
            setPastState(() => {
              if (Array.isArray(pastState)) return [...pastState, atBatStatus];
              else return [];
            });
            setAtBatStatus({
              atBat: {
                ...atBat,
                strike: atBat.strike < 2 ? atBat.strike + 1 : atBat.strike,
              },
              myBatting: newBatting,
            });
            setNotSavedAtBats((prev) => [
              ...prev,
              {
                ...atBat,
                isLastState: false,
                strike: atBat.strike < 2 ? atBat.strike + 1 : atBat.strike,
                id: null,
                description: "Foul",
                inTheAtBat: true,
              },
            ]);
            if (atBat.strike < 2) {
              setAtBat((prev) => {
                return { ...prev, strike: prev.strike + 1 };
              });
            }
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
            <MenuOption
              onSelect={() => {
                navigation.navigate("PlayByPlayList", {
                  gameid: gameid,
                  teamName: teamName,
                });
              }}
            >
              <Text>Play by play</Text>
            </MenuOption>
            <MenuOption
              onSelect={() => {
                let offData = [];
                let myBattingAll = myBatting
                  .filter((obj) => obj.battingOrder !== 10)
                  .map((obj, index) => ({ ...obj, index }))
                  .sort((a, b) => {
                    if (a.battingOrder === b.battingOrder) {
                      return b.index - a.index;
                    }
                    return a.battingOrder - b.battingOrder;
                  });

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
                  let posString = "";
                  obj.playedPos.forEach((pos, index) => {
                    if (index < obj.playedPos.length - 1)
                      posString += positionStr[pos] + "-";
                    else posString += positionStr[pos];
                  });
                  offData.push([
                    `${obj.battingOrder}.#${obj.player.jerseyNumber}.${obj.player.lastName}  ${posString}`,
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
                navigation.navigate("BattingStat", {
                  offData: offData,
                  game: game,
                  teamName: teamName,
                });
              }}
            >
              <Text>Thống kê Batting</Text>
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
                  console.log(obj.totalInGameOut);
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
                navigation.navigate("PitchingStat", {
                  pitchData: pitchData.reverse(),
                  game: game,
                });
              }}
            >
              <Text>Thống kê Pitching</Text>
            </MenuOption>
            <MenuOption
              onSelect={() => {
                Alert.alert(
                  "Lưu dữ liệu",
                  "Bạn có chắc chắn muốn lưu dữ liệu lên server? Sau khi lưu bạn sẽ không thể hoàn tác lại các trạng thái trước đó.",
                  [
                    {
                      text: "No",
                      style: "cancel",
                    },
                    {
                      text: "Yes",
                      onPress: () => {
                        console.log("Yes Pressed");
                        if (notSavedAtBats.length > 0) saveNotSavedAtBats();
                        saveMyBatting();
                      },
                    },
                  ],
                  { cancelable: false }
                );
              }}
            >
              <Text>Lưu trạng thái lên server</Text>
            </MenuOption>
            <MenuOption
              onSelect={() => {
                Alert.alert(
                  "Kết thúc trận đấu",
                  "Bạn có chắc chắn muốn kết thúc trận đấu? Sau khi kết thúc dữ liệu sẽ được lưu lên server và bạn sẽ không thể hoàn tác lại các trạng thái trước đó.",
                  [
                    {
                      text: "No",
                      style: "cancel",
                    },
                    {
                      text: "Yes",
                      onPress: () => {
                        saveNotSavedAtBats();
                        saveMyBatting();
                        makeEndGame();
                      },
                    },
                  ],
                  { cancelable: false }
                );
              }}
            >
              <Text>Kết thúc trận đấu</Text>
            </MenuOption>
          </MenuOptions>
        </Menu>
      </View>
      <BottomSheet
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        ref={choosePlayerBottomSheet}
        index={-1}
      >
        <BottomSheetFlatList
          data={players}
          renderItem={({ item }) => (
            <ChoosePlayerItem
              player={item}
              pos={pos}
              gameid={gameid}
              ingame={true}
              functions={[myBatting, setMyBatting]}
              functionsAB={[atBat, setAtBat]}
              functionABS={[atBatStatus, setAtBatStatus]}
              posRun={posRun}
              isOffense={atBat.isOffense}
            />
          )}
        />
      </BottomSheet>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
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
    marginHorizontal: 10,
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});

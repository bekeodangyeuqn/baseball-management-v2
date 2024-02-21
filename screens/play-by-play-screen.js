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
  const playersPos = {
    Outfield: [7, 8, 9],
    Infield: [5, 6, 4, 3],
    P: [1],
    DH: [0],
    C: [2],
  };
  const [outModalVisible, setOutModalVisible] = useState(false);
  const [safeModalVisible, setSafeModalVisible] = useState(false);

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
  const [teamid, setTeamid] = useState(null);
  const players = useRecoilValue(filteredPlayers(teamid));
  const game = useRecoilValue(gameByIdState(gameid));
  const navigation = useNavigation();
  const myPlayers = useRecoilValue(myGamePlayersByGameId(gameid));
  const myBatting = useRecoilValue(myBattingOrder(gameid));
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
  const [isRunnerFirst, setIsRunnerFirst] = useState(-1);
  const [isRunnerSecond, setIsRunnerSecond] = useState(-1);
  const [isRunnerThird, setIsRunnerThird] = useState(-1);
  const [currentPlayer, setCurrentPlayer] = useState(1);
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
  console.log(isOffense);

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
        return isRunnerFirst !== -1;
      case 12:
        return isRunnerSecond !== -1;
      case 13:
        return isRunnerThird !== -1;
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
                <TouchableOpacity style={styles.modelButton}>
                  <Text style={styles.textButton}>Strikeout Looking</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modelButton}>
                  <Text style={styles.textButton}>Strikeout Swinging</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity style={styles.modelButton}>
                  <Text style={styles.textButton}>Groundout</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modelButton}>
                  <Text style={styles.textButton}>Pop/Flyout</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity style={styles.modelButton}>
                  <Text style={styles.textButton}>Sacrifice Fly</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modelButton}>
                  <Text style={styles.textButton}>Sacrifice Bunt</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity style={styles.modelButton}>
                  <Text style={styles.textButton}>Infield Fly</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modelButton}>
                  <Text style={styles.textButton}>Dropped 3rd strike</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity style={styles.modelButton}>
                  <Text style={styles.textButton}>Double Play</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modelButton}>
                  <Text style={styles.textButton}>Triple Play</Text>
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
                <TouchableOpacity style={styles.modelButton}>
                  <Text style={styles.textButton}>Walk</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modelButton}>
                  <Text style={styles.textButton}>Intentional walk</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity style={styles.modelButton}>
                  <Text style={styles.textButton}>Single</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modelButton}>
                  <Text style={styles.textButton}>Double</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity style={styles.modelButton}>
                  <Text style={styles.textButton}>Triple</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modelButton}>
                  <Text style={styles.textButton}>Homerun</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity style={styles.modelButton}>
                  <Text style={styles.textButton}>Error</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modelButton}>
                  <Text style={styles.textButton}>Hit by pitch</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity style={styles.modelButton}>
                  <Text style={styles.textButton}>Fielder choice</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modelButton}>
                  <Text style={styles.textButton}>Catcher interference</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Button title="Close" onPress={() => setSafeModalVisible(false)} />
          </View>
        </View>
      </Modal>
      <View style={styles.scoreBoard} elevation={5}>
        <View style={styles.scoreBoardTeam}>
          <Text style={{ fontWeight: "bold" }}>{teamName}</Text>
          <Text>{teamScore}</Text>
        </View>
        <View style={styles.scoreBoardTeam}>
          <Text style={{ fontWeight: "bold" }}>{game.oppTeamShort}</Text>
          <Text>{oppScore}</Text>
        </View>
        <View
          style={{ flex: 1, flexDirection: "row", border: "1px solid black" }}
        >
          {isTop ? (
            <Entypo name="triangle-up" size={15} color="green" />
          ) : (
            <Entypo name="triangle-down" size={15} color="green" />
          )}
          <Text>{inning}</Text>
        </View>
        <View
          style={{ flex: 1, flexDirection: "row", border: "1px solid black" }}
        >
          <Text>
            {out} {out != 1 ? "OUTS" : "OUT"}
          </Text>
        </View>
        <View style={{ flex: 1, flexDirection: "column", height: 35 }}>
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
            <Text>B</Text>
            {ball >= 1 ? (
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
            {ball >= 2 ? (
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
            {ball >= 3 ? (
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
            {strike >= 1 ? (
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
            {strike >= 2 ? (
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
        {isOffense == 0 ? (
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
                  //   alignItems: "center",
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
                      ? isRunnerFirst === -1
                        ? null
                        : isRunnerFirst
                      : posNumber === 12
                      ? isRunnerSecond === -1
                        ? null
                        : isRunnerSecond
                      : isRunnerThird === -1
                      ? null
                      : isRunnerThird}
                  </Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ImageBackground>
      {isOffense == 1 ? (
        <View style={styles.batterRow}>
          <View>
            <Text style={styles.title}>STT</Text>
            <Text style={styles.content}>{currentPlayer}</Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <Image
              style={styles.image}
              resizeMode="contain"
              source={{
                uri: splitAvatarURI(myBatting[currentPlayer - 1].player.avatar),
              }}
            />
            <View>
              <Text style={styles.title}>At bat</Text>
              <Text style={styles.content}>{`${
                myBatting[currentPlayer - 1].player.jerseyNumber
              }.${myBatting[currentPlayer - 1].player.firstName} ${
                myBatting[currentPlayer - 1].player.lastName
              }`}</Text>
            </View>
          </View>
          <View>
            <Text style={styles.title}>Vị trí</Text>
            <Text style={styles.content}>
              {positionStr[myBatting[currentPlayer - 1].position]}
            </Text>
          </View>
        </View>
      ) : null}
      <View style={styles.buttonRow}>
        <Button
          style={styles.button}
          title="Ball"
          onPress={() => {
            if (ball < 3) {
              setBall(ball + 1);
              setShowBall(true);
            }
          }}
        />
        <Button
          style={styles.button}
          title="Strike"
          onPress={() => {
            if (strike < 2) {
              setStrike(strike + 1);
              setShowStrike(true);
            }
          }}
        />
        <Button
          style={styles.button}
          title="Foul"
          onPress={() => {
            if (strike < 2) {
              setStrike(strike + 1);
            }
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
    justifyContent: "space-around",
    width: "100%",
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  modelButton: {
    width: "45%",
    borderStyle: "solid",
    borderColor: "black",
    backgroundColor: "green",
    padding: 10,
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

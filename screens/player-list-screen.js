import React, { Component, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Card } from "@rneui/themed";
import axiosInstance from "../lib/axiosClient";
import { useToast } from "react-native-toast-notifications";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  filteredPlayers,
  managersAsyncSelector,
  managersState,
  playersAsyncSelector,
  playersState,
} from "../atom/Players";
import { myGamePlayers } from "../atom/GamePlayers";
import { useRecoilState } from "recoil";
import SearchBox from "../component/SearchBox";
import filter from "lodash.filter";
import EmptyList from "../component/EmptyList";
import AddIcon from "../component/AddIcon";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from "react-native-popup-menu";
import Animated, { FadeIn, Layout } from "react-native-reanimated";
import { Skeleton } from "moti/skeleton";
import { SkeletonCommonProps, placeholderList } from "../lib/skeleton";

const { width } = Dimensions.get("window");
const gap = 4;
const itemPerRow = 3;
const totalGapSize = (itemPerRow - 1) * gap;
const windowWidth = width;
const childWidth = (windowWidth - totalGapSize) / itemPerRow;

const PlayerListScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const position = ["DH", "P", "C", "1B", "2B", "3B", "SS", "OF", "None"];
  const route = useRoute();
  const teamid = route.params.teamid;
  // const players = useRecoilValue(playersAsyncSelector(teamid));
  // const managers = useRecoilValue(managersAsyncSelector(teamid));
  const [players, setPlayers] = useState();
  const [fullPlayers, setFullPlayers] = useRecoilState(playersState);

  const [managers, setManagers] = useState();
  const [fullManagers, setFullManagers] = useRecoilState(managersState);

  const navigation = useNavigation();
  const [fullData, setFullData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [numColumns, setNumColumns] = useState(3);

  useEffect(() => {
    const getInfo = async () => {
      setIsLoading(true);
      // setPlayers(undefined);
      try {
        let dataPlayers = [];
        if (fullPlayers.length === 0) {
          const { data } = await axiosInstance.get(`/players/team/${teamid}/`);
          dataPlayers = data;
          setFullPlayers(data);
          setPlayers(data);
        } else {
          dataPlayers = fullPlayers;
          setPlayers(fullPlayers);
        }

        if (fullManagers.length === 0) {
          const { data } = await axiosInstance.get(`/managers/team/${teamid}/`);
          setFullManagers(data);
          setManagers(data);
          setFullData([...dataPlayers, ...data]);
        } else {
          setManagers(fullManagers);
          setFullData([...dataPlayers, ...fullManagers]);
        }
        setIsLoading(false);
      } catch (error) {
        toast.show(error.message, {
          type: "danger",
          placement: "bottom",
          duration: 4000,
          offset: 30,
          animationType: "zoom-in",
        });
      } finally {
        setIsLoading(false);
      }
    };
    getInfo().catch((error) => console.error(error));
  }, []);

  const splitAvatarURI = (str) => {
    const arr = str.split("?");
    return arr[0];
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const fomartedQuery = query.toLowerCase();
    console.log("Query: " + fomartedQuery);
    const filteredPlayers = filter(fullPlayers, (player) => {
      return contain(player, fomartedQuery);
    });
    const filteredManagers = filter(fullManagers, (manager) => {
      return contain(manager, fomartedQuery);
    });
    setPlayers(filteredPlayers);
    setManagers(filteredManagers);
  };

  const contain = (query, fomartedQuery) => {
    return (
      query.firstName.toLowerCase().includes(fomartedQuery) ||
      query.lastName.toLowerCase().includes(fomartedQuery)
    );
  };
  return (
    <View>
      <View style={{ marginVertical: 20 }}>
        <SearchBox
          searchQuery={searchQuery}
          handleSearch={(query) => handleSearch(query)}
        />
        <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>
          Danh sách cầu thủ
        </Text>

        <FlatList
          data={players ?? placeholderList}
          key={numColumns}
          ListEmptyComponent={<EmptyList />}
          numColumns={numColumns}
          scrollEnabled={true}
          renderItem={({ item, index }) => {
            return (
              <TouchableOpacity
                style={styles.singleItem}
                key={index}
                onPress={() => {
                  if (item)
                    navigation.navigate("PlayerProfile", { id: item.id });
                }}
              >
                <Card>
                  <View style={{ position: "relative", alignItems: "center" }}>
                    <Skeleton.Group show={isLoading}>
                      <View style={{ alignItems: "center" }}>
                        <Skeleton
                          height={40}
                          width={40}
                          {...SkeletonCommonProps}
                        >
                          {item && (
                            <Animated.Image
                              layout={Layout}
                              style={{
                                height: 40,
                                width: 40,
                                alignSelf: "center",
                              }}
                              resizeMode="contain"
                              source={{
                                uri: splitAvatarURI(item.avatar),
                              }}
                            />
                          )}
                        </Skeleton>
                        <Skeleton {...SkeletonCommonProps}>
                          <Animated.Text
                            layout={Layout}
                            entering={FadeIn.duration(1500)}
                          >
                            {item && item.lastName}
                          </Animated.Text>
                        </Skeleton>
                        <Skeleton {...SkeletonCommonProps}>
                          <Animated.Text
                            layout={Layout}
                            entering={FadeIn.duration(1500)}
                          >
                            {item && item.jerseyNumber}
                          </Animated.Text>
                        </Skeleton>
                        <Skeleton {...SkeletonCommonProps}>
                          <Animated.Text
                            layout={Layout}
                            entering={FadeIn.duration(1500)}
                          >
                            {item && position[item.firstPos]}
                          </Animated.Text>
                        </Skeleton>
                      </View>
                    </Skeleton.Group>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          }}
          ListFooterComponent={() => (
            <>
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 16,
                  marginBottom: 8,
                  marginTop: 8,
                }}
              >
                Danh sách quản lý
              </Text>
              <FlatList
                data={managers ?? placeholderList}
                key={numColumns}
                ListEmptyComponent={() => <EmptyList />}
                numColumns={numColumns}
                scrollEnabled={true}
                renderItem={({ item, index }) => {
                  return (
                    <TouchableOpacity
                      style={styles.singleItem}
                      key={index}
                      onPress={() => {
                        if (item)
                          navigation.navigate("ManagerProfile", {
                            id: item.id,
                          });
                      }}
                    >
                      <Card>
                        <View
                          style={{ position: "relative", alignItems: "center" }}
                        >
                          <Skeleton.Group show={isLoading}>
                            <View style={{ alignItems: "center" }}>
                              <Skeleton
                                height={40}
                                width={40}
                                {...SkeletonCommonProps}
                              >
                                {item && (
                                  <Animated.Image
                                    layout={Layout}
                                    style={{
                                      height: 40,
                                      width: 40,
                                      alignSelf: "center",
                                    }}
                                    resizeMode="contain"
                                    source={{
                                      uri: item.avatar
                                        ? splitAvatarURI(item.avatar)
                                        : "https://cdn0.iconfinder.com/data/icons/baseball-filledoutline/64/baseball_player-user-boy-sports-avatar-profile-man-people-coach-512.png",
                                    }}
                                  />
                                )}
                              </Skeleton>
                              <Skeleton {...SkeletonCommonProps}>
                                <Animated.Text
                                  layout={Layout}
                                  entering={FadeIn.duration(1500)}
                                >
                                  {item && item.lastName}
                                </Animated.Text>
                              </Skeleton>
                              <Skeleton {...SkeletonCommonProps}>
                                <Animated.Text
                                  layout={Layout}
                                  entering={FadeIn.duration(1500)}
                                >
                                  {item && item.jerseyNumber}
                                </Animated.Text>
                              </Skeleton>
                              <Skeleton {...SkeletonCommonProps}>
                                <Animated.Text
                                  layout={Layout}
                                  entering={FadeIn.duration(1500)}
                                >
                                  {item && "Manager"}
                                </Animated.Text>
                              </Skeleton>
                            </View>
                          </Skeleton.Group>
                        </View>
                      </Card>
                    </TouchableOpacity>
                  );
                }}
              />
            </>
          )}
        />
      </View>
      <View
        style={{
          position: "absolute",
          right: 20,
          bottom: isLoading ? 50 : 100,
          zIndex: 4,
        }}
      >
        <Menu>
          <MenuTrigger>
            <AddIcon />
          </MenuTrigger>
          <MenuOptions>
            <MenuOption
              onSelect={() => {
                navigation.navigate("CreatePlayer", { teamid: teamid });
              }}
            >
              <Text>Thêm player qua form</Text>
            </MenuOption>
            <MenuOption
              onSelect={() => {
                navigation.navigate("ImportPlayer");
              }}
            >
              <Text>Import excel</Text>
            </MenuOption>
          </MenuOptions>
        </Menu>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 40,
    height: 40,
    borderRadius: 50,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  position: {
    fontSize: 16,
  },
  team: {
    fontSize: 14,
  },
  buttonHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  button: {
    marginBottom: 5,
    borderStyle: "solid",
    borderColor: "black",
    backgroundColor: "green",
    padding: 4,
    marginRight: 4,
  },
  textButton: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  itemsWrap: {
    display: "flex",
    flexDirection: "row",
    marginVertical: -(gap / 2),
    marginHorizontal: -(gap / 2),
  },
  singleItem: {
    marginHorizontal: gap / 2,
    minWidth: childWidth,
    maxWidth: childWidth,
  },
});

export default PlayerListScreen;

import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  SectionList,
  Animated,
  TouchableOpacity,
  ActivityIndicator,
  Button,
} from "react-native";
import { useRecoilState } from "recoil";
import { transactionsState } from "../atom/Transactions";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useToast } from "react-native-toast-notifications";
import axiosInstance from "../lib/axiosClient";
import Top from "../component/Top";
import Expense from "../component/Expense";
import { Easing, useSharedValue, withTiming } from "react-native-reanimated";
import Delete from "../component/Delete";
import moment from "moment/moment";
import AddIcon from "../component/AddIcon";
import AsyncStorage from "@react-native-async-storage/async-storage";
import theme, { Box, Text } from "../component/theme";
import { useTiming } from "react-native-redash";
import EmptyList from "../component/EmptyList";
import { playersState } from "../atom/Players";

const TransactionsScreen = () => {
  const [recoilTransactions, setRecoilTransactions] =
    useRecoilState(transactionsState);
  const [transactions, setTransactions] = useState([]);
  const [fullPlayers, setFullPlayers] = useRecoilState(playersState);
  const [isLoading, setIsLoading] = useState(false);
  const route = useRoute();
  const teamid = route.params.teamid;
  const toast = useToast();

  const active = new Animated.Value(0);

  const navigation = useNavigation();

  const onDelete = (id) => {};

  useEffect(() => {
    const getInfo = async () => {
      setIsLoading(true);
      try {
        if (recoilTransactions.length == 0) {
          const { data } = await axiosInstance.get(
            `/transactions/team/${teamid}/`
          );
          setTransactions(data);
          setRecoilTransactions(data);
          console.log("Transactions stored successfully");
        } else if (recoilTransactions.length > 0) {
          setTransactions(recoilTransactions);
        }
        if (fullPlayers.length == 0) {
          const { data } = await axiosInstance.get(`/players/team/${teamid}/`);
          setFullPlayers(data);
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
    getInfo();
  }, []);

  const getDate = (datetime) => {
    let dateAndTime = datetime.split("T"); // split date and time

    let date = dateAndTime[0]; // get the date
    return date;
  };

  /* Price calculations */

  const allDates = transactions
    .map(({ time }) => time)
    .filter(function (value, index, array) {
      return array.indexOf(value) == index;
    });

  const Prices = ({ ptime }) => {
    const prices = transactions
      .filter(({ time }) => getDate(time) == getDate(ptime))
      .map(({ price, type }) => {
        return type > 0 ? price : price * -1;
      });
    const sum = eval(prices.join("+"));

    return (
      <Text color="primary">{sum > 0 ? `${sum}₫` : `- ${Math.abs(sum)}₫`}</Text>
    );
  };

  const renderHeader = ({ section: { data } }) => {
    return (
      <Box
        paddingHorizontal="m"
        backgroundColor="white"
        flexDirection="row"
        justifyContent="space-between"
        borderBottomWidth={1}
        borderBottomColor="silver"
        paddingBottom="s"
        paddingTop="s"
        marginTop="m"
        borderTopRightRadius="m"
        borderTopLeftRadius="m"
      >
        <Text color="primary">{getDate(data[0].time)}</Text>
        <Prices ptime={getDate(data[0].time)} />
      </Box>
    );
  };

  useEffect(() => {
    console.log("Effect: ", active);
  }, [active]);

  const DATA = Object.values(
    transactions.reduce((acc, item) => {
      if (!acc[getDate(item.time)])
        acc[getDate(item.time)] = {
          title: getDate(item.time),
          data: [],
          price: item.price,
        };

      acc[getDate(item.time)].data.push(item);
      return acc;
    }, {})
  );

  const renderFooter = () => {
    return (
      <Box
        paddingHorizontal="m"
        backgroundColor="white"
        flexDirection="row"
        justifyContent="space-between"
        borderBottomWidth={1}
        borderBottomColor="silver"
        paddingBottom="s"
        borderBottomRightRadius="m"
        borderBottomLeftRadius="m"
      ></Box>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Top transactions={transactions} />
      <View
        style={{
          marginBottom: 8,
          marginTop: 8,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Button
          title="Danh sách đóng quỹ"
          color="green"
          onPress={() => {
            navigation.navigate("PlayerFund", { teamid: teamid });
          }}
        />
      </View>
      <Box
        flex={1}
        paddingLeft="l"
        paddingRight="l"
        paddingBottom="m"
        paddingTop="m"
      >
        <SectionList
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyList />}
          scrollEventThrottle={16}
          bounces={false}
          keyExtractor={(item, index) => item.id + index}
          renderItem={({ item }) => {
            const index = item.id;
            const player = fullPlayers.find((p) => p.id == item.player_id);
            return (
              <Animated.View
                style={{ borderRadius: 20, backgroundColor: "red" }}
              >
                <Box
                  overflow="hidden"
                  borderBottomWidth={1}
                  borderBottomColor="silver"
                  height={50}
                  position="relative"
                  backgroundColor="white"
                >
                  <Animated.View style={styles.deleteIcon}>
                    <Text>
                      <Delete />
                    </Text>
                  </Animated.View>
                  <Animated.View style={{ backgroundColor: "white" }}>
                    <Expense
                      onTap={() => {
                        active.setValue(index);
                        console.log("Tap: ", active);
                      }}
                      {...{ active, index, onDelete, item, allDates, player }}
                    >
                      <Box
                        overflow="hidden"
                        paddingHorizontal="m"
                        borderBottomWidth={1}
                        borderBottomColor="silver"
                        height={50}
                        position="relative"
                        backgroundColor="white"
                      >
                        <View style={[StyleSheet.absoluteFill, {}]}>
                          <Animated.View
                            style={{
                              justifyContent: "space-between",
                              flexDirection: "row",
                              alignItems: "center",
                              height: 50,
                              paddingHorizontal: 16,
                            }}
                          ></Animated.View>
                        </View>
                      </Box>
                    </Expense>
                  </Animated.View>
                </Box>
              </Animated.View>
            );
          }}
          renderSectionHeader={renderHeader}
          renderSectionFooter={renderFooter}
          sections={DATA}
        />
      </Box>
      <View style={{ position: "absolute", right: 20, bottom: 50, zIndex: 4 }}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("AddTransaction", { teamid: teamid })
          }
        >
          <AddIcon />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  tranItem: {
    overflow: "hidden",
    borderBottomWidth: 1,
    height: 50,
    position: "relative",
    backgroundColor: "green",
  },
  deleteIcon: {
    fontSize: 12,
    color: "white",
    fontWeight: "900",
    position: "absolute",
    height: 50,
    width: "14%",
    right: -20,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "white",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default TransactionsScreen;

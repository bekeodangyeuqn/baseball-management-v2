import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  SectionList,
  Animated,
  Text,
  TouchableOpacity,
} from "react-native";
import { useRecoilState } from "recoil";
import { transactionsState } from "../atom/Transactions";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useToast } from "react-native-toast-notifications";
import axiosInstance from "../lib/axiosClient";
import Top from "../component/Top";
import Expense from "../component/Expense";
import { withTiming } from "react-native-reanimated";
import Delete from "../component/Delete";
import moment from "moment/moment";
import AddIcon from "../component/AddIcon";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TransactionsScreen = () => {
  const [transactions, setTransactions] = useRecoilState(transactionsState);
  const [isLoading, setIsLoading] = useState(false);
  const route = useRoute();
  const teamid = route.params.teamid;
  const toast = useToast();

  const active = new Animated.Value(0);
  const transition = withTiming(active, { duration: 200 });

  const navigation = useNavigation();

  const onDelete = (id) => {};

  useEffect(() => {
    const getInfo = async () => {
      setIsLoading(true);
      try {
        const { data } = await axiosInstance.get(
          `/transactions/team/${teamid}/`
        );
        setTransactions(data);
        AsyncStorage.setItem("transactions", JSON.stringify(data), (error) => {
          if (error) {
            toast.show(error.message, {
              type: "danger",
              placement: "bottom",
              duration: 4000,
              offset: 30,
              animationType: "zoom-in",
            });
          } else {
            console.log("Transactions stored successfully.");
          }
        });
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

  /* Price calculations */

  const allDates = transactions
    .map(({ addedtime }) => addedtime)
    .filter(function (value, index, array) {
      return array.indexOf(value) == index;
    });

  const Prices = ({ time }) => {
    const prices = transactions
      .filter(({ addedtime }) => addedtime == time)
      .map(({ price }) => {
        return price;
      });
    const sum = eval(prices.join("+"));

    return (
      <Text style={{ color: "#A9A2A6" }}>
        {sum > 0 ? `₦${sum}` : `- ₦${Math.abs(sum)}`}
      </Text>
    );
  };

  const renderHeader = ({ section: { data } }) => {
    return (
      <View
        style={{
          paddingHorizontal: 16,
          backgroundColor: "white",
          flexDirection: "row",
          justifyContent: "space-between",
          borderBottomWidth: 1,
          borderBottomColor: "#F3F1F2",
          paddingBottom: 8,
          paddingTop: 8,
          marginTop: 16,
          borderTopRightRadius: 16,
          borderTopLeftRadius: 16,
        }}
      >
        <Text color="#A9A2A6">
          {moment(data[0].time, "x").format("DD MMM YYYY")}
        </Text>
        <Prices time={data[0].time} />
      </View>
    );
  };

  const renderFooter = () => {
    return (
      <View
        style={{
          paddingHorizontal: 16,
          backgroundColor: "white",
          flexDirection: "row",
          justifyContent: "space-between",
          borderBottomWidth: 1,
          borderBottomColor: "#F3F1F2",
          paddingBottom: 8,
          borderTopRightRadius: 16,
          borderTopLeftRadius: 16,
        }}
      ></View>
    );
  };

  return (
    <View style={styles.container}>
      <Top />
      <View style={{ paddingHorizontal: 16, paddingVertical: 8, flex: 1 }}>
        <SectionList
          sections={transactions}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          bounces={false}
          keyExtractor={(item, index) => item + index}
          renderSectionHeader={renderHeader}
          renderSectionFooter={renderFooter}
          renderItem={({ item }) => {
            const index = item.id;
            return (
              <Animated.View
                style={{ borderRadius: 20, backgroundColor: "red" }}
              >
                <View key={index} style={styles.tranItem}>
                  <Animated.View style={styles.deleteIcon}>
                    <Text>
                      <Delete />
                    </Text>
                  </Animated.View>
                  <Animated.View style={{ backgroundColor: "white" }}>
                    <Expense
                      onTap={() => {
                        active.setValue(index);
                      }}
                      {...{ transition, index, onDelete, item, allDates }}
                    >
                      <View
                        style={{
                          overflow: "hidden",
                          paddingHorizontal: 16,
                          borderBottomWidth: 1,
                          borderBottomColor: "#A9A2A6",
                          height: 50,
                          position: "relative",
                          backgroundColor: "white",
                        }}
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
                      </View>
                    </Expense>
                  </Animated.View>
                </View>
              </Animated.View>
            );
          }}
        />
      </View>
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
});

export default TransactionsScreen;

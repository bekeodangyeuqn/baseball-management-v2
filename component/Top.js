import React from "react";
import { View, StyleSheet, Text } from "react-native";
import Chart from "./Chart";
import { transactionsState } from "../atom/Transactions";
import { useRecoilState } from "recoil";

const Top = () => {
  const [transactions, setTransactions] = useRecoilState(transactionsState);
  const prices = transactions
    ? transactions.map((transaction) => transaction.price)
    : [];
  const balance =
    prices.length != 0
      ? prices.reduce((prev, curr) => (prev = +curr), 0) * -1
      : 0;
  const expense =
    prices.length != 0
      ? prices
          .filter((price) => price < 0)
          .reduce((prev, curr) => (prev += curr), 0) * -1
      : 0;
  const income = expense + balance;
  return (
    <View style={{ paddingTop: 40, paddingHorizontal: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 40, fontWeight: "bold" }}>November</Text>
        <Chart />
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 8,
        }}
      >
        <View>
          <Text style={{ alignContent: "center", color: "black" }}>
            Tổng thu
          </Text>
          <Text
            style={{
              alignContent: "center",
              fontSize: 13,
              color: "green",
              fontWeight: "bold",
            }}
          >
            {income}₫
          </Text>
        </View>

        <View>
          <Text style={{ alignContent: "center", color: "black" }}>
            Tổng chi
          </Text>
          <Text
            style={{
              alignContent: "center",
              fontSize: 13,
              color: "red",
              fontWeight: "bold",
            }}
          >
            {expense}₫
          </Text>
        </View>

        <View>
          <Text style={{ alignContent: "center", color: "black" }}>
            Tổng quỹ
          </Text>
          <Text
            style={{
              alignContent: "center",
              fontSize: 13,
              color: "brown",
              fontWeight: "bold",
            }}
          >
            {balance}₫
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({});

export default Top;

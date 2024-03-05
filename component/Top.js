import React from "react";
import { View, StyleSheet, Text } from "react-native";
import Chart from "./Chart";
import { transactionsState } from "../atom/Transactions";
import { useRecoilState } from "recoil";

const Top = ({ transactions }) => {
  console.log(transactions);

  const balance =
    transactions.length != 0
      ? transactions.reduce((prev, curr) => {
          if (curr.type < 0) return (prev -= curr.price);
          else return (prev += curr.price);
        }, 0)
      : 0;
  const expense =
    transactions.length != 0
      ? transactions
          .filter((transaction) => transaction.type < 0)
          .reduce((prev, curr) => (prev += curr.price), 0)
      : 0;
  const income = expense + balance;
  return (
    <View style={{ paddingTop: 40, paddingHorizontal: 16 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 30, fontWeight: "bold" }}>
          Danh sách thu chi
        </Text>
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

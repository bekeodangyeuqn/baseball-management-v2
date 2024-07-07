import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { transactionsState } from "../atom/Transactions";
import { playersState } from "../atom/Players";
import { useRecoilState, useRecoilValue } from "recoil";
import { useRoute } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";
import { Row, Rows, Table } from "react-native-table-component";

const PlayerFundScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const transactions = useRecoilValue(transactionsState);
  const fundTransactions = transactions.filter((t) => t.type == 3);
  const [players, setPlayers] = useRecoilState(playersState);
  const route = useRoute();
  const teamid = route.params.teamid;
  console.log(fundTransactions);

  useEffect(() => {
    const getInfo = async () => {
      setIsLoading(true);
      try {
        if (players.length <= 0) {
          const { data } = await axiosInstance.get(`players/team/${teamid}/`);
          setPlayers(data);
        }
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
        toast.show(error.message, {
          type: "danger",
          placement: "bottom",
          duration: 4000,
          offset: 30,
          animationType: "zoom-in",
        });
      }
    };
  }, []);
  const getMonthYear = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getFullYear()}`;
  };
  let tableHead = [];
  let tableData = [];
  let widthArr;
  let tableDataWithSums;
  if (players.length > 0 && fundTransactions.length > 0) {
    const uniqueMonthYear = fundTransactions
      .map((transaction) => getMonthYear(transaction.time))
      .filter((value, index, self) => self.indexOf(value) === index);
    uniqueMonthYear.sort((a, b) => {
      const [monthA, yearA] = a.split("/");
      const [monthB, yearB] = b.split("/");
      if (yearA !== yearB) {
        return yearB - yearA; // Descending order for years
      }
      return monthB - monthA; // Descending order for months if years are equal
    });
    tableHead = ["", ...uniqueMonthYear];
    widthArr = new Array(uniqueMonthYear.length + 1).fill(120);
    widthArr[0] = 150;
    players.forEach((player) => {
      const row = [
        `#${player.jerseyNumber}.${player.firstName} ${player.lastName}`,
      ];
      uniqueMonthYear.forEach((monthYear) => {
        const total = fundTransactions
          .filter((t) => getMonthYear(t.time) == monthYear)
          .reduce((acc, t) => {
            if (t.player_id == player.id) {
              return acc + t.price;
            }
            return acc;
          }, 0);
        row.push(total.toLocaleString("de-DE"));
      });
      tableData.push(row);
    });
    let columnSums = tableData[0].map((_, colIndex) =>
      tableData.reduce(
        (sum, row) => sum + (Number(row[colIndex].replace(/\./g, "")) || 0),
        0
      )
    );
    columnSums[0] = "Tổng";
    columnSums = columnSums.map((sum) => sum.toLocaleString("de-DE"));
    // Add the sums to the table data
    tableDataWithSums = [...tableData, columnSums];
  }

  return (
    <View style={styles.container}>
      {fundTransactions.length > 0 && players.length > 0 ? (
        <ScrollView>
          <ScrollView horizontal={true}>
            <Table borderStyle={{ borderWidth: 2, borderColor: "#c8e1ff" }}>
              <Row
                data={tableHead}
                widthArr={widthArr}
                style={styles.head}
                textStyle={styles.text}
              />
              <Rows
                data={tableDataWithSums}
                widthArr={widthArr}
                textStyle={styles.text}
              />
            </Table>
          </ScrollView>
        </ScrollView>
      ) : (
        <></>
      )}
      {/* <View>
        <TouchableOpacity style={styles.button} onPress={savePDF}>
          <Text style={{ color: "white" }}>Lưu file PDF</Text>
        </TouchableOpacity>
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 30,
    backgroundColor: "#fff",
  },
  head: { height: 40, backgroundColor: "#f1f8ff" },
  text: { margin: 6, textAlign: "center" },
  button: {
    width: 300,
    height: 40,
    backgroundColor: "#000",
    color: "#fff",
    borderRadius: 5,
    marginTop: 20,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});

export default PlayerFundScreen;

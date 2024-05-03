import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { Row, Rows, Table } from "react-native-table-component";
import { placeholderList } from "../../lib/skeleton";
import { useNavigation } from "@react-navigation/native";

const PitchingStatsScreen = (props) => {
  const { stats, teamName } = props;
  const navigation = useNavigation();
  const placeholderData = new Array(10).fill([
    "...",
    "...",
    "...",
    "...",
    "...",
    "...",
    "...",
    "...",
    "...",
    "...",
    "...",
    "...",
    "...",
    "...",
    "...",
  ]);
  let tableHead = [
    { title: "PLAYER", onPress: () => sortData(0) },
    { title: "TBF", onPress: () => sortData(1) },
    { title: "ERA", onPress: () => sortData(2) },
    { title: "IP", onPress: () => sortData(3) },
    { title: "H", onPress: () => sortData(4) },
    { title: "R", onPress: () => sortData(5) },
    { title: "ER", onPress: () => sortData(6) },
    { title: "HR", onPress: () => sortData(7) },
    { title: "HBP", onPress: () => sortData(8) },
    { title: "BB", onPress: () => sortData(9) },
    { title: "SO", onPress: () => sortData(10) },
    { title: "WHIP", onPress: () => sortData(11) },
    { title: "WP", onPress: () => sortData(12) },
    { title: "BK", onPress: () => sortData(13) },
    { title: "PO", onPress: () => sortData(14) },
  ];
  let widthArr = [150, 50, 80, 80, 50, 50, 50, 50, 50, 50, 50, 80, 50, 50, 50];
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);
  const [tableData, setTableData] = useState([]);
  // console.log(stats);

  const sortData = (columnIndex) => {
    const newSortDirection =
      sortColumn === columnIndex && sortDirection === "desc" ? "asc" : "desc";
    const sortedData = [...tableData].sort((a, b) => {
      const valueA = a[columnIndex];
      const valueB = b[columnIndex];

      if (valueA < valueB) {
        return newSortDirection === "asc" ? -1 : 1;
      }
      if (valueA > valueB) {
        return newSortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });

    setSortColumn(columnIndex);
    setSortDirection(newSortDirection);
    setTableData(sortedData);
  };

  if (stats)
    stats.map((obj) => {
      const playerExists = tableData.some((playerData) =>
        playerData[0].props.children.props.children.includes(
          `#${obj.jerseyNumber}.${obj.firstName} ${obj.lastName}`
        )
      );
      if (!playerExists) {
        tableData.push([
          <TouchableOpacity
            onPress={() => navigation.navigate("PlayerProfile", { id: obj.id })}
          >
            <Text
              style={{ textAlign: "center" }}
            >{`#${obj.jerseyNumber}.${obj.firstName} ${obj.lastName}`}</Text>
          </TouchableOpacity>,
          obj.totalBatterFaced,
          obj.earnedRunAverage,
          `${Math.floor(obj.totalInGameOut / 3)}.${obj.totalInGameOut % 3}`,
          obj.oppHit,
          obj.oppRun,
          obj.earnedRun,
          obj.oppHomeRun,
          obj.hitBatter,
          obj.oppBaseOnBall,
          obj.oppStrikeOut,
          obj.walkAndHitPerInning,
          obj.wildPitch,
          obj.balk,
          obj.pickOff,
        ]);
      }
    });
  return (
    <View style={styles.container}>
      <ScrollView>
        <ScrollView horizontal={true}>
          <Table borderStyle={{ borderWidth: 2, borderColor: "#c8e1ff" }}>
            <Row
              data={tableHead.map((column) => (
                <TouchableOpacity onPress={column.onPress}>
                  <Text style={{ textAlign: "center" }}>{column.title}</Text>
                </TouchableOpacity>
              ))}
              widthArr={widthArr}
              style={styles.head}
              textStyle={styles.text}
            />
            <Rows
              data={tableData.length <= 0 ? placeholderData : tableData}
              widthArr={widthArr}
              textStyle={styles.text}
            />
          </Table>
        </ScrollView>
      </ScrollView>
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

export default PitchingStatsScreen;

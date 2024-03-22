import { useRoute } from "@react-navigation/native";
import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Table, Row, Rows } from "react-native-table-component";

const tableHead = [
  "Player",
  "AB",
  "R",
  "H",
  "BB",
  "RBI",
  "SB",
  "SO",
  "AVG",
  "OBP",
  "LOB",
];

const widthArr = [100, 50, 50, 50, 50, 50, 50, 50, 75, 75, 50];

const BattingStatScreen = () => {
  const route = useRoute();
  const tableData = route.params.offData;
  return (
    <View style={styles.container}>
      <ScrollView horizontal={true}>
        <Table borderStyle={{ borderWidth: 2, borderColor: "#c8e1ff" }}>
          <Row
            data={tableHead}
            widthArr={widthArr}
            style={styles.head}
            textStyle={styles.text}
          />
          <Rows data={tableData} widthArr={widthArr} textStyle={styles.text} />
        </Table>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    container: {
      flex: 1,
      padding: 16,
      paddingTop: 30,
      backgroundColor: "#fff",
    },
  },
  head: { height: 40, backgroundColor: "#f1f8ff" },
  text: { margin: 6 },
});

export default BattingStatScreen;

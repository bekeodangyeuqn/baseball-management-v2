import { useRoute } from "@react-navigation/native";
import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
} from "react-native";
import { Table, Row, Rows } from "react-native-table-component";
import * as Print from "expo-print";
import { shareAsync } from "expo-sharing";

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
  const game = route.params.game;
  const teamName = route.params.teamName;

  let htmlContent = `<html>
    <body style="text-align: center;">
      <h1 style="font-size: 20px; font-family: Helvetica Neue; font-weight: normal;">
        Thống kê batting
      </h1>
      <h3 style="font-size: 20px; font-family: Helvetica Neue; font-weight: normal;">
        Đối thủ: ${game.oppTeam}
      </h3>
      <h3 style="font-size: 20px; font-family: Helvetica Neue; font-weight: normal;">
        Thời gian bắt đầu: ${game.timeStart}
      </h3>
      `;
  htmlContent += `<table style="width: 100%;
  border-collapse: collapse;">`;
  htmlContent +=
    `<tr>` +
    tableHead
      .map(
        (head) => `<th style="border: 1px solid black;
    padding: 15px;
    text-align: left;">${head}</th>`
      )
      .join("") +
    `</tr>`;
  tableData.forEach((row) => {
    htmlContent +=
      `<tr>` +
      row
        .map(
          (cell) => `<td style="border: 1px solid black;
      padding: 15px;
      text-align: left; background-color: #ddd;">${cell}</td>`
        )
        .join("") +
      `</tr>`;
  });
  htmlContent += "</table></body></html>";
  htmlContent += `</body>
    </html>`;

  const savePDF = async () => {
    // Convert table data to HTML

    const file = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
    });
    console.log("File has been saved to:", file.uri);
    await shareAsync(file.uri, { UTI: ".pdf", mimeType: "application/pdf" });
  };
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
      <View>
        <TouchableOpacity style={styles.button} onPress={savePDF}>
          <Text style={{ color: "white" }}>Lưu file PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 30,
    backgroundColor: "#fff",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  head: { height: 40, backgroundColor: "#f1f8ff" },
  text: { margin: 6 },
  button: {
    marginBottom: 5,
    borderStyle: "solid",
    borderColor: "black",
    backgroundColor: "green",
    padding: 4,
  },
});

export default BattingStatScreen;

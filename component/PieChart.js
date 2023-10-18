import React from "react";
import { StyleSheet, View, Text } from "react-native";
import * as Progress from "react-native-progress";

const PieChartComponent = ({ game, total, color }) => {
  const percent = game / total;
  return (
    <View style={styles.container}>
      {/* <PieChart style={{ height: 200 }} data={[percent*100]} /> */}
      <Progress.Circle
        size={100}
        progress={percent}
        color={color}
        style={{ fontWeight: "bold" }}
      />
      <View style={styles.gauge}>
        <Text style={styles.gaugeText}>{game}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
  gauge: {
    position: "absolute",
    width: 100,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  gaugeText: {
    backgroundColor: "transparent",
    color: "#000",
    fontSize: 24,
  },
});

export default PieChartComponent;

import { useRoute } from "@react-navigation/native";
import React from "react";
import { View, StyleSheet, Text, Button } from "react-native";

const EventDetailScreen = () => {
  const route = useRoute();
  const event = route.params.event;
  const getDate = (datetime) => {
    let dateAndTime = datetime.split("T"); // split date and time

    let date = dateAndTime[0]; // get the date

    let time = dateAndTime[1].split(":"); // split hours and minutes
    let hoursAndMinutes = `${time[0]}:${time[1]}`;
    return `${hoursAndMinutes} ${date}`; // get hours and minutes
  };
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.title}>{event.title}</Text>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.bodyComponent}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              Thời gian bắt đầu:
            </Text>
            <Text>{getDate(event.timeStart)}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              Thời gian kết thúc:
            </Text>
            <Text>{event.timeEnd ? getDate(event.timeEnd) : "Chưa rõ"}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>Địa điểm:</Text>
            <Text>{event.location}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>Mô tả:</Text>
            <Text>{event.description}</Text>
          </View>
          <View style={{ marginTop: 10 }}>
            <Button title="Gửi lời mời" />
          </View>
        </View>
      </View>
      <View style={{ padding: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>
          Danh sách tham gia:
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    borderRadius: 6,
    elevation: 3,
    backgroundColor: "#FFFFFF",
    shadowOffset: { width: 1, height: 1 },
    shadowColor: "#333",
    shadowOpacity: 0.3,
    shadowRadius: 2,
    marginHorizontal: 4,
    marginVertical: 6,
    padding: 8,
  },
  cardHeader: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  bodyComponent: {},
});

export default EventDetailScreen;

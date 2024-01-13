import { useRoute } from "@react-navigation/native";
import React from "react";
import { View, StyleSheet, Text } from "react-native";

const EventDetailScreen = () => {
  const route = useRoute();
  const event = route.params.event;
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
            <Text>{event.timeStart}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              Thời gian kết thúc:
            </Text>
            <Text>{event.timeEnd ? event.timeEnd : "Chưa rõ"}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>Địa điểm:</Text>
            <Text>{event.location}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>Mô tả:</Text>
            <Text>{event.description}</Text>
          </View>
        </View>
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

import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import EventInfo from "../../component/EventInfo";

const InprogressEventScreen = (props) => {
  const navigation = useNavigation();
  const { events, teamName } = props;
  return (
    <View>
      <View style={styles.buttonHeader}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("CreateEvent")}
        >
          <Text style={styles.textButton}>Thêm sự kiện</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        {events.map((event) => {
          if (event.status === 0) {
            return (
              <EventInfo
                key={event.id}
                title={event.title}
                timeStart={event.timeStart}
                timeEnd={event.timeEnd}
                location={event.location}
                event={event}
              />
            );
          }
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  buttonHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  button: {
    marginBottom: 5,
    borderStyle: "solid",
    borderColor: "black",
    backgroundColor: "green",
    padding: 4,
    marginRight: 4,
  },
  textButton: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default InprogressEventScreen;

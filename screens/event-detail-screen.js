import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Button,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import axiosInstance from "../lib/axiosClient";
import { useToast } from "react-native-toast-notifications";
import { useRecoilState } from "recoil";
import { personsEventsState } from "../atom/Events";
import PersonEventItem from "../component/PersonEventItem";
import { managersState, playersState } from "../atom/Players";

const EventDetailScreen = () => {
  const route = useRoute();
  const event = route.params.event;
  const [persons, setPersons] = useRecoilState(personsEventsState);
  const [managers, setManagers] = useRecoilState(managersState);
  const [players, setPlayers] = useRecoilState(playersState);
  const navigation = useNavigation();
  const getDate = (datetime) => {
    let dateAndTime = datetime.split("T"); // split date and time

    let date = dateAndTime[0]; // get the date

    let time = dateAndTime[1].split(":"); // split hours and minutes
    let hoursAndMinutes = `${time[0]}:${time[1]}`;
    return `${hoursAndMinutes} ${date}`; // get hours and minutes
  };
  const [isLoading, setIsLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const toast = useToast(true);

  useEffect(() => {
    const getInfo = async () => {
      setIsLoading(true);
      try {
        const { data } = await axiosInstance.get(`event/players/${event.id}/`);
        const players = data;
        const { data: data2 } = await axiosInstance.get(
          `event/managers/${event.id}/`
        );
        const managers = data2;
        setPersons([...players, ...managers]);
        if (players.length <= 0) {
          const { data } = await axiosInstance.get(
            `/players/team/${event.team_id}`
          );
          setPlayers(data);
        }
        if (managers.length <= 0) {
          const { data } = await axiosInstance.get(
            `/managers/team/${event.team_id}`
          );
          setManagers(data);
        }
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
    getInfo();
  }, []);

  const handleSendJoinEvent = async () => {
    try {
      setEmailLoading(true);
      await axiosInstance.post(`request_joinevent/${event.id}`);
      const { data } = await axiosInstance.get(`event/players/${event.id}/`);
      const players = data;
      const { data: data2 } = await axiosInstance.get(
        `event/managers/${event.id}/`
      );
      const managers = data2;
      setPersons([...players, ...managers]);
      setEmailLoading(false);
      toast.show("Gửi lời mời thành công", {
        type: "success",
        placement: "bottom",
        duration: 4000,
        offset: 30,
        animationType: "zoom-in",
      });
    } catch (error) {
      toast.show(error.message, {
        type: "danger",
        placement: "bottom",
        duration: 4000,
        offset: 30,
        animationType: "zoom-in",
      });
      setEmailLoading(false);
    }
  };

  if (isLoading === 0) {
    return (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
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
            <Button
              disabled={persons.length <= 0 ? false : true}
              title={persons.length <= 0 ? "Gửi lời mời" : "Đã gửi lời mời"}
              onPress={handleSendJoinEvent}
            />
          </View>
          <View style={{ marginTop: 10 }}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                navigation.navigate("EditEvent", {
                  id: event.id,
                });
              }}
            >
              <Text style={styles.textButton}>Chỉnh sửa</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={{ padding: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>
          Danh sách tham gia:
        </Text>
        {persons.length > 0 && (
          <FlatList
            data={persons}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <PersonEventItem person={item} />}
          />
        )}
      </View>
      {emailLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
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
  button: {
    marginBottom: 5,
    marginTop: 5,
    borderStyle: "solid",
    borderColor: "black",
    backgroundColor: "green",
    padding: 4,
    marginRight: 4,
    alignItems: "center",
    justifyContent: "center",
    marginEnd: "auto",
    marginStart: "auto",
    width: "100%",
  },
  textButton: {
    padding: 4,
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default EventDetailScreen;

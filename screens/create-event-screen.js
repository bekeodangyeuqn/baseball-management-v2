import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import * as Yup from "yup";
import { Formik } from "formik";
import { useToast } from "react-native-toast-notifications";
import axiosInstance from "../lib/axiosClient";
import DateTimePicker from "@react-native-community/datetimepicker";
import jwtDecode from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
const CreateEventScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState("date");
  const [show, setShow] = useState(false);

  const [error, setError] = useState("");
  const [teamid, setTeamId] = useState(null);

  const toast = useToast();
  const navigation = useNavigation();
  const validationSchema = Yup.object().shape({
    title: Yup.string().required("Title of the event is required"),
  });
  let options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // Use 24-hour format
  };
  useEffect(() => {
    const getInfo = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        const decoded = jwtDecode(token);
        console.log(decoded.id);
        setTeamId(decoded.teamid);
      } catch (error) {
        console.log(error);
      }
    };
    getInfo().catch((error) => console.error(error));
  }, []);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    setShow(false);
    setDate(currentDate);
  };

  const showMode = (currentMode) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode("date");
  };

  const showTimepicker = () => {
    showMode("time");
  };

  const handleCreateEvent = async (values) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.post("/event/create/", {
        title: values.title,
        description: values.description,
        timeStart: values.timeStart,
        location: values.location,
        team_id: teamid,
        status: -1,
        timeEnd: null,
      });
      const storedEvents = await AsyncStorage.getItem("events");
      if (storedGames) {
        const storedEventsArr = JSON.parse(storedEvents);
        const data = [...storedEventsArr, response.data];
        AsyncStorage.setItem("events", JSON.stringify(data), (error) => {
          if (error) {
            console.error(error);
          } else {
            console.log("Events stored successfully.");
          }
        });
      } else {
        const { data } = await axiosInstance.get(`/events/team/${teamid}/`);
        AsyncStorage.setItem("events", JSON.stringify(data), (error) => {
          if (error) {
            console.error(error);
          } else {
            console.log("Events stored successfully.");
          }
        });
      }
      setIsLoading(false);
      toast.show(" Tạo sự kiện thành công", {
        type: "success",
        placement: "bottom",
        duration: 4000,
        offset: 30,
        animationType: "zoom-in",
      });
      navigation.navigate("Events");
      return response;
    } catch (error) {
      //Toast.show(error.message);
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

  return (
    <Formik
      initialValues={{
        title: "",
        timeStart: date,
        description: "",
        location: "",
      }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        handleCreateEvent(values);
      }}
    >
      {(formik) => {
        return (
          <View style={styles.container}>
            <Text style={styles.title}>Tạo sự kiện</Text>

            <TextInput
              style={styles.input}
              name="title"
              placeholder="Tiêu đề sự kiện"
              keyboardType="default"
              onChangeText={formik.handleChange("title")}
              value={formik.values.title}
            />
            {formik.errors.title && (
              <Text style={{ color: "red" }}>{formik.errors.title}</Text>
            )}

            <TextInput
              style={styles.input}
              name="description"
              placeholder="Mô tả"
              autoCapitalize="none"
              keyboardType="default"
              onChangeText={formik.handleChange("description")}
              value={formik.values.description}
            />
            {formik.errors.description && (
              <Text style={{ color: "red" }}>{formik.errors.description}</Text>
            )}
            <SafeAreaView style={styles.formRow}>
              <View>
                <Button onPress={showDatepicker} title="Ngày dự định" />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Button onPress={showTimepicker} title="Thời gian dự định" />
              </View>
            </SafeAreaView>
            <TextInput
              style={styles.input}
              name="timeStart"
              placeholder="Thời gian bắt đầu"
              onChangeText={setDate}
              value={date.toLocaleString("en-US", options).replace(",", "")}
              editable={false}
            />
            {show && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode={mode}
                is24Hour={true}
                onChange={onChange}
              />
            )}
            {formik.errors.timeStart && (
              <Text style={{ color: "red" }}>{formik.errors.timeStart}</Text>
            )}
            <TextInput
              style={styles.input}
              name="location"
              placeholder="Địa điểm"
              autoCapitalize="none"
              keyboardType="default"
              onChangeText={formik.handleChange("location")}
              value={formik.values.location}
            />
            {formik.errors.location && (
              <Text style={{ color: "red" }}>{formik.errors.location}</Text>
            )}
            <Button
              title="Tạo sự kiện"
              onPress={formik.handleSubmit}
              style={{ marginTop: 10 }}
            />
            {error && <Text style={{ color: "red" }}>{error}</Text>}
            {isLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
            )}
          </View>
        );
      }}
    </Formik>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  input: {
    width: 300,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  button: {
    width: 300,
    height: 40,
    backgroundColor: "#000",
    color: "#fff",
    borderRadius: 5,
    marginTop: 20,
  },
  error: {
    color: "#f00",
  },
  social: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  formRow: {
    display: "flex",
    flexDirection: "row",
    maxWidth: "100%",
    alignItems: "center",
  },
  buttonShort: {
    flex: 1,
    borderStyle: "solid",
    borderColor: "black",
    backgroundColor: "green",
    padding: 4,
    marginRight: 4,
    height: 40,
    padding: 3,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  },
});

export default CreateEventScreen;

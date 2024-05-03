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
import { useRecoilState } from "recoil";
import { eventsState } from "../atom/Events";
import { leaguesState } from "../atom/League";
const CreateLeagueScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [date1, setDate1] = useState(new Date());
  const [date2, setDate2] = useState(new Date());
  const [picker1, setPicker1] = useState(false);
  const [picker2, setPicker2] = useState(false);

  const [error, setError] = useState("");
  const [teamid, setTeamId] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [leagues, setLeagues] = useRecoilState(leaguesState);
  const [dob, setDob] = useState(null);
  const [doe, setDoe] = useState(null);

  const toast = useToast();
  const navigation = useNavigation();
  const validationSchema = Yup.object().shape({
    title: Yup.string().required("Title of the league is required"),
  });

  useEffect(() => {
    const getInfo = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        const decoded = jwtDecode(token);
        console.log(decoded.id);
        setTeamId(decoded.teamid);
        setTeamName(decoded.teamName);
      } catch (error) {
        console.log(error);
      }
    };
    getInfo().catch((error) => console.error(error));
  }, []);

  const toggleDatePicker = (number) => {
    if (number == 1) setPicker1(!picker1);
    else setPicker2(!picker2);
  };

  const handleCreateEvent = async (values) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.post("/league/create/", {
        title: values.title,
        description: values.description,
        timeStart: values.timeStart,
        timeEnd: values.timeEnd,
        location: values.location,
        team_id: teamid,
        timeEnd: null,
        status: -1,
        achieve: 0,
      });
      setLeagues((oldLeagues) => [...oldLeagues, response.data]);
      setIsLoading(false);
      toast.show("Tạo giải đấu thành công", {
        type: "success",
        placement: "bottom",
        duration: 4000,
        offset: 30,
        animationType: "zoom-in",
      });
      navigation.navigate("Leagues", {
        teamid: teamid,
        teamName: teamName,
      });
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
        timeStart: date1,
        timeEnd: date2,
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
            <Text style={styles.title}>Tạo giải đấu</Text>

            <TextInput
              style={styles.input}
              name="title"
              placeholder="Tên giải đấu"
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
            {picker1 && (
              <DateTimePicker
                mode="date"
                display="calendar"
                value={date1}
                onChange={({ type }, selectedDate) => {
                  if (type === "set") {
                    const currentDate = selectedDate;
                    setDate1(currentDate);

                    if ((Platform.OS = "android")) {
                      toggleDatePicker(1);
                      //formik.values.dateOfBirth = currentDate.toDateString();
                      setDob(formatDateToISO(currentDate));
                    }
                  } else {
                    toggleDatePicker(1);
                  }
                }}
              />
            )}
            {!picker1 && (
              <Pressable onPress={() => toggleDatePicker(1)}>
                <TextInput
                  style={styles.input}
                  name="timeStart"
                  placeholder="Ngày bắt đầu"
                  onChangeText={setDob}
                  value={dob}
                  editable={false}
                />
              </Pressable>
            )}
            {formik.errors.timeStart && (
              <Text style={{ color: "red" }}>{formik.errors.timeStart}</Text>
            )}
            {picker2 && (
              <DateTimePicker
                mode="date"
                display="calendar"
                value={date2}
                onChange={({ type }, selectedDate) => {
                  if (type === "set") {
                    const currentDate = selectedDate;
                    setDate2(currentDate);

                    if ((Platform.OS = "android")) {
                      toggleDatePicker(2);
                      //formik.values.dateOfBirth = currentDate.toDateString();
                      setDoe(formatDateToISO(currentDate));
                    }
                  } else {
                    toggleDatePicker(2);
                  }
                }}
              />
            )}
            {!picker1 && (
              <Pressable onPress={() => toggleDatePicker(2)}>
                <TextInput
                  style={styles.input}
                  name="timeEnd"
                  placeholder="Ngày kết thúc"
                  onChangeText={setDoe}
                  value={dob}
                  editable={false}
                />
              </Pressable>
            )}
            {formik.errors.birthDate && (
              <Text style={{ color: "red" }}>{formik.errors.birthDate}</Text>
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
              color="green"
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

export default CreateLeagueScreen;

import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRecoilState, useRecoilValue } from "recoil";
import { eventByIdState, eventsState } from "../atom/Events";
import axiosInstance from "../lib/axiosClient";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useToast } from "react-native-toast-notifications";
import { Formik } from "formik";
import Animated from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Yup from "yup";
import jwtDecode from "jwt-decode";

const configDateTime = (datetime) => {
  let dateAndTime = datetime.split("T"); // split date and time

  let date = dateAndTime[0]; // get the date

  let time = dateAndTime[1].split(":"); // split hours and minutes
  let hoursAndMinutes = `${time[0]}:${time[1]}`;
  return `${hoursAndMinutes} ${date}`; // get hours and minutes
};

const EditEventScreen = () => {
  const route = useRoute();
  const id = route.params.id;
  const event = useRecoilValue(eventByIdState(id));
  const [status, setStatus] = useState(event.status);
  const [isLoading, setIsLoading] = useState(false);
  const [picker, setPicker] = useState(false);
  const [date1, setDate1] = useState(
    event.timeStart ? new Date(event.timeStart) : new Date()
  );
  const [date2, setDate2] = useState(
    event.timeEnd ? new Date(event.timeEnd) : new Date()
  );
  const [dateStart, setDateStart] = useState(event.timeStart);
  const [dateEnd, setDateEnd] = useState(event.timeEnd);
  const [mode, setMode] = useState("date");
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);

  const [error, setError] = useState("");
  const [teamid, setTeamId] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [step, setStep] = useState(1);
  const [events, setEvents] = useRecoilState(eventsState);
  const [isLoadingStart, setIsLoadingStart] = useState(false);
  const toast = useToast();
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [tokens, setTokens] = useState([]);
  const validationSchema = Yup.object().shape({
    title: Yup.string().required("Event title is required"),
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
        setIsLoading(true);
        const token = await AsyncStorage.getItem("access_token");
        const decoded = jwtDecode(token);
        setUsername(decoded.username);
        setTeamId(decoded.teamid);
        setTeamName(decoded.teamname);
        const { data } = await axiosInstance.get(
          `/userpushtokens/${decoded.teamid}/`
        );
        setTokens(data);
        setIsLoading(false);
      } catch (err) {
        console.log(err);
        setIsLoading(false);
      }
    };
    getInfo();
  }, []);

  const onChangeStart = (event, selectedDate) => {
    console.log(selectedDate);
    const currentDate = selectedDate;
    setDate1(currentDate);
    setShow1(!show1);
    setDateStart(currentDate);
  };

  const onChangeEnd = (event, selectedDate) => {
    console.log(selectedDate);
    const currentDate = selectedDate;
    setDate2(currentDate);
    setShow2(!show2);
    setDateEnd(currentDate);
  };

  const showMode = (currentMode, number) => {
    if (number == 1) setShow1(!show1);
    else setShow2(!show2);
    setMode(currentMode);
  };

  const showDatepicker = (number) => {
    showMode("date", number);
  };

  const showTimepicker = (number) => {
    showMode("time", number);
  };

  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0
  const fadeIn = () => {
    // Will change fadeAnim value to 1
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const fadeOut = () => {
    // Will change fadeAnim value to 0
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const nextStep = () => {
    if (step < 5) {
      fadeOut();
      setTimeout(() => {
        setStep(step + 1);
        fadeIn();
      }, 500);
    }
  };

  const previousStep = () => {
    if (step > 1) {
      fadeOut();
      setTimeout(() => {
        setStep(step - 1);
        fadeIn();
      }, 500);
    }
  };
  const handleEditEvent = async (values) => {
    try {
      setIsLoading(true);
      const req = {
        title: values.title,
        description: values.description,
        timeStart: date1,
        timeEnd: date2,
        location: values.location,
        status: status,
        team_id: teamid,
      };
      console.log(req);
      const response = await axiosInstance.patch(`/event/updates/${id}/`, req);

      if (events.length > 0) {
        setEvents((oldGames) => [
          ...oldGames.filter((g) => g.id !== id),
          response.data,
        ]);
      } else {
        const { data } = await axiosInstance.get(`/events/team/${teamid}/`);
        setGames(data);
      }
      setIsLoading(false);
      toast.show("Cập nhật sự kiện thành công", {
        type: "success",
        placement: "bottom",
        duration: 4000,
        offset: 30,
        animationType: "zoom-in",
      });
      navigation.navigate("Events", {
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
        title: event.title,
        status: status,
        timeStart: event.timeStart
          ? configDateTime(event.timeStart)
          : new Date(),
        timeEnd: event.timeEnd ? configDateTime(event.timeEnd) : new Date(),
        description: event.description ? event.description : "",
        location: event.location ? event.location : "",
      }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        handleEditEvent(values);
      }}
    >
      {(formik) => {
        return (
          <View
            style={{
              flex: 1,
              justifyContent: "space-between",
              height: "100%",
              marginHorizontal: 12,
            }}
          >
            <View>
              <View style={{ position: "relative", marginTop: 16 }}>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    alignItems: "center",
                  }}
                >
                  {step === 1
                    ? "Tiêu đề sự kiện"
                    : step === 2
                    ? "Mô tả"
                    : step === 3
                    ? "Thời gian"
                    : step === 4
                    ? "Địa điểm"
                    : "Trạng thái sự kiện"}
                </Text>
              </View>
              <View
                style={{
                  marginVertical: 8,
                }}
              >
                {step === 1 && (
                  <View>
                    <View>
                      <TextInput
                        style={styles.input}
                        name="title"
                        placeholder="Tiêu đề sự kiện"
                        autoCapitalize="none"
                        keyboardType="default"
                        onChangeText={formik.handleChange("title")}
                        value={formik.values.title}
                      />
                      {formik.errors.title && (
                        <Text style={{ color: "red" }}>
                          {formik.errors.title}
                        </Text>
                      )}
                    </View>
                  </View>
                )}
                {step === 2 && (
                  <View style={styles.formRow}>
                    <TextInput
                      style={{ ...styles.input, height: 100 }}
                      name="description"
                      placeholder="Mô tả"
                      autoCapitalize="none"
                      keyboardType="default"
                      onChangeText={formik.handleChange("description")}
                      value={formik.values.description}
                      multiline={true}
                      textAlignVertical="top"
                    />
                    {formik.errors.description && (
                      <Text style={{ color: "red" }}>
                        {formik.errors.description}
                      </Text>
                    )}
                  </View>
                )}
                {step === 3 && (
                  <View>
                    <View>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "bold",
                          alignItems: "center",
                        }}
                      >
                        Thời gian bắt đầu
                      </Text>
                      <SafeAreaView style={styles.formRow}>
                        <View>
                          <Button
                            onPress={() => showDatepicker(1)}
                            title="Ngày bắt đầu"
                          />
                        </View>
                        <View style={{ marginLeft: 10 }}>
                          <Button
                            onPress={() => showTimepicker(1)}
                            title="Thời gian bắt đầu"
                          />
                        </View>
                      </SafeAreaView>
                      <TextInput
                        style={styles.input}
                        name="timeStart"
                        placeholder="Thời gian bắt đầu"
                        onChangeText={setDate1}
                        value={date1
                          .toLocaleString("en-US", options)
                          .replace(",", "")}
                        // value={dateStart ? dateStart : new Date()}
                        editable={false}
                      />
                      {show1 && (
                        <DateTimePicker
                          testID="dateTimePickerStart"
                          value={date1}
                          mode={mode}
                          is24Hour={true}
                          onChange={onChangeStart}
                        />
                      )}
                      {formik.errors.timeStart && (
                        <Text style={{ color: "red" }}>
                          {formik.errors.timeStart}
                        </Text>
                      )}
                    </View>
                    <View>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "bold",
                          alignItems: "center",
                        }}
                      >
                        Thời gian kết thúc
                      </Text>
                      <SafeAreaView style={styles.formRow}>
                        <View>
                          <Button
                            onPress={() => showDatepicker(2)}
                            title="Ngày kết thúc"
                          />
                        </View>
                        <View style={{ marginLeft: 10 }}>
                          <Button
                            onPress={() => showTimepicker(2)}
                            title="Thời gian kết thúc"
                          />
                        </View>
                      </SafeAreaView>
                      <TextInput
                        style={styles.input}
                        name="timeEnd"
                        placeholder="Thời gian kết thúc"
                        onChangeText={setDate2}
                        value={date2
                          .toLocaleString("en-US", options)
                          .replace(",", "")}
                        // value={dateEnd ? dateEnd : new Date()}
                        editable={false}
                      />
                      {show2 && (
                        <DateTimePicker
                          testID="dateTimePickerEnd"
                          value={date2}
                          mode={mode}
                          is24Hour={true}
                          onChange={onChangeEnd}
                        />
                      )}
                      {formik.errors.timeStart && (
                        <Text style={{ color: "red" }}>
                          {formik.errors.timeStart}
                        </Text>
                      )}
                    </View>
                  </View>
                )}
                {step === 4 && (
                  <View style={styles.formRow}>
                    <TextInput
                      style={styles.input}
                      name="location"
                      placeholder="Sân vận động"
                      autoCapitalize="none"
                      keyboardType="default"
                      onChangeText={formik.handleChange("location")}
                      value={formik.values.location}
                    />
                    {formik.errors.location && (
                      <Text style={{ color: "red" }}>
                        {formik.errors.location}
                      </Text>
                    )}
                  </View>
                )}
                {step === 5 && (
                  <SafeAreaView style={styles.formRow}>
                    <Picker
                      style={{ ...styles.input, flex: 3 }}
                      selectedValue={status}
                      onValueChange={(itemValue, itemIndex) => {
                        if (itemValue != "label") setStatus(itemValue);
                      }}
                      dropdownIconColor="#00fc08"
                    >
                      <Picker.Item label="Trạng thái sự kiện" value={-2} />
                      <Picker.Item label="Chưa diễn ra" value={-1} />
                      <Picker.Item label="Đang tiến hành" value={0} />
                      <Picker.Item label="Đã hoàn thành" value={1} />
                    </Picker>
                    {formik.errors.status && (
                      <Text style={{ color: "red" }}>
                        {formik.errors.status}
                      </Text>
                    )}
                  </SafeAreaView>
                )}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: step > 1 ? "space-between" : "flex-end",
                    marginTop: 10,
                  }}
                >
                  {step > 1 ? (
                    <Button title="< Trước" onPress={previousStep} />
                  ) : null}
                  {step < 5 ? (
                    <Button title="Tiếp >" onPress={nextStep} />
                  ) : (
                    <Button
                      color="green"
                      title="Hoàn tất"
                      onPress={formik.handleSubmit}
                    />
                  )}
                </View>
              </View>
            </View>
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
    borderRadius: 10,
    backgroundColor: "white",
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

export default EditEventScreen;

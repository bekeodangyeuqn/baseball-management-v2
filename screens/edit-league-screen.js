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
import { useNavigation, useRoute } from "@react-navigation/native";
import { useState } from "react";
import * as Yup from "yup";
import { Formik } from "formik";
import { useToast } from "react-native-toast-notifications";
import axiosInstance from "../lib/axiosClient";
import DateTimePicker from "@react-native-community/datetimepicker";
import jwtDecode from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRecoilState, useRecoilValue } from "recoil";
import { eventsState } from "../atom/Events";
import { leagueByIdState, leaguesState } from "../atom/League";
import { Picker } from "@react-native-picker/picker";
const EditLeagueScreen = () => {
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
  const [status, setStatus] = useState(-1);
  const [achieve, setAchieve] = useState(0);
  const route = useRoute();
  const id = route.params.id;
  const league = useRecoilValue(leagueByIdState(id));

  const toast = useToast();
  const navigation = useNavigation();
  const validationSchema = Yup.object().shape({
    title: Yup.string().required("Title of the league is required"),
    status: Yup.number().min(-1),
    achieve: Yup.number().min(0),
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

  const handleUpdateEvent = async (values) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.patch(`/league/updates/${id}`, {
        title: values.title,
        description: values.description,
        timeStart: values.timeStart,
        timeEnd: values.timeEnd,
        location: values.location,
        team_id: teamid,
        timeEnd: null,
        status: status,
        achieve: achieve,
      });
      setLeagues((oldLeagues) => [
        ...oldLeagues.filter((l) => l.id !== id),
        response.data,
      ]);
      setIsLoading(false);
      toast.show("Cập nhật giải đấu thành công", {
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
        title: league.title ? league.title : "",
        timeStart: league.timeStart ? league.timeStart : date1,
        timeEnd: league.timeEnd ? league.timeEnd : date2,
        description: league.description ? league.description : "",
        location: league.location ? league.location : "",
        achieve: league.achieve ? league.achieve : achieve,
        status: league.status ? league.status : status,
      }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        handleUpdateEvent(values);
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
                    ? "Tên giải đấu"
                    : step === 2
                    ? "Mô tả"
                    : step === 3
                    ? "Thời gian"
                    : step === 4
                    ? "Địa điểm"
                    : step === 5
                    ? "Thành tích giải"
                    : "Trạng thái"}
                </Text>
              </View>
              <View
                style={{
                  marginVertical: 8,
                }}
              >
                {step === 1 && (
                  <View>
                    <TextInput
                      style={styles.input}
                      name="title"
                      placeholder="Tên giải đấu"
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
                      <Text style={{ color: "red" }}>
                        {formik.errors.timeStart}
                      </Text>
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
                    {!picker2 && (
                      <Pressable onPress={() => toggleDatePicker(2)}>
                        <TextInput
                          style={styles.input}
                          name="timeEnd"
                          placeholder="Ngày kết thúc"
                          onChangeText={setDoe}
                          value={doe}
                          editable={false}
                        />
                      </Pressable>
                    )}
                    {formik.errors.timeEnd && (
                      <Text style={{ color: "red" }}>
                        {formik.errors.timeEnd}
                      </Text>
                    )}
                  </View>
                )}
                {step === 4 && (
                  <View style={styles.formRow}>
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
                      <Text style={{ color: "red" }}>
                        {formik.errors.location}
                      </Text>
                    )}
                  </View>
                )}
                {step === 5 && (
                  <View>
                    <Picker
                      style={{ ...styles.input, flex: 3 }}
                      selectedValue={achieve}
                      onValueChange={(itemValue, itemIndex) => {
                        if (itemValue != "label") setAchieve(itemValue);
                      }}
                      dropdownIconColor="#00fc08"
                    >
                      <Picker.Item label="Thành tích giải" value={-1} />
                      <Picker.Item label="Vô địch" value={1} />
                      <Picker.Item label="Hạng nhì" value={2} />
                      <Picker.Item label="Hạng ba" value={3} />
                      <Picker.Item label="Không có giải" value={0} />
                    </Picker>
                    {formik.errors.achieve && (
                      <Text style={{ color: "red" }}>
                        {formik.errors.achieve}
                      </Text>
                    )}
                  </View>
                )}
                {step === 6 && (
                  <View>
                    <Picker
                      style={{ ...styles.input, flex: 3 }}
                      selectedValue={status}
                      onValueChange={(itemValue, itemIndex) => {
                        if (itemValue != "label") setStatus(itemValue);
                      }}
                      dropdownIconColor="#00fc08"
                    >
                      <Picker.Item label="Trạng thái" value={-2} />
                      <Picker.Item label="Chưa diễn ra" value={-1} />
                      <Picker.Item label="Đang diễn ra" value={0} />
                      <Picker.Item label="Đã kết thúc" value={1} />
                    </Picker>
                    {formik.errors.status && (
                      <Text style={{ color: "red" }}>
                        {formik.errors.status}
                      </Text>
                    )}
                  </View>
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
                  {step < 6 ? (
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

export default EditLeagueScreen;

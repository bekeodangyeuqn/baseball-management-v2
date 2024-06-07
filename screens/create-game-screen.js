import React, { useEffect, useRef } from "react";
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
import { Formik, Field, Form } from "formik";
import { useToast } from "react-native-toast-notifications";
import axiosInstance from "../lib/axiosClient";
import DateTimePicker from "@react-native-community/datetimepicker";
import jwtDecode from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { gamesState } from "../atom/Games";
import { useRecoilState } from "recoil";
import Animated from "react-native-reanimated";
import { leaguesState } from "../atom/League";

function formatDateToISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const CreateGameScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [picker, setPicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState("date");
  const [show, setShow] = useState(false);

  const [error, setError] = useState("");
  const [teamid, setTeamId] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [inningERA, setInningERA] = useState(-1);
  const [leagueId, setLeagueId] = useState(null);
  const [step, setStep] = useState(1);
  const [games, setGames] = useRecoilState(gamesState);
  const [leagues, setLeagues] = useRecoilState(leaguesState);
  const toast = useToast();
  const navigation = useNavigation();
  const validationSchema = Yup.object().shape({
    oppTeam: Yup.string().required("Opponent team name is required"),
    oppTeamShort: Yup.string()
      .max(4)
      .required("Opponent team short name is required"),
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
        setTeamName(decoded.teamName);
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
    if (step < 8) {
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

  const handleCreateGame = async (values) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.post("/game/create/", {
        oppTeam: values.oppTeam,
        oppTeamShort: values.oppTeamShort,
        description: values.description,
        timeStart: values.timeStart,
        league_id: leagueId,
        stadium: values.stadium,
        inningERA: inningERA,
        team_id: teamid,
        status: -1,
        timeEnd: null,
      });

      if (games.length > 0) {
        setGames((oldGames) => [...oldGames, response.data]);
      } else {
        const { data } = await axiosInstance.get(`/games/team/${teamid}/`);
        setGames(data);
      }
      setIsLoading(false);
      toast.show(" Tạo trận đấu thành công", {
        type: "success",
        placement: "bottom",
        duration: 4000,
        offset: 30,
        animationType: "zoom-in",
      });
      navigation.navigate("Games", {
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
        oppTeam: "",
        oppTeamShort: "",
        leagueId: leagueId,
        timeStart: date,
        description: "",
        stadium: "",
        inningERA: inningERA,
      }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        handleCreateGame(values);
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
                    ? "Thông tin đối thủ"
                    : step === 2
                    ? "Mô tả"
                    : step === 3
                    ? "Thời gian bắt đầu"
                    : step === 4
                    ? "Địa điểm"
                    : step === 5
                    ? "Giải đấu"
                    : "Số hiệp tiêu chuẩn"}
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
                        name="oppTeam"
                        placeholder="Tên đối thủ"
                        autoCapitalize="none"
                        keyboardType="default"
                        onChangeText={formik.handleChange("oppTeam")}
                        value={formik.values.oppTeam}
                      />
                      {formik.errors.oppTeam && (
                        <Text style={{ color: "red" }}>
                          {formik.errors.oppTeam}
                        </Text>
                      )}

                      <TextInput
                        style={styles.input}
                        name="oppTeamShort"
                        placeholder="Tên viết tắt đối thủ (tối đa 4 ký tự)"
                        autoCapitalize="characters"
                        keyboardType="default"
                        onChangeText={formik.handleChange("oppTeamShort")}
                        value={formik.values.oppTeamShort}
                      />
                      {formik.errors.oppTeamShort && (
                        <Text style={{ color: "red" }}>
                          {formik.errors.oppTeamShort}
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
                    <SafeAreaView style={styles.formRow}>
                      <View>
                        <Button onPress={showDatepicker} title="Ngày dự định" />
                      </View>
                      <View style={{ marginLeft: 10 }}>
                        <Button
                          onPress={showTimepicker}
                          title="Thời gian dự định"
                        />
                      </View>
                    </SafeAreaView>
                    <TextInput
                      style={styles.input}
                      name="timeStart"
                      placeholder="Thời gian bắt đầu"
                      onChangeText={setDate}
                      value={date
                        .toLocaleString("en-US", options)
                        .replace(",", "")}
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
                      <Text style={{ color: "red" }}>
                        {formik.errors.timeStart}
                      </Text>
                    )}
                  </View>
                )}
                {step === 4 && (
                  <View style={styles.formRow}>
                    <TextInput
                      style={styles.input}
                      name="stadium"
                      placeholder="Sân vận động"
                      autoCapitalize="none"
                      keyboardType="default"
                      onChangeText={formik.handleChange("stadium")}
                      value={formik.values.stadium}
                    />
                    {formik.errors.stadium && (
                      <Text style={{ color: "red" }}>
                        {formik.errors.stadium}
                      </Text>
                    )}
                  </View>
                )}
                {step === 5 && (
                  <SafeAreaView style={styles.formRow}>
                    <Picker
                      style={{ ...styles.input, flex: 3 }}
                      selectedValue={leagueId}
                      onValueChange={(itemValue, itemIndex) => {
                        if (itemValue != "label") setLeagueId(itemValue);
                      }}
                      dropdownIconColor="#00fc08"
                    >
                      <Picker.Item label="Chọn giải đấu" value={-1} />
                      {/* <Picker.Item label="Giao hữu" value={1} /> */}
                      {leagues.map((l) => (
                        <Picker.Item label={l.title} value={l.id} key={l.id} />
                      ))}
                    </Picker>
                    <TouchableOpacity
                      style={styles.buttonShort}
                      onPress={() => navigation.navigate("CreateLeague")}
                    >
                      <Text style={styles.buttonText}> Thêm giải đấu</Text>
                    </TouchableOpacity>
                    {formik.errors.leagueId && (
                      <Text style={{ color: "red" }}>
                        {formik.errors.leagueId}
                      </Text>
                    )}
                  </SafeAreaView>
                )}
                {step === 6 && (
                  <View>
                    <Picker
                      style={styles.input}
                      selectedValue={inningERA}
                      onValueChange={(itemValue, itemIndex) => {
                        if (itemValue != "label") setInningERA(itemValue);
                      }}
                      dropdownIconColor="#00fc08"
                    >
                      <Picker.Item label="Chọn số hiệp tiêu chuẩn" value={-1} />
                      <Picker.Item label="5" value={5} />
                      <Picker.Item label="7" value={7} />
                      <Picker.Item label="9" value={9} />
                    </Picker>
                    {error && <Text style={{ color: "red" }}>{error}</Text>}
                    {isLoading && (
                      <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#0000ff" />
                      </View>
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

export default CreateGameScreen;

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
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useState } from "react";
import * as Yup from "yup";
import { Formik, Field, Form } from "formik";
import { useToast } from "react-native-toast-notifications";
import axiosInstance from "../lib/axiosClient";
import DateTimePicker from "@react-native-community/datetimepicker";
import jwtDecode from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { gameByIdState, gamesState } from "../atom/Games";
import { useRecoilState, useRecoilValue } from "recoil";
import Animated from "react-native-reanimated";

function formatDateToISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const configDateTime = (datetime) => {
  let dateAndTime = datetime.split("T"); // split date and time

  let date = dateAndTime[0]; // get the date

  let time = dateAndTime[1].split(":"); // split hours and minutes
  let hoursAndMinutes = `${time[0]}:${time[1]}`;
  return `${hoursAndMinutes} ${date}`; // get hours and minutes
};

const EditGameScreen = () => {
  const route = useRoute();
  const id = route.params.id;
  const game = useRecoilValue(gameByIdState(id));
  const [isLoading, setIsLoading] = useState(false);
  const [picker, setPicker] = useState(false);
  const [date1, setDate1] = useState(
    game.timeStart ? new Date(game.timeStart) : new Date()
  );
  const [date2, setDate2] = useState(
    game.timeEnd ? new Date(game.timeEnd) : new Date()
  );
  const [dateStart, setDateStart] = useState(game.timeStart);
  const [dateEnd, setDateEnd] = useState(game.timeEnd);
  const [mode, setMode] = useState("date");
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);

  const [error, setError] = useState("");
  const [teamid, setTeamId] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [inningERA, setInningERA] = useState(game.inningERA);
  const [leagueId, setLeagueId] = useState(game.leagueId);
  const [step, setStep] = useState(1);
  const [games, setGames] = useRecoilState(gamesState);
  const [isLoadingStart, setIsLoadingStart] = useState(false);
  const toast = useToast();
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [tokens, setTokens] = useState([]);
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
        setIsLoading(true);
        const token = await AsyncStorage.getItem("access_token");
        const decoded = jwtDecode(token);
        setUsername(decoded.username);
        setTeamId(decoded.teamid);
        setTeamName(decoded.teamname);
        const { data } = await axiosInstance(
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

  const handleEditGame = async (values) => {
    try {
      setIsLoading(true);
      const req = {
        oppTeam: values.oppTeam,
        oppTeamShort: values.oppTeamShort,
        description: values.description,
        timeStart: date1,
        timeEnd: date2,
        league_id: leagueId <= 0 ? null : leagueId,
        stadium: values.stadium,
        inningERA: inningERA,
        team_id: teamid,
      };
      console.log(req);
      const response = await axiosInstance.patch(`/game/updates/${id}/`, req);

      if (games.length > 0) {
        setGames((oldGames) => [
          ...oldGames.filter((g) => g.id !== id),
          response.data,
        ]);
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
  console.log(dateStart, dateEnd, date1, date2);
  return (
    <Formik
      initialValues={{
        oppTeam: game.oppTeam,
        oppTeamShort: game.oppTeamShort,
        leagueId: game.leagueId,
        timeStart: game.timeStart ? configDateTime(game.timeStart) : new Date(),
        timeEnd: game.timeEnd ? configDateTime(game.timeEnd) : new Date(),
        description: game.description ? game.description : "",
        stadium: game.stadium ? game.stadium : "",
        inningERA: game.inningERA,
      }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        handleEditGame(values);
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
                    ? "Thời gian"
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
                      <Picker.Item label="Giao hữu" value={1} />
                    </Picker>
                    <TouchableOpacity
                      style={styles.buttonShort}
                      // onPress={handleButtonPress}
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

export default EditGameScreen;

import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  Text,
  ActivityIndicator,
  Button,
  Platform,
} from "react-native";

import * as Yup from "yup";
import { useToast } from "react-native-toast-notifications";
import { Picker } from "@react-native-picker/picker";
import { useRecoilState, useRecoilValue } from "recoil";
import axiosInstance from "../lib/axiosClient";
import { Formik } from "formik";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode from "jwt-decode";
import { teamByIdState, teamsState } from "../atom/Teams";

const EditTeamScreen = () => {
  const route = useRoute();
  const id = route.params.id;
  const team = useRecoilValue(teamByIdState(id));
  console.log(team);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [picker, setPicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [dob, setDob] = useState(team.foundedDate);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const toast = useToast();
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [tokens, setTokens] = useState([]);
  const [fullTeams, setFullTeams] = useRecoilState(teamsState);
  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    shortName: Yup.string().required("Short name is required"),
    // email: Yup.string().email().required("Email is required"),
    // phoneNumber: Yup.string().required("Phone number is required"),
  });
  const toggleDatePicker = () => {
    setPicker(!picker);
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

  function formatDateToISO(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  async function sendPushNotification(expoPushToken, team) {
    const message = {
      to: expoPushToken,
      sound: "default",
      title: "Baseball Management",
      body: `Quản lý ${username} đã cập nhật thông tin của đội bóng.`,
      data: { team },
    };

    try {
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });
      const data = await response.json();
      console.log("Push response:", data);
    } catch (error) {
      console.error("Error sending push notification:", error);
    }
  }
  useEffect(() => {
    const getInfo = async () => {
      try {
        setIsLoading(true);
        const token = await AsyncStorage.getItem("access_token");
        const decoded = jwtDecode(token);
        setUsername(decoded.username);
        const { data } = await axiosInstance(`/userpushtokens/${id}/`);
        setTokens(data);
        setIsLoading(false);
      } catch (err) {
        console.log(err);
        setIsLoading(false);
      }
    };
    getInfo();
  }, []);

  const handleEditTeam = async (values) => {
    try {
      setIsEditLoading(true);
      // console.log(image.base64, id);
      const updateData = {
        name: values.name,
        shortName: values.shortName,
        foundedDate: dob,
        homeStadium: values.homeStadium,
        city: values.city,
        country: values.country,
      };
      console.log("Update data: ", updateData, id);
      const response = await axiosInstance.patch(
        `/team/updates/${id}/`,
        updateData
      );
      try {
        if (fullTeams.length > 0) {
          setFullTeams((prev) => [
            ...prev.filter((p) => p.id !== id),
            response.data,
          ]);
        } else {
          setFullTeams((prev) => [
            ...prev.filter((t) => t.id != id),
            response.data,
          ]);
        }
        for (i = 0; i < tokens.length; i++) {
          if (tokens[i].push_token)
            sendPushNotification(tokens[i].push_token, response.data);
        }
        setIsEditLoading(false);
      } catch (error) {
        setIsEditLoading(false);
        toast.show(error.message, {
          type: "danger",
          placement: "bottom",
          duration: 4000,
          offset: 30,
          animationType: "zoom-in",
        });
      }
      setIsEditLoading(false);
      toast.show("Cập nhật thông tin thành công", {
        type: "success",
        placement: "bottom",
        duration: 4000,
        offset: 30,
        animationType: "zoom-in",
      });
      navigation.navigate("Home", { screen: "Đội" });
      return response;
    } catch (error) {
      //Toast.show(error.message);
      setIsEditLoading(false);
      toast.show(error.message, {
        type: "danger",
        placement: "bottom",
        duration: 4000,
        offset: 30,
        animationType: "zoom-in",
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  return (
    <Formik
      initialValues={{
        name: team.name,
        shortName: team.shortName,
        foundedDate: team.foundedDate ? team.foundedDate : dob,
        country: team.country ? team.country : "",
        city: team.city ? team.city : "",
        homeStadium: team.homeStadium ? team.homeStadium : "",
      }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        handleEditTeam(values);
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
                    fontSize: 18,
                    fontWeight: "bold",
                    alignItems: "center",
                  }}
                >
                  {step === 1
                    ? "Tên đội"
                    : step === 2
                    ? "Ngày thành lập"
                    : "Địa điểm"}
                </Text>
              </View>
              <View
                style={{
                  marginVertical: 8,
                }}
              >
                {step === 1 && (
                  <View style={styles.formRow}>
                    <View>
                      <TextInput
                        style={styles.input}
                        name="name"
                        placeholder="Tên đội"
                        autoCapitalize="none"
                        keyboardType="default"
                        onChangeText={formik.handleChange("name")}
                        value={formik.values.name}
                      />
                      {formik.errors.name && (
                        <Text style={{ color: "red", marginLeft: 8 }}>
                          {formik.errors.name}
                        </Text>
                      )}
                    </View>
                    <View>
                      <TextInput
                        style={styles.input}
                        name="shortName"
                        placeholder="Tên"
                        autoCapitalize="none"
                        keyboardType="default"
                        onChangeText={formik.handleChange("shortName")}
                        value={formik.values.shortName}
                      />
                      {formik.errors.shortName && (
                        <Text style={{ color: "red", marginLeft: 8 }}>
                          {formik.errors.shortName}
                        </Text>
                      )}
                    </View>
                  </View>
                )}
                {step === 2 && (
                  <View style={styles.formRow}>
                    {picker && (
                      <DateTimePicker
                        mode="date"
                        display="calendar"
                        value={date}
                        onChange={({ type }, selectedDate) => {
                          if (type === "set") {
                            const currentDate = selectedDate;
                            setDate(currentDate);

                            if ((Platform.OS = "android")) {
                              toggleDatePicker();
                              //formik.values.dateOfBirth = currentDate.toDateString();
                              setDob(formatDateToISO(currentDate));
                            }
                          } else {
                            toggleDatePicker();
                          }
                        }}
                      />
                    )}
                    {!picker && (
                      <Pressable onPress={toggleDatePicker}>
                        <TextInput
                          style={styles.input}
                          name="foundedDate"
                          placeholder="Ngày thành lập"
                          onChangeText={setDob}
                          value={dob ? dob : team.foundedDate}
                          editable={false}
                        />
                      </Pressable>
                    )}
                    {formik.errors.foundedDate && (
                      <Text style={{ color: "red" }}>
                        {formik.errors.foundedDate}
                      </Text>
                    )}
                  </View>
                )}
                {step === 3 && (
                  <View>
                    <Text>Thành phố</Text>
                    <TextInput
                      style={styles.inputLong}
                      name="city"
                      placeholder="Thành phố"
                      autoCapitalize="none"
                      keyboardType="default"
                      onChangeText={formik.handleChange("city")}
                      value={formik.values.city}
                    />
                    {formik.errors.city && (
                      <Text style={{ color: "red" }}>{formik.errors.city}</Text>
                    )}
                    <Text>Quốc gia</Text>
                    <TextInput
                      style={styles.inputLong}
                      name="country"
                      placeholder="Quốc gia"
                      autoCapitalize="none"
                      keyboardType="default"
                      onChangeText={formik.handleChange("country")}
                      value={formik.values.country}
                    />
                    {formik.errors.country && (
                      <Text style={{ color: "red" }}>
                        {formik.errors.country}
                      </Text>
                    )}
                    <Text>Sân nhà</Text>
                    <TextInput
                      style={styles.inputLong}
                      name="homeStadium"
                      placeholder="Sân nhà"
                      autoCapitalize="none"
                      keyboardType="default"
                      onChangeText={formik.handleChange("homeStadium")}
                      value={formik.values.homeStadium}
                    />
                    {formik.errors.homeStadium && (
                      <Text style={{ color: "red" }}>
                        {formik.errors.homeStadium}
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
                  {step < 3 ? (
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
            {isEditLoading && (
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
    width: 150,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    marginTop: 10,
    marginLeft: 8,
    marginRight: 8,
    borderRadius: 10,
    backgroundColor: "white",
  },
  inputLong: {
    width: "80%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    marginTop: 10,
    marginLeft: 8,
    marginRight: 8,
    borderRadius: 10,
    backgroundColor: "white",
  },
  button: {
    height: 40,
    backgroundColor: "#24a0ed",
    borderRadius: 5,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
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
  },
});

export default EditTeamScreen;

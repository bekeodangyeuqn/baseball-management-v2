import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  ActivityIndicator,
  Pressable,
  Platform,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import * as Yup from "yup";
import { Formik, Field, Form } from "formik";
import { useToast } from "react-native-toast-notifications";
import axiosInstance from "../lib/axiosClient";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import jwtDecode from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";

function formatDateToISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const CreateManagerScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [picker, setPicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [image, setImage] = useState({
    uri: null,
    base64: "",
  });
  const [dob, setDob] = useState("");
  const [error, setError] = useState("");
  const [id, setId] = useState(null);
  const toast = useToast();
  const navigation = useNavigation();
  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("Firstname is required"),
    lastName: Yup.string().required("Lastname is required"),
  });
  const toggleDatePicker = () => {
    setPicker(!picker);
  };
  useEffect(() => {
    const getUserId = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        const decoded = jwtDecode(token);
        console.log(decoded.userid);
        setId(decoded.userid);
      } catch (error) {
        console.log(error);
      }
    };
    getUserId().catch((error) => console.error(error));
  }, []);
  const handleCreateManager = async (values) => {
    console.log(id);
    try {
      setIsLoading(true);
      const response = await axiosInstance.post("/manager/create/", {
        firstName: values.firstName,
        lastName: values.lastName,
        date_of_birth: dob,
        avatar_str: image.base64
          ? "data:image/jpeg;base64," + image.base64
          : null,
        user_id: id,
        id: null,
        avatar: null,
        homeTown: values.homeTown,
        jerseyNumber: values.jerseyNumber,
        phoneNumber: values.phoneNumber,
        email: values.email,
      });
      setIsLoading(false);
      toast.show("Cập nhật thông tin thành công", {
        type: "success",
        placement: "bottom",
        duration: 4000,
        offset: 30,
        animationType: "zoom-in",
      });
      navigation.navigate("CreateJoinTeam", {
        managerId: response.data.id,
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
  return (
    <Formik
      initialValues={{
        firstName: "",
        lastName: "",
        dateOfBirth: dob,
        avatar: image,
        homeTown: "",
        jerseyNumber: null,
        phoneNumber: "",
        email: "",
      }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        handleCreateManager(values);
      }}
    >
      {(formik) => {
        const pickImage = async () => {
          // No permissions request is necessary for launching the image library
          let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
            base64: true,
          });

          if (!result.canceled) {
            setImage({
              uri: result.assets[0].uri,
              base64: result.assets[0].base64,
            });
            formik.handleChange("avatar");
          }
        };
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
                    ? "Họ và tên"
                    : step === 2
                    ? "Ngày tháng năm sinh và số áo"
                    : step === 3
                    ? "Thông tin cá nhân"
                    : "Chọn ảnh đại diện"}
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
                        name="firstName"
                        placeholder="Họ và tên đệm"
                        autoCapitalize="none"
                        keyboardType="default"
                        onChangeText={formik.handleChange("firstName")}
                        value={formik.values.firstName}
                      />
                      {formik.errors.firstName && (
                        <Text style={{ color: "red", marginLeft: 8 }}>
                          {formik.errors.firstName}
                        </Text>
                      )}
                    </View>
                    <View>
                      <TextInput
                        style={styles.input}
                        name="lastName"
                        placeholder="Tên"
                        autoCapitalize="none"
                        keyboardType="default"
                        onChangeText={formik.handleChange("lastName")}
                        value={formik.values.lastName}
                      />
                      {formik.errors.lastName && (
                        <Text style={{ color: "red", marginLeft: 8 }}>
                          {formik.errors.lastName}
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
                          name="birthDate"
                          placeholder="Ngày sinh"
                          onChangeText={setDob}
                          value={dob ? dob : player.birthDate}
                          editable={false}
                        />
                      </Pressable>
                    )}
                    {formik.errors.birthDate && (
                      <Text style={{ color: "red" }}>
                        {formik.errors.birthDate}
                      </Text>
                    )}
                    <TextInput
                      style={styles.input}
                      name="jerseyNumber"
                      placeholder="Số áo"
                      autoCapitalize="none"
                      keyboardType="numeric"
                      onChangeText={formik.handleChange("jerseyNumber")}
                      value={formik.values.jerseyNumber.toString()}
                    />
                    {formik.errors.jerseyNumber && (
                      <Text style={{ color: "red" }}>
                        {formik.errors.jerseyNumber}
                      </Text>
                    )}
                  </View>
                )}
                {step === 3 && (
                  <View>
                    <TextInput
                      style={styles.inputLong}
                      name="phoneNumber"
                      placeholder="Số điện thoại"
                      autoCapitalize="none"
                      keyboardType="numeric"
                      onChangeText={formik.handleChange("phoneNumber")}
                      value={formik.values.phoneNumber}
                    />
                    {formik.errors.phoneNumber && (
                      <Text style={{ color: "red" }}>
                        {formik.errors.phoneNumber}
                      </Text>
                    )}
                    <TextInput
                      style={styles.inputLong}
                      name="email"
                      placeholder="Email"
                      autoCapitalize="none"
                      keyboardType="default"
                      onChangeText={formik.handleChange("email")}
                      value={formik.values.email}
                    />
                    {formik.errors.email && (
                      <Text style={{ color: "red" }}>
                        {formik.errors.email}
                      </Text>
                    )}
                    <TextInput
                      style={styles.inputLong}
                      name="homeTown"
                      placeholder="Quê quán"
                      autoCapitalize="none"
                      keyboardType="default"
                      onChangeText={formik.handleChange("homeTown")}
                      value={formik.values.homeTown}
                    />
                    {formik.errors.homeTown && (
                      <Text style={{ color: "red" }}>
                        {formik.errors.homeTown}
                      </Text>
                    )}
                  </View>
                )}
                {step === 4 && (
                  <View>
                    <Button
                      title="Chọn avatar"
                      onPress={pickImage}
                      style={{ marginBottom: 10 }}
                    />
                    {image && image.uri && (
                      <Image
                        source={{ uri: image.uri }}
                        style={{ width: 200, height: 200 }}
                      />
                    )}
                    {formik.errors.avatar && (
                      <Text style={{ color: "red" }}>
                        {formik.errors.avatar}
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
                  {step < 4 ? (
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
});

export default CreateManagerScreen;

import React, { useEffect, useRef } from "react";
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
import Animated from "react-native-reanimated";

function formatDateToISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const CreateTeamScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [picker, setPicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [image, setImage] = useState({
    uri: null,
    base64: "",
  });
  const [step, setStep] = useState(1);
  const [foundDate, setFounddate] = useState("");
  const [error, setError] = useState("");
  const [id, setId] = useState(null);
  const toast = useToast();
  const navigation = useNavigation();
  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Team name is required"),
    shortName: Yup.string().required("Short name is required").max(4),
  });
  const toggleDatePicker = () => {
    setPicker(!picker);
  };
  useEffect(() => {
    const getUserId = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        const decoded = jwtDecode(token);
        setId(decoded.userid);
      } catch (error) {
        console.log(error);
      }
    };
    getUserId().catch((error) => console.error(error));
  }, []);
  const handleCreateTeam = async (values) => {
    try {
      setIsLoading(true);
      const req = {
        name: values.name,
        shortName: values.shortName,
        country: values.country,
        city: values.city,
        homeStadium: values.homeStadium,
        foundedDate: foundDate,
        logo_str: image.base64
          ? "data:image/jpeg;base64," + image.base64
          : null,
        user_id: id,
        managers: [],
      };
      console.log(req);
      const response = await axiosInstance.post("/team/create/", req);
      setIsLoading(false);
      toast.show("Tạo đội thành công", {
        type: "success",
        placement: "bottom",
        duration: 4000,
        offset: 30,
        animationType: "zoom-in",
      });
      navigation.navigate("Home");
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
        name: "",
        shortName: "",
        country: "",
        city: "",
        homeStadium: "",
        foundedDate: foundDate,
        logo: image,
      }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        handleCreateTeam(values);
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

          console.log(result.uri);

          if (!result.canceled) {
            setImage({
              uri: result.assets[0].uri,
              base64: result.assets[0].base64,
            });
            formik.handleChange("logo");
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
                    ? "Tên đội bóng"
                    : step === 2
                    ? "Đại điểm"
                    : step === 3
                    ? "Thông tin cơ bản"
                    : "Logo đội"}
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
                        placeholder="Tên đội bóng"
                        autoCapitalize="none"
                        keyboardType="default"
                        onChangeText={formik.handleChange("name")}
                        value={formik.values.name}
                      />
                      {formik.errors.name && (
                        <Text style={{ color: "red" }}>
                          {formik.errors.name}
                        </Text>
                      )}
                      <TextInput
                        style={styles.input}
                        name="shortName"
                        placeholder="Tên viết tắt"
                        autoCapitalize="characters"
                        keyboardType="default"
                        onChangeText={formik.handleChange("shortName")}
                        value={formik.values.shortName}
                      />
                      {formik.errors.shortName && (
                        <Text style={{ color: "red" }}>
                          {formik.errors.shortName}
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
                  <View>
                    <TextInput
                      style={styles.input}
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
                    <TextInput
                      style={styles.input}
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
                    <TextInput
                      style={styles.input}
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
                {step === 3 && (
                  <View>
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
                              setFounddate(formatDateToISO(currentDate));
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
                          placeholder="Ngày thành lập đội"
                          onChangeText={setFounddate}
                          value={foundDate}
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
                {step === 4 && (
                  <View>
                    {!picker && (
                      <Pressable onPress={toggleDatePicker}>
                        <TextInput
                          style={styles.input}
                          name="foundedDate"
                          placeholder="Ngày thành lập đội"
                          onChangeText={setFounddate}
                          value={foundDate}
                          editable={false}
                        />
                      </Pressable>
                    )}
                    {formik.errors.foundedDate && (
                      <Text style={{ color: "red" }}>
                        {formik.errors.foundedDate}
                      </Text>
                    )}
                    <Button
                      title="Chọn logo"
                      onPress={pickImage}
                      style={{ marginBottom: 10 }}
                    />
                    {image && image.uri && (
                      <Image
                        source={{ uri: image.uri }}
                        style={{ width: 200, height: 200 }}
                      />
                    )}
                    {formik.errors.logo && (
                      <Text style={{ color: "red" }}>{formik.errors.logo}</Text>
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
});

export default CreateTeamScreen;

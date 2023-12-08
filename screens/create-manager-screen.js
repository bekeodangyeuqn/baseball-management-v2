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
        console.log(decoded.id);
        setId(decoded.id);
      } catch (error) {
        console.log(error);
      }
    };
    getUserId().catch((error) => console.error(error));
  }, []);
  const handleCreateManager = async (values) => {
    try {
      setIsLoading(true);
      console.log(image.base64, id);
      const response = await axiosInstance.post("/manager/create/", {
        firstName: values.firstName,
        lastName: values.lastName,
        date_of_birth: dob,
        avatar_str: image.base64
          ? "data:image/jpeg;base64," + image.base64
          : null,
        user_id: id,
        avatar: null,
        user: null,
      });
      setIsLoading(false);
      toast.show("Cập nhật thông tin thành công", {
        type: "success",
        placement: "bottom",
        duration: 4000,
        offset: 30,
        animationType: "zoom-in",
      });
      navigation.navigate("CreateJoinTeam");
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
        firstName: "",
        lastName: "",
        dateOfBirth: dob,
        avatar: image,
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
          <View style={styles.container}>
            <Text style={styles.title}>Cập nhật thông tin người quản lý</Text>
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
              <Text style={{ color: "red" }}>{formik.errors.firstName}</Text>
            )}
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
              <Text style={{ color: "red" }}>{formik.errors.lastName}</Text>
            )}
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
                  name="dateOfBirth"
                  placeholder="Ngày sinh"
                  onChangeText={setDob}
                  value={dob}
                  editable={false}
                />
              </Pressable>
            )}
            {formik.errors.dateOfBirth && (
              <Text style={{ color: "red" }}>{formik.errors.dateOfBirth}</Text>
            )}
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
              <Text style={{ color: "red" }}>{formik.errors.avatar}</Text>
            )}
            <Button
              title="Cập nhật thông tin cá nhân"
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
});

export default CreateManagerScreen;

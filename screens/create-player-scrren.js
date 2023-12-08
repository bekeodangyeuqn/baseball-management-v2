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
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useState } from "react";
import * as Yup from "yup";
import { Formik, Field, Form } from "formik";
import { useToast } from "react-native-toast-notifications";
import axiosInstance from "../lib/axiosClient";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";

function formatDateToISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const CreatePlayerScreen = () => {
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
  const [firstPos, setFirstPos] = useState(null);
  const [secondPos, setSecondPos] = useState(null);
  const [throwHand, setThrowHand] = useState(null);
  const [batHand, setBatHand] = useState(null);

  const toast = useToast();
  const navigation = useNavigation();
  const route = useRoute();
  const teamid = route.params.teamid;
  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("Firstname is required"),
    lastName: Yup.string().required("Lastname is required"),
    weight: Yup.number().typeError("Weight must be a number"),
    height: Yup.number().typeError("Height must be a number"),
    email: Yup.string().email().required("Email is required"),
    phoneNumber: Yup.string().required("Phone number is required"),
  });
  const toggleDatePicker = () => {
    setPicker(!picker);
  };

  const handleCreatePlayer = async (values) => {
    try {
      setIsLoading(true);
      // console.log(image.base64, id);
      const response = await axiosInstance.post("/player/create/", {
        firstName: values.firstName,
        lastName: values.lastName,
        birthDate: dob,
        avatar_str: image.base64
          ? "data:image/jpeg;base64," + image.base64
          : null,
        team_id: teamid,
        avatar: null,
        firstPos: firstPos,
        secondPos: secondPos,
        weight: values.weight,
        height: values.height,
        homeTown: values.homeTown,
        jerseyNumber: values.jerseyNumber,
        phoneNumber: values.phoneNumber,
        email: values.email,
        batHand: batHand,
        throwHand: throwHand,
      });
      setIsLoading(false);
      toast.show("Cập nhật thông tin thành công", {
        type: "success",
        placement: "bottom",
        duration: 4000,
        offset: 30,
        animationType: "zoom-in",
      });
      navigation.navigate("UpdatePlayerAvatar", {
        playerid: response.data.id,
        teamid: teamid,
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
        firstName: "",
        lastName: "",
        birthDate: dob,
        avatar: image,
        firstPos: firstPos,
        secondPos: secondPos,
        weight: null,
        height: null,
        homeTown: "",
        jerseyNumber: null,
        phoneNumber: "",
        email: "",
        batHand: null,
        throwHand: null,
      }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        handleCreatePlayer(values);
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
            formik.handleChange("avatar");
          }
        };
        return (
          <View style={styles.container}>
            <Text style={styles.title}>Thêm player</Text>
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
            <View style={styles.formRow}>
              <Picker
                style={styles.input}
                selectedValue={firstPos}
                onValueChange={(itemValue, itemIndex) => {
                  if (itemValue != "label") setFirstPos(itemValue);
                }}
                dropdownIconColor="#00fc08"
              >
                <Picker.Item label="1st POS" value={-1} />
                <Picker.Item label="DH" value={0} />
                <Picker.Item label="P" value={1} />
                <Picker.Item label="C" value={2} />
                <Picker.Item label="1B" value={3} />
                <Picker.Item label="2B" value={4} />
                <Picker.Item label="3B" value={5} />
                <Picker.Item label="SS" value={6} />
                <Picker.Item label="OF" value={7} />
              </Picker>
              {formik.errors.firstPos && (
                <Text style={{ color: "red" }}>{formik.errors.firstPos}</Text>
              )}
              <Picker
                style={styles.input}
                selectedValue={secondPos}
                onValueChange={(itemValue, itemIndex) => {
                  if (itemValue != "label") setSecondPos(itemValue);
                }}
                dropdownIconColor="#00fc08"
              >
                <Picker.Item label="2nd POS" value={-1} />
                <Picker.Item label="DH" value={0} />
                <Picker.Item label="P" value={1} />
                <Picker.Item label="C" value={2} />
                <Picker.Item label="1B" value={3} />
                <Picker.Item label="2B" value={4} />
                <Picker.Item label="3B" value={5} />
                <Picker.Item label="SS" value={6} />
                <Picker.Item label="OF" value={7} />
              </Picker>
              {formik.errors.secondPos && (
                <Text style={{ color: "red" }}>{formik.errors.secondPos}</Text>
              )}
            </View>
            <View style={styles.formRow}>
              <View>
                <TextInput
                  style={styles.input}
                  name="weight"
                  placeholder="Cân nặng(kg)"
                  autoCapitalize="none"
                  keyboardType="numeric"
                  onChangeText={formik.handleChange("weight")}
                  value={formik.values.weight}
                />
                {formik.errors.weight && (
                  <Text style={{ color: "red", marginLeft: 8 }}>
                    {formik.errors.weight}
                  </Text>
                )}
              </View>
              <View>
                <TextInput
                  style={styles.input}
                  name="height"
                  placeholder="Chiều cao(cm)"
                  autoCapitalize="none"
                  keyboardType="numeric"
                  onChangeText={formik.handleChange("height")}
                  value={formik.values.height}
                />
                {formik.errors.height && (
                  <Text style={{ color: "red", marginLeft: 8 }}>
                    {formik.errors.height}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.formRow}>
              <Picker
                style={styles.input}
                selectedValue={throwHand}
                onValueChange={(itemValue, itemIndex) => {
                  if (itemValue != "label") setThrowHand(itemValue);
                }}
                dropdownIconColor="#00fc08"
              >
                <Picker.Item label="Tay ném" value="label" />
                <Picker.Item label="Phải" value="R" />
                <Picker.Item label="Trái" value="L" />
                <Picker.Item label="Linh hoạt" value="S" />
              </Picker>
              {formik.errors.firstPos && (
                <Text style={{ color: "red" }}>{formik.errors.firstPos}</Text>
              )}
              <Picker
                style={styles.input}
                selectedValue={batHand}
                onValueChange={(itemValue, itemIndex) => {
                  if (itemValue != "label") setBatHand(itemValue);
                }}
                dropdownIconColor="#00fc08"
              >
                <Picker.Item label="Tay vung chày" value="label" />
                <Picker.Item label="Phải" value="R" />
                <Picker.Item label="Trái" value="L" />
                <Picker.Item label="Linh hoạt" value="S" />
              </Picker>
              {formik.errors.secondPos && (
                <Text style={{ color: "red" }}>{formik.errors.secondPos}</Text>
              )}
            </View>
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
                name="jerseyNumber"
                placeholder="Số áo"
                autoCapitalize="none"
                keyboardType="numeric"
                onChangeText={formik.handleChange("jerseyNumber")}
                value={formik.values.jerseyNumber}
              />
              {formik.errors.jerseyNumber && (
                <Text style={{ color: "red" }}>
                  {formik.errors.jerseyNumber}
                </Text>
              )}
            </View>
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
              <Text style={{ color: "red" }}>{formik.errors.phoneNumber}</Text>
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
              <Text style={{ color: "red" }}>{formik.errors.email}</Text>
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
              <Text style={{ color: "red" }}>{formik.errors.homeTown}</Text>
            )}
            {/* <Button
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
            )} */}
            <TouchableOpacity
              onPress={formik.handleSubmit}
              style={styles.button}
            >
              <Text style={{ fontWeight: "bold" }}>Thêm player</Text>
            </TouchableOpacity>
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
    width: 150,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    marginTop: 10,
    marginLeft: 8,
    marginRight: 8,
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
  },
  button: {
    height: 40,
    backgroundColor: "#24a0ed",
    color: "white",
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

export default CreatePlayerScreen;

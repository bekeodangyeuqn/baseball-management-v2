import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import { useToast } from "react-native-toast-notifications";
import axiosInstance from "../../lib/axiosClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode from "jwt-decode";

const LoginScreen = () => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const validationSchema = Yup.object().shape({
    username: Yup.string().required("Username is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters long")
      .required("Password is required"),
  });
  const toast = useToast();
  const handleLogin = async (values) => {
    try {
      //event.preventDefault();
      setIsLoading(true);
      const response = await axiosInstance.post("/token/obtain/", {
        username: values.username,
        password: values.password,
      });
      axiosInstance.defaults.headers["Authorization"] =
        "JWT " + response.data.access;
      AsyncStorage.setItem("access_token", response.data.access, (error) => {
        if (error) {
          console.error(error);
        } else {
          console.log("Data stored successfully.");
        }
      });
      AsyncStorage.setItem("access_refresh", response.data.refresh, (error) => {
        if (error) {
          console.error(error);
        } else {
          console.log("Data stored successfully.");
        }
      });
      setIsLoading(false);
      toast.show("Đăng nhập thành công", {
        type: "success",
        placement: "bottom",
        duration: 4000,
        offset: 30,
        animationType: "zoom-in",
      });
      const token = await AsyncStorage.getItem("access_token");
      const decoded = jwtDecode(token);
      if (decoded.teamName) navigation.navigate("Home");
      else if (decoded.id)
        navigation.navigate("CreateJoinTeam", {
          id: decoded.id,
        });
      else navigation.navigate("CreateManager");
      return response;
    } catch (error) {
      // Toast.show(error.message);
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
  const changeToSignUp = () => {
    navigation.navigate("SignUp");
  };
  return (
    <Formik
      initialValues={{
        username: "",
        password: "",
      }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        handleLogin(values);
      }}
    >
      {(formik) => {
        return (
          <View style={styles.container}>
            <Text style={styles.title}>Đăng nhập</Text>
            <TextInput
              style={styles.input}
              name="username"
              placeholder="Username"
              autoCapitalize="none"
              keyboardType="default"
              onChangeText={formik.handleChange("username")}
              value={formik.values.username}
            />
            {formik.errors.username && (
              <Text style={{ color: "red" }}>{formik.errors.username}</Text>
            )}
            <TextInput
              style={styles.input}
              name="password"
              placeholder="Password"
              autoCapitalize="none"
              keyboardType="default"
              secureTextEntry={true}
              onChangeText={formik.handleChange("password")}
              value={formik.values.password}
            />
            {formik.errors.password && (
              <Text style={{ color: "red" }}>{formik.errors.password}</Text>
            )}
            <Button title="Đăng nhập" onPress={formik.handleSubmit} />
            {error && <Text style={{ color: "red" }}>{error}</Text>}
            <Text>
              Bạn chưa có tài khoản?
              <Text
                style={{
                  textDecorationLine: "underline",
                  textDecorationColor: "blue",
                }}
                onPress={changeToSignUp}
              >
                {" "}
                Đăng ký ngay
              </Text>
            </Text>
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

export default LoginScreen;

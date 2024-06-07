import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Yup from "yup";
import axiosInstance from "../../lib/axiosClient";
import { Formik } from "formik";

const ForgotPasswordScreen = () => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const validationSchema = Yup.object().shape({
    email: Yup.string().required("Email is required").email("Invalid email"),
  });
  const toast = useToast();
  const handleForgotPassword = async (values) => {
    try {
      setIsLoading(true);
      // Call API to send email to reset password
      await axiosInstance.post(`/password_reset/`, {
        email: values.email,
      });
      setIsLoading(false);
      toast.show("Gửi email thành công", {
        type: "success",
        placement: "bottom",
        duration: 4000,
        offset: 30,
        animationType: "zoom-in",
      });
      navigation.navigate("ResetPassword");
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };
  const changeToSignUp = () => {
    navigation.navigate("SignUp");
  };
  return (
    <Formik
      initialValues={{
        email: "",
      }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        handleForgotPassword(values);
      }}
    >
      {(formik) => {
        return (
          <View style={styles.container}>
            <Text style={styles.title}>Quên mật khẩu</Text>
            <TextInput
              style={styles.input}
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
            <Button title="Gửi mail xác nhận" onPress={formik.handleSubmit} />
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

export default ForgotPasswordScreen;

import React from "react";
import { View, Text, StyleSheet, TextInput, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import { useToast } from "react-native-toast-notifications";
import axios from "axios";

const LoginScreen = () => {
  const [error, setError] = useState("");
  const navigation = useNavigation();
  const validationSchema = Yup.object().shape({
    email: Yup.string().email().required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters long")
      .required("Password is required"),
  });
  const toast = useToast();
  const handleLogin = async (values) => {
    try {
      const { data } = await axios.post("http://localhost:8000/api/login/", {
        username: values.username,
        password: values.password,
      });

      const token = data.token;

      await AsyncStorage.setItem("token", token);

      navigation.navigate("Home");
      return token;
    } catch (error) {
      // Toast.show(error.message);
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
    // <View style={styles.container}>
    //   <Text style={styles.title}>Đăng nhập</Text>
    //   <TextInput
    //     style={styles.input}
    //     placeholder="Email"
    //     value={email}
    //     onChangeText={(email) => setEmail(email)}
    //   />
    //   <TextInput
    //     style={styles.input}
    //     placeholder="Mật khẩu"
    //     value={password}
    //     secureTextEntry={true}
    //     onChangeText={(password) => setPassword(password)}
    //   />
    //   <Button style={styles.button} title="Đăng nhập" onPress={handleLogin} />
    //   {/* {this.state.errorMessage && (
    //     <Text style={styles.error}>{this.state.errorMessage}</Text>
    //   )} */}
    //   <View style={styles.social}>
    //     <Ionicons name="logo-facebook" size={24} style={{ marginEnd: 10 }} />
    //     <Ionicons name="logo-google" size={24} />
    //   </View>
    //   <View>
    //     <Text>
    //       Bạn chưa có mật khẩu?
    //       <Text
    //         style={{
    //           textDecorationLine: "underline",
    //           textDecorationColor: "blue",
    //         }}
    //         onPress={changeToSignUp}
    //       >
    //         {" "}
    //         Đăng ký ngay
    //       </Text>
    //     </Text>
    //   </View>
    // </View>
    <Formik
      initialValues={{ username: "", password: "" }}
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
            <Button title="Đăng nhập" onPress={handleLogin} />
            {error && <Text style={{ color: "red" }}>{error}</Text>}
            <View>
              <Text>
                Bạn chưa có mật khẩu?
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
});

export default LoginScreen;

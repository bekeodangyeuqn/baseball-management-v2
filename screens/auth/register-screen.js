import React from "react";
import { View, Text, StyleSheet, TextInput, Button } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as Yup from "yup";
import { Formik, Field, Form } from "formik";

const RegisterScreen = () => {
  const [error, setError] = useState("");

  const validationSchema = Yup.object().shape({
    username: Yup.string().required("Name is required"),
    email: Yup.string().email().required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters long")
      .required("Password is required"),
    confirmPassword: Yup.string().oneOf(
      [Yup.ref("password")],
      "Passwords must match"
    ),
  });
  const navigation = useNavigation();
  const handleSignUp = async () => {
    try {
      const { data } = await axios.post("http://localhost:8000/api/register/", {
        username,
        email,
        password,
        confirmPassword,
      });

      const token = data.token;

      await AsyncStorage.setItem("token", token);

      navigation.navigate("Home");
      return token;
    } catch (error) {
      //Toast.show(error.message);
    }
  };
  const changeToLogin = () => {
    navigation.navigate("Login");
  };
  return (
    // <View style={styles.container}>
    //   <Text style={styles.title}>Đăng ký</Text>
    //   <TextInput
    //     style={styles.input}
    //     placeholder="Username"
    //     value={username}
    //     onChangeText={(username) => setUsername(username)}
    //   />
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
    //   <TextInput
    //     style={styles.input}
    //     placeholder="Nhập lại mật khẩu"
    //     value={password2}
    //     secureTextEntry={true}
    //     onChangeText={(password2) => setPassword2(password2)}
    //   />
    //   <Button style={styles.button} title="Đăng nhập" onPress={handleSignUp} />
    //   {/* {this.state.errorMessage && (
    //     <Text style={styles.error}>{this.state.errorMessage}</Text>
    //   )} */}
    //   <View style={styles.social}>
    //     <Ionicons name="logo-facebook" size={24} style={{ marginEnd: 10 }} />
    //     <Ionicons name="logo-google" size={24} />
    //   </View>
    //   <View>
    //     <Text>
    //       Bạn đã có tài khoản?
    //       <Text
    //         style={{
    //           textDecorationLine: "underline",
    //           textDecorationColor: "blue",
    //         }}
    //         onPress={changeToLogin}
    //       >
    //         {" "}
    //         Đăng nhập ngay
    //       </Text>
    //     </Text>
    //   </View>
    // </View>
    <Formik
      initialValues={{
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      }}
      validationSchema={validationSchema}
      onSubmit={handleSignUp}
    >
      {(formik) => {
        return (
          <View style={styles.container}>
            <Text style={styles.title}>Đăng ký</Text>
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
              name="email"
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={formik.handleChange("email")}
              value={formik.values.email}
            />
            {formik.errors.email && (
              <Text style={{ color: "red" }}>{formik.errors.email}</Text>
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
            <TextInput
              style={styles.input}
              name="confirmPassword"
              placeholder="Confirm Password"
              autoCapitalize="none"
              keyboardType="default"
              secureTextEntry={true}
              onChangeText={formik.handleChange("confirmPassword")}
              value={formik.values.confirmPassword}
            />
            {formik.errors.confirmPassword && (
              <Text style={{ color: "red" }}>
                {formik.errors.confirmPassword}
              </Text>
            )}
            <Button title="Đăng ký" onPress={formik.handleSubmit} />
            {error && <Text style={{ color: "red" }}>{error}</Text>}
            <Text>
              Bạn đã có tài khoản?
              <Text
                style={{
                  textDecorationLine: "underline",
                  textDecorationColor: "blue",
                }}
                onPress={changeToLogin}
              >
                {" "}
                Đăng nhập ngay
              </Text>
            </Text>
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

export default RegisterScreen;

import React from "react";
import { View, Text } from "react-native";

const LoginScreen = () => {
  state = {
    email: "",
    password: "",
    errorMessage: null,
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={this.state.email}
        onChangeText={(email) => this.setState({ email })}
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        value={this.state.password}
        onChangeText={(password) => this.setState({ password })}
      />
      <Button
        style={styles.button}
        title="Đăng nhập"
        onPress={this.handleLogin}
      />
      {this.state.errorMessage && (
        <Text style={styles.error}>{this.state.errorMessage}</Text>
      )}
      <View style={styles.social}>
        <Icon name="facebook" size={24} />
        <Icon name="google" size={24} />
      </View>
    </View>
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
    width: 200,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
  },
  button: {
    width: 200,
    height: 40,
    backgroundColor: "#000",
    color: "#fff",
    borderRadius: 5,
  },
  error: {
    color: "#f00",
  },
  social: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
});

export default LoginScreen;

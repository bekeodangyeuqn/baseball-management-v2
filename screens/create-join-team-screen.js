import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode from "jwt-decode";
import { useLogout } from "../lib/logout";
const CreateOrJoinTeamScreen = () => {
  const navigaton = useNavigation();
  const [username, setUsername] = useState("");
  const [manager, setManager] = useState(null);
  const [id, setId] = useState(null);
  const route = useRoute();
  const managerId1 = route.params.managerId;
  const managerId2 = route.params.id;
  const logout = useLogout();
  useEffect(() => {
    const getUsername = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        const decoded = jwtDecode(token);
        setUsername(decoded.username);
        setId(decoded.id);
      } catch (error) {
        console.log(error);
      }
    };
    getUsername().catch((error) => console.error(error));
  }, []);
  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Xin chúc mừng {username}, bạn đã trở thành một nhà quản lý bóng chày!
      </Text>
      <Text style={styles.body}>
        Hãy tạo câu lạc bộ của bạn hoặc tham gia vào một đội sẵn có
      </Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigaton.navigate("CreateTeam")}
        >
          <Text style={styles.textButton}>Tạo đội mới</Text>
          <Text style={styles.subTextButton}>
            Đội của bạn đang gặp khó khăn trong quản lý? Hãy tạo đội của bạn
            trên ứng dụng của chúng tôi
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            navigaton.navigate("JoinTeamList", {
              managerId: managerId1 ? managerId1 : managerId2,
            });
          }}
        >
          <Text style={styles.textButton}>Tham gia đội đã có</Text>
          <Text style={styles.subTextButton}>
            Đội của bạn đã có trên hệ thống của ứng dụng? Hãy tham gia giúp đỡ
            ban quản lý của đội mình
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.lgbutton}
        onPress={() => logout(navigaton)}
      >
        <Text style={styles.lgbuttonText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
  },
  body: {
    fontSize: 16,
    margin: 10,
  },
  actions: {
    flexDirection: "column",
    justifyContent: "space-between",
    width: "80%",
  },
  button: {
    minHeight: 100,
    marginBottom: 10,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "black",
    backgroundColor: "green",
  },
  textButton: {
    marginLeft: 5,
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  subTextButton: {
    marginLeft: 5,
    fontSize: 14,
    color: "white",
  },
  lgbutton: {
    backgroundColor: "red",
    padding: 10,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    borderRadius: 5,
  },
  lgbuttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default CreateOrJoinTeamScreen;

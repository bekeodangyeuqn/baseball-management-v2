import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from "@react-navigation/native";
import jwtDecode from "jwt-decode";
import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import axiosInstance from "../lib/axiosClient";
import { useToast } from "react-native-toast-notifications";

const ManagerProfileScreen = () => {
  const route = useRoute();
  const id = route.params.id;
  const [myInfo, setMyInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const splitAvatarURI = (str) => {
    const arr = str.split("?");
    return arr[0];
  };

  useEffect(() => {
    const getInfo = async () => {
      setIsLoading(true);
      try {
        const { data } = await axiosInstance.get(`/manager/profile/${id}/`);
        setMyInfo(data);
        AsyncStorage.setItem("my_info", JSON.stringify(data), (error) => {
          if (error) {
            console.error(error);
          } else {
            console.log("My info stored successfully.");
          }
        });

        setIsLoading(false);
      } catch (error) {
        console.log(error);
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
    getInfo().catch((error) => console.error(error));
  }, []);
  return (
    <View style={styles.container}>
      {!myInfo ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <View>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: splitAvatarURI(myInfo.avatar),
              }}
              style={styles.avatar}
            />
            <Text
              style={styles.name}
            >{`${myInfo.firstName} ${myInfo.lastName}`}</Text>
          </View>
          <View
            style={{
              ...styles.infoContainer,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <View>
              <Text style={styles.infoLabel}>Đội:</Text>
              <Text style={styles.infoValue}>Hust Red Owls</Text>
            </View>
            <View style={{ marginEnd: 10 }}>
              <Text style={styles.infoLabel}>Số áo:</Text>
              <Text style={styles.infoValue}>{myInfo.jerseyNumber}</Text>
            </View>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>
              {myInfo.email ? myInfo.email : "Chưa rõ"}
            </Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Số điện thoại:</Text>
            <Text style={styles.infoValue}>
              {myInfo.phoneNumber ? myInfo.phoneNumber : "Chưa rõ"}
            </Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Ngày sinh:</Text>
            <Text style={styles.infoValue}>
              {myInfo.date_of_birth ? myInfo.date_of_birth : "Chưa rõ"}
            </Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Quê quán:</Text>
            <Text style={styles.infoValue}>
              {myInfo.homeTown ? myInfo.homeTown : "Chưa rõ"}
            </Text>
          </View>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  infoContainer: {
    marginTop: 20,
  },
  infoLabel: {
    fontWeight: "bold",
  },
  infoValue: {
    marginTop: 5,
  },
  button: {
    backgroundColor: "red",
    padding: 10,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default ManagerProfileScreen;

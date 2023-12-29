import React, { useEffect, useState } from "react";
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
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Formik, Field, Form } from "formik";
import { useToast } from "react-native-toast-notifications";
import axiosInstance from "../lib/axiosClient";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UpdatePlayerAvaScreen = () => {
  const [image, setImage] = useState({
    uri: null,
    base64: "",
  });
  const toast = useToast();
  const navigation = useNavigation();
  const route = useRoute();
  const playerid = route.params.playerid;
  const teamid = route.params.teamid;
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const handleUpdateAvatar = async (values) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.patch(
        `/player/update-avatar/${playerid}/`,
        {
          avatar_str: image.base64
            ? "data:image/jpeg;base64," + image.base64
            : null,
        }
      );
      const { data } = await axiosInstance.get(`/players/team/${teamid}/`);
      AsyncStorage.setItem("players", JSON.stringify(data), (error) => {
        if (error) {
          console.error(error);
        } else {
          console.log("Players stored successfully.");
        }
      });
      setIsLoading(false);
      toast.show("Cập nhật thông tin thành công", {
        type: "success",
        placement: "bottom",
        duration: 4000,
        offset: 30,
        animationType: "zoom-in",
      });
      navigation.navigate("PlayerList", {
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
        avatar: image,
      }}
      onSubmit={(values) => {
        handleUpdateAvatar(values);
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
            <Text style={styles.title}>Thêm ảnh đại diện Player</Text>
            <Button
              title="Chọn avatar"
              onPress={pickImage}
              style={{ marginBottom: 10 }}
            />
            {image && image.uri ? (
              <Image
                source={{ uri: image.uri }}
                style={{ width: 200, height: 200 }}
              />
            ) : (
              <Image
                source={{
                  uri: "https://baseballmanagement.s3.amazonaws.com/avatars/avatar.png",
                }}
                style={{ width: 200, height: 200 }}
              />
            )}
            {formik.errors.avatar && (
              <Text style={{ color: "red" }}>{formik.errors.avatar}</Text>
            )}
            <Button
              title="Cập nhật ảnh đại diện"
              onPress={formik.handleSubmit}
              style={{ marginTop: 10, marginBottom: 10 }}
            />
            <Button
              title="Hủy"
              color="grey"
              onPress={() =>
                navigation.navigate("PlayerList", {
                  teamid: teamid,
                })
              }
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

export default UpdatePlayerAvaScreen;

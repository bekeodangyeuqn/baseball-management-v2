import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Button,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { View, StyleSheet } from "react-native";
import { useRecoilState, useRecoilValue } from "recoil";
import { playersState } from "../atom/Players";
import { useToast } from "react-native-toast-notifications";
import axiosInstance from "../lib/axiosClient";
import { equipemntByIdState, equipmentsState } from "../atom/Equipments";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";

const equipType = [
  {
    id: 0,
    type: "Găng",
    value: 3,
  },
  {
    id: 1,
    type: "Bóng",
    value: 2,
  },
  {
    id: 2,
    type: "Gậy",
    value: 1,
  },
  {
    id: 3,
    type: "Khác",
    value: 0,
  },
];

const EditEquipmentScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const id = route.params.id;
  const teamid = route.params.teamid;
  const equipment = useRecoilValue(equipemntByIdState(id));
  const [name, setName] = useState(equipment.name ? equipment.name : "");
  const [brand, setBrand] = useState(equipment.brand ? equipment.brand : "");
  const [description, setDescription] = useState(
    equipment.description ? equipment.description : ""
  );
  const [playerid, setPlayerId] = useState(
    equipment.player_id ? equipment.player_id : null
  );
  const [price, setPrice] = useState(equipment.price ? equipment.price : null);
  const [category, setCategory] = useState(
    equipment.category || equipment.category == 0 ? equipment.category : -1
  );
  const [step, setStep] = useState(1);
  const [picker, setPicker] = useState(false);
  const [image, setImage] = useState({
    uri: null,
    base64: "",
  });
  const [fullPlayers, setFullPlayers] = useRecoilState(playersState);
  const [equipments, setEquipments] = useRecoilState(equipmentsState);
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0

  const fadeIn = () => {
    // Will change fadeAnim value to 1
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const fadeOut = () => {
    // Will change fadeAnim value to 0
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const nextStep = () => {
    if (step < 8) {
      fadeOut();
      setTimeout(() => {
        setStep(step + 1);
        fadeIn();
      }, 500);
    }
  };

  const previousStep = () => {
    if (step > 1) {
      fadeOut();
      setTimeout(() => {
        setStep(step - 1);
        fadeIn();
      }, 500);
    }
  };

  const splitAvatarURI = (str) => {
    const arr = str.split("?");
    return arr[0];
  };

  useEffect(() => {
    const getInfo = async () => {
      setIsLoading(true);
      try {
        if (fullPlayers.length == 0) {
          const { data } = await axiosInstance.get(`/players/team/${teamid}/`);
          setFullPlayers(data);
          console.log("Players stored successfully");
          setIsLoading(false);
        } else if (fullPlayers.length > 0) {
          setIsLoading(false);
        }
      } catch (error) {
        toast.show(error.message, {
          type: "danger",
          placement: "bottom",
          duration: 4000,
          offset: 30,
          animationType: "zoom-in",
        });
        setIsLoading(false);
      }
    };
    getInfo();
  });

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      setImage({
        uri: result.assets[0].uri,
        base64: result.assets[0].base64,
      });
      // formik.handleChange("avatar");
    }
  };

  const onSubmit = async () => {
    const equipment1 = {
      price,
      brand,
      description,
      player_id: playerid,
      name,
      category,
      avatar_str: image.base64
        ? "data:image/jpeg;base64," + image.base64
        : null,
      avatar: null,
    };
    console.log(equipment1);
    if (!name || !category || !brand || !playerid || !image.base64) {
      return toast.show("Thiếu thông tin cần thiết", {
        type: "danger",
        placement: "bottom",
        duration: 4000,
        offset: 30,
        animationType: "zoom-in",
      });
    }
    try {
      setIsLoading(true);
      const response = await axiosInstance.patch(
        `/equipment/updates/${id}/`,
        equipment1
      );
      setPrice("");
      setCategory(-1);
      setDescription("");
      setPlayerId(null);
      setEquipments((prev) => [...prev, response.data]);
      setIsLoading(false);
      toast.show("Chỉnh sửa dụng cụ thành công", {
        type: "success",
        placement: "bottom",
        duration: 4000,
        offset: 30,
        animationType: "zoom-in",
      });
      navigation.navigate("EquipmentDetail", { id: id, teamid: teamid });
    } catch (error) {
      toast.show(error.message, {
        type: "danger",
        placement: "bottom",
        duration: 4000,
        offset: 30,
        animationType: "zoom-in",
      });
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "space-between",
        height: "100%",
        marginHorizontal: 12,
      }}
    >
      <View>
        <View style={{ position: "relative", marginTop: 16 }}>
          <Text
            style={{ fontSize: 18, fontWeight: "bold", alignItems: "center" }}
          >
            {step === 1
              ? "Tên dụng cụ"
              : step === 2
              ? "Nhãn hiệu"
              : step === 3
              ? "Mô tả"
              : step === 4
              ? "Giá tiền"
              : step === 5
              ? "Chọn loại dụng cụ"
              : step === 6
              ? "Chọn cầu thủ đang giữ đồ"
              : "Chọn ảnh minh chứng dụng cụ"}
          </Text>
        </View>
        <View
          style={{
            marginVertical: 8,
          }}
        >
          {step === 1 && (
            <TextInput
              placeholder="Tên dụng cụ"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
          )}
          {step === 2 && (
            <TextInput
              placeholder="Nhãn hiệu"
              value={brand}
              onChangeText={setBrand}
              style={styles.input}
            />
          )}
          {step === 3 && (
            <TextInput
              placeholder="Mô tả"
              value={description}
              onChangeText={setDescription}
              style={styles.input}
            />
          )}
          {step === 4 && (
            <TextInput
              placeholder="Giá tiền (vnd)"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              style={styles.input}
            />
          )}
          {step === 5 && (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {equipType.map((type) => {
                return (
                  <TouchableOpacity
                    key={type.id}
                    onPress={() => setCategory(type.value)}
                    style={{
                      borderRadius: 100,
                      backgroundColor:
                        category !== type.value ? "white" : "green",
                      paddingHorizontal: 10,
                      padding: 6,
                      marginBottom: 6,
                      marginRight: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: category !== type.value ? "black" : "white",
                      }}
                    >
                      {type.type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
          {step === 6 && (
            <Picker
              style={styles.input}
              selectedValue={playerid}
              onValueChange={(itemValue, itemIndex) => {
                if (itemValue != "label") setPlayerId(itemValue);
              }}
              dropdownIconColor="#00fc08"
            >
              <Picker.Item
                label="Chọn cầu thủ đang giữ đồ"
                value={null}
                key={-1}
              />
              {fullPlayers.map((player) => (
                <Picker.Item
                  label={`${player.firstName} ${player.lastName}`}
                  value={player.id}
                  key={player.id}
                />
              ))}
            </Picker>
          )}
          {step === 7 && (
            <View>
              <Button
                title="Chọn ảnh minh chứng dụng cụ"
                onPress={pickImage}
                style={{ marginBottom: 10 }}
              />
              {image && image.uri ? (
                <Image
                  source={{ uri: image.uri }}
                  style={{ width: 200, height: 200 }}
                />
              ) : equipment.avatar ? (
                <Image
                  source={{
                    uri: splitAvatarURI(equipment.avatar),
                  }}
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
            </View>
          )}
          <View
            style={{
              flexDirection: "row",
              justifyContent: step > 1 ? "space-between" : "flex-end",
              marginTop: 10,
            }}
          >
            {step > 1 ? (
              <Button title="< Trước" onPress={previousStep} />
            ) : null}
            {step < 7 ? (
              <Button title="Tiếp >" onPress={nextStep} />
            ) : (
              <Button color="green" title="Thêm" onPress={onSubmit} />
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({});

export default EditEquipmentScreen;

import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Dimensions,
  TextInput,
  View,
  Text,
  ActivityIndicator,
} from "react-native";
import {
  BorderlessButton,
  TouchableOpacity,
} from "react-native-gesture-handler";
import {
  StackActions,
  useNavigation,
  useRoute,
} from "@react-navigation/native";

import { Picker } from "@react-native-picker/picker";
import { useRecoilState, useRecoilValueLoadable } from "recoil";
import { transactionsState } from "../atom/Transactions";
import { playersAsyncSelector, playersState } from "../atom/Players";
import BackArrow from "../component/BackArrow";
import { useToast } from "react-native-toast-notifications";
import axiosInstance from "../lib/axiosClient";
// import { addTransaction } from "../../../store/actions/transactionActions";
// import { useDispatch } from "react-redux";

/* Dimension */
const { width, height } = Dimensions.get("window");

const AddTransactionScreen = () => {
  const [transactions, setTransactions] = useRecoilState(transactionsState);
  const navigation = useNavigation();
  const route = useRoute();
  const teamid = route.params.teamid;
  const [price, setPrice] = useState(0);
  const [type, setType] = useState(0);
  const [description, setDescription] = useState("");
  const [playerid, setPlayerId] = useState(null);
  const descriptionRef = useRef(null);
  // const players = useRecoilValueLoadable(playersAsyncSelector(teamid));
  const [fullPlayers, setFullPlayers] = useRecoilState(playersState);
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const tranType = [
    { title: "Được tặng quà", value: 1 },
    { title: "Tiền thưởng từ giải đấu", value: 2 },
    { title: "Đóng quỹ", value: 3 },
    { title: "Khoản thu khác", value: 4 },
    { title: "Mua dụng cụ", value: -1 },
    { title: "Tổ chức sự kiện", value: -2 },
    { title: "Tặng quà cho thành viên", value: -3 },
    { title: "Khoảng chi khác", value: -4 },
  ];
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

  const onSubmit = async () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2); // Months are zero-based
    const day = ("0" + date.getDate()).slice(-2);
    const hours = ("0" + date.getHours()).slice(-2);
    const minutes = ("0" + date.getMinutes()).slice(-2);

    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
    const transaction = {
      price,
      type,
      description,
      team_id: teamid,
      player_id: playerid < 0 ? null : playerid,
      time: formattedDate,
    };
    console.log(transaction);

    if (!price || !type)
      return toast.show("Thiếu thông tin cần thiết", {
        type: "danger",
        placement: "bottom",
        duration: 4000,
        offset: 30,
        animationType: "zoom-in",
      });
    try {
      setIsLoading(true);
      const response = await axiosInstance.post(
        "/transaction/create/",
        transaction
      );
      setPrice("");
      setType(0);
      setDescription("");
      setPlayerId(-1);
      setTransactions((prev) => [...prev, response.data]);
      setIsLoading(false);
      navigation.navigate("Transactions", { teamid: teamid });
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
    <View style={{ padding: 24, flex: 1 }}>
      <View style={{ flexDirection: "column", marginTop: 16 }}>
        <View
          style={{
            justifyContent: "space-between",
            flexDirection: "row",
            alignItems: "center",
            borderBottomWidth: 2,
            paddingBottom: 8,
            marginTop: 16,
          }}
        >
          <TextInput
            placeholderTextColor="grey"
            placeholder="Số tiền"
            keyboardType="number-pad"
            style={{
              padding: 10,
              fontSize: 30,
              width: "80%",
            }}
            onChangeText={(price) => setPrice(price)}
            autoFocus={true}
            onSubmitEditing={() => titleRef.current.focus()}
            defaultValue={price}
          />
          <Text style={{ fontWeight: "bold" }}>₫</Text>
          {/* <Text style={{ fontSize: 20 }}>NGN</Text> */}
        </View>

        {/* <View style={{ marginTop: 20, borderBottomWidth: 2 }}>
          <TextInput
            ref={typeRef}
            placeholderTextColor="grey"
            placeholder="Chi phí cho"
            defaultValue={`${type}`}
            style={{
              fontSize: 30,
              width: "80%",
            }}
            onChangeText={(type) => setType(type)}
          />
        </View> */}
        <Picker
          style={styles.input}
          selectedValue={type}
          onValueChange={(itemValue, itemIndex) => {
            if (itemValue != "label") setType(itemValue);
          }}
          dropdownIconColor="#00fc08"
        >
          <Picker.Item
            label="Chọn loại thu chi"
            value={0}
            style={{ color: "black" }}
          />
          {tranType.map((tran) => (
            <Picker.Item
              style={{
                color:
                  tran.value < 0 ? "red" : tran.value === 0 ? "black" : "green",
              }}
              label={`${tran.title}`}
              value={tran.value}
            />
          ))}
        </Picker>

        <View style={{ marginTop: 20, borderBottomWidth: 2 }}>
          <TextInput
            ref={descriptionRef}
            placeholderTextColor="grey"
            placeholder="Mô tả chi tiết"
            defaultValue={description}
            style={{
              fontSize: 30,
              width: "80%",
            }}
            onChangeText={(description) => setDescription(description)}
          />
        </View>

        <Picker
          style={styles.input}
          selectedValue={playerid}
          onValueChange={(itemValue, itemIndex) => {
            if (itemValue != "label") setPlayerId(itemValue);
          }}
          dropdownIconColor="#00fc08"
        >
          <Picker.Item label="Chọn cầu thủ liên quan" value={-1} />
          {fullPlayers.map((player) => (
            <Picker.Item
              label={`${player.firstName} ${player.lastName}`}
              value={player.id}
            />
          ))}
        </Picker>

        <View style={{ marginTop: 20 }}>
          <BorderlessButton onPress={onSubmit}>
            <View
              style={{
                borderRadius: 24,
                height: 55,
                backgroundColor: "#242C42",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{ fontWeight: "bold", color: "white", fontSize: 16 }}
              >
                Thêm
              </Text>
            </View>
          </BorderlessButton>
        </View>
      </View>
    </View>
  );
};

export default AddTransactionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    zIndex: 3,
    paddingTop: 40,
    padding: 16,
    bottom: 0,
  },

  input: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 10,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});

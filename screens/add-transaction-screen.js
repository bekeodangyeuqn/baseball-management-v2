import React, { useRef, useState } from "react";
import { StyleSheet, Dimensions, TextInput, View, Text } from "react-native";
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
import { playersAsyncSelector } from "../atom/Players";
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
  const [price, setPrice] = useState("");
  const [type, setType] = useState(0);
  const [description, setDescription] = useState("");
  const [playerid, setPlayerId] = useState(-1);
  const typeRef = useRef(null);
  const descriptionRef = useRef(null);
  const players = useRecoilValueLoadable(playersAsyncSelector(teamid));
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // const onPop = () => {
  //   const popAction = StackActions.pop(1);
  //   navigation.dispatch(popAction);
  // };

  const onSubmit = async () => {
    const transaction = {
      price,
      type,
      description,
      teamid,
      time: new Date().toLocaleString("en-US", options).replace(",", ""),
    };

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
      setType("");
      setDescription("");
      setPlayerId(-1);
      setTransactions((prev) => [...prev, response.data]);
      navigation.navigate("Transactions", { teamid: teamid });
    } catch (error) {
      toast.show(error.message, {
        type: "danger",
        placement: "bottom",
        duration: 4000,
        offset: 30,
        animationType: "zoom-in",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ padding: 24, flex: 1 }}>
      {/* <View
        style={{ flexDirection: "row", alignItems: "center", paddingTop: 24 }}
      >
        <TouchableOpacity onPress={onPop}>
          <View>
            <BackArrow />
          </View>
        </TouchableOpacity>

        <Text style={{ marginLeft: 30, fontSize: 18, color: "#171E32" }}>
          Add Amount
        </Text>
      </View> */}

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

        <View style={{ marginTop: 20, borderBottomWidth: 2 }}>
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
        </View>

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
            onChangeText={(type) => setType(type)}
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
          {/* {players.map((player) => (
            <Picker.Item
              label={`${player.firstName} ${player.lastName}`}
              value={player.id}
            />
          ))} */}
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
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
  },
});

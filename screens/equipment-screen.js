import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import Chart from "../component/Chart";
import AddIcon from "../component/AddIcon";
import { useNavigation, useRoute } from "@react-navigation/native";
import { equipmentsState } from "../atom/Equipments";
import { useRecoilState } from "recoil";
import { useToast } from "react-native-toast-notifications";
import axiosInstance from "../lib/axiosClient";
import glove from "../assets/image/glove.jpg";
import ball from "../assets/image/ball.jpg";
import bat from "../assets/image/bat.jpg";
import other from "../assets/image/other.jpg";

const equipType = [
  {
    id: 0,
    type: "Găng",
    image: glove,
  },
  {
    id: 1,
    type: "Bóng",
    image: ball,
  },
  {
    id: 2,
    type: "Gậy",
    image: bat,
  },
  {
    id: 3,
    type: "Khác",
    image: other,
  },
];

const screenWidth = Dimensions.get("window").width;
const imageWidth = screenWidth * 0.4; // 40% of screen width

const EquipmentScreen = () => {
  const [recoilEquipments, setRecoilEquipments] =
    useRecoilState(equipmentsState);
  const [equipments, setEquipments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const route = useRoute();
  const teamid = route.params.teamid;
  const toast = useToast();
  const navigation = useNavigation();
  useEffect(() => {
    const getInfo = async () => {
      setIsLoading(true);
      try {
        if (recoilEquipments.length == 0) {
          const { data } = await axiosInstance.get(
            `/equipments/team/${teamid}/`
          );
          setEquipments(data);
          setRecoilEquipments(data);
          console.log("Equipements stored successfully");
          setIsLoading(false);
        } else if (recoilEquipments.length > 0) {
          setTransactions(recoilEquipments);
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
      } finally {
        setIsLoading(false);
      }
    };
    getInfo();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 0, fontWeight: "bold" }}>
          Các loại dụng cụ
        </Text>
        <Chart />
      </View>
      <View style={styles.banner}>
        <Image
          source={require("../assets/image/eqipBanner.jpg")}
          style={{ width: "100%", height: 100 }}
        />
      </View>

      <View>
        <FlatList
          data={equipType}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={{ justifyContent: "space-around" }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                backgroundColor: "white",
                borderRadius: 10,
                marginBottom: 16,
                shadowOffset: 4,
                shadowColor: "black",
                shadowOpacity: 0.4,
                padding: 8,
              }}
            >
              <Image
                source={item.image}
                style={{
                  width: imageWidth,
                  height: imageWidth,
                  marginBottom: 10,
                }}
              />
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 14,
                }}
              >
                {item.type}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
      <View style={{ position: "absolute", right: 20, bottom: 50, zIndex: 4 }}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("AddEquipment", { teamid: teamid })
          }
        >
          <AddIcon />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
    marginBottom: 10,
    marginTop: 20,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default EquipmentScreen;

import { useNavigation, useRoute } from "@react-navigation/native";
import React from "react";
import { Button, Image, StyleSheet, View, Text } from "react-native";
import { useRecoilValue } from "recoil";
import { equipemntByIdState } from "../atom/Equipments";

const EquipmentDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const id = route.params.id;
  const equipment = useRecoilValue(equipemntByIdState(id));
  let type = ["Khác", "Gậy", "Bóng", "Găng"];
  const splitAvatarURI = (str) => {
    const arr = str.split("?");
    return arr[0];
  };
  return (
    <View>
      {/* <TouchableOpacity
        onPress={() => {
          navigation.navigate("UpdateEquipAvatar", {
            equipid: id,
            teamid: equipment.team_id,
          });
        }}
      > */}
      <Image
        source={{ uri: splitAvatarURI(equipment.avatar) }}
        style={styles.profilePicture}
      />
      {/* </TouchableOpacity> */}
      <View style={styles.profileInfo}>
        <Text style={styles.name}>{`${equipment.name}`}</Text>
        <Button
          onPress={() => {
            navigation.navigate("EditEquipment", {
              id: id,
              teamid: equipment.team_id,
            });
          }}
          style={{ alignItems: "center" }}
          title="Cập nhật thông tin"
        />
      </View>
      <View style={{ marginVertical: 4, marginStart: 10 }}>
        <View style={{ flexDirection: "row" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginEnd: 4 }}>
            Loại dụng cụ:
          </Text>
          <Text style={{ fontSize: 20 }}>{type[equipment.category]}</Text>
        </View>
        <View style={{ flexDirection: "row" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginEnd: 4 }}>
            Nhãn hiệu:
          </Text>
          <Text style={{ fontSize: 20 }}>
            {equipment.brand ? equipment.brand : "Chưa rõ"}
          </Text>
        </View>
        <View style={{ flexDirection: "row" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginEnd: 4 }}>
            Giá tiền:
          </Text>
          <Text style={{ fontSize: 20 }}>
            {equipment.price ? equipment.price : "Chưa rõ"}
          </Text>
        </View>
        <View style={{ flexDirection: "row" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", marginEnd: 4 }}>
            Mô tả:
          </Text>
          <Text style={{ fontSize: 20 }}>
            {equipment.description ? equipment.description : "Không có"}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  profilePicture: {
    width: 200,
    height: 200,
    borderRadius: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    alignSelf: "center",
    marginTop: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  profileInfo: {
    fontSize: 24,
    textAlign: "center",
    borderStyle: "solid",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  profileRow: {
    fontSize: 24,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
});

export default EquipmentDetailScreen;

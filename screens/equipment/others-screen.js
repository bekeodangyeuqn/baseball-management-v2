import React from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useRecoilValue } from "recoil";
import { equipmentsState } from "../../atom/Equipments";
import { useNavigation, useRoute } from "@react-navigation/native";
import EmptyList from "../../component/EmptyList";
import EquipmentCard from "../../component/EquipmentCard";

const OthersScreen = () => {
  const others = useRecoilValue(equipmentsState).filter(
    (equipment) => equipment.category === 0
  );
  const route = useRoute();
  const teamid = route.params.teamid;
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1 }}>
      <View>
        <View
          style={{
            marginTop: 10,
            marginBottom: 10,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "bold", fontSize: 16, padding: 10 }}>
            Khác
          </Text>
          <TouchableOpacity
            style={{
              padding: 10,
              paddingHorizontal: 10,
              backgroundColor: "white",
              borderStyle: "solid",
              borderColor: "black",
              borderWidth: 1,
              borderRadius: 50,
            }}
            onPress={() =>
              navigation.navigate("AddEquipment", {
                teamid: teamid,
              })
            }
          >
            <Text>Thêm dụng cụ</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 430 }}>
          <FlatList
            data={others}
            ListEmptyComponent={<EmptyList />}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <EquipmentCard item={item} />}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({});

export default OthersScreen;

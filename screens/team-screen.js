import React from "react";
import { Text, View, Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PieChart from "../component/PieChart";
import PieChartComponent from "../component/PieChart";
import { useNavigation } from "@react-navigation/native";

const TeamScreen = () => {
  const size = 50;
  const navigation = useNavigation();
  return (
    <ScrollView>
      <View style={{ flex: 1, marginTop: 10 }}>
        <Text style={{ fontSize: 24, marginLeft: 8, fontWeight: "bold" }}>
          Sự kiện
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          <View style={{ flex: 1, padding: 10, alignItems: "center" }}>
            <Ionicons name="trophy" size={size} />
            <Text style={{ fontSize: 16 }}>Giải đấu</Text>
          </View>
          <View style={{ flex: 1, padding: 10, alignItems: "center" }}>
            <Ionicons
              name="baseball"
              size={size}
              onPress={() => navigation.navigate("Games")}
            />
            <Text style={{ fontSize: 16 }}>Trận đấu</Text>
          </View>
          <View style={{ flex: 1, padding: 10, alignItems: "center" }}>
            <Ionicons name="barbell" size={size} />
            <Text style={{ fontSize: 16 }}>Buổi tập</Text>
          </View>
          <View style={{ flex: 1, padding: 10, alignItems: "center" }}>
            <Ionicons name="wine" size={size} />
            <Text style={{ fontSize: 16 }}>Sự kiện thông thường</Text>
          </View>
        </View>
        <Text style={{ fontSize: 24, marginLeft: 8, fontWeight: "bold" }}>
          Quản lý
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          <View style={{ flex: 1, padding: 10, alignItems: "center" }}>
            <Ionicons name="newspaper" size={size} />
            <Text style={{ fontSize: 16 }}>Quản lý nhân sự</Text>
          </View>
          <View style={{ flex: 1, padding: 10, alignItems: "center" }}>
            <Ionicons name="shirt" size={size} />
            <Text style={{ fontSize: 16 }}>Quản lý đồ</Text>
          </View>
          <View style={{ flex: 1, padding: 10, alignItems: "center" }}>
            <Ionicons name="cash" size={size} />
            <Text style={{ fontSize: 16 }}>Quản lý thu chi</Text>
          </View>
        </View>
        <Text style={{ fontSize: 24, marginLeft: 8, fontWeight: "bold" }}>
          Thống kê
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          <View style={{ flex: 1, padding: 10, alignItems: "center" }}>
            <PieChartComponent game={20} total={50} color="green" />
            <Text style={{ fontSize: 16 }}>Thắng</Text>
          </View>
          <View style={{ flex: 1, padding: 10, alignItems: "center" }}>
            <PieChartComponent game={2} total={50} color="yellow" />
            <Text style={{ fontSize: 16, marginTop: 5 }}>Hòa</Text>
          </View>
          <View style={{ flex: 1, padding: 10, alignItems: "center" }}>
            <PieChartComponent game={28} total={50} color="red" />
            <Text style={{ fontSize: 16 }}>Thua</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          <View style={{ flex: 1, padding: 10, alignItems: "center" }}>
            <Ionicons name="person" size={size} />
            <Text style={{ fontSize: 16 }}> Thông số cầu thủ</Text>
          </View>
          <View style={{ flex: 1, padding: 10, alignItems: "center" }}>
            <Ionicons name="medal" size={size} />
            <Text style={{ fontSize: 16 }}>Thành tích đội</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default TeamScreen;

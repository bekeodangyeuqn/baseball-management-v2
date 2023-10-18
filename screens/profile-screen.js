import React, { useState } from "react";
import {
  Image,
  Text,
  Button,
  View,
  StyleSheet,
  ScrollView,
} from "react-native";
import HorizontalTable from "../component/HorizontalTable";

const tableDataSample = {
  tableHead: [
    "Giai đoạn",
    "AB",
    "R",
    "H",
    "HR",
    "RBI",
    "BB",
    "SO",
    "SB",
    "AVG",
    "OBP",
    "SLG",
  ],
  widthArr: [200, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
  tableData: [
    [
      "3 trận qua",
      "12",
      "1",
      "4",
      "0",
      "1",
      "0",
      "3",
      "3",
      ".375",
      ".375",
      ".542",
    ],
    [
      "7 trận qua",
      "12",
      "1",
      "4",
      "0",
      "1",
      "0",
      "3",
      "3",
      ".375",
      ".375",
      ".542",
    ],
    [
      "15 trận qua",
      "12",
      "1",
      "4",
      "0",
      "1",
      "0",
      "3",
      "3",
      ".375",
      ".375",
      ".542",
    ],
  ],
};

const careerData = {
  tableHead: [
    "Mùa giải",
    "Đội",
    "Số trận",
    "AB",
    "R",
    "H",
    "2B",
    "3B",
    "HR",
    "RBI",
    "BB",
    "SO",
    "SB",
    "AVG",
    "OBP",
    "SLG",
    "OPS",
  ],
  widthArr: [
    100, 100, 75, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50,
  ],
  tableData: [
    [
      "2023",
      "HRO",
      28,
      120,
      14,
      30,
      36,
      6,
      0,
      0,
      15,
      8,
      16,
      3,
      ".286",
      ".336",
      ".445",
      ".783",
    ],
  ],
};
const ProfileScreen = () => {
  const [profilePicture, setProfilePicture] = useState("");
  const renderProfilePicture = () => {
    if (profilePicture) {
      return (
        <Image source={{ uri: profilePicture }} style={styles.profilePicture} />
      );
    } else {
      return (
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/166/166366.png",
          }}
          style={styles.profilePicture}
        />
      );
    }
  };
  return (
    <ScrollView>
      {renderProfilePicture()}
      <View style={styles.profileInfo}>
        <Text style={styles.name}>Lê Duy Thái</Text>
        <Text style={{ fontSize: 24, textAlign: "center" }}>Player-coach</Text>
        <View style={styles.profileRow}>
          <Text style={{ marginRight: 8 }}>Chiều cao</Text>
          <Text style={{ marginRight: 8 }}>Cân nặng</Text>
          <Text>Số áo</Text>
        </View>
        <View style={styles.profileRow}>
          <Text style={{ marginRight: 8, fontWeight: "bold" }}>169</Text>
          <Text style={{ marginRight: 8, fontWeight: "bold" }}>54</Text>
          <Text style={{ fontWeight: "bold" }}>13</Text>
        </View>
      </View>
      <HorizontalTable data={tableDataSample} />
      <Text style={styles.title}>Sự nghiệp</Text>
      <HorizontalTable data={careerData} />
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginLeft: 15,
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
  },
});

export default ProfileScreen;

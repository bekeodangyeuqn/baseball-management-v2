import React from "react";
import { View, StyleSheet, Image, Dimensions, Text } from "react-native";

const EmptyList = () => {
  const screenWidth = Dimensions.get("window").width;
  const imageWidth = screenWidth * 0.4; // 40% of screen width
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 20,
      }}
    >
      <Image
        style={{
          width: imageWidth,
          height: imageWidth,
          shadowColor: "black",
          shadowOpacity: 0.5,
          shadowOffset: { width: 4, height: 4 },
        }}
        source={require("../assets/image/empty.jpg")}
      />
      <Text style={{ fontWeight: "bold", fontSize: 16 }}>Dữ liệu rỗng</Text>
    </View>
  );
};

const styles = StyleSheet.create({});

export default EmptyList;

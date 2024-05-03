import AsyncStorage from "@react-native-async-storage/async-storage";

export const logout = async (navigation) => {
  try {
    await AsyncStorage.clear();
    navigation.navigate("Login");
    // Navigate to login screen or do other stuff here
  } catch (e) {
    // Handle error
    console.error(e);
  }
};

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem("access_token");
    return token;
  } catch (error) {
    console.log(error);
  }
};
const token = getToken().catch((error) => console.error(error));

const axiosInstance = axios.create({
  baseURL: "https://baseball-management-v2-server.vercel.app/api",
  // headers: {
  //   Authorization: "JWT " + token,
  //   "Content-Type": "application/json",
  //   accept: "application/json",
  // },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = "JWT " + token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
export default axiosInstance;

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const axiosInstance = axios.create({
  baseURL: "https://baseball-management-v2-server.vercel.app/api/",
  timeout: 5000,
  headers: {
    Authorization:
      "JWT " +
      (AsyncStorage.getItem("access_token")
        ? "Basic"
        : AsyncStorage.getItem("access_token")),
    "Content-Type": "application/json",
    accept: "application/json",
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response.status === 401 &&
      error.response.statusText === "Unauthorized"
    ) {
      const refresh_token = localStorage.getItem("refresh_token");

      try {
        const response = await axiosInstance.post("/token/refresh/", {
          refresh: refresh_token,
        });
        localStorage.setItem("access_token", response.data.access);
        localStorage.setItem("refresh_token", response.data.refresh);

        axiosInstance.defaults.headers["Authorization"] =
          "JWT " + response.data.access;
        originalRequest.headers["Authorization"] =
          "JWT " + response.data.access;
        return await axiosInstance(originalRequest);
      } catch (err) {
        console.log(err);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

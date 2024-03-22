import { atom, selector, selectorFamily } from "recoil";
import axiosInstance from "../lib/axiosClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const offAtBatsState = atom({
  key: "offAtBatsState",
  default: [],
});

export const defAtBatsState = atom({
  key: "defAtBatsState",
  default: [],
});

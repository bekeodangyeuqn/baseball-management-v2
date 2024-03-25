import { atom, selector, selectorFamily } from "recoil";
import axiosInstance from "../lib/axiosClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const atBatsState = atom({
  key: "AtBatsState",
  default: [],
});

export const atBatsSelectorByGameId = selectorFamily({
  key: "AtBatsSelectorByGameId",
  get:
    (id) =>
    ({ get }) =>
      get(atBatsState).filter((atBat) => atBat.gameid == id),
});

export const lastStatusState = atom({
  key: "lastStatusState",
  default: [],
});

export const lastStatusSelectorByGameId = selectorFamily({
  key: "lastStatusSelectorByGameId",
  get:
    (id) =>
    ({ get }) =>
      get(lastStatusState).find((status) => status.atBat.gameid == id),
});

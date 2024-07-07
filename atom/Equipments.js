import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode from "jwt-decode";
import { atom, selector, selectorFamily } from "recoil";
import axiosInstance from "../lib/axiosClient";

export const equipmentsState = atom({
  key: "EquipmentsState",
  default: [],
});

// Selector to get a game by ID
export const equipemntByIdState = selectorFamily({
  key: "EquipemntByIdState",
  get:
    (id) =>
    ({ get }) =>
      get(equipmentsState).find((equipment) => equipment.id === id),
});

export const fetchEquipmentsState = selectorFamily({
  key: "EquipmentsAsyncSelector",
  get:
    (teamid) =>
    async ({ get }) => {
      const { data } = await axiosInstance.get(`/equipemnts/team/${teamid}/`);
      AsyncStorage.setItem("equipments", JSON.stringify(data), (error) => {
        if (error) {
          console.error(error);
        } else {
          console.log("Equipments stored successfully.");
        }
      });
      return data;
    },
});

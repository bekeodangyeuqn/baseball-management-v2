import { atom, selector, selectorFamily } from "recoil";
import axiosInstance from "../lib/axiosClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Atom to store the games
export const teamsState = atom({
  key: "teamsState",
  default: [],
});

// Selector to get a game by ID
export const teamByIdState = selectorFamily({
  key: "teamByIdState",
  get:
    (id) =>
    ({ get }) =>
      get(teamsState).find((team) => team.id === id),
});

// Selector to fetch games from API
export const fetchTeamsState = selector({
  key: "TeamsAsyncSelector",
  get: async () => {
    const storedTeams = await AsyncStorage.getItem("teams");
    if (storedTeams) {
      const data = JSON.parse(storedTeams);
      return data;
    } else {
      const { data } = await axiosInstance.get(`/teams/`);
      AsyncStorage.setItem("teams", JSON.stringify(data), (error) => {
        if (error) {
          console.error(error);
        } else {
          console.log("Teams stored successfully.");
        }
      });
      return data;
    }
  },
});

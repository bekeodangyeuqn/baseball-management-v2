import { atom, selector, selectorFamily } from "recoil";
import axiosInstance from "../lib/axiosClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Atom to store the games
export const leaguesState = atom({
  key: "leaguesState",
  default: [],
});

// Selector to get a game by ID
export const leagueByIdState = selector({
  key: "leagueByIdState",
  get:
    ({ get }) =>
    (id) =>
      get(leaguesState).find((league) => league.id === id),
});

export const fetchLeaguesState = selectorFamily({
  key: "LeaguesAsyncSelector",
  get:
    (teamid) =>
    async ({ get }) => {
      const { data } = await axiosInstance.get(`/leagues/team/${teamid}/`);
      AsyncStorage.setItem("leagues", JSON.stringify(data), (error) => {
        if (error) {
          console.error(error);
        } else {
          console.log("Leagues stored successfully.");
        }
      });
      return data;
    },
});

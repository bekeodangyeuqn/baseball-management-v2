import AsyncStorage from "@react-native-async-storage/async-storage";
import jwtDecode from "jwt-decode";
import {
  atom,
  selector,
  selectorFamily,
  useRecoilValue,
  useRecoilValueLoadable,
} from "recoil";
import axiosInstance from "../lib/axiosClient";

const position = ["DH", "P", "C", "1B", "2B", "3B", "SS", "OF", "None"];

export const teamIdSelector = selector({
  key: "TeamIdSelector",
  get: async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const decoded = jwtDecode(token);
      return decoded.teamid;
    } catch (error) {
      console.log(error);
    }
  },
});

export const playersState = atom({
  key: "PlayersState",
  default: [],
});

export const playersAsyncSelector = selectorFamily({
  key: "PlayersAsyncSelector",
  get:
    (teamid) =>
    async ({ get }) => {
      const storedPlayers = await AsyncStorage.getItem("players");
      if (storedPlayers) {
        const data = JSON.parse(storedPlayers);
        return data;
      } else {
        const { data } = await axiosInstance.get(`/players/team/${teamid}/`);
        AsyncStorage.setItem("players", JSON.stringify(data), (error) => {
          if (error) {
            console.error(error);
          } else {
            console.log("Players stored successfully.");
          }
        });
        return data;
      }
    },
});

export const positionFilterState = atom({
  key: "PositionFilterState",
  default: [],
});

export const filteredPlayers = selectorFamily({
  key: "FilteredPlayers",
  get:
    (teamid) =>
    ({ get }) => {
      const players = get(playersAsyncSelector(teamid));
      const positionFilter = get(positionFilterState);
      if (!players) return null;
      return players.filter((player) => {
        if (positionFilter.length === 0) return true;
        else {
          return (
            positionFilter.includes(position[player.firstPos]) ||
            positionFilter.includes(position[player.secondPos])
          );
        }
      });
    },
});

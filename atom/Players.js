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

export const managersState = atom({
  key: "ManagersState",
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

export const managersAsyncSelector = selectorFamily({
  key: "ManagersAsyncSelector",
  get:
    (teamid) =>
    async ({ get }) => {
      const storedManagers = await AsyncStorage.getItem("managers");
      if (storedManagers) {
        const data = JSON.parse(storedManagers);
        return data;
      } else {
        const { data } = await axiosInstance.get(`/managers/team/${teamid}/`);
        AsyncStorage.setItem("managers", JSON.stringify(data), (error) => {
          if (error) {
            console.error(error);
          } else {
            console.log("Managers stored successfully.");
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

export const playerByIdState = selectorFamily({
  key: "playerByIdState",
  get:
    ({ get }) =>
    (id) =>
      get(playersState).find((player) => player.id === id),
});
